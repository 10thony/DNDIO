// Conflict Resolution System for Live Interactions

import React from 'react';
import { Id } from '../../convex/_generated/dataModel';

// Conflict types
export enum ConflictType {
  STATUS_UPDATE = 'STATUS_UPDATE',
  INITIATIVE_CHANGE = 'INITIATIVE_CHANGE',
  PARTICIPANT_ADD = 'PARTICIPANT_ADD',
  PARTICIPANT_REMOVE = 'PARTICIPANT_REMOVE',
  ACTION_SUBMISSION = 'ACTION_SUBMISSION',
  ACTION_RESOLUTION = 'ACTION_RESOLUTION',
  CUSTOM = 'CUSTOM'
}

// Conflict severity levels
export enum ConflictSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Conflict interface
export interface Conflict {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  interactionId: Id<"interactions">;
  serverState: any;
  clientState: any;
  timestamp: number;
  description: string;
  autoResolvable: boolean;
  resolved: boolean;
  resolution?: ConflictResolution;
}

// Conflict resolution interface
export interface ConflictResolution {
  method: 'server' | 'client' | 'merge' | 'manual';
  timestamp: number;
  userId?: string;
  notes?: string;
  mergedState?: any;
}

// Merge strategy interface
export interface MergeStrategy {
  name: string;
  description: string;
  canMerge: (serverState: any, clientState: any) => boolean;
  merge: (serverState: any, clientState: any) => any;
  priority: number;
}

// Conflict detection result
export interface ConflictDetectionResult {
  hasConflict: boolean;
  conflicts: Conflict[];
  autoResolved: Conflict[];
  requiresManualResolution: Conflict[];
}

// Conflict resolution manager
export class ConflictResolutionManager {
  private conflicts: Map<string, Conflict> = new Map();
  private mergeStrategies: Map<ConflictType, MergeStrategy[]> = new Map();
  private auditLog: Array<{ timestamp: number; action: string; details: any }> = [];

  constructor() {
    this.initializeMergeStrategies();
  }

  private initializeMergeStrategies(): void {
    // Status update merge strategy
    const statusMergeStrategy: MergeStrategy = {
      name: 'Status Update Merge',
      description: 'Merges status updates by taking the most recent non-completed status',
      canMerge: (serverState, clientState) => {
        return serverState.status && clientState.status && 
               serverState.status !== 'COMPLETED' && clientState.status !== 'COMPLETED';
      },
      merge: (serverState, clientState) => {
        const serverTime = serverState.updatedAt || 0;
        const clientTime = clientState.updatedAt || 0;
        
        return {
          ...serverState,
          status: serverTime > clientTime ? serverState.status : clientState.status,
          updatedAt: Math.max(serverTime, clientTime)
        };
      },
      priority: 1
    };

    // Initiative change merge strategy
    const initiativeMergeStrategy: MergeStrategy = {
      name: 'Initiative Change Merge',
      description: 'Merges initiative changes by taking the most recent valid initiative order',
      canMerge: (serverState, clientState) => {
        return serverState.initiativeOrder && clientState.initiativeOrder;
      },
      merge: (serverState, clientState) => {
        const serverTime = serverState.updatedAt || 0;
        const clientTime = clientState.updatedAt || 0;
        
        return {
          ...serverState,
          initiativeOrder: serverTime > clientTime ? serverState.initiativeOrder : clientState.initiativeOrder,
          currentInitiativeIndex: serverTime > clientTime ? serverState.currentInitiativeIndex : clientState.currentInitiativeIndex,
          updatedAt: Math.max(serverTime, clientTime)
        };
      },
      priority: 2
    };

    // Participant merge strategy
    const participantMergeStrategy: MergeStrategy = {
      name: 'Participant Merge',
      description: 'Merges participant changes by combining unique participants',
      canMerge: (serverState, clientState) => {
        return (serverState.participantPlayerCharacterIds || serverState.participantNpcIds || serverState.participantMonsterIds) &&
               (clientState.participantPlayerCharacterIds || clientState.participantNpcIds || clientState.participantMonsterIds);
      },
      merge: (serverState, clientState) => {
        const mergeArrays = (server: any[] = [], client: any[] = []) => {
          const combined = [...new Set([...server, ...client])];
          return combined;
        };

        return {
          ...serverState,
          participantPlayerCharacterIds: mergeArrays(serverState.participantPlayerCharacterIds, clientState.participantPlayerCharacterIds),
          participantNpcIds: mergeArrays(serverState.participantNpcIds, clientState.participantNpcIds),
          participantMonsterIds: mergeArrays(serverState.participantMonsterIds, clientState.participantMonsterIds),
          updatedAt: Date.now()
        };
      },
      priority: 3
    };

    // Register merge strategies
    this.registerMergeStrategy(ConflictType.STATUS_UPDATE, statusMergeStrategy);
    this.registerMergeStrategy(ConflictType.INITIATIVE_CHANGE, initiativeMergeStrategy);
    this.registerMergeStrategy(ConflictType.PARTICIPANT_ADD, participantMergeStrategy);
    this.registerMergeStrategy(ConflictType.PARTICIPANT_REMOVE, participantMergeStrategy);
  }

  registerMergeStrategy(conflictType: ConflictType, strategy: MergeStrategy): void {
    if (!this.mergeStrategies.has(conflictType)) {
      this.mergeStrategies.set(conflictType, []);
    }
    this.mergeStrategies.get(conflictType)!.push(strategy);
    
    // Sort by priority
    this.mergeStrategies.get(conflictType)!.sort((a, b) => a.priority - b.priority);
  }

  detectConflict(
    interactionId: Id<"interactions">,
    serverState: any,
    clientState: any,
    type: ConflictType
  ): ConflictDetectionResult {
    const conflicts: Conflict[] = [];
    const autoResolved: Conflict[] = [];
    const requiresManualResolution: Conflict[] = [];

    // Check if there's a version conflict
    const serverVersion = serverState.updatedAt || 0;
    const clientVersion = clientState.updatedAt || 0;

    if (serverVersion !== clientVersion) {
      const conflict: Conflict = {
        id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        severity: this.determineConflictSeverity(type, serverState, clientState),
        interactionId,
        serverState,
        clientState,
        timestamp: Date.now(),
        description: this.generateConflictDescription(type, serverState, clientState),
        autoResolvable: this.canAutoResolve(type, serverState, clientState),
        resolved: false
      };

      // Try to auto-resolve if possible
      if (conflict.autoResolvable) {
        const resolution = this.autoResolveConflict(conflict);
        if (resolution) {
          conflict.resolved = true;
          conflict.resolution = resolution;
          autoResolved.push(conflict);
        } else {
          requiresManualResolution.push(conflict);
        }
      } else {
        requiresManualResolution.push(conflict);
      }

      conflicts.push(conflict);
      this.conflicts.set(conflict.id, conflict);
      this.logAuditEvent('CONFLICT_DETECTED', { conflictId: conflict.id, type, autoResolvable: conflict.autoResolvable });
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
      autoResolved,
      requiresManualResolution
    };
  }

  private determineConflictSeverity(type: ConflictType, serverState: any, clientState: any): ConflictSeverity {
    switch (type) {
      case ConflictType.STATUS_UPDATE:
        // Status conflicts are medium severity unless they involve completion
        if (serverState.status === 'COMPLETED' || clientState.status === 'COMPLETED') {
          return ConflictSeverity.HIGH;
        }
        return ConflictSeverity.MEDIUM;

      case ConflictType.INITIATIVE_CHANGE:
        // Initiative conflicts are high severity as they affect turn order
        return ConflictSeverity.HIGH;

      case ConflictType.PARTICIPANT_ADD:
      case ConflictType.PARTICIPANT_REMOVE:
        // Participant conflicts are medium severity
        return ConflictSeverity.MEDIUM;

      case ConflictType.ACTION_SUBMISSION:
      case ConflictType.ACTION_RESOLUTION:
        // Action conflicts are low severity as they can be re-submitted
        return ConflictSeverity.LOW;

      default:
        return ConflictSeverity.MEDIUM;
    }
  }

  private generateConflictDescription(type: ConflictType, serverState: any, clientState: any): string {
    switch (type) {
      case ConflictType.STATUS_UPDATE:
        return `Status conflict: Server has "${serverState.status}", Client has "${clientState.status}"`;

      case ConflictType.INITIATIVE_CHANGE:
        return `Initiative conflict: Server turn index ${serverState.currentInitiativeIndex}, Client turn index ${clientState.currentInitiativeIndex}`;

      case ConflictType.PARTICIPANT_ADD:
        return `Participant conflict: Different participant lists detected`;

      case ConflictType.PARTICIPANT_REMOVE:
        return `Participant removal conflict: Different participant lists detected`;

      case ConflictType.ACTION_SUBMISSION:
        return `Action submission conflict: Multiple actions submitted simultaneously`;

      case ConflictType.ACTION_RESOLUTION:
        return `Action resolution conflict: Action resolved differently`;

      default:
        return `Unknown conflict type: ${type}`;
    }
  }

  private canAutoResolve(type: ConflictType, serverState: any, clientState: any): boolean {
    const strategies = this.mergeStrategies.get(type);
    if (!strategies) return false;

    return strategies.some(strategy => strategy.canMerge(serverState, clientState));
  }

  private autoResolveConflict(conflict: Conflict): ConflictResolution | null {
    const strategies = this.mergeStrategies.get(conflict.type);
    if (!strategies) return null;

    for (const strategy of strategies) {
      if (strategy.canMerge(conflict.serverState, conflict.clientState)) {
        try {
          const mergedState = strategy.merge(conflict.serverState, conflict.clientState);
          
          const resolution: ConflictResolution = {
            method: 'merge',
            timestamp: Date.now(),
            notes: `Auto-resolved using ${strategy.name}`,
            mergedState
          };

          this.logAuditEvent('CONFLICT_AUTO_RESOLVED', {
            conflictId: conflict.id,
            strategy: strategy.name,
            resolution
          });

          return resolution;
        } catch (error) {
          console.error('Error auto-resolving conflict:', error);
          return null;
        }
      }
    }

    return null;
  }

  resolveConflict(
    conflictId: string,
    method: 'server' | 'client' | 'merge' | 'manual',
    userId?: string,
    notes?: string
  ): boolean {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict || conflict.resolved) return false;

    let mergedState: any = null;

    switch (method) {
      case 'server':
        mergedState = conflict.serverState;
        break;
      case 'client':
        mergedState = conflict.clientState;
        break;
      case 'merge':
        const resolution = this.autoResolveConflict(conflict);
        if (resolution) {
          mergedState = resolution.mergedState;
        } else {
          return false;
        }
        break;
      case 'manual':
        // Manual resolution requires external input
        mergedState = null;
        break;
    }

    const resolution: ConflictResolution = {
      method,
      timestamp: Date.now(),
      userId,
      notes,
      mergedState
    };

    conflict.resolved = true;
    conflict.resolution = resolution;

    this.logAuditEvent('CONFLICT_RESOLVED', {
      conflictId,
      method,
      userId,
      notes
    });

    return true;
  }

  getConflict(conflictId: string): Conflict | undefined {
    return this.conflicts.get(conflictId);
  }

  getActiveConflicts(interactionId?: Id<"interactions">): Conflict[] {
    const conflicts = Array.from(this.conflicts.values());
    return conflicts.filter(conflict => 
      !conflict.resolved && 
      (!interactionId || conflict.interactionId === interactionId)
    );
  }

  getResolvedConflicts(interactionId?: Id<"interactions">): Conflict[] {
    const conflicts = Array.from(this.conflicts.values());
    return conflicts.filter(conflict => 
      conflict.resolved && 
      (!interactionId || conflict.interactionId === interactionId)
    );
  }

  clearResolvedConflicts(): void {
    const resolvedIds = Array.from(this.conflicts.entries())
      .filter(([_, conflict]) => conflict.resolved)
      .map(([id, _]) => id);

    resolvedIds.forEach(id => this.conflicts.delete(id));
    this.logAuditEvent('RESOLVED_CONFLICTS_CLEARED', { count: resolvedIds.length });
  }

  private logAuditEvent(action: string, details: any): void {
    this.auditLog.push({
      timestamp: Date.now(),
      action,
      details
    });

    // Keep only last 1000 audit events
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }
  }

  getAuditLog(limit: number = 100): Array<{ timestamp: number; action: string; details: any }> {
    return this.auditLog.slice(-limit);
  }

  getConflictStats(): {
    total: number;
    resolved: number;
    active: number;
    byType: Record<ConflictType, number>;
    bySeverity: Record<ConflictSeverity, number>;
  } {
    const conflicts = Array.from(this.conflicts.values());
    
    const byType: Record<ConflictType, number> = {} as any;
    const bySeverity: Record<ConflictSeverity, number> = {} as any;

    conflicts.forEach(conflict => {
      byType[conflict.type] = (byType[conflict.type] || 0) + 1;
      bySeverity[conflict.severity] = (bySeverity[conflict.severity] || 0) + 1;
    });

    return {
      total: conflicts.length,
      resolved: conflicts.filter(c => c.resolved).length,
      active: conflicts.filter(c => !c.resolved).length,
      byType,
      bySeverity
    };
  }
}

// Global conflict resolution manager instance
export const conflictResolutionManager = new ConflictResolutionManager();

// Utility functions for common conflict scenarios
export const createStatusConflict = (
  interactionId: Id<"interactions">,
  serverState: any,
  clientState: any
): ConflictDetectionResult => {
  return conflictResolutionManager.detectConflict(
    interactionId,
    serverState,
    clientState,
    ConflictType.STATUS_UPDATE
  );
};

export const createInitiativeConflict = (
  interactionId: Id<"interactions">,
  serverState: any,
  clientState: any
): ConflictDetectionResult => {
  return conflictResolutionManager.detectConflict(
    interactionId,
    serverState,
    clientState,
    ConflictType.INITIATIVE_CHANGE
  );
};

export const createParticipantConflict = (
  interactionId: Id<"interactions">,
  serverState: any,
  clientState: any,
  type: ConflictType.PARTICIPANT_ADD | ConflictType.PARTICIPANT_REMOVE
): ConflictDetectionResult => {
  return conflictResolutionManager.detectConflict(
    interactionId,
    serverState,
    clientState,
    type
  );
};

// React hook for using conflict resolution
export const useConflictResolution = () => {
  const [activeConflicts, setActiveConflicts] = React.useState<Conflict[]>([]);
  const [stats, setStats] = React.useState(conflictResolutionManager.getConflictStats());

  React.useEffect(() => {
    const updateConflicts = () => {
      setActiveConflicts(conflictResolutionManager.getActiveConflicts());
      setStats(conflictResolutionManager.getConflictStats());
    };

    // Update conflicts every 5 seconds
    const interval = setInterval(updateConflicts, 5000);
    updateConflicts(); // Initial update

    return () => clearInterval(interval);
  }, []);

  return {
    activeConflicts,
    stats,
    resolveConflict: conflictResolutionManager.resolveConflict.bind(conflictResolutionManager),
    getConflict: conflictResolutionManager.getConflict.bind(conflictResolutionManager),
    clearResolvedConflicts: conflictResolutionManager.clearResolvedConflicts.bind(conflictResolutionManager),
    getAuditLog: conflictResolutionManager.getAuditLog.bind(conflictResolutionManager),
    createStatusConflict,
    createInitiativeConflict,
    createParticipantConflict
  };
}; 