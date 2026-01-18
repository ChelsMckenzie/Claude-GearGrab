import { test, expect } from '@playwright/test'

test.describe('Trust & Safety', () => {
  test('KYC: Profile verify button triggers verification and shows badge', async ({ page }) => {
    // Navigate to profile page
    await page.goto('/profile')

    // Verify profile name is visible
    await expect(page.getByTestId('profile-name')).toHaveText('John Buyer')

    // Initially should not be verified (no badge)
    await expect(page.getByTestId('verified-badge')).not.toBeVisible()

    // Click verify button
    const verifyButton = page.getByTestId('verify-button')
    await expect(verifyButton).toBeVisible()
    await expect(verifyButton).toHaveText(/Verify Identity/)

    await verifyButton.click()

    // Button should show loading state
    await expect(verifyButton).toHaveText(/Verifying/)

    // Wait for verification to complete (2 second mock delay)
    await expect(page.getByTestId('verified-badge')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('verified-badge')).toHaveText(/Verified/)

    // Verify button should be gone, replaced with success message
    await expect(verifyButton).not.toBeVisible()
    await expect(page.getByText('Your identity has been verified')).toBeVisible()
  })

  test('Escrow: Buy Securely redirects to escrow page with Funds Secured status', async ({
    page,
  }) => {
    // Navigate to a listing detail page
    await page.goto('/listings/listing-1')

    // Verify listing detail page loaded
    await expect(page.getByTestId('listing-detail-title')).toHaveText('Trail Running Shoes')

    // Verify the seller is shown with verified badge (listing-1 has verified seller)
    await expect(page.getByTestId('seller-name')).toHaveText('Sarah Seller')
    await expect(page.getByTestId('verified-seller-badge')).toBeVisible()
    await expect(page.getByTestId('verified-seller-badge')).toHaveText(/Verified/)

    // Click Buy Securely button
    const buyButton = page.getByTestId('buy-securely-button')
    await expect(buyButton).toBeVisible()
    await expect(buyButton).toHaveText(/Buy Securely/)

    await buyButton.click()

    // Should navigate to escrow page
    await expect(page).toHaveURL(/\/escrow\//)

    // Verify escrow page shows correct info
    await expect(page.getByTestId('escrow-title')).toHaveText('Secure Transaction')

    // Should show Funds Secured status
    await expect(page.getByTestId('funds-secured-text')).toBeVisible()
    await expect(page.getByTestId('funds-secured-text')).toHaveText(/Funds Secured/)

    // Transaction amount should be visible
    await expect(page.getByTestId('escrow-amount')).toContainText('1')

    // Trust timeline should be visible with current step
    await expect(page.getByTestId('trust-timeline')).toBeVisible()
    await expect(page.getByTestId('timeline-step-funds_secured')).toBeVisible()
  })

  test('Listing detail shows verified seller badge for verified sellers', async ({ page }) => {
    // Listing 1 has verified seller (Sarah Seller)
    await page.goto('/listings/listing-1')

    await expect(page.getByTestId('seller-name')).toHaveText('Sarah Seller')
    await expect(page.getByTestId('verified-seller-badge')).toBeVisible()
  })

  test('Listing detail does not show verified badge for unverified sellers', async ({ page }) => {
    // Listing 2 has unverified seller (Mike Mountain)
    await page.goto('/listings/listing-2')

    await expect(page.getByTestId('seller-name')).toHaveText('Mike Mountain')
    await expect(page.getByTestId('verified-seller-badge')).not.toBeVisible()
  })
})
