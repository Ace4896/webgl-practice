#version 300 es

in vec2 aPosition;

uniform vec2 uResolution;

void main() {
    // Convert from 2D to clip space (i.e. from 0->max to -1->1)
    // 1) 2D to 0->1
    vec2 zeroToOne = aPosition / uResolution;

    // 2) 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // 3) 0->2 to -1->1
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace, 0, 1);
}
