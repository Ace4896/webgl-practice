# Image Processing (i.e. Textures)

This tutorial showed how to render images on a surface through the use of textures.

## Vertex/Fragment Shader Program

Since we're using the image data for the colours, we need to pass the texture coordinate into the vertex shader, then
pass this over to the fragment shader. This allows the fragment shader to interpolate the correct colour based on the
loaded texture and colour.

The vertex shader doesn't change much - we just need to add an attribute and a varying:

```glsl
#version 300 es

in vec2 a_position;
in vec2 a_texCoord;

// This will be passed to the fragment shader
// The GPU will interpolate this value between points so the correct colour is used
out vec2 v_texCoord;

void main() {
    // set gl_Position to vec4 version of a_position
    v_texCoord = a_texCoord;
}
```

The fragment shader will also need the texture itself (as a uniform) and the texture coordinates (passed from the
vertex shader):

```glsl
#version 300 es
precision highp float;

// sampler... is the type used for texture sampling (i.e. picking colours out from textures)
// sampler types must be uniforms.
// Other types includ sample1D, sampler3D, samplerCube, etc.
uniform sampler2D u_image;

// The texture coordinate passed from the vertex shader
in vec2 v_texCoord;

// Final output colour
out vec4 outColour;

void main() {
    // Lookup the corresponding colour from the texture
    outColour = texture(u_image, v_texCoord);
}
```

## Loading the Image

The easiest way to load an image is to use the HTML `Image` element:

```js
function loadImage(url, renderCallback) {
    let image = new Image();
    image.src = url;
    image.onload = () => renderCallback(image);
}
```

Then again, there's probably better ways of loading the image from a file... I'll look something else up. This method
doesn't work particularly well for async functions...

## Setting Up a Texture for the Image

Since we've added a new attribute and uniform, we need to define them:

```js
let texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");
let imageLocation = gl.getUniformLocation(program, "u_image");
```

Then, we need to provide the texture coordinates for the rectangle we're using to render it:

```js
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
```

Finally, in the main render loop, we specify how to get this texture:

```js
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

// Tell the shader to get the texture from texture unit 0
gl.uniform1i(imageLocation, TEXTURE_UNIT);

// Bind the position buffer so gl.bufferData that will be called
// in setRectangle puts data in the position buffer
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Set a rectangle the same size as the image.
setRectangle(gl, 0, 0, image.width, image.height);
```
