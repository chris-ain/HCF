let planes;
let curtainsP;


function projfunc (smoothScroll) {
    let useNativeScroll;
    let scrollEffect = 0;
    let canvasclick;
    var planesDeformations = 0
	let d = document;


    function lerp(start, end, amt) {
        return (1 - amt) * start + amt * end * 0.5;
      }

    curtainsP = new Curtains({
        container: document.getElementById("canvas"),
        watchScroll: false,
        pixelRatio: Math.min(1.5, window.devicePixelRatio), 
        autoRender: false, 
    });


  curtainsP.onRender(() => {
    if(useNativeScroll) {
       
        planesDeformations = lerp(planesDeformations, 0, 0.00);
        scrollEffect = lerp(scrollEffect, 5, 0.0);
    }
}).onScroll(() => {
    const delta = curtainsP.getScrollDeltas();

    delta.x = -delta.x;

    if(delta.x > 60) {
        delta.x = 60;
    }
    else if(delta.x < -60) {
        delta.x = -60;
    }
    if(Math.abs(delta.x) > Math.abs(planesDeformations)) {
        planesDeformations = lerp(planesDeformations, delta.x, 0.5);
    }
  
    if(Math.abs(delta.x) > Math.abs(scrollEffect)) {
        scrollEffect = lerp(scrollEffect, delta.x, 0.5);
    }

}).onError(() => {
    document.body.classList.add("no-curtains", "planes-loaded");
        plane.remove();
  
}).onContextLost(() => {
    curtainsP.restoreContext();
});

function updateScroll(xOffset, yOffset) {
    curtainsP.updateScrollValues(xOffset, yOffset);
}

if(!useNativeScroll) {
    curtainsP.disableDrawing();
    smoothScroll.on('scroll', (obj) => {
        updateScroll(obj.scroll.x, obj.scroll.y);

        curtainsP.needRender();
    });
}

    ///// SMOOTH SCROLL END////

    
    const mouse = new Vec2();
    const lastMouse = mouse.clone();
    const velocity = new Vec2();

    gsap.ticker.add(curtainsP.render.bind(curtainsP));

    planes = [];


    var planeElements = document.getElementsByClassName("plane");

    const vs = `
        precision mediump float;
        attribute vec3 aVertexPosition;
        attribute vec2 aTextureCoord;
        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform mat4 planeTextureMatrix;
        varying vec3 vVertexPosition;
        varying vec2 vTextureCoord;    
        uniform vec2 uMousePosition;
        uniform float uTime;
        uniform float uTransition;
        uniform float uPlaneDeformation;

        void main() {
            vec3 vertexPosition = aVertexPosition;
            
            // convert uTransition from [0,1] to [0,1,0]
            float transition = 1.0 - abs((uTransition * 2.0) - 1.0);
            
            //vertexPosition.x *= (1 + transition * 2.25);
            
            // get the distance between our vertex and the mouse position
            float distanceFromMouse = distance(uMousePosition, vec2(vertexPosition.x, vertexPosition.y));

            // calculate our wave effect
            float waveSinusoid = cos(5.0 * (distanceFromMouse - (uTime / 30.0)));

            // attenuate the effect based on mouse distance
            float distanceStrength = (0.4 / (distanceFromMouse + 0.4));

            // calculate our distortion effect
            float distortionEffect = distanceStrength * waveSinusoid * 0.33;

            // apply it to our vertex position
            vertexPosition.z +=  distortionEffect * -transition;
            vertexPosition.x +=  (distortionEffect * transition * (uMousePosition.x - vertexPosition.x));


    vertexPosition.x += sin(((vertexPosition.x * vertexPosition.y + 1.0) / 2.0) * 3.141592) * (sin(uPlaneDeformation / 1000.0))/1.8;
    vertexPosition.x += sin(((vertexPosition.y * vertexPosition.x + 5.0) / 2.0) * 3.141592) * (sin(uPlaneDeformation / 1000.0))/1.3;



            gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);

            // varyings
            vVertexPosition = vertexPosition;
            vTextureCoord = (planeTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
        }
    `;

    const fs = `
        precision highp float;

        varying vec3 vVertexPosition;
        varying vec2 vTextureCoord;

        uniform sampler2D planeTexture;

        void main( void ) {
            // apply our texture
            vec4 finalColor = texture2D(planeTexture, vTextureCoord);
            
            // fake shadows based on vertex position along Z axis
            finalColor.rgb += clamp(vVertexPosition.z, -1.0, 0.0) * 0.75;
            // fake lights based on vertex position along Z axis
            finalColor.rgb += clamp(vVertexPosition.z, 0.0, 1.0) * 0.75;
        
            // just display our texture
            gl_FragColor = finalColor;
        }
    `;

    const params = {
        sampler: "uTexture",
        vertexShader: vs,
        fragmentShader: fs,
        shareProgram: true, 
        widthSegments: 20,
        heightSegments: 20,
        autoloadSources: true,
        uniforms: {
            planeDeformation: {
                name: "uPlaneDeformation",
                type: "1f",
                value: 0,
            },
            time: {
                name: "uTime",
                type: "1f",
                value: 0,
            },
            fullscreenTransition: {
                name: "uTransition",
                type: "1f",
                value: 0,
            },
            mousePosition: {
                name: "uMousePosition",
                type: "2f",
                value: mouse,
            }
        }
    };

    for(let i = 0; i < planeElements.length; i++) {
        const plane = new Plane(curtainsP, planeElements[i], params);
        plane.onError(() => {
            plane.remove();
        });
        planes.push(plane);

        handlePlanes(i);
    }
    function handlePlanes(index) {
        const plane = planes[index];
       
        plane.onReady(() => {
            plane.textures[0].setScale(new Vec2(1, 1));

            if(index === planes.length - 1) {
                document.body.classList.add("planes-loaded");
            }

            plane.htmlElement.addEventListener("click", (e) => {
  

                onPlaneClick(e, plane,);
                gsap.to(".smooth-scroll", {
                    opacity: 0,
                    duration: 1.65,
                    ease: "power4.inOut"
                });

            });

        }).onAfterResize(() => {
            if(plane.userData.isFullscreen) {
                const planeBoundingRect = plane.getBoundingRect();
                const curtainBoundingRect = curtainsP.getBoundingRect();

                plane.setScale(new Vec2(
                    curtainBoundingRect.width / planeBoundingRect.width,
                    curtainBoundingRect.height / planeBoundingRect.height
                ));

                plane.setRelativeTranslation(new Vec3(
                    -1 * planeBoundingRect.left / curtainsP.pixelRatio,
                    -1 * planeBoundingRect.top / curtainsP.pixelRatio,
                    0
                ));
            }

          
        }).onRender(() => {
            plane.uniforms.time.value++;
            plane.uniforms.planeDeformation.value = planesDeformations;
            plane.setRenderTarget(rgbTarget);
        });


        
        plane.onError(() => {
            plane.remove();
        });
    }


    /*** POST PROCESSING ***/

    var rgbFs = `
    precision mediump float;

    varying vec3 vVertexPosition;
    varying vec2 vTextureCoord;
  
    uniform sampler2D uRenderTexture;
  
    uniform float uScrollEffect;
  
    void main() {
        vec2 textureCoords = vTextureCoord;
  
        vec2 redTextCoords = vec2(vTextureCoord.xy  + uScrollEffect / 795.0);
        vec2 greenTextCoords = vec2(vTextureCoord.xy + uScrollEffect / 6950.0);
        vec2 blueTextCoords = vec2(vTextureCoord.xy+ uScrollEffect / 6950.0);
  
        vec4 red = texture2D(uRenderTexture, redTextCoords);
        vec4 green = texture2D(uRenderTexture, greenTextCoords);
        vec4 blue = texture2D(uRenderTexture, blueTextCoords);
  
        vec4 finalColor = vec4(red.r, green.g, blue.b, min(1.0, red.a * blue.a * green.a));
        gl_FragColor = finalColor;
    }
`;

    var rgbTarget = new RenderTarget(curtainsP);

    var rgbPass = new ShaderPass(curtainsP, {
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
    
}


function destroyPlaneP() {

  }
export { curtainsP, projfunc, destroyPlaneP };
