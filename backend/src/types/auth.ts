export type AuthUser = { id: string; email: string; status: string; roles: string[]; permissions: string[] };
export type AuthRole = { role: { name: string; permissions: { permission: { key: string } }[] } };
