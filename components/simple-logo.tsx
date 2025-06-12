export function SAAAMLogo({ size = "medium", showVersion = true, showTagline = true }) {
  // Define size classes for different logo sizes
  const sizeClasses = {
    small: {
      container: "w-8 h-8",
      font: "text-sm",
      badge: "ml-1 text-[8px]",
      tagline: "text-[8px]",
      aiIndicator: "w-3 h-3 text-[6px] -bottom-0.5 -right-0.5",
    },
    medium: {
      container: "w-12 h-12",
      font: "text-2xl",
      badge: "ml-2 text-xs",
      tagline: "text-xs",
      aiIndicator: "w-5 h-5 text-[8px] -bottom-1 -right-1",
    },
    large: {
      container: "w-16 h-16",
      font: "text-3xl",
      badge: "ml-2 text-sm",
      tagline: "text-sm",
      aiIndicator: "w-6 h-6 text-[10px] -bottom-1 -right-1",
    },
  }

  const classes = sizeClasses[size]

  return (
    <div className="flex items-center">
      <div className={`relative ${classes.container}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-400 rounded-xl shadow-lg shadow-blue-500/20 overflow-hidden flex items-center justify-center">
          
        </div>
        <div
          className={`absolute ${classes.aiIndicator} bg-blue-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-900`}
        >
          AI
        </div>
      </div>
      <div>
        <div className="font-bold text-white tracking-wide flex items-center">SAAAMSTUDIO.COM</div>
        {showTagline && (
          <div className={`${classes.tagline} text-blue-300`}>Synergistic Autonomous Adaptive Machines</div>
        )}
      </div>
    </div>
  )
}
