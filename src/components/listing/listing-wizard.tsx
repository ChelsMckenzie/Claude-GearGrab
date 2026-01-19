'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, Loader2, CheckCircle, ImageIcon, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { analyzeGear } from '@/actions/analyze-gear'
import { ITEM_CONDITION, type GearAnalysisResult, type ItemCondition } from '@/types/database'

// ===========================================
// Types & Schema
// ===========================================
const listingFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  category: z.string().min(1, 'Category is required'),
  sub_category: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  retail_price: z.number().min(1, 'Retail price must be greater than 0'),
  discount_percent: z.number().min(0).max(100),
  sale_price: z.number().min(0),
  condition: z.string().min(1, 'Condition is required'),
  product_link: z.string().url().optional().or(z.literal('')),
})

type ListingFormData = z.infer<typeof listingFormSchema>

type WizardStep = 'upload' | 'analyzing' | 'review' | 'success'

// ===========================================
// Component
// ===========================================
export function ListingWizard() {
  const [step, setStep] = useState<WizardStep>('upload')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [removeBackground, setRemoveBackground] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<GearAnalysisResult | null>(null)

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: '',
      brand: '',
      model: '',
      category: '',
      sub_category: '',
      description: '',
      retail_price: 0,
      discount_percent: 0,
      sale_price: 0,
      condition: '',
      product_link: '',
    },
  })

  const { watch, setValue } = form
  const retailPrice = watch('retail_price')
  const discountPercent = watch('discount_percent')

  // Auto-calculate sale price when retail or discount changes
  const calculateSalePrice = useCallback(
    (retail: number, discount: number) => {
      const salePrice = Math.round(retail * (1 - discount / 100))
      setValue('sale_price', salePrice)
    },
    [setValue]
  )

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
  })

  // Handle analyze click
  const handleAnalyze = async () => {
    if (!uploadedFile) return

    setStep('analyzing')

    try {
      // Convert file to base64 for the server action
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(uploadedFile)
      })

      const result = await analyzeGear(base64)

      if (result.data) {
        setAnalysisResult(result.data)

        // Show toast if using fallback mode due to API error
        if (result.error) {
          toast.error('AI Service Busy', {
            description: 'Using manual mode. You can still fill in the details.',
            icon: <AlertCircle className="w-4 h-4" />,
          })
        } else if (!result.isAiGenerated) {
          toast.info('Demo Mode', {
            description: 'Using sample data. Add GEMINI_API_KEY for real AI analysis.',
          })
        }

        // Auto-fill the form
        const title = `${result.data.brand} ${result.data.model}`
        setValue('title', title)
        setValue('brand', result.data.brand)
        setValue('model', result.data.model)
        setValue('category', result.data.category)
        setValue('sub_category', result.data.sub_category)
        setValue('description', result.data.description)
        setValue('retail_price', result.data.retail_price)
        setValue('product_link', result.data.product_link)
        setValue('discount_percent', 0)
        calculateSalePrice(result.data.retail_price, 0)

        setStep('review')
      } else {
        toast.error('Analysis Failed', {
          description: 'Could not analyze the image. Please try again.',
        })
        setStep('upload')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Error', {
        description: 'Something went wrong. Please try again.',
      })
      setStep('upload')
    }
  }

  // Handle discount slider change
  const handleDiscountSliderChange = (value: number[]) => {
    const discount = value[0]
    setValue('discount_percent', discount)
    calculateSalePrice(retailPrice, discount)
  }

  // Handle discount input change
  const handleDiscountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
    setValue('discount_percent', value)
    calculateSalePrice(retailPrice, value)
  }

  // Handle retail price change
  const handleRetailPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    setValue('retail_price', value)
    calculateSalePrice(value, discountPercent)
  }

  // Handle form submit
  const handleSubmit = form.handleSubmit(() => {
    setStep('success')
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {/* Step 1: Upload */}
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Upload Your Gear</h2>
                <p className="text-sm text-muted-foreground">
                  Take a photo or upload an image of your item
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} data-testid="file-input" />
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-muted-foreground">
                        {uploadedFile?.name}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {isDragActive
                            ? 'Drop the image here'
                            : 'Drag & drop an image here'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          or click to select
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remove-bg"
                      checked={removeBackground}
                      onChange={(e) => setRemoveBackground(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="remove-bg" className="text-sm cursor-pointer">
                      Remove Background
                    </Label>
                  </div>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={!uploadedFile}
                  className="w-full"
                  data-testid="analyze-button"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Analyze with AI
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Analyzing */}
        {step === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardContent className="py-16 text-center">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                <h2 className="mt-4 text-xl font-semibold">AI Analyzing...</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Identifying brand, model, and suggesting price
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Review Your Listing</h2>
                <p className="text-sm text-muted-foreground">
                  AI Confidence: {analysisResult?.confidence}%
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      {...form.register('title')}
                      data-testid="title-input"
                    />
                  </div>

                  {/* Brand & Model */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        {...form.register('brand')}
                        data-testid="brand-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        {...form.register('model')}
                        data-testid="model-input"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        {...form.register('category')}
                        data-testid="category-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sub_category">Sub-category</Label>
                      <Input
                        id="sub_category"
                        {...form.register('sub_category')}
                        data-testid="subcategory-input"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      {...form.register('description')}
                      className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                      data-testid="description-input"
                    />
                  </div>

                  {/* Condition */}
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={form.watch('condition')}
                      onValueChange={(value) => setValue('condition', value)}
                    >
                      <SelectTrigger data-testid="condition-select">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ITEM_CONDITION).map((condition) => (
                          <SelectItem
                            key={condition}
                            value={condition}
                            data-testid={`condition-${condition.toLowerCase().replace(' ', '-')}`}
                          >
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pricing Section */}
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-medium">Pricing</h3>

                    {/* Retail Price */}
                    <div className="space-y-2">
                      <Label htmlFor="retail_price">Retail Price (ZAR)</Label>
                      <Input
                        id="retail_price"
                        type="number"
                        value={retailPrice}
                        onChange={handleRetailPriceChange}
                        data-testid="retail-price-input"
                      />
                    </div>

                    {/* Discount */}
                    <div className="space-y-2">
                      <Label htmlFor="discount_percent">Discount (%)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[discountPercent]}
                          onValueChange={handleDiscountSliderChange}
                          max={100}
                          step={1}
                          className="flex-1"
                          data-testid="discount-slider"
                        />
                        <Input
                          id="discount_percent"
                          type="number"
                          min={0}
                          max={100}
                          value={discountPercent}
                          onChange={handleDiscountInputChange}
                          className="w-20"
                          data-testid="discount-input"
                        />
                        <span className="text-sm font-medium w-8" data-testid="discount-value">
                          %
                        </span>
                      </div>
                    </div>

                    {/* Sale Price (Auto-calculated) */}
                    <div className="space-y-2">
                      <Label htmlFor="sale_price">Sale Price (ZAR)</Label>
                      <Input
                        id="sale_price"
                        type="number"
                        value={watch('sale_price')}
                        readOnly
                        className="bg-muted"
                        data-testid="sale-price-input"
                      />
                      <p className="text-xs text-muted-foreground">
                        Auto-calculated: Retail × (1 - Discount%)
                      </p>
                    </div>
                  </div>

                  {/* Product Link */}
                  <div className="space-y-2">
                    <Label htmlFor="product_link">Product Link (optional)</Label>
                    <Input
                      id="product_link"
                      {...form.register('product_link')}
                      placeholder="https://..."
                      data-testid="product-link-input"
                    />
                  </div>

                  <Button type="submit" className="w-full" data-testid="submit-button">
                    Publish Listing
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card>
              <CardContent className="py-16 text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                <h2 className="mt-4 text-xl font-semibold">Listing Published!</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Your gear is now live on the marketplace
                </p>
                <Button
                  onClick={() => {
                    setStep('upload')
                    setUploadedFile(null)
                    setPreviewUrl(null)
                    form.reset()
                  }}
                  variant="outline"
                  className="mt-6"
                  data-testid="list-another-button"
                >
                  List Another Item
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
