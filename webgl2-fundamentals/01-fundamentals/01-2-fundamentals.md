# Chapter 1.2: Fundamentals

## Shaders

Shaders can be thought of as "functions". WebGL uses two types of shader, which come in pairs:

- **Vertex Shader**: These compute vertex positions. The output of the shader is used to rasterize various kinds of
  primitives, like points, lines and triangles.
- **Fragment Shader**: During rasterization, this is used to compute a color for each pixel of the primitive currently
  being drawn.

There are four ways in which a shader can receive data.

### 1) Attributes, Buffers, and Vertex Arrays

**Buffers** are arrays of binary data that are uploaded to the GPU. Usually, they contain things like *positions*,
*normals*, *texture coordinates*, *vertex colours*, etc., though in practice, we can put anything we want in them.

**Attributes** specify how to pull data out of buffers and provide them to the vertex shader. e.g. if we're storing
positions in a buffer, where each position is represented by three 32-bit floats, we can use an attribute to specify:

- Which buffer to pull the positions out of
- What type of data it should pull out (in this case, **3 component 32-bit floating point numbers**)
- What offset in the buffer the positions start from
- How many bytes to get from one position to the next (in this case, `3*4 = 32 bytes`)

Something to keep in mind is that buffers are **not random access**. Instead, a vertex shader is executed a specified
number of times. Each time it's executed, the next value from each specified buffer is pulled out and assigned to an
attribute. Imagine iterating over the items in each buffer and executing the vertex+fragment shader in each iteration.

A **vertex array object (VAO)** is used to maintain:

- The state of attributes
- Which buffers to use for each one
- How to pull out data from those buffers

### 2) Uniforms

**Uniforms** are like global variables we can set before executing the shader program. I guess uniform = stays the same?
That might be one way to remember them as global variables.

In the labs, we often used uniforms for the model-view matrix and projection matrix.

### 3) Textures

**Textures** are arrays of data we can randomly access in a shader program. Normally, textures are used to store image
data, but since they just store data, they can also contain things besides colours.

### 4) Varyings

**Varyings** are a way for a vertex shader to pass data to a fragment shader. This allows us to vary the colour output
depending on what is being rendered, e.g. a point, line or triangle.

## "Hello World" Walkthrough

### Vertex Shader Example

In the tutorial, this shader was used as the example:

```glsl
#version 300 es
// ^ This line indicates that this is WebGL 2 (as it is based on OpenGL ES 3.0)
// It has to be the first line in the file - no comments/blank lines can come before it

// This is an attribute or an input (in) to the shader
// This will receive data from a buffer
// vec4 = 4 float value; in JS, this would be something like {x, y, z, w}
in vec4 a_position;

void main() {
    // gl_Position is a special variable a vertex shader is responsible for setting
    // In this example, we just set the position to the one from the attribute (i.e. don't change it)
    gl_Position = a_position;
}
```

It acts similarly to this pseudocode (though there's more to it than this):

```js
var positionBuffer = [
  0, 0, 0, 0,
  0, 0.5, 0, 0,
  0.7, 0, 0, 0,
];
var attributes = {};
var gl_Position;
 
drawArrays(..., offset, count) {
  var stride = 4;
  var size = 4;
  for (var i = 0; i < count; ++i) {
     // copy the next 4 values from positionBuffer to the a_position attribute
     const start = offset + i * stride;
     attributes.a_position = positionBuffer.slice(start, start + size);
     runVertexShader();
     ...
     doSomethingWith_gl_Position();
}
```

### Fragment Shader Example

After calculating positions, we need to calculate the colours for each pixel. The tutorial used this example:

```glsl
#version 300 es

// NOTE: Fragment shaders don't have a default precision, so we need to pick one
// highp (high precision) is a good default
precision highp float;

// We also need to declare an output for the fragment shader, i.e. the colour
// vec4 is used for RGBA
out vec4 outColour;

void main() {
    // Set the output to a constant reddish-purple
    outColour = vec4(1, 0, 0.5, 1);
}
```

### HTML/JS Side

#### Aside: Loading in the Shader Source Code

One way of loading the shader source code is to just store it as a variable in JS, i.e.:

```js
// NOTE: Again, be careful of extra blank lines
const vertexSource = `#version 300 es
    // --snip--
`;

const fragmentSource = `#version 300 es
    // --snip--
`;
```

Thing is, this becomes messy in anything other than a tutorial program, so we'd store these in a separate file. I wrote
this simple function to fetch the contents of external text files on the fly:

```js
/**
 * (Async) Loads an external text file.
 * @param url {string} The URL of the text file to load.
 * @returns {Promise<string>} The contents of this file
 */
export async function loadTextFile(url) {
    const response = await fetch(url);
    return response.text();
}
```

The `url` passed can just be a relative one, e.g. `./vertex.shader`.

#### Compiling Shader Source Code

Once we've loaded in the shader source code, we need to compile them:

```js
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

let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
```

After compiling the shaders, we then need to link this vertex/fragment shader pair into a **shader program**:

```js
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

let program = createProgram(gl, vertexShader, fragmentShader);
```

#### Specifying Attributes and Binding Buffers

Attribute and uniform locations need to be specified during initialization. In the example vertex shader, we've
specified one attribute for the input - `a_position`. We can specify this in JS using:

```js
// `program` is from the previous step
let positionAttributeLocation = gl.getAttribLocation(program, "a_position");

// For uniforms, we can use gl.getUniformLocation instead
let modelViewMatrixLocation = gl.getUniformLocation(modelViewMatrix, "uModelViewMatrix");
```

Attributes get their data from buffers, so we need to specify the buffer itself:

```js
let positionBuffer = gl.createBuffer();
```

WebGL lets us manipulate many WebGL resources on global bind points, which can be thought of as "internal global
variables inside WebGL". This lets all functions refer to the resource we've created.

For now, we can bind the position buffer:

```js
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
```

Then, we can start putting data in this buffer:

```js
// Three 2D Points
const positions = [
    0, 0,
    0, 0.5,
    0.7, 0,
];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
```

There's a few things going on here:

- WebGL needs a strongly typed array, so we need to create a separate array that copies the values. `gl.bufferData` then
  copies this data to the `positionBuffer` on the GPU (since we bound `gl.ARRAY_BUFFER` to it earlier).
- `gl.STATIC_DRAW` is a hint for WebGL indicating how we're going to use the data. This one tells WebGL that we're
  not likely to change this data (which we aren't - these are static positions).

#### Creating a VAO

So far, we've created an attribute with a corresponding buffer, but we've yet to specify how to actually use the buffer data. This
is where the VAO comes in.

First, we need to create the VAO and bind it to the current vertex array:

```js
let vao = gl.createVertexArray();
gl.bindVertexArray(vao);
```

After doing this, we then need to enable the attribute, indicating that we want to get data out of a buffer. If we don't
turn on the attribute, it'll have a constant value (which is not good!):

```js
// NOTE: positionAttributeLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionAttributeLocation);
```

We can then specify how data is to be pulled out of the buffer:

```js
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

// After gl.vertexAttribPointer() is called, the current ARRAY_BUFFER is bound to the attribute
// This means that this attribute will continue to use `positionBuffer`, and we're free to bind something else to the
// ARRAY_BUFFER bind point
```

#### Putting It All Together (Canvas + Drawing)

On the HTML side, we need to create a canvas. The text in-between the tags appears if the canvas element isn't
supported.

```html
<canvas id="gl-canvas"
        width="640" height="480">
    Your browser does not support the HTML 5 canvas element!
</canvas>
```

We then need to retrieve this canvas and make sure that WebGL 2 is available:

```js
let canvas = document.getElementById("gl-canvas");
let gl = canvas.getContext("webgl2");
if (!gl) {
    // No WebGL 2 available!!!
}
```

We also need to set the viewport to match that of the canvas:

```js
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
```

Afterwards, we can finally define the drawing/rendering stage:

```js
// Set the clear colour to black and clear the screen
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Use our shader program from before (i.e. vertex/fragment pair)
gl.useProgram(program);

// Bind the attribute/buffer we want (using the VAO)
gl.bindVertexArray(vao);

// Get WebGL to actually execute the GLSL program
let primitiveType = gl.TRIANGLES;   // The thing we're trying to draw is a triangle
let offset = 0;                     // Start at the beginning of the buffer
let count = 3;                      // There are three points in this buffer
gl.drawArrays(primitiveType, offset, count);
```
