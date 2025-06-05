// /src/engine/core/GameObject.js

import { generateId, vec2 } from "./utils.js"

export class GameObject {
  constructor(options = {}) {
    this.id = options.id || generateId()

    this.position = options.position || vec2(0, 0)

    this.size = options.size || vec2(32, 32)

    this.velocity = options.velocity || vec2(0, 0)

    this.acceleration = options.acceleration || vec2(0, 0)

    this.color = options.color || "#FFFFFF"

    this.tag = options.tag || "default"

    this.components = []

    this.active = true

    this.collidable = options.collidable !== false

    this.gravity = options.gravity !== false

    this.grounded = false
  }

  addComponent(component) {
    component.gameObject = this

    this.components.push(component)

    return component
  }

  getComponent(type) {
    return this.components.find((c) => c instanceof type)
  }

  update(deltaTime) {
    if (this.gravity) this.acceleration.y = 9.8 * 60

    this.velocity.x += this.acceleration.x * deltaTime

    this.velocity.y += this.acceleration.y * deltaTime

    this.velocity.x *= 0.9 // friction

    if (this.velocity.y > 20) this.velocity.y = 20

    const newPos = {
      x: this.position.x + this.velocity.x * deltaTime,

      y: this.position.y + this.velocity.y * deltaTime,
    }

    this.position = newPos

    for (const c of this.components) {
      if (c.update) c.update(deltaTime)
    }
  }

  draw(ctx) {
    if (!this.active) return

    ctx.fillStyle = this.color

    ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y)

    for (const c of this.components) {
      if (c.draw) c.draw(ctx)
    }
  }
}
