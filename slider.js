


export function slider1 (){
  var raf;
    var clientHeight = document.getElementById('clientHeight').clientHeight;
    const store = {
      ww: window.innerWidth,
      wh: window.innerHeight,
      isDevice: navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i) };
     const tit = document.querySelectorAll('.js-title');
    
    let canv; 
    class Slider {
    
      constructor(el, opts = {}) {
        this.bindAll();
        this.el = el;
    
    
        this.opts = Object.assign({
          speed: 2,
          threshold: 50,
          ease: 0.075 },
        opts);
    
        this.ui = {
          items: this.el.querySelectorAll('.js-slide'),

        };
    
    
        this.state = {
          target: 0,
          current: 0,
          currentRounded: 0,
          y: 0,
          on: {
            x: 0,
            y: 0 },
    
          off: 0,
          progress: 0,
          diff: 0,
          max: 0,
          min: 0,
          snap: {
            points: [] },
    
          flags: {
            dragging: false } };
    
    
    
        this.items = [];
    
        this.events = {
          move: store.isDevice ? 'touchmove' : 'mousemove',
          up: store.isDevice ? 'touchend' : 'mouseup',
          down: store.isDevice ? 'touchstart' : 'mousedown' };
    
    
        this.init();
      }
    
      bindAll() {
        ['onDown', 'onMove', 'onUp'].
        forEach(fn => this[fn] = this[fn].bind(this));
      }
    
      init() {
        return gsap.utils.pipe(
        this.setup(),
        this.on());
    
      }
    
      destroy() {
        this.off();
        this.state = null;
        this.items = null;
        this.opts = null;
        this.ui = null;
      }
    
      on() {
        const { move, up, down } = this.events;
    
        window.addEventListener(down, this.onDown);
        window.addEventListener(move, this.onMove);
        window.addEventListener(up, this.onUp);
      }
    
      off() {
        const { move, up, down } = this.events;
    
        window.removeEventListener(down, this.onDown);
        window.removeEventListener(move, this.onMove);
        window.removeEventListener(up, this.onUp);
      }
    
      setup(tit) {
        const { ww } = store;
        const state = this.state;
        const { items,   } = this.ui;
        const {
          width: wrapWidth,
          left: wrapDiff } =
        this.el.getBoundingClientRect();
        // Set bounding
        state.max = -(items[items.length - 1].getBoundingClientRect().right - wrapWidth - wrapDiff);
        state.min = 0;
    
        // Global timeline
        this.tl = gsap.timeline({
          paused: true,
          defaults: {
            duration: 1,
            ease: 'linear' } }).
    
    
        
        fromTo('.tit', {
          xPercent: 0 },
        {
          xPercent: -100 -(100/(items.length -1 ) +480 )},
        )
    
        // Cache stuff
        for (let i = 0; i < items.length; i++) {
          const el = items[i];
          const { left, right, width } = el.getBoundingClientRect();
    
          // Create webgl plane
          const plane = new Plane();
          plane.init(el);
    
          // Timeline that plays when visible
          const tl = gsap.timeline({ paused: true }).
          fromTo(plane.mat.uniforms.uScale, {
            value: 0.65 },
          {
            value: 1,
            duration: 1,
            ease: 'linear' });
    
    
          // Push to cache
          this.items.push({
            el, plane,
            left, right, width,
            min: left < ww ? ww * 0.775 : -(ww * 0.225 - wrapWidth * 0.2),
            max: left > ww ? state.max - ww * 0.775 : state.max + (ww * 0.225 - wrapWidth * 0.2),
            tl,
            out: false });
    
        }      
      }
    
      calc() {
        const state = this.state;
        state.current += (state.target - state.current) * this.opts.ease;
        state.currentRounded = Math.round(state.current * 100) / 100;
        state.diff = (state.target - state.current) * 0.0005;
        state.progress = gsap.utils.wrap(0, 1, state.currentRounded / state.max );
    
        this.tl && this.tl.progress(state.progress);
      };
   
      render() {
        this.calc();
        this.transformItems();
      }
    
      transformItems() {
        const { flags } = this.state;
    
        for (let i = 0; i < this.items.length; i++) {
          const item = this.items[i];
          const { translate, isVisible, progress } = this.isVisible(item);
          item.plane.updateX(translate);
          item.plane.mat.uniforms.uVelo.value = this.state.diff;
    
          if (!item.out && item.tl) {
            item.tl.progress(progress);
          }
    
          if (isVisible || flags.resize) {
            item.out = false;
          } else if (!item.out) {
            item.out = true;
          }
        }
      }
      
      isVisible({ left, right, width, min, max }) {
        const { ww } = store;
        const { currentRounded } = this.state;
        const translate = gsap.utils.wrap(min, max, currentRounded);
        const threshold = this.opts.threshold;
        const start = left  + translate;
        const end = right + translate;
        const isVisible = start < threshold + ww && end > -threshold;
        const progress = gsap.utils.clamp(0, 1, 1 - (translate + left + width) / (ww + width));
    
        return {
          translate,
          isVisible,
          progress };
    
      }
    
      clampTarget() {
        const state = this.state;
    
        state.target = gsap.utils.clamp(state.max, 0, state.target);
      };
 
      getPos({ changedTouches, clientX, clientY, target }) {
        const x = changedTouches ? changedTouches[0].clientX : clientX;
        const y = changedTouches ? changedTouches[0].clientY : clientY;
    
        return {
          x, y, target };
    
      }
    
      onDown(e) {
        const { x, y } = this.getPos(e);
        const { flags, on } = this.state;
    
        flags.dragging = true;
        on.x = x;
        on.y = y;
      }
    
      onUp() {
        const state = this.state;
    
        state.flags.dragging = false;
        state.off = state.target;
      }

      
    

      onWheel(e) {
        const normalized = normalizeWheel(e);
        const scrollDelta = normalized.pixelY * 0.2;
    
        const { x, y } = this.getPos(e);
        const state = this.state;
    
        state.flags.dragging = false;
        const { off, on } = state;
    
        // move
        state.target -= scrollDelta * this.opts.speed;
    
        // update on/off vals
        on.x = state.target;
        state.off = state.target;
      }

      onMove(e) {
        const { x, y } = this.getPos(e);
        const state = this.state;
    
        if (!state.flags.dragging) return;
    
        const { off, on } = state;
        const moveX = x - on.x;
        const moveY = y - on.y;
    
        if (Math.abs(moveX) > Math.abs(moveY) && e.cancelable) {
          e.preventDefault();
          e.stopPropagation();
        }
    
        state.target = off + moveX * this.opts.speed;
      }};


    
    
    /***/
    /*** GL STUFF ****/
    /***/
    
    const backgroundCoverUv = `
    vec2 backgroundCoverUv(vec2 screenSize, vec2 imageSize, vec2 uv) {
      float screenRatio = screenSize.x / screenSize.y;
      float imageRatio = imageSize.x / imageSize.y;
    
      vec2 newSize = screenRatio < imageRatio 
          ? vec2(imageSize.x * screenSize.y / imageSize.y, screenSize.y)
          : vec2(screenSize.x, imageSize.y * screenSize.x / imageSize.x);
    
      vec2 newOffset = (screenRatio < imageRatio 
          ? vec2((newSize.x - screenSize.x) / 2.0, 0.0) 
          : vec2(0.0, (newSize.y - screenSize.y) / 2.0)) / newSize;
    
      return uv * screenSize / newSize + newOffset;
    }
    `;
    
    const vertexShader = `
    precision mediump float;
    
    uniform float uVelo;
    
    varying vec2 vUv;
    
    #define M_PI 3.1415926535897932384626433832795
    
    void main(){
      vec3 pos = position;
      pos.x = pos.x + ((sin(uv.y * M_PI) * uVelo) * 0.125);
    
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.);
    }
    `;
    
    const fragmentShader = `
    precision mediump float;
    
    ${backgroundCoverUv}
    
    uniform sampler2D uTexture;
    
    uniform vec2 uMeshSize;
    uniform vec2 uImageSize;
    
    uniform float uVelo;
    uniform float uScale;
    
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
    
      vec2 texCenter = vec2(0.5);
      vec2 texUv = backgroundCoverUv(uMeshSize, uImageSize, uv);
      vec2 texScale = (texUv - texCenter) * uScale + texCenter;
      vec4 tex = texture2D(uTexture, texScale);
    
      texScale.x += 0.2 * uVelo;
      if(uv.y < 1.) tex.r = texture2D(uTexture, texScale).r;
    
      // texScale.x += 0.1 * uVelo;
      // if(uv.x < 1.) tex.g = texture2D(uTexture, texScale).g;
      // texScale.x += 0.1 * uVelo;
      // if(uv.y < 1.) tex.b = texture2D(uTexture, texScale).b;
    
      gl_FragColor = tex;
    }
    `;
  
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    
    class Gl {
    
      constructor() {
        this.scene = new THREE.Scene();
        this.canvasSlide = document.querySelector('.slider_canvas')
        this.camera = new THREE.OrthographicCamera(
        store.ww / -2,
        store.ww / 2,
        store.wh / 2,
        store.wh / -2,
        1,
        10);
    
        this.camera.lookAt(this.scene.position);
        this.camera.position.z = 1;
    
    
        this.renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true });
          
        this.renderer.setPixelRatio(1.5);
        this.renderer.setSize(store.ww, store.wh);
        this.renderer.setClearColor(0xffffff, 0);
    
        this.init();
      }
    
      render() {
        this.renderer.render(this.scene, this.camera);
      }
    
      init() {
        var container_Slide = document.getElementById("slider_canvas");
    
            var container_Slider = this.renderer.domElement;
    
          container_Slide.appendChild(container_Slider);
          container_Slider.classList.add('dom-gl');
    
      }}
    
    
    class GlObject extends THREE.Object3D {
    
      init(el) {
        this.el = el;
    
        this.resize();
      }
    
      resize() {
        this.rect = this.el.getBoundingClientRect();
        const { left, top, width, height } = this.rect;
    
        this.pos = {
          x: left + width / 2 - store.ww / 2,
          y: top + height / 2 - store.wh /2, };
    
        this.position.y = this.pos.y -clientHeight ;
        this.position.x = this.pos.x;
        this.updateX();

    
    
      }
    
      updateX(current) {
        current && (this.position.x = current + this.pos.x);
      }
   
    }
    
    
    const planeGeo = new THREE.PlaneBufferGeometry(1, 1, 32, 32);
    const planeMat = new THREE.ShaderMaterial({
      transparent: true,
      fragmentShader,
      vertexShader });
    
    
    class Plane extends GlObject {
    
      init(el) {
        super.init(el);
    
        this.geo = planeGeo;
        this.mat = planeMat.clone();
    
        this.mat.uniforms = {
          uTime: { value: 0 },
          uTexture: { value: 0 },
          uMeshSize: { value: new THREE.Vector2(this.rect.width, this.rect.height) },
          uImageSize: { value: new THREE.Vector2(0, 0) },
          uScale: { value: 0.75 },
          uVelo: { value: 0 } };
    
    
        this.img = this.el.querySelector('img');
        this.texture = loader.load(this.img.src, texture => {
          texture.minFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
    
          this.mat.uniforms.uTexture.value = texture;
          this.mat.uniforms.uImageSize.value = [this.img.naturalWidth, this.img.naturalHeight];
        });
    
        this.mesh = new THREE.Mesh(this.geo, this.mat);
        this.mesh.scale.set(this.rect.width, this.rect.height, 1);
        this.add(this.mesh);
        gl.scene.add(this);
      }}
    
    
    /***/
    /*** INIT STUFF ****/
    /***/
    
    const gl = new Gl();
    const slider = new Slider(document.querySelector('.js-slider'));
    
    const tick = () => {
      gl.render();
      slider.render();
    };
    raf = tick;
    gsap.ticker.add(tick);
}