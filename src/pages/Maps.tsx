import { useAuth } from '@clerk/clerk-react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { MapsList } from '../components/maps/MapsList';
import { MapCreator } from '../components/maps/MapCreator';
import { MapInstanceManager } from '../components/maps/MapInstanceManager';

const MapCreatorWithParams = ({ userId }: { userId: string }) => {
  const { mapId } = useParams();
  return <MapCreator userId={userId} mapId={mapId} />;
};

const MapInstanceWithParams = ({ userId }: { userId: string }) => {
  const { instanceId, mapId } = useParams();
  return <MapInstanceManager userId={userId} mapId={mapId as any} instanceId={instanceId as any} />;
};

export const Maps = () => {
  const { userId, isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<MapsList userId={userId!} />} />
      <Route path="/new" element={<MapCreator userId={userId!} />} />
      <Route path="/:mapId" element={<MapCreatorWithParams userId={userId!} />} />
      <Route path="/:mapId/instance/:instanceId" element={<MapInstanceWithParams userId={userId!} />} />
    </Routes>
  );
}; 