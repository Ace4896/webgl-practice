/**
 * Gets the WebGL 2 context from a canvas.
 * @param canvasId {string} The ID of the canvas
 * @returns {WebGL2RenderingContext} A WebGL 2 context, or null if an error occurred
 */
export function getWebGL2Context(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas with ID '${canvasId}' does not exist!`);
        return null;
    }

    const context = canvas.getContext("webgl2");
    if (!context) {
        console.error("Unable to retrieve WebGL 2 context; it may not be supported");
        return null;
    }

    return context;
}

/**
 * Initialise a shader program for the specified WebGL context
 * @param gl {WebGL2RenderingContext} The WebGL 2 rendering context
 * @param vsSource {string} The vertex shader code
 * @param fsSource {string} The fragment shader code
 * @returns {WebGLProgram} A new shader program with the specified shaders, or null if an error occurred
 */
export function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If we couldn't create the shader program, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(`Unable to initialise shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
        return null;
    }

    return shaderProgram;
}

/**
 * Creates a shader of the given type, uploads the source and compiles it.
 * @param gl {WebGL2RenderingContext} The WebGL 2 rendering context
 * @param type {GLenum} The type of shader to create
 * @param source {string} The shader code
 * @returns {WebGLShader} The compiled shader, or null if an error occurred
 */
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // If it didn't compile, output something explaining what happened and remove it
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(`Unable to compile shader: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}