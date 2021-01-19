import { clamp, getTextFile } from "./modules/misc-utils.js";
import { initShaderProgram } from "./modules/webgl-utils.js";

/**
 * Class representing a vertex/fragment shader pair.
 */
class Shader {
  static VERT_SOURCE = null;
  static FRAG_SOURCE = null;

  /** @property {WebGLProgram} A compiled shader program. */
  program;

  /**
   * @property {GLint} attribs.position - The vertex position attribute
   */
  attribs;

  /**
   * @property {GLint} uniforms.resolution - The canvas resolution
   */
  uniforms;

  /**
   * @property {WebGLBuffer} buffers.position - The vertex position buffer
   */
  buffers;

  /** @property {WebGLVertexArrayObject} The VAO for this shader */
  vao;

  /**
   * Creates a new vertex/fragment shader program.
   * @param gl {WebGL2RenderingContext} The WebGL 2 rendering context.
   */
  constructor(gl) {
    if (!Shader.VERT_SOURCE || !Shader.FRAG_SOURCE) {
      console.log("Shader sources haven't been fetched yet!");
      return;
    }

    let shaderProgram = initShaderProgram(
      gl,
      Shader.VERT_SOURCE,
      Shader.FRAG_SOURCE
    );
    if (!shaderProgram) {
      return;
    }

    this.program = shaderProgram;
    this.attribs = {
      position: gl.getAttribLocation(this.program, "aPosition"),
    };
    this.uniforms = {
      resolution: gl.getUniformLocation(this.program, "uResolution"),
    };
    this.buffers = {
      position: gl.createBuffer(),
    };

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // Vertex Position
    {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
      gl.enableVertexAttribArray(this.attribs.position);

      const size = 2;
      const type = gl.FLOAT;
      const normalise = false;
      const stride = 0;
      const offset = 0;

      gl.vertexAttribPointer(
        this.attribs.position,
        size,
        type,
        normalise,
        stride,
        offset
      );
    }
  }

  static async fetchSources() {
    if (!Shader.VERT_SOURCE || !Shader.FRAG_SOURCE) {
      Shader.VERT_SOURCE = await getTextFile("./shaders/shader.vert");
      Shader.FRAG_SOURCE = await getTextFile("./shaders/shader.frag");
    }
  }
}

class Rect {
  constructor(width, height, bottom, left) {
    this.width = width;
    this.height = height;
    this.bottom = bottom;
    this.left = left;
  }

  translateHorizontally(amount, min, max) {
    this.left = clamp(this.left + amount, min, max - this.width);
    return this.left == min || this.left == max - this.width;
  }

  translateVertically(amount, min, max) {
    this.bottom = clamp(this.bottom + amount, min, max - this.height);
    return this.bottom == min || this.bottom == max - this.height;
  }

  /**
   * Returns an array of positions for drawing this rectangle using `gl.TRIANGLE_STRIP`.
   */
  getPositions() {
    return [
      this.left,
      this.bottom,
      this.left,
      this.bottom + this.height,
      this.left + this.width,
      this.bottom,
      this.left + this.width,
      this.bottom + this.height,
    ];
  }
}

// Movement speed in pixels/second
const movementSpeed = 200;
const length = 200;

let square = new Rect(length, length, -(length / 2), -(length / 2));

let lastTimestamp = Date.now();
let isMovingRight = true;

/**
 * Draws the current scene.
 * @param gl {WebGL2RenderingContext} The WebGL rendering context
 * @param shader {Shader} The shader program to use
 * @param time {DOMHighResTimeStamp} The timestamp for this call
 */
function drawScene(gl, shader, time) {
  let elapsedTimeMs = time - lastTimestamp;
  lastTimestamp = time;

  let amountMoved = movementSpeed * (elapsedTimeMs / 1000);
  if (!isMovingRight) {
    amountMoved = -amountMoved;
  }

  let isRebounding = square.translateHorizontally(
    amountMoved,
    -gl.canvas.width,
    gl.canvas.width
  );
  if (isRebounding) {
    isMovingRight = !isMovingRight;
  }

  gl.useProgram(shader.program);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform2f(shader.uniforms.resolution, gl.canvas.width, gl.canvas.height);

  const positions = new Float32Array(square.getPositions());

  gl.bindVertexArray(shader.vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffers.position);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, positions.length / 2);

  window.requestAnimationFrame((time) => drawScene(gl, shader, time));
}

/** The main method for this WebGL application */
async function main() {
  const canvas = document.getElementById("gl-canvas");
  if (!canvas) {
    console.log("Unable to find canvas with id 'gl-canvas'");
    return;
  }

  const gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("WebGL 2 is not supported on this browser");
    return;
  }

  await Shader.fetchSources();
  const shader = new Shader(gl);

  window.requestAnimationFrame((time) => drawScene(gl, shader, time));
}

window.onload = main;
