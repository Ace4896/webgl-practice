// NOTE: Output is currently garbled, since the circle elements aren't overlayed over each other

import {getImageFile, getTextFile} from "./modules/misc-utils.js";
import {initShaderProgram} from "./modules/webgl-utils.js";

const steps = 64;

/**
 * Converts a circle to an array of positions that can be rendered using a triangle fan.
 * @param centreX {number} The x-coordinate of the circle's centre
 * @param centreY {number} The y-coordinate of the circle's centre
 * @param radius {number} The radius of the circle
 * @param steps {number} How many interpolation steps to carry out (i.e. no. of points on circumference). Minimum 8.
 * @returns {number[]} An array containing all the positions needed for rendering the circle using a triangle fan.
 */
function circleToTriangleFan(centreX, centreY, radius, steps) {
    if (steps < 8) {
        steps = 8;
    }

    let positions = [centreX, centreY];
    let theta = 0;
    let thetaStep = 2 * Math.PI / steps;

    // NOTE: <= since we need the first point twice to complete the circle
    for (let i = 0; i <= steps; i++) {
        let x = centreX + radius * Math.cos(theta);
        let y = centreY + radius * Math.sin(theta);
        theta += thetaStep;
        positions.push(x, y);
    }

    return positions;
}

function getTexCoordsForCircle(steps) {
    // Centre of circle is (0.5, 0.5) in the texture
    let texCoords = [0.5, 0.5];
    let theta = 0;
    let thetaStep = 2 * Math.PI / steps;

    for (let i = 0; i <= steps; i++) {
        let x = (Math.cos(theta) + 1.0) / 2.0;
        let y = (Math.sin(theta) + 1.0) / 2.0;
        theta += thetaStep;
        texCoords.push(x, y);
    }

    return texCoords;
}

function randomInt(range) {
    return Math.floor(Math.random() * range);
}

async function main() {
    let canvas = document.getElementById("gl-canvas");
    if (!canvas) {
        console.log("Could not find canvas with id 'gl-canvas'");
        return;
    }

    let gl = canvas.getContext("webgl2");
    if (!gl) {
        console.log("WebGL 2 is not supported!");
        return;
    }

    let vsSource = await getTextFile("./shaders/angelsim.vert");
    let fsSource = await getTextFile("./shaders/angelsim.frag");
    let program = initShaderProgram(gl, vsSource, fsSource);
    if (!program) {
        return;
    }

    let hitcircle = await getImageFile("./textures/hitcircle-complete.png");

    // Setup attributes and uniforms
    // Vertex shader
    let positionAttributeLocation = gl.getAttribLocation(program, "aPosition");
    let texCoordAttributeLocation = gl.getAttribLocation(program, "aTexCoord");
    let resolutionUniformLocation = gl.getUniformLocation(program, "uResolution");

    // Fragment shader
    let colourUniformLocation = gl.getUniformLocation(program, "uColour");
    let hitCircleUniformLocation = gl.getUniformLocation(program, "uHitCircle");

    // Setup position attribute
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let positionBuffer = gl.createBuffer();
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Setup position attribute
    {
        const size = 2;
        const type = gl.FLOAT;
        const normalise = false;
        const stride = 0;
        const offset = 0;

        gl.vertexAttribPointer(
            positionAttributeLocation,
            size,
            type,
            normalise,
            stride,
            offset
        );
    }

    // Setup texture + buffer
    let texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

    // Draw two triangles to form the rectangle (as this is an overlay)
    let texCoords = getTexCoordsForCircle(steps);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    {
        gl.enableVertexAttribArray(texCoordAttributeLocation);
        let size = 2;
        let type = gl.FLOAT;
        let normalise = false;
        let stride = 0;
        let offset = 0;

        gl.vertexAttribPointer(
            texCoordAttributeLocation,
            size,
            type,
            normalise,
            stride,
            offset
        );
    }

    let texture = gl.createTexture();

    const TEXTURE_UNIT = 0;
    gl.activeTexture(gl.TEXTURE0 + TEXTURE_UNIT);
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
        hitcircle
    );

    // Draw scene
    {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(program);

        gl.bindVertexArray(vao);

        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform1i(hitCircleUniformLocation, TEXTURE_UNIT);

        // Purple: 179, 109, 255
        gl.uniform4f(colourUniformLocation, 179 / 255, 109 / 255, 255 / 255, 1);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Draw 1 hitcircle
        let centreX = 640;
        let centreY = 360;
        let radius = hitcircle.naturalWidth;

        let positions = circleToTriangleFan(centreX, centreY, radius, steps);
        let count = positions.length / 2;

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, count);
    }
}

window.onload = main;