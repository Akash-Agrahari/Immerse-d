uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform vec2 uMouse;
uniform vec3 uLightColor;
varying vec2 vUv;
uniform sampler2D uTrailTexture;
uniform float uMode;
varying vec2 vScreenUv;
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

    //  // 3. Mouse-following spotlight
    // vec3 normal = normalize(vNormal);
    // vec3 lightDir = normalize(vec3(
    //     uMouse.x - 0.5,    // X: -0.5 to +0.5
    //     -(uMouse.y - 0.5), // Y: flipped and centered
    //     -1.0               // Z: coming from above
    // ));
    
    // // Lighting calculation
    // float diff = max(dot(normal, lightDir), 0.0);
    // float spotlight = smoothstep(0.3, 0.8, diff); // Sharper light
    
    // // 4. Combine with ambient
    // vec3 ambient = vec3(0.1);
    // vec3 lightColor = vec3(1.0, 0.9, 0.7); // Warm yellow
    // vec3 litColor = final * (ambient + lightColor * spotlight * 2.0);
    
    

    gl_FragColor = vec4(vec3(final),uMode);

} 





















//    vec2 screenUv = gl_FragCoord.xy / uResolution;



    // float dist = distance(screenUv,uMouse);