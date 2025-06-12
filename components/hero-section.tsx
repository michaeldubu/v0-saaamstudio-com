import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Plus, Rocket } from "lucide-react"

export function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/30 p-8">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative z-10 flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
            <div className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Welcome to the future</div>
            <div className="h-1 w-4 bg-blue-500 rounded-full"></div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            The Evolution of Development
          </h1>

          <p className="text-blue-100 text-lg max-w-3xl relative">
            <span className="absolute -left-6 -top-3 text-5xl text-blue-500 opacity-20">"</span>
            SAAAM.dev combines quantum-inspired algorithms with adaptive intelligence to create software that evolves
            and improves with every interaction. Define your vision and let our system build it.
            <span className="absolute -bottom-4 right-0 text-5xl text-blue-500 opacity-20">"</span>
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-700/30 transition-all hover:shadow-blue-700/50"
            >
              <Plus className="mr-2 h-5 w-5" />
              New Project
              <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">Quantum</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-blue-500/50 text-blue-300 hover:bg-blue-900/20 hover:border-blue-400"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Take Tour
            </Button>
          </div>
        </div>

        <div className="relative w-full max-w-md md:w-1/3">
          <div className="aspect-square relative rounded-xl overflow-hidden shadow-2xl shadow-blue-500/20">
            <Image src="/images/SAAAM-STUDIO-LOGO.png" alt="SAAAM STUDIO" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse-subtle"></div>
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse-subtle"></div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2 animate-pulse-subtle"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2 animate-pulse-subtle"></div>

      {/* Circuit pattern */}
      <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 pointer-events-none">
        <div className="absolute right-12 h-full w-[1px] bg-blue-400"></div>
        <div className="absolute right-12 top-1/3 h-[1px] w-12 bg-blue-400"></div>
        <div className="absolute right-24 top-1/3 h-1/3 w-[1px] bg-blue-400"></div>
        <div className="absolute right-24 top-2/3 h-[1px] w-24 bg-blue-400"></div>
        <div className="absolute right-48 top-2/3 h-1/6 w-[1px] bg-blue-400"></div>
        <div className="absolute right-48 top-2/3 h-[1px] w-12 bg-blue-400"></div>
        <div className="absolute right-48 h-2/3 w-[1px] bg-blue-400"></div>
      </div>
    </div>
  )
}
