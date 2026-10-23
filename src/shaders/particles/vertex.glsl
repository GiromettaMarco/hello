uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uProgress;
uniform vec2 uResolution;
uniform float uSize;

attribute vec3 aPositionTarget;
attribute float aSize;

varying vec3 vColor;
varying float vNoise;

#include ../includes/simplexNoise3D.glsl;

void main() {
    // Noise
    float noiseOrigin = simplexNoise3d(position * 0.2);
    float noiseTarget = simplexNoise3d(aPositionTarget * 0.2);
    float noise = smoothstep(-1.0, 1.0, mix(noiseOrigin, noiseTarget, uProgress));

    // Animation
    float duration = 0.4;
    float delay = (1.0 - duration) * noise;
    float end = delay + duration;
    float progress = smoothstep(delay, end, uProgress);

    // Mixed position
    vec3 mixedPosition = mix(position, aPositionTarget, progress);

    // Final position
    vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    gl_PointSize = aSize * uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings
    vColor = mix(uColorA, uColorB, noise);
    vNoise = noise;
}
