import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('Login page renders correctly', async ({ page }) => {
    await page.goto('/login')

    // Check that the page title is visible
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    await expect(page.getByText('Sign in to your GearGrab account')).toBeVisible()

    // Check that form elements are present
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()

    // Check signup link (the one after "Don't have an account?")
    await expect(page.locator('text=Don\'t have an account? >> a[href="/signup"]')).toBeVisible()
  })

  test('Signup page renders correctly', async ({ page }) => {
    await page.goto('/signup')

    // Check that the page title is visible
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible()
    await expect(page.getByText('Join GearGrab to buy and sell outdoor gear')).toBeVisible()

    // Check that form elements are present
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Phone Number')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()

    // Check login link (the one after "Already have an account?")
    await expect(page.locator('text=Already have an account? >> a[href="/login"]')).toBeVisible()
  })

  test('Can navigate from login to signup', async ({ page }) => {
    await page.goto('/login')
    await page.locator('text=Don\'t have an account? >> a[href="/signup"]').click()
    await expect(page).toHaveURL('/signup')
  })

  test('Can navigate from signup to login', async ({ page }) => {
    await page.goto('/signup')
    await page.locator('text=Already have an account? >> a[href="/login"]').click()
    await expect(page).toHaveURL('/login')
  })
})
