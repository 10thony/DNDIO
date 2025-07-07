// Error Recovery System for Live Interactions
// Milestone 4: State Synchronization

import React from 'react';
import { Id } from '../../convex/_generated/dataModel';

// Error types for classification
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  CONFLICT = 'CONFLICT',
  SERVER = 'SERVER',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Error classification interface
export interface ErrorClassification {
  type: ErrorType;
  severity: ErrorSeverity;
  retryable: boolean;
  message: string;
  originalError: any;
}

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  timeout: number;
}

// Offline action interface
export interface OfflineAction {
  id: string;
  type: string;
  interactionId: Id<"interactions">;
  data: any;
  timestamp: number;
  retryCount: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Error recovery state
export interface ErrorRecoveryState {
  isOnline: boolean;
  hasOfflineActions: boolean;
  offlineActionCount: number;
  lastSyncTime: number;
  syncStatus: 'synced' | 'syncing' | 'error';
  errorHistory: ErrorClassification[];
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  timeout: 10000
};

// Error classification function
export const classifyError = (error: any): ErrorClassification => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  
  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
    return {
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      message: errorMessage,
      originalError: error
    };
  }

  // Authentication errors
  if (errorMessage.includes('auth') || errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
    return {
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      retryable: false,
      message: errorMessage,
      originalError: error
    };
  }

  // Authorization errors
  if (errorMessage.includes('forbidden') || errorMessage.includes('403') || errorMessage.includes('permission')) {
    return {
      type: ErrorType.AUTHORIZATION,
      severity: ErrorSeverity.HIGH,
      retryable: false,
      message: errorMessage,
      originalError: error
    };
  }

  // Validation errors
  if (errorMessage.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('400')) {
    return {
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      message: errorMessage,
      originalError: error
    };
  }

  // Conflict errors
  if (errorMessage.includes('conflict') || errorMessage.includes('409')) {
    return {
      type: ErrorType.CONFLICT,
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      message: errorMessage,
      originalError: error
    };
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('408')) {
    return {
      type: ErrorType.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      message: errorMessage,
      originalError: error
    };
  }

  // Server errors
  if (errorMessage.includes('500') || errorMessage.includes('server')) {
    return {
      type: ErrorType.SERVER,
      severity: ErrorSeverity.HIGH,
      retryable: true,
      message: errorMessage,
      originalError: error
    };
  }

  // Default to unknown
  return {
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    message: errorMessage,
    originalError: error
  };
};

// Exponential backoff delay calculation
export const calculateBackoffDelay = (retryCount: number, config: RetryConfig): number => {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, retryCount);
  return Math.min(delay, config.maxDelay);
};

// Retry function with exponential backoff
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), finalConfig.timeout);
      });

      // Race between operation and timeout
      const result = await Promise.race([operation(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error;
      const classification = classifyError(error);

      // Don't retry if error is not retryable
      if (!classification.retryable) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === finalConfig.maxRetries) {
        throw error;
      }

      // Calculate delay and wait
      const delay = calculateBackoffDelay(attempt, finalConfig);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Offline action queue management
class OfflineActionQueue {
  private queue: OfflineAction[] = [];
  private storageKey = 'live-interaction-offline-queue';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading offline queue from storage:', error);
      this.queue = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving offline queue to storage:', error);
    }
  }

  addAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): string {
    const id = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const offlineAction: OfflineAction = {
      ...action,
      id,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.queue.push(offlineAction);
    this.saveToStorage();
    return id;
  }

  removeAction(id: string): boolean {
    const index = this.queue.findIndex(action => action.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getActions(): OfflineAction[] {
    return [...this.queue];
  }

  getActionsByPriority(priority: OfflineAction['priority']): OfflineAction[] {
    return this.queue.filter(action => action.priority === priority);
  }

  clearQueue(): void {
    this.queue = [];
    this.saveToStorage();
  }

  getQueueStats() {
    return {
      total: this.queue.length,
      byPriority: {
        critical: this.queue.filter(a => a.priority === 'critical').length,
        high: this.queue.filter(a => a.priority === 'high').length,
        medium: this.queue.filter(a => a.priority === 'medium').length,
        low: this.queue.filter(a => a.priority === 'low').length,
      }
    };
  }
}

// Global offline action queue instance
export const offlineActionQueue = new OfflineActionQueue();

// Error recovery manager
export class ErrorRecoveryManager {
  private state: ErrorRecoveryState = {
    isOnline: navigator.onLine,
    hasOfflineActions: false,
    offlineActionCount: 0,
    lastSyncTime: Date.now(),
    syncStatus: 'synced',
    errorHistory: []
  };

  private listeners: ((state: ErrorRecoveryState) => void)[] = [];

  constructor() {
    this.setupOnlineOfflineListeners();
    this.updateOfflineActionCount();
  }

  private setupOnlineOfflineListeners(): void {
    const handleOnline = () => {
      this.state.isOnline = true;
      this.state.syncStatus = 'syncing';
      this.notifyListeners();
      this.processOfflineQueue();
    };

    const handleOffline = () => {
      this.state.isOnline = false;
      this.state.syncStatus = 'error';
      this.notifyListeners();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }

  private updateOfflineActionCount(): void {
    const actions = offlineActionQueue.getActions();
    this.state.hasOfflineActions = actions.length > 0;
    this.state.offlineActionCount = actions.length;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  addListener(listener: (state: ErrorRecoveryState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  async handleError(error: any, context?: string): Promise<ErrorClassification> {
    const classification = classifyError(error);
    
    // Add to error history
    this.state.errorHistory.push(classification);
    if (this.state.errorHistory.length > 100) {
      this.state.errorHistory.shift();
    }

    // Log error with context
    console.error(`Error in ${context || 'unknown context'}:`, {
      error: classification,
      timestamp: new Date().toISOString(),
      online: this.state.isOnline
    });

    // Handle based on error type
    switch (classification.type) {
      case ErrorType.NETWORK:
      case ErrorType.TIMEOUT:
        if (!this.state.isOnline) {
          this.state.syncStatus = 'error';
        }
        break;
      case ErrorType.AUTHENTICATION:
        // Trigger re-authentication
        this.handleAuthenticationError();
        break;
      case ErrorType.CONFLICT:
        // Handle conflict resolution
        this.handleConflictError(classification);
        break;
    }

    this.notifyListeners();
    return classification;
  }

  private handleAuthenticationError(): void {
    // Implement authentication error handling
    console.warn('Authentication error detected - user may need to re-authenticate');
  }

  private handleConflictError(_classification: ErrorClassification): void {
    // Implement conflict resolution
    console.warn('Conflict detected - may need manual resolution');
  }

  async processOfflineQueue(): Promise<void> {
    if (!this.state.isOnline) return;

    const actions = offlineActionQueue.getActions();
    if (actions.length === 0) return;

    this.state.syncStatus = 'syncing';
    this.notifyListeners();

    const processed: OfflineAction[] = [];
    const failed: OfflineAction[] = [];

    // Process actions by priority
    const priorities: OfflineAction['priority'][] = ['critical', 'high', 'medium', 'low'];
    
    for (const priority of priorities) {
      const priorityActions = offlineActionQueue.getActionsByPriority(priority);
      
      for (const action of priorityActions) {
        try {
          // Simulate processing the action
          // In a real implementation, you would call the appropriate Convex mutation
          console.log('Processing offline action:', action);
          
          // Simulate success
          processed.push(action);
          offlineActionQueue.removeAction(action.id);
        } catch (error) {
          console.error('Failed to process offline action:', error);
          
          if (action.retryCount < 3) {
            action.retryCount++;
            failed.push(action);
          } else {
            // Remove action after max retries
            offlineActionQueue.removeAction(action.id);
          }
        }
      }
    }

    this.state.lastSyncTime = Date.now();
    this.state.syncStatus = failed.length === 0 ? 'synced' : 'error';
    this.updateOfflineActionCount();
    this.notifyListeners();

    if (processed.length > 0) {
      console.log(`Successfully processed ${processed.length} offline actions`);
    }
    
    if (failed.length > 0) {
      console.warn(`${failed.length} actions failed to process and will be retried`);
    }
  }

  getState(): ErrorRecoveryState {
    return { ...this.state };
  }

  addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): string {
    const id = offlineActionQueue.addAction(action);
    this.updateOfflineActionCount();
    this.notifyListeners();
    return id;
  }

  clearErrorHistory(): void {
    this.state.errorHistory = [];
    this.notifyListeners();
  }
}

// Global error recovery manager instance
export const errorRecoveryManager = new ErrorRecoveryManager();

// React hook for using error recovery
export const useErrorRecovery = () => {
  const [state, setState] = React.useState<ErrorRecoveryState>(errorRecoveryManager.getState());

  React.useEffect(() => {
    const unsubscribe = errorRecoveryManager.addListener(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    handleError: errorRecoveryManager.handleError.bind(errorRecoveryManager),
    addOfflineAction: errorRecoveryManager.addOfflineAction.bind(errorRecoveryManager),
    processOfflineQueue: errorRecoveryManager.processOfflineQueue.bind(errorRecoveryManager),
    clearErrorHistory: errorRecoveryManager.clearErrorHistory.bind(errorRecoveryManager),
    retryWithBackoff,
    classifyError
  };
}; 