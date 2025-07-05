import { useEffect, useRef, useCallback, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface UseLiveInteractionNotificationsProps {
  interactionId?: Id<"interactions">;
  userId?: Id<"users">;
  isDM?: boolean;
  enableNotifications?: boolean;
}

interface NotificationState {
  lastTurnIndex?: number;
  lastPendingActionsCount: number;
  lastStatus?: string;
  lastActiveInteractionId?: Id<"interactions">;
  lastUpdateTime: number;
  lastParticipantCount: number;
  lastActionCount: number;
}

interface CrossTabUpdate {
  type: 'turn-change' | 'status-change' | 'action-submitted' | 'action-resolved' | 'participant-change';
  interactionId: Id<"interactions">;
  interactionName: string;
  timestamp: number;
  data?: any;
}

interface OfflineAction {
  type: string;
  interactionId: Id<"interactions">;
  data: any;
  timestamp: number;
  retryCount: number;
}

// Enhanced notification hook with real-time capabilities
export const useLiveInteractionNotifications = ({
  interactionId,
  isDM = false,
  enableNotifications = true
}: UseLiveInteractionNotificationsProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const notificationState = useRef<NotificationState>({
    lastPendingActionsCount: 0,
    lastUpdateTime: Date.now(),
    lastParticipantCount: 0,
    lastActionCount: 0
  });

  // Enhanced real-time subscriptions using new Convex queries
  const interactionStatus = useQuery(
    api.interactions.subscribeToInteractionStatus,
    interactionId ? { interactionId } : 'skip'
  );
  
  const interactionParticipants = useQuery(
    api.interactions.subscribeToInteractionParticipants,
    interactionId ? { interactionId } : 'skip'
  );
  
  const interactionActions = useQuery(
    api.interactions.subscribeToInteractionActions,
    interactionId ? { interactionId } : 'skip'
  );

  // Enhanced cross-tab synchronization using localStorage with better error handling
  const syncAcrossTabs = useCallback((event: StorageEvent) => {
    if (event.key === 'live-interaction-update' && event.newValue) {
      try {
        const update: CrossTabUpdate = JSON.parse(event.newValue);
        if (update.interactionId === interactionId) {
          // Process offline queue when coming back online
          if (update.type === 'status-change' && update.data?.status === 'ONLINE') {
            processOfflineQueue();
          }
          
          // Enhanced notification system with better categorization
          switch (update.type) {
            case 'turn-change':
              showNotification(
                'Turn Changed',
                `Turn has advanced in ${update.interactionName}`,
                'turn-notification',
                { priority: 'high', sound: true }
              );
              break;
            case 'status-change':
              showNotification(
                'Status Updated',
                `${update.interactionName} status changed to ${update.data?.newStatus?.replace(/_/g, ' ')}`,
                'status-notification',
                { priority: 'medium', sound: false }
              );
              break;
            case 'action-submitted':
              if (isDM) {
                showNotification(
                  'New Action Submitted',
                  `A player has submitted an action in ${update.interactionName}`,
                  'action-notification',
                  { priority: 'high', sound: true }
                );
              }
              break;
            case 'action-resolved':
              showNotification(
                'Action Resolved',
                `An action has been resolved in ${update.interactionName}`,
                'action-notification',
                { priority: 'medium', sound: false }
              );
              break;
            case 'participant-change':
              showNotification(
                'Participant Update',
                `Participants have changed in ${update.interactionName}`,
                'participant-notification',
                { priority: 'low', sound: false }
              );
              break;
          }
        }
      } catch (error) {
        console.error('Error parsing cross-tab update:', error);
        setSyncStatus('error');
      }
    }
  }, [interactionId, isDM]);

  // Enhanced offline queue processing with retry logic
  const processOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;

    setSyncStatus('syncing');
    const queue = [...offlineQueue];
    const processed: OfflineAction[] = [];
    const failed: OfflineAction[] = [];

    for (const action of queue) {
      try {
        // Simulate processing the offline action
        // In a real implementation, you would call the appropriate Convex mutation
        console.log('Processing offline action:', action);
        processed.push(action);
      } catch (error) {
        console.error('Failed to process offline action:', error);
        if (action.retryCount < 3) {
          failed.push({ ...action, retryCount: action.retryCount + 1 });
        }
      }
    }

    // Update queue with failed actions
    setOfflineQueue(failed);
    
    if (failed.length === 0) {
      setSyncStatus('synced');
      showNotification(
        'Sync Complete',
        `Successfully synced ${processed.length} offline actions`,
        'sync-notification',
        { priority: 'medium', sound: false }
      );
    } else {
      setSyncStatus('error');
      showNotification(
        'Sync Error',
        `Failed to sync ${failed.length} actions. Will retry later.`,
        'error-notification',
        { priority: 'high', sound: true }
      );
    }
  }, [offlineQueue]);

  // Enhanced broadcast function with better error handling
  const broadcastUpdate = useCallback((update: Omit<CrossTabUpdate, 'timestamp'>) => {
    try {
      const fullUpdate: CrossTabUpdate = {
        ...update,
        timestamp: Date.now()
      };

      // Store in localStorage for cross-tab communication
      localStorage.setItem('live-interaction-update', JSON.stringify(fullUpdate));
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'live-interaction-update',
        newValue: JSON.stringify(fullUpdate),
        oldValue: null,
        storageArea: localStorage
      }));

      // Add to offline queue if offline
      if (!isOnline) {
        setOfflineQueue(prev => [...prev, {
          type: update.type,
          interactionId: update.interactionId,
          data: update.data,
          timestamp: Date.now(),
          retryCount: 0
        }]);
      }
    } catch (error) {
      console.error('Error broadcasting update:', error);
      setSyncStatus('error');
    }
  }, [isOnline]);

  // Enhanced notification creation with better options
  const showNotification = useCallback((title: string, message: string, type: string, options?: {
    priority?: 'low' | 'medium' | 'high';
    sound?: boolean;
    duration?: number;
  }) => {
    if (!enableNotifications || !('Notification' in window)) return;

    try {
      const notification = new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: type,
        requireInteraction: options?.priority === 'high',
        silent: !options?.sound,
        badge: '/favicon.ico',
        image: type === 'turn-notification' ? '/dice-icon.png' : undefined,
      });

      // Auto-close after appropriate time
      const closeTime = options?.duration || (options?.priority === 'high' ? 10000 : 5000);
      setTimeout(() => {
        notification.close();
      }, closeTime);

      // Enhanced notification click handling
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navigate to the interaction if it's a turn notification
        if (type === 'turn-notification' && interactionId) {
          // You can implement navigation logic here
          console.log('Navigate to interaction:', interactionId);
        }
      };

      // Enhanced error handling
      notification.onerror = (error) => {
        console.error('Notification error:', error);
        setSyncStatus('error');
      };

    } catch (error) {
      console.error('Error creating notification:', error);
      setSyncStatus('error');
    }
  }, [interactionId, enableNotifications]);

  // Enhanced request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        setSyncStatus('error');
      }
    }
  }, []);

  // Enhanced online/offline status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      processOfflineQueue();
      broadcastUpdate({
        type: 'status-change',
        interactionId: interactionId!,
        interactionName: 'Interaction',
        data: { newStatus: 'ONLINE' }
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('error');
      broadcastUpdate({
        type: 'status-change',
        interactionId: interactionId!,
        interactionName: 'Interaction',
        data: { newStatus: 'OFFLINE' }
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [interactionId, processOfflineQueue, broadcastUpdate]);

  // Enhanced main effect for detecting changes and showing notifications
  useEffect(() => {
    if (!interactionStatus || !interactionParticipants || !interactionActions) return;

    const currentState = notificationState.current;
    const now = Date.now();

    // Check for turn changes
    if (currentState.lastTurnIndex !== undefined && 
        currentState.lastTurnIndex !== interactionStatus.currentInitiativeIndex) {
      
      showNotification(
        'Turn Changed!',
        `It's now turn ${interactionStatus.currentInitiativeIndex + 1} in the interaction`,
        'turn-notification',
        { priority: 'high', sound: true, duration: 10000 }
      );

      broadcastUpdate({
        type: 'turn-change',
        interactionId: interactionId!,
        interactionName: 'Interaction',
        data: { newTurnIndex: interactionStatus.currentInitiativeIndex }
      });
    }

    // Check for participant count changes
    if (currentState.lastParticipantCount !== undefined &&
        currentState.lastParticipantCount !== interactionParticipants.totalParticipants) {
      
      showNotification(
        'Participants Updated',
        `Participant count changed to ${interactionParticipants.totalParticipants}`,
        'participant-notification',
        { priority: 'low', sound: false }
      );

      broadcastUpdate({
        type: 'participant-change',
        interactionId: interactionId!,
        interactionName: 'Interaction',
        data: { newParticipantCount: interactionParticipants.totalParticipants }
      });
    }

    // Check for action count changes
    if (currentState.lastActionCount !== undefined &&
        currentState.lastActionCount !== interactionActions.totalCount) {
      
      if (isDM && interactionActions.pendingCount > currentState.lastPendingActionsCount) {
        const newActions = interactionActions.pendingCount - currentState.lastPendingActionsCount;
        showNotification(
          'New Actions Pending',
          `${newActions} new action${newActions > 1 ? 's' : ''} require${newActions > 1 ? '' : 's'} your review`,
          'action-notification',
          { priority: 'high', sound: true }
        );

        broadcastUpdate({
          type: 'action-submitted',
          interactionId: interactionId!,
          interactionName: 'Interaction',
          data: { newActionsCount: interactionActions.pendingCount }
        });
      }
    }

    // Check for status changes
    if (currentState.lastStatus !== undefined && 
        currentState.lastStatus !== interactionStatus.status) {
      
      showNotification(
        'Status Updated',
        `Interaction status changed to ${interactionStatus.status?.replace(/_/g, ' ')}`,
        'status-notification',
        { priority: 'medium', sound: false }
      );

      broadcastUpdate({
        type: 'status-change',
        interactionId: interactionId!,
        interactionName: 'Interaction',
        data: { newStatus: interactionStatus.status }
      });
    }

    // Update refs
    currentState.lastTurnIndex = interactionStatus.currentInitiativeIndex;
    currentState.lastPendingActionsCount = interactionActions.pendingCount;
    currentState.lastStatus = interactionStatus.status;
    currentState.lastParticipantCount = interactionParticipants.totalParticipants;
    currentState.lastActionCount = interactionActions.totalCount;
    currentState.lastUpdateTime = now;
  }, [interactionStatus, interactionParticipants, interactionActions, isDM, showNotification, broadcastUpdate, interactionId]);

  // Set up cross-tab synchronization
  useEffect(() => {
    window.addEventListener('storage', syncAcrossTabs);
    return () => {
      window.removeEventListener('storage', syncAcrossTabs);
    };
  }, [syncAcrossTabs]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  return {
    isOnline,
    offlineQueue,
    syncStatus,
    requestNotificationPermission,
    showNotification,
    broadcastUpdate,
    processOfflineQueue,
    // Enhanced return values
    hasOfflineActions: offlineQueue.length > 0,
    lastSyncTime: notificationState.current.lastUpdateTime,
    notificationCount: {
      pending: interactionActions?.pendingCount || 0,
      total: interactionActions?.totalCount || 0,
    }
  };
}; 