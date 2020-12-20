vec3 rgb(float r, float g, float b) {
    return vec3(r / 255., g / 255., b / 255.);
}
vec3 rgb(float c) {
    return vec3(c / 255., c / 255., c / 255.);
}

uniform vec3 u_lowColor;
uniform vec3 u_highColor;
uniform float u_time;

varying vec2 vUv;
varying float vDistortion;
varying float xDistortion;

void main() {
    vec3 highColor = rgb(u_highColor.r, u_highColor.g, u_highColor.b);
    
    vec3 colorMap = rgb(u_lowColor.r, u_lowColor.g, u_lowColor.b);

    colorMap = mix(colorMap, highColor, vDistortion);
    
    gl_FragColor = vec4(colorMap, 1.);
}
