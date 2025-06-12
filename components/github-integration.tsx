"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GitBranch, UploadCloud, ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react"

export function GitHubIntegration() {
  const [repoUrl, setRepoUrl] = useState("")
  const [isLinking, setIsLinking] = useState(false)
  const [linkStatus, setLinkStatus] = useState<"idle" | "success" | "error">("idle")
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployStatus, setDeployStatus] = useState<"idle" | "success" | "error">("idle")

  const handleLinkRepo = async () => {
    setIsLinking(true)
    setLinkStatus("idle")
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    if (repoUrl.includes("github.com") && repoUrl.length > 0) {
      setLinkStatus("success")
    } else {
      setLinkStatus("error")
    }
    setIsLinking(false)
  }

  const handleDeployToGitHub = async () => {
    setIsDeploying(true)
    setDeployStatus("idle")
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2500))
    // In a real scenario, this would interact with GitHub API
    const success = Math.random() > 0.2 // Simulate occasional failure
    if (success) {
      setDeployStatus("success")
    } else {
      setDeployStatus("error")
    }
    setIsDeploying(false)
  }

  return (
    <Card className="border-slate-800 bg-slate-900/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-purple-400" />
          GitHub Integration
        </CardTitle>
        <CardDescription className="text-slate-300">
          Connect your GitHub repository or deploy your project directly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Link Repository */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-2">Link Existing Repository</h3>
          <div className="flex space-x-2">
            <Input
              placeholder="https://github.com/your-org/your-repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500"
            />
            <Button onClick={handleLinkRepo} disabled={isLinking || !repoUrl.trim()}>
              {isLinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              <span className="ml-2">Link</span>
            </Button>
          </div>
          {linkStatus === "success" && (
            <p className="text-green-500 text-xs mt-2 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" /> Repository linked successfully!
            </p>
          )}
          {linkStatus === "error" && (
            <p className="text-red-500 text-xs mt-2 flex items-center">
              <XCircle className="h-3 w-3 mr-1" /> Failed to link repository. Please check the URL.
            </p>
          )}
        </div>

        {/* Deploy to GitHub */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-2">Deploy New Project to GitHub</h3>
          <Button
            onClick={handleDeployToGitHub}
            disabled={isDeploying}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-900/30"
          >
            {isDeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            <span className="ml-2">Deploy to GitHub</span>
          </Button>
          {deployStatus === "success" && (
            <p className="text-green-500 text-xs mt-2 flex items-center justify-center">
              <CheckCircle className="h-3 w-3 mr-1" /> Project deployed to GitHub!
            </p>
          )}
          {deployStatus === "error" && (
            <p className="text-red-500 text-xs mt-2 flex items-center justify-center">
              <XCircle className="h-3 w-3 mr-1" /> Deployment failed. Please try again.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
