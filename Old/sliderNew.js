/**
 * I referenced the YouTube by Mr.Yuri Artyukh.
 * URL: https://www.youtube.com/watch?v=8K5wJeVgjrM&t=615s
 * CDN: from https://cdn.jsdelivr.net
 * Thank you so much :)
 */

 import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
 import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
 //import { Stats } from 'https://cdnjs.cloudflare.com/ajax/libs/stats.js/16/Stats.min.js';
 
 /** vertex shader source */
 const vertexShaderSource = `
 uniform float time;
 uniform vec2 pixels;
 uniform float distanceFromCenter;
 uniform int hover;
 
 varying vec2 vUv;
 varying vec3 vPosition;
 
 float PI = 3.1415926535;
 
 void main () {
   vUv = (uv - vec2(0.5)) * (0.8 - 0.2 * distanceFromCenter * (0.0 - distanceFromCenter)) + vec2(0.5);
   vec3 pos = position;
   /*  
   if (hover == 0) {
     pos.y = sin(pos.x + time * 0.01) * 0.1 + pos.y;
     pos.z = cos(pos.x + time * 0.01) * 0.1 + pos.z;
   }
   */
   if (hover == 0) {
     pos.y = sin(pos.x + time * 0.01) * 0.05 + pos.y;
     pos.z = sin(pos.x + time * 0.01) * 0.02 + pos.z;
   }
   //pos.y += sin(time * 0.03) * 0.01;
   //vUv.y -= sin(time * 0.03) * 0.01;
   gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
 }
 
 `;
 
 /** fragment shader source */
 const fragmentShaderSource = `
 uniform float time;
 uniform sampler2D texture1;
 uniform vec4 resolution;
 uniform float distanceFromCenter;
 
 varying vec2 vUv;
 varying vec3 vPosition;
 
 vec3 rgbShift(sampler2D texture1, vec2 uv, vec2 offset) {
   float r = texture2D(texture1,uv + offset).r;
   vec2 gb = texture2D(texture1,uv).gb;
   return vec3(r,gb);
 }
 
 void main () {
  //  vec3 color = rgbShift(texture1,vUv,distanceFromCenter);
   vec4 t = texture2D(texture1, vUv);
   vec4 another = vec4(t.r, t.g, t.r, 0.0);
   gl_FragColor = mix(another, t, distanceFromCenter);
   gl_FragColor.a = clamp(distanceFromCenter, 0.2, 1.0);
 }
 
 `;
 
 /**
  * class Sketch
  */


 class Sketch {
   constructor() {
     this.stats = null;
     
     this.renderer = new THREE.WebGLRenderer({ antialias: true });
     document.getElementById('container').appendChild(this.renderer.domElement);
     
     /** basic parameters */
     this.animationId = null;
     this.camera = null;
     this.scene = null;
     this.controls = null; // for orbit
     this.time = null;
     
     /** for wheel */
     this.speed = null;
     this.position = null;
     this.rounded = null;
     this.preRounded = null;
     
     /** for handleImages */
     this.images = null;
     this.materials = null;
     this.meshes = null;
     this.groups = null;
     
     /** for navEventSetup */
     this.rots = null;
     this.navs = null;
     this.nav = null;
     this.attractMode = null;
     this.attractTo = null;
     
     /** get doms */
     this.elms = null;
     this.objs = null;
     this.sections = null;
     
     this.wheel();
     this.resize();
     //this.statsInit();
     this.init();
   }
   
   init() {
     /** renderer settings */
     this.renderer.setSize(window.innerWidth, window.innerHeight);
     this.renderer.setPixelRatio(window.devicePixelRatio);
     this.renderer.setClearColor('black');
     
     /** camera setting */
     this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 10);
     this.camera.aspect = window.innerWidth / window.innerHeight;
     this.camera.position.z = 2;
     
     /** scene */
     this.scene = new THREE.Scene();
     
     /** when use orbit controls */
    //  this.controls = new OrbitControls(this.camera, this.renderer.domElement);
     
     /** parameters */
     this.time = 0;
     this.speed = 0;
     this.position = 0;
     this.rounded = 0;
     this.preRounded = this.rounded;
     
     this.elms = document.querySelectorAll('.area');
     this.objs = Array(this.elms.length).fill({dist: 0});
     this.sections = document.querySelectorAll('section');
     
     /** for handleImages */
     this.images = document.querySelectorAll('img');
     console.log(this.images)
     this.materials = new Array();
     this.meshes = new Array();
     this.groups = new Array();

     
     
     /** for navEventSetup */
     this.hover = 0;
     this.rots = null;
     this.navs = document.querySelectorAll('li');
     this.nav = document.querySelector('.nav');
     this.attractMode = false;
     this.attractTo = 0;
     
     /** start programs */
     this.addMesh();
     this.handleImages();
     this.navEventSetup();
     this.render();
   }
   
   handleImages() {
     this.images.forEach((im, i) => {
       const mat = this.material.clone();
       const group = new THREE.Group();
       
       this.materials.push(mat);
       //mat.wireframe = true;
       mat.uniforms.texture1.value = new THREE.Texture(im);
       mat.uniforms.texture1.value.needsUpdate = true;
       
       const geo = new THREE.PlaneBufferGeometry(1.2, 0.8, 100, 100);
       const mesh = new THREE.Mesh(geo, mat);
       
       group.add(mesh);
       this.groups.push(group);
       this.scene.add(group);
       this.meshes.push(mesh);
       
       mesh.position.x = i * Math.cos(1.2);
       mesh.position.y = i * 0;
       group.rotation.x = -0.3;
       group.rotation.y = -0.3;
       group.rotation.z = -0.1;
     });
   }
   
   statsInit() {
     this.stats = new Stats();
     this.stats.setMode(0);
     this.stats.domElement.style.position = 'absolute';
     this.stats.domElement.style.left = '0px';
     this.stats.domElement.style.top = '0px';
     document.getElementById('container').appendChild(this.stats.domElement);
   }
   
   navEventSetup() {
     this.rots = this.groups.map((e) => {
       return e.rotation;
     });
     
     this.nav.addEventListener('mouseenter', () => {
       this.attractMode = true;
       this.hover = 1;
       gsap.to(this.rots, {
         duration: 0.4,
         x: -0.3,
         y: 0,
         z: 0
       });
     });
     
     this.nav.addEventListener('mouseleave', () => {
       this.attractMode = false;
       this.hover = 0;
       gsap.to(this.rots, {
         duration: 0.4,
         x: -0.3,
         y: -0.3,
         z: -0.1,
       });
     });
     
     this.navs.forEach((el) => {
       el.addEventListener('mouseover', (e) => {
         this.attractTo = Number(e.target.getAttribute('data-nav'));
       });
     });
   }
   
   addMesh() {
     this.material = new THREE.ShaderMaterial({
       side: THREE.DoubleSide,
       transparent: true,
       uniforms: {
         time: {type: 'f', value: 0},
         texture1: {type: 't', value: null},
         hover: {type: 'i', value: 0},
         distanceFromCenter: {type: 'f', value: 0},
         resolution: {type: 'v4', value: new THREE.Vector4()},
         uvRatel: {
           value: new THREE.Vector2(1, 1)
         }
       },
       vertexShader: vertexShaderSource,
       fragmentShader: fragmentShaderSource
     });
   }
   
   render() {
     this.time++;
     
     /** wheel event*/
     this.position += this.speed;
     this.speed *= 0.7;
     this.rounded = Math.round(this.position);
     if (this.position < 0) {
       this.position = 0;
     }
     if (this.position > 4) {
       this.position = 4;
     }
     
     const diff = (this.rounded - this.position);
     
     if (this.attractMode) {
       this.position += -(this.position - this.attractTo) * 0.04;
     } else {
       this.position += Math.sign(diff) * Math.pow(Math.abs(diff), 0.9) * 0.01;
     }
     
     this.objs.forEach((o, i) => {
       o.dist = Math.min(Math.abs(this.position - i), 1);
       o.dist = 1 - o.dist ** 2;
       const scale = 1 + 0.1 * o.dist;
       this.meshes[i].position.x = i * 1.6 - this.position * 1.6;
    //    this.meshes[i].rotation.x = i * .5 - this.position * .5;

       this.meshes[i].scale.set(scale, scale, scale);
       this.meshes[i].material.uniforms.distanceFromCenter.value = o.dist;
     });
     
     for (let i = 0; i < this.materials.length; i++) {
       this.materials[i].uniforms.time.value = this.time;
       this.materials[i].uniforms.hover.value = this.hover;
     }
     
     if (this.preRounded !== this.rounded) {
       this.changeSection();
       for (let i = 0; i < this.navs.length; i++) {
         this.navs[i].classList.remove('now');
        
       }
       this.navs[this.rounded].classList.add('now');
     }
     
     this.renderer.render(this.scene, this.camera);
     this.preRounded = this.rounded;
     
     this.animationId = window.requestAnimationFrame(this.render.bind(this));
   }
   
   resize() {
     window.addEventListener('resize', () => {
       window.cancelAnimationFrame(this.animationId);
       this.init();
     });
   }
   
   changeSection() {
     for (let i = 0; i < this.sections.length; i++) {
       this.sections[i].classList.remove('display');
      
     }
     this.sections[this.rounded].classList.add('display');
     
   }
   
   wheel() {
     window.addEventListener('wheel', (e) => {
       this.speed += e.deltaY * 0.0002;
     });
   }
 }
 
 class Observer {
   constructor() {
     /** dom */
     this.wrap = null;
     this.lists = null;
     this.ares = null;
     this.sections = null;
     
     /** observer */
     this.options = null;
     this.targetElements = null;
     this.observer = null;
     
     this.init();
   }
   
   init() {
     /** dom */
     this.wrap = document.querySelector('#wrap');
     this.lists = document.querySelectorAll('.nav li');
     this.areas = document.querySelectorAll('#wrap .area');
     this.sections = document.querySelectorAll('section');
     this.targetElements = document.querySelectorAll('div.area');
     
     /** observer */
     this.options = {
       root: document.querySelector('#wrap'),
       rootMargin: '0px',
       threshold: 0.8
     };
     this.observer = new IntersectionObserver(this.callback.bind(this), this.options);
     for (let i = 0; i < this.targetElements.length; i++) {
       this.observer.observe(this.targetElements[i]);
     }
     
     /** setup event */
     if (window.innerWidth < 500) {
       this.scroll();
     }
     this.resize();
   }
   
   callback(entries) {
     for (let i = 0; i < entries.length; i++) {
       if (entries[i].isIntersecting) {
         const index = entries[i].target.getAttribute('data-display');
         
         for (let i = 0; i < this.sections.length; i++) {
           this.sections[i].classList.remove('display');
           this.lists[i].classList.remove('now');
         }
         
         this.sections[index].classList.add('display');
         this.lists[index].classList.add('now');
       }
     }
   }
   
   scroll() {
     for (let i = 0; i < this.lists.length; i++) {
       this.lists[i].addEventListener('mouseenter', (e) => {
         e.preventDefault();
         this.wrap.scrollTo({
           top: this.areas[i].getBoundingClientRect().top + this.wrap.scrollTop,
           left: 0,
           behavior: 'smooth'
         });
       }, false);
     }
   }
   
   resize() {
     window.addEventListener('resize', () => {
       this.init();
     });
   }
 }
 
 window.addEventListener('load', () => {
   console.clear();
   
   /** loading animation */
   const loading = document.getElementById('loading');
   loading.classList.add('loaded');
   
   /** start program */
   new Observer();
   const sketch = new Sketch();
 });