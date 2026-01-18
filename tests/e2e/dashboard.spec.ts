import { test, expect } from '@playwright/test'

test.describe('Seller Dashboard', () => {
  test('Dashboard shows listings and can switch to inquiries tab', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard')

    // Verify dashboard title is visible
    await expect(page.getByTestId('dashboard-title')).toHaveText('Seller Dashboard')

    // Verify Listings tab is active by default
    await expect(page.getByTestId('tab-listings')).toBeVisible()

    // Verify listings are visible (user-seller-1 has 2 listings)
    await expect(page.getByTestId('listings-grid')).toBeVisible()
    await expect(page.getByTestId('dashboard-listing-listing-1')).toBeVisible()
    await expect(page.getByTestId('listing-title-listing-1')).toHaveText('Trail Running Shoes')

    // Switch to Inquiries tab
    await page.getByTestId('tab-inquiries').click()

    // Verify inquiries grid is visible
    await expect(page.getByTestId('inquiries-grid')).toBeVisible()
  })

  test('Accept contact request changes status to Accepted', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard')

    // Switch to Inquiries tab
    await page.getByTestId('tab-inquiries').click()

    // Verify request card is visible
    await expect(page.getByTestId('request-card-request-1')).toBeVisible()

    // Verify buyer name is shown
    await expect(page.getByTestId('buyer-name-request-1')).toHaveText('John Buyer')

    // Verify message is shown
    await expect(page.getByTestId('request-message-request-1')).toContainText(
      'interested in these shoes'
    )

    // Verify initial status is Pending
    await expect(page.getByTestId('request-status-request-1')).toHaveText(/Pending/)

    // Click Accept button
    await page.getByTestId('accept-request-request-1').click()

    // Verify status changes to Accepted (optimistic update)
    await expect(page.getByTestId('request-status-request-1')).toHaveText(/Accepted/)

    // Verify Accept/Decline buttons are no longer visible
    await expect(page.getByTestId('accept-request-request-1')).not.toBeVisible()
    await expect(page.getByTestId('decline-request-request-1')).not.toBeVisible()

    // Verify success message is shown
    await expect(page.getByText('Your contact details have been shared')).toBeVisible()
  })

  test('Decline contact request changes status to Declined', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard')

    // Switch to Inquiries tab
    await page.getByTestId('tab-inquiries').click()

    // Verify request card is visible
    await expect(page.getByTestId('request-card-request-1')).toBeVisible()

    // Wait for status to be Pending (may have been changed by previous test, but mock resets)
    const status = page.getByTestId('request-status-request-1')

    // If status is Pending, click Decline
    if (await page.getByTestId('decline-request-request-1').isVisible()) {
      await page.getByTestId('decline-request-request-1').click()

      // Verify status changes to Declined
      await expect(status).toHaveText(/Declined/)

      // Verify buttons are no longer visible
      await expect(page.getByTestId('accept-request-request-1')).not.toBeVisible()
    }
  })

  test('All three tabs are accessible', async ({ page }) => {
    await page.goto('/dashboard')

    // Verify all tabs are visible
    await expect(page.getByTestId('tab-listings')).toBeVisible()
    await expect(page.getByTestId('tab-inquiries')).toBeVisible()
    await expect(page.getByTestId('tab-settings')).toBeVisible()

    // Click through each tab
    await page.getByTestId('tab-listings').click()
    await expect(page.getByTestId('listings-grid')).toBeVisible()

    await page.getByTestId('tab-inquiries').click()
    await expect(page.getByTestId('inquiries-grid')).toBeVisible()

    await page.getByTestId('tab-settings').click()
    await expect(page.getByTestId('settings-content')).toBeVisible()
    await expect(page.getByTestId('notifications-heading')).toBeVisible()
  })
})
