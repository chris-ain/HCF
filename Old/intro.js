
// Event Listener

const reload_btn = document.querySelector('.navitem');

reload_btn.addEventListener('click', function () {
   let icon = document.querySelector('.icon path');
  
  icon.classList.remove('is-active');
  
  setTimeout(function () {
    icon.classList.add('is-active');
  }, 500);
});

const splitName = document.querySelectorAll(".h1_chars")
// const splitJL = new SplitText(".JL", {
// 	type: "chars"
// });







//Count Up

var Cont={val:0} , NewVal = 100 ;



// Intro Animation

document.addEventListener("DOMContentLoaded", function(){
gsap.set(".page_wrap", {opacity: 0})
gsap.set(".transition_back", {opacity: 0});
gsap.set (".progress_bar", {scaleX:0});
gsap.set (".h1_chars_full", {opacity:0});


gsap.to (".progress_bar", {scaleX:1, duration: 4, delay: .6, ease:"power4.inOut"});

gsap.set (".chessCanvas", {opacity: 0,})

const tl = new gsap.timeline();

tl.to(".transition_back", {
    opacity:1, 
    delay: .3, 
    duration: .2,})

    tl.to(Cont,5,{val:NewVal, duration: 1,delay: 0,roundProps:"val",onUpdate:function(){
        document.getElementById("counter").innerHTML=Cont.val
      }});

tl.to(".transition_back", {
    opacity: 0,
	duration: 1.65,
	ease: "power4.inOut",
    delay: 0,
});

tl.to (".page_wrap", { opacity: 1, duration: .5})


tl.to(".transition", {
    opacity: 0,
    duration:.3
}, "-=1.3")

tl
	.set("h1", { scale: 1.4 })
	.from(splitName, {
		yPercent: gsap.utils.wrap([200, -80]),
		opacity: 0,
		stagger: 0.018,
		duration: 1.6,
		ease: "power4.inOut"
	})
	tl.to("h1", { scale: 1, duration: 0.95, ease: "power3.out" }, "-=0.75")
	tl.from(".hero", { opacity: 0, duration: 4, ease: "power2.out" }, "-=0.55");
  tl.to(".h1_chars_full", { opacity: 100, duration: .2, stagger: .01, ease: "power2.out" }, "-=0.55");

tl.to (".transition", {yPercent: 101, duration: 0})
tl.from (".chessCanvas", {opacity: 0, duration: .5})

tl.from (".heading_big_hero", {xPercent: -115, rotation:-45,duration: 2, ease:"power4.inOut", stagger: .1, }, "-=.4")});



