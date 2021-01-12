# Drawing Multiple Things

## Aside: "Function" Analogy for Shaders

WebGL renders things by setting up state for that function (and providing functions to change the current state), then
providing a single draw function that doesn't require any parameters.

In JS, it could be thought of like this:

```js
// Normally, we'd write something like this
function drawCircle(centerX, centerY, radius, colour) {
    // --snip--
}

// But WebGL works like this
let centerX;
let centerY;
let radius;
let colour;

function setCenter(x, y) {
    centerX = x;
    centerY = y;
}

function setRadius(r) {
    radius = r;
}

function setColour(c) {
    colour = c;
}

function drawCircle() {
    // --snip--
}
```

This means that WebGL programs follow this kind of structure:

- At initialisation time:
  - Create all shaders, programs and lookup locations
  - Create buffers and upload vertex data
  - Create a vertex array for each thing you want to draw
    - For each attribute, call `gl.bindBuffer`, `gl.vertexAttribPointer`, `gl.enableVertexAttribArray`
    - Bind any indices to `gl.ELEMENT_ARRAY_BUFFER`
  - Create textures and upload texture data
- At render time:
  - Clear screen, set viewport and other global state
  - For each thing we want to draw:
    - Call `gl.useProgram` for the program needed to draw
    - Bind the vertex array for that thing - `gl.bindVertexArray`
  - Setup uniforms for the thing we want to draw
    - `gl.uniform...` for each uniform
    - `gl.activeTexture`, `gl.bindTexture` to assign textures to texture units
  - Call `gl.drawArrays` or `gl.drawElements`

