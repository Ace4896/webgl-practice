#version 300 es

precision highp float;

uniform vec4 uColour;

out vec4 outColour;

void main() {
    outColour = uColour;
}