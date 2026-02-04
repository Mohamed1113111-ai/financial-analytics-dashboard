import { TRPCError } from "@trpc/server";

/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = "admin",
  VIEWER = "viewer",
}

/**
 * Permission definitions for each role
 */
export const ROLE_PERMISSIONS: Record<UserRole, Set<string>> = {
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
 * Check if a user has a specific permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.has(permission) ?? false;
}

/**
 * Check if a user has any of the given permissions
 */
export function hasAnyPermission(role: UserRole, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a user has all of the given permissions
 */
export function hasAllPermissions(role: UserRole, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Throw an error if user doesn't have the required permission
 */
export function requirePermission(role: UserRole, permission: string): void {
  if (!hasPermission(role, permission)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `You do not have permission to perform this action: ${permission}`,
    });
  }
}

/**
 * Throw an error if user doesn't have any of the given permissions
 */
export function requireAnyPermission(role: UserRole, permissions: string[]): void {
  if (!hasAnyPermission(role, permissions)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `You do not have permission to perform this action`,
    });
  }
}

/**
 * Throw an error if user doesn't have all of the given permissions
 */
export function requireAllPermissions(role: UserRole, permissions: string[]): void {
  if (!hasAllPermissions(role, permissions)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `You do not have permission to perform this action`,
    });
  }
}

/**
 * Get the display name for a role
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Administrator",
    [UserRole.VIEWER]: "Viewer",
  };
  return names[role] || role;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): string[] {
  return Array.from(ROLE_PERMISSIONS[role] || []);
}

/**
 * Check if a role is admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

/**
 * Check if a role is viewer
 */
export function isViewer(role: UserRole): boolean {
  return role === UserRole.VIEWER;
}
