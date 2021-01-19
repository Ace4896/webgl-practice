import { getTextFile } from "./misc-utils.js";
import { initShaderProgram } from "./webgl-utils.js";

/**
 * Class representing a vertex/fragment shader pair.
 */
export class Shader {
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
