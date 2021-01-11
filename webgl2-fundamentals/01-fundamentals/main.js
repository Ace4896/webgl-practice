/**
 * (Async) Loads an external text file.
 * @param url {string} The URL of the text file to load.
 * @returns {Promise<string>} The contents of this file
 */
async function loadTextFile(url) {
    const response = await fetch(url);
    return response.text();
}

/**
 * Creates and compiles a new shader.
 * @param gl {WebGL2RenderingContext} The WebGL 2 rendering context
 * @param type {GLenum} The type of shader to create
 * @param source {string} The source code for the shader
 * @return {WebGLShader} The compiled shader program, or null if an error occurred
 */
function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Report any errors in compilation
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        // Log the error that occurred
        console.log(gl.getShaderInfoLog(shader));

        // Delete the shader since it's invalid
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

/**
 * Creates a shader program.
 * @param gl {WebGL2RenderingContext} The WebGL 2 rendering context
 * @param vertexShader {WebGLShader} The vertex shader to use
 * @param fragmentShader {WebGLShader} The fragment shader to use
 */
function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Report any errors in compilation
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        // Log the error that occurred
        console.log(gl.getProgramInfoLog(program));

        // Delete the program since it's invalid
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

(async () => {
    // Setup canvas + viewport
    let canvas = document.getElementById("gl-canvas");
    let gl = canvas.getContext("webgl2");
    if (!gl) {
        alert("WebGL 2 is not supported!");
        return;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Setup shader program
    let vertexShaderSource = await loadTextFile("./vertex.shader");
    let fragmentShaderSource = await loadTextFile("./fragment.shader");

    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    let shaderProgram = createProgram(gl, vertexShader, fragmentShader);

    // Setup attributes
    let positionAttributeLocation = gl.getAttribLocation(shaderProgram, "a_position");
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Put the position data into this buffer
    // Three 2D Points
    const positions = [
        -0.5, 0,
        0, 1,
        0.5, 0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Setup VAO
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Specify how data is retrieved from the buffer
    {
        const size = 2;             // 2 components per iteration (since we're using 2D positions)
        const type = gl.FLOAT;      // We're using 32-bit floating point numbers
        const normalize = false;    // Don't normalize the data
        const stride = 0;           // How many bytes to move by to get to the next position
                                    // 0 is the default, i.e. auto-detect; equivalent to size * sizeof(type)
        const offset = 0;           // Start at the beginning of the buffer

        gl.vertexAttribPointer(
            positionAttributeLocation,
            size,
            type,
            normalize,
            stride,
            offset
        );
    }

    // Finally, draw the scene
    // NOTE: This would normally be a separate function, but since it's always the same, it's kept here
    {
        // Set the clear colour to white and clear the screen
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Use our shader program from before (i.e. vertex/fragment pair)
        gl.useProgram(shaderProgram);

        // Bind the attribute/buffer we want (using the VAO)
        gl.bindVertexArray(vao);

        // Get WebGL to actually execute the GLSL program
        let primitiveType = gl.TRIANGLES;   // The thing we're trying to draw is a triangle
        let offset = 0;                     // Start at the beginning of the buffer
        let count = 3;                      // There are three points in this buffer
        gl.drawArrays(primitiveType, offset, count);
    }
})();