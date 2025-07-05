import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import './SmartBreadcrumbs.css';

interface BreadcrumbItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  isActive: boolean;
  metadata?: any;
}

interface SmartBreadcrumbsProps {
  maxItems?: number;
  showHistory?: boolean;
  enableDeepLinking?: boolean;
}

export const SmartBreadcrumbs: React.FC<SmartBreadcrumbsProps> = ({
  maxItems = 5,
  showHistory = true,
  enableDeepLinking = true
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<BreadcrumbItem[]>([]);

  // Queries for dynamic breadcrumb data
  const campaigns = useQuery(api.campaigns.getAllCampaigns, { clerkId: undefined });
  const interactions = useQuery(api.interactions.getAllInteractions);

  // Parse current path and generate breadcrumbs
  useEffect(() => {
    const generateBreadcrumbs = (): BreadcrumbItem[] => {
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const items: BreadcrumbItem[] = [];
      
      // Always start with home
      items.push({
        id: 'home',
        label: 'Home',
        path: '/',
        icon: '🏠',
        isActive: location.pathname === '/'
      });

      let currentPath = '';
      
      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        currentPath += `/${segment}`;
        
        // Handle different route types
        const breadcrumbItem = createBreadcrumbItem(segment, currentPath, pathSegments, i);
        if (breadcrumbItem) {
          items.push(breadcrumbItem);
        }
      }

      return items;
    };

    const newBreadcrumbs = generateBreadcrumbs();
    setBreadcrumbs(newBreadcrumbs);

    // Add to navigation history
    if (showHistory && newBreadcrumbs.length > 0) {
      const lastItem = newBreadcrumbs[newBreadcrumbs.length - 1];
      if (lastItem && !navigationHistory.find(item => item.path === lastItem.path)) {
        setNavigationHistory(prev => [lastItem, ...prev.slice(0, 9)]); // Keep last 10 items
      }
    }
  }, [location.pathname, campaigns, interactions, showHistory, navigationHistory]);

  const createBreadcrumbItem = (
    segment: string,
    currentPath: string,
    pathSegments: string[],
    index: number
  ): BreadcrumbItem | null => {
    // Handle different route patterns
    switch (pathSegments[0]) {
      case 'campaigns':
        return handleCampaignRoute(segment, currentPath, pathSegments, index);
      case 'interactions':
        return handleInteractionRoute(segment, currentPath, pathSegments, index);
      case 'live-interactions':
        return handleLiveInteractionRoute(segment, currentPath, pathSegments, index);
      case 'characters':
        return handleCharacterRoute(segment, currentPath, pathSegments, index);
      case 'items':
        return handleItemRoute(segment, currentPath, pathSegments, index);
      case 'monsters':
        return handleMonsterRoute(segment, currentPath, pathSegments, index);
      case 'npcs':
        return handleNPCRoute(segment, currentPath, pathSegments, index);
      case 'quests':
        return handleQuestRoute(segment, currentPath, pathSegments, index);
      default:
        return createGenericBreadcrumbItem(segment, currentPath, index);
    }
  };

  const handleCampaignRoute = (
    segment: string,
    currentPath: string,
    pathSegments: string[],
    index: number
  ): BreadcrumbItem | null => {
    if (index === 0) {
      return {
        id: 'campaigns',
        label: 'Campaigns',
        path: '/campaigns',
        icon: '📚',
        isActive: currentPath === '/campaigns'
      };
    }

    if (index === 1 && pathSegments[1]) {
      const campaign = campaigns?.find(c => c._id === pathSegments[1]);
      return {
        id: `campaign-${pathSegments[1]}`,
        label: campaign?.name || 'Campaign',
        path: currentPath,
        icon: '🎲',
        isActive: currentPath === location.pathname,
        metadata: { type: 'campaign', id: pathSegments[1] }
      };
    }

    if (index === 2 && pathSegments[2] === 'live-interaction') {
      return {
        id: 'live-interaction',
        label: 'Live Interaction',
        path: currentPath,
        icon: '⚡',
        isActive: currentPath === location.pathname
      };
    }

    return null;
  };

  const handleInteractionRoute = (
    segment: string,
    currentPath: string,
    pathSegments: string[],
    index: number
  ): BreadcrumbItem | null => {
    if (index === 0) {
      return {
        id: 'interactions',
        label: 'Interactions',
        path: '/interactions',
        icon: '🤝',
        isActive: currentPath === '/interactions'
      };
    }

    if (index === 1 && pathSegments[1]) {
      const interaction = interactions?.find(i => i._id === pathSegments[1]);
      return {
        id: `interaction-${pathSegments[1]}`,
        label: interaction?.name || 'Interaction',
        path: currentPath,
        icon: '🎭',
        isActive: currentPath === location.pathname,
        metadata: { type: 'interaction', id: pathSegments[1] }
      };
    }

    return null;
  };

  const handleLiveInteractionRoute = (
    segment: string,
    currentPath: string,
    pathSegments: string[],
    index: number
  ): BreadcrumbItem | null => {
    if (index === 0) {
      return {
        id: 'live-interactions',
        label: 'Live Interactions',
        path: '/live-interactions',
        icon: '⚡',
        isActive: currentPath === '/live-interactions'
      };
    }

    return null;
  };

  const handleCharacterRoute = (
    segment: string,
    currentPath: string,
    pathSegments: string[],
    index: number
  ): BreadcrumbItem | null => {
    if (index === 0) {
      return {
        id: 'characters',
        label: 'Characters',
        path: '/characters',
        icon: '👤',
        isActive: currentPath === '/characters'
      };
    }

    return null;
  };

  const handleItemRoute = (
    segment: string,
    currentPath: string,
    pathSegments: string[],
    index: number
  ): BreadcrumbItem | null => {
    if (index === 0) {
      return {
        id: 'items',
        label: 'Items',
        path: '/items',
        icon: '⚔️',
        isActive: currentPath === '/items'
      };
    }

    return null;
  };

  const handleMonsterRoute = (
    segment: string,
    currentPath: string,
    pathSegments: string[],
    index: number
  ): BreadcrumbItem | null => {
    if (index === 0) {
      return {
        id: 'monsters',
        label: 'Monsters',
        path: '/monsters',
        icon: '🐉',
        isActive: currentPath === '/monsters'
      };
    }

    return null;
  };

  const handleNPCRoute = (
    segment: string,
    currentPath: string,
    pathSegments: string[],
    index: number
  ): BreadcrumbItem | null => {
    if (index === 0) {
      return {
        id: 'npcs',
        label: 'NPCs',
        path: '/npcs',
        icon: '👥',
        isActive: currentPath === '/npcs'
      };
    }

    return null;
  };

  const handleQuestRoute = (
    segment: string,
    currentPath: string,
    pathSegments: string[],
    index: number
  ): BreadcrumbItem | null => {
    if (index === 0) {
      return {
        id: 'quests',
        label: 'Quests',
        path: '/quests',
        icon: '🗺️',
        isActive: currentPath === '/quests'
      };
    }

    return null;
  };

  const createGenericBreadcrumbItem = (
    segment: string,
    currentPath: string,
    index: number
  ): BreadcrumbItem => {
    return {
      id: `segment-${index}`,
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      path: currentPath,
      icon: '📄',
      isActive: currentPath === location.pathname
    };
  };

  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    if (enableDeepLinking) {
      navigate(item.path);
    }
  };

  const handleHistoryItemClick = (item: BreadcrumbItem) => {
    navigate(item.path);
    setShowDropdown(false);
  };

  const getVisibleBreadcrumbs = (): BreadcrumbItem[] => {
    if (breadcrumbs.length <= maxItems) {
      return breadcrumbs;
    }

    // Show first, last, and some in between
    const first = breadcrumbs[0];
    const last = breadcrumbs[breadcrumbs.length - 1];
    const middle = breadcrumbs.slice(1, -1);
    
    if (middle.length <= 2) {
      return breadcrumbs;
    }

    // Take first and last from middle
    const visibleMiddle = [middle[0], middle[middle.length - 1]];
    
    return [first, ...visibleMiddle, last];
  };

  const visibleBreadcrumbs = getVisibleBreadcrumbs();

  return (
    <nav className="smart-breadcrumbs" aria-label="Breadcrumb navigation">
      <div className="breadcrumbs-container">
        <ol className="breadcrumbs-list">
          {visibleBreadcrumbs.map((item, index) => (
            <li key={item.id} className="breadcrumb-item">
              {index > 0 && <span className="breadcrumb-separator">/</span>}
              
              {index === 0 && breadcrumbs.length > maxItems && (
                <span className="breadcrumb-ellipsis">...</span>
              )}
              
              <button
                className={`breadcrumb-link ${item.isActive ? 'active' : ''}`}
                onClick={() => handleBreadcrumbClick(item)}
                disabled={!enableDeepLinking}
                title={item.label}
              >
                {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                <span className="breadcrumb-label">{item.label}</span>
              </button>
              
              {index === visibleBreadcrumbs.length - 2 && breadcrumbs.length > maxItems && (
                <span className="breadcrumb-ellipsis">...</span>
              )}
            </li>
          ))}
        </ol>

        {/* Navigation History Dropdown */}
        {showHistory && navigationHistory.length > 0 && (
          <div className="breadcrumb-actions">
            <button
              className="history-button"
              onClick={() => setShowDropdown(!showDropdown)}
              title="Navigation History"
            >
              📜
            </button>
            
            {showDropdown && (
              <div className="history-dropdown">
                <div className="dropdown-header">
                  <h4>Recent Pages</h4>
                  <button 
                    className="close-button"
                    onClick={() => setShowDropdown(false)}
                  >
                    ×
                  </button>
                </div>
                
                <div className="history-list">
                  {navigationHistory.map((item, index) => (
                    <button
                      key={`${item.id}-${index}`}
                      className="history-item"
                      onClick={() => handleHistoryItemClick(item)}
                    >
                      {item.icon && <span className="history-icon">{item.icon}</span>}
                      <span className="history-label">{item.label}</span>
                    </button>
                  ))}
                </div>
                
                <div className="dropdown-footer">
                  <button 
                    className="clear-history-button"
                    onClick={() => {
                      setNavigationHistory([]);
                      setShowDropdown(false);
                    }}
                  >
                    Clear History
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}; 