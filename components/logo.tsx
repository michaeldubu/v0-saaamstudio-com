import Image from "next/image"

interface LogoProps {
  size?: "small" | "medium" | "large"
  showVersion?: boolean
  showTagline?: boolean
}

export function SAAAMLogo({ size = "medium", showVersion = true, showTagline = true }: LogoProps) {
  const sizeClasses = {
    small: {
      container: "w-16 h-16", // Adjusted for new logo aspect ratio
      tagline: "text-[8px]",
    },
    medium: {
      container: "w-24 h-24", // Adjusted for new logo aspect ratio
      tagline: "text-xs",
    },
    large: {
      container: "w-32 h-32", // Adjusted for new logo aspect ratio
      tagline: "text-sm",
    },
  }

  const classes = sizeClasses[size]

  return (
    <div className="flex items-center">
      <div className={`relative ${classes.container} overflow-hidden rounded-lg`}>
        <Image
          src="/images/saaam-studio-logo-full.png"
          alt="SAAAM Studio Full Logo"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="ml-3">
        <div className="font-bold text-white tracking-wide flex items-center">
          SAAAM Studio
          {showVersion && (
            <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full text-blue-300">Alpha</span>
          )}
        </div>
        {showTagline && (
          <div className={`${classes.tagline} text-blue-300`}>Synergistic Autonomous Adaptive Machines</div>
        )}
      </div>
    </div>
  )
}
