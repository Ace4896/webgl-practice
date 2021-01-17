import {getTextFile} from "./modules/misc-utils.js";
import {initShaderProgram} from "./modules/webgl-utils.js";

/**
 * Class representing a vertex/fragment shader pair.
 */
class Shader {
    static VERT_SOURCE = undefined;
    static FRAG_SOURCE = undefined;

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
     * Initialises this shader. Needs to be done separately due to asynchronous operations.
     * @param gl {WebGL2RenderingContext} The WebGL 2 rendering context.
     */
    async init(gl) {
        if (!Shader.VERT_SOURCE || !Shader.FRAG_SOURCE) {
            Shader.VERT_SOURCE = await getTextFile("./shaders/shader.vert");
            Shader.FRAG_SOURCE = await getTextFile("./shaders/shader.frag");
        }

        let shaderProgram = initShaderProgram(gl, Shader.VERT_SOURCE, Shader.FRAG_SOURCE);
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
                offset,
            );
        }
    }
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

    gl.uniform2f(shader.uniforms.resolution, gl.canvas.width, gl.canvas.height);

    // Draw a white square in the middle of the screen
    const length = 100;
    let x1 = (gl.canvas.width / 2) - (length / 2);
    let x2 = x1 + length;
    let y1 = (gl.canvas.height / 2) - (length / 2);
    let y2 = y1 + length;

    const positions = new Float32Array([
        x1, y1,
        x1, y2,
        x2, y1,
        x2, y2,
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

    const shader = new Shader();
    await shader.init(gl);

    drawScene(gl, shader);
}

window.onload = main;
