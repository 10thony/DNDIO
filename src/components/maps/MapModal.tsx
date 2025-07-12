import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { MapTab } from './MapTab';
import { Id } from '../../../convex/_generated/dataModel';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  campaignId?: Id<"campaigns">;
  interactionId?: Id<"interactions">;
  onMapInstanceSelected?: (instanceId: Id<"mapInstances">) => void;
}

export const MapModal: React.FC<MapModalProps> = ({
  isOpen,
  onClose,
  userId,
  campaignId,
  interactionId,
  onMapInstanceSelected
}) => {
  const handleMapInstanceSelected = (instanceId: Id<"mapInstances">) => {
    if (onMapInstanceSelected) {
      onMapInstanceSelected(instanceId);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Map Management</DialogTitle>
        </DialogHeader>
        <MapTab
          userId={userId}
          campaignId={campaignId}
          interactionId={interactionId}
          onMapInstanceSelected={handleMapInstanceSelected}
        />
      </DialogContent>
    </Dialog>
  );
}; 