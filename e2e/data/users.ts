import path from "node:path";
import { requireEnv } from "./env";

// Add a user here and in envVar below; the runner, setup and tag check pick it up.
export const roles = [
  "standard_user",
  "problem_user",
  "locked_out_user",
  "performance_glitch_user",
  "error_user",
  "visual_user",
] as const;
export type Role = (typeof roles)[number];
// locked_out_user cannot log in, so it has no saved session.
export const sessionRoles = roles.filter((r) => r !== "locked_out_user");

const envVar: Record<Role, string> = {
  standard_user: "STANDARD_USER",
  problem_user: "PROBLEM_USER",
  locked_out_user: "LOCKED_OUT_USER",
  performance_glitch_user: "PERFORMANCE_GLITCH_USER",
  error_user: "ERROR_USER",
  visual_user: "VISUAL_USER",
};

export const authFile = (role: Role): string =>
  path.join(__dirname, "..", ".auth", `${role}.json`);

export const usernameOf = (role: Role): string => requireEnv(envVar[role]);
export const password = (): string => requireEnv("PASSWORD");
