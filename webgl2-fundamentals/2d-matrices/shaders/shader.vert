#version 300 es

in vec2 aPosition;

uniform vec2 uResolution;
uniform mat3 uMatrix;

// Converts a point from pixel space ((0,0) -> (width,height)) to clip space (-1 -> 1)
vec2 toClipSpace(vec2 original) {
    return (original / uResolution) * 2.0 - 1.0;
}

void main() {
    vec2 position = (uMatrix * vec3(aPosition, 1)).xy;
    vec2 clipSpace = toClipSpace(position);
    gl_Position = vec4(clipSpace, 0, 1);
}
