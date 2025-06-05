"use client"

import { useState, useEffect } from "react"
import SaaamLinter from "./SaaamLinter"

/**
 * SAAAM Code Validator Component
 * Integrates the linter with the Monaco editor to provide real-time error checking and suggestions
 */
const SaaamCodeValidator = ({ monacoRef, editorRef, code, fileId }) => {
  const [lintResults, setLintResults] = useState([])
  const [isLinting, setIsLinting] = useState(false)

  // Initialize linter
  const linter = new SaaamLinter({
    enforceLifecycleFunctions: true,
    checkMemoryLeaks: true,
    maxComplexity: 20,
    detectInfiniteLoops: true,
    maxFunctionLength: 100,
    detectUnusedVariables: true,
    checkNamingConventions: true,
  })

  // Run linter when code changes
  useEffect(() => {
    if (!code || !monacoRef.current || !editorRef.current) return

    // Debounce linting to avoid performance issues while typing
    const debounceTime = 500 // ms
    const timeoutId = setTimeout(() => {
      setIsLinting(true)

      try {
        // Run linter
        const results = linter.lint(code, fileId)
        setLintResults(results)

        // Update editor markers
        updateEditorMarkers(results)
      } catch (error) {
        console.error("Error linting code:", error)
      } finally {
        setIsLinting(false)
      }
    }, debounceTime)

    return () => clearTimeout(timeoutId)
  }, [code, fileId, monacoRef, editorRef])

  // Update editor markers when lint results change
  const updateEditorMarkers = (results) => {
    if (!monacoRef.current || !editorRef.current) return

    const monaco = monacoRef.current
    const model = editorRef.current.getModel()

    if (!model) return

    // Convert lint results to Monaco markers
    const markers = results.map((issue) => ({
      severity: getSeverity(issue.severity, monaco),
      startLineNumber: issue.line,
      startColumn: issue.column,
      endLineNumber: issue.line,
      endColumn: issue.column + 10, // Approximate length of the issue
      message: issue.message,
      source: "SAAAM Linter",
    }))

    // Set markers on the model
    monaco.editor.setModelMarkers(model, "saaam-linter", markers)
  }

  // Convert severity string to Monaco severity constant
  const getSeverity = (severity, monaco) => {
    switch (severity) {
      case "error":
        return monaco.MarkerSeverity.Error
      case "warning":
        return monaco.MarkerSeverity.Warning
      case "info":
        return monaco.MarkerSeverity.Info
      default:
        return monaco.MarkerSeverity.Hint
    }
  }

  // This is a helper component - it doesn't render anything visible
  return null
}

export default SaaamCodeValidator
