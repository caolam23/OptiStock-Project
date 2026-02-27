/**
 * Workspace API Client
 * Handles all workspace-related API calls
 */

import axiosClient from './axiosClient';

/**
 * Get all workspaces for the current user
 * @returns {Promise<Array>} Array of workspace objects
 */
export const getMyWorkspaces = async () => {
  try {
    const response = await axiosClient.get('/v1/workspaces/my-workspaces');
    return response.data;
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    throw error;
  }
};

/**
 * Get a specific workspace by ID
 * @param {string} tenantId - Workspace/Tenant ID
 * @returns {Promise<Object>} Workspace object
 */
export const getWorkspaceById = async (tenantId) => {
  try {
    const response = await axiosClient.get(`/v1/workspaces/${tenantId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workspace:', error);
    throw error;
  }
};

/**
 * Search workspaces by name or industry
 * @param {string} query - Search query
 * @param {Array} workspaces - Array of workspaces to search in
 * @returns {Array} Filtered workspaces
 */
export const searchWorkspaces = (query, workspaces) => {
  const searchLower = query.toLowerCase();
  return workspaces.filter((workspace) => {
    return (
      workspace.name.toLowerCase().includes(searchLower) ||
      workspace.industryCode.toLowerCase().includes(searchLower)
    );
  });
};

/**
 * Sort workspaces by last accessed time (descending)
 * @param {Array} workspaces - Array of workspaces
 * @returns {Array} Sorted workspaces
 */
export const sortWorkspacesByAccess = (workspaces) => {
  return [...workspaces].sort((a, b) => {
    const aTime = a.lastAccessed ? new Date(a.lastAccessed) : new Date(0);
    const bTime = b.lastAccessed ? new Date(b.lastAccessed) : new Date(0);
    return bTime - aTime;
  });
};

/**
 * Format time difference for display
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted time
 */
export const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'Chưa truy cập';

  const now = new Date();
  const then = new Date(timestamp); // Backend now outputs "2026-02-27T15:01:00+07:00" — parsed correctly
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return 'Cách đây lâu';
};
