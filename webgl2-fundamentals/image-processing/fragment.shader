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
