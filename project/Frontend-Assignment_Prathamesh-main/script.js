import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("solarCanvas"),
});
renderer.setSize(window.innerWidth, window.innerHeight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Add galaxy-like star field background
function createStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 10000;
  const positions = [];

  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    positions.push(x, y, z);
  }

  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7,
    sizeAttenuation: true,
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}
createStars();

// Sun
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(2, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xfdb813 })
);
scene.add(sun);

// Light
const light = new THREE.PointLight(0xffffff, 2, 100);
light.position.set(0, 0, 0);
scene.add(light);

const planetData = [
  { name: 'Mercury', radius: 0.3, distance: 4, color: 0xaaaaaa },
  { name: 'Venus', radius: 0.5, distance: 6, color: 0xffddaa },
  { name: 'Earth', radius: 0.6, distance: 8, color: 0x2233ff },
  { name: 'Mars', radius: 0.5, distance: 10, color: 0xff5533 },
  { name: 'Jupiter', radius: 1, distance: 13, color: 0xffaa33 },
  { name: 'Saturn', radius: 0.9, distance: 16, color: 0xffddaa },
  { name: 'Uranus', radius: 0.7, distance: 19, color: 0x66ccff },
  { name: 'Neptune', radius: 0.7, distance: 22, color: 0x3366ff },
];

const planets = [];
let isPaused = false;
let globalSpeedMultiplier = 1;

// Create planets and orbit rings
planetData.forEach((planet, i) => {
  const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: planet.color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = planet.distance;
  scene.add(mesh);

  const ringGeometry = new THREE.RingGeometry(planet.distance - 0.01, planet.distance + 0.01, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  const speed = 0.01 + i * 0.001;
  planets.push({ mesh, distance: planet.distance, angle: 0, speed, defaultSpeed: speed });

  // Slider UI
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0.001";
  slider.max = "0.1";
  slider.step = "0.001";
  slider.value = speed;
  slider.dataset.index = i;
  slider.oninput = (e) => {
    planets[e.target.dataset.index].speed = parseFloat(e.target.value);
  };

  const label = document.createElement("label");
  label.innerText = planet.name + ": ";
  label.appendChild(slider);
  label.style.display = "block";

  document.getElementById("planet-sliders").appendChild(label);
});

camera.position.z = 30;

// Control buttons
document.getElementById("pauseBtn").onclick = () => isPaused = true;
document.getElementById("resumeBtn").onclick = () => isPaused = false;
document.getElementById("resetBtn").onclick = () => {
  planets.forEach((planet, i) => {
    planet.speed = planet.defaultSpeed;
    document.querySelectorAll("#planet-sliders input")[i].value = planet.defaultSpeed;
  });
  globalSpeedMultiplier = 1;
  document.getElementById("globalSpeed").value = 1;
};

document.getElementById("globalSpeed").oninput = (e) => {
  globalSpeedMultiplier = parseFloat(e.target.value);
};

// Animate
function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    planets.forEach((planet) => {
      planet.angle += planet.speed * globalSpeedMultiplier;
      planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
      planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
    });
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
