export interface RolePermissionMatrixState {
  [roleId: string]: Record<string, boolean>;
}
