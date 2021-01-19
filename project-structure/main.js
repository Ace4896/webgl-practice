import { Shader } from "./modules/shaders.js";

/** @member {WebGL2RenderingContext} */
let gl;

/** @member {Shader} */
let shader;

/**
 * Draws the current scene.
 */
function drawScene() {
  gl.useProgram(shader.program);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform2f(shader.uniforms.resolution, gl.canvas.width, gl.canvas.height);

  // Draw a white square in the middle of the screen
  const length = 100;
  let x1 = gl.canvas.clientWidth / 2 - length / 2;
  let x2 = x1 + length;
  let y1 = gl.canvas.clientHeight / 2 - length / 2;
  let y2 = y1 + length;

  // prettier-ignore
  const positions = new Float32Array([
    x1, y1,
    x1, y2,
    x2, y1,
    x2, y2
  ]);

  gl.bindVertexArray(shader.vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffers.position);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, positions.length / 2);
}

/** The main method for this WebGL application */
async function main() {
  const canvas = document.getElementById("gl-canvas");
  if (!canvas) {
    console.log("Unable to find canvas with id 'gl-canvas'");
    return;
  }

  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("WebGL 2 is not supported on this browser");
    return;
  }

  await Shader.fetchSources();
  shader = new Shader(gl);

  drawScene();
}

window.onload = main;
