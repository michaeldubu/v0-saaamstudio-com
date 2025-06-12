import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface LogoProps {
  size?: "small" | "medium" | "large"
  showVersion?: boolean
  showTagline?: boolean
}

export function SAAAMLogo({ size = "medium", showVersion = true, showTagline = true }: LogoProps) {
  const sizeClasses = {
    small: {
      container: "w-10 h-10",
      badge: "ml-1 text-[8px]",
      tagline: "text-[8px]",
    },
    medium: {
      container: "w-14 h-14",
      badge: "ml-2 text-xs",
      tagline: "text-xs",
    },
    large: {
      container: "w-20 h-20",
      badge: "ml-2 text-sm",
      tagline: "text-sm",
    },
  }

  const classes = sizeClasses[size]

  return (
    <div className="flex items-center">
      <div className={`relative ${classes.container} overflow-hidden rounded-lg`}>
        <Image src="/images/SAAAM-STUDIO-LOGO.png" alt="SAAAM STUDIO" fill className="object-cover" priority />
      </div>
      <div className="ml-3">
        <div className="font-bold text-white tracking-wide flex items-center">
          SAAAMSTUDIO.COM
          {showVersion && (
            <Badge variant="outline" className={`${classes.badge} border-blue-400 text-blue-300`}>
              Alpha
            </Badge>
          )}
        </div>
        {showTagline && (
          <div className={`${classes.tagline} text-blue-300`}>Synergistic Autonomous Adaptive Machines</div>
        )}
      </div>
    </div>
  )
}
