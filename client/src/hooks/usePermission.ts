import { useAuth } from "@/_core/hooks/useAuth";

/**
 * User roles
 */
export enum UserRole {
  ADMIN = "admin",
  VIEWER = "viewer",
}

/**
 * Permission definitions for each role
 */
const ROLE_PERMISSIONS: Record<UserRole, Set<string>> = {
  [UserRole.ADMIN]: new Set([
    // Data management permissions
    "customers:create",
    "customers:read",
    "customers:update",
    "customers:delete",
    "customers:import",
    "customers:export",
    
    "locations:create",
    "locations:read",
    "locations:update",
    "locations:delete",
    "locations:import",
    "locations:export",
    
    "arRecords:create",
    "arRecords:read",
    "arRecords:update",
    "arRecords:delete",
    "arRecords:import",
    "arRecords:export",
    
    "budgets:create",
    "budgets:read",
    "budgets:update",
    "budgets:delete",
    "budgets:import",
    "budgets:export",
    
    // Report permissions
    "reports:view",
    "reports:export",
    
    // Admin permissions
    "admin:access",
    "admin:manageUsers",
    "admin:viewLogs",
  ]),
  
  [UserRole.VIEWER]: new Set([
    // Read-only permissions
    "customers:read",
    "locations:read",
    "arRecords:read",
    "budgets:read",
    
    // Report permissions
    "reports:view",
    "reports:export",
  ]),
};

/**
 * Hook to check user permissions
 */
export function usePermission() {
  const { user } = useAuth();
  
  const userRole = (user?.role as UserRole) || UserRole.VIEWER;
  const permissions = ROLE_PERMISSIONS[userRole] || new Set();
  
  const hasPermission = (permission: string): boolean => {
    return permissions.has(permission);
  };
  
  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some(p => permissions.has(p));
  };
  
  const hasAllPermissions = (perms: string[]): boolean => {
    return perms.every(p => permissions.has(p));
  };
  
  const isAdmin = (): boolean => {
    return userRole === UserRole.ADMIN;
  };
  
  const isViewer = (): boolean => {
    return userRole === UserRole.VIEWER;
  };
  
  return {
    role: userRole,
    permissions: Array.from(permissions),
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isViewer,
  };
}
