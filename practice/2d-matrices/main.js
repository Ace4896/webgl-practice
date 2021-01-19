import { toDegrees, toRadians } from "./modules/misc-utils.js";
import { Shader } from "./modules/shaders.js";

let translation = [0, 0];
let rotationRad = 0;
let scale = [1, 1];

function setupSliders(gl, shader) {
  const translateXSlider = document.getElementById("translate-x");
  const translateYSlider = document.getElementById("translate-y");
  const angleSlider = document.getElementById("angle");
  const scaleXSlider = document.getElementById("scale-x");
  const scaleYSlider = document.getElementById("scale-y");

  translateXSlider.value = translation[0];
  translateYSlider.value = translation[1];
  angleSlider.value = toDegrees(rotationRad);
  scaleXSlider.value = scale[0];
  scaleYSlider.value = scale[1];

  translateXSlider.oninput = (ev) => {
    translation[0] = translateXSlider.value;
    drawScene(gl, shader);
  };

  translateYSlider.oninput = (ev) => {
    translation[1] = translateYSlider.value;
    console.log(translation[1]);
    drawScene(gl, shader);
  };

  angleSlider.oninput = (ev) => {
    rotationRad = toRadians(angleSlider.value);
    drawScene(gl, shader);
  };

  scaleXSlider.oninput = (ev) => {
    scale[0] = scaleXSlider.value;
    drawScene(gl, shader);
  };

  scaleYSlider.oninput = (ev) => {
    scale[1] = scaleYSlider.value;
    drawScene(gl, shader);
  };
}

/**
 * Draws the current scene.
 * @param gl {WebGL2RenderingContext} The WebGL rendering context
 * @param shader {Shader} The shader program to use
 */
function drawScene(gl, shader) {
  gl.useProgram(shader.program);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let transformationMatrix = mat3.create();
  mat3.projection(
    transformationMatrix,
    gl.canvas.clientWidth,
    gl.canvas.clientHeight
  );
  mat3.translate(transformationMatrix, transformationMatrix, translation);
  mat3.rotate(transformationMatrix, transformationMatrix, rotationRad);
  mat3.scale(transformationMatrix, transformationMatrix, scale);

  gl.uniformMatrix3fv(
    shader.uniforms.transformationMatrix,
    false,
    transformationMatrix
  );

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

  setupSliders(gl, shader);
  drawScene(gl, shader);
}

window.onload = main;
