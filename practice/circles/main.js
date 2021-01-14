// To draw a circle, I need to calculate the points on the circumference
// For 0 <= theta <= 360:
//   x' = x + rcos(theta)
//   y' = y + rsin(theta)
//
// Thing is though, WebGL doesn't have as many primitives as OpenGL, so I
// have to draw these as separate triangles
// Fortunately, there is gl.TRIANGLE_FAN, which uses the first point as the
// centre, and the remaining points form a "fan" around this triangle

import {getTextFile} from "./modules/misc-utils.js";
import {initShaderProgram} from "./modules/webgl-utils.js";

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

    let vsSource = await getTextFile("./shaders/circle.vert");
    let fsSource = await getTextFile("./shaders/circle.frag");
    let program = initShaderProgram(gl, vsSource, fsSource);
    if (!program) {
        return;
    }

    // Setup attributes and uniforms
    // Vertex shader
    let positionAttributeLocation = gl.getAttribLocation(program, "aPosition");
    let resolutionUniformLocation = gl.getUniformLocation(program, "uResolution");

    // Fragment shader
    let colourUniformLocation = gl.getUniformLocation(program, "uColour");

    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Setup VAO
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttributeLocation);

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

    // Draw scene
    {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.bindVertexArray(vao);

        let primitiveType = gl.TRIANGLE_FAN;
        let offset = 0;
        let steps = 32;

        // Draw 10 circles with different centres and radii
        for (let i = 0; i < 10; i++) {
            let centreX = 640 + randomInt(500);
            let centreY = 360 + randomInt(250);
            let radius = 50 + randomInt(50);

            let positions = circleToTriangleFan(centreX, centreY, radius, steps);
            let count = positions.length / 2;

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
            gl.uniform4f(colourUniformLocation, Math.random(), Math.random(), Math.random(), 1.0);

            gl.drawArrays(primitiveType, offset, count);
        }
    }
}

window.onload = main;