import { useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export const useCampaignAccess = (campaign: any) => {
  const { user } = useUser();
  
  // Get user role from Convex (synced from Clerk)
  const userRole = useQuery(api.users.getUserRole, 
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  const isAdmin = userRole === "admin";
  const isDM = campaign?.dmId === user?.id; // dmId stores Clerk ID
  const canEdit = isAdmin || isDM;
  const canAdd = isAdmin || isDM;
  const canUnlink = isAdmin || isDM;
  const canDelete = isAdmin; // Only admins can delete campaigns
  
  return {
    isDM,
    isAdmin,
    canEdit,
    canAdd,
    canUnlink,
    canDelete
  };
}; 