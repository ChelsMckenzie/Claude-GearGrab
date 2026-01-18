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
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()

    // Check signup link
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible()
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

    // Check login link
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible()
  })

  test('Can navigate from login to signup', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Sign up' }).click()
    await expect(page).toHaveURL('/signup')
  })

  test('Can navigate from signup to login', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('link', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/login')
  })
})
