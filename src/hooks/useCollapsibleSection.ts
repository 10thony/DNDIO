import { useState, useEffect } from 'react';

/**
 * Custom hook for managing collapsible section states with persistence
 * @param sectionId - Unique identifier for the section
 * @param defaultCollapsed - Whether the section should be collapsed by default
 * @returns Object with isCollapsed state and toggle function
 */
export const useCollapsibleSection = (
  sectionId: string, 
  defaultCollapsed: boolean = false
) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Try to get saved state from sessionStorage
    const saved = sessionStorage.getItem(`section-collapsed-${sectionId}`);
    return saved !== null ? JSON.parse(saved) : defaultCollapsed;
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev: boolean) => !prev);
  };

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem(`section-collapsed-${sectionId}`, JSON.stringify(isCollapsed));
  }, [isCollapsed, sectionId]);

  return {
    isCollapsed,
    toggleCollapsed,
  };
}; 