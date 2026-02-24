precision highp float;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
	vTexCoord = aTexCoord;
	gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
