/**
 * SAAAM Code Intellisense Provider
 * Provides code completion, function signatures, and documentation for the SAAAM language
 */

class SaaamCodeIntellisense {
  constructor() {
    // SAAAM language built-in functions
    this.functions = {
      create: {
        description: 'Initialization function that runs when the object is created',
        signature: 'function create()',
        documentation: `The create function is called once when the object is created in the game world.
Use it to initialize variables, set up the initial state, and prepare the object.

Example:
function create() {
  this.position = vec2(100, 100);
  this.velocity = vec2(0, 0);
  this.health = 100;
}`
      },
      step: {
        description: 'Update function that runs every frame',
        signature: 'function step()',
        documentation: `The step function is called once per frame before drawing.
Use it for game logic, movement, collisions, input handling, and other updates.

Example:
function step() {
  // Handle input
  if (keyboard_check(vk_right)) {
    this.velocity.x = 5;
  } else if (keyboard_check(vk_left)) {
    this.velocity.x = -5;
  } else {
    this.velocity.x = 0;
  }

  // Update position
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
}`
      },
      draw: {
        description: 'Rendering function that runs every frame after step',
        signature: 'function draw()',
        documentation: `The draw function is called once per frame after step.
Use it to render the object, UI elements, and visual effects.

Example:
function draw() {
  draw_sprite(this.sprite, this.position.x, this.position.y);

  // Draw health bar
  draw_health_bar(this.position.x - 20, this.position.y - 30, 40, 5, this.health / 100);
}`
      },
      keyboard_check: {
        description: 'Check if a key is currently held down',
        signature: 'keyboard_check(key)',
        parameters: [
          { name: 'key', type: 'number', description: 'Virtual key code (vk_*) to check' }
        ],
        returnType: 'boolean',
        documentation: `Returns true if the specified key is currently held down, false otherwise.

Example:
if (keyboard_check(vk_right)) {
  // Move right
}`
      },
      keyboard_check_pressed: {
        description: 'Check if a key was just pressed this frame',
        signature: 'keyboard_check_pressed(key)',
        parameters: [
          { name: 'key', type: 'number', description: 'Virtual key code (vk_*) to check' }
        ],
        returnType: 'boolean',
        documentation: `Returns true if the specified key was pressed in the current frame, false otherwise.
Only returns true once per key press.

Example:
if (keyboard_check_pressed(vk_space)) {
  // Jump
}`
      },
      check_collision: {
        description: 'Check for collision at a position',
        signature: 'check_collision(x, y, tag)',
        parameters: [
          { name: 'x', type: 'number', description: 'X coordinate to check' },
          { name: 'y', type: 'number', description: 'Y coordinate to check' },
          { name: 'tag', type: 'string', description: 'Object tag to check collision with' }
        ],
        returnType: 'object|null',
        documentation: `Checks if there's a collision at the specified position with an object of the given tag.
Returns the colliding object if found, or null if no collision.

Example:
var enemy = check_collision(this.position.x, this.position.y, "enemy");
if (enemy) {
  take_damage(10);
}`
      },
      draw_sprite: {
        description: 'Draw a sprite at a position',
        signature: 'draw_sprite(sprite, x, y)',
        parameters: [
          { name: 'sprite', type: 'string', description: 'Name of the sprite to draw' },
          { name: 'x', type: 'number', description: 'X coordinate' },
          { name: 'y', type: 'number', description: 'Y coordinate' }
        ],
        returnType: 'void',
        documentation: `Draws the specified sprite at the given position.

Example:
draw_sprite("player_idle", this.position.x, this.position.y);`
      },
      draw_sprite_ext: {
        description: 'Draw a sprite with transformation options',
        signature: 'draw_sprite_ext(sprite, index, x, y, xscale, yscale, rotation, color, alpha)',
        parameters: [
          { name: 'sprite', type: 'string', description: 'Name of the sprite to draw' },
          { name: 'index', type: 'number', description: 'Frame index of the sprite' },
          { name: 'x', type: 'number', description: 'X coordinate' },
          { name: 'y', type: 'number', description: 'Y coordinate' },
          { name: 'xscale', type: 'number', description: 'Horizontal scale factor' },
          { name: 'yscale', type: 'number', description: 'Vertical scale factor' },
          { name: 'rotation', type: 'number', description: 'Rotation angle in degrees' },
          { name: 'color', type: 'string', description: 'Color in hex format (#RRGGBB)' },
          { name: 'alpha', type: 'number', description: 'Alpha transparency (0-1)' }
        ],
        returnType: 'void',
        documentation: `Draws the specified sprite with transformation options.

Example:
draw_sprite_ext(
  "coin",
  Math.floor(this.image_index),
  this.position.x,
  this.position.y,
  1, 1,
  this.rotation,
  "#FFFFFF",
  1
);`
      },
      vec2: {
        description: 'Create a 2D vector',
        signature: 'vec2(x, y)',
        parameters: [
          { name: 'x', type: 'number', description: 'X component' },
          { name: 'y', type: 'number', description: 'Y component' }
        ],
        returnType: 'object',
        documentation: `Creates a 2D vector with the specified x and y components.

Example:
this.position = vec2(100, 100);
this.velocity = vec2(0, 0);`
      },
      vec3: {
        description: 'Create a 3D vector',
        signature: 'vec3(x, y, z)',
        parameters: [
          { name: 'x', type: 'number', description: 'X component' },
          { name: 'y', type: 'number', description: 'Y component' },
          { name: 'z', type: 'number', description: 'Z component' }
        ],
        returnType: 'object',
        documentation: `Creates a 3D vector with the specified x, y, and z components.

Example:
this.position3d = vec3(100, 100, 0);`
      },
      play_sound: {
        description: 'Play a sound effect',
        signature: 'play_sound(sound_name)',
        parameters: [
          { name: 'sound_name', type: 'string', description: 'Name of the sound to play' }
        ],
        returnType: 'void',
        documentation: `Plays the specified sound effect.

Example:
play_sound("jump");
play_sound("explosion");`
      },
      create_effect: {
        description: 'Create a visual effect',
        signature: 'create_effect(effect_name, x, y)',
        parameters: [
          { name: 'effect_name', type: 'string', description: 'Name of the effect to create' },
          { name: 'x', type: 'number', description: 'X coordinate' },
          { name: 'y', type: 'number', description: 'Y coordinate' }
        ],
        returnType: 'object',
        documentation: `Creates a visual effect at the specified position.
Returns the created effect object.

Example:
create_effect("explosion", this.position.x, this.position.y);
create_effect("sparkle", coin.position.x, coin.position.y);`
      },
      wait: {
        description: 'Wait for the specified seconds, then execute a callback',
        signature: 'wait(seconds, callback)',
        parameters: [
          { name: 'seconds', type: 'number', description: 'Number of seconds to wait' },
          { name: 'callback', type: 'function', description: 'Function to call after waiting' }
        ],
        returnType: 'void',
        documentation: `Waits for the specified number of seconds, then executes the callback function.

Example:
wait(2, function() {
  restart_level();
});`
      },
      destroy: {
        description: 'Destroy an object',
        signature: 'destroy(object)',
        parameters: [
          { name: 'object', type: 'object', description: 'Object to destroy' }
        ],
        returnType: 'void',
        documentation: `Destroys the specified object, removing it from the game.

Example:
var coin = check_collision(this.position.x, this.position.y, "coin");
if (coin) {
  destroy(coin);
}`
      },
      restart_level: {
        description: 'Restart the current level',
        signature: 'restart_level()',
        returnType: 'void',
        documentation: `Restarts the current level.

Example:
if (this.health <= 0) {
  wait(2, function() {
    restart_level();
  });
}`
      },
      point_distance: {
        description: 'Calculate the distance between two points',
        signature: 'point_distance(x1, y1, x2, y2)',
        parameters: [
          { name: 'x1', type: 'number', description: 'X coordinate of the first point' },
          { name: 'y1', type: 'number', description: 'Y coordinate of the first point' },
          { name: 'x2', type: 'number', description: 'X coordinate of the second point' },
          { name: 'y2', type: 'number', description: 'Y coordinate of the second point' }
        ],
        returnType: 'number',
        documentation: `Calculates the distance between two points.

Example:
var distance = point_distance(
  this.position.x, this.position.y,
  player.position.x, player.position.y
);

if (distance < 200) {
  // Player is nearby
}
