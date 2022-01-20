
    
import * as THREE from 'https://threejs.org/build/three.module.js';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://threejs.org/examples/jsm/postprocessing/EffectComposer.js';
import { UnrealBloomPass} from 'https://threejs.org/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RenderPass} from 'https://threejs.org/examples/jsm/postprocessing/RenderPass.js';
// import { RGBELoader } from 'https://threejs.org/examples/jsm/loaders/RGBELoader.js';




const firefliesVertexShader = `
uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;
uniform float scroll;
attribute float aScale;
void main() {
  vec4 modelPosition = modelMatrix * vec4(position, .1);
  modelPosition.x += cos((uTime /10.0) + modelPosition.x * 100.0) * aScale * .2;
  modelPosition.y += sin((uTime /10.0)  + modelPosition.x * 100.0) * aScale * .2;
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPostion = projectionMatrix * viewPosition;

  gl_Position = projectionPostion;
  gl_PointSize = uSize * aScale * uPixelRatio;
  gl_PointSize *= (.2  / - viewPosition.z );
}
`;

const firefliesFragmentShader = `
void main() {
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
  float strength = 0.09 / distanceToCenter - 0.3;
  gl_FragColor = vec4(.7, .7, .7, strength);
}
`; 

  let animateActions = [];
    
const paramst = {
  enableSSRr: true,
  autoRotate: true,
  exposure: 1.5,
    bloomStrength: 1.59,
    bloomThreshold: .82,
    bloomRadius: 0,
    x:0,
    y:0,
    z:0,
    grayscale:false,
};


const transmissionoptions = {
 
  transmission: 1,
  thickness: 1.2,
  roughness: 0.1,
  envMapIntensity: 2.6,
  clearcoat: 1,
  clearcoatRoughness: 0.28,
  normalScale: .31,
  clearcoatNormalScale: 0,
  normalRepeat: 1
};

// const hdrEquirect = new RGBELoader().load(
//   "https://cdn.statically.io/gh/chris-ain/handlefinal/main/empty_warehouse_01_1k.exr",
//   () => {
//     hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
//   }
// );


const targetObject = new THREE.Object3D();
let dat;

var stopAnimate;

const objects = [];
const selects = [];
var gui = new dat.GUI();

const group = new THREE.Group();
var clock = new THREE.Clock();
var delta = clock.getDelta();
var action1;
export var id;
export  var scene;
export var expModel;

export function chessScene(smoothScroll) {


    //===================================================== canvas
    const chessCanvas = document.getElementById("chess");

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialiase: true, canvas: chessCanvas});
  


    //===================================================== scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0xf7f7f7, 0.005 );

    // let envMapURLs = ['x', 'y', 'z'].reduce((p, d) => p.concat(['p', 'n'].map(n => `${n}${d}.jpg`)), []);
    // let reflectionCube= new THREE.CubeTextureLoader().
    // setCrossOrigin('').
    // setPath('https://alca.tv/static/codepen/pens/common/SwedishRoyalCastle/').
    // load(envMapURLs);
    // reflectionCube.format = THREE.RGBFormat;
    // scene.environment = reflectionCube;

    let tooLazyToHandleLoadingProperly = 0;
    const loadingLol = () => tooLazyToHandleLoadingProperly++;
    const ENV_URL = "https://uploads-ssl.webflow.com/612d2c01db57a270ec502b3f/61851a3cda969ca9a8759427_back.jpg";
    const reflectionCube = new THREE.TextureLoader().load(ENV_URL, loadingLol);
    reflectionCube.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = reflectionCube;
  






    https://cdn.statically.io/gh/chris-ain/handlefinal/main/Studio_HighContrast.hdr
    //===================================================== camera
    var texLoader = new THREE.TextureLoader();

    
    var camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    camera.position.y = 1.5;


    //===================================================== lights

   
    // var lightamb = new THREE.AmbientLight(0x6b1c77, .5);
    // lightamb.position.set(-1, 8, -1)
    // scene.add(lightamb);
  
    
    // var light2 = new THREE.DirectionalLight(0x6b1c77,1 );
    // light2.position.set(1, 8, 0)

    // light2.shadow.mapSize.width = 1012; // default
    // light2.shadow.mapSize.height =1012; // default
    // light2.shadow.camera.near = 0.5; // default
    // light2.shadow.camera.far = 500; // default
    // light2.castShadow = true;
    // scene.add(light2);
    
    // var light3 = new THREE.SpotLight(0x225477, 1);
    // light3.position.set(-1, 15, -1);
    // scene.add(light3);
    //     const helper = new THREE.SpotLightHelper( light3 );
    // // scene.add( helper );
    // scene.add(targetObject);
    // targetObject.position.set(0,.65, 0);
    // light3.target = targetObject;
    // light2.target = targetObject;
 


    var normal = texLoader.load( 'https://uploads-ssl.webflow.com/612d2c01db57a270ec502b3f/61885cd22ccdfed3d95febbf_download.jpg');
 



    const materialmat = new THREE.MeshMatcapMaterial({
      normalMap: normal,
      normalScale: new THREE.Vector2( .04, .04 ),

    })

    const matcapTexture = texLoader.load('https://uploads-ssl.webflow.com/612d2c01db57a270ec502b3f/618554e0f8540f80a52aaf77_images.jpg')
    materialmat.matcap = matcapTexture

    const materialmat2 = new THREE.MeshMatcapMaterial({
      normalMap: normal,
      normalScale: new THREE.Vector2( .04, .04 ),

    })

    const matcapTexture2 = texLoader.load('https://uploads-ssl.webflow.com/612d2c01db57a270ec502b3f/6185565a02d38140d4f7320d_images-1.jpg')
    materialmat2.matcap = matcapTexture2


    var materialwhite = new THREE.MeshPhysicalMaterial({
      roughness: 0,
      transmission: 1,
      thickness: 1.5,
      // envMap: reflectionCube, 
      // envMapIntensity:.2     

    });
    

    var materialcool =   new THREE.MeshPhysicalMaterial({
      color: 0xffffff,

      roughness: 0,
      transmission: 1,
      thickness: 1.5,
      // envMap: reflectionCube,      
      // envMapIntensity:.2     
    });


    const materialTrans = new THREE.MeshPhysicalMaterial({
      transmission: transmissionoptions.transmission,
      thickness: transmissionoptions.thickness,
      roughness: transmissionoptions.roughness,
      envMap: reflectionCube,
      envMapIntensity: transmissionoptions.envMapIntensity,
      clearcoat: transmissionoptions.clearcoat,
      clearcoatRoughness: transmissionoptions.clearcoatRoughness,
      normalScale: new THREE.Vector2(transmissionoptions.normalScale),
      normalMap: normal,
      // clearcoatNormalMap: normalMapTexture,
      // clearcoatNormalScale: new THREE.Vector2(transmissionoptions.clearcoatNormalScale)
    });
    






//////////////////////////////// MODEL ////////////////////

      var loader = new GLTFLoader();
      var mixer;
      var model;
      var clips;
      var mixers = [];
      var model2;

      const bgTexture = texLoader.load ("https://uploads-ssl.webflow.com/612d2c01db57a270ec502b3f/61850c6cd81cfd578bb531c5_shutterstock_1184338375%20copy.jpg");

const bgMaterial = new THREE.MeshBasicMaterial({ map: bgTexture });
     

    loader.load(
      "https://raw.githubusercontent.com/chris-ain/handlefinal/main/chess_board_weiss.glb",
      function (gltf) {


    gltf.scene.traverse(function (node) {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    
    // gltf.scene.children
    // .filter((child) => child.name.includes("Cube"))
    // .forEach((mesh) => {
    //   mesh.material = materialTrans;      

    // });

    gltf.scene.children
    .filter((child) => child.name.includes("Mesh"))
    .forEach((mesh) => {
      mesh.material = materialTrans;      

    });

    // gltf.scene.children
    // .filter((child) => child.name.includes("weiss"))
    // .forEach((mesh) => {
    //   mesh.material = materialmat;      

    // });

  
    
    model = gltf.scene;
    expModel = gltf.scene;
    model.position.set(0,-.01, 0);

    group.scale.set(0.31, 0.31, 0.31);
    group.position.set(0,.5, 0);

    group.rotation.set(0,-Math.PI/2, 0);
    group.add( model);
    scene.add( group );


    
    mixer = new THREE.AnimationMixer(model);
    mixer.timeScale = 1;

    var action = mixer.clipAction(gltf.animations[1]);
    clips=gltf.animations;

    clips.forEach(element => {
      mixer.clipAction( element ).play();
    });

    clips.paused= true;
    createAnimation(mixer, action, gltf.animations[1]);
    // model.material.needsUpdate = true;
  
    }
  );
  loader.load(
    "https://raw.githubusercontent.com/chris-ain/handlefinal/main/60eca04c35df3c744ae674b6_cube__2_.glb",
    function (gltf) {


      gltf.scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.material = materialTrans;      
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
  
      model2 = gltf.scene;

      model2.scale.set(20,20,20)

      model2.position.set(0,7,0)
      scene.add( model2);
   

    });

  function updateMaterial() {
    materialcool.side = Number(materialcool.side)
    materialcool.needsUpdate = true
}

function createPlane(){
  const geometry = new THREE.PlaneGeometry( 450, 250 );
  const materialmat = new THREE.MeshBasicMaterial({

    wireframe: true,
  });   
  const planeBackground = new THREE.Mesh( geometry, materialmat );
  
  
  scene.add( planeBackground );
  planeBackground.position.set(0,0,-180)

}



 
//////////FIREFLIES////////////////////////

const firefliesGeometry = new THREE.BufferGeometry();
const firefliesCount = 500;
const positionArray = new Float32Array(firefliesCount * 3);
const scaleArray = new Float32Array(firefliesCount);
for (let i = 0; i < firefliesCount; i++) {
  new THREE.Vector3(
  (Math.random() - 0.5) * 4,
  Math.random() * 1.5,
  (Math.random() - 0.5) * 4).
  toArray(positionArray, i * 3);
  scaleArray[i] = Math.random();
  scaleArray[i] = Math.random();
  
}
firefliesGeometry.setAttribute(
"position",
new THREE.BufferAttribute(positionArray, 3));

firefliesGeometry.setAttribute(
"aScale",
new THREE.BufferAttribute(scaleArray, 1));

// const firefliesMaterial = new THREE.ShaderMaterial({
//   vertexShader: firefliesVertexShader,
// fragmentShader: firefliesFragmentShader,
//   transparent: true,
//   uniforms: {
//     scroll: {value: 0},
//     uTime: { value: 0 },
//     uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
//     uSize: { value: 100 }
//   },
//   blending: THREE.AdditiveBlending,
//   depthWrite: false
// });

const fireflies = new THREE.Points(firefliesGeometry, materialmat);
scene.add(fireflies);



// createPlane ();

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor( 0x000000, 0 );
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMappingExposure = 2 ;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // renderer.physicallyCorrectLights= true;
  // renderer.outputEncoding = THREE.sRGBEncoding;



  // const folder = gui.addFolder( 'more settings' );
  // folder.add( ssrrPass, 'specular' );
  // folder.add( ssrrPass.specularMaterial, 'metalness' ).min( 0 ).max( 10 ).step( .01 );
  // folder.add( ssrrPass.specularMaterial, 'roughness' ).min( 0 ).max( 10 ).step( .01 );
  // folder.add( ssrrPass, 'output', {
  //   'Default': SSRrPass.OUTPUT.Default,
  //   'SSRr Only': SSRrPass.OUTPUT.SSRr,
  //   'Beauty': SSRrPass.OUTPUT.Beauty,
  //   'Depth': SSRrPass.OUTPUT.Depth,
  //   'DepthSelects': SSRrPass.OUTPUT.DepthSelects,
  //   'NormalSelects': SSRrPass.OUTPUT.NormalSelects,
  //   'Refractive': SSRrPass.OUTPUT.Refractive,
  //   'Specular': SSRrPass.OUTPUT.Specular,
  // } ).onChange( function ( value ) {

  //   ssrrPass.output = parseInt( value );

  // } );
  // ssrrPass.surfDist = 0.0015;
  // // folder.add( ssrrPass, 'surfDist' ).min( 0 ).max( .005 ).step( .0001 );
  // ssrrPass.maxDistance = 50;
  // // folder.add( ssrrPass, 'maxDistance' ).min( 0 ).max( 100 ).step( .001 );
  // // folder.add( ssrrPass, 'infiniteThick' );
  // folder.open()
  // gui.close()
 
        
     //===================================================== Postprocessing
     const effectFilm = new FilmPass(0.01, 0.95, 2048,   paramst.grayscale,  // grayscale
      );

   
    var composer;
    composer = new EffectComposer( renderer );
    const renderScene = new RenderPass( scene, camera );
    composer.addPass( renderScene );


    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
        bloomPass.threshold = paramst.bloomThreshold;
        bloomPass.strength = paramst.bloomStrength;
        bloomPass.radius = paramst.bloomRadius;
    composer.addPass( bloomPass )

   effectFilm.renderToScreen = true;

    composer.addPass(effectFilm);


    window.addEventListener("resize", function () {
      let width = window.innerWidth;
      let height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      composer.setSize(canvas.clientWidth, canvas.clientHeight);
      const pixelRatio = renderer.getPixelRatio();
      camera.updateProjectionMatrix();

    });


    
  // GUI


  // gui.add( paramst, 'enableSSRr' ).name( 'Enable SSRr' );
  // ssrrPass.ior = 1.1;
  // gui.add( ssrrPass, 'ior' ).name( 'IOR' ).min( .1 ).max( 1.5 ).step( .0001 );
  // gui.add( ssrrPass, 'fillHole' );
  // gui.add( paramst, 'autoRotate' ).onChange( () => {


  // } );

  gui.add( paramst, 'exposure', 0.1, 2 ).onChange( function ( value ) {

      renderer.toneMappingExposure = Math.pow( value, 4.0 );
  

  } );

  gui.add( paramst, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {

    bloomPass.threshold = Number( value );

  } );

  gui.add( paramst, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {

    bloomPass.strength = Number( value );

  } );

  gui.add( paramst, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

    bloomPass.radius = Number( value );

  } );


  gui.add( paramst, 'x', 0.0, 10.0 ).step( 0.1 ).onChange( function ( value ) {

    group.rotation.x = Number( value );

  } );

  gui.add( paramst, 'y', 0.0, 10.0 ).step( 0.1 ).onChange( function ( value ) {

    group.rotation.y = Number( value );

  } );


  gui.add( paramst, 'x', 0.0, 10.0 ).step( 0.1 ).onChange( function ( value ) {

    group.position.x = Number( value );

  } );


  gui.add( paramst, 'y', 0.0, 10.0 ).step( 0.1 ).onChange( function ( value ) {

    group.position.y = Number( value );

  } );

  gui.add( paramst, 'z', -10.0, 10.0 ).step( 0.1 ).onChange( function ( value ) {

    group.position.z = Number( value );

  } );

  gui.add(effectFilm.uniforms.grayscale, 'value', true).name('Gray Scale');



  gui.add(transmissionoptions, "transmission", 0, 1, 0.01).onChange((val) => {
    materialTrans.transmission = val;
  });

  gui.add(transmissionoptions, "thickness", 0, 5, 0.1).onChange((val) => {
    materialTrans.thickness = val;
  });

  gui.add(transmissionoptions, "roughness", 0, 1, 0.01).onChange((val) => {
    materialTrans.roughness = val;
  });

  gui.add(transmissionoptions, "envMapIntensity", 0, 3, 0.1).onChange((val) => {
    materialTrans.envMapIntensity = val;
  });

  gui.add(transmissionoptions, "clearcoat", 0, 1, 0.01).onChange((val) => {
    materialTrans.clearcoat = val;
  });

  gui.add(transmissionoptions, "clearcoatRoughness", 0, 1, 0.01).onChange((val) => {
    materialTrans.clearcoatRoughness = val;
  });

  gui.add(transmissionoptions, "normalScale", 0, 5, 0.01).onChange((val) => {
    materialTrans.normalScale.set(val, val);
  });

  gui.add(transmissionoptions, "clearcoatNormalScale", 0, 5, 0.01).onChange((val) => {
    materialTrans.clearcoatNormalScale.set(val, val);
  });

  gui.add(transmissionoptions, "normalRepeat", 1, 4, ).onChange((val) => {
    normalMapTexture.repeat.set(val, val);
  });




    const animate= () => {

      const elapsedTime = clock.getElapsedTime();
 
      // firefliesMaterial.uniforms.uTime.value = elapsedTime/2;
      // updateMaterial();
      if (mixer != null) mixer.update(delta);
      if (group) group.rotation.y -= 0.0005;
      
      id = window.requestAnimationFrame(animate);

      renderer.render(scene, camera);
      composer.render();

    };

    animate();





    // const handlePointerMove = ({ clientX, clientY }) => {
    //   const centerPoint = {
    //     x: window.innerWidth / 2,
    //     y: window.innerHeight / 2,
    //   };
    //   const z = (clientX - centerPoint.x) / 6000;
    //   const x = (clientY - centerPoint.y) / 6000;
    //   gsap.to(model.rotation, {
    //     x: -x,
    //     y: -z,
    //     duration: 1,
    //     ease: "power2.out",
    //     onUpdate: renderer.render(scene, camera),
    //   });
    // };
    // window.addEventListener("pointermove", handlePointerMove);
 
function createAnimation(mixer, action, clip) {
  let proxy = {

    get time() {
      return mixer.time;
    },
    set time(value) {

      

      clips.forEach(element => {
        var last = mixer.clipAction( element );
        last.paused = false;

      });
      mixer.setTime(value);
      clips.forEach(element => {
        var last = mixer.clipAction( element );
        last.paused = true;
      });
    }
  };

  let scrollingTL = gsap.timeline({
    scrollTrigger: {
      trigger: ".smooth-scroll",
      scroller: ".smooth-scroll",
      start: "top 10",
      end: "bottom",
      scrub: true,
      ease: Power3.easeInOut,
      onUpdate: function () {
        camera.updateProjectionMatrix();
      }
    }
  });

  scrollingTL.to(proxy, {
    time: clip.duration,
    repeat: 0,
  });

  let scrollingTL2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".smooth-scroll",
      scroller: ".smooth-scroll",
      start: "top top",
      end: "bottom",
      scrub: true,
        ease: Power3.easeInOut,
onUpdate: function () {
        camera.updateProjectionMatrix();
      }
    }
  }, );

  scrollingTL2.to(model.rotation, {
    x:Math.PI/5,
    y:Math.PI,
    z:-Math.PI/5,

  });
  
  let scrollingTL3 = gsap.timeline({
    scrollTrigger: {
      trigger: ".smooth-scroll",
      scroller: ".smooth-scroll",
      start: "top top",
      end: "bottom",
      scrub: true,
        ease: Power3.easeInOut,
onUpdate: function () {
        camera.updateProjectionMatrix();
      }
    }
  }, );

  

    scrollingTL3.to(model.position, {
    x:2,
    y:-2,

  });



}


};
