"use strict";

/**
 * Gets the WebGL context for the specified canvas ID
 * @param canvasId {string} The canvas's ID in HTML
 * @returns {WebGLRenderingContext} The WebGL rendering context for this canvas, or null if an error occurred
 */
function getWebGLContext(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (canvas === null) {
        alert(`Unable to retrieve canvas '${canvasId}'`);
        return null;
    }

    const gl = canvas.getContext("webgl");
    if (gl === null) {
        alert("Unable to retrieve WebGL context");
        return null;
    }

    return gl;
}

/**
 * Creates a shader of the given type, uploads the source and compiles it.
 * @param gl {WebGLRenderingContext} The WebGL rendering context
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

/**
 * Initialise a shader program for the specified WebGL context
 * @param gl {WebGLRenderingContext} The WebGL rendering context
 * @param vsSource {string} The vertex shader code
 * @param fsSource {string} The fragment shader code
 * @returns {WebGLProgram} A new shader program with the specified shaders, or null if an error occurred
 */
function initShaderProgram(gl, vsSource, fsSource) {
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
 * Initialises buffers for the vertex positions.
 * @param gl {WebGLRenderingContext} The WebGL rendering context
 */
function initBuffers(gl) {
    // Create a buffer for the square's positions
    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer operations to
    // (from here on out)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Create an array of positions for the square
    const positions = [
        -1.0,  1.0, // Top Left
         1.0,  1.0, // Top Right
        -1.0, -1.0, // Bottom Left
         1.0, -1.0, // Bottom Right
    ];

    // Pass the list of positions into WebGL to build the shape
    // Done by creating a Float32Array from the JS array, then filling the current buffer
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW);

    return {
        position: positionBuffer,
    };
}

/**
 * Draws the current scene.
 * This is equivalent to the lab's "render" function - can be named anything.
 * @param gl {WebGLRenderingContext} The WebGL rendering context
 * @param programInfo
 * @param buffers
 */
function drawScene(gl, programInfo, buffers) {
    // Set the clear colour to black; fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear everything (not sure if this is needed TBH)
    gl.clearDepth(1.0);

    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);

    // Make it so that near things obscure far things
    gl.depthFunc(gl.LEQUAL);

    // Clear the canvas; must be done before drawing anything
    // At minimum, COLOR_BUFFER_BIT is needed
    // Since we're using depth testing, DEPTH_BUFFER_BIT is needed too
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix
    // FOV: 45 degrees
    // Width/Height Ratio: Match display size of canvas
    // Near: 0.1
    // Far: 100
    const fov = 45 * Math.PI / 180; // Radians
    const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // NOTE: gl-matrix.js uses first argument as destination to receive result
    mat4.perspective(
        projectionMatrix,
        fov,
        aspectRatio,
        zNear,
        zFar
    );

    // Set the drawing position to the "identity" point, i.e. the center
    const modelViewMatrix = mat4.create();

    // Move the drawing position back a bit
    mat4.translate(
        modelViewMatrix,
        modelViewMatrix,
        [-0.0, 0.0, -6.0]
    );

    // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute
    {
        const numComponents = 2;    // Two values per iteration (since we're in 2D)
        const type = gl.FLOAT;      // We used floating point values for coordinates
        const normalise = false;
        const stride = 0;           // How many bytes to get from one set of values to the next
                                    // 0 = use the type and numComponents above (i.e. auto)
        const offset = 0;           // How many bytes inside the buffer to start from
                                    // Since we're using all vertices in the array, start from 0

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalise,
            stride,
            offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Set shader uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
    );

    // Finally, draw what's in the vertex buffer
    {
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
}

(async () => {
    const gl = getWebGLContext("gl-canvas");
    if (!gl) {
        return;
    }

    // Shader Programs
    // NOTE: Normally, they would be in separate files, but since they're simple, they've been put in-line
    const vsSource = `
        attribute vec4 aVertexPosition;
        
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        
        // This just transforms the position using the provided projection and model-view matrices
        // Since this isn't changed in this tutorial, nothing happens
        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        }
    `;

    const fsSource = `
        void main() {
            // We're drawing a white square, so the fragment colour is white
            // This colour is in RGBA format
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    `;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Something I wish I used before (instead of globals).
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
        }
    };

    const buffers = initBuffers(gl);

    drawScene(gl, programInfo, buffers);
})();

