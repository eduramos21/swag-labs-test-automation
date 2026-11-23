import path from 'node:path';
import { requireEnv } from './env';

export type Role = 'standard_user' | 'problem_user' | 'locked_out_user';

const envVar: Record<Role, string> = {
  standard_user: 'STANDARD_USER',
  problem_user: 'PROBLEM_USER',
  locked_out_user: 'LOCKED_OUT_USER',
};

export const authFile = (role: Role): string => path.join(__dirname, '..', '.auth', `${role}.json`);

export const usernameOf = (role: Role): string => requireEnv(envVar[role]);
export const password = (): string => requireEnv('PASSWORD');
