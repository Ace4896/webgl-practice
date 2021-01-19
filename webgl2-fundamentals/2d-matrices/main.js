import {getTextFile} from "./modules/misc-utils.js";
import {initShaderProgram} from "./modules/webgl-utils.js";

let translationVec = vec2.create();
let scaleVec = vec2.fromValues(1, 1);
let rotation = 0;

let transformationMatrix = mat3.create();


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
     * @property {GLint} uniforms.matrix - The 2D transformation matrix
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

        let shaderProgram = initShaderProgram(gl, Shader.VERT_SOURCE, Shader.FRAG_SOURCE);
        if (!shaderProgram) {
            return;
        }

        this.program = shaderProgram;
        this.attribs = {
            position: gl.getAttribLocation(this.program, "aPosition"),
        };
        this.uniforms = {
            matrix: gl.getUniformLocation(this.program, "uMatrix"),
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

    static async fetchSources() {
        if (!Shader.VERT_SOURCE || !Shader.FRAG_SOURCE) {
            Shader.VERT_SOURCE = await getTextFile("./shaders/shader.vert");
            Shader.FRAG_SOURCE = await getTextFile("./shaders/shader.frag");
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

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.uniform2f(shader.uniforms.resolution, gl.canvas.width, gl.canvas.height);
    gl.uniformMatrix3fv(shader.uniforms.matrix, false, transformationMatrix);

    // Draw a white square in the middle of the screen
    const positions = new Float32Array([
        0, 0,
        0, 100,
        100, 0,
        100, 100,
    ]);

    gl.bindVertexArray(shader.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, shader.buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, positions.length / 2);
}

/**
 * Sets up various sliders on the page.
 * @param gl {WebGL2RenderingContext} The WebGL 2 rendering context.
 * @param shader {Shader} The shader program to use.
 */
function setupSliders(gl, shader) {
    function updateTransformation() {
        mat3.identity(transformationMatrix);
        mat3.rotate(transformationMatrix, transformationMatrix, rotation);
        mat3.translate(transformationMatrix, transformationMatrix, translationVec);
        mat3.scale(transformationMatrix, transformationMatrix, scaleVec);

        drawScene(gl, shader);
    }

    // Translation x/y sliders
    function updateTranslation(x, y) {
        console.log(`Translate x: ${x}, y: ${y}`);
        vec2.set(translationVec, x, y);
        updateTransformation();
    }

    const xSlider = document.getElementById("x");
    const ySlider = document.getElementById("y");

    xSlider.min = 0;
    xSlider.max = gl.canvas.width;
    ySlider.min = 0;
    ySlider.max = gl.canvas.height;

    xSlider.onchange = () => updateTranslation(xSlider.value, ySlider.value);
    ySlider.onchange = () => updateTranslation(xSlider.value, ySlider.value);

    // Scale x/y sliders
    function updateScale(x, y) {
        vec2.set(scaleVec, x, y);
        updateTransformation();
    }

    const scaleXSlider = document.getElementById("scale-x");
    const scaleYSlider = document.getElementById("scale-y");

    scaleXSlider.min = -3;
    scaleXSlider.max = 3;
    scaleYSlider.min = -3;
    scaleYSlider.max = 3;

    scaleXSlider.onchange = () => updateScale(scaleXSlider.value, scaleYSlider.value);
    scaleYSlider.onchange = () => updateScale(scaleXSlider.value, scaleYSlider.value);

    // Rotation slider
    const rotationSlider = document.getElementById("rotation");
    rotationSlider.min = -180;
    rotationSlider.max = 180;

    function toRadians(deg) {
        return (deg / 180) * Math.PI;
    }

    rotationSlider.onchange = () => {
        rotation = toRadians(rotationSlider.value);
        updateTransformation();
    };
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
