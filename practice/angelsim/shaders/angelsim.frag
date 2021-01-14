#version 300 es
precision highp float;

uniform vec4 uColour;
uniform sampler2D uHitCircle;

in vec2 vTexCoord;

out vec4 outColour;

void main() {
    outColour = texture(uHitCircle, vTexCoord) * uColour;
}