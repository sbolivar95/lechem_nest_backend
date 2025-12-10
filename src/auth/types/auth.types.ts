// auth/auth.types.ts
export interface UserRow {
  id: number;
  email: string;
  full_name: string;
  password_hash: string;
}

export interface OrgRow {
  id: number;
  org_name: string;
}

export interface OrgMemberRow {
  id?: number; // only when selected
  org_id: number;
  role: string;
}
