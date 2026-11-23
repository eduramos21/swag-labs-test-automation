// Replaces Playwright's "show-report" hint: points at the Allure report after every run.
export default function globalTeardown(): void {
  if (!process.env.CI) console.log('\nTo open the Allure report run: npm run report\n');
}
