/*
*
*Author: Akash Phadtare
*Title: Damaged Helmet ThreeJS App
*Description: Luma AI coding challenge
*Credits for Damaged Helmet 3D model: https://sketchfab.com/theblueturtle_
*/



//Imports
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0/build/three.module.js';
import { OrbitControls } from "https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/GLTFLoader.js";

//Set false for production
const isDevelopment = false;

//Basic ThreeJS Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

//New camera (fov, aspect ratio, near plane, far plane)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const initialCameraPosition = new THREE.Vector3(0, 0, 3);
camera.position.copy(initialCameraPosition);

//DEVELOPMENT: testing purposes
const gridHelper = new THREE.GridHelper(10, 10, 0xaec6cf, 0xaec6cf)
if(isDevelopment) scene.add(gridHelper)


//Declare variable to store 3D object info later
let object;
let material;


//~~~~~ Loading the 3D Model using GLTFLoader addon~~~~~
const loader = new GLTFLoader();
loader.load(
    '/src/models/Helmet.glb',
    function(gltf) {
        object = gltf.scene;

        object.traverse((child) => {
            if (child.isMesh) {
                material = child.material;
                material.emissive = new THREE.Color(0);
            }
        });
        scene.add(object);
    },
    function(xhr){
        //Show how much of the model is loaded
        if(isDevelopment) console.log((xhr.loaded/xhr.total*100) + '% loaded');   
    },
    function(error) {
        console.error(error);
    }
);


//~~~~~Initial Setup~~~~~~~~~~~~

//WebGL renderer with transparent bg
const renderer = new THREE.WebGLRenderer({alpha: true}, {antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

//Add it to our HTML doc
document.body.appendChild(renderer.domElement)

// Orbit Controls, off by default
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enabled = false;

// Reset camera position and look at the center of the scene
controls.addEventListener('end', () => {
    camera.position.copy(initialCameraPosition);
    camera.lookAt(scene.position);
    controls.update();
});




// ~~~~~~~~~~~~~~~~~~Lighting~~~~~~~~~~~~~

function createPointLight(color, intensity, x, y, z) {
    const pointLight = new THREE.PointLight(color, intensity);
    pointLight.position.set(x, y, z);
    return pointLight;
}

//Directional light
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(0, 1, 0);
dirLight.castShadow = true;
scene.add(dirLight);

// Point Lights
const backPLight = createPointLight(0xffffaa, 0.5, 0, 1, 5);
const rightPLight = createPointLight(0xffffaa, 0.5, 5, 1, 0);
const topLeftPLight = createPointLight(0xffffaa, 0.5, -5, 3, 0);
const topRightPLight = createPointLight(0xffffaa, 0.5, 0, 3, 5);
scene.add(backPLight, rightPLight, topLeftPLight, topRightPLight);

//Spotlight
const spotlight = new THREE.SpotLight(0xffffff, 0);
spotlight.position.set(0,5,0);
scene.add(spotlight);

//Ambient light
const ambientLight = new THREE.AmbientLight( 0x7c7c7c, 1 );
scene.add(ambientLight);

//Hemi light
const hemiLight = new THREE.HemisphereLight( 0x0000ff, 0x00ff00, 0.5 ); 
scene.add(hemiLight);


//~~~~~~~Helper Functions~~~~~~~

function lerp(x, y, a) {
    return (1 - a) * x + a * y;
}

function scalePercent(start, end) {
    return (scrollPercent - start) / (end - start);
}

//Store animations in this array
const animationScripts = [];

//Title text
animationScripts.push({
    start: 0,
    end: 5,
    func: () => {
        object.position.x = 1;
        object.position.y = 0;
        object.rotation.y = -Math.PI/4;
    },
});

//Animation1 - Title to Build
animationScripts.push({
    start: 5,
    end: 25,
    func: () => {
        object.position.z = lerp(0, 1, scalePercent(5, 25));
        object.position.x = lerp(1, -1, scalePercent(5, 25));
        object.rotation.y = lerp(-Math.PI/4, Math.PI/2, scalePercent(5, 25));
    },
});

//Build text
animationScripts.push({
    start: 25,
    end: 30,
    func: () => {
    },
});

//Animation2 - Build to Visor
animationScripts.push({
    start: 30,
    end: 50,
    func: () => {
        //camera.lookAt(object.position);
        object.rotation.y = lerp(Math.PI/2, 0, scalePercent(30, 50));
        object.position.x = lerp(-1, 0, scalePercent(30, 50));

        const val = lerp(-1,1,scalePercent(30,50));
        material.emissive = new THREE.Color(val,val,val);
        
        spotlight.intensity = 0;
    },
});

//Visor text
animationScripts.push({
    start: 50,
    end: 55,
    func: () => {
        spotlight.intensity = 3;
    },
});

//Visor to Neural
animationScripts.push({
    start: 55,
    end: 75,
    func: () => {
        object.rotation.x = lerp(0, -Math.PI/4, scalePercent(55, 75));
        object.rotation.y = lerp(0, 3*Math.PI/4, scalePercent(55, 75));
    },
});

//Neural text
animationScripts.push({
    start: 75,
    end: 80,
    func: () => {
    },
});

//Neural to Interact
animationScripts.push({
    start: 80,
    end: 90,
    func: () => {
        object.rotation.x = lerp(-Math.PI/4, 0, scalePercent(80, 90));
        object.rotation.y = lerp(3*Math.PI/4, -Math.PI/4, scalePercent(80, 90));
        controls.enabled = false;
    },
});

//Interact text
animationScripts.push({
    start: 90,
    end: 101,
    func: () => {
        controls.enabled = true;
    },
});

//Play all animations
function playScrollAnimations() {
    animationScripts.forEach((a) => {
        if (scrollPercent >= a.start && scrollPercent < a.end) {
            a.func();
        }
    });
}

//Handle Scroll event to calculate total scroll percentage
let scrollPercent = 0;

document.body.onscroll = () => {
    // Calculate the current scroll progress as a percentage
    scrollPercent = 
        ((document.documentElement.scrollTop || document.body.scrollTop) / 
        ((document.documentElement.scrollHeight || 
          document.body.scrollHeight) - 
          document.documentElement.clientHeight)) * 
        100;
    
    //Show text
    fadeParagraphByPercent(scrollPercent);

    // Update scroll progress text
    if(!isDevelopment) return;
    const scrollProgressElement = document.getElementById('scrollProgress');
    if (scrollProgressElement) {
        scrollProgressElement.innerText = 'Scroll Progress : ' + scrollPercent.toFixed(2);
    }
};

//Handle paragraphs based on percentage
//For easy access:
    //Anim timeline:
    //Para1 -> 0,10
    //Anim1 -> 5,25
    //Para2 -> 25,35
    //Anim2 -> 30,50
    //Para3 -> 50,55
    //Anim3 -> 55,75
    //Para4 -> 75,100


function fadeParagraphByPercent(scrollPercentage) {
    const paragraphs = [
        document.getElementById('para1'),
        document.getElementById('para2'),
        document.getElementById('para3'),
        document.getElementById('para4'),
        document.getElementById('para5')
    ];

    const division = Math.floor(scrollPercentage / 5);
    
    paragraphs.forEach((para, index) => {
        para.style.opacity = 0;
        if(index == 0 && (division == 0 || division == 1)){
            para.style.opacity = 1;
        }
        else if(index == 1 && (division == 5 || division == 6)){
            para.style.opacity = 1;
        }
        else if(index == 2 && (division == 10 || division == 11)){
            para.style.opacity = 1;
        }
        else if(index == 3 && (division == 15 || division == 16)){
            para.style.opacity = 1;
        }
        else if(index == 4 && (division >= 18)){
            para.style.opacity = 1;
        }

    });
}

// Animation Loop
function animate() {

    requestAnimationFrame(animate);
    if(object){
        playScrollAnimations();
    }
    renderer.render(scene, camera);
}

// Responsive Design
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.scrollTo({ top: 0, behavior: 'smooth' })
animate();
