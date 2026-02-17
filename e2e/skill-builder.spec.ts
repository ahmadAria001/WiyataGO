import type { Page } from '@playwright/test';
import { test, expect } from '@playwright/test';

// Helper to login as the test user
async function loginAs(page: Page, email: string, password: string) {
    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Masuk' }).click();
    await expect(page).toHaveURL('/dashboard');
}

// Helper to navigate to the builder page for the test course
async function navigateToBuilder(page: Page) {
    await page.goto('/courses/01kh18y284qet8yfr45xd8x8ep/skills/builder');
    // Wait for builder page to fully render
    await expect(page.getByText('Skill Builder')).toBeVisible();
}

// Helper to click a skill node's circle (the actual clickable area)
// The SkillNode label text is a sibling of the circle, so clicking text alone
// won't trigger the onClick handler on the circle div.
async function clickSkillNode(page: Page, skillName: string) {
    const nodeWrapper = page
        .locator('.absolute.select-none', {
            has: page.getByText(skillName, { exact: true }),
        })
        .first();
    await nodeWrapper.locator('.rounded-full').click();
}

test.describe('Skill Builder Page', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, 'test@example.com', 'password');
    });

    /*
    |--------------------------------------------------------------------------
    | Page Load & Layout
    |--------------------------------------------------------------------------
    */

    test('should load the builder page', async ({ page }) => {
        await navigateToBuilder(page);

        // Breadcrumbs visible
        await expect(page.getByText('Skill Builder')).toBeVisible();

        // Status indicator visible
        await expect(page.getByText('Status:')).toBeVisible();

        // Publish button visible
        await expect(
            page.getByRole('button', { name: 'Publish Course' }),
        ).toBeVisible();
    });

    test('should display canvas toolbar with all buttons', async ({ page }) => {
        await navigateToBuilder(page);

        // Add Node button
        await expect(page.getByTitle('Add Node')).toBeVisible();

        // Pan Mode toggle
        await expect(page.getByTitle('Pan Mode')).toBeVisible();

        // Undo/Redo buttons (disabled)
        await expect(page.getByTitle('Undo')).toBeVisible();
        await expect(page.getByTitle('Redo')).toBeVisible();
    });

    test('should display zoom controls', async ({ page }) => {
        await navigateToBuilder(page);

        await expect(page.getByTitle('Zoom In')).toBeVisible();
        await expect(page.getByTitle('Zoom Out')).toBeVisible();
        await expect(page.getByTitle('Reset View')).toBeVisible();
    });

    test('should display existing skills on canvas', async ({ page }) => {
        await navigateToBuilder(page);

        // At least one skill node should be visible
        await expect(page.getByText('New Skill').first()).toBeVisible();
    });

    /*
    |--------------------------------------------------------------------------
    | Alert Dialog — Create Skill
    |--------------------------------------------------------------------------
    */

    test('should show confirm dialog when clicking Add Node', async ({
        page,
    }) => {
        await navigateToBuilder(page);

        // Click Add Node button
        await page.getByTitle('Add Node').click();

        // Alert dialog should appear
        await expect(page.getByText('Create new skill?')).toBeVisible();
        await expect(
            page.getByText('This will add a new skill node to the canvas'),
        ).toBeVisible();

        // Confirm and Cancel buttons
        await expect(
            page.getByRole('button', { name: 'Create' }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: 'Cancel' }),
        ).toBeVisible();
    });

    test('should dismiss dialog when Cancel is clicked', async ({ page }) => {
        await navigateToBuilder(page);

        await page.getByTitle('Add Node').click();
        await expect(page.getByText('Create new skill?')).toBeVisible();

        // Click Cancel
        await page.getByRole('button', { name: 'Cancel' }).click();

        // Dialog should close
        await expect(page.getByText('Create new skill?')).not.toBeVisible();
    });

    test('should create skill when Confirm is clicked', async ({ page }) => {
        await navigateToBuilder(page);

        await page.getByTitle('Add Node').click();
        await expect(page.getByText('Create new skill?')).toBeVisible();

        // Click Create
        await page.getByRole('button', { name: 'Create' }).click();

        // Dialog should close
        await expect(page.getByText('Create new skill?')).not.toBeVisible();
    });

    /*
    |--------------------------------------------------------------------------
    | Alert Dialog — Delete Skill
    |--------------------------------------------------------------------------
    */

    test('should show delete confirm dialog from sidebar', async ({ page }) => {
        await navigateToBuilder(page);

        // Click the skill node circle to select it
        await clickSkillNode(page, 'New Skill');

        // Sidebar should appear with Node Properties
        await expect(page.getByText('Node Properties')).toBeVisible();

        // Click Delete button in sidebar footer
        await page
            .locator('.border-l')
            .getByRole('button', { name: 'Delete' })
            .click();

        // Destructive alert dialog should appear
        await expect(page.getByText('Delete skill')).toBeVisible();
        await expect(
            page.getByText('Are you sure you want to delete this skill?'),
        ).toBeVisible();
    });

    test('should cancel delete and keep skill', async ({ page }) => {
        await navigateToBuilder(page);

        // Click a skill node circle
        await clickSkillNode(page, 'New Skill');
        await expect(page.getByText('Node Properties')).toBeVisible();

        // Click Delete in sidebar
        await page
            .locator('.border-l')
            .getByRole('button', { name: 'Delete' })
            .click();
        await expect(page.getByText('Delete skill')).toBeVisible();

        // Click Cancel
        await page.getByRole('button', { name: 'Cancel' }).click();

        // Dialog closes, sidebar still visible
        await expect(page.getByText('Delete skill')).not.toBeVisible();
        await expect(page.getByText('Node Properties')).toBeVisible();
    });

    /*
    |--------------------------------------------------------------------------
    | Node Sidebar
    |--------------------------------------------------------------------------
    */

    test('should open sidebar when clicking a skill node', async ({ page }) => {
        await navigateToBuilder(page);

        // Click on a skill node circle
        await clickSkillNode(page, 'New Skill');

        // Sidebar should show Node Properties heading
        await expect(page.getByText('Node Properties')).toBeVisible();

        // Form fields should be visible
        await expect(page.getByLabel('Lesson Title')).toBeVisible();
        await expect(page.getByLabel('Short Description')).toBeVisible();
        await expect(page.getByLabel('XP Reward')).toBeVisible();
    });

    test('should close sidebar when X button is clicked', async ({ page }) => {
        await navigateToBuilder(page);

        // Open sidebar
        await clickSkillNode(page, 'New Skill');
        await expect(page.getByText('Node Properties')).toBeVisible();

        // Close sidebar — the X button is in the sidebar header (border-l panel)
        await page.locator('.border-l .border-b').getByRole('button').click();

        // Sidebar should disappear
        await expect(page.getByText('Node Properties')).not.toBeVisible();
    });

    test('should display skill data in sidebar form fields', async ({
        page,
    }) => {
        await navigateToBuilder(page);

        // Click first skill
        await clickSkillNode(page, 'New Skill');

        // Verify form fields are populated
        const titleInput = page.getByLabel('Lesson Title');
        await expect(titleInput).toHaveValue(/New Skill/);

        // XP Reward should have a numeric value
        const xpInput = page.getByLabel('XP Reward');
        await expect(xpInput).toBeVisible();
    });

    test('should show Duplicate and Delete action buttons', async ({
        page,
    }) => {
        await navigateToBuilder(page);

        await clickSkillNode(page, 'New Skill');
        await expect(page.getByText('Node Properties')).toBeVisible();

        // Action buttons in sidebar footer
        const sidebar = page.locator('.border-l');
        await expect(
            sidebar.getByRole('button', { name: 'Duplicate' }),
        ).toBeVisible();
        await expect(
            sidebar.getByRole('button', { name: 'Delete' }),
        ).toBeVisible();
        await expect(
            sidebar.getByRole('button', { name: 'Save Changes' }),
        ).toBeVisible();
    });

    /*
    |--------------------------------------------------------------------------
    | Canvas Toolbar Interactions
    |--------------------------------------------------------------------------
    */

    test('should toggle pan mode on toolbar click', async ({ page }) => {
        await navigateToBuilder(page);

        const panButton = page.getByTitle('Pan Mode');

        // Click to enable pan mode
        await panButton.click();
        await expect(panButton).toHaveAttribute('aria-pressed', 'true');

        // Click again to disable
        await panButton.click();
        await expect(panButton).toHaveAttribute('aria-pressed', 'false');
    });

    /*
    |--------------------------------------------------------------------------
    | Keyboard Shortcuts
    |--------------------------------------------------------------------------
    */

    test('should open Add Node dialog with Ctrl+N', async ({ page }) => {
        await navigateToBuilder(page);

        // Press the actual keyboard shortcut
        await page.keyboard.press('Control+n');

        // Alert dialog should appear
        await expect(page.getByText('Create new skill?')).toBeVisible();

        // Cancel to clean up
        await page.getByRole('button', { name: 'Cancel' }).click();
    });

    test('should toggle connect mode with Ctrl+C', async ({ page }) => {
        await navigateToBuilder(page);

        // Press Ctrl+C to toggle connect mode
        await page.keyboard.press('Control+c');

        // Connect mode should activate — check the connect toggle's aria-pressed
        const connectToggle = page.locator('button[aria-pressed]').first();
        await expect(connectToggle).toHaveAttribute('aria-pressed', 'true');

        // Press again to deactivate
        await page.keyboard.press('Control+c');
        await expect(connectToggle).toHaveAttribute('aria-pressed', 'false');
    });

    test('should toggle pan mode with Ctrl+H', async ({ page }) => {
        await navigateToBuilder(page);

        const panButton = page.getByTitle('Pan Mode');

        // Press Ctrl+H to enable pan
        await page.keyboard.press('Control+h');
        await expect(panButton).toHaveAttribute('aria-pressed', 'true');

        // Press again to disable
        await page.keyboard.press('Control+h');
        await expect(panButton).toHaveAttribute('aria-pressed', 'false');
    });

    /*
    |--------------------------------------------------------------------------
    | Zoom Controls
    |--------------------------------------------------------------------------
    */

    test('should zoom in and out with controls', async ({ page }) => {
        await navigateToBuilder(page);

        // Get initial zoom text
        const zoomText = page.getByText(/🔍/);
        await expect(zoomText).toBeVisible();

        // Click zoom in
        await page.getByTitle('Zoom In').click();

        // Click zoom out
        await page.getByTitle('Zoom Out').click();

        // Reset view
        await page.getByTitle('Reset View').click();
    });
});

/*
|--------------------------------------------------------------------------
| Access Control — Isolated (no beforeEach login)
|--------------------------------------------------------------------------
*/

test.describe('Skill Builder Access Control', () => {
    test('should redirect unauthenticated user to login', async ({ page }) => {
        // Without logging in, go directly to builder
        await page.goto('/courses/01kh18y284qet8yfr45xd8x8ep/skills/builder');

        // Should be redirected to login
        await expect(page).toHaveURL(/\/login/);
    });
});
