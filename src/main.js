import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import glb from "/og.glb?url"
import vertex from '../shaders/vertex.glsl'
import fragment from '../shaders/fragment.glsl'
import MouseTrailCanvas from './trail.js'
import { gsap } from 'gsap'
import Lenis from 'lenis'
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  25, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);
camera.position.set(0,0,5)

const canvas = document.querySelector("#canvas")

const lenis = new Lenis({
  smooth: true,
  lerp: .01, // feel free to tweak this
})  

lenis.on('scroll', ScrollTrigger.update)

gsap.to(camera.position,{
  y : -52,
  scrollTrigger : {
    trigger : document.querySelector("#scroll"),
    start : "top top",
    end : "bottom bottom",
    scrub : 1.5
  }
})

// Custom scroll loop
function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)


// Renderer
const renderer = new THREE.WebGLRenderer({canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2))
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.5

let materials = []

const trail = new MouseTrailCanvas() 
let trailcanvas = trail.canvas


let trailtex = new THREE.Texture(trail.getTexture())
trailtex.flipY = true
trailtex.needsUpdate = true


const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2(.0,.0)
const mouse2d = new THREE.Vector2(0,0)


const draco = new DRACOLoader()
draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/') 


const loader = new GLTFLoader()
loader.setDRACOLoader(draco)
loader.load(glb,(gltf)=>{
let model = gltf.scene
window.addEventListener("mousemove",function(event){
  
  let mouseX = event.clientX / window.innerWidth;
  let mouseY = 1.0 - event.clientY / window.innerHeight; // flip Y

  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * trailcanvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * trailcanvas.height;
  mouse2d.set(x, y);

  raycaster.setFromCamera(new THREE.Vector2(mouseX,mouseY),camera);
  const intersects = raycaster.intersectObjects([model]);

  if (intersects.length > 0) {
    mouse.set(mouseX,mouseY)
  }
})


  gltf.scene.traverse((child)=>{
    if(child instanceof THREE.Mesh){

      child.geometry.computeVertexNormals(); 
            
            // Optional: Flip normals if lighting looks inverted
            child.geometry.attributes.normal.array.forEach((v, i) => {
                child.geometry.attributes.normal.array[i] = -v;
            });
            child.geometry.attributes.normal.needsUpdate = true;

    let mat = new THREE.ShaderMaterial({
      vertexShader : vertex,
      fragmentShader: fragment,
      uniforms:{
        uMouse:{value: mouse},
        uTexture1 : {value: child.material.map},
        uTexture2 : {value: child.material.emissiveMap},
        uTrailTexture : {value : trailtex},
        uLightColor: { value: new THREE.Color(0xFFE08C) } // Warm yellow light
      }
    })
    child.material = mat
    materials.push(mat)

    }
  })

  model.position.set(0,-1,-9)
  scene.add(model)
})



// Animation loop
function animate() {
  requestAnimationFrame(animate);
  trail.update(mouse2d)
  trailtex.needsUpdate = true
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});