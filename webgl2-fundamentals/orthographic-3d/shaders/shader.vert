#version 300 es

in vec4 aPosition;
in vec4 aColour;

uniform mat4 uProjection;
uniform mat4 uTransformation;

out vec4 vColour;

void main() {
    gl_Position = uProjection * uTransformation * aPosition;
    vColour = aColour;
}
