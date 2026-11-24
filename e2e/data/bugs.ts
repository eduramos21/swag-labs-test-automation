// BUG tags only for problem_user, the user with the seeded bugs.
export const bugTags = (user: string, ...ids: string[]) =>
  user === "problem_user" ? ids.map((id) => `@${id}`) : [];
