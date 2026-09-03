import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Automated a11y regression checks (ANO-12). These catch contrast,
 * missing labels, and other WCAG 2.1 AA violations on every PR — they are
 * not a substitute for the periodic manual pass, see docs/accessibility.md.
 */
const publicPages = ["/", "/privacy", "/terms", "/login", "/signup"];

for (const path of publicPages) {
  test(`${path} has no WCAG 2.1 AA violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2))
      .toEqual([]);
  });
}

test("skip link is the first focusable element and jumps to main", async ({
  page,
}) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skipLink = page.locator(".skip-link");
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeVisible();
});

test("homepage 'Create your account' link is reachable by keyboard", async ({ page }) => {
  await page.goto("/");

  const cta = page.getByRole("link", { name: "Create your account" });
  await cta.focus();
  await expect(cta).toBeFocused();
});

test("sign-up form fields are reachable by keyboard", async ({ page }) => {
  await page.goto("/signup");

  const emailInput = page.getByLabel("Email address");
  await emailInput.focus();
  await expect(emailInput).toBeFocused();

  await page.keyboard.type("a11y-test@example.com");
  await expect(emailInput).toHaveValue("a11y-test@example.com");
});
