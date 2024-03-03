// Import necessary libraries
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';


// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);

// position camera 50 up and looking down in a 45 degree angle
camera.position.set(0, 8, 13);
camera.lookAt(0, 8, 0);

// Create a renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.render(scene, camera);



// Lets make plane
const geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const plane = new THREE.Mesh(geometry, material);

plane.rotation.x = Math.PI / 2;
scene.add(plane);

function solidify(mesh) {
    const THICKNESS = 0.03;
    const geometry = mesh.geometry;
    const material = new THREE.ShaderMaterial({
        vertexShader: /* glsl */` 
            void main() {
                vec3 newPosition = position + normal * ${THICKNESS};
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `,
        fragmentShader: /* glsl */`
            void main() {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            }
        
        `,
        side: THREE.BackSide
    });

    const outline = new THREE.Mesh(geometry, material);
    outline.scale.set(1.01, 1.01, 1.01);
    scene.add(outline);
    return outline;
}

// Lets make a function that adds the tree to the scene
const addTree = async (x, y, z) => {

    // We load in three tone material from public threeTone.jpg
    const texture = await new THREE.TextureLoader().loadAsync('fiveTone.jpg');
    texture.minFilter = texture.magFilter = THREE.NearestFilter;

    const trunkTopThickness = Math.random() * (1.1 - 0.9) + 0.9;
    const trunkBottomThickness = Math.random() * (1.25 - trunkTopThickness) + trunkTopThickness;
    const trunkHeight = Math.random() * (10 - 8) + 8;
    const leavesHeight = Math.random() * (10 - 8) + 8;
    const leavesRadius = Math.random() * (5 - 4) + 4;

    const trunkGeometry = new THREE.CylinderGeometry(trunkTopThickness, trunkBottomThickness, trunkHeight, 32);
    const trunkMaterial = new THREE.MeshToonMaterial({
        color: 0x8B4513,
        gradientMap: texture
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    const outline = solidify(trunk)

    trunk.position.set(x, trunkHeight / 2, z);
    outline.position.set(x, trunkHeight / 2, z);
    scene.add(trunk);
    scene.add(outline)


    // Lets make the leaves
    const leavesGeometry = new THREE.ConeGeometry(leavesRadius, leavesHeight, 32);
    const leavesMaterial = new THREE.MeshToonMaterial({
        color: 0x005500,
        gradientMap: texture
    });

    // Create the first cone
    const leaves1 = new THREE.Mesh(leavesGeometry, leavesMaterial);
    const outline1 = solidify(leaves1);
    leaves1.position.set(x, trunkHeight + 4, z);
    outline1.position.set(x, trunkHeight + 4, z);
    leaves1.scale.set(0.8, 0.8, 0.8); // Scale down by 20%
    outline1.scale.set(0.8, 0.8, 0.8);
    scene.add(leaves1);
    scene.add(outline1);


    // Create the second cone
    const leaves2 = new THREE.Mesh(leavesGeometry, leavesMaterial);
    const outline2 = solidify(leaves2);
    leaves2.position.set(x, trunkHeight + 2, z);
    outline2.position.set(x, trunkHeight + 2, z);
    leaves2.scale.set(0.9, 0.9, 0.9); // Scale down by 10%
    outline2.scale.set(0.9, 0.9, 0.9);
    scene.add(leaves2);
    scene.add(outline2);

    // Create the third cone
    const leaves3 = new THREE.Mesh(leavesGeometry, leavesMaterial);
    const outline3 = solidify(leaves3);
    leaves3.position.set(x, trunkHeight, z);
    outline3.position.set(x, trunkHeight, z);
    scene.add(leaves3);
    scene.add(outline3);
}

// We add the trees randomly on to the shader
function addTreeRandomly() {
    let x, y, z;
    const exclusionRadius = 20;
    do {
        x = THREE.MathUtils.randFloatSpread(100);
        z = THREE.MathUtils.randFloatSpread(100);
    } while (
        (x < exclusionRadius && z < exclusionRadius) &&
        (x > -exclusionRadius && z > -exclusionRadius)
        
    );
    addTree(x, y, z);
}

// Lets add 100 trees
Array(150).fill().forEach(addTreeRandomly);

// Lets add stars to the sky 
const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff });
const starsVertices = [];

for (let i = 0; i < 1000; i++) {

    const x = Math.random() * (400) - 200;
    const y = Math.random() * (200 - 100) + 100;
    const z = Math.random() * (400) - 200;
    starsVertices.push(x, y, z);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);


const createFire = async () => {
    const texture = await new THREE.TextureLoader().loadAsync('threeTone.jpg');

    // Lets create some logs for a fire, we need three logs that will be represented by cylinders	
    const logGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 32);
    const logMaterial = new THREE.MeshToonMaterial({ color: 0x8B4513, gradientMap: texture });
    const log1 = new THREE.Mesh(logGeometry, logMaterial);
    // We turn the log 90 degrees so it is flat
    log1.rotation.x = Math.PI / 2;
    log1.rotation.z = Math.PI / 4;
    const log1Outline = solidify(log1);
    log1Outline.rotation.x = Math.PI / 2;
    log1Outline.rotation.z = Math.PI / 4;
    log1.position.set(0, 1, 0);
    log1Outline.position.set(0, 1, 0);
    scene.add(log1Outline)
    scene.add(log1);

    const log2 = new THREE.Mesh(logGeometry, logMaterial);
    log2.rotation.x = Math.PI / 2;
    log2.rotation.z = -Math.PI / 3;
    const log2Outline = solidify(log2);
    log2Outline.rotation.x = Math.PI / 2;
    log2Outline.rotation.z = -Math.PI / 3;
    log2.position.set(0, 1, 0);
    log2Outline.position.set(0, 1, 0);
    scene.add(log2Outline)
    scene.add(log2);

    // Now lets make the fire which we will represent with three cones
    const fireGeometry = new THREE.ConeGeometry(1, 3, 32);
    const fireMaterial = new THREE.MeshToonMaterial({
        color: 0xffa500,
        gradientMap: texture
    });
    const fire1 = new THREE.Mesh(fireGeometry, fireMaterial);
    const fire1Outline = solidify(fire1);
    fire1.position.set(0.5, 2.8, 0.4);
    fire1Outline.position.set(0.5, 2.8, 0.4);
    const angleInDegrees = 6;
    const angleInRadians = THREE.MathUtils.degToRad(angleInDegrees)
    fire1.rotation.z -= angleInRadians;
    fire1Outline.rotation.z -= angleInRadians;

    // We scale down the fire by 20%
    fire1.scale.set(0.8, 0.8, 0.8);
    fire1Outline.scale.set(0.8, 0.8, 0.8);

    scene.add(fire1);

    const fire2 = new THREE.Mesh(fireGeometry, fireMaterial);
    const fire2Outline = solidify(fire2);
    fire2.position.set(0, 3, 0);
    fire2Outline.position.set(0, 3, 0);
    scene.add(fire2);
    scene.add(fire2Outline);


    const fire3 = new THREE.Mesh(fireGeometry, fireMaterial);
    const fire3Outline = solidify(fire3);
    fire3.position.set(-0.5, 2.8, 0.4);
    fire3Outline.position.set(-0.5, 2.8, 0.4);
    fire3.rotation.z += angleInRadians;
    fire3Outline.rotation.z += angleInRadians;
    fire3.scale.set(0.7, 0.7, 0.7);
    fire3Outline.scale.set(0.7, 0.7, 0.7);
    scene.add(fire3);
    scene.add(fire3Outline);

    const fireList = [[fire1, fire1Outline], [fire2, fire2Outline], [fire3, fire3Outline]];

    return fireList;
}
const fireList = await createFire();

// We need a function that creates smoke particles for the fire
function createLowPolyClouds() {
    const cloudGeometry = new THREE.IcosahedronGeometry(0.2 + Math.random() * 0.1);
    const cloudMaterial = new THREE.MeshToonMaterial({ color: 0xffffff, transparent: true, opacity: 0.9});

    const cloudParticles = [];
    const numClouds = 45;
    const cloudRadius = 1;

    for (let i = 0; i < numClouds; i++) {
        const angle = (i / numClouds) * Math.PI * 2;
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        const cloudOutline = solidify(cloud);

        const gap = Math.random() * (1.2 - 0.8) + 0.8;
        const initialHeight = 5;

        const x = Math.cos(angle) * cloudRadius - 0.5;
        const y = i * gap + initialHeight; // 
        const z = Math.sin(angle) * cloudRadius;

        cloud.position.set(x, y, z);
        cloud.rotation.x = Math.random() * Math.PI;
        cloud.rotation.y = Math.random() * Math.PI;
        cloud.rotation.z = Math.random() * Math.PI;

        const scale1 = Math.random() * (2 - 0.7) + 1.2;
        const scale2 = Math.random() * (2 - 0.7) + 1.2;
        const scale3 = Math.random() * (2 - 0.7) + 1.2;

        cloud.scale.set(scale1, scale2, scale3);

        cloudOutline.position.copy(cloud.position);
        cloudOutline.scale.copy(cloud.scale);
        cloudOutline.rotation.copy(cloud.rotation);

        scene.add(cloud);
        scene.add(cloudOutline);
        cloudParticles.push([cloud, cloudOutline]);
    }

    return cloudParticles;
}

// Call the createLowPolyClouds function to generate the clouds
const cloudParticles = createLowPolyClouds();

// Lets create a function that will animate the clouds
function animateClouds(clouds) {
    clouds.forEach(([cloud, cloudOutline]) => {
        cloud.position.y += 0.01;
        cloud.rotation.x += 0.001;
        cloud.rotation.y += 0.001;
        cloud.rotation.z += 0.001;

        if (cloud.position.y > 50) {
            cloud.position.y = 5;
            cloud.position.x = Math.random() * (1 - -1) + -1;
            cloud.position.z = Math.random() * (1 - -1) + -1;
        }

        // slightly oscillate the scale
        cloud.scale.x = 1.4 + Math.sin(Date.now() * 0.003) * 0.1;
        cloud.scale.y = 1.4 + Math.sin(Date.now() * 0.002) * 0.1;
        cloud.scale.z = 1.4 + Math.sin(Date.now() * 0.004) * 0.1;

        cloudOutline.position.copy(cloud.position);
        cloudOutline.scale.copy(cloud.scale);
        cloudOutline.rotation.copy(cloud.rotation);
    });
}

const createRandomPebbles = async () => {
    // We load in three tone material from public threeTone.jpg
    const texture = await new THREE.TextureLoader().loadAsync('threeTone.jpg');
    // in a 60 radious from start we want to throw random rubble around, these will be represented by polyheadrons
    const pebbles = [];
    const numPebbles = 100;
    const pebblesRadius = 20;
    const pebblesGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 16, 16);
    const pebblesMaterial = new THREE.MeshToonMaterial({ color: 0x808080, gradientMap: texture });

    const exclusionRadius = 5;

    for (let i = 0; i < numPebbles; i++) {
        const pebble = new THREE.Mesh(pebblesGeometry, pebblesMaterial);
        const pebbleOutline = solidify(pebble);
        
        let x, y, z;

        do {
            x = Math.random() * 50 - 25;
            y = 0;
            z = Math.random () * 50 - 25;
        } while (
            (x < exclusionRadius && z < exclusionRadius) &&
            (x > -exclusionRadius && z > -exclusionRadius)
        );
        
        pebble.position.set(x, 0, z);
        pebble.scale.set(
            1 + Math.random() * 2,
            1 + Math.random() * 2,
            1 + Math.random() * 2
        );
        pebbleOutline.position.copy(pebble.position);
        pebbleOutline.scale.copy(pebble.scale);
        scene.add(pebble);
        scene.add(pebbleOutline);

        pebbles.push([pebble, pebbleOutline]);
    }

}
const rubble = createRandomPebbles();

// Now lets create a function that creates small clusters of grass
const createSingleGrassCluster = async (numbGrass, originPosition) => {
    const texture = await new THREE.TextureLoader().loadAsync('threeTone.jpg');
    const grassCluster = [];
    const numGrass = numbGrass;
    const grassGeometry = new THREE.ConeGeometry(0.1, 1, 32);
    const grassMaterial = new THREE.MeshToonMaterial({ color: 0x228B22, gradientMap: texture });

    for (let i = 0; i < numGrass; i++) {
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        const grassOutline = solidify(grass);

      
        grass.position.set(
            originPosition.x + Math.random() * 0.1,
            originPosition.y,
            originPosition.z + Math.random() * 0.1
        );

        

        // We rotate the grass by a random angle between 0 and 45 degrees
        const angleInDegrees = Math.random() * 45;
        const angleInRadians = THREE.MathUtils.degToRad(angleInDegrees);
        grass.rotation.z = angleInRadians;

        // We then rotate the grass by a random angle from 0 to 360 degrees on the y axis
        const angleInDegreesY = Math.random() * 360;
        const angleInRadiansY = THREE.MathUtils.degToRad(angleInDegreesY);
        grass.rotation.y = angleInRadiansY;

        grass.scale.set(
            1.5 + Math.random() * 1.5,
            1.5 + Math.random() * 1.5,
            1.5 + Math.random() * 1.5
        );
        grassOutline.position.copy(grass.position);
        grassOutline.scale.copy(grass.scale);
        grassOutline.rotation.copy(grass.rotation);
        scene.add(grass);
        scene.add(grassOutline);
        grassCluster.push([grass, grassOutline]);
    }

    return grassCluster;
}

// A function for randomly distributing grass clusters
const createRandomGrass = async (numbClusters) => {
    const grassClusters = [];
    const numClusters = numbClusters;
    const exclusionRadius = 10;
    for (let i = 0; i < numClusters; i++) {
        
        let x, y, z;

        do {
            x = Math.random() * 50 - 25;
            y = 0;
            z = Math.random () * 50 - 25;
        } while (
            (x < exclusionRadius && z < exclusionRadius) &&
            (x > -exclusionRadius && z > -exclusionRadius)
        );

        const numberOfGrassBlades = 5

        const cluster = await createSingleGrassCluster(numberOfGrassBlades, { x, y, z });
        grassClusters.push(cluster);
    }

    return grassClusters;
}

const grassClusters = await createRandomGrass(500);



function createPointLights() {
    const lightColor = 0xfff7b7;
    const pointLights = [];

    const pointLight1 = new THREE.PointLight(lightColor, lightBaseIntensity);
    pointLight1.position.set(0.5, 5, 0.4);
    scene.add(pointLight1);
    pointLights.push(pointLight1);

    const pointLight2 = new THREE.PointLight(lightColor, lightBaseIntensity);
    pointLight2.position.set(0, 6, 0);
    scene.add(pointLight2);
    pointLights.push(pointLight2);

    const pointLight3 = new THREE.PointLight(lightColor, lightBaseIntensity);
    pointLight3.position.set(-0.5, 5, 0.4);
    scene.add(pointLight3);
    pointLights.push(pointLight3);

    return pointLights;
}
const lightBaseIntensity = 30;
const pointLights = createPointLights();



// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

// Create a function that will resize the window
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Add an event listener for the window resize
window.addEventListener('resize', onWindowResize, false);


const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);



const flicker = (lights) => {
    const light1Interval = 0.003;
    const light2Interval = 0.005;
    const light3Interval = 0.007;

    lights[2].intensity = lightBaseIntensity + Math.sin(Date.now() * light1Interval) * 10;
    lights[0].intensity = lightBaseIntensity + Math.sin(Date.now() * light2Interval) * 10;
    lights[1].intensity = lightBaseIntensity + Math.sin(Date.now() * light3Interval) * 10;

    lights[1].position.y = 6 + Math.sin(Date.now() * 0.005) * 0.5;
    lights[2].position.y = 5 + Math.sin(Date.now() * 0.005) * 0.5;
    lights[0].position.y = 5 + Math.sin(Date.now() * 0.005) * 0.5;

    lights[1].position.x = Math.sin(Date.now() * 0.005) * 0.5;
    lights[2].position.x = Math.sin(Date.now() * 0.005) * 0.5;
    lights[0].position.x = Math.sin(Date.now() * 0.005) * 0.5;

    lights[1].position.z = Math.sin(Date.now() * 0.005) * 0.5;
    lights[2].position.z = Math.sin(Date.now() * 0.005) * 0.5;
    lights[0].position.z = Math.sin(Date.now() * 0.005) * 0.5;

}

const fireBurning = (fireList) => {

    // We want each one to have a different ossilation frequency
    const fire1Interval = 0.003;
    const fire2Interval = 0.005;
    const fire3Interval = 0.007;

    fireList[0][0].position.y = 2.8 + Math.sin(Date.now() * fire1Interval) * 0.1;
    fireList[1][0].position.y = 3 + Math.sin(Date.now() * fire2Interval) * 0.1;
    fireList[2][0].position.y = 2.8 + Math.sin(Date.now() * fire3Interval) * 0.1;

    fireList[0][1].position.y = 2.8 + Math.sin(Date.now() * fire1Interval) * 0.1;
    fireList[1][1].position.y = 3 + Math.sin(Date.now() * fire2Interval) * 0.1;
    fireList[2][1].position.y = 2.8 + Math.sin(Date.now() * fire3Interval) * 0.1;

    fireList[0][0].scale.set(0.8, 0.8, 0.8 + Math.sin(Date.now() * fire1Interval) * 0.1);
    fireList[1][0].scale.set(1.06, 1.06, 1.06 + Math.sin(Date.now() * fire2Interval) * 0.1);
    fireList[2][0].scale.set(0.7, 0.7, 0.7 + Math.sin(Date.now() * fire3Interval) * 0.1);

    fireList[0][1].scale.set(0.8, 0.8, 0.8 + Math.sin(Date.now() * fire1Interval) * 0.1);
    fireList[1][1].scale.set(1.06, 1.06, 1.06 + Math.sin(Date.now() * fire2Interval) * 0.1);
    fireList[2][1].scale.set(0.7, 0.7, 0.7 + Math.sin(Date.now() * fire3Interval) * 0.1);

}

function animate() {
    requestAnimationFrame(animate);


    flicker(pointLights)
    fireBurning(fireList);
    animateClouds(cloudParticles);

    // Ever so slowly rotate the stars
    stars.rotation.y += 0.00001;

    composer.render();
    // renderer.render(scene, camera);
}

animate();
