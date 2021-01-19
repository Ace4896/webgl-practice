#version 300 es

in vec2 aPosition;

uniform vec2 uResolution;

// Converts a point from pixel space ((-width, -height) -> (width,height)) to clip space (-1 -> 1)
vec2 toClipSpace(vec2 original) {
    return original / uResolution;
}

void main() {
    vec2 clipSpace = toClipSpace(aPosition);
    gl_Position = vec4(clipSpace, 0, 1);
}
