"use client"

import { useState, useEffect, useRef } from "react"

interface ShaderEditorProps {
  onCodeGenerated: (code: string) => void
}

export default function ShaderEditor({ onCodeGenerated }: ShaderEditorProps) {
  const [vertexShader, setVertexShader] = useState(`attribute vec2 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
  vTexCoord = aTexCoord;
}`)

  const [fragmentShader, setFragmentShader] = useState(`precision mediump float;

varying vec2 vTexCoord;
uniform float uTime;

void main() {
  vec2 uv = vTexCoord;
  
  // Create a simple color gradient
  vec3 color = vec3(uv.x, uv.y, sin(uTime * 0.5) * 0.5 + 0.5);
  
  gl_FragColor = vec4(color, 1.0);
}`)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState("")
  const [gl, setGl] = useState<WebGLRenderingContext | null>(null)
  const [program, setProgram] = useState<WebGLProgram | null>(null)
  const [positionBuffer, setPositionBuffer] = useState<WebGLBuffer | null>(null)
  const [texCoordBuffer, setTexCoordBuffer] = useState<WebGLBuffer | null>(null)
  const [positionLocation, setPositionLocation] = useState<number | null>(null)
  const [texCoordLocation, setTexCoordLocation] = useState<number | null>(null)
  const [timeLocation, setTimeLocation] = useState<WebGLUniformLocation | null>(null)

  // Compile and run shader
  useEffect(() => {
    if (!canvasRef.current || !isPlaying) return

    const canvas = canvasRef.current
    const _gl = canvas.getContext("webgl")

    if (!_gl) {
      setError("WebGL not supported")
      return
    }

    setGl(_gl)

    let animationFrame: number

    try {
      // Create shader program
      const vertShader = _gl.createShader(_gl.VERTEX_SHADER)!
      _gl.shaderSource(vertShader, vertexShader)
      _gl.compileShader(vertShader)

      if (!_gl.getShaderParameter(vertShader, _gl.COMPILE_STATUS)) {
        throw new Error("Vertex shader error: " + _gl.getShaderInfoLog(vertShader))
      }

      const fragShader = _gl.createShader(_gl.FRAGMENT_SHADER)!
      _gl.shaderSource(fragShader, fragmentShader)
      _gl.compileShader(fragShader)

      if (!_gl.getShaderParameter(fragShader, _gl.COMPILE_STATUS)) {
        throw new Error("Fragment shader error: " + _gl.getShaderInfoLog(fragShader))
      }

      const _program = _gl.createProgram()!
      _gl.attachShader(_program, vertShader)
      _gl.attachShader(_program, fragShader)
      _gl.linkProgram(_program)

      if (!_gl.getProgramParameter(_program, _gl.LINK_STATUS)) {
        throw new Error("Shader program error: " + _gl.getProgramInfoLog(_program))
      }

      setProgram(_program)

      // Set up geometry
      const _positionBuffer = _gl.createBuffer()
      _gl.bindBuffer(_gl.ARRAY_BUFFER, _positionBuffer)
      _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), _gl.STATIC_DRAW)

      setPositionBuffer(_positionBuffer)

      const _texCoordBuffer = _gl.createBuffer()
      _gl.bindBuffer(_gl.ARRAY_BUFFER, _texCoordBuffer)
      _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), _gl.STATIC_DRAW)

      setTexCoordBuffer(_texCoordBuffer)

      // Get attribute locations
      const _positionLocation = _gl.getAttribLocation(_program, "aPosition")
      const _texCoordLocation = _gl.getAttribLocation(_program, "aTexCoord")

      setPositionLocation(_positionLocation)
      setTexCoordLocation(_texCoordLocation)

      // Get uniform locations
      const _timeLocation = _gl.getUniformLocation(_program, "uTime")
      setTimeLocation(_timeLocation)

      // Animation loop
      const startTime = performance.now()

      const render = () => {
        if (
          !gl ||
          !program ||
          !positionBuffer ||
          !texCoordBuffer ||
          timeLocation === null ||
          positionLocation === null ||
          texCoordLocation === null
        )
          return

        const time = (performance.now() - startTime) / 1000

        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)

        gl.useProgram(program)

        // Set uniforms
        gl.uniform1f(timeLocation, time)

        // Set attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        gl.enableVertexAttribArray(positionLocation)
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
        gl.enableVertexAttribArray(texCoordLocation)
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        animationFrame = requestAnimationFrame(render)
      }

      render()
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }

    return () => {
      cancelAnimationFrame(animationFrame)
      if (gl) {
        gl.deleteProgram(program)
      }
    }
  }, [vertexShader, fragmentShader, isPlaying])

  const generateCode = () => {
    const code = `// Generated Shader Code
const vertexShaderSource = \`${vertexShader}\`;

const fragmentShaderSource = \`${fragmentShader}\`;

// Create shader program
function createShaderProgram(gl) {
  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertexShaderSource);
  gl.compileShader(vertShader);
  
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragmentShaderSource);
  gl.compileShader(fragShader);
  
  const program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  
  return program;
}`

    onCodeGenerated(code)
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white">
      <div className="flex-1 flex">
        <div className="w-1/2 flex flex-col border-r border-gray-700">
          <div className="p-2 bg-gray-800 border-b border-gray-700">
            <h2 className="font-semibold">Vertex Shader</h2>
          </div>
          <textarea
            className="flex-1 bg-gray-900 text-gray-100 font-mono p-2 resize-none focus:outline-none"
            value={vertexShader}
            onChange={(e) => setVertexShader(e.target.value)}
            spellCheck="false"
          />
        </div>
        <div className="w-1/2 flex flex-col">
          <div className="p-2 bg-gray-800 border-b border-gray-700">
            <h2 className="font-semibold">Fragment Shader</h2>
          </div>
          <textarea
            className="flex-1 bg-gray-900 text-gray-100 font-mono p-2 resize-none focus:outline-none"
            value={fragmentShader}
            onChange={(e) => setFragmentShader(e.target.value)}
            spellCheck="false"
          />
        </div>
      </div>

      <div className="h-1/3 flex">
        <div className="w-1/2 flex flex-col border-t border-r border-gray-700">
          <div className="p-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
            <h2 className="font-semibold">Preview</h2>
            <button
              className={`px-3 py-1 rounded ${isPlaying ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? "Stop" : "Run"}
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center bg-black">
            <canvas ref={canvasRef} width={300} height={200} className="border border-gray-700" />
          </div>
        </div>
        <div className="w-1/2 flex flex-col border-t border-gray-700">
          <div className="p-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
            <h2 className="font-semibold">Console</h2>
            <button className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700" onClick={generateCode}>
              Generate Code
            </button>
          </div>
          <div className="flex-1 p-2 font-mono text-sm overflow-y-auto">
            {error ? (
              <div className="text-red-400">{error}</div>
            ) : isPlaying ? (
              <div className="text-green-400">Shader running...</div>
            ) : (
              <div className="text-gray-400">Press Run to preview shader</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
