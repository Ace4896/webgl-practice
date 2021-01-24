import { F_COLOURS, F_VERTICES } from "./modules/models.js";
import { Shader } from "./modules/shaders.js";
import {toRadians} from "./modules/misc-utils.js";

/** @member {WebGL2RenderingContext} */
let gl;

/** @member {Shader} */
let shader;

let PROJECTION_MATRIX = mat4.create();
let TRANSFORMATION_MATRIX = mat4.create();

/**
 * Draws the current scene.
 */
function drawScene() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.useProgram(shader.program);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // NOTE: Invert y-axis
  mat4.ortho(PROJECTION_MATRIX, 0, gl.canvas.clientWidth, -gl.canvas.clientHeight, 0, -400, 400);
  mat4.scale(PROJECTION_MATRIX, PROJECTION_MATRIX, [1, -1, 1]);

  mat4.fromTranslation(TRANSFORMATION_MATRIX, [45, 150, 0]);
  mat4.rotate(TRANSFORMATION_MATRIX, TRANSFORMATION_MATRIX, toRadians(45), [1, 0, 0]);
  mat4.rotate(TRANSFORMATION_MATRIX, TRANSFORMATION_MATRIX, toRadians(25), [0, 1, 0]);
  mat4.rotate(TRANSFORMATION_MATRIX, TRANSFORMATION_MATRIX, toRadians(325), [0, 0, 1]);

  gl.uniformMatrix4fv(shader.uniforms.projection, false, PROJECTION_MATRIX);
  gl.uniformMatrix4fv(shader.uniforms.transformation, false, TRANSFORMATION_MATRIX);

  gl.bindVertexArray(shader.vao);
  gl.drawArrays(gl.TRIANGLES, 0, F_VERTICES.length / 3);
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

  // Setup vertices and colours in buffers
  gl.bindVertexArray(shader.vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffers.position);
  gl.bufferData(gl.ARRAY_BUFFER, F_VERTICES, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffers.colour);
  gl.bufferData(gl.ARRAY_BUFFER, F_COLOURS, gl.STATIC_DRAW);
  gl.bindVertexArray(null);

  drawScene();
}

window.onload = main;
