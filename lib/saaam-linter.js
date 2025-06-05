/**
 * SAAAM Language Linter
 * Provides code analysis, error checking, and best practice suggestions for SAAAM language
 */

class SaaamLinter {
  constructor(options = {}) {
    this.options = {
      enforceLifecycleFunctions: true, // Require create/step/draw functions
      checkMemoryLeaks: true, // Check for potential memory leaks
      maxComplexity: 20, // Maximum cyclomatic complexity
      detectInfiniteLoops: true, // Detect potential infinite loops
      maxFunctionLength: 100, // Maximum lines per function
      detectUnusedVariables: true, // Find unused variables
      checkNamingConventions: true, // Check variable/function naming conventions
      ...options,
    }

    // SAAAM language reserved keywords
    this.keywords = [
      "create",
      "step",
      "draw",
      "on_collision",
      "keyboard_check",
      "keyboard_check_pressed",
      "draw_sprite",
      "vec2",
      "vec3",
      "find_nearest",
      "check_collision",
      "play_sound",
      "create_effect",
      "wait",
      "destroy",
      "restart_level",
      "point_distance",
      "sin",
      "cos",
      "floor",
      "sprite_get_number",
      "current_time",
      "draw_sprite_ext",
      "draw_set_alpha",
      "draw_set_color",
      "draw_circle",
      "draw_line",
      "draw_health_bar",
      "vk_left",
      "vk_right",
      "vk_up",
      "vk_down",
      "vk_space",
      "vk_enter",
      "vk_escape",
      "vk_shift",
      "vk_control",
      "vk_alt",
      "if",
      "else",
      "for",
      "while",
      "do",
      "switch",
      "case",
      "default",
      "break",
      "continue",
      "return",
      "function",
      "var",
      "const",
      "let",
      "this",
      "new",
      "delete",
      "typeof",
      "instanceof",
      "void",
      "yield",
      "await",
      "true",
      "false",
      "null",
      "undefined",
    ]

    // SAAAM built-in objects and properties
    this.builtIns = [
      "position",
      "velocity",
      "sprite",
      "image_index",
      "image_speed",
      "image_xscale",
      "image_yscale",
      "rotation",
      "health",
      "max_health",
      "tag",
      "debug_mode",
      "console",
      "Math",
      "Object",
      "Array",
      "String",
      "Number",
      "Boolean",
      "Date",
    ]
  }

  /**
   * Lint SAAAM code and return issues
   * @param {string} code - SAAAM code to lint
   * @param {string} filename - Name of the file being linted
   * @returns {Array} Array of lint issues
   */
  lint(code, filename = "unknown") {
    const issues = []

    try {
      // Basic syntax check
      this._validateSyntax(code, issues)

      // Check for lifecycle functions
      if (this.options.enforceLifecycleFunctions) {
        this._checkLifecycleFunctions(code, issues)
      }

      // Parse the code into AST (simplified for demo)
      const lines = code.split("\n")

      // Check for potential infinite loops
      if (this.options.detectInfiniteLoops) {
        this._detectInfiniteLoops(code, lines, issues)
      }

      // Check function complexity and length
      this._checkFunctions(code, lines, issues)

      // Check variable usage
      if (this.options.detectUnusedVariables) {
        this._detectUnusedVariables(code, issues)
      }

      // Check naming conventions
      if (this.options.checkNamingConventions) {
        this._checkNamingConventions(code, lines, issues)
      }

      // Check for potential memory leaks
      if (this.options.checkMemoryLeaks) {
        this._checkMemoryLeaks(code, issues)
      }

      // Game-specific checks
      this._checkGameSpecificIssues(code, issues)

      // Add severity levels to issues
      issues.forEach((issue) => {
        if (!issue.severity) {
          issue.severity = this._determineSeverity(issue.type)
        }
      })

      return issues
    } catch (error) {
      // If something goes wrong with the linter itself, report it
      return [
        {
          line: 1,
          column: 1,
          message: `Linter error: ${error.message}`,
          type: "linter-error",
          severity: "error",
        },
      ]
    }
  }

  /**
   * Validate basic syntax of the code
   * @private
   */
  _validateSyntax(code, issues) {
    try {
      // Use Function constructor to check syntax
      new Function(code)
    } catch (error) {
      // Parse error message to get line and column info
      const errorMsg = error.message
      const lineMatch = errorMsg.match(/line (\d+)/)
      const columnMatch = errorMsg.match(/column (\d+)/)

      const line = lineMatch ? Number.parseInt(lineMatch[1]) : 1
      const column = columnMatch ? Number.parseInt(columnMatch[1]) : 1

      issues.push({
        line,
        column,
        message: `Syntax error: ${errorMsg}`,
        type: "syntax-error",
        severity: "error",
      })
    }
  }

  /**
   * Check for required SAAAM lifecycle functions
   * @private
   */
  _checkLifecycleFunctions(code, issues) {
    // Check for create function
    if (!code.includes("function create()") && !code.includes("function create (")) {
      issues.push({
        line: 1,
        column: 1,
        message: 'Missing "create()" lifecycle function',
        type: "missing-lifecycle",
        severity: "warning",
      })
    }

    // Check for step function
    if (!code.includes("function step()") && !code.includes("function step (")) {
      issues.push({
        line: 1,
        column: 1,
        message: 'Missing "step()" lifecycle function',
        type: "missing-lifecycle",
        severity: "warning",
      })
    }

    // Check for draw function
    if (!code.includes("function draw()") && !code.includes("function draw (")) {
      issues.push({
        line: 1,
        column: 1,
        message: 'Missing "draw()" lifecycle function',
        type: "missing-lifecycle",
        severity: "info",
      })
    }
  }

  /**
   * Detect potential infinite loops
   * @private
   */
  _detectInfiniteLoops(code, lines, issues) {
    // Check for while(true)
    const whileTrueMatches = code.match(/while\s*$$\s*true\s*$$/g) || []
    whileTrueMatches.forEach((match) => {
      const lineIndex = this._findLineForMatch(code, match)
      issues.push({
        line: lineIndex + 1,
        column: lines[lineIndex].indexOf(match) + 1,
        message: "Potential infinite loop detected (while(true))",
        type: "infinite-loop",
        severity: "warning",
      })
    })

    // Check for for(;;)
    const forInfiniteMatches = code.match(/for\s*$$\s*;\s*;\s*$$/g) || []
    forInfiniteMatches.forEach((match) => {
      const lineIndex = this._findLineForMatch(code, match)
      issues.push({
        line: lineIndex + 1,
        column: lines[lineIndex].indexOf(match) + 1,
        message: "Potential infinite loop detected (for(;;))",
        type: "infinite-loop",
        severity: "warning",
      })
    })

    // Check for loops without break conditions
    const whileMatches = code.match(/while\s*$$[^)]+$$\s*\{/g) || []
    whileMatches.forEach((match) => {
      if (!match.includes("break") && !this._hasBreakAfterMatch(code, match)) {
        const lineIndex = this._findLineForMatch(code, match)
        issues.push({
          line: lineIndex + 1,
          column: lines[lineIndex].indexOf(match) + 1,
          message: "Loop might lack a break condition",
          type: "potential-infinite-loop",
          severity: "info",
        })
      }
    })
  }

  /**
   * Check functions for complexity and length
   * @private
   */
  _checkFunctions(code, lines, issues) {
    // Simple function extraction regex
    const functionMatches = code.match(/function\s+([a-zA-Z0-9_]+)\s*$$[^)]*$$\s*\{/g) || []

    for (const match of functionMatches) {
      const funcName = match.match(/function\s+([a-zA-Z0-9_]+)/)[1]
      const startIndex = this._findLineForMatch(code, match)

      // Find the end of the function
      let braceCount = 1
      let endIndex = startIndex
      let lineIndex = startIndex

      // Skip the opening line which we've already matched
      const codeAfterMatch = code.substring(code.indexOf(match) + match.length)
      const remainingLines = codeAfterMatch.split("\n")

      for (let i = 0; i < remainingLines.length; i++) {
        const line = remainingLines[i]
        lineIndex++

        // Count braces to find function end
        for (let j = 0; j < line.length; j++) {
          if (line[j] === "{") braceCount++
          else if (line[j] === "}") {
            braceCount--
            if (braceCount === 0) {
              endIndex = lineIndex
              break
            }
          }
        }

        if (braceCount === 0) break
      }

      // Check function length
      const functionLength = endIndex - startIndex + 1
      if (functionLength > this.options.maxFunctionLength) {
        issues.push({
          line: startIndex + 1,
          column: lines[startIndex].indexOf("function") + 1,
          message: `Function "${funcName}" is too long (${functionLength} lines)`,
          type: "function-length",
          severity: "warning",
        })
      }

      // Check function complexity (simplified)
      const functionBody = lines.slice(startIndex, endIndex + 1).join("\n")
      const complexity = this._calculateComplexity(functionBody)

      if (complexity > this.options.maxComplexity) {
        issues.push({
          line: startIndex + 1,
          column: lines[startIndex].indexOf("function") + 1,
          message: `Function "${funcName}" is too complex (cyclomatic complexity: ${complexity})`,
          type: "function-complexity",
          severity: "warning",
        })
      }
    }
  }

  /**
   * Simple cyclomatic complexity calculation
   * @private
   */
  _calculateComplexity(code) {
    // Count decision points
    let complexity = 1 // Start with 1

    // Count if statements
    const ifMatches = code.match(/if\s*\(/g) || []
    complexity += ifMatches.length

    // Count else if statements
    const elseIfMatches = code.match(/else\s+if\s*\(/g) || []
    complexity += elseIfMatches.length

    // Count loops
    const loopMatches =
      (code.match(/for\s*\(/g) || []).length +
      (code.match(/while\s*\(/g) || []).length +
      (code.match(/do\s*\{/g) || []).length
    complexity += loopMatches

    // Count case statements
    const caseMatches = code.match(/case\s+[^:]+:/g) || []
    complexity += caseMatches.length

    // Count logical operators (&&, ||)
    const logicalOpMatches = (code.match(/&&/g) || []).length + (code.match(/\|\|/g) || []).length
    complexity += logicalOpMatches

    // Count ternary operators
    const ternaryMatches = code.match(/\?.*:/g) || []
    complexity += ternaryMatches.length

    return complexity
  }

  /**
   * Detect unused variables (simplified)
   * @private
   */
  _detectUnusedVariables(code, issues) {
    // Find variable declarations
    const varDeclarations =
      code.match(/var\s+([a-zA-Z0-9_]+)\s*=|const\s+([a-zA-Z0-9_]+)\s*=|let\s+([a-zA-Z0-9_]+)\s*=/g) || []

    for (const declaration of varDeclarations) {
      let varName = ""

      if (declaration.startsWith("var")) {
        varName = declaration.match(/var\s+([a-zA-Z0-9_]+)/)[1]
      } else if (declaration.startsWith("const")) {
        varName = declaration.match(/const\s+([a-zA-Z0-9_]+)/)[1]
      } else if (declaration.startsWith("let")) {
        varName = declaration.match(/let\s+([a-zA-Z0-9_]+)/)[1]
      }

      // Skip if it's a built-in or keyword
      if (this.keywords.includes(varName) || this.builtIns.includes(varName)) {
        continue
      }

      // Simple check: count occurrences of the variable name after declaration
      const declarationIndex = code.indexOf(declaration)
      const codeAfterDeclaration = code.substring(declarationIndex + declaration.length)

      // Use word boundary regex to avoid partial matches
      const usageRegex = new RegExp(`\\b${varName}\\b`, "g")
      const usageMatches = codeAfterDeclaration.match(usageRegex) || []

      if (usageMatches.length === 0) {
        const lineIndex = this._findLineForMatch(code, declaration)
        issues.push({
          line: lineIndex + 1,
          column: code.split("\n")[lineIndex].indexOf(varName) + 1,
          message: `Unused variable "${varName}"`,
          type: "unused-variable",
          severity: "warning",
        })
      }
    }
  }

  /**
   * Check naming conventions
   * @private
   */
  _checkNamingConventions(code, lines, issues) {
    // Check variable naming (camelCase)
    const varDeclarations = code.match(/var\s+([a-zA-Z0-9_]+)|const\s+([a-zA-Z0-9_]+)|let\s+([a-zA-Z0-9_]+)/g) || []

    for (const declaration of varDeclarations) {
      let varName = ""

      if (declaration.startsWith("var")) {
        varName = declaration.match(/var\s+([a-zA-Z0-9_]+)/)[1]
      } else if (declaration.startsWith("const")) {
        varName = declaration.match(/const\s+([a-zA-Z0-9_]+)/)[1]
      } else if (declaration.startsWith("let")) {
        varName = declaration.match(/let\s+([a-zA-Z0-9_]+)/)[1]
      }

      // Skip if it's a built-in or keyword
      if (this.keywords.includes(varName) || this.builtIns.includes(varName)) {
        continue
      }

      // Check if variable name follows camelCase convention
      // Allow single letter variables and underscore prefixes
      if (
        varName.length > 1 &&
        !varName.startsWith("_") &&
        !/^[a-z][a-zA-Z0-9]*$/.test(varName) &&
        !/^[A-Z_]+$/.test(varName)
      ) {
        // Allow UPPER_CASE for constants

        const lineIndex = this._findLineForMatch(code, declaration)
        issues.push({
          line: lineIndex + 1,
          column: code.split("\n")[lineIndex].indexOf(varName) + 1,
          message: `Variable "${varName}" should follow camelCase naming convention`,
          type: "naming-convention",
          severity: "info",
        })
      }
    }

    // Check function naming (camelCase as well)
    const functionDeclarations = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(/g) || []

    for (const declaration of functionDeclarations) {
      const funcName = declaration.match(/function\s+([a-zA-Z0-9_]+)/)[1]

      // Skip checking lifecycle functions or built-ins
      if (
        ["create", "step", "draw", "on_collision"].includes(funcName) ||
        this.keywords.includes(funcName) ||
        this.builtIns.includes(funcName)
      ) {
        continue
      }

      // Check if function name follows camelCase convention
      if (!/^[a-z][a-zA-Z0-9]*$/.test(funcName)) {
        const lineIndex = this._findLineForMatch(code, declaration)
        issues.push({
          line: lineIndex + 1,
          column: code.split("\n")[lineIndex].indexOf(funcName) + 1,
          message: `Function "${funcName}" should follow camelCase naming convention`,
          type: "naming-convention",
          severity: "info",
        })
      }
    }
  }

  /**
   * Check for potential memory leaks
   * @private
   */
  _checkMemoryLeaks(code, issues) {
    // Check for event listeners without corresponding removals
    const addListenerMatches = code.match(/addEventListener\s*\(/g) || []
    const removeListenerMatches = code.match(/removeEventListener\s*\(/g) || []

    if (addListenerMatches.length > removeListenerMatches.length) {
      const difference = addListenerMatches.length - removeListenerMatches.length

      // Find a line with addEventListener but no matching removeEventListener
      for (const match of addListenerMatches) {
        const lineIndex = this._findLineForMatch(code, match)
        issues.push({
          line: lineIndex + 1,
          column: code.split("\n")[lineIndex].indexOf(match) + 1,
          message: `Potential memory leak: event listener added without being removed`,
          type: "memory-leak",
          severity: "warning",
        })
        break // Just add one warning
      }
    }

    // Check for create_effect without cleanup
    const createEffectMatches = code.match(/create_effect\s*\(/g) || []
    if (createEffectMatches.length > 0) {
      // Simple heuristic: check if there's a destroy_effect or similar
      if (!code.includes("destroy_effect") && !code.includes("remove_effect")) {
        const lineIndex = this._findLineForMatch(code, createEffectMatches[0])
        issues.push({
          line: lineIndex + 1,
          column: code.split("\n")[lineIndex].indexOf(createEffectMatches[0]) + 1,
          message: `Potential memory leak: effects created without being destroyed`,
          type: "memory-leak",
          severity: "info",
        })
      }
    }
  }

  /**
   * Check for game-specific issues in SAAAM code
   * @private
   */
  _checkGameSpecificIssues(code, issues) {
    // Check for hardcoded magic numbers
    const magicNumberMatches = code.match(/[^a-zA-Z0-9_"'.](\d+)[^a-zA-Z0-9_.]/g) || []
    const allowedNumbers = [0, 1, 2, -1] // Common acceptable magic numbers

    for (const match of magicNumberMatches) {
      const number = Number.parseInt(match.replace(/[^\d-]/g, ""))

      // Skip if it's in our allowed list or small
      if (allowedNumbers.includes(number) || (number >= -5 && number <= 10)) {
        continue
      }

      // Skip if it appears to be part of a coordinate pair or dimensions
      const lineIndex = this._findLineForMatch(code, match)
      const line = code.split("\n")[lineIndex]

      // Skip if the line contains vec2, position, size, etc.
      if (
        line.includes("vec2") ||
        line.includes("position") ||
        line.includes("size") ||
        line.includes("width") ||
        line.includes("height") ||
        line.includes("x") ||
        line.includes("y")
      ) {
        continue
      }

      issues.push({
        line: lineIndex + 1,
        column: line.indexOf(match) + 1,
        message: `Consider using a named constant instead of magic number ${number}`,
        type: "magic-number",
        severity: "info",
      })
    }

    // Check for missing error handling in collision checks
    const collisionMatches = code.match(/check_collision\s*$$[^)]+$$/g) || []
    for (const match of collisionMatches) {
      const lineIndex = this._findLineForMatch(code, match)
      const line = code.split("\n")[lineIndex]

      // Check if the collision result is checked before use
      if (!line.includes("if") && !line.includes("&&") && !line.includes("||")) {
        issues.push({
          line: lineIndex + 1,
          column: line.indexOf(match) + 1,
          message: `Collision result should be checked before use`,
          type: "collision-check",
          severity: "warning",
        })
      }
    }

    // Performance issue - using draw functions in step
    if (code.includes("function step(") && (code.match(/step\s*$$\s*$$\s*\{[\s\S]*?draw_/g) || []).length > 0) {
      issues.push({
        line: this._findLineForMatch(code, "function step(") + 1,
        column: 1,
        message: `Performance issue: Drawing functions should be used in draw() not step()`,
        type: "performance",
        severity: "warning",
      })
    }
  }

  /**
   * Find the line index for a given match
   * @private
   */
  _findLineForMatch(code, match) {
    const lines = code.split("\n")
    const index = code.indexOf(match)

    // Count newlines before this index
    let lineCount = 0
    let pos = 0

    while (pos < index && pos < code.length) {
      pos = code.indexOf("\n", pos)
      if (pos === -1 || pos >= index) break
      lineCount++
      pos++
    }

    return lineCount
  }

  /**
   * Check if there's a break statement after a loop match
   * @private
   */
  _hasBreakAfterMatch(code, match) {
    const index = code.indexOf(match) + match.length
    const nextBraceIndex = code.indexOf("}", index)

    if (nextBraceIndex === -1) return false

    const codeBlock = code.substring(index, nextBraceIndex)
    return codeBlock.includes("break;") || codeBlock.includes("return") || codeBlock.includes("throw")
  }

  /**
   * Determine severity level for issue type
   * @private
   */
  _determineSeverity(type) {
    const errorTypes = ["syntax-error", "undefined-variable", "undefined-function"]
    const warningTypes = ["infinite-loop", "memory-leak", "function-complexity", "collision-check", "performance"]
    const infoTypes = ["naming-convention", "magic-number", "unused-variable"]

    if (errorTypes.includes(type)) return "error"
    if (warningTypes.includes(type)) return "warning"
    if (infoTypes.includes(type)) return "info"

    return "info"
  }
}

// Export the linter
export default SaaamLinter
