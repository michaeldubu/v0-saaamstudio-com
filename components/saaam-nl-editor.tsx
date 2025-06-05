"use client"

// File: src/components/nl-editor.tsx

import type React from "react"
import { useState } from "react"

import { SaaamEngine } from "../Saaam-engine" // Adjust path if needed

const NLEditor: React.FC = () => {
  const [input, setInput] = useState("")

  const [response, setResponse] = useState("")

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    try {
      setLoading(true)

      setResponse("Processing...")

      // 🔥 Call NLP Engine

      const result = await SaaamEngine.samNLP.processUserInput(input)

      setResponse(JSON.stringify(result, null, 2))
    } catch (err: any) {
      setResponse(`Error: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a natural language command..."
          style={styles.textarea}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Processing..." : "Send to SAM"}
        </button>
      </form>

      <pre style={styles.response}>{response}</pre>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 20,

    background: "#111",

    color: "#0f0",

    fontFamily: "monospace",

    borderRadius: 8,

    maxWidth: 800,

    margin: "40px auto",
  },

  form: {
    display: "flex",

    flexDirection: "column",

    gap: 10,
  },

  textarea: {
    minHeight: 100,

    padding: 10,

    background: "#222",

    color: "#0f0",

    border: "1px solid #0f0",

    borderRadius: 4,
  },

  button: {
    padding: "10px 20px",

    background: "#0f0",

    color: "#111",

    fontWeight: "bold",

    border: "none",

    borderRadius: 4,

    cursor: "pointer",
  },

  response: {
    marginTop: 20,

    background: "#000",

    padding: 10,

    border: "1px solid #0f0",

    borderRadius: 4,

    whiteSpace: "pre-wrap",
  },
}

export default NLEditor
