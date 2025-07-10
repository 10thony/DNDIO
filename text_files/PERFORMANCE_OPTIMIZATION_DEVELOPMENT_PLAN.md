# DNDIO Performance Optimization Development Plan

## Executive Summary

The DNDIO application is experiencing performance issues due to several factors including excessive re-renders, inefficient data fetching, lack of virtualization for large datasets, and suboptimal bundle size. This plan outlines a comprehensive approach to improve performance across all aspects of the application.

## Current Performance Issues Identified

### 1. React Component Performance
- **Excessive Re-renders**: Many components lack proper memoization
- **Missing React.memo**: Components re-render unnecessarily
- **Inefficient useCallback/useMemo**: Missing optimizations in expensive operations
- **Large Component Trees**: Deep component hierarchies causing cascading re-renders

### 2. Data Fetching & State Management
- **Multiple Concurrent Queries**: Components making redundant API calls
- **No Query Deduplication**: Same data fetched multiple times
- **Large Data Sets**: Loading all data at once without pagination
- **Inefficient State Updates**: Frequent state changes triggering re-renders

### 3. Bundle Size & Loading
- **Large Bundle Size**: All components loaded upfront
- **No Code Splitting**: No lazy loading of routes or components
- **Unoptimized Dependencies**: Heavy libraries loaded unnecessarily
- **No Tree Shaking**: Unused code included in bundles

### 4. Real-time Updates
- **Excessive Subscriptions**: Too many real-time listeners
- **No Subscription Management**: Subscriptions not properly cleaned up
- **Inefficient Update Propagation**: Updates causing unnecessary re-renders

## Performance Optimization Strategy

### Phase 1: React Component Optimization (Week 1-2)

#### 1.1 Component Memoization
**Priority: High | Impact: High**

**Target Components:**
- `CharacterList.tsx` - Large lists with frequent updates
- `ItemList.tsx` - Grid rendering with many items
- `MonsterList.tsx` - Complex filtering and sorting
- `CampaignList.tsx` - Pagination and expansion states
- `LiveInteractionList.tsx` - Real-time updates

**Implementation:**
```typescript
// Before
const CharacterList = () => { ... }

// After
const CharacterList = React.memo(() => { ... }, (prevProps, nextProps) => {
  // Custom comparison logic
  return prevProps.characters === nextProps.characters;
  
});
```

**Files to Modify:**
- `src/components/CharacterList.tsx`
- `src/components/ItemList.tsx`
- `src/components/MonsterList.tsx`
- `src/components/campaigns/CampaignList.tsx`
- `src/components/live-interactions/LiveInteractionList.tsx`

#### 1.2 Hook Optimization
**Priority: High | Impact: High**

**Target Hooks:**
- `useLiveInteractionNotifications.ts` - Multiple useQuery calls
- `useRoleAccess.ts` - Frequent role checks
- `useCampaignAccess.ts` - Access control calculations

**Implementation:**
```typescript
// Optimize expensive calculations
const processedData = useMemo(() => {
  return expensiveCalculation(rawData);
}, [rawData]);

// Optimize callback functions
const handleAction = useCallback((id: string) => {
  // Action logic
}, [dependencies]);
```

**Files to Modify:**
- `src/hooks/useLiveInteractionNotifications.ts`
- `src/hooks/useRoleAccess.ts`
- `src/hooks/useCampaignAccess.ts`
- `src/contexts/LiveInteractionContext.tsx`

#### 1.3 Context Optimization
**Priority: High | Impact: Medium**

**Target Contexts:**
- `LiveInteractionContext.tsx` - Large state object with frequent updates

**Implementation:**
```typescript
// Split context into smaller, focused contexts
const LiveInteractionStateContext = createContext();
const LiveInteractionActionsContext = createContext();

// Use context selectors to prevent unnecessary re-renders
const useLiveInteractionState = (selector) => {
  const context = useContext(LiveInteractionStateContext);
  return useMemo(() => selector(context), [context, selector]);
};
```

### Phase 2: Data Fetching & Caching (Week 2-3)

#### 2.1 Query Optimization
**Priority: High | Impact: High**

**Target Queries:**
- `api.interactions.subscribeToActiveInteractions`
- `api.campaigns.getAllCampaigns`
- `api.characters.getAllCharacters`
- `api.items.getItems`

**Implementation:**
```typescript
// Add pagination to large queries
export const getCampaignsWithPagination = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
    filters: v.optional(v.object({...}))
  },
  handler: async (ctx, args) => {
    const { page, pageSize, filters } = args;
    const offset = page * pageSize;
    
    let query = ctx.db.query("campaigns");
    
    // Apply filters
    if (filters?.status) {
      query = query.filter(q => q.eq(q.field("status"), filters.status));
    }
    
    return await query
      .order("desc")
      .paginate({ numItems: pageSize, cursor: offset.toString() });
  }
});
```

**Files to Modify:**
- `convex/campaigns.ts`
- `convex/characters.ts`
- `convex/items.ts`
- `convex/interactions.ts`

#### 2.2 Query Deduplication
**Priority: Medium | Impact: Medium**

**Implementation:**
```typescript
// Create custom hooks for common queries
export const useCampaigns = (filters?: CampaignFilters) => {
  return useQuery(api.campaigns.getCampaignsWithPagination, {
    page: 0,
    pageSize: 20,
    filters
  });
};

// Use React Query patterns for caching
const useOptimizedQuery = (queryFn, options) => {
  const queryKey = useMemo(() => [queryFn.name, options], [queryFn, options]);
  return useQuery(queryKey, () => queryFn(options), {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

#### 2.3 Subscription Management
**Priority: High | Impact: Medium**

**Implementation:**
```typescript
// Optimize real-time subscriptions
const useOptimizedSubscription = (queryFn, args, options = {}) => {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery(
    queryFn,
    enabled ? args : 'skip',
    {
      ...queryOptions,
      refetchInterval: 30000, // 30 seconds
      refetchOnWindowFocus: false,
    }
  );
};
```

### Phase 3: Virtualization & Large Data Sets (Week 3-4)

#### 3.1 List Virtualization
**Priority: High | Impact: High**

**Target Components:**
- Character lists with 100+ items
- Item grids with many entries
- Campaign lists with extensive data

**Implementation:**
```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedCharacterList = ({ characters }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <CharacterCard character={characters[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={characters.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

**Dependencies to Add:**
```json
{
  "react-window": "^1.8.8",
  "react-virtualized-auto-sizer": "^1.0.20"
}
```

#### 3.2 Infinite Scrolling
**Priority: Medium | Impact: Medium**

**Implementation:**
```typescript
const useInfiniteScroll = (queryFn, pageSize = 20) => {
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const { data, isLoading } = useQuery(
    [queryFn.name, page],
    () => queryFn({ page, pageSize }),
    {
      keepPreviousData: true,
      onSuccess: (data) => {
        setHasMore(data.length === pageSize);
      }
    }
  );
  
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, hasMore]);
  
  return { data, isLoading, loadMore, hasMore };
};
```

### Phase 4: Bundle Optimization (Week 4-5)

#### 4.1 Code Splitting
**Priority: High | Impact: High**

**Implementation:**
```typescript
// Route-based code splitting
const CampaignDetail = lazy(() => import('./components/campaigns/CampaignDetail'));
const CharacterDetail = lazy(() => import('./components/CharacterDetail'));
const LiveInteractionDashboard = lazy(() => import('./components/live-interactions/LiveInteractionDashboard'));

// Component-based code splitting
const BulkItemGenerator = lazy(() => import('./components/BulkItemGenerator'));
const MapCreator = lazy(() => import('./components/maps/MapCreator'));
```

**Files to Modify:**
- `src/App.tsx` - Add Suspense boundaries
- All route components - Convert to lazy imports

#### 4.2 Tree Shaking & Bundle Analysis
**Priority: Medium | Impact: Medium**

**Implementation:**
```typescript
// vite.config.ts optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          convex: ['convex'],
          ui: ['@radix-ui/react-*'],
          utils: ['date-fns', 'clsx', 'class-variance-authority']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

#### 4.3 Dynamic Imports
**Priority: Medium | Impact: Medium**

**Implementation:**
```typescript
// Dynamic imports for heavy components
const loadHeavyComponent = () => import('./HeavyComponent');

// Use in components
const [HeavyComponent, setHeavyComponent] = useState(null);

useEffect(() => {
  loadHeavyComponent().then(module => {
    setHeavyComponent(() => module.default);
  });
}, []);
```

### Phase 5: Real-time Performance (Week 5-6)

#### 5.1 Subscription Optimization
**Priority: High | Impact: High**

**Implementation:**
```typescript
// Optimize LiveInteractionContext
const useOptimizedLiveInteraction = (interactionId?: string) => {
  const subscriptions = useMemo(() => {
    if (!interactionId) return [];
    
    return [
      useQuery(api.interactions.subscribeToInteractionStatus, { interactionId }),
      useQuery(api.interactions.subscribeToInteractionParticipants, { interactionId }),
      useQuery(api.interactions.subscribeToInteractionActions, { interactionId })
    ];
  }, [interactionId]);
  
  return subscriptions;
};
```

#### 5.2 Update Batching
**Priority: Medium | Impact: Medium**

**Implementation:**
```typescript
// Batch multiple updates
const useBatchedUpdates = () => {
  const [updates, setUpdates] = useState([]);
  
  const batchUpdate = useCallback((update) => {
    setUpdates(prev => [...prev, update]);
  }, []);
  
  useEffect(() => {
    if (updates.length > 0) {
      // Process all updates in one go
      processBatchUpdates(updates);
      setUpdates([]);
    }
  }, [updates]);
  
  return { batchUpdate };
};
```

### Phase 6: Monitoring & Metrics (Week 6)

#### 6.1 Performance Monitoring
**Priority: Medium | Impact: Low**

**Implementation:**
```typescript
// Performance monitoring hook
const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());
  
  useEffect(() => {
    renderCount.current += 1;
    const now = performance.now();
    const renderTime = now - lastRenderTime.current;
    
    if (renderTime > 16) { // Longer than one frame
      console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }
    
    lastRenderTime.current = now;
  });
  
  return { renderCount: renderCount.current };
};
```

#### 6.2 Bundle Analysis
**Priority: Low | Impact: Low**

**Implementation:**
```bash
# Add to package.json scripts
"analyze": "vite-bundle-analyzer dist",
"build:analyze": "npm run build && npm run analyze"
```

## Implementation Timeline

### Week 1-2: React Component Optimization
- [ ] Implement React.memo for list components
- [ ] Add useCallback/useMemo optimizations
- [ ] Optimize context providers
- [ ] Performance testing and measurement

### Week 2-3: Data Fetching & Caching
- [ ] Implement pagination for large queries
- [ ] Add query deduplication
- [ ] Optimize subscription management
- [ ] Add caching strategies

### Week 3-4: Virtualization & Large Data Sets
- [ ] Implement react-window for large lists
- [ ] Add infinite scrolling
- [ ] Optimize grid layouts
- [ ] Performance testing with large datasets

### Week 4-5: Bundle Optimization
- [ ] Implement code splitting
- [ ] Add lazy loading for routes
- [ ] Optimize bundle size
- [ ] Bundle analysis and optimization

### Week 5-6: Real-time Performance
- [ ] Optimize real-time subscriptions
- [ ] Implement update batching
- [ ] Reduce unnecessary re-renders
- [ ] Performance testing under load

### Week 6: Monitoring & Final Optimization
- [ ] Add performance monitoring
- [ ] Implement bundle analysis
- [ ] Final performance testing
- [ ] Documentation and best practices

## Success Metrics

### Performance Targets
- **Initial Load Time**: < 2 seconds (currently ~4-6 seconds)
- **Time to Interactive**: < 3 seconds (currently ~5-8 seconds)
- **Bundle Size**: < 2MB gzipped (currently ~3-4MB)
- **Memory Usage**: < 100MB for typical usage (currently ~150-200MB)
- **Re-render Frequency**: < 5 re-renders per second (currently ~10-15)

### User Experience Metrics
- **Page Load Speed**: 90+ Lighthouse Performance Score
- **Mobile Performance**: 85+ Mobile Performance Score
- **User Interaction Response**: < 100ms for button clicks
- **List Scrolling**: 60fps smooth scrolling for large lists

### Technical Metrics
- **Query Response Time**: < 500ms for most queries
- **Real-time Update Latency**: < 200ms
- **Memory Leaks**: 0 memory leaks in 24-hour usage
- **Error Rate**: < 1% for user interactions

## Risk Mitigation

### Technical Risks
1. **Breaking Changes**: Implement changes incrementally with feature flags
2. **Performance Regression**: Continuous monitoring and A/B testing
3. **Bundle Size Increase**: Regular bundle analysis and size limits
4. **Memory Leaks**: Comprehensive testing and monitoring

### Mitigation Strategies
1. **Feature Flags**: Use feature flags for gradual rollout
2. **Monitoring**: Implement comprehensive performance monitoring
3. **Testing**: Extensive testing on various devices and network conditions
4. **Rollback Plan**: Maintain ability to rollback changes quickly

## Dependencies & Tools

### New Dependencies
```json
{
  "react-window": "^1.8.8",
  "react-virtualized-auto-sizer": "^1.0.20",
  "vite-bundle-analyzer": "^0.7.0",
  "web-vitals": "^3.0.0"
}
```

### Development Tools
- **Bundle Analyzer**: For bundle size optimization
- **React DevTools Profiler**: For component performance analysis
- **Lighthouse**: For performance auditing
- **Web Vitals**: For real user performance monitoring

## Conclusion

This comprehensive performance optimization plan addresses the major performance bottlenecks in the DNDIO application. By implementing these optimizations systematically over 6 weeks, we expect to achieve significant performance improvements while maintaining application functionality and user experience.

The plan prioritizes high-impact, low-risk changes first, followed by more complex optimizations. Each phase includes specific success metrics and testing requirements to ensure improvements are measurable and sustainable. 