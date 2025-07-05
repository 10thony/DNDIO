import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useUser } from '@clerk/clerk-react';
import './QuickAccessPanel.css';

interface QuickAccessItem {
  id: string;
  type: 'interaction' | 'campaign' | 'character' | 'item' | 'monster' | 'npc';
  title: string;
  subtitle?: string;
  icon: string;
  path: string;
  status?: string;
  timestamp: number;
  metadata?: any;
}

interface QuickAccessPanelProps {
  isVisible?: boolean;
  onToggle?: () => void;
  maxRecentItems?: number;
  enableSearch?: boolean;
}

export const QuickAccessPanel: React.FC<QuickAccessPanelProps> = ({
  isVisible = false,
  onToggle,
  maxRecentItems = 5,
  enableSearch = true
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentItems, setRecentItems] = useState<QuickAccessItem[]>([]);
  const [searchResults, setSearchResults] = useState<QuickAccessItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Queries for data
  const activeInteractions = useQuery(api.interactions.subscribeToActiveInteractions);
  const campaigns = useQuery(api.campaigns.getAllCampaigns, { clerkId: user?.id || undefined });
  const characters = useQuery(api.characters.getAllCharacters, { clerkId: user?.id || undefined });
  const items = useQuery(api.items.getAllItems);
  const monsters = useQuery(api.monsters.getAllMonsters);
  const npcs = useQuery(api.npcs.getAllNPCs);

  // Load recent items from localStorage
  useEffect(() => {
    const loadRecentItems = () => {
      try {
        const stored = localStorage.getItem('quick-access-recent');
        if (stored) {
          const items = JSON.parse(stored);
          setRecentItems(items.slice(0, maxRecentItems));
        }
      } catch (error) {
        console.error('Error loading recent items:', error);
      }
    };

    loadRecentItems();
  }, [maxRecentItems]);

  // Save recent items to localStorage
  const saveRecentItem = (item: QuickAccessItem) => {
    try {
      const existing = recentItems.filter(i => i.id !== item.id);
      const updated = [item, ...existing].slice(0, maxRecentItems);
      setRecentItems(updated);
      localStorage.setItem('quick-access-recent', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent item:', error);
    }
  };

  // Handle item click
  const handleItemClick = (item: QuickAccessItem) => {
    saveRecentItem(item);
    navigate(item.path);
    setIsExpanded(false);
    setSearchQuery('');
  };

  // Search functionality
  useEffect(() => {
    if (!enableSearch || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, enableSearch, activeInteractions, campaigns, characters, items, monsters, npcs]);

  const performSearch = (query: string) => {
    setIsSearching(true);
    const results: QuickAccessItem[] = [];
    const lowerQuery = query.toLowerCase();

    // Search active interactions
    activeInteractions?.forEach(interaction => {
      if (interaction.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: `interaction-${interaction._id}`,
          type: 'interaction',
          title: interaction.name,
          subtitle: `Status: ${interaction.status.replace(/_/g, ' ')}`,
          icon: '⚡',
          path: `/interactions/${interaction._id}`,
          status: interaction.status,
          timestamp: interaction.updatedAt || interaction.createdAt,
          metadata: { interaction }
        });
      }
    });

    // Search campaigns
    campaigns?.forEach(campaign => {
      if (campaign.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: `campaign-${campaign._id}`,
          type: 'campaign',
          title: campaign.name,
          subtitle: `DM: ${campaign.dmName || 'Unknown'}`,
          icon: '📚',
          path: `/campaigns/${campaign._id}`,
          timestamp: campaign.updatedAt || campaign.createdAt,
          metadata: { campaign }
        });
      }
    });

    // Search characters
    characters?.forEach(character => {
      if (character.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: `character-${character._id}`,
          type: 'character',
          title: character.name,
          subtitle: `${character.race} ${character.class}`,
          icon: '👤',
          path: `/characters/${character._id}`,
          timestamp: character.updatedAt || character.createdAt,
          metadata: { character }
        });
      }
    });

    // Search items
    items?.forEach(item => {
      if (item.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: `item-${item._id}`,
          type: 'item',
          title: item.name,
          subtitle: item.type,
          icon: '⚔️',
          path: `/items/${item._id}`,
          timestamp: item.updatedAt || item.createdAt,
          metadata: { item }
        });
      }
    });

    // Search monsters
    monsters?.forEach(monster => {
      if (monster.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: `monster-${monster._id}`,
          type: 'monster',
          title: monster.name,
          subtitle: `CR ${monster.challengeRating}`,
          icon: '🐉',
          path: `/monsters/${monster._id}`,
          timestamp: monster.updatedAt || monster.createdAt,
          metadata: { monster }
        });
      }
    });

    // Search NPCs
    npcs?.forEach(npc => {
      if (npc.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: `npc-${npc._id}`,
          type: 'npc',
          title: npc.name,
          subtitle: npc.role,
          icon: '👥',
          path: `/npcs/${npc._id}`,
          timestamp: npc.updatedAt || npc.createdAt,
          metadata: { npc }
        });
      }
    });

    // Sort by relevance and recency
    results.sort((a, b) => {
      const aExactMatch = a.title.toLowerCase() === lowerQuery;
      const bExactMatch = b.title.toLowerCase() === lowerQuery;
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      return b.timestamp - a.timestamp;
    });

    setSearchResults(results.slice(0, 10)); // Limit to 10 results
    setIsSearching(false);
  };

  // Quick actions
  const quickActions = [
    {
      id: 'new-interaction',
      title: 'New Interaction',
      icon: '➕',
      path: '/interactions/create',
      type: 'action' as const
    },
    {
      id: 'new-campaign',
      title: 'New Campaign',
      icon: '📚',
      path: '/campaigns/create',
      type: 'action' as const
    },
    {
      id: 'live-interactions',
      title: 'Live Interactions',
      icon: '⚡',
      path: '/live-interactions',
      type: 'action' as const
    },
    {
      id: 'dice-roller',
      title: 'Dice Roller',
      icon: '🎲',
      path: '/dice-roller',
      type: 'action' as const
    }
  ];

  const handleQuickAction = (action: typeof quickActions[0]) => {
    navigate(action.path);
    setIsExpanded(false);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING_INITIATIVE':
        return 'yellow';
      case 'INITIATIVE_ROLLED':
        return 'blue';
      case 'WAITING_FOR_PLAYER_TURN':
        return 'green';
      case 'PROCESSING_PLAYER_ACTION':
        return 'purple';
      case 'DM_REVIEW':
        return 'orange';
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`quick-access-fab ${isVisible ? 'visible' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Quick Access"
      >
        <span className="fab-icon">⚡</span>
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="quick-access-panel">
          <div className="panel-header">
            <h3>Quick Access</h3>
            <button 
              className="close-button"
              onClick={() => setIsExpanded(false)}
            >
              ×
            </button>
          </div>

          {/* Search */}
          {enableSearch && (
            <div className="search-section">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search interactions, campaigns, characters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {isSearching && <div className="search-spinner"></div>}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h4>Quick Actions</h4>
            <div className="quick-actions-grid">
              {quickActions.map(action => (
                <button
                  key={action.id}
                  className="quick-action-button"
                  onClick={() => handleQuickAction(action)}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-title">{action.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="search-results-section">
              <h4>Search Results ({searchResults.length})</h4>
              <div className="search-results-list">
                {searchResults.map(item => (
                  <button
                    key={item.id}
                    className="search-result-item"
                    onClick={() => handleItemClick(item)}
                  >
                    <span className="result-icon">{item.icon}</span>
                    <div className="result-content">
                      <div className="result-title">{item.title}</div>
                      {item.subtitle && (
                        <div className="result-subtitle">{item.subtitle}</div>
                      )}
                    </div>
                    {item.status && (
                      <span className={`result-status status-${getStatusColor(item.status)}`}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    )}
                  </button>
                ))}
                {searchResults.length === 0 && !isSearching && (
                  <div className="no-results">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Items */}
          {!searchQuery && recentItems.length > 0 && (
            <div className="recent-items-section">
              <h4>Recent Items</h4>
              <div className="recent-items-list">
                {recentItems.map(item => (
                  <button
                    key={item.id}
                    className="recent-item"
                    onClick={() => handleItemClick(item)}
                  >
                    <span className="item-icon">{item.icon}</span>
                    <div className="item-content">
                      <div className="item-title">{item.title}</div>
                      {item.subtitle && (
                        <div className="item-subtitle">{item.subtitle}</div>
                      )}
                      <div className="item-time">{formatTimestamp(item.timestamp)}</div>
                    </div>
                    {item.status && (
                      <span className={`item-status status-${getStatusColor(item.status)}`}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Interactions */}
          {!searchQuery && activeInteractions && activeInteractions.length > 0 && (
            <div className="active-interactions-section">
              <h4>Active Interactions ({activeInteractions.length})</h4>
              <div className="active-interactions-list">
                {activeInteractions.slice(0, 3).map(interaction => (
                  <button
                    key={interaction._id}
                    className="active-interaction-item"
                    onClick={() => handleItemClick({
                      id: `interaction-${interaction._id}`,
                      type: 'interaction',
                      title: interaction.name,
                      subtitle: `Campaign: ${interaction.campaignId || 'Standalone'}`,
                      icon: '⚡',
                      path: `/interactions/${interaction._id}`,
                      status: interaction.status,
                      timestamp: interaction.updatedAt || interaction.createdAt,
                      metadata: { interaction }
                    })}
                  >
                    <span className="interaction-icon">⚡</span>
                    <div className="interaction-content">
                      <div className="interaction-title">{interaction.name}</div>
                      <div className="interaction-status">
                        <span className={`status-badge status-${getStatusColor(interaction.status)}`}>
                          {interaction.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}; 