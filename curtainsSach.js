var curtainsSach;

let pl;

function curtainsSachmain (smoothScroll) {
  $(document).ready(function () {

    function lerp(start, end, amt) {
        return (1 - amt) * start + amt * end * 0.5;
      }
// CURTAINSSach
    // we will keep track of all our planes in an array
    const planes = [];

    // get our planes elements
    const planeElements = document.getElementsByClassName("plane");
    let scrollEffect = 0;
    var planesDeformations = 0;
    let useNativeScroll;


    curtainsSach = new Curtains({
      container: document.getElementById("canvasSach"),
      watchScroll: true, // watch scroll on mobile not on desktop since we're using locomotive scroll
      pixelRatio: Math.min(50, window.devicePixelRatio), // limit pixel ratio for performance
      premultipliedAlpha: true,
    });

    


    curtainsSach
      .onRender(() => {
        if (useNativeScroll) {
          planesDeformations = lerp(planesDeformations, 5, 0.075);
          scrollEffect = lerp(scrollEffect, 5, 0.075);
        }
      })
      .onScroll(() => {
        // get scroll deltas to apply the effect on scroll
        const delta = curtainsSach.getScrollDeltas();

        // invert value for the effect
        delta.y = -delta.y;

        // threshold
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
        // we will add a class to the document body to display original images
        document.body.classList.add("no-curtainsSach", "planes-loaded");
      })
      .onContextLost(() => {
        // on context lost, try to restore the context
        curtainsSach.restoreContext();
      });

    function updateScroll(xOffset, yOffset) {
      // update our scroll manager values
      curtainsSach.updateScrollValues(xOffset, yOffset);
    }

    // custom scroll event
    if (!useNativeScroll) {
      curtainsSach.disableDrawing();
      smoothScroll.on("scroll", (obj) => {
        updateScroll(obj.scroll.x, obj.scroll.y);

        // render scene
        curtainsSach.needRender();
      });
    }

    // keep track of the number of plane we're currently drawing
    const debugElement = document.getElementById("debug-value");
    // we need to fill the counter with all our planes
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
      shareProgram: true, // share planes program to improve plane creation speed
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

    // add our planes and handle them
    for (let i = 0; i < planeElements.length; i++) {
      const plane = new Plane(curtainsSach, planeElements[i], params);
      planes.push(plane);
      handlePlanes(i);
    }

    // handle all the planes
    function handlePlanes(index) {
      const plane = planes[index];
      pl = planes[index]
      // check if our plane is defined and use it
      plane &&
        plane
          .onLoading(function () {
          })
          .onReady(function () {
            plane.setRenderTarget(rgbTarget);

            // once everything is ready, display everything
            if (index === planes.length - 1) {
              document.body.classList.add("planes-loaded");
            }
          })
          .onRender(function () {
            // update the uniform
            plane.uniforms.planeDeformation.value = planesDeformations;

            //plane.setScale(1, 1 + Math.abs(scrollEffect) / 500);
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

    var rgbTarget = new RenderTarget(curtainsSach);

    var rgbPass = new ShaderPass(curtainsSach, {
      fragmentShader: rgbFs,
      renderTarget: rgbTarget,
      depthTest: false, // we need to disable the depth test to display that shader pass on top of the first one
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
        // update the uniform
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


export { curtainsSach, curtainsSachmain };