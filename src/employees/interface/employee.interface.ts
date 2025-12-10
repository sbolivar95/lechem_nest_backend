// src/employees/employees.types.ts
export interface OrgMemberRow {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface OrgMemberUpdateRow {
  id: string;
  role: string;
}
