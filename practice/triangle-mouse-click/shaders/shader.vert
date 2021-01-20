#version 300 es

in vec2 aPosition;

uniform mat3 uModelViewMatrix;

void main() {
    vec2 coords = (uModelViewMatrix * vec3(aPosition, 1.0)).xy;
    gl_Position = vec4(coords, 0, 1);
}
