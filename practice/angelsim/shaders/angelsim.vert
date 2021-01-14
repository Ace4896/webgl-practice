#version 300 es

in vec2 aPosition;
in vec2 aTexCoord;

uniform vec2 uResolution;

out vec2 vTexCoord;

vec2 toClipSpace(vec2 pixelSpace) {
    return (aPosition / uResolution) * 2.0 - 1.0;
}

void main() {
    vec2 clipSpace = toClipSpace(aPosition);
    gl_Position = vec4(clipSpace, 0, 1);

    vTexCoord = aTexCoord;
}
