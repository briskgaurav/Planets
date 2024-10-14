import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import gsap from "gsap";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 9;

// HDRI
const hdri = new RGBELoader();
hdri.load("https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr", function (env) {
  env.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = env;
});

// Background
const bgtexture = new THREE.TextureLoader().load("./Public/stars.jpg");
bgtexture.colorSpace = THREE.SRGBColorSpace;
const bgeometry = new THREE.SphereGeometry(10, 100, 100);
const bmaterial = new THREE.MeshStandardMaterial({ map: bgtexture, side: THREE.BackSide });
const bsphere = new THREE.Mesh(bgeometry, bmaterial);
scene.add(bsphere);

// LOOP planets
let radius = 1.3;
let segments = 60;
const spheres = new THREE.Group();
const planets = ["./Public/csilla/color.png", "./Public/earth/map.jpg", "./Public/venus/map.jpg", "./Public/volcanic/color.png"];

for (let i = 0; i < 4; i++) {
  // textures
  const texturesLoader = new THREE.TextureLoader();
  const textures = texturesLoader.load(planets[i]);
  textures.colorSpace = THREE.SRGBColorSpace;

  // geometry
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map: textures });
  const sphere = new THREE.Mesh(geometry, material);
  spheres.add(sphere);

  const angle = (i / 4) * (Math.PI * 2);
  sphere.position.x = 4.8 * Math.cos(angle);
  sphere.position.z = 4.8 * Math.sin(angle);
}
spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres);

// RENDERER
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("canvas"),
  antialias: true,
});

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);


// Animation
const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};
animate();

// Planets Animation
let lastwheeltime = 0;
const delay = 2000;
let scrollCount = 0;

function wheelevent(event) {
  const currenttime = Date.now();
  if (currenttime - lastwheeltime > delay) {
    lastwheeltime = currenttime;
    scrollCount = (scrollCount + 1) % 4;
    console.log(scrollCount);
  }
  const headings = document.querySelectorAll(".headings");
  gsap.to(headings, {
    duration: 1,
    y: `+=${-100}%`,
    ease: "power2.inOut",
  });
  gsap.to(spheres.rotation, {
    duration: 1,
    y: `+=${Math.PI / 2}`,
    ease: "power2.inOut",
  });
  if (scrollCount == 0) {
    gsap.to(headings, {
      duration: 1,
      y: `0%`,
      ease: "power2.inOut",
    });
  }
};

window.addEventListener("wheel", wheelevent);

// Mobile swipe event to rotate planets
let touchStartY = 0;
let touchEndY = 0;

function handleTouchStart(event) {
  touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
  touchEndY = event.touches[0].clientY;
}

function handleTouchEnd() {
  const swipeDistance = touchStartY - touchEndY;
  if (Math.abs(swipeDistance) > 50) { // Minimum swipe distance
    const currenttime = Date.now();
    if (currenttime - lastwheeltime > delay) {
      lastwheeltime = currenttime;
      scrollCount = (scrollCount + 1) % 4;
      console.log(scrollCount);

      const headings = document.querySelectorAll(".headings");
      gsap.to(headings, {
        duration: 1,
        y: `+=${swipeDistance > 0 ? -100 : 100}%`,
        ease: "power2.inOut",
      });
      gsap.to(spheres.rotation, {
        duration: 1,
        y: `+=${swipeDistance > 0 ? Math.PI / 2 : -Math.PI / 2}`,
        ease: "power2.inOut",
      });
      if (scrollCount == 0) {
        gsap.to(headings, {
          duration: 1,
          y: `0%`,
          ease: "power2.inOut",
        });
      }
    }
  }
}

window.addEventListener("touchstart", handleTouchStart);
window.addEventListener("touchmove", handleTouchMove);
window.addEventListener("touchend", handleTouchEnd);
