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

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log(`Unable to initialise shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
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
        console.log(`Unable to compile shader: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}