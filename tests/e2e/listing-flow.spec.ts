import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Listing Flow', () => {
  test('Complete listing wizard flow with pricing calculations', async ({ page }) => {
    // Navigate to the list page
    await page.goto('/list')

    // Verify we're on the upload step
    await expect(page.getByText('Upload Your Gear')).toBeVisible()

    // Create a test image file and upload it
    const testImagePath = path.join(__dirname, '../fixtures/test-image.png')

    // Set the file input
    const fileInput = page.getByTestId('file-input')
    await fileInput.setInputFiles(testImagePath)

    // Verify file was uploaded (preview should be visible or filename shown)
    await expect(page.getByText('test-image.png')).toBeVisible()

    // Click the Analyze button
    await page.getByTestId('analyze-button').click()

    // Verify we see the analyzing spinner
    await expect(page.getByText('AI Analyzing...')).toBeVisible()

    // Wait for analysis to complete and review step to appear
    await expect(page.getByText('Review Your Listing')).toBeVisible({ timeout: 10000 })

    // Verify retail price is auto-filled with 14000
    const retailPriceInput = page.getByTestId('retail-price-input')
    await expect(retailPriceInput).toHaveValue('14000')

    // Verify sale price is initially 14000 (0% discount)
    const salePriceInput = page.getByTestId('sale-price-input')
    await expect(salePriceInput).toHaveValue('14000')

    // Change discount to 50% using the input field
    const discountInput = page.getByTestId('discount-input')
    await discountInput.clear()
    await discountInput.fill('50')

    // Verify discount input shows 50
    await expect(discountInput).toHaveValue('50')

    // Verify sale price is now 7000 (14000 * 0.5)
    await expect(salePriceInput).toHaveValue('7000')

    // Select condition "Slightly used"
    await page.getByTestId('condition-select').click()
    await page.getByRole('option', { name: 'Slightly used' }).click()

    // Verify brand and model were auto-filled
    await expect(page.getByTestId('brand-input')).toHaveValue('Garmin')
    await expect(page.getByTestId('model-input')).toHaveValue('Fenix 7')

    // Submit the form
    await page.getByTestId('submit-button').click()

    // Verify success screen
    await expect(page.getByText('Listing Published!')).toBeVisible()
    await expect(page.getByText('Your gear is now live on the marketplace')).toBeVisible()
  })

  test('Retail price change recalculates sale price', async ({ page }) => {
    await page.goto('/list')

    // Upload test image
    const testImagePath = path.join(__dirname, '../fixtures/test-image.png')
    await page.getByTestId('file-input').setInputFiles(testImagePath)
    await page.getByTestId('analyze-button').click()

    // Wait for review step
    await expect(page.getByText('Review Your Listing')).toBeVisible({ timeout: 10000 })

    // Set discount to 50%
    const discountInput = page.getByTestId('discount-input')
    await discountInput.clear()
    await discountInput.fill('50')

    // Change retail price to 10000
    const retailPriceInput = page.getByTestId('retail-price-input')
    await retailPriceInput.clear()
    await retailPriceInput.fill('10000')

    // Verify sale price is now 5000 (10000 * 0.5)
    await expect(page.getByTestId('sale-price-input')).toHaveValue('5000')
  })
})
