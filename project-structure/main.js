import { Shader } from "./modules/shaders.js";

/**
 * Draws the current scene.
 * @param gl {WebGL2RenderingContext} The WebGL rendering context
 * @param shader {Shader} The shader program to use
 */
function drawScene(gl, shader) {
  gl.useProgram(shader.program);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform2f(shader.uniforms.resolution, gl.canvas.width, gl.canvas.height);

  // Draw a white square in the middle of the screen
  const length = 100;
  let x1 = gl.canvas.width / 2 - length / 2;
  let x2 = x1 + length;
  let y1 = gl.canvas.height / 2 - length / 2;
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

  const gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("WebGL 2 is not supported on this browser");
    return;
  }

  await Shader.fetchSources();
  const shader = new Shader(gl);

  drawScene(gl, shader);
}

window.onload = main;
