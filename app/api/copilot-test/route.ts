import { OpenAI } from "openai"

export async function GET() {
  try {
    console.log("Testing OpenAI API connection...")
    console.log("API Key available:", !!process.env.OPENAI_API_KEY)

    // Just log if the API key exists, never log any part of the key
    console.log("API Key available:", !!process.env.OPENAI_API_KEY)

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          success: false,
          error: "API key is missing",
          envVars: Object.keys(process.env).filter((key) => !key.includes("SECRET") && !key.includes("KEY")),
        },
        { status: 500 },
      )
    }

    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Make a simple API call to test the connection
    const models = await openai.models.list()

    return Response.json({
      success: true,
      message: "OpenAI API connection successful",
      availableModels: models.data.map((model) => model.id),
    })
  } catch (error) {
    console.error("OpenAI API test error:", error)

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        type: error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 },
    )
  }
}

