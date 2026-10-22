uniform float uTime;

varying vec3 vColor;
varying float vNoise;

void main() {
    vec2 uv = gl_PointCoord;
    float distanceToCenter = length(uv - 0.5);
    float pulse = clamp(0.5 * (sin(uTime * 3.0 * vNoise) + 1.0), 0.5, 1.0);
    float alpha = (0.05 / distanceToCenter - 0.1) * pulse;

    gl_FragColor = vec4(vColor, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}