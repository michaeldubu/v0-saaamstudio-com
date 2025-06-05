// SAAAM Studio 3D Game Engine
// A 3D extension of the 2D game engine

class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x
    this.y = y
    this.z = z
  }

  static zero() {
    return new Vector3(0, 0, 0)
  }

  static one() {
    return new Vector3(1, 1, 1)
  }

  static up() {
    return new Vector3(0, 1, 0)
  }

  static right() {
    return new Vector3(1, 0, 0)
  }

  static forward() {
    return new Vector3(0, 0, 1)
  }

  add(v) {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z)
  }

  subtract(v) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z)
  }

  multiply(scalar) {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar)
  }

  divide(scalar) {
    if (scalar === 0) throw new Error("Cannot divide by zero")
    return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar)
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z
  }

  cross(v) {
    return new Vector3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x)
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
  }

  normalize() {
    const mag = this.magnitude()
    if (mag === 0) return Vector3.zero()
    return this.divide(mag)
  }

  distanceTo(v) {
    return this.subtract(v).magnitude()
  }

  toArray() {
    return [this.x, this.y, this.z]
  }
}

class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x
    this.y = y
    this.z = z
    this.w = w
  }

  static identity() {
    return new Quaternion(0, 0, 0, 1)
  }

  static fromEuler(x, y, z) {
    // Convert Euler angles to quaternion
    // Using ZYX rotation order
    const cx = Math.cos(x * 0.5)
    const sx = Math.sin(x * 0.5)
    const cy = Math.cos(y * 0.5)
    const sy = Math.sin(y * 0.5)
    const cz = Math.cos(z * 0.5)
    const sz = Math.sin(z * 0.5)

    return new Quaternion(
      sx * cy * cz - cx * sy * sz,
      cx * sy * cz + sx * cy * sz,
      cx * cy * sz - sx * sy * cz,
      cx * cy * cz + sx * sy * sz,
    )
  }

  static fromAxisAngle(axis, angle) {
    // Convert axis-angle to quaternion
    const halfAngle = angle * 0.5
    const s = Math.sin(halfAngle)
    return new Quaternion(axis.x * s, axis.y * s, axis.z * s, Math.cos(halfAngle))
  }

  multiply(q) {
    return new Quaternion(
      this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
      this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
      this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w,
      this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z,
    )
  }

  conjugate() {
    return new Quaternion(-this.x, -this.y, -this.z, this.w)
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
  }

  normalize() {
    const mag = this.magnitude()
    if (mag === 0) return Quaternion.identity()
    return new Quaternion(this.x / mag, this.y / mag, this.z / mag, this.w / mag)
  }

  rotateVector(v) {
    // v' = q * v * q^-1
    const vectorQuat = new Quaternion(v.x, v.y, v.z, 0)
    const conjugate = this.conjugate()
    const result = this.multiply(vectorQuat).multiply(conjugate)
    return new Vector3(result.x, result.y, result.z)
  }

  toMatrix() {
    // Convert quaternion to 3x3 rotation matrix
    const xx = this.x * this.x
    const xy = this.x * this.y
    const xz = this.x * this.z
    const xw = this.x * this.w
    const yy = this.y * this.y
    const yz = this.y * this.z
    const yw = this.y * this.w
    const zz = this.z * this.z
    const zw = this.z * this.w

    return [
      [1 - 2 * (yy + zz), 2 * (xy - zw), 2 * (xz + yw)],
      [2 * (xy + zw), 1 - 2 * (xx + zz), 2 * (yz - xw)],
      [2 * (xz - yw), 2 * (yz + xw), 1 - 2 * (xx + yy)],
    ]
  }

  toEuler() {
    // Convert quaternion to Euler angles (in radians)
    // ZYX rotation order
    const matrix = this.toMatrix()

    // Handle gimbal lock edge cases
    if (Math.abs(matrix[2][0]) >= 0.99999) {
      const direction = Math.sign(matrix[2][0])
      return new Vector3(0, (-direction * Math.PI) / 2, -direction * Math.atan2(-matrix[0][1], matrix[1][1]))
    }

    return new Vector3(
      Math.atan2(matrix[2][1], matrix[2][2]),
      Math.asin(-matrix[2][0]),
      Math.atan2(matrix[1][0], matrix[0][0]),
    )
  }
}

class Matrix4 {
  constructor(values) {
    // Column-major order (WebGL standard)
    this.values = values || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  }

  static identity() {
    return new Matrix4()
  }

  static translation(x, y, z) {
    return new Matrix4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1])
  }

  static scaling(x, y, z) {
    return new Matrix4([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1])
  }

  static rotation(quaternion) {
    const rotMatrix = quaternion.toMatrix()

    // Convert 3x3 rotation matrix to 4x4
    return new Matrix4([
      rotMatrix[0][0],
      rotMatrix[0][1],
      rotMatrix[0][2],
      0,
      rotMatrix[1][0],
      rotMatrix[1][1],
      rotMatrix[1][2],
      0,
      rotMatrix[2][0],
      rotMatrix[2][1],
      rotMatrix[2][2],
      0,
      0,
      0,
      0,
      1,
    ])
  }

  static perspective(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2)
    const nf = 1 / (near - far)

    return new Matrix4([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0])
  }

  static lookAt(eye, target, up) {
    const zAxis = eye.subtract(target).normalize()
    const xAxis = up.cross(zAxis).normalize()
    const yAxis = zAxis.cross(xAxis)

    return new Matrix4([
      xAxis.x,
      yAxis.x,
      zAxis.x,
      0,
      xAxis.y,
      yAxis.y,
      zAxis.y,
      0,
      xAxis.z,
      yAxis.z,
      zAxis.z,
      0,
      -xAxis.dot(eye),
      -yAxis.dot(eye),
      -zAxis.dot(eye),
      1,
    ])
  }

  multiply(other) {
    const result = new Array(16).fill(0)

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        for (let i = 0; i < 4; i++) {
          result[col * 4 + row] += this.values[i * 4 + row] * other.values[col * 4 + i]
        }
      }
    }

    return new Matrix4(result)
  }

  transformPoint(point) {
    const x = point.x
    const y = point.y
    const z = point.z
    const w = 1

    const resultX = this.values[0] * x + this.values[4] * y + this.values[8] * z + this.values[12] * w
    const resultY = this.values[1] * x + this.values[5] * y + this.values[9] * z + this.values[13] * w
    const resultZ = this.values[2] * x + this.values[6] * y + this.values[10] * z + this.values[14] * w
    const resultW = this.values[3] * x + this.values[7] * y + this.values[11] * z + this.values[15] * w

    if (Math.abs(resultW) < 0.0001) {
      return new Vector3(resultX, resultY, resultZ)
    }

    return new Vector3(resultX / resultW, resultY / resultW, resultZ / resultW)
  }

  transformDirection(dir) {
    // Transform direction without translation
    const x = dir.x
    const y = dir.y
    const z = dir.z

    return new Vector3(
      this.values[0] * x + this.values[4] * y + this.values[8] * z,
      this.values[1] * x + this.values[5] * y + this.values[9] * z,
      this.values[2] * x + this.values[6] * y + this.values[10] * z,
    )
  }

  transpose() {
    return new Matrix4([
      this.values[0],
      this.values[4],
      this.values[8],
      this.values[12],
      this.values[1],
      this.values[5],
      this.values[9],
      this.values[13],
      this.values[2],
      this.values[6],
      this.values[10],
      this.values[14],
      this.values[3],
      this.values[7],
      this.values[11],
      this.values[15],
    ])
  }

  determinant() {
    const a00 = this.values[0],
      a01 = this.values[1],
      a02 = this.values[2],
      a03 = this.values[3]
    const a10 = this.values[4],
      a11 = this.values[5],
      a12 = this.values[6],
      a13 = this.values[7]
    const a20 = this.values[8],
      a21 = this.values[9],
      a22 = this.values[10],
      a23 = this.values[11]
    const a30 = this.values[12],
      a31 = this.values[13],
      a32 = this.values[14],
      a33 = this.values[15]

    return (
      a03 * a12 * a21 * a30 -
      a02 * a13 * a21 * a30 -
      a03 * a11 * a22 * a30 +
      a01 * a13 * a22 * a30 +
      a02 * a11 * a23 * a30 -
      a01 * a12 * a23 * a30 -
      a03 * a12 * a20 * a31 +
      a02 * a13 * a20 * a31 +
      a03 * a10 * a22 * a31 -
      a00 * a13 * a22 * a31 -
      a02 * a10 * a23 * a31 +
      a00 * a12 * a23 * a31 +
      a03 * a11 * a20 * a32 -
      a01 * a13 * a20 * a32 -
      a03 * a10 * a21 * a32 +
      a00 * a13 * a21 * a32 +
      a01 * a10 * a23 * a32 -
      a00 * a11 * a23 * a32 -
      a02 * a11 * a20 * a33 +
      a01 * a12 * a20 * a33 +
      a02 * a10 * a21 * a33 -
      a00 * a12 * a21 * a33 -
      a01 * a10 * a22 * a33 +
      a00 * a11 * a22 * a33
    )
  }

  inverse() {
    const a00 = this.values[0],
      a01 = this.values[1],
      a02 = this.values[2],
      a03 = this.values[3]
    const a10 = this.values[4],
      a11 = this.values[5],
      a12 = this.values[6],
      a13 = this.values[7]
    const a20 = this.values[8],
      a21 = this.values[9],
      a22 = this.values[10],
      a23 = this.values[11]
    const a30 = this.values[12],
      a31 = this.values[13],
      a32 = this.values[14],
      a33 = this.values[15]

    const b00 = a00 * a11 - a01 * a10
    const b01 = a00 * a12 - a02 * a10
    const b02 = a00 * a13 - a03 * a10
    const b03 = a01 * a12 - a02 * a11
    const b04 = a01 * a13 - a03 * a11
    const b05 = a02 * a13 - a03 * a12
    const b06 = a20 * a31 - a21 * a30
    const b07 = a20 * a32 - a22 * a30
    const b08 = a20 * a33 - a23 * a30
    const b09 = a21 * a32 - a22 * a31
    const b10 = a21 * a33 - a23 * a31
    const b11 = a22 * a33 - a23 * a32

    // Calculate the determinant
    const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06
    if (!det) return null

    const invDet = 1.0 / det

    return new Matrix4([
      (a11 * b11 - a12 * b10 + a13 * b09) * invDet,
      (a02 * b10 - a01 * b11 - a03 * b09) * invDet,
      (a31 * b05 - a32 * b04 + a33 * b03) * invDet,
      (a22 * b04 - a21 * b05 - a23 * b03) * invDet,
      (a12 * b08 - a10 * b11 - a13 * b07) * invDet,
      (a00 * b11 - a02 * b08 + a03 * b07) * invDet,
      (a32 * b02 - a30 * b05 - a33 * b01) * invDet,
      (a20 * b05 - a22 * b02 + a23 * b01) * invDet,
      (a10 * b10 - a11 * b08 + a13 * b06) * invDet,
      (a01 * b08 - a00 * b10 - a03 * b06) * invDet,
      (a30 * b04 - a31 * b02 + a33 * b00) * invDet,
      (a21 * b02 - a20 * b04 - a23 * b00) * invDet,
      (a11 * b07 - a10 * b09 - a12 * b06) * invDet,
      (a00 * b09 - a01 * b07 + a02 * b06) * invDet,
      (a31 * b01 - a30 * b03 - a32 * b00) * invDet,
      (a20 * b03 - a21 * b01 + a22 * b00) * invDet,
    ])
  }
}

// Base class for 3D meshes
class Mesh {
  constructor(vertices = [], indices = [], normals = [], uvs = []) {
    this.vertices = vertices
    this.indices = indices
    this.normals = normals
    this.uvs = uvs
    this.material = null
  }

  setMaterial(material) {
    this.material = material
    return this
  }

  static createCube(size = 1) {
    const halfSize = size / 2

    // Vertices (8 corners of a cube)
    const vertices = [
      // Front face
      -halfSize,
      -halfSize,
      halfSize, // 0: bottom-left-front
      halfSize,
      -halfSize,
      halfSize, // 1: bottom-right-front
      halfSize,
      halfSize,
      halfSize, // 2: top-right-front
      -halfSize,
      halfSize,
      halfSize, // 3: top-left-front

      // Back face
      -halfSize,
      -halfSize,
      -halfSize, // 4: bottom-left-back
      halfSize,
      -halfSize,
      -halfSize, // 5: bottom-right-back
      halfSize,
      halfSize,
      -halfSize, // 6: top-right-back
      -halfSize,
      halfSize,
      -halfSize, // 7: top-left-back
    ]

    // Indices (6 faces, 2 triangles per face, 3 indices per triangle)
    const indices = [
      // Front face
      0, 1, 2, 0, 2, 3,
      // Back face
      4, 6, 5, 4, 7, 6,
      // Top face
      3, 2, 6, 3, 6, 7,
      // Bottom face
      0, 5, 1, 0, 4, 5,
      // Right face
      1, 5, 6, 1, 6, 2,
      // Left face
      0, 3, 7, 0, 7, 4,
    ]

    // Normals
    const normals = [
      // Front face
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
      // Back face
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
      // Top face
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
      // Bottom face
      0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
      // Right face
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
      // Left face
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    ]

    // UV coordinates
    const uvs = [
      // Front face
      0, 0, 1, 0, 1, 1, 0, 1,
      // Back face
      1, 0, 0, 0, 0, 1, 1, 1,
      // Top face
      0, 1, 1, 1, 1, 0, 0, 0,
      // Bottom face
      0, 0, 1, 0, 1, 1, 0, 1,
      // Right face
      0, 0, 1, 0, 1, 1, 0, 1,
      // Left face
      1, 0, 0, 0, 0, 1, 1, 1,
    ]

    return new Mesh(vertices, indices, normals, uvs)
  }

  static createSphere(radius = 1, segments = 16) {
    const vertices = []
    const indices = []
    const normals = []
    const uvs = []

    // Generate vertices, normals, and uvs
    for (let lat = 0; lat <= segments; lat++) {
      const theta = (lat * Math.PI) / segments
      const sinTheta = Math.sin(theta)
      const cosTheta = Math.cos(theta)

      for (let lon = 0; lon <= segments; lon++) {
        const phi = (lon * 2 * Math.PI) / segments
        const sinPhi = Math.sin(phi)
        const cosPhi = Math.cos(phi)

        // Position
        const x = cosPhi * sinTheta
        const y = cosTheta
        const z = sinPhi * sinTheta

        vertices.push(radius * x, radius * y, radius * z)

        // Normal
        normals.push(x, y, z)

        // UV
        uvs.push(lon / segments, lat / segments)
      }
    }

    // Generate indices
    for (let lat = 0; lat < segments; lat++) {
      for (let lon = 0; lon < segments; lon++) {
        const first = lat * (segments + 1) + lon
        const second = first + segments + 1

        indices.push(first, second, first + 1)
        indices.push(second, second + 1, first + 1)
      }
    }

    return new Mesh(vertices, indices, normals, uvs)
  }

  static createPlane(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
    const vertices = []
    const indices = []
    const normals = []
    const uvs = []

    const widthHalf = width / 2
    const heightHalf = height / 2

    const gridX = widthSegments
    const gridY = heightSegments

    const gridX1 = gridX + 1
    const gridY1 = gridY + 1

    const segmentWidth = width / gridX
    const segmentHeight = height / gridY

    // Generate vertices, normals and uvs
    for (let iy = 0; iy < gridY1; iy++) {
      const y = iy * segmentHeight - heightHalf

      for (let ix = 0; ix < gridX1; ix++) {
        const x = ix * segmentWidth - widthHalf

        vertices.push(x, -y, 0)
        normals.push(0, 0, 1)
        uvs.push(ix / gridX, 1 - iy / gridY)
      }
    }

    // Generate indices
    for (let iy = 0; iy < gridY; iy++) {
      for (let ix = 0; ix < gridX; ix++) {
        const a = ix + gridX1 * iy
        const b = ix + gridX1 * (iy + 1)
        const c = ix + 1 + gridX1 * (iy + 1)
        const d = ix + 1 + gridX1 * iy

        // Faces
        indices.push(a, b, d)
        indices.push(b, c, d)
      }
    }

    return new Mesh(vertices, indices, normals, uvs)
  }

  calculateNormals() {
    // Reset normals array
    this.normals = new Array(this.vertices.length).fill(0)

    // Process each face (triangle)
    for (let i = 0; i < this.indices.length; i += 3) {
      // Get indices of vertices that form the triangle
      const idx1 = this.indices[i] * 3
      const idx2 = this.indices[i + 1] * 3
      const idx3 = this.indices[i + 2] * 3

      // Get positions of the three vertices
      const v1 = new Vector3(this.vertices[idx1], this.vertices[idx1 + 1], this.vertices[idx1 + 2])

      const v2 = new Vector3(this.vertices[idx2], this.vertices[idx2 + 1], this.vertices[idx2 + 2])

      const v3 = new Vector3(this.vertices[idx3], this.vertices[idx3 + 1], this.vertices[idx3 + 2])

      // Calculate triangle edges
      const edge1 = v2.subtract(v1)
      const edge2 = v3.subtract(v1)

      // Calculate face normal using cross product
      const normal = edge1.cross(edge2).normalize()

      // Add to vertex normals (we'll average them later)
      this.normals[idx1] += normal.x
      this.normals[idx1 + 1] += normal.y
      this.normals[idx1 + 2] += normal.z

      this.normals[idx2] += normal.x
      this.normals[idx2 + 1] += normal.y
      this.normals[idx2 + 2] += normal.z

      this.normals[idx3] += normal.x
      this.normals[idx3 + 1] += normal.y
      this.normals[idx3 + 2] += normal.z
    }

    // Normalize all vertex normals
    for (let i = 0; i < this.normals.length; i += 3) {
      const nx = this.normals[i]
      const ny = this.normals[i + 1]
      const nz = this.normals[i + 2]

      // Calculate magnitude
      const mag = Math.sqrt(nx * nx + ny * ny + nz * nz)

      if (mag > 0) {
        // Normalize
        this.normals[i] = nx / mag
        this.normals[i + 1] = ny / mag
        this.normals[i + 2] = nz / mag
      }
    }

    return this
  }
}

// Material system for 3D rendering
class Material {
  constructor(options = {}) {
    this.type = options.type || "basic"
    this.color = options.color || [1, 1, 1] // RGB
    this.map = options.map || null // Texture
    this.normalMap = options.normalMap || null
    this.specularMap = options.specularMap || null
    this.roughness = options.roughness !== undefined ? options.roughness : 0.5
    this.metalness = options.metalness !== undefined ? options.metalness : 0.0
    this.emissive = options.emissive || [0, 0, 0]
    this.transparency = options.transparency !== undefined ? options.transparency : 1.0
    this.wireframe = options.wireframe || false
    this.doubleSided = options.doubleSided || false
  }

  static basic(color = [1, 1, 1]) {
    return new Material({ type: "basic", color })
  }

  static phong(color = [1, 1, 1], roughness = 0.5) {
    return new Material({ type: "phong", color, roughness })
  }

  static pbr(color = [1, 1, 1], roughness = 0.5, metalness = 0.0) {
    return new Material({ type: "pbr", color, roughness, metalness })
  }
}

// Light system
class Light {
  constructor(type = "directional", color = [1, 1, 1], intensity = 1.0) {
    this.type = type
    this.color = color
    this.intensity = intensity
    this.position = Vector3.zero()
    this.direction = new Vector3(0, -1, 0)
    this.range = 10
    this.spotAngle = Math.PI / 4
    this.castShadows = false
  }

  static directional(color = [1, 1, 1], intensity = 1.0) {
    return new Light("directional", color, intensity)
  }

  static point(color = [1, 1, 1], intensity = 1.0, range = 10) {
    const light = new Light("point", color, intensity)
    light.range = range
    return light
  }

  static spot(color = [1, 1, 1], intensity = 1.0, range = 10, angle = Math.PI / 4) {
    const light = new Light("spot", color, intensity)
    light.range = range
    light.spotAngle = angle
    return light
  }

  static ambient(color = [0.2, 0.2, 0.2], intensity = 1.0) {
    return new Light("ambient", color, intensity)
  }
}

// 3D Transform component
class Transform3D {
  constructor() {
    this.position = Vector3.zero()
    this.rotation = Quaternion.identity()
    this.scale = Vector3.one()
    this.parent = null
    this.children = []
    this._localMatrix = Matrix4.identity()
    this._worldMatrix = Matrix4.identity()
    this._isDirty = true
  }

  setPosition(x, y, z) {
    if (typeof x === "object") {
      this.position = x
    } else {
      this.position = new Vector3(x, y, z)
    }
    this._markDirty()
    return this
  }

  setRotation(x, y, z) {
    if (typeof x === "object" && x.w !== undefined) {
      // Quaternion
      this.rotation = x
    } else if (typeof x === "object") {
      // Vector3 (Euler angles)
      this.rotation = Quaternion.fromEuler(x.x, x.y, x.z)
    } else {
      // Individual components
      this.rotation = Quaternion.fromEuler(x, y, z)
    }
    this._markDirty()
    return this
  }

  setScale(x, y, z) {
    if (typeof x === "object") {
      this.scale = x
    } else if (y === undefined && z === undefined) {
      this.scale = new Vector3(x, x, x)
    } else {
      this.scale = new Vector3(x, y, z)
    }
    this._markDirty()
    return this
  }

  translate(x, y, z) {
    const translation = typeof x === "object" ? x : new Vector3(x, y, z)
    this.position = this.position.add(translation)
    this._markDirty()
    return this
  }

  rotate(x, y, z) {
    const rotation =
      typeof x === "object" && x.w !== undefined
        ? x
        : Quaternion.fromEuler(
            typeof x === "object" ? x.x : x,
            typeof x === "object" ? x.y : y,
            typeof x === "object" ? x.z : z,
          )
    this.rotation = this.rotation.multiply(rotation)
    this._markDirty()
    return this
  }

  lookAt(target, up = Vector3.up()) {
    const direction = target.subtract(this.position).normalize()
    const right = up.cross(direction).normalize()
    const actualUp = direction.cross(right).normalize()

    // Create rotation matrix from basis vectors
    const rotMatrix = [
      [right.x, actualUp.x, direction.x],
      [right.y, actualUp.y, direction.y],
      [right.z, actualUp.z, direction.z],
    ]

    // Convert to quaternion (simplified method)
    const trace = rotMatrix[0][0] + rotMatrix[1][1] + rotMatrix[2][2]
    let w, x, y, z

    if (trace > 0) {
      const s = Math.sqrt(trace + 1.0) * 2
      w = 0.25 * s
      x = (rotMatrix[2][1] - rotMatrix[1][2]) / s
      y = (rotMatrix[0][2] - rotMatrix[2][0]) / s
      z = (rotMatrix[1][0] - rotMatrix[0][1]) / s
    } else if (rotMatrix[0][0] > rotMatrix[1][1] && rotMatrix[0][0] > rotMatrix[2][2]) {
      const s = Math.sqrt(1.0 + rotMatrix[0][0] - rotMatrix[1][1] - rotMatrix[2][2]) * 2
      w = (rotMatrix[2][1] - rotMatrix[1][2]) / s
      x = 0.25 * s
      y = (rotMatrix[0][1] + rotMatrix[1][0]) / s
      z = (rotMatrix[0][2] + rotMatrix[2][0]) / s
    } else if (rotMatrix[1][1] > rotMatrix[2][2]) {
      const s = Math.sqrt(1.0 + rotMatrix[1][1] - rotMatrix[0][0] - rotMatrix[2][2]) * 2
      w = (rotMatrix[0][2] - rotMatrix[2][0]) / s
      x = (rotMatrix[0][1] + rotMatrix[1][0]) / s
      y = 0.25 * s
      z = (rotMatrix[1][2] + rotMatrix[2][1]) / s
    } else {
      const s = Math.sqrt(1.0 + rotMatrix[2][2] - rotMatrix[0][0] - rotMatrix[1][1]) * 2
      w = (rotMatrix[1][0] - rotMatrix[0][1]) / s
      x = (rotMatrix[0][2] + rotMatrix[2][0]) / s
      y = (rotMatrix[1][2] + rotMatrix[2][1]) / s
      z = 0.25 * s
    }

    this.rotation = new Quaternion(x, y, z, w).normalize()
    this._markDirty()
    return this
  }

  addChild(child) {
    if (child.parent) {
      child.parent.removeChild(child)
    }
    child.parent = this
    this.children.push(child)
    child._markDirty()
    return this
  }

  removeChild(child) {
    const index = this.children.indexOf(child)
    if (index !== -1) {
      this.children.splice(index, 1)
      child.parent = null
      child._markDirty()
    }
    return this
  }

  getLocalMatrix() {
    if (this._isDirty) {
      const T = Matrix4.translation(this.position.x, this.position.y, this.position.z)
      const R = Matrix4.rotation(this.rotation)
      const S = Matrix4.scaling(this.scale.x, this.scale.y, this.scale.z)

      this._localMatrix = T.multiply(R).multiply(S)
      this._isDirty = false
    }
    return this._localMatrix
  }

  getWorldMatrix() {
    const localMatrix = this.getLocalMatrix()
    if (this.parent) {
      this._worldMatrix = this.parent.getWorldMatrix().multiply(localMatrix)
    } else {
      this._worldMatrix = localMatrix
    }
    return this._worldMatrix
  }

  getWorldPosition() {
    const worldMatrix = this.getWorldMatrix()
    return new Vector3(worldMatrix.values[12], worldMatrix.values[13], worldMatrix.values[14])
  }

  getForward() {
    return this.rotation.rotateVector(Vector3.forward())
  }

  getRight() {
    return this.rotation.rotateVector(Vector3.right())
  }

  getUp() {
    return this.rotation.rotateVector(Vector3.up())
  }

  _markDirty() {
    this._isDirty = true
    // Mark all children as dirty too
    this.children.forEach((child) => child._markDirty())
  }
}

// Camera class for 3D rendering
class Camera3D {
  constructor() {
    this.transform = new Transform3D()
    this.fov = Math.PI / 4 // 45 degrees in radians
    this.aspectRatio = 16 / 9
    this.nearClip = 0.1
    this.farClip = 1000
    this.projectionType = "perspective" // 'perspective' or 'orthographic'
    this.orthographicSize = 5
    this._projectionMatrix = Matrix4.identity()
    this._viewMatrix = Matrix4.identity()
    this._isDirty = true
  }

  setPerspective(fov, aspectRatio, near, far) {
    this.fov = fov
    this.aspectRatio = aspectRatio
    this.nearClip = near
    this.farClip = far
    this.projectionType = "perspective"
    this._isDirty = true
    return this
  }

  setOrthographic(size, aspectRatio, near, far) {
    this.orthographicSize = size
    this.aspectRatio = aspectRatio
    this.nearClip = near
    this.farClip = far
    this.projectionType = "orthographic"
    this._isDirty = true
    return this
  }

  getProjectionMatrix() {
    if (this._isDirty) {
      if (this.projectionType === "perspective") {
        this._projectionMatrix = Matrix4.perspective(this.fov, this.aspectRatio, this.nearClip, this.farClip)
      } else {
        // Orthographic projection
        const halfSize = this.orthographicSize * 0.5
        const left = -halfSize * this.aspectRatio
        const right = halfSize * this.aspectRatio
        const bottom = -halfSize
        const top = halfSize

        this._projectionMatrix = new Matrix4([
          2 / (right - left),
          0,
          0,
          0,
          0,
          2 / (top - bottom),
          0,
          0,
          0,
          0,
          -2 / (this.farClip - this.nearClip),
          0,
          -(right + left) / (right - left),
          -(top + bottom) / (top - bottom),
          -(this.farClip + this.nearClip) / (this.farClip - this.nearClip),
          1,
        ])
      }
      this._isDirty = false
    }
    return this._projectionMatrix
  }

  getViewMatrix() {
    const worldMatrix = this.transform.getWorldMatrix()
    this._viewMatrix = worldMatrix.inverse()
    return this._viewMatrix
  }

  screenToWorldRay(screenX, screenY, screenWidth, screenHeight) {
    // Convert screen coordinates to normalized device coordinates (-1 to 1)
    const x = (2.0 * screenX) / screenWidth - 1.0
    const y = 1.0 - (2.0 * screenY) / screenHeight

    // Create points in clip space
    const nearPoint = new Vector3(x, y, -1) // Near plane
    const farPoint = new Vector3(x, y, 1) // Far plane

    // Get inverse matrices
    const invProjection = this.getProjectionMatrix().inverse()
    const invView = this.getViewMatrix().inverse()
    const invViewProjection = invView.multiply(invProjection)

    // Transform to world space
    const worldNear = invViewProjection.transformPoint(nearPoint)
    const worldFar = invViewProjection.transformPoint(farPoint)

    // Create ray
    const origin = worldNear
    const direction = worldFar.subtract(worldNear).normalize()

    return { origin, direction }
  }

  worldToScreen(worldPoint, screenWidth, screenHeight) {
    const viewMatrix = this.getViewMatrix()
    const projectionMatrix = this.getProjectionMatrix()
    const viewProjectionMatrix = projectionMatrix.multiply(viewMatrix)

    const clipSpace = viewProjectionMatrix.transformPoint(worldPoint)

    // Convert from clip space to screen space
    const screenX = (clipSpace.x + 1) * 0.5 * screenWidth
    const screenY = (1 - clipSpace.y) * 0.5 * screenHeight

    return { x: screenX, y: screenY, depth: clipSpace.z }
  }
}

// 3D GameObject class
class GameObject3D {
  constructor(name = "GameObject") {
    this.name = name
    this.transform = new Transform3D()
    this.mesh = null
    this.material = null
    this.visible = true
    this.castShadows = true
    this.receiveShadows = true
    this.components = new Map()
    this.children = []
    this.parent = null
    this._id = Math.random().toString(36).substr(2, 9)
  }

  setMesh(mesh) {
    this.mesh = mesh
    return this
  }

  setMaterial(material) {
    this.material = material
    return this
  }

  addComponent(name, component) {
    this.components.set(name, component)
    if (component.gameObject !== undefined) {
      component.gameObject = this
    }
    if (component.start && typeof component.start === "function") {
      component.start()
    }
    return this
  }

  getComponent(name) {
    return this.components.get(name)
  }

  removeComponent(name) {
    const component = this.components.get(name)
    if (component && component.destroy && typeof component.destroy === "function") {
      component.destroy()
    }
    this.components.delete(name)
    return this
  }

  addChild(child) {
    if (child.parent) {
      child.parent.removeChild(child)
    }
    child.parent = this
    this.children.push(child)
    this.transform.addChild(child.transform)
    return this
  }

  removeChild(child) {
    const index = this.children.indexOf(child)
    if (index !== -1) {
      this.children.splice(index, 1)
      child.parent = null
      this.transform.removeChild(child.transform)
    }
    return this
  }

  findChild(name) {
    return this.children.find((child) => child.name === name)
  }

  findChildrenByTag(tag) {
    const result = []

    const search = (obj) => {
      if (obj.tag === tag) {
        result.push(obj)
      }
      obj.children.forEach(search)
    }

    this.children.forEach(search)
    return result
  }

  update(deltaTime) {
    // Update all components
    this.components.forEach((component) => {
      if (component.update && typeof component.update === "function") {
        component.update(deltaTime)
      }
    })

    // Update children
    this.children.forEach((child) => {
      if (child.update) {
        child.update(deltaTime)
      }
    })
  }

  static createCube(name = "Cube", size = 1) {
    const gameObject = new GameObject3D(name)
    gameObject.setMesh(Mesh.createCube(size))
    gameObject.setMaterial(Material.basic())
    return gameObject
  }

  static createSphere(name = "Sphere", radius = 1, segments = 16) {
    const gameObject = new GameObject3D(name)
    gameObject.setMesh(Mesh.createSphere(radius, segments))
    gameObject.setMaterial(Material.basic())
    return gameObject
  }

  static createPlane(name = "Plane", width = 1, height = 1) {
    const gameObject = new GameObject3D(name)
    gameObject.setMesh(Mesh.createPlane(width, height))
    gameObject.setMaterial(Material.basic())
    return gameObject
  }
}

// Scene management
class Scene3D {
  constructor(name = "Scene") {
    this.name = name
    this.gameObjects = []
    this.lights = []
    this.cameras = []
    this.activeCamera = null
    this.backgroundColor = [0.2, 0.3, 0.4, 1.0] // RGBA
    this.fog = null
    this.ambientLight = [0.2, 0.2, 0.2]
  }

  addGameObject(gameObject) {
    this.gameObjects.push(gameObject)
    return this
  }

  removeGameObject(gameObject) {
    const index = this.gameObjects.indexOf(gameObject)
    if (index !== -1) {
      this.gameObjects.splice(index, 1)
    }
    return this
  }

  addLight(light) {
    this.lights.push(light)
    return this
  }

  removeLight(light) {
    const index = this.lights.indexOf(light)
    if (index !== -1) {
      this.lights.splice(index, 1)
    }
    return this
  }

  addCamera(camera) {
    this.cameras.push(camera)
    if (!this.activeCamera) {
      this.activeCamera = camera
    }
    return this
  }

  removeCamera(camera) {
    const index = this.cameras.indexOf(camera)
    if (index !== -1) {
      this.cameras.splice(index, 1)
      if (this.activeCamera === camera) {
        this.activeCamera = this.cameras.length > 0 ? this.cameras[0] : null
      }
    }
    return this
  }

  setActiveCamera(camera) {
    if (this.cameras.includes(camera)) {
      this.activeCamera = camera
    }
    return this
  }

  findGameObject(name) {
    return this.gameObjects.find((obj) => obj.name === name)
  }

  findGameObjectsWithTag(tag) {
    return this.gameObjects.filter((obj) => obj.tag === tag)
  }

  update(deltaTime) {
    this.gameObjects.forEach((gameObject) => {
      if (gameObject.update) {
        gameObject.update(deltaTime)
      }
    })
  }

  getVisibleObjects(camera = null) {
    const cam = camera || this.activeCamera
    if (!cam) return this.gameObjects.filter((obj) => obj.visible)

    // TODO: Implement frustum culling
    // For now, return all visible objects
    return this.gameObjects.filter((obj) => obj.visible)
  }
}

// Physics and collision detection
class Physics3D {
  static raycast(origin, direction, maxDistance = Number.POSITIVE_INFINITY, objects = []) {
    let closestHit = null
    let closestDistance = maxDistance

    objects.forEach((obj) => {
      if (!obj.mesh || !obj.visible) return

      const hit = this.rayIntersectMesh(origin, direction, obj)
      if (hit && hit.distance < closestDistance) {
        closestDistance = hit.distance
        closestHit = hit
      }
    })

    return closestHit
  }

  static rayIntersectMesh(origin, direction, gameObject) {
    const mesh = gameObject.mesh
    const worldMatrix = gameObject.transform.getWorldMatrix()

    // Transform ray to local space
    const invMatrix = worldMatrix.inverse()
    const localOrigin = invMatrix.transformPoint(origin)
    const localDirection = invMatrix.transformDirection(direction).normalize()

    let closestDistance = Number.POSITIVE_INFINITY
    let closestPoint = null
    let closestNormal = null

    // Check intersection with each triangle
    for (let i = 0; i < mesh.indices.length; i += 3) {
      const idx1 = mesh.indices[i] * 3
      const idx2 = mesh.indices[i + 1] * 3
      const idx3 = mesh.indices[i + 2] * 3

      const v1 = new Vector3(mesh.vertices[idx1], mesh.vertices[idx1 + 1], mesh.vertices[idx1 + 2])
      const v2 = new Vector3(mesh.vertices[idx2], mesh.vertices[idx2 + 1], mesh.vertices[idx2 + 2])
      const v3 = new Vector3(mesh.vertices[idx3], mesh.vertices[idx3 + 1], mesh.vertices[idx3 + 2])

      const hit = this.rayTriangleIntersect(localOrigin, localDirection, v1, v2, v3)
      if (hit && hit.distance < closestDistance) {
        closestDistance = hit.distance
        closestPoint = hit.point
        closestNormal = hit.normal
      }
    }

    if (closestPoint) {
      // Transform back to world space
      const worldPoint = worldMatrix.transformPoint(closestPoint)
      const worldNormal = worldMatrix.transformDirection(closestNormal).normalize()

      return {
        distance: origin.distanceTo(worldPoint),
        point: worldPoint,
        normal: worldNormal,
        gameObject: gameObject,
      }
    }

    return null
  }

  static rayTriangleIntersect(origin, direction, v1, v2, v3) {
    const EPSILON = 0.0000001

    // Calculate triangle edges
    const edge1 = v2.subtract(v1)
    const edge2 = v3.subtract(v1)

    // Calculate determinant
    const h = direction.cross(edge2)
    const a = edge1.dot(h)

    if (a > -EPSILON && a < EPSILON) {
      return null // Ray is parallel to triangle
    }

    const f = 1.0 / a
    const s = origin.subtract(v1)
    const u = f * s.dot(h)

    if (u < 0.0 || u > 1.0) {
      return null
    }

    const q = s.cross(edge1)
    const v = f * direction.dot(q)

    if (v < 0.0 || u + v > 1.0) {
      return null
    }

    // Calculate distance along ray
    const t = f * edge2.dot(q)

    if (t > EPSILON) {
      const point = origin.add(direction.multiply(t))
      const normal = edge1.cross(edge2).normalize()

      return {
        distance: t,
        point: point,
        normal: normal,
      }
    }

    return null // Line intersection but not ray intersection
  }

  static sphereIntersect(center1, radius1, center2, radius2) {
    const distance = center1.distanceTo(center2)
    return distance <= radius1 + radius2
  }

  static boxIntersect(box1Min, box1Max, box2Min, box2Max) {
    return (
      box1Min.x <= box2Max.x &&
      box1Max.x >= box2Min.x &&
      box1Min.y <= box2Max.y &&
      box1Max.y >= box2Min.y &&
      box1Min.z <= box2Max.z &&
      box1Max.z >= box2Min.z
    )
  }
}

// Input handling for 3D interactions
class Input3D {
  constructor(canvas) {
    this.canvas = canvas
    this.mouse = { x: 0, y: 0, deltaX: 0, deltaY: 0 }
    this.mouseButtons = { left: false, right: false, middle: false }
    this.keys = {}
    this.touches = []

    this._setupEventListeners()
  }

  _setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const newX = e.clientX - rect.left
      const newY = e.clientY - rect.top

      this.mouse.deltaX = newX - this.mouse.x
      this.mouse.deltaY = newY - this.mouse.y
      this.mouse.x = newX
      this.mouse.y = newY
    })

    this.canvas.addEventListener("mousedown", (e) => {
      switch (e.button) {
        case 0:
          this.mouseButtons.left = true
          break
        case 1:
          this.mouseButtons.middle = true
          break
        case 2:
          this.mouseButtons.right = true
          break
      }
    })

    this.canvas.addEventListener("mouseup", (e) => {
      switch (e.button) {
        case 0:
          this.mouseButtons.left = false
          break
        case 1:
          this.mouseButtons.middle = false
          break
        case 2:
          this.mouseButtons.right = false
          break
      }
    })

    // Keyboard events
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true
    })

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false
    })

    // Touch events
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault()
      this.touches = Array.from(e.touches)
    })

    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault()
      this.touches = Array.from(e.touches)
    })

    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault()
      this.touches = Array.from(e.touches)
    })

    // Prevent context menu on right click
    this.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault()
    })
  }

  getMousePosition() {
    return { x: this.mouse.x, y: this.mouse.y }
  }

  getMouseDelta() {
    return { x: this.mouse.deltaX, y: this.mouse.deltaY }
  }

  isMouseButtonDown(button) {
    switch (button.toLowerCase()) {
      case "left":
        return this.mouseButtons.left
      case "right":
        return this.mouseButtons.right
      case "middle":
        return this.mouseButtons.middle
      default:
        return false
    }
  }

  isKeyDown(key) {
    return !!this.keys[key]
  }

  resetDeltas() {
    this.mouse.deltaX = 0
    this.mouse.deltaY = 0
  }
}

// Main 3D Game Engine
class GameEngine3D {
  constructor(canvas) {
    this.canvas = canvas
    this.gl = null
    this.scene = new Scene3D()
    this.input = new Input3D(canvas)
    this.isRunning = false
    this.lastTime = 0
    this.deltaTime = 0
    this.targetFPS = 60

    // Rendering statistics
    this.stats = {
      fps: 0,
      frameCount: 0,
      lastStatsUpdate: 0,
      drawCalls: 0,
      triangles: 0,
    }

    // Shader programs (to be implemented in renderer)
    this.shaders = new Map()

    this._initializeWebGL()
    this._loadDefaultShaders()
  }

  _initializeWebGL() {
    this.gl = this.canvas.getContext("webgl2") || this.canvas.getContext("webgl")

    if (!this.gl) {
      throw new Error("WebGL not supported")
    }

    // Set up WebGL state
    this.gl.enable(this.gl.DEPTH_TEST)
    this.gl.enable(this.gl.CULL_FACE)
    this.gl.cullFace(this.gl.BACK)
    this.gl.frontFace(this.gl.CCW)

    // Set clear color
    this.gl.clearColor(0.2, 0.3, 0.4, 1.0)
  }

  _loadDefaultShaders() {
    // Basic vertex shader
    const basicVertexShader = `
      attribute vec3 position;
      attribute vec3 normal;
      attribute vec2 uv;
      
      uniform mat4 modelMatrix;
      uniform mat4 viewMatrix;
      uniform mat4 projectionMatrix;
      uniform mat3 normalMatrix;
      
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vNormal = normalMatrix * normal;
        vUv = uv;
        
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `

    // Basic fragment shader
    const basicFragmentShader = `
      precision mediump float;
      
      uniform vec3 color;
      uniform vec3 ambientLight;
      
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightColor = ambientLight;
        
        gl_FragColor = vec4(color * lightColor, 1.0);
      }
    `

    this.shaders.set("basic", this._createShaderProgram(basicVertexShader, basicFragmentShader))
  }

  _createShaderProgram(vertexSource, fragmentSource) {
    const vertexShader = this._compileShader(this.gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = this._compileShader(this.gl.FRAGMENT_SHADER, fragmentSource)

    const program = this.gl.createProgram()
    this.gl.attachShader(program, vertexShader)
    this.gl.attachShader(program, fragmentShader)
    this.gl.linkProgram(program)

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error("Shader program linking failed:", this.gl.getProgramInfoLog(program))
      return null
    }

    return program
  }

  _compileShader(type, source) {
    const shader = this.gl.createShader(type)
    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error("Shader compilation failed:", this.gl.getShaderInfoLog(shader))
      this.gl.deleteShader(shader)
      return null
    }

    return shader
  }

  start() {
    if (this.isRunning) return

    this.isRunning = true
    this.lastTime = performance.now()
    this._gameLoop()
  }

  stop() {
    this.isRunning = false
  }

  _gameLoop() {
    if (!this.isRunning) return

    const currentTime = performance.now()
    this.deltaTime = (currentTime - this.lastTime) / 1000
    this.lastTime = currentTime

    // Update scene
    this.scene.update(this.deltaTime)

    // Render scene
    this._render()

    // Update statistics
    this._updateStats()

    // Reset input deltas
    this.input.resetDeltas()

    requestAnimationFrame(() => this._gameLoop())
  }

  _render() {
    // Clear the canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

    // Reset stats
    this.stats.drawCalls = 0
    this.stats.triangles = 0

    if (!this.scene.activeCamera) return

    const camera = this.scene.activeCamera
    const viewMatrix = camera.getViewMatrix()
    const projectionMatrix = camera.getProjectionMatrix()

    // Get visible objects
    const visibleObjects = this.scene.getVisibleObjects(camera)

    // Render each object
    visibleObjects.forEach((gameObject) => {
      if (gameObject.mesh && gameObject.material) {
        this._renderObject(gameObject, viewMatrix, projectionMatrix)
      }
    })
  }

  _renderObject(gameObject, viewMatrix, projectionMatrix) {
    const mesh = gameObject.mesh
    const material = gameObject.material
    const worldMatrix = gameObject.transform.getWorldMatrix()

    // Get shader program
    const shaderProgram = this.shaders.get(material.type) || this.shaders.get("basic")
    if (!shaderProgram) return

    this.gl.useProgram(shaderProgram)

    // Set up vertex buffers
    const vertexBuffer = this._getOrCreateBuffer(mesh, "vertices")
    const indexBuffer = this._getOrCreateBuffer(mesh, "indices")
    const normalBuffer = this._getOrCreateBuffer(mesh, "normals")
    const uvBuffer = this._getOrCreateBuffer(mesh, "uvs")

    // Set up attributes
    const positionLocation = this.gl.getAttribLocation(shaderProgram, "position")
    if (positionLocation !== -1) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer)
      this.gl.enableVertexAttribArray(positionLocation)
      this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0)
    }

    const normalLocation = this.gl.getAttribLocation(shaderProgram, "normal")
    if (normalLocation !== -1 && normalBuffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer)
      this.gl.enableVertexAttribArray(normalLocation)
      this.gl.vertexAttribPointer(normalLocation, 3, this.gl.FLOAT, false, 0, 0)
    }

    const uvLocation = this.gl.getAttribLocation(shaderProgram, "uv")
    if (uvLocation !== -1 && uvBuffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uvBuffer)
      this.gl.enableVertexAttribArray(uvLocation)
      this.gl.vertexAttribPointer(uvLocation, 2, this.gl.FLOAT, false, 0, 0)
    }

    // Set up uniforms
    const modelMatrixLocation = this.gl.getUniformLocation(shaderProgram, "modelMatrix")
    if (modelMatrixLocation) {
      this.gl.uniformMatrix4fv(modelMatrixLocation, false, worldMatrix.values)
    }

    const viewMatrixLocation = this.gl.getUniformLocation(shaderProgram, "viewMatrix")
    if (viewMatrixLocation) {
      this.gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix.values)
    }

    const projectionMatrixLocation = this.gl.getUniformLocation(shaderProgram, "projectionMatrix")
    if (projectionMatrixLocation) {
      this.gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix.values)
    }

    // Normal matrix (inverse transpose of model matrix)
    const normalMatrixLocation = this.gl.getUniformLocation(shaderProgram, "normalMatrix")
    if (normalMatrixLocation) {
      const normalMatrix = worldMatrix.inverse().transpose()
      // Extract 3x3 matrix from 4x4
      const normalMatrix3x3 = [
        normalMatrix.values[0],
        normalMatrix.values[1],
        normalMatrix.values[2],
        normalMatrix.values[4],
        normalMatrix.values[5],
        normalMatrix.values[6],
        normalMatrix.values[8],
        normalMatrix.values[9],
        normalMatrix.values[10],
      ]
      this.gl.uniformMatrix3fv(normalMatrixLocation, false, normalMatrix3x3)
    }

    // Material uniforms
    const colorLocation = this.gl.getUniformLocation(shaderProgram, "color")
    if (colorLocation) {
      this.gl.uniform3fv(colorLocation, material.color)
    }

    const ambientLightLocation = this.gl.getUniformLocation(shaderProgram, "ambientLight")
    if (ambientLightLocation) {
      this.gl.uniform3fv(ambientLightLocation, this.scene.ambientLight)
    }

    // Draw the object
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    this.gl.drawElements(this.gl.TRIANGLES, mesh.indices.length, this.gl.UNSIGNED_SHORT, 0)

    // Update stats
    this.stats.drawCalls++
    this.stats.triangles += mesh.indices.length / 3
  }

  _getOrCreateBuffer(mesh, type) {
    // Simple buffer caching - in a real engine, this would be more sophisticated
    const cacheKey = `${mesh._id || "mesh"}_${type}`

    if (!mesh._buffers) {
      mesh._buffers = {}
    }

    if (!mesh._buffers[type]) {
      const buffer = this.gl.createBuffer()

      switch (type) {
        case "vertices":
          this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
          this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), this.gl.STATIC_DRAW)
          break

        case "indices":
          this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer)
          this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), this.gl.STATIC_DRAW)
          break

        case "normals":
          if (mesh.normals.length > 0) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(mesh.normals), this.gl.STATIC_DRAW)
          } else {
            return null
          }
          break

        case "uvs":
          if (mesh.uvs.length > 0) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(mesh.uvs), this.gl.STATIC_DRAW)
          } else {
            return null
          }
          break
      }

      mesh._buffers[type] = buffer
    }

    return mesh._buffers[type]
  }

  _updateStats() {
    this.stats.frameCount++
    const currentTime = performance.now()

    if (currentTime - this.stats.lastStatsUpdate >= 1000) {
      this.stats.fps = this.stats.frameCount
      this.stats.frameCount = 0
      this.stats.lastStatsUpdate = currentTime
    }
  }

  // Public API methods
  setScene(scene) {
    this.scene = scene
    return this
  }

  getScene() {
    return this.scene
  }

  createCamera() {
    const camera = new Camera3D()
    camera.setPerspective(Math.PI / 4, this.canvas.width / this.canvas.height, 0.1, 1000)
    return camera
  }

  createGameObject(name) {
    return new GameObject3D(name)
  }

  createLight(type, color, intensity) {
    return new Light(type, color, intensity)
  }

  loadMesh(vertices, indices, normals, uvs) {
    return new Mesh(vertices, indices, normals, uvs)
  }

  createMaterial(options) {
    return new Material(options)
  }

  // Utility methods
  screenToWorld(x, y) {
    if (!this.scene.activeCamera) return null

    return this.scene.activeCamera.screenToWorldRay(x, y, this.canvas.width, this.canvas.height)
  }

  worldToScreen(worldPosition) {
    if (!this.scene.activeCamera) return null

    return this.scene.activeCamera.worldToScreen(worldPosition, this.canvas.width, this.canvas.height)
  }

  raycast(origin, direction, maxDistance, objects) {
    return Physics3D.raycast(origin, direction, maxDistance, objects || this.scene.gameObjects)
  }

  // DSL Support - Simple scene description language
  loadSceneFromDSL(dslCode) {
    const dsl = new GameEngineDSL(this)
    return dsl.parse(dslCode)
  }

  getStats() {
    return { ...this.stats }
  }

  resize(width, height) {
    this.canvas.width = width
    this.canvas.height = height
    this.gl.viewport(0, 0, width, height)

    // Update camera aspect ratio
    if (this.scene.activeCamera) {
      this.scene.activeCamera.aspectRatio = width / height
      this.scene.activeCamera._isDirty = true
    }
  }
}

// Domain Specific Language for 3D Scene Creation
class GameEngineDSL {
  constructor(engine) {
    this.engine = engine
    this.scene = engine.scene
    this.variables = new Map()
    this.functions = new Map()

    this._setupBuiltinFunctions()
  }

  _setupBuiltinFunctions() {
    // Scene management
    this.functions.set("scene", (name) => {
      this.scene.name = name
      return this.scene
    })

    // Camera creation
    this.functions.set("camera", (name, type = "perspective") => {
      const camera = this.engine.createCamera()
      camera.name = name
      this.scene.addCamera(camera)
      this.variables.set(name, camera)
      return camera
    })

    // GameObject creation
    this.functions.set("cube", (name, size = 1) => {
      const obj = GameObject3D.createCube(name, size)
      this.scene.addGameObject(obj)
      this.variables.set(name, obj)
      return obj
    })

    this.functions.set("sphere", (name, radius = 1, segments = 16) => {
      const obj = GameObject3D.createSphere(name, radius, segments)
      this.scene.addGameObject(obj)
      this.variables.set(name, obj)
      return obj
    })

    this.functions.set("plane", (name, width = 1, height = 1) => {
      const obj = GameObject3D.createPlane(name, width, height)
      this.scene.addGameObject(obj)
      this.variables.set(name, obj)
      return obj
    })

    // Transform operations
    this.functions.set("position", (obj, x, y, z) => {
      if (typeof obj === "string") obj = this.variables.get(obj)
      obj.transform.setPosition(x, y, z)
      return obj
    })

    this.functions.set("rotation", (obj, x, y, z) => {
      if (typeof obj === "string") obj = this.variables.get(obj)
      obj.transform.setRotation(x, y, z)
      return obj
    })

    this.functions.set("scale", (obj, x, y, z) => {
      if (typeof obj === "string") obj = this.variables.get(obj)
      obj.transform.setScale(x, y || x, z || x)
      return obj
    })

    // Material operations
    this.functions.set("material", (obj, type, ...args) => {
      if (typeof obj === "string") obj = this.variables.get(obj)

      let material
      switch (type) {
        case "basic":
          material = Material.basic(args[0] || [1, 1, 1])
          break
        case "phong":
          material = Material.phong(args[0] || [1, 1, 1], args[1] || 0.5)
          break
        case "pbr":
          material = Material.pbr(args[0] || [1, 1, 1], args[1] || 0.5, args[2] || 0.0)
          break
        default:
          material = Material.basic()
      }

      obj.setMaterial(material)
      return obj
    })

    // Light creation
    this.functions.set("light", (name, type, color = [1, 1, 1], intensity = 1.0) => {
      const light = this.engine.createLight(type, color, intensity)
      light.name = name
      this.scene.addLight(light)
      this.variables.set(name, light)
      return light
    })

    // Utility functions
    this.functions.set("color", (r, g, b) => [r, g, b])
    this.functions.set("vec3", (x, y, z) => new Vector3(x, y, z))
    this.functions.set("random", (min = 0, max = 1) => Math.random() * (max - min) + min)
  }

  parse(dslCode) {
    // Simple DSL parser - in a real implementation, you'd use a proper parser
    const lines = dslCode.split("\n")
    const context = { variables: this.variables, functions: this.functions }

    try {
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("//")) continue

        this._executeLine(trimmed, context)
      }
    } catch (error) {
      console.error("DSL parsing error:", error)
      throw error
    }

    return this.scene
  }

  _executeLine(line, context) {
    // Remove semicolons and split by spaces/commas
    line = line.replace(/;/g, "")

    // Handle variable assignment
    if (line.includes("=")) {
      const [varName, expression] = line.split("=").map((s) => s.trim())
      const result = this._evaluateExpression(expression, context)
      context.variables.set(varName, result)
      return
    }

    // Handle function calls
    this._evaluateExpression(line, context)
  }

  _evaluateExpression(expression, context) {
    expression = expression.trim()

    // Handle function calls
    const functionMatch = expression.match(/^(\w+)\s*$$(.*)$$$/)
    if (functionMatch) {
      const [, funcName, argsStr] = functionMatch
      const args = this._parseArguments(argsStr, context)

      const func = context.functions.get(funcName)
      if (func) {
        return func(...args)
      } else {
        throw new Error(`Unknown function: ${funcName}`)
      }
    }

    // Handle variable access
    if (context.variables.has(expression)) {
      return context.variables.get(expression)
    }

    // Handle literals
    if (expression.startsWith("[") && expression.endsWith("]")) {
      // Array literal
      const arrayContent = expression.slice(1, -1)
      return this._parseArguments(arrayContent, context)
    }

    // Handle numbers
    if (!isNaN(Number.parseFloat(expression))) {
      return Number.parseFloat(expression)
    }

    // Handle strings
    if (
      (expression.startsWith('"') && expression.endsWith('"')) ||
      (expression.startsWith("'") && expression.endsWith("'"))
    ) {
      return expression.slice(1, -1)
    }

    throw new Error(`Cannot evaluate expression: ${expression}`)
  }

  _parseArguments(argsStr, context) {
    if (!argsStr.trim()) return []

    const args = []
    let currentArg = ""
    let inString = false
    let stringChar = ""
    let depth = 0

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i]

      if (!inString) {
        if (char === '"' || char === "'") {
          inString = true
          stringChar = char
          currentArg += char
        } else if (char === "[" || char === "(") {
          depth++
          currentArg += char
        } else if (char === "]" || char === ")") {
          depth--
          currentArg += char
        } else if (char === "," && depth === 0) {
          args.push(this._evaluateExpression(currentArg.trim(), context))
          currentArg = ""
        } else {
          currentArg += char
        }
      } else {
        currentArg += char
        if (char === stringChar && argsStr[i - 1] !== "\\") {
          inString = false
        }
      }
    }

    if (currentArg.trim()) {
      args.push(this._evaluateExpression(currentArg.trim(), context))
    }

    return args
  }
}

// Export the main classes for use
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    GameEngine3D,
    Vector3,
    Quaternion,
    Matrix4,
    Transform3D,
    Camera3D,
    GameObject3D,
    Scene3D,
    Mesh,
    Material,
    Light,
    Physics3D,
    Input3D,
    GameEngineDSL,
  }
}

// Example usage and DSL sample:
/*
// Create engine
const canvas = document.getElementById('gameCanvas');
const engine = new GameEngine3D(canvas);

// Sample DSL code
const sceneCode = `
// Create a simple 3D scene
scene("My 3D Scene");

// Create camera
mainCamera = camera("MainCamera", "perspective");
position(mainCamera, 0, 2, 5);
rotation(mainCamera, -0.3, 0, 0);

// Create some objects
playerCube = cube("Player", 1);
position(playerCube, 0, 0, 0);
material(playerCube, "phong", color(0.8, 0.2, 0.2), 0.3);

ground = plane("Ground", 10, 10);
position(ground, 0, -1, 0);
material(ground, "basic", color(0.2, 0.8, 0.2));

// Add lighting
sun = light("Sun", "directional", color(1, 1, 0.9), 1.0);
ambient = light("Ambient", "ambient", color(0.2, 0.2, 0.3), 0.5);
`;

// Load and start the scene
engine.loadSceneFromDSL(sceneCode);
engine.start();
*/
