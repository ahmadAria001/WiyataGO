import type { Page } from '@playwright/test';
import { test, expect } from '@playwright/test';

// Helper to login as a user
async function loginAs(page: Page, email: string, password: string) {
    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Masuk' }).click();
    await expect(page).toHaveURL('/dashboard');
}

test.describe('Course CRUD', () => {
    // Note: These tests require a seeded user in the database
    // Run: php artisan db:seed before running E2E tests

    test.beforeEach(async ({ page }) => {
        // Login before each test - adjust credentials as needed
        await loginAs(page, 'test@example.com', 'password');
    });

    test('should display courses index page', async ({ page }) => {
        await page.goto('/courses');

        await expect(page.getByRole('heading', { name: 'My Courses' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Create Course' })).toBeVisible();
    });

    test('should navigate to create course page', async ({ page }) => {
        await page.goto('/courses');

        await page.getByRole('link', { name: 'Create Course' }).click();

        await expect(page).toHaveURL('/courses/create');
        await expect(page.getByRole('heading', { name: 'Create Course' })).toBeVisible();
    });

    test('should create a new course', async ({ page }) => {
        await page.goto('/courses/create');

        // Fill the form
        await page.getByLabel('Course Name').fill('E2E Test Course');
        await page.getByLabel('Description').fill('This course was created by Playwright E2E test');

        // Submit
        await page.getByRole('button', { name: 'Create Course' }).click();

        // Should redirect to course detail page
        await expect(page.getByRole('heading', { name: 'E2E Test Course' })).toBeVisible();
        await expect(page.getByText('This course was created by Playwright E2E test')).toBeVisible();
    });

    test('should edit a course', async ({ page }) => {
        // First create a course
        await page.goto('/courses/create');
        await page.getByLabel('Course Name').fill('Course to Edit');
        await page.getByLabel('Description').fill('Original description');
        await page.getByRole('button', { name: 'Create Course' }).click();

        // Wait for redirect to show page
        await expect(page.getByRole('heading', { name: 'Course to Edit' })).toBeVisible();

        // Click edit button
        await page.getByRole('link', { name: 'Edit' }).click();

        await expect(page).toHaveURL(/\/courses\/.*\/edit/);

        // Update the form
        await page.getByLabel('Course Name').fill('Updated Course Name');
        await page.getByLabel('Description').fill('Updated description');
        await page.getByRole('button', { name: 'Save Changes' }).click();

        // Should redirect back to show page with updated content
        await expect(page.getByRole('heading', { name: 'Updated Course Name' })).toBeVisible();
        await expect(page.getByText('Updated description')).toBeVisible();
    });

    test('should delete a course', async ({ page }) => {
        // First create a course
        await page.goto('/courses/create');
        await page.getByLabel('Course Name').fill('Course to Delete');
        await page.getByLabel('Description').fill('This will be deleted');
        await page.getByRole('button', { name: 'Create Course' }).click();

        await expect(page.getByRole('heading', { name: 'Course to Delete' })).toBeVisible();

        // Handle the confirmation dialog
        page.on('dialog', dialog => dialog.accept());

        // Click delete button
        await page.getByRole('button', { name: 'Delete' }).click();

        // Should redirect to courses index
        await expect(page).toHaveURL('/courses');

        // The deleted course should not be visible
        await expect(page.getByText('Course to Delete')).not.toBeVisible();
    });

    test('should show validation errors for empty course name', async ({ page }) => {
        await page.goto('/courses/create');

        // Try to submit with empty name
        await page.getByRole('button', { name: 'Create Course' }).click();

        // HTML5 validation should prevent submission or show error
        // The exact behavior depends on implementation
        await expect(page.getByLabel('Course Name')).toBeFocused();
    });
});
