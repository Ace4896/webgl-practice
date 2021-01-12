# "Less Code, More Fun"

There's a lot of boilerplate code in WebGL (and OpenGL as well), though there are ways to reduce this boilerplate code.
The tutorial used this shader program as an example:

```glsl
// Vertex Shader
#version 300 es

uniform mat4 u_worldViewProjection;
uniform vec3 u_lightWorldPos;
uniform mat4 u_world;
uniform mat4 u_viewInverse;
uniform mat4 u_worldInverseTranspose;

in vec4 a_position;
in vec3 a_normal;
in vec2 a_texcoord;

out vec4 v_position;
out vec2 v_texCoord;
out vec3 v_normal;
out vec3 v_surfaceToLight;
out vec3 v_surfaceToView;

void main() {
    v_texCoord = a_texcoord;
    v_position = (u_worldViewProjection * a_position);
    v_normal = (u_worldInverseTranspose * vec4(a_normal, 0)).xyz;
    v_surfaceToLight = u_lightWorldPos - (u_world * a_position).xyz;
    v_surfaceToView = (u_viewInverse[3] - (u_world * a_position)).xyz;
    gl_Position = v_position;
}

// Fragment Shader
#version 300 es
precision highp float;

in vec4 v_position;
in vec2 v_texCoord;
in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToView;

uniform vec4 u_lightColor;
uniform vec4 u_ambient;
uniform sampler2D u_diffuse;
uniform vec4 u_specular;
uniform float u_shininess;
uniform float u_specularFactor;

out vec4 outColor;

vec4 lit(float l ,float h, float m) {
    return vec4(1.0,
    max(l, 0.0),
    (l > 0.0) ? pow(max(0.0, h), m) : 0.0,
    1.0);
}

void main() {
    vec4 diffuseColor = texture2D(u_diffuse, v_texCoord);
    vec3 a_normal = normalize(v_normal);
    vec3 surfaceToLight = normalize(v_surfaceToLight);
    vec3 surfaceToView = normalize(v_surfaceToView);
    vec3 halfVector = normalize(surfaceToLight + surfaceToView);
    vec4 litR = lit(dot(a_normal, surfaceToLight),
    dot(a_normal, halfVector), u_shininess);
    outColor = vec4((
    u_lightColor * (diffuseColor * litR.y + diffuseColor * u_ambient +
    u_specular * litR.z * u_specularFactor)).rgb,
    diffuseColor.a);
}
```

To use this shader program, there's a lot of boilerplate JS code to write:

```js
// At initialization time
var u_worldViewProjectionLoc   = gl.getUniformLocation(program, "u_worldViewProjection");
var u_lightWorldPosLoc         = gl.getUniformLocation(program, "u_lightWorldPos");
var u_worldLoc                 = gl.getUniformLocation(program, "u_world");
var u_viewInverseLoc           = gl.getUniformLocation(program, "u_viewInverse");
var u_worldInverseTransposeLoc = gl.getUniformLocation(program, "u_worldInverseTranspose");
var u_lightColorLoc            = gl.getUniformLocation(program, "u_lightColor");
var u_ambientLoc               = gl.getUniformLocation(program, "u_ambient");
var u_diffuseLoc               = gl.getUniformLocation(program, "u_diffuse");
var u_specularLoc              = gl.getUniformLocation(program, "u_specular");
var u_shininessLoc             = gl.getUniformLocation(program, "u_shininess");
var u_specularFactorLoc        = gl.getUniformLocation(program, "u_specularFactor");
 
var a_positionLoc              = gl.getAttribLocation(program, "a_position");
var a_normalLoc                = gl.getAttribLocation(program, "a_normal");
var a_texCoordLoc              = gl.getAttribLocation(program, "a_texcoord");
 
// Setup all the buffers and attributes (assuming you made the buffers already)
var vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.enableVertexAttribArray(a_positionLoc);
gl.vertexAttribPointer(a_positionLoc, positionNumComponents, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.enableVertexAttribArray(a_normalLoc);
gl.vertexAttribPointer(a_normalLoc, normalNumComponents, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
gl.enableVertexAttribArray(a_texcoordLoc);
gl.vertexAttribPointer(a_texcoordLoc, texcoordNumComponents, gl.FLOAT, 0, 0);
 
// At init or draw time depending on use.
var someWorldViewProjectionMat = computeWorldViewProjectionMatrix();
var lightWorldPos              = [100, 200, 300];
var worldMat                   = computeWorldMatrix();
var viewInverseMat             = computeInverseViewMatrix();
var worldInverseTransposeMat   = computeWorldInverseTransposeMatrix();
var lightColor                 = [1, 1, 1, 1];
var ambientColor               = [0.1, 0.1, 0.1, 1];
var diffuseTextureUnit         = 0;
var specularColor              = [1, 1, 1, 1];
var shininess                  = 60;
var specularFactor             = 1;
 
// At draw time
gl.useProgram(program);
gl.bindVertexArray(vao);
 
// Setup the textures used
gl.activeTexture(gl.TEXTURE0 + diffuseTextureUnit);
gl.bindTexture(gl.TEXTURE_2D, diffuseTexture);
 
// Set all the uniforms.
gl.uniformMatrix4fv(u_worldViewProjectionLoc, false, someWorldViewProjectionMat);
gl.uniform3fv(u_lightWorldPosLoc, lightWorldPos);
gl.uniformMatrix4fv(u_worldLoc, worldMat);
gl.uniformMatrix4fv(u_viewInverseLoc, viewInverseMat);
gl.uniformMatrix4fv(u_worldInverseTransposeLoc, worldInverseTransposeMat);
gl.uniform4fv(u_lightColorLoc, lightColor);
gl.uniform4fv(u_ambientLoc, ambientColor);
gl.uniform1i(u_diffuseLoc, diffuseTextureUnit);
gl.uniform4fv(u_specularLoc, specularColor);
gl.uniform1f(u_shininessLoc, shininess);
gl.uniform1f(u_specularFactorLoc, specularFactor);
 
gl.drawArrays();
```

There's a few ways to make this shorter; the tutorial uses various helper functions from TWGL to shorten this code.
While I don't think I can use this for my coursework, I can definitely get some ideas from it.
