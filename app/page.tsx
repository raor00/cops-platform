import { QuotationHeader } from "@/components/quotation/header"
import { QuotationBuilder } from "@/components/quotation/quotation-builder"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <QuotationHeader />
      <main>
        <QuotationBuilder />
      </main>
    </div>
  )
}
