import { chessScene, id} from "./chess.js";
import { curtains, curtainsmain } from "./curtainsmain.js";
import { curtainsTrans,curtainsTransFunc } from "./curtainsTrans.js";
import { curtainsAg, curtainsgenturfunc } from "./curtainsagentur.js";
import { curtainsProjDet,curtainsDet} from "./curtainsdet.js";
import { curtainsP, projfunc} from './projekte.js'
import { trans } from "./menu.js";
import { menuItems } from './menuItems.js';
import { curtainsMainTransFunc, curtainsMainTrans } from './curtainsMainTrans.js'


window.addEventListener("load", function(event) {


//MAIN//

  function init() {
    gsap.registerPlugin(ScrollTrigger);
    gsap.set(".page_wrap",{ autoAlpha: 0, opacity:0  });
    const navW = document.querySelector(".navwrapper");
    const select = (e) => document.querySelector(e);
    const loader = select(".js-loader");
    const loaderInner = select(".js-loader__inner");
    const loaderMask = select(".js-loader__mask");
    let smoothScroll;

    menuItems();

////////BARBA INIT////////////////////

    gsap.set(loader, { autoAlpha: 1 });

    gsap.set(loaderInner, { scaleY: 0.005, transformOrigin: "bottom" });

    initPageTransitions();

    function pageTransitionIn({ container }) {
      const tl = gsap.timeline({
        defaults: {
          duration: 1,
        },
      });
      tl.set(loaderInner, { autoAlpha: 0 })
        .fromTo(loader, { yPercent: -100 }, { yPercent: 0 })
        .fromTo(loaderMask, { yPercent: 80 }, { yPercent: 0 }, 0)

      return tl;
    }

    function pageTransitionOut({ container }) {
      const tl = gsap.timeline({
        defaults: {
          duration: 1,
        },
        onComplete: () => initScript(),
      });
      
      tl.to(loader, { yPercent: 100 }).to(loaderMask, { yPercent: -80 }, 0);
    
      return tl;
    }

    function initPageTransitions() {
      barba.hooks.before(() => {

        select("html").classList.add("is-transitioning");
        
      });

      barba.hooks.after(() => {

        select("html").classList.remove("is-transitioning");
        smoothScroll.init();
        
      });

      // scroll to the top of the page
      barba.hooks.enter(() => {
        window.scrollTo(0, 0);
      });

   /////////// VIEWS /////////////////////////

      barba.init({
        views: [
        
   /////////// HOME /////////////////////////
          {
            namespace: "home",

            beforeEnter() {
              trans.in();
              setTimeout(function () {
                if (trans.animating) {
                  return
                } else {
                  trans.in();
                }           
              },300)
            },

            afterEnter() { 
              $('#page_content').imagesLoaded( {
                // options...
                },
                function() {
                  curtainsmain(smoothScroll);
                  curtainsMainTransFunc(smoothScroll)
                  chessScene();
                  gsap.to(".page_wrap",{ autoAlpha: 1, opacity:1, duration: 0, delay:1.7 });
                }
              );   

              document.querySelectorAll('.plane_main_trans').forEach(item => {
                item.addEventListener('click', event => {
                smoothScroll.stop();
                smoothScroll.destroy();

                gsap.to("#fullscreen", {
                  opacity:0,
                  duration:0,
                })})
              })

              gsap.to(".line_1", {
                xPercent: -10,
                ease: 'none',
                scrollTrigger: { 
                  trigger: "#sticky_logo_section",
                  start: "top top",
                  scroller: ".smooth-scroll",
                  end:"bottom bottom",
                  endtrigger:".footer",
                  scrub: 1 
                }
              });
              gsap.to(".line2", {
                xPercent: 10,
                ease: 'none',
                scrollTrigger: { 
                  trigger: "#sticky_logo_section",
                  start: "top top",
                  scroller: ".smooth-scroll",
                  end:"bottom bottom",
                  endtrigger:".footer",
                  scrub: 1 
                }
              });
              gsap.to(".line3", {
                xPercent: -10,
                ease: 'none',
                scrollTrigger: { 
                trigger: "#sticky_logo_section",
                start: "top top",
                scroller: ".smooth-scroll",
                end:"bottom bottom",
                endtrigger:".footer",
                scrub: 1 
                }
              });

            },

            beforeLeave(data) {
              cancelAnimationFrame( id );
              curtains.clear()
              curtains.dispose() 
              setTimeout(function () {
              curtainsMainTrans.clear()
              curtainsMainTrans.dispose()
              },2000);
            },
          },

  /////////// AGENTUR /////////////////////////
          
            {
            namespace: "agentur",
            beforeEnter() {
              setTimeout(function () {
                if (trans.animating) {
                  return
                } else {
                  trans.in();
                }           
              },200)
            },

            afterEnter() {
              $('#page_content').imagesLoaded( {
                },
                function() {
                   curtainsgenturfunc(smoothScroll);
                    gsap.to(".page_wrap",{ autoAlpha: 1, duration: 1, delay:1.3 });
                }
              );
       
            },

            beforeLeave(data) {
              setTimeout(function () {
                curtainsAg.clear()
                curtainsAg.dispose()
              },1000);

            },
          },
     
  /////////// PROJEKTDETAIL /////////////////////////
          {
            namespace: "projektdetail",
            beforeEnter() {
              setTimeout(function () {
                if (trans.animating) {
                  return
                } else {
                  trans.in();
                }           
              },200)
            },

            afterEnter() {
              gsap.set(".pro_in", {
                opacity:0,
                duration:.3
              
              })

              $('#images').imagesLoaded()
              .always( function( instance ) {
                console.log('all images loaded');
              })
              .done( function( instance ) {

                  setTimeout(function () {
                      curtainsTransFunc(smoothScroll)
                  curtainsProjDet(smoothScroll);  
                    trans.in();	
                    },300);

                   const projTL = gsap.timeline()
                    projTL.to(".img_fullscreen", {
                      delay: 0.8,
                      opacity: 0.5,
                      duration: 1,
                    });

                    projTL.to(".pro_in", {
                      opacity:1,
                      stagger:.2
                  
                    })


                    gsap.to(".page_wrap",{ autoAlpha: 1, duration: 1, delay:.5 });
                    document.querySelectorAll('.next_proj').forEach(item => {
                      item.addEventListener('click', event => {
                        smoothScroll.stop();
                      smoothScroll.destroy();
                      gsap.to("#fullscreen", {
                        opacity:0,
                        duration:0,
                      })})
                    })
                    document.querySelectorAll('.menubutton').forEach(item => {
                      item.addEventListener('click', event => {
                        smoothScroll.stop();
                      smoothScroll.destroy();
                      gsap.to("#fullscreen", {
                        opacity:1,
                        duration:0,
                      })})
                    })
                    // const nexProjButton = document.querySelector('.next_proj')
                    // nexProjButton.addEventListener('click',() => {
                    //   smoothScroll.stop();
                    //   smoothScroll.destroy();
                    //   gsap.to("#fullscreen", {
                    //     opacity:0,
                    //     duration:0,
                    //   })
                    // })

                    const brandbutton = document.querySelector('#brand')
                    brandbutton.addEventListener('click',() => {
                     
                      gsap.to("#fullscreen", {
                        opacity:1,
                        duration:0,
                      })
                    })               })
              .fail( function() {
                console.log('all images loaded, at least one is broken');
              })
              .progress( function( instance, image ) {
                var result = image.isLoaded ? 'loaded' : 'broken';
                console.log( 'image is ' + result + ' for ' + image.img.src );
              });

            },

            beforeLeave(data) {
              // smoothScroll.stop();

              setTimeout(function () {    

                curtainsDet.clear()
                curtainsDet.dispose()
                curtainsTrans.clear()
                curtainsTrans.dispose()
   

              },2000);
            },
          },

  /////////// Jobs /////////////////////////
        {
          namespace: "jobs",
          beforeEnter() {
            trans.in();
            setTimeout(function () {
                trans.out();          
            },200) 
          },

          afterEnter() {  
              gsap.to(".page_wrap",{ autoAlpha: 1, duration: 1, delay:.5 });
          },

          beforeLeave(data) {
         
          },
        },

  /////////// Kontakt /////////////////////////
           {
            namespace: "kontakt",
            beforeEnter() {
              trans.out();
              setTimeout(function () {
                  trans.in();          
              },200)
            },

            afterEnter() {
              gsap.to(".page_wrap",{ opacity: 1, autoAlpha: 1, duration: 1, delay:.5 });
            },
  
            beforeLeave(data) {
        
            },
          },
  /////////// Logofolio /////////////////////////
           {
            namespace: "logofolio",
            beforeEnter() {
              trans.in();
              setTimeout(function () {
                  trans.out();          
              },200)
            },

            afterEnter() {
              $(document).ready(function () {

                setTimeout(function () {
                  trans.in();	
                  },2000);
                gsap.to(".page_wrap",{ autoAlpha: 1, duration: 1, delay:.5 });
              });
            },
  
            beforeLeave(data) {         
            },
          },
  /////////// Sachverständiger /////////////////////
           {
            namespace: "sachverständiger",
            beforeEnter() {
              setTimeout(function () {
                if (trans.animating) {
                  return
                } else {
                  trans.in();
                }           
              },200)
            },
            
            afterEnter() {
              $(document).ready(function () {
                setTimeout(function () {
                  trans.in();	
                  },2000);
                  curtainsmain(smoothScroll);

                gsap.to(".page_wrap",{ autoAlpha: 1, duration: 1, delay:.5 });
              });
  
            },
  
            beforeLeave(data) {
              curtainsmain.clear()
              curtainsmain.destroy()
            },
          },

   /////////// ProjHorizontal /////////////////////////
            {
              namespace: "proj",
              beforeEnter() {
                setTimeout(function () {
                  if (trans.animating) {
                    return
                  } else {
                    trans.in();
                  }           
                },200)
  
              },
              afterEnter() {
                $(document).ready(function () {
                  setTimeout(function () {
                    trans.in();	
                    },2000);

                    projfunc(smoothScroll);
                    document.querySelectorAll('.plane').forEach(item => {
                      item.addEventListener('click', event => {
                        trans.out()                      })
                    })
                   
                    //  smoothScroll.stop()
                    //  smoothScroll.destroy()

                  gsap.to(".page_wrap",{ autoAlpha: 1, duration: 1, delay:.5 });
 
                });
              },
    
              beforeLeave(data) {
                setTimeout(function () {
                  curtainsP.clear();
                  curtainsP.dispose();
                  },2500);
           
              },
            },
      
  /////////// Jobs /////////////////////////
              {
                namespace: "jobs",
                beforeEnter() {
                  setTimeout(function () {
                    if (trans.animating) {
                      return
                    } else {
                      trans.in();
                    }           
                  },200)
    
                },
                afterEnter() {
                  $(document).ready(function () {
                    setTimeout(function () {
                      trans.in();	
                      },2000);
  
                      projfunc(smoothScroll);
                      const PlaneButton = document.querySelector('#page-content')
                      PlaneButton.addEventListener('click',() => {
                      //  smoothScroll.stop()
                      //  smoothScroll.destroy()
  
                      })
                    gsap.to(".page_wrap",{ autoAlpha: 1, duration: 1, delay:.5 });
  
                   
                  });
      
                },
      
                beforeLeave(data) {
                  setTimeout(function () {
                    curtainsP.clear();
                    curtainsP.dispose();
                    },2000);
             
                },
              },

  /////////// Impressum /////////////////////////
                {
                  namespace: "impressum",
                  beforeEnter() {
                    setTimeout(function () {
                      if (trans.animating) {
                        return
                      } else {
                        trans.in();
                      }           
                    },200)
      
                  },
                  afterEnter() {
                    $(document).ready(function () {
                      setTimeout(function () {
                        trans.in();	
                        },2000);
    
    
                     
                    });
                    gsap.to(".page_wrap",{ autoAlpha: 1, duration: 1, delay:.5 });

                  },
        
                  beforeLeave(data) {
                    setTimeout(function () {
                      curtainsP.clear();
                      curtainsP.dispose();
                      },2000);
                  },
                },

  /////////// Datenschutz /////////////////////////

                {
                  namespace: "datenschutz",
                  beforeEnter() {
                    setTimeout(function () {
                      if (trans.animating) {
                        return
                      } else {
                        trans.in();
                      }           
                    },200)

                  },
                  afterEnter() {
                    $(document).ready(function () {
                      setTimeout(function () {
                        trans.in();	
                        },2000);


                    
                    });
                    gsap.to(".page_wrap",{ autoAlpha: 1, duration: 1, delay:.5 });

                  },

                  beforeLeave(data) {
                    setTimeout(function () {
                      curtainsP.clear();
                      curtainsP.dispose();
                      },2000);
              
                  },
                },

/////////// Projetke Mobile /////////////////////////

                {
                  namespace: "projekte_mob",
                  beforeEnter() {
                    setTimeout(function () {
                      if (trans.animating) {
                        return
                      } else {
                        trans.in();
                      }           
                    },200)

                  },
                  afterEnter() {
                    $(document).ready(function () {
                      setTimeout(function () {
                        trans.in();	
                        },2000);

                        curtainsMainTrans()
                    
                    });
                    gsap.to(".page_wrap",{ autoAlpha: 1, duration: 1, delay:.5 });

                  },

                  beforeLeave(data) {
                    setTimeout(function () {
                      curtainsP.clear();
                      curtainsP.dispose();
                      },);
              
                  },
                },
  ],

      
  /////////// TRANSITIONS /////////////////////////

        sync: true,
        debug: true,
        timeout: 7000,
        transitions: [
          {
            name: "overlay-transition",
            once(data) {
              // do something once on the initial page load
              initSmoothScroll(data.next.container);
              navW.classList.add('pointernone')
                  setTimeout(function () {
                trans.out();
              },200)
              setTimeout(function () {
                trans.in();	
                },1700);
              initLoader();
  
            },
            async leave(data) {  
              await delay(2000);
              data.current.container.remove();
            },
            async enter(data) {   
            },
            
            async beforeEnter(data) {
              ScrollTrigger.getAll().forEach((t) => t.kill());
              smoothScroll.destroy();

              initSmoothScroll(data.next.container);
              Webflow.destroy();
              Webflow.ready();
              Webflow.require("ix2").init();
            },
          },
        ],
      });
    }

    function lerp(start, end, amt) {
      return (1 - amt) * start + amt * end * 0.5;
    }

    function initSmoothScroll(container) {

      let options = {
        el: document.querySelector('#page-content'),
        smooth: true,
        getSpeed: true,
        getDirection: true,
        inertia: .5,
        multiplier: 1.5,
        mobile: {
          breakpoint: 0,
          smooth: true,
        },
        tablet: {
          breakpoint: 0,
          smooth: true,
        },
    }
  
    if(document.querySelector('#page-content').getAttribute('data-horizontal') == 'true') {

        options.direction = 'horizontal';
        options.gestureDirection = 'both';
        options.tablet = {
            smooth: true,
            direction: 'horizontal',
            horizontalGesture: true
        }
   
        options.reloadOnContextChange = true
    }

      smoothScroll = new LocomotiveScroll(options);

smoothScroll.on("scroll", ScrollTrigger.update);

ScrollTrigger.scrollerProxy(".smooth-scroll", {
  scrollTop(value) {
    return arguments.length ? smoothScroll.scrollTo(value, 0, 0) : smoothScroll.scroll.instance.scroll.y;
  }, 
  getBoundingClientRect() {
    return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
  }
});
const scrollbar = selectAll(".c-scrollbar");
if (scrollbar.length > 1) {
  scrollbar[0].remove();
}

            gsap.set(".scroll_indicator_line", {xPercent:-100,} )
            gsap.to(".scroll_indicator_line", {
              xPercent: 0,
              ease: 'none',
              scrollTrigger: { 
                trigger: ".main",
                start: "top top",
                scroller: ".smooth-scroll",
                end:"bottom bottom",
                endTrigger: ".footer_scroll",
                scrub: 0.3 
              }
            });

ScrollTrigger.addEventListener("refresh", () => smoothScroll.update());
ScrollTrigger.refresh();
    }
    //////BARBA LOADER///////

    function initLoader() {

      const tlLoaderIn = gsap.timeline({
        id: "tlLoaderIn",
        
        defaults: {
          duration: 1.1,
          delay:.2,
          ease: "power2.out",
          
        },
       
        onComplete: () => initScript(),
        
      });


      tlLoaderIn

        .to(loaderInner, {
          scaleY: 1,
          transformOrigin: "bottom",
          ease: "power1.inOut",
        });

      const tlLoaderOut = gsap.timeline({
        id: "tlLoaderOut",
        defaults: {
          delay: .2,
          duration: .2,
          ease: "power2.inOut",
        },
      });

      tlLoaderOut.to(loader, { yPercent: -100 }, 0.2);

      const tlLoader = gsap.timeline();
      tlLoader.add(tlLoaderIn).add(tlLoaderOut);
    }

    function delay(n) {
      n = n || 2000;
      return new Promise((done) => {
        setTimeout(() => {
          done();
        }, n);
      });
    }

    function initScript() {
      select("body").classList.remove("is-loading");
    }
  }
  barba.use(barbaPrefetch);

  init();

  });




