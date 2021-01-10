attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

// This just transforms the position using the provided projection and model-view matrices
// Since this isn't changed in this tutorial, nothing happens
void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
