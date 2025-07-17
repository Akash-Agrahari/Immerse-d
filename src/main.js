import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import model from "/og.glb?url"
import vertex from '../shaders/vertex.glsl'
import fragment from '../shaders/fragment.glsl'
import MouseTrailCanvas from './trail.js'

// Scene
const scene = new THREE.Scene();


const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Increased intensity
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(1, 2, 3).normalize();
directionalLight.castShadow = true; // Enable shadows if needed
scene.add(directionalLight);




// Camera
const camera = new THREE.PerspectiveCamera(
  25, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);
camera.position.set(0,0,15)
camera.lookAt(0,0,0);
const canvas = document.querySelector("#canvas")

const controls = new OrbitControls(camera,canvas)
controls.enableDamping = true


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

trailcanvas.style.position = "absolute"
trailcanvas.style.top = "0"
trailcanvas.style.width = "200px";
trailcanvas.style.height = "200px";
trailcanvas.style.left = "0"
trailcanvas.style.zIndex = "100"
document.body.appendChild(trailcanvas); // or some specific <div id="canvas-container">

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
loader.load(model,(gltf)=>{

  const model = gltf.scene

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

    let mat = new THREE.ShaderMaterial({
      vertexShader : vertex,
      fragmentShader: fragment,
      uniforms:{
        uMouse:{value: mouse},
        uTexture1 : {value: child.material.map},
        uTexture2 : {value: child.material.emissiveMap},
        uTrailTexture : {value : trailtex},
        uLightDirection: { value: directionalLight.position },
          uLightColor: { value: new THREE.Color(0xffffff) },
          uAmbientColor: { value: new THREE.Color(0x404040) }
      }
    })
    child.material = mat
    materials.push(mat)

    }
  })

  model.position.set(0,2,0)
  scene.add(model)
})

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  trail.update(mouse2d)
  trailtex.needsUpdate = true
  controls.update()
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});