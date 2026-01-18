import { ListingWizard } from '@/components/listing/listing-wizard'

export default function ListPage() {
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">List Your Gear</h1>
          <p className="text-muted-foreground mt-2">
            Upload a photo and let AI do the rest
          </p>
        </div>
        <ListingWizard />
      </div>
    </main>
  )
}
