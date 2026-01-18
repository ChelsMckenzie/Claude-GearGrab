import { test, expect } from '@playwright/test'

test.describe('Marketplace', () => {
  test('Browse page shows listings and filters work', async ({ page }) => {
    // Navigate to browse page
    await page.goto('/browse')

    // Verify page title
    await expect(page.getByRole('heading', { name: 'Browse Gear' })).toBeVisible()

    // Verify listings grid is visible
    await expect(page.getByTestId('listings-grid')).toBeVisible()

    // Verify we can see multiple listings (should have 3 mock listings)
    const listingCards = page.locator('[data-testid^="listing-card-"]')
    await expect(listingCards).toHaveCount(3)

    // Verify filter sidebar is visible
    await expect(page.getByTestId('filter-sidebar')).toBeVisible()
  })

  test('Filter by category shows only matching listings', async ({ page }) => {
    await page.goto('/browse')

    // Initially should show all 3 listings
    let listingCards = page.locator('[data-testid^="listing-card-"]')
    await expect(listingCards).toHaveCount(3)

    // Click on Hiking category filter
    await page.getByTestId('category-filter-hiking').click()

    // Wait for URL to update
    await expect(page).toHaveURL(/category=Hiking/)

    // Should now show only 2 Hiking listings
    listingCards = page.locator('[data-testid^="listing-card-"]')
    await expect(listingCards).toHaveCount(2)

    // Verify visible listings are Hiking category
    await expect(page.getByTestId('category-badge-listing-1')).toHaveText('Hiking')
    await expect(page.getByTestId('category-badge-listing-3')).toHaveText('Hiking')
  })

  test('Click listing navigates to detail page', async ({ page }) => {
    await page.goto('/browse')

    // Click on first listing
    await page.getByTestId('listing-card-listing-1').click()

    // Verify we're on the detail page
    await expect(page).toHaveURL('/listings/listing-1')

    // Verify listing details are shown
    await expect(page.getByTestId('listing-detail-title')).toHaveText('Trail Running Shoes')
    await expect(page.getByTestId('listing-brand-model')).toHaveText('Salomon Speedcross 5')
    await expect(page.getByTestId('listing-detail-category')).toHaveText('Hiking')
  })

  test('Request contact changes button to Pending', async ({ page }) => {
    await page.goto('/listings/listing-1')

    // Verify listing detail page loaded
    await expect(page.getByTestId('listing-detail-title')).toBeVisible()

    // Verify Request Contact button is visible
    const requestButton = page.getByTestId('request-contact-button')
    await expect(requestButton).toBeVisible()
    await expect(requestButton).toHaveText(/Request Contact/)

    // Click Request Contact button
    await requestButton.click()

    // Dialog should open
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Send Contact Request')).toBeVisible()

    // Enter a message
    await page.getByTestId('contact-message-input').fill('Hi, I am interested in this item!')

    // Click Send Request
    await page.getByTestId('send-request-button').click()

    // Wait for dialog to close and button to change to Pending
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByTestId('pending-button')).toBeVisible()
    await expect(page.getByTestId('pending-button')).toHaveText(/Request Pending/)
  })

  test('Listing detail shows correct price and condition', async ({ page }) => {
    await page.goto('/listings/listing-2')

    // Verify title
    await expect(page.getByTestId('listing-detail-title')).toHaveText('Mountain Bike')

    // Verify price is shown
    await expect(page.getByTestId('listing-detail-price')).toContainText('15')

    // Verify condition badge
    await expect(page.getByTestId('detail-condition-badge')).toHaveText('Slightly used')

    // Verify category
    await expect(page.getByTestId('listing-detail-category')).toHaveText('Cycling')
  })

  test('Clear filters button works', async ({ page }) => {
    await page.goto('/browse?category=Hiking')

    // Should show 2 Hiking listings
    let listingCards = page.locator('[data-testid^="listing-card-"]')
    await expect(listingCards).toHaveCount(2)

    // Clear filters button should be visible
    await expect(page.getByTestId('clear-filters')).toBeVisible()

    // Click clear filters
    await page.getByTestId('clear-filters').click()

    // Wait for URL to be clean
    await expect(page).toHaveURL('/browse')

    // Should show all 3 listings again
    listingCards = page.locator('[data-testid^="listing-card-"]')
    await expect(listingCards).toHaveCount(3)
  })
})
