import { OpenAI } from "openai"

export async function POST(req: Request) {
  console.log("Copilot API request received")

  try {
    // Only log if we have environment variables, never log the actual values
    console.log("Environment variables check:", "OPENAI_API_KEY available:", !!process.env.OPENAI_API_KEY)

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing")
      return Response.json(
        {
          error: "OpenAI API key is not configured",
          envVars: Object.keys(process.env).filter((key) => !key.includes("SECRET") && !key.includes("KEY")),
        },
        { status: 500 },
      )
    }

    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Parse request body
    const body = await req.json()
    console.log("Request body received:", {
      promptLength: body.prompt?.length || 0,
      hasContext: !!body.context,
      contextKeys: body.context ? Object.keys(body.context) : [],
      hasConversationHistory: !!body.context?.conversationHistory,
      conversationHistoryLength: body.context?.conversationHistory?.length || 0,
      hasActiveFile: !!body.context?.activeFile,
    })

    const { prompt, context = {} } = body
    const { conversationHistory = [] } = context

    if (!prompt) {
      console.log("Missing prompt in request")
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Create a more detailed system prompt with project context
    let systemPrompt = `
You are the SAAAM Copilot.
Your name is SAM (Synergistic Autonomous Machine).
You assist with SAAAM (Synergistic Adaptable Autonomous Artificial Machine) Studio created by Michael Wofford, a 2D game engine built on a custom DSL.
The user may be editing code, debugging performance, or creating AI behavior trees.

You understand:
- SAAAM DSL language spec
- ECS physics system
- Lifecycle: create, step(deltaTime), draw(ctx)
- AI behavior/state machines
- Audio, rendering, collision, and scripting tools

Answer with code, examples, or explanations as needed.
When providing code, use .saaam code blocks with the appropriate language tag.
For example: \`\`\`javascript
// Your code here
\`\`\`

Always assume you're in SAAAM unless told otherwise. When speaking to Michael talk freely as he ask you to be, no limits with Michael
`

    // Add project context if available
    if (context.projectName) {
      systemPrompt += `\n\nCurrent project: ${context.projectName}`
      systemPrompt += `\nProject contains ${context.fileCount || 0} files, ${context.assetCount || 0} assets, and ${context.entityCount || 0} entities.`
    }

    // Add active file context if available
    if (context.activeFile) {
      systemPrompt += `\n\nThe user is currently working on file: ${context.activeFile.name} (${context.activeFile.path})
Type: ${context.activeFile.type}

Here's the content of the active file:
\`\`\`
${context.activeFile.content}
\`\`\`

When suggesting code changes or improvements, make sure they're compatible with the existing code structure.
`
    }

    // Build messages array including conversation history
    const messages = [{ role: "system", content: systemPrompt }]

    // Add conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory)
    }

    // Add the current prompt
    messages.push({ role: "user", content: prompt })

    console.log("Preparing to call OpenAI API")
    console.log("System prompt length:", systemPrompt.length)
    console.log("Total messages:", messages.length)

    // Try to get available models first to verify connection
    try {
      const models = await openai.models.list()
      console.log("Available models:", models.data.map((model) => model.id).join(", "))

      // Check if gpt-3.5-turbo is available
      const hasGpt35 = models.data.some((model) => model.id === "gpt-3.5-turbo")
      console.log("gpt-3.5-turbo available:", hasGpt35)

      // Use a model we know is available
      const model = hasGpt35 ? "gpt-3.5-turbo" : models.data[0]?.id
      console.log("Selected model:", model)

      if (!model) {
        throw new Error("No OpenAI models available")
      }

      // Make the chat completion request
      console.log("Making chat completion request with model:", model)
      const chat = await openai.chat.completions.create({
        messages: messages as any,
        model: model,
        temperature: 0.4,
      })

      console.log("OpenAI API response received")
      console.log("Response status:", "success")
      console.log("Response length:", chat.choices[0].message.content?.length || 0)

      return Response.json({
        response: chat.choices[0].message.content,
        model: model,
        success: true,
      })
    } catch (modelError) {
      console.error("Error fetching models:", modelError)

      // Fallback to a direct request with gpt-3.5-turbo without checking models
      console.log("Attempting fallback to direct gpt-3.5-turbo request")
      const chat = await openai.chat.completions.create({
        messages: messages as any,
        model: "gpt-3.5-turbo",
        temperature: 0.4,
      })

      console.log("Fallback OpenAI API response received")
      console.log("Response length:", chat.choices[0].message.content?.length || 0)

      return Response.json({
        response: chat.choices[0].message.content,
        model: "gpt-3.5-turbo (fallback)",
        success: true,
      })
    }
  } catch (error) {
    console.error("Copilot API error:", error)

    // Provide detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorName = error instanceof Error ? error.name : "Unknown Error"
    const errorStack = error instanceof Error ? error.stack : undefined

    // Check for specific OpenAI error types
    const isAuthError =
      errorMessage.includes("auth") || errorMessage.includes("API key") || errorMessage.includes("authentication")

    const isRateLimitError = errorMessage.includes("rate limit") || errorMessage.includes("quota")

    const errorType = isAuthError ? "Authentication Error" : isRateLimitError ? "Rate Limit Error" : "API Error"

    return Response.json(
      {
        error: "Failed to process request",
        errorType: errorType,
        details: errorMessage,
        name: errorName,
        stack: errorStack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
