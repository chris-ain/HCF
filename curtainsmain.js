var curtains;

let pl;

function curtainsmain (smoothScroll) {
  $(document).ready(function () {

    function lerp(start, end, amt) {
        return (1 - amt) * start + amt * end * 0.5;
      }


// CURTAINS
    const planes = [];

    const planeElements = document.getElementsByClassName("plane");
    let scrollEffect = 0;
    var planesDeformations = 0;
    let useNativeScroll;


    curtains = new Curtains({
      container: document.getElementById("canvas"),
      watchScroll: true, 
      pixelRatio: Math.min(50, window.devicePixelRatio), 
      premultipliedAlpha: true,
    });

    curtains
      .onRender(() => {
        if (useNativeScroll) {
          planesDeformations = lerp(planesDeformations, 5, 0.075);
          scrollEffect = lerp(scrollEffect, 5, 0.075);
        }
      })
      .onScroll(() => {
        const delta = curtains.getScrollDeltas();

        delta.y = -delta.y;

        if (delta.y > 60) {
          delta.y = 60;
        } else if (delta.y < -60) {
          delta.y = -60;
        }
        if (Math.abs(delta.y) > Math.abs(planesDeformations)) {
          planesDeformations = lerp(planesDeformations, delta.y, 0.5);
        }

        if (Math.abs(delta.y) > Math.abs(scrollEffect)) {
          scrollEffect = lerp(scrollEffect, delta.y, 0.5);
        }
      })
      .onError(() => {
        document.body.classList.add("no-curtains", "planes-loaded");
      })
      .onContextLost(() => {
        curtains.restoreContext();
      });

    function updateScroll(xOffset, yOffset) {
      curtains.updateScrollValues(xOffset, yOffset);
    }

    if (!useNativeScroll) {
      curtains.disableDrawing();
      smoothScroll.on("scroll", (obj) => {
        updateScroll(obj.scroll.x, obj.scroll.y);

        curtains.needRender();
      });
    }

    const debugElement = document.getElementById("debug-value");
    let planeDrawn = planeElements.length;

    const vs = `
  precision mediump float;
  
  // default mandatory variables
  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoord;

  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;

  uniform mat4 planeTextureMatrix;

  // custom variables
  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;

  uniform float uPlaneDeformation;

  void main() {
      vec3 vertexPosition = aVertexPosition;

      // cool effect on scroll
      vertexPosition.y += sin(((vertexPosition.y * vertexPosition.x + 5.0) / 2.0) * 3.141592) * (sin(uPlaneDeformation / 100.0))/1.3;

      gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);

      // varyings
      vVertexPosition = vertexPosition;
      vTextureCoord = (planeTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
  }
`;

    const fs = `
  precision mediump float;
  
  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;

  uniform sampler2D planeTexture;

  void main() {
      // just display our texture
      gl_FragColor = texture2D(planeTexture, vTextureCoord);
  }
`;

    const params = {
      vertexShader: vs,
      fragmentShader: fs,
      shareProgram: true, 
      widthSegments: 10,
      heightSegments: 10,
      drawCheckMargins: {
        top: 100,
        right: 0,
        bottom: 100,
        left: 0,
      },
      uniforms: {
        planeDeformation: {
          name: "uPlaneDeformation",
          type: "1f",
          value: 0,
        },
      },
    };

    for (let i = 0; i < planeElements.length; i++) {
      const plane = new Plane(curtains, planeElements[i], params);
      planes.push(plane);
      handlePlanes(i);
    }

    function handlePlanes(index) {
      const plane = planes[index];
      pl = planes[index]
      plane &&
        plane
          .onLoading(function () {
          })
          .onReady(function () {
            plane.setRenderTarget(rgbTarget);
            if (index === planes.length - 1) {
              document.body.classList.add("planes-loaded");
            }
          })
          .onRender(function () {
              plane.uniforms.planeDeformation.value = planesDeformations;
              plane.textures[0].setScale(
              new Vec2(1 + Math.abs(scrollEffect) / 500)
            );
          });
    }

    var rgbFs = `
    precision mediump float;

    varying vec3 vVertexPosition;
    varying vec2 vTextureCoord;
  
    uniform sampler2D uRenderTexture;
  
    uniform float uScrollEffect;
  
    void main() {
        vec2 textureCoords = vTextureCoord;
  
        vec2 redTextCoords = vec2(vTextureCoord.x, vTextureCoord.y - uScrollEffect / 400.0);
        vec2 greenTextCoords = vec2(vTextureCoord.x, vTextureCoord.y - uScrollEffect / 3000.0);
        vec2 blueTextCoords = vec2(vTextureCoord.x, vTextureCoord.y - uScrollEffect / 3000.0);
  
        vec4 red = texture2D(uRenderTexture, redTextCoords);
        vec4 green = texture2D(uRenderTexture, greenTextCoords);
        vec4 blue = texture2D(uRenderTexture, blueTextCoords);
  
        vec4 finalColor = vec4(red.r, green.g, blue.b, min(1.0, red.a * blue.a * green.a));
        gl_FragColor = finalColor;
    }
`;

    var rgbTarget = new RenderTarget(curtains);

    var rgbPass = new ShaderPass(curtains, {
      fragmentShader: rgbFs,
      renderTarget: rgbTarget,
      depthTest: false, 
      uniforms: {
        scrollEffect: {
          name: "uScrollEffect",
          type: "1f",
          value: 0,
        },
      },
    });

    if (rgbPass) {
      rgbPass.onRender(function () {
        rgbPass.uniforms.scrollEffect.value = scrollEffect;
      });
    }
  });
    
}

function destroyPlane() {
  for (let i = 0; i < pl.length; i++) {
    pl[i].remove();   
  }
  pl = [];
}


export { curtains,pl, curtainsmain, destroyPlane };