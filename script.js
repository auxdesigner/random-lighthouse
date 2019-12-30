const LOADER = document.getElementById('js-loader');

var theModel;

const MODEL_PATH = "lighthouse.glb";

var houseColor = {
  houseRed: ['E07878','E0A478','E0D878','85E078','78D5E0','7889E0','BE78E0'],
  placeholder: ['']
}

var houseBase = {
  houseGrey: ['EEEEEE'],
  window: ['E3F9FF']
}

var islandColor = {
  grass: ['CD6C05','CDC005','70CD05','05CDBE'],
  ground: ['D89247','1C7F5E','234A96','70185D']
}

var ladderColor = {
  rope: ['2A2E12','BFC3C6'],
  wood: ['59514D','82320A']
}

var island = ['grass', 'ground'];
var ladder = ['rope', 'wood'];
var house = ['houseRed', 'houseGrey', 'window'];

const BACKGROUND_COLOR = 0xDFF9FF;
// Init the scene
const scene = new THREE.Scene();
// Set background
scene.background = new THREE.Color(BACKGROUND_COLOR);
scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20, 100);

const canvas = document.querySelector('#c');

// Init the renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

renderer.shadowMap.enabled = false;
renderer.setPixelRatio(window.devicePixelRatio);

var cameraFar = 1;

document.body.appendChild(renderer.domElement);

// Add a camerra
var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = cameraFar;
camera.position.x = 0;

// Initial material
const INITIAL_MTL = new THREE.MeshPhongMaterial({ color: 0xf1f1f1, shininess: 10 });

const INITIAL_MAP = [
{ childID: "grass", mtl: INITIAL_MTL },
{ childID: "ground", mtl: INITIAL_MTL },
{ childID: "houseGrey", mtl: INITIAL_MTL },
{ childID: "houseRed", mtl: INITIAL_MTL },
{ childID: "rope", mtl: INITIAL_MTL },
{ childID: "window", mtl: INITIAL_MTL },
{ childID: "wood", mtl: INITIAL_MTL }];

// Init the object loader
var loader = new THREE.GLTFLoader();

loader.load(MODEL_PATH, function (gltf) {
  theModel = gltf.scene;

  theModel.traverse(o => {
    if (o.isMesh) {
      o.castShadow = false;
      o.receiveShadow = false;
    }
  });

  // Set the models initial scale   
  theModel.scale.set(1, 1, 1);
  theModel.rotation.x = 0;
  theModel.rotation.y = 0;
  theModel.rotation.z = 0;

  // Offset the y position a bit
  theModel.position.y = -0.1;

  // Set initial textures
  for (let object of INITIAL_MAP) {
    initColor(theModel, object.childID, object.mtl);
  }

  // Add the model to the scene
  scene.add(theModel);

  // Remove the loader
  LOADER.remove();

  colorIsland();
  colorHouse();
  colorHouseBase();
  colorLadder();

}, undefined, function (error) {
  console.error(error);
});

function colorIsland() {
  var randomNum = Math.floor(Math.random()*island[0].length)
  for (i = 0; i < island.length; i++) {
    var partColorGroup = islandColor[island[i]];
    var randomColor = partColorGroup[randomNum];
    new_mtl = new THREE.MeshPhongMaterial({
        color: parseInt('0x' + randomColor),
        shininess: 10});
        setMaterial(theModel, island[i], new_mtl);
  }
}

function colorHouse() {  
    var randomNum = Math.floor(Math.random()*house[0].length); //houseRed
    var partColorGroup = houseColor[house[0]];
    var randomColor = partColorGroup[randomNum];
    new_mtl = new THREE.MeshPhongMaterial({
        color: parseInt('0x' + randomColor),
        shininess: 10});
        setMaterial(theModel, house[0], new_mtl);
}

function colorLadder() {
  var randomNum = Math.floor(Math.random()*ladder[0].length)
  for (i = 0; i < ladder.length; i++) {
    var partColorGroup = ladderColor[ladder[i]];
    var randomColor = partColorGroup[randomNum];
    new_mtl = new THREE.MeshPhongMaterial({
        color: parseInt('0x' + randomColor),
        shininess: 10});
        setMaterial(theModel, ladder[i], new_mtl);
  }
}
console.log(houseBase[house[1]]);

function colorHouseBase() {
    new_mtl = new THREE.MeshPhongMaterial({
        color: parseInt('0x' + houseBase[house[1]]), // houseGrey
        shininess: 10});
        setMaterial(theModel, house[1], new_mtl);
    new_mtl = new THREE.MeshPhongMaterial({
        color: parseInt('0x' + houseBase[house[2]]), // window
        shininess: 10});
        setMaterial(theModel, house[2], new_mtl);
}

// Function - Add default textures to the models
function initColor(parent, type, mtl) {
  parent.traverse(o => {
    if (o.isMesh) {
      if (o.name.includes(type)) {
        o.material = mtl;
        o.nameID = type; // Set a new property to identify this object
      }
    }
  });
}

// Add lights
var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
// Add hemisphere light to scene   
scene.add(hemiLight);

var dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = false;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
// Add directional Light to scene    
scene.add(dirLight);

// Floor
var floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
var floorMaterial = new THREE.MeshPhongMaterial({
  color: 0xd3f3fb,
  shininess: 0 });

var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -0.5 * Math.PI;
floor.receiveShadow = false;
floor.position.y = -1;
scene.add(floor);

// Add controls
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 3;
controls.enableDamping = true;
controls.enablePan = false;
controls.dampingFactor = 0.1;
controls.autoRotate = true; 
controls.autoRotateSpeed = 0.8; 

function animate() {

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
}

animate();

// Function - New resizing method
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  var width = window.innerWidth;
  var height = window.innerHeight;
  var canvasPixelWidth = canvas.width / window.devicePixelRatio;
  var canvasPixelHeight = canvas.height / window.devicePixelRatio;

  const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {

    renderer.setSize(width, height, false);
  }
  return needResize;
}

function setMaterial(parent, type, mtl) {
  parent.traverse(o => {
    if (o.isMesh && o.nameID != null) {
      if (o.nameID == type) {
        o.material = mtl;
      }
    }
  });
}

document.body.onkeyup = function(e){
    if(e.keyCode == 32){
        colorIsland();
  colorHouse();
  colorHouseBase();
  colorLadder();
    }
}


  // for (i = 0; i < parts.length; i++) {
  //   var partColorGroup = colorGroup[parts[i]];
  //   var randomColor = partColorGroup[Math.floor(Math.random()*partColorGroup.length)];
  //   new_mtl = new THREE.MeshPhongMaterial({
  //       color: parseInt('0x' + randomColor),
  //       shininess: 10});
  //       setMaterial(theModel, parts[i], new_mtl);
  // }