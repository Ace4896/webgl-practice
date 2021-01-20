import { Shader } from "./modules/shaders.js";

/** @member {WebGL2RenderingContext} */
let gl;

/** @member {Shader} */
let shader;

let mouseX = 0;
let mouseY = 0;

/**
 * Draws the current scene.
 */
function drawScene() {
  gl.useProgram(shader.program);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Setup triangle to be drawn
  const positions = new Float32Array([
    0, 0.5,
    -0.5, -0.5,
    0.5, -0.5,
  ]);

  gl.bindVertexArray(shader.vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffers.position);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  // Setup model-view matrix
  let modelViewMatrix = mat3.create();

  // Rotate to point towards last mouse position
  // theta = 0 --> point upwards
  // theta = pi/2 --> point west
  const centreX = gl.canvas.clientWidth / 2;
  const centreY = gl.canvas.clientHeight / 2;
  let theta = Math.abs(Math.atan((centreY - mouseY) / (centreX - mouseX)));

  // Check which quadrant we're in
  if (mouseX < centreX && mouseY < centreY) {
    // Mouse is in top-left
    theta = (Math.PI / 2) - theta;
  }
  else if (mouseX < centreX && mouseY > centreY) {
    // Mouse is in bottom-left
    theta += Math.PI / 2;
  }
  else if (mouseX > centreX && mouseY > centreY) {
    // Mouse is in bottom-right
    theta = -((Math.PI / 2) + theta);
  }
  else if (mouseX > centreX && mouseY < centreY) {
    // Mouse is in top-right
    theta = -((Math.PI / 2) - theta);
  }

  // Rotate, then move to middle of screen
  mat3.rotate(modelViewMatrix, modelViewMatrix, theta);

  gl.uniformMatrix3fv(shader.uniforms.modelViewMatrix, false, modelViewMatrix);

  gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
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

  canvas.addEventListener('mousedown', (ev) => {
    mouseX = ev.offsetX;
    mouseY = ev.offsetY;

    drawScene();
  });

  drawScene();
}

window.onload = main;
