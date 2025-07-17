uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform vec2 uMouse;
varying vec2 vUv;
uniform sampler2D uTrailTexture;
varying vec2 vScreenUv;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uAmbientColor;
varying vec3 vNormal;



void main() {
    

    vec4 tex1 = texture2D(uTexture1, vUv);
    
    vec4 tex2 = texture2D(uTexture2, vUv);

    float extrude = texture2D(uTrailTexture,vScreenUv).r;

    float level0 = tex2.b;
    float level1 = tex2.g;
    float level2 = tex2.r;
    float level3 = tex1.b;
    float level4 = tex1.g;
    float level5 = tex1.r;
    float final = level0;

    final = mix(final,level1,smoothstep(0.1,0.2,extrude));
    final = mix(final,level2,smoothstep(0.2,0.4,extrude));
    final = mix(final,level3,smoothstep(0.4,0.6,extrude));
    final = mix(final,level4,smoothstep(0.6,0.8,extrude));
    final = mix(final,level5,smoothstep(0.8,1.,extrude));
    gl_FragColor = vec4(vec3(final),.8);

}





















//    vec2 screenUv = gl_FragCoord.xy / uResolution;



    // float dist = distance(screenUv,uMouse);
