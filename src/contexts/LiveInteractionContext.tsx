import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

// Enhanced Types
interface LiveInteractionState {
  activeInteractions: any[];
  currentInteractionId: Id<"interactions"> | null;
  currentCampaignId: Id<"campaigns"> | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
  optimisticUpdates: Map<string, any>;
  pendingActions: any[];
  initiativeOrder: any;
  participants: {
    playerCharacters: any[];
    npcs: any[];
    monsters: any[];
  };
  isOnline: boolean;
  syncStatus: 'synced' | 'syncing' | 'error';
  // Enhanced state properties
  realTimeData: {
    interactionStatus: any;
    participants: any;
    actions: any;
  };
  conflictResolution: {
    hasConflict: boolean;
    serverState: any;
    clientState: any;
  };
  performance: {
    lastRenderTime: number;
    renderCount: number;
    memoryUsage: number;
  };
}

// Enhanced Action Types
type LiveInteractionAction =
  | { type: 'SET_ACTIVE_INTERACTIONS'; payload: any[] }
  | { type: 'SET_CURRENT_INTERACTION'; payload: { interactionId: Id<"interactions"> | null; campaignId: Id<"campaigns"> | null } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PARTICIPANTS'; payload: { playerCharacters: any[]; npcs: any[]; monsters: any[] } }
  | { type: 'SET_INITIATIVE_ORDER'; payload: any }
  | { type: 'SET_PENDING_ACTIONS'; payload: any[] }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_SYNC_STATUS'; payload: 'synced' | 'syncing' | 'error' }
  | { type: 'ADD_OPTIMISTIC_UPDATE'; payload: { key: string; data: any } }
  | { type: 'REMOVE_OPTIMISTIC_UPDATE'; payload: string }
  | { type: 'REFRESH_DATA' }
  | { type: 'CLEAR_ERROR' }
  // Enhanced action types
  | { type: 'SET_REAL_TIME_DATA'; payload: { type: 'status' | 'participants' | 'actions'; data: any } }
  | { type: 'SET_CONFLICT'; payload: { hasConflict: boolean; serverState?: any; clientState?: any } }
  | { type: 'UPDATE_PERFORMANCE'; payload: { renderTime: number; memoryUsage: number } }
  | { type: 'BATCH_UPDATE'; payload: LiveInteractionAction[] };

// Enhanced Initial State
const initialState: LiveInteractionState = {
  activeInteractions: [],
  currentInteractionId: null,
  currentCampaignId: null,
  isLoading: false,
  error: null,
  lastUpdate: Date.now(),
  optimisticUpdates: new Map(),
  pendingActions: [],
  initiativeOrder: null,
  participants: {
    playerCharacters: [],
    npcs: [],
    monsters: []
  },
  isOnline: navigator.onLine,
  syncStatus: 'synced',
  realTimeData: {
    interactionStatus: null,
    participants: null,
    actions: null
  },
  conflictResolution: {
    hasConflict: false,
    serverState: null,
    clientState: null
  },
  performance: {
    lastRenderTime: 0,
    renderCount: 0,
    memoryUsage: 0
  }
};

// Enhanced Reducer with Performance Optimization
const liveInteractionReducer = (state: LiveInteractionState, action: LiveInteractionAction): LiveInteractionState => {
  const startTime = performance.now();
  
  let newState: LiveInteractionState;

  switch (action.type) {
    case 'SET_ACTIVE_INTERACTIONS':
      newState = {
        ...state,
        activeInteractions: action.payload,
        lastUpdate: Date.now()
      };
      break;

    case 'SET_CURRENT_INTERACTION':
      newState = {
        ...state,
        currentInteractionId: action.payload.interactionId,
        currentCampaignId: action.payload.campaignId,
        lastUpdate: Date.now()
      };
      break;

    case 'SET_LOADING':
      newState = {
        ...state,
        isLoading: action.payload
      };
      break;

    case 'SET_ERROR':
      newState = {
        ...state,
        error: action.payload,
        syncStatus: action.payload ? 'error' : state.syncStatus
      };
      break;

    case 'SET_PARTICIPANTS':
      newState = {
        ...state,
        participants: action.payload,
        lastUpdate: Date.now()
      };
      break;

    case 'SET_INITIATIVE_ORDER':
      newState = {
        ...state,
        initiativeOrder: action.payload,
        lastUpdate: Date.now()
      };
      break;

    case 'SET_PENDING_ACTIONS':
      newState = {
        ...state,
        pendingActions: action.payload,
        lastUpdate: Date.now()
      };
      break;

    case 'SET_ONLINE_STATUS':
      newState = {
        ...state,
        isOnline: action.payload,
        syncStatus: action.payload ? 'syncing' : 'error'
      };
      break;

    case 'SET_SYNC_STATUS':
      newState = {
        ...state,
        syncStatus: action.payload
      };
      break;

    case 'ADD_OPTIMISTIC_UPDATE':
      newState = {
        ...state,
        optimisticUpdates: new Map(state.optimisticUpdates).set(action.payload.key, action.payload.data),
        lastUpdate: Date.now()
      };
      break;

    case 'REMOVE_OPTIMISTIC_UPDATE':
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.delete(action.payload);
      newState = {
        ...state,
        optimisticUpdates: newOptimisticUpdates,
        lastUpdate: Date.now()
      };
      break;

    case 'REFRESH_DATA':
      newState = {
        ...state,
        lastUpdate: Date.now(),
        isLoading: true
      };
      break;

    case 'CLEAR_ERROR':
      newState = {
        ...state,
        error: null,
        syncStatus: 'synced'
      };
      break;

    case 'SET_REAL_TIME_DATA':
      newState = {
        ...state,
        realTimeData: {
          ...state.realTimeData,
          [action.payload.type]: action.payload.data
        },
        lastUpdate: Date.now()
      };
      break;

    case 'SET_CONFLICT':
      newState = {
        ...state,
        conflictResolution: {
          hasConflict: action.payload.hasConflict,
          serverState: action.payload.serverState || null,
          clientState: action.payload.clientState || null
        }
      };
      break;

    case 'UPDATE_PERFORMANCE':
      newState = {
        ...state,
        performance: {
          lastRenderTime: action.payload.renderTime,
          renderCount: state.performance.renderCount + 1,
          memoryUsage: action.payload.memoryUsage
        }
      };
      break;

    case 'BATCH_UPDATE':
      // Handle batch updates for performance
      newState = action.payload.reduce((acc, batchAction) => {
        return liveInteractionReducer(acc, batchAction);
      }, state);
      break;

    default:
      newState = state;
  }

  // Update performance metrics
  const endTime = performance.now();
  newState.performance.lastRenderTime = endTime - startTime;
  newState.performance.memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

  return newState;
};

// Enhanced Context
interface LiveInteractionContextType {
  state: LiveInteractionState;
  dispatch: React.Dispatch<LiveInteractionAction>;
  setCurrentInteraction: (interactionId: Id<"interactions">, campaignId: Id<"campaigns">) => void;
  clearCurrentInteraction: () => void;
  refreshInteractions: () => void;
  addOptimisticUpdate: (key: string, data: any) => void;
  removeOptimisticUpdate: (key: string) => void;
  getOptimisticData: (key: string) => any;
  retrySync: () => void;
  clearError: () => void;
  // Enhanced context methods
  resolveConflict: (resolution: 'server' | 'client' | 'merge') => void;
  batchDispatch: (actions: LiveInteractionAction[]) => void;
  getPerformanceMetrics: () => { renderTime: number; renderCount: number; memoryUsage: number };
  isDataStale: (thresholdMs?: number) => boolean;
  // Missing methods for compatibility
  optimisticUpdate: (key: string, data: any) => void;
  rollbackUpdate: (key: string) => void;
}

const LiveInteractionContext = createContext<LiveInteractionContextType | undefined>(undefined);

// Enhanced Provider component
interface LiveInteractionProviderProps {
  children: ReactNode;
}

export const LiveInteractionProvider: React.FC<LiveInteractionProviderProps> = ({ 
  children 
}) => {
  const [state, dispatch] = useReducer(liveInteractionReducer, initialState);

  // Enhanced real-time data through Convex queries with performance optimization
  const activeInteractions = useQuery(api.interactions.subscribeToActiveInteractions);
  const currentInteraction = useQuery(
    api.interactions.getInteractionWithParticipants,
    state.currentInteractionId ? { interactionId: state.currentInteractionId } : 'skip'
  );
  const initiativeOrder = useQuery(
    api.interactions.getInitiativeOrder,
    state.currentInteractionId ? { interactionId: state.currentInteractionId } : 'skip'
  );
  const pendingActions = useQuery(
    api.playerActions.getPendingPlayerActions,
    state.currentInteractionId ? { interactionId: state.currentInteractionId } : 'skip'
  );

  // Enhanced real-time subscriptions
  const interactionStatus = useQuery(
    api.interactions.subscribeToInteractionStatus,
    state.currentInteractionId ? { interactionId: state.currentInteractionId } : 'skip'
  );
  const interactionParticipants = useQuery(
    api.interactions.subscribeToInteractionParticipants,
    state.currentInteractionId ? { interactionId: state.currentInteractionId } : 'skip'
  );
  const interactionActions = useQuery(
    api.interactions.subscribeToInteractionActions,
    state.currentInteractionId ? { interactionId: state.currentInteractionId } : 'skip'
  );

  // Update state when active interactions change with performance optimization
  useEffect(() => {
    if (activeInteractions) {
      dispatch({ type: 'SET_ACTIVE_INTERACTIONS', payload: activeInteractions });
    }
  }, [activeInteractions]);

  // Update current interaction data with conflict detection
  useEffect(() => {
    if (currentInteraction) {
      dispatch({ 
        type: 'SET_PARTICIPANTS', 
        payload: {
          playerCharacters: currentInteraction.participants?.playerCharacters || [],
          npcs: currentInteraction.participants?.npcs || [],
          monsters: currentInteraction.participants?.monsters || []
        }
      });
    }
  }, [currentInteraction]);

  // Update initiative order with real-time sync
  useEffect(() => {
    if (initiativeOrder) {
      dispatch({ type: 'SET_INITIATIVE_ORDER', payload: initiativeOrder });
    }
  }, [initiativeOrder]);

  // Update pending actions with real-time sync
  useEffect(() => {
    if (pendingActions) {
      dispatch({ type: 'SET_PENDING_ACTIONS', payload: pendingActions });
    }
  }, [pendingActions]);

  // Enhanced real-time data updates
  useEffect(() => {
    if (interactionStatus) {
      dispatch({ 
        type: 'SET_REAL_TIME_DATA', 
        payload: { type: 'status', data: interactionStatus } 
      });
    }
  }, [interactionStatus]);

  useEffect(() => {
    if (interactionParticipants) {
      dispatch({ 
        type: 'SET_REAL_TIME_DATA', 
        payload: { type: 'participants', data: interactionParticipants } 
      });
    }
  }, [interactionParticipants]);

  useEffect(() => {
    if (interactionActions) {
      dispatch({ 
        type: 'SET_REAL_TIME_DATA', 
        payload: { type: 'actions', data: interactionActions } 
      });
    }
  }, [interactionActions]);

  // Enhanced online/offline status monitoring with conflict resolution
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      // Trigger a refresh when coming back online
      setTimeout(() => {
        dispatch({ type: 'REFRESH_DATA' });
      }, 1000);
    };

    const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enhanced Actions with performance optimization
  const setCurrentInteraction = useCallback((interactionId: Id<"interactions">, campaignId: Id<"campaigns">) => {
    dispatch({
      type: 'SET_CURRENT_INTERACTION',
      payload: { interactionId, campaignId }
    });
  }, []);

  const clearCurrentInteraction = useCallback(() => {
    dispatch({
      type: 'SET_CURRENT_INTERACTION',
      payload: { interactionId: null, campaignId: null }
    });
  }, []);

  const refreshInteractions = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'REFRESH_DATA' });
    // The useQuery hook will automatically refresh the data
    setTimeout(() => {
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  }, []);

  const addOptimisticUpdate = useCallback((key: string, data: any) => {
    dispatch({ type: 'ADD_OPTIMISTIC_UPDATE', payload: { key, data } });
  }, []);

  const removeOptimisticUpdate = useCallback((key: string) => {
    dispatch({ type: 'REMOVE_OPTIMISTIC_UPDATE', payload: key });
  }, []);

  const getOptimisticData = useCallback((key: string) => {
    return state.optimisticUpdates.get(key);
  }, [state.optimisticUpdates]);

  const retrySync = useCallback(() => {
    dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
    dispatch({ type: 'REFRESH_DATA' });
    setTimeout(() => {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'synced' });
    }, 2000);
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Enhanced context methods
  const resolveConflict = useCallback((resolution: 'server' | 'client' | 'merge') => {
    if (!state.conflictResolution.hasConflict) return;

    switch (resolution) {
      case 'server':
        // Use server state
        dispatch({ type: 'SET_CONFLICT', payload: { hasConflict: false } });
        break;
      case 'client':
        // Use client state (implement merge logic here)
        dispatch({ type: 'SET_CONFLICT', payload: { hasConflict: false } });
        break;
      case 'merge':
        // Implement custom merge logic
        dispatch({ type: 'SET_CONFLICT', payload: { hasConflict: false } });
        break;
    }
  }, [state.conflictResolution.hasConflict]);

  const batchDispatch = useCallback((actions: LiveInteractionAction[]) => {
    dispatch({ type: 'BATCH_UPDATE', payload: actions });
  }, []);

  const getPerformanceMetrics = useCallback(() => {
    return {
      renderTime: state.performance.lastRenderTime,
      renderCount: state.performance.renderCount,
      memoryUsage: state.performance.memoryUsage
    };
  }, [state.performance]);

  const isDataStale = useCallback((thresholdMs: number = 30000) => {
    return Date.now() - state.lastUpdate > thresholdMs;
  }, [state.lastUpdate]);

  // Missing methods for compatibility
  const optimisticUpdate = useCallback((key: string, data: any) => {
    dispatch({ type: 'ADD_OPTIMISTIC_UPDATE', payload: { key, data } });
  }, []);

  const rollbackUpdate = useCallback((key: string) => {
    dispatch({ type: 'REMOVE_OPTIMISTIC_UPDATE', payload: key });
  }, []);

  // Memoized context value for performance
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    setCurrentInteraction,
    clearCurrentInteraction,
    refreshInteractions,
    addOptimisticUpdate,
    removeOptimisticUpdate,
    getOptimisticData,
    retrySync,
    clearError,
    resolveConflict,
    batchDispatch,
    getPerformanceMetrics,
    isDataStale,
    optimisticUpdate,
    rollbackUpdate
  }), [
    state,
    setCurrentInteraction,
    clearCurrentInteraction,
    refreshInteractions,
    addOptimisticUpdate,
    removeOptimisticUpdate,
    getOptimisticData,
    retrySync,
    clearError,
    resolveConflict,
    batchDispatch,
    getPerformanceMetrics,
    isDataStale,
    optimisticUpdate,
    rollbackUpdate
  ]);

  return (
    <LiveInteractionContext.Provider value={contextValue}>
      {children}
    </LiveInteractionContext.Provider>
  );
};

// Enhanced Hook to use the context
export const useLiveInteraction = (): LiveInteractionContextType => {
  const context = useContext(LiveInteractionContext);
  if (context === undefined) {
    throw new Error('useLiveInteraction must be used within a LiveInteractionProvider');
  }
  return context;
};

// Enhanced Hook for optimistic updates with conflict resolution
export const useOptimisticUpdates = () => {
  const { addOptimisticUpdate, removeOptimisticUpdate, getOptimisticData, resolveConflict } = useLiveInteraction();

  const optimisticUpdate = useCallback((interactionId: Id<"interactions">, updates: any) => {
    const key = `interaction-${interactionId}`;
    addOptimisticUpdate(key, updates);
    
    // Auto-remove optimistic update after a delay
    setTimeout(() => {
      removeOptimisticUpdate(key);
    }, 5000);
  }, [addOptimisticUpdate, removeOptimisticUpdate]);

  const rollbackUpdate = useCallback((interactionId: Id<"interactions">, originalData: any) => {
    const key = `interaction-${interactionId}`;
    addOptimisticUpdate(key, originalData);
  }, [addOptimisticUpdate]);

  const handleConflict = useCallback((resolution: 'server' | 'client' | 'merge') => {
    resolveConflict(resolution);
  }, [resolveConflict]);

  return {
    optimisticUpdate,
    rollbackUpdate,
    getOptimisticData,
    handleConflict,
  };
};

// Enhanced Hook for real-time status monitoring with performance metrics
export const useLiveInteractionStatus = () => {
  const { state, getPerformanceMetrics, isDataStale } = useLiveInteraction();
  
  return {
    isOnline: state.isOnline,
    syncStatus: state.syncStatus,
    lastUpdate: state.lastUpdate,
    hasError: !!state.error,
    error: state.error,
    isLoading: state.isLoading,
    hasConflict: state.conflictResolution.hasConflict,
    performance: getPerformanceMetrics(),
    isDataStale: isDataStale(),
    realTimeData: state.realTimeData
  };
}; 