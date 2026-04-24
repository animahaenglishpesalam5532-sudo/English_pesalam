import { GlassHeader } from "@/components/GlassHeader"
import { Footer } from "@/components/Footer"
import { AmbientBackground } from "@/components/AmbientBackground"

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex flex-col" suppressHydrationWarning={true}>
      <AmbientBackground />
      <GlassHeader />
      <div className="flex-1 flex flex-col relative z-10" suppressHydrationWarning={true}>
        {children}
      </div>
      <Footer />
    </div>
  )
}
