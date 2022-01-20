var curtainsMainTrans;
let planesTrans;
let planes;

function curtainsMainTransFunc(smoothScroll){

   let useNativeScroll;
    let scrollEffect = 0;
    let canvasclick;
    var planesDeformations = 0
	let d = document;


    function lerp(start, end, amt) {
        return (1 - amt) * start + amt * end * 0.5;
      }

    curtainsMainTrans = new Curtains({
        container: document.getElementById("canvas_main_trans"),
        watchScroll: false,
        pixelRatio: Math.min(1.5, window.devicePixelRatio), 
        autoRender: false, 
    });


  curtainsMainTrans.onRender(() => {
    if(useNativeScroll) {

        planesDeformations = lerp(planesDeformations, 0, 0.00);
        scrollEffect = lerp(scrollEffect, 5, 0.0);
    }
}).onScroll(() => {
    const delta = curtainsMainTrans.getScrollDeltas();

    delta.y = -delta.y;

    if(delta.y > 60) {
        delta.y = 60;
    }
    else if(delta.y < -60) {
        delta.y = -60;
    }
    if(Math.abs(delta.y) > Math.abs(planesDeformations)) {
        planesDeformations = lerp(planesDeformations, delta.y, 0.5);
    }
  
    if(Math.abs(delta.y) > Math.abs(scrollEffect)) {
        scrollEffect = lerp(scrollEffect, delta.y, 0.5);
    }

    }).onError(() => {
        document.body.classList.add("no-curtains", "planes-loaded");
            plane.remove();
    
    }).onContextLost(() => {
        curtainsMainTrans.restoreContext();
    });

    function updateScroll(xOffset, yOffset) {
        curtainsMainTrans.updateScrollValues(xOffset, yOffset);
    }

    if(!useNativeScroll) {
        curtainsMainTrans.disableDrawing();
        smoothScroll.on('scroll', (obj) => {
            updateScroll(obj.scroll.x, obj.scroll.y);

            curtainsMainTrans.needRender();
            
        });
    }

    ///// SMOOTH SCROLL END////

    
    const mouse = new Vec2();
    const lastMouse = mouse.clone();
    const velocity = new Vec2();

    gsap.ticker.add(curtainsMainTrans.render.bind(curtainsMainTrans ));

    planes = [];

    var planeElements = document.getElementsByClassName("plane_main_trans");

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


            vertexPosition.y += sin(((vertexPosition.y * vertexPosition.x + 1.0) / 2.0) * 3.141592) * (sin(uPlaneDeformation / 100.0))/1.3;



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
        const plane = new Plane(curtainsMainTrans, planeElements[i], params);
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
            // if plane is displayed fullscreen, update its scale and translations
            if(plane.userData.isFullscreen) {
                const planeBoundingRect = plane.getBoundingRect();
                const curtainBoundingRect = curtainsMainTrans.getBoundingRect();

                plane.setScale(new Vec2(
                    curtainBoundingRect.width / planeBoundingRect.width,
                    curtainBoundingRect.height / planeBoundingRect.height
                ));

                plane.setRelativeTranslation(new Vec3(
                    -1 * planeBoundingRect.left / curtainsMainTrans.pixelRatio,
                    -1 * planeBoundingRect.top / curtainsMainTrans.pixelRatio,
                    0
                ));
            }

          
        }).onRender(() => {
            plane.uniforms.time.value++;
            plane.uniforms.planeDeformation.value = planesDeformations;
           
        });

        plane.onError(() => {
            plane.remove();
        });
    }



    /*** GALLERY ***/
 

    const galleryState = {
        fullscreenThumb: false,
        closeButtonEl: document.getElementById("close-button"), 
     
        openTween: null, 
        closeTween: null, 
    };

    galleryState.closeButtonEl.addEventListener("click", () => {
        const fullScreenPlane = curtainsMainTrans.planes.find(plane => plane.userData.isFullscreen);

    
        if(fullScreenPlane && galleryState.fullscreenThumb) {

            galleryState.fullscreenThumb = false;
            document.body.classList.remove("is-fullscreen");

            fullScreenPlane.userData.isFullscreen = false;

            galleryState.closeButtonEl.style.display = "none";

            fullScreenPlane.uniforms.mousePosition.value.set(0, 0);

            fullScreenPlane.uniforms.time.value = 0;

            const allOtherPlanes = curtainsMainTrans.planes.filter(el => el.uuid !== fullScreenPlane.uuid && el.type !== "PingPongPlane");
            allOtherPlanes.forEach(el => {
                el.visible = true;
            });

            let animation = {
                scaleX: fullScreenPlane.scale.x,
                scaleY: fullScreenPlane.scale.y,
                translationX: fullScreenPlane.relativeTranslation.x,
                translationY: fullScreenPlane.relativeTranslation.y,
                transition: 1,
                textureScale: 1,
            };

            const newScale = new Vec2();
            const newTranslation = new Vec3();

            // kill tween
            if(galleryState.closeTween) {
                galleryState.closeTween.kill();
            }

            galleryState.closeTween = gsap.to(animation, 2, {
                scaleX: 1,
                scaleY: 1,
                translationX: 0,
                translationY: 0,
                transition: 0,
                textureScale: 1,
                ease: Power3.easeInOut,
                onUpdate: function() {
                    // plane scale
                    newScale.set(animation.scaleX, animation.scaleY);
                    fullScreenPlane.setScale(newScale);

                    // plane translation
                    newTranslation.set(animation.translationX, animation.translationY, 0);
                    fullScreenPlane.setRelativeTranslation(newTranslation);

                    // texture scale
                    newScale.set(animation.textureScale, animation.textureScale);
                    fullScreenPlane.textures[0].setScale(newScale);

                    // transition
                    fullScreenPlane.uniforms.fullscreenTransition.value = animation.transition;

                },
                onComplete: function() {
                    // reset the plane renderOrder to 0 (we could have ommit the parameter)
                    fullScreenPlane.setRenderOrder(0);

                    // clear tween
                    galleryState.closeTween = null;
                }
            });
        }
    });

    function onPlaneClick(event, plane) {
        canvasclick = document.getElementById("canvas_proj"); 
   
        if(!galleryState.fullscreenThumb) {
            galleryState.fullscreenThumb = true;
            document.body.classList.add("is-fullscreen");
    
            plane.userData.isFullscreen = true;

            plane.setRenderOrder(1);
            const startMousePostion = plane.mouseToPlaneCoords(mouse);
            plane.uniforms.mousePosition.value.copy(startMousePostion);
            plane.uniforms.time.value = 0;
           

            const planeBoundingRect = plane.getBoundingRect();
            const curtainBoundingRect = curtainsMainTrans.getBoundingRect();

            // starting values
            let animation = {
                scaleX: 1,
                scaleY: 1,
                translationX: 0,
                translationY: 0,
                transition: 0,
                textureScale: 1,
                mouseX: startMousePostion.x,
                mouseY: startMousePostion.y,
            
            };

            const newScale = new Vec2();
            const newTranslation = new Vec3();

            if(galleryState.openTween) {
                galleryState.openTween.kill();
            }
          
            galleryState.openTween = gsap.to(animation, 2, {
                scaleX: curtainBoundingRect.width / planeBoundingRect.width,
                scaleY: curtainBoundingRect.height / planeBoundingRect.height,
                translationX: -1 * planeBoundingRect.left / curtainsMainTrans.pixelRatio,
                translationY: -1 * planeBoundingRect.top / curtainsMainTrans.pixelRatio,
                transition: 1,
                textureScale: 1,
                mouseX: 0,
                mouseY: 0,
                ease: Power3.easeInOut,
                
                
                onUpdate: function() {
                    // plane scale
                    newScale.set(animation.scaleX, animation.scaleY);
                    plane.setScale(newScale);

                    // plane translation
                    newTranslation.set(animation.translationX, animation.translationY, 0);
                    plane.setRelativeTranslation(newTranslation);

                    // texture scale
                    newScale.set(animation.textureScale, animation.textureScale);
                    plane.textures[0].setScale(newScale);

                    // transition value
                    plane.uniforms.fullscreenTransition.value = animation.transition;

                  

                    // tween mouse position back to center
                    plane.uniforms.mousePosition.value.set(animation.mouseX, animation.mouseY);
                },
                onComplete: function() {
                    // do not draw all other planes since animation is complete and they are hidden
                    const nonClickedPlanes = curtainsMainTrans.planes.filter(el => el.uuid !== plane.uuid && el.type !== "PingPongPlane");

                    nonClickedPlanes.forEach(el => {
                        el.visible = false;
                    });

                    // display close button
                    galleryState.closeButtonEl.style.display = "inline-block";

                    // clear tween
                    galleryState.openTween = null;
                    
                }
            });
            plane.setTransformOrigin(newTranslation);
            
        }
    }

    /*** POST PROCESSING ***/
    // we'll be adding a flowmap rgb shift effect and fxaapass

    // mouse/touch move
    function onMouseMove(e) {
        // velocity is our mouse position minus our mouse last position
        lastMouse.copy(mouse);

        // touch event
        if(e.targetTouches) {
            mouse.set(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
        }
        // mouse event
        else {
            mouse.set(e.clientX, e.clientY);
        }

        // divided by a frame duration (roughly)
        velocity.set((mouse.x - lastMouse.x) / 16, (mouse.y - lastMouse.y) / 16);

        // we should update the velocity
        updateVelocity = true;
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onMouseMove, {
        passive: true
    });

    // if we should update the velocity or not
    let updateVelocity = false;


    // creating our PingPongPlane flowmap plane
    // flowmap shaders
    const flowmapVs = `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif
    
        // default mandatory variables
        attribute vec3 aVertexPosition;
        attribute vec2 aTextureCoord;
    
        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
    
        // custom variables
        varying vec3 vVertexPosition;
        varying vec2 vTextureCoord;
    
        void main() {
            vec3 vertexPosition = aVertexPosition;
    
            gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
    
            // varyings
            vTextureCoord = aTextureCoord;
            vVertexPosition = vertexPosition;
        }
    `;

    const flowmapFs = `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif
    
        varying vec3 vVertexPosition;
        varying vec2 vTextureCoord;
    
        uniform sampler2D uFlowMap;
    
        uniform vec2 uMousePosition;
        uniform float uFalloff;
        uniform float uAlpha;
        uniform float uDissipation;
    
        uniform vec2 uVelocity;
        uniform float uAspect;
    
        void main() {
            vec2 textCoords = vTextureCoord;    
    
            vec4 color = texture2D(uFlowMap, textCoords) * uDissipation;
            //vec4 color = vec4(0.0, 0.0, 0.0, 1.0) * uDissipation;
    
            vec2 mouseTexPos = (uMousePosition + 1.0) * 0.5;
            vec2 cursor = vTextureCoord - mouseTexPos;
            cursor.x *= uAspect;
    
            vec3 stamp = vec3(uVelocity * vec2(1.0, -1.0), 1.0 - pow(1.0 - min(1.0, length(uVelocity)), 3.0));
            float falloff = smoothstep(uFalloff, 0.0, length(cursor)) * uAlpha;
            color.rgb = mix(color.rgb, stamp, vec3(falloff));
    
            gl_FragColor = color;
        }
    `;


    const bbox = curtainsMainTrans.getBoundingRect();

    // note the use of half float texture and the custom sampler name used in our fragment shader
    const flowMapParams = {
        sampler: "uFlowMap",
        vertexShader: flowmapVs,
        fragmentShader: flowmapFs,
        watchScroll: false, // position is fixed
        texturesOptions: {
            floatingPoint: "half-float" // use half float texture when possible
        },
        uniforms: {
            mousePosition: {
                name: "uMousePosition",
                type: "2f",
                value: mouse,
            },
            // size of the cursor
            fallOff: {
                name: "uFalloff",
                type: "1f",
                value: bbox.width > bbox.height ? bbox.width / 15000 : bbox.height / 15000,
            },
            // alpha of the cursor
            alpha: {
                name: "uAlpha",
                type: "1f",
                value: 1,
            },
            // how much the cursor must dissipate over time (ie trail length)
            // closer to 1 = no dissipation
            dissipation: {
                name: "uDissipation",
                type: "1f",
                value: 0.975,
            },
            // our velocity
            velocity: {
                name: "uVelocity",
                type: "2f",
                value: velocity,
            },
            // window aspect ratio to draw a circle
            aspect: {
                name: "uAspect",
                type: "1f",
                value: bbox.width / bbox.height,
            },
        },
    };



    // our ping pong plane
    const flowMap = new PingPongPlane(curtainsMainTrans, curtainsMainTrans.container, flowMapParams);

    flowMap.onRender(() => {
        // update mouse position
        flowMap.uniforms.mousePosition.value = flowMap.mouseToPlaneCoords(mouse);

        // update velocity
        if(!updateVelocity) {
            velocity.set(curtainsMainTrans.lerp(velocity.x, 0, 0.5), curtainsMainTrans.lerp(velocity.y, 0, .5));
        }
        updateVelocity = false;

        flowMap.uniforms.velocity.value = new Vec2(curtainsMainTrans.lerp(velocity.x, 0, 0.1), curtainsMainTrans.lerp(velocity.y, 0, 0.1));
    }).onAfterResize(() => {
        // update our window aspect ratio uniform
        const boundingRect = flowMap.getBoundingRect();
        flowMap.uniforms.aspect.value = boundingRect.width / boundingRect.height;
        flowMap.uniforms.fallOff.value = boundingRect.width > boundingRect.height ? boundingRect.width / 15000 : boundingRect.height / 15000;
    });



    // now use the texture of our ping pong plane in the plane that will actually be displayed
    // displacement shaders
    const displacementVs = `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif
    
        // default mandatory variables
        attribute vec3 aVertexPosition;
        attribute vec2 aTextureCoord;
    
        // custom variables
        varying vec3 vVertexPosition;
        varying vec2 vTextureCoord;
    
        void main() {
    
            gl_Position = vec4(aVertexPosition, 1.0);

          // set the varyings
          vTextureCoord = aTextureCoord;
          vVertexPosition = aVertexPosition;
        }
    `;

    const displacementFs = `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif
    
        // get our varyings
        varying vec3 vVertexPosition;
        varying vec2 vTextureCoord;

        // our render texture
        uniform sampler2D uRenderTexture;
        uniform sampler2D uFlowTexture;
    
        void main() {
            // our flowmap
            vec4 flowTexture = texture2D(uFlowTexture, vTextureCoord);
    
            // distort our image texture based on the flowmap values
            vec2 distortedCoords = vTextureCoord;
            distortedCoords -= flowTexture.xy * 0.00000000005;
    
            // get our final texture based on the displaced coords
            vec4 texture = texture2D(uRenderTexture, distortedCoords);
            
            vec4 rTexture = texture2D(uRenderTexture, distortedCoords + flowTexture.xy * 0.00125);
            vec4 gTexture = texture2D(uRenderTexture, distortedCoords- flowTexture.xy * 0.00125);
            vec4 bTexture = texture2D(uRenderTexture, distortedCoords - flowTexture.xy * 0.00125);
    
            // mix the BW image and the colored one based on our flowmap color values
            float mixValue = clamp((abs(flowTexture.r) + abs(flowTexture.g ) + abs(flowTexture.b)) * 1.0, 0.0, 1.0);

            texture = mix(texture, vec4(rTexture.r, gTexture.g, bTexture.b, texture.a), mixValue);
    
            gl_FragColor = texture;
        }
    `;

    const passParams = {
        vertexShader: displacementVs,
        fragmentShader: displacementFs,
        depth: false, // explicitly disable depth for the ripple effect to work
    };


    const shaderPass = new ShaderPass(curtainsMainTrans, passParams);

    // create a texture that will hold our flowmap
    const flowTexture = shaderPass.createTexture({
        sampler: "uFlowTexture",
        floatingPoint: "half-float",
        fromTexture: flowMap.getTexture() // set it based on our PingPongPlane flowmap plane's texture
    });

    // wait for our first pass and the flowmap to be ready
    flowTexture.onSourceUploaded(() => {
        const fxaaPass = new FXAAPass(curtainsMainTrans);
    });




    
}


function destroyPlaneTrans() {
    for (let i = 0; i < planesTrans.length; i++) {
      planesTrans[i].remove();   
    }
    planesTrans = [];
  }
  export { curtainsMainTrans, curtainsMainTransFunc,};