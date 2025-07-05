import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Custom hook for managing navigation state and scroll position restoration
 * @returns Object with navigation functions and state management
 */
export const useNavigationState = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollPositionRef = useRef<number>(0);

  // Save scroll position before navigation
  const saveScrollPosition = () => {
    scrollPositionRef.current = window.scrollY;
  };

  // Restore scroll position after navigation
  const restoreScrollPosition = () => {
    if (scrollPositionRef.current > 0) {
      window.scrollTo(0, scrollPositionRef.current);
    }
  };

  // Navigate to a detail page while saving current state
  const navigateToDetail = (path: string) => {
    saveScrollPosition();
    navigate(path);
  };

  // Navigate back to campaign with state restoration
  const navigateBackToCampaign = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
  };

  // Restore scroll position when component mounts
  useEffect(() => {
    restoreScrollPosition();
  }, [location.pathname]);

  return {
    navigateToDetail,
    navigateBackToCampaign,
    saveScrollPosition,
    restoreScrollPosition,
  };
}; 