varying vec2 vUv;
varying vec3 vNdc;
uniform sampler2D uTrailTexture;
varying vec2 vScreenUv;
varying vec3 vNormal; 


void main(){
    vUv = uv;

    vec4 clipSpace = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.);

    vNdc = clipSpace.xyz / clipSpace.w;

    vScreenUv = vNdc.xy * 0.5 + 0.5;

    // vScreenUv.y = vScreenUv.y + 1.;

    float extrude = texture2D(uTrailTexture, vScreenUv).r;

    vec3 pos = position;
    pos.z *= mix(0.1,1., extrude);

    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0); 

}