"use strict";

/**
 * (Async) Loads an external text file.
 * @param url {string} The URL of the text file to load.
 * @returns {Promise<string>} The contents of this file
 */
async function loadTextFile(url) {
    let response = await fetch(url);
    return response.text();
}

function loadImage(url) {
    let image = new Image();
    image.src = url;
    image.onload = () => render(image);
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

// Sets the buffer data to a rectangle of the same height and width as the image
function setRectangle(gl, x, y, width, height) {
    let x1 = x;
    let x2 = x + width;
    let y1 = y;
    let y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ]), gl.STATIC_DRAW);
}

async function render(image) {
    // Setup canvas
    let canvas = document.getElementById("gl-canvas");
    let gl = canvas.getContext("webgl2");
    if (!gl) {
        alert("WebGL 2 is not supported!");
        return;
    }

    // Setup shader program
    let vertexShaderSource = await loadTextFile("./vertex.shader");
    let fragmentShaderSource = await loadTextFile("./fragment.shader");

    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    let shaderProgram = createProgram(gl, vertexShader, fragmentShader);

    // Setup attributes and uniforms
    let positionAttributeLocation = gl.getAttribLocation(shaderProgram, "a_position");
    let texCoordAttributeLocation = gl.getAttribLocation(shaderProgram, "a_texCoord");

    let resolutionUniformLocation = gl.getUniformLocation(shaderProgram, "u_resolution");
    let imageLocation = gl.getUniformLocation(shaderProgram, "u_image");

    // Setup position buffer
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    let positionBuffer = gl.createBuffer();
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

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

    // Setup texture and it's buffer
    // Configure the attribute for this buffer
    let texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

    // Draw two triangles to form the rectangle
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0,
    ]), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(texCoordAttributeLocation);
    {
        let size = 2;           // Two components per iteration
        let type = gl.FLOAT;    // 32-bit floating point values
        let normalise = false;  // Don't normalise
        let stride = 0;         // Auto-detect how many bytes to move by in each iteration
        let offset = 0;         // Start from beginning of buffer
        gl.vertexAttribPointer(
            texCoordAttributeLocation,
            size,
            type,
            normalise,
            stride,
            offset
        );
    }

    // Create the texture
    let texture = gl.createTexture();

    // Make unit 0 the active texture unit, i.e. the unit that all other texture commands affect
    const TEXTURE_UNIT = 0;
    gl.activeTexture(gl.TEXTURE0 + TEXTURE_UNIT);

    // Bind it to texture unit 0's 2D bind point
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we don't need mips and so we're not filtering and we don't repeat
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    let mipLevel = 0;               // the largest mip
    let internalFormat = gl.RGBA;   // format we want in the texture
    let srcFormat = gl.RGBA;        // format of data we are supplying
    let srcType = gl.UNSIGNED_BYTE  // type of data we are supplying
    gl.texImage2D(
        gl.TEXTURE_2D,
        mipLevel,
        internalFormat,
        srcFormat,
        srcType,
        image
    );

    // Render the main scene
    {
        gl.useProgram(shaderProgram);

        gl.bindVertexArray(vao);

        // Pass in the canvas resolution so we can convert from
        // pixels to clipspace in the shader
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        // Tell the shader to get the texture from texture unit 0
        gl.uniform1i(imageLocation, TEXTURE_UNIT);

        // Bind the position buffer so gl.bufferData that will be called
        // in setRectangle puts data in the position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Set a rectangle the same size as the image.
        setRectangle(gl, 0, 0, image.width, image.height);

        let primitiveType = gl.TRIANGLES;
        let offset = 0;
        let count = 6;
        gl.drawArrays(primitiveType, offset, count);
    }
}

// Main Function
loadImage("./leaves.jpeg");