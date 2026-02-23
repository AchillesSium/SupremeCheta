// frontend/src/hooks/useRole.js
import { useAuth } from '../providers/AuthProvider';
import { hasRole as checkRole } from '../utils/tokenManager';

/**
 * Custom hook for role-based rendering and access control
 * @returns {Object} Role utilities
 */
export const useRole = () => {
  const { user } = useAuth();

  /**
   * Check if user has required role
   * @param {string|string[]} requiredRole - Role(s) to check
   * @returns {boolean} True if user has required role
   */
  const hasRole = (requiredRole) => {
    return checkRole(requiredRole);
  };

  // Convenience booleans for common role checks
  const isAdmin = hasRole('admin');
  const isVendor = hasRole(['vendor', 'admin']);
  const isUser = hasRole(['user', 'vendor', 'admin']);

  return {
    role: user?.role || 'guest',
    hasRole,
    isAdmin,
    isVendor,
    isUser
  };
};

export default useRole;
