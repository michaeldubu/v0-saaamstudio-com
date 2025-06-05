import OpenAI from "openai"
import { OpenAIStream, StreamingTextResponse } from "ai"

// Create an OpenAI API client (that's edge-compatible!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false, // Explicitly disable browser usage
})

// Set the runtime to edge for best performance
export const runtime = "edge"

export async function POST(req: Request): Promise<Response> {
  if (typeof window !== "undefined") {
    return Response.json(
      {
        success: false,
        error: "This API route should only run on the server",
      },
      { status: 500 },
    )
  }

  const { prompt } = await req.json()

  // Ask OpenAI for a streaming completion given the prompt
  const response = await openai.completions.create({
    model: "text-davinci-003",
    stream: true,
    prompt: `Write a blog post about ${prompt}`,
    max_tokens: 200,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  })

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response)
  // Respond with the stream
  return new StreamingTextResponse(stream)
}
