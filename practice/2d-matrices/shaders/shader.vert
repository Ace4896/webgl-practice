#version 300 es

in vec2 aPosition;

uniform mat3 uTransformationMatrix;

void main() {
    // NOTE: Ignore the 3rd value since it's just for homogeneous coordinates
    vec2 transformedPosition = (uTransformationMatrix * vec3(aPosition, 1)).xy;
    gl_Position = vec4(transformedPosition, 0, 1);
}
