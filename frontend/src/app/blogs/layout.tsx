import { GlassHeader } from "@/components/GlassHeader"
import { Footer } from "@/components/Footer"

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#EAF0F6] min-h-screen flex flex-col" suppressHydrationWarning={true}>
      <GlassHeader />
      <div className="flex-1 flex flex-col" suppressHydrationWarning={true}>
        {children}
      </div>
      <Footer />
    </div>
  )
}
