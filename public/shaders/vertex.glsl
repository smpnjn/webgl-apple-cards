uniform float u_time;
uniform float u_height;
uniform vec2 u_rand;

float xDistortion;
float yDistortion;

varying float vDistortion;
varying vec2 vUv;

void main() {
    vUv = uv;
    vDistortion = snoise(vUv.xx * 3. - vec2(u_time / u_rand.x, u_time / u_rand.x) + cos(vUv.yy) * u_rand.y) * u_height;
    xDistortion = snoise(vUv.xx * 1.) * u_height * u_rand.x / 10.;
    vec3 pos = position;
    pos.z += (vDistortion * 55.);
    pos.x += (xDistortion * 55.);
    pos.y += (sin(vUv.y) * 55.);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
