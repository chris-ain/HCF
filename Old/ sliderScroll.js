/**
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule normalizeWheel
 * @typechecks
 */

 'use strict';

 /**
  * Copyright 2004-present Facebook. All Rights Reserved.
  *
  * @providesModule UserAgent_DEPRECATED
  */
 
 /**
  *  Provides entirely client-side User Agent and OS detection. You should prefer
  *  the non-deprecated UserAgent module when possible, which exposes our
  *  authoritative server-side PHP-based detection to the client.
  *
  *  Usage is straightforward:
  *
  *    if (UserAgent_DEPRECATED.ie()) {
  *      //  IE
  *    }
  *
  *  You can also do version checks:
  *
  *    if (UserAgent_DEPRECATED.ie() >= 7) {
  *      //  IE7 or better
  *    }
  *
  *  The browser functions will return NaN if the browser does not match, so
  *  you can also do version compares the other way:
  *
  *    if (UserAgent_DEPRECATED.ie() < 7) {
  *      //  IE6 or worse
  *    }
  *
  *  Note that the version is a float and may include a minor version number,
  *  so you should always use range operators to perform comparisons, not
  *  strict equality.
  *
  *  **Note:** You should **strongly** prefer capability detection to browser
  *  version detection where it's reasonable:
  *
  *    http://www.quirksmode.org/js/support.html
  *
  *  Further, we have a large number of mature wrapper functions and classes
  *  which abstract away many browser irregularities. Check the documentation,
  *  grep for things, or ask on javascript@lists.facebook.com before writing yet
  *  another copy of "event || window.event".
  *
  */
 
 var _populated = false;
 
 // Browsers
 var _ie, _firefox, _opera, _webkit, _chrome;
 
 // Actual IE browser for compatibility mode
 var _ie_real_version;
 
 // Platforms
 var _osx, _windows, _linux, _android;
 
 // Architectures
 var _win64;
 
 // Devices
 var _iphone, _ipad, _native;
 
 var _mobile;
 
 function _populate() {
   if (_populated) {
     return;
   }
 
   _populated = true;
 
   // To work around buggy JS libraries that can't handle multi-digit
   // version numbers, Opera 10's user agent string claims it's Opera
   // 9, then later includes a Version/X.Y field:
   //
   // Opera/9.80 (foo) Presto/2.2.15 Version/10.10
   var uas = navigator.userAgent;
   var agent = /(?:MSIE.(\d+\.\d+))|(?:(?:Firefox|GranParadiso|Iceweasel).(\d+\.\d+))|(?:Opera(?:.+Version.|.)(\d+\.\d+))|(?:AppleWebKit.(\d+(?:\.\d+)?))|(?:Trident\/\d+\.\d+.*rv:(\d+\.\d+))/.exec(uas);
   var os = /(Mac OS X)|(Windows)|(Linux)/.exec(uas);
 
   _iphone = /\b(iPhone|iP[ao]d)/.exec(uas);
   _ipad = /\b(iP[ao]d)/.exec(uas);
   _android = /Android/i.exec(uas);
   _native = /FBAN\/\w+;/i.exec(uas);
   _mobile = /Mobile/i.exec(uas);
 
   // Note that the IE team blog would have you believe you should be checking
   // for 'Win64; x64'.  But MSDN then reveals that you can actually be coming
   // from either x64 or ia64;  so ultimately, you should just check for Win64
   // as in indicator of whether you're in 64-bit IE.  32-bit IE on 64-bit
   // Windows will send 'WOW64' instead.
   _win64 = !!/Win64/.exec(uas);
 
   if (agent) {
     _ie = agent[1] ? parseFloat(agent[1]) :
     agent[5] ? parseFloat(agent[5]) : NaN;
     // IE compatibility mode
     if (_ie && document && document.documentMode) {
       _ie = document.documentMode;
     }
     // grab the "true" ie version from the trident token if available
     var trident = /(?:Trident\/(\d+.\d+))/.exec(uas);
     _ie_real_version = trident ? parseFloat(trident[1]) + 4 : _ie;
 
     _firefox = agent[2] ? parseFloat(agent[2]) : NaN;
     _opera = agent[3] ? parseFloat(agent[3]) : NaN;
     _webkit = agent[4] ? parseFloat(agent[4]) : NaN;
     if (_webkit) {
       // We do not add the regexp to the above test, because it will always
       // match 'safari' only since 'AppleWebKit' appears before 'Chrome' in
       // the userAgent string.
       agent = /(?:Chrome\/(\d+\.\d+))/.exec(uas);
       _chrome = agent && agent[1] ? parseFloat(agent[1]) : NaN;
     } else {
       _chrome = NaN;
     }
   } else {
     _ie = _firefox = _opera = _chrome = _webkit = NaN;
   }
 
   if (os) {
     if (os[1]) {
       // Detect OS X version.  If no version number matches, set _osx to true.
       // Version examples:  10, 10_6_1, 10.7
       // Parses version number as a float, taking only first two sets of
       // digits.  If only one set of digits is found, returns just the major
       // version number.
       var ver = /(?:Mac OS X (\d+(?:[._]\d+)?))/.exec(uas);
 
       _osx = ver ? parseFloat(ver[1].replace('_', '.')) : true;
     } else {
       _osx = false;
     }
     _windows = !!os[2];
     _linux = !!os[3];
   } else {
     _osx = _windows = _linux = false;
   }
 }
 
 var UserAgent_DEPRECATED = {
 
   /**
    *  Check if the UA is Internet Explorer.
    *
    *
    *  @return float|NaN Version number (if match) or NaN.
    */
   ie: function () {
     return _populate() || _ie;
   },
 
   /**
    * Check if we're in Internet Explorer compatibility mode.
    *
    * @return bool true if in compatibility mode, false if
    * not compatibility mode or not ie
    */
   ieCompatibilityMode: function () {
     return _populate() || _ie_real_version > _ie;
   },
 
 
   /**
    * Whether the browser is 64-bit IE.  Really, this is kind of weak sauce;  we
    * only need this because Skype can't handle 64-bit IE yet.  We need to remove
    * this when we don't need it -- tracked by #601957.
    */
   ie64: function () {
     return UserAgent_DEPRECATED.ie() && _win64;
   },
 
   /**
    *  Check if the UA is Firefox.
    *
    *
    *  @return float|NaN Version number (if match) or NaN.
    */
   firefox: function () {
     return _populate() || _firefox;
   },
 
 
   /**
    *  Check if the UA is Opera.
    *
    *
    *  @return float|NaN Version number (if match) or NaN.
    */
   opera: function () {
     return _populate() || _opera;
   },
 
 
   /**
    *  Check if the UA is WebKit.
    *
    *
    *  @return float|NaN Version number (if match) or NaN.
    */
   webkit: function () {
     return _populate() || _webkit;
   },
 
   /**
    *  For Push
    *  WILL BE REMOVED VERY SOON. Use UserAgent_DEPRECATED.webkit
    */
   safari: function () {
     return UserAgent_DEPRECATED.webkit();
   },
 
   /**
    *  Check if the UA is a Chrome browser.
    *
    *
    *  @return float|NaN Version number (if match) or NaN.
    */
   chrome: function () {
     return _populate() || _chrome;
   },
 
 
   /**
    *  Check if the user is running Windows.
    *
    *  @return bool `true' if the user's OS is Windows.
    */
   windows: function () {
     return _populate() || _windows;
   },
 
 
   /**
    *  Check if the user is running Mac OS X.
    *
    *  @return float|bool   Returns a float if a version number is detected,
    *                       otherwise true/false.
    */
   osx: function () {
     return _populate() || _osx;
   },
 
   /**
    * Check if the user is running Linux.
    *
    * @return bool `true' if the user's OS is some flavor of Linux.
    */
   linux: function () {
     return _populate() || _linux;
   },
 
   /**
    * Check if the user is running on an iPhone or iPod platform.
    *
    * @return bool `true' if the user is running some flavor of the
    *    iPhone OS.
    */
   iphone: function () {
     return _populate() || _iphone;
   },
 
   mobile: function () {
     return _populate() || _iphone || _ipad || _android || _mobile;
   },
 
   nativeApp: function () {
     // webviews inside of the native apps
     return _populate() || _native;
   },
 
   android: function () {
     return _populate() || _android;
   },
 
   ipad: function () {
     return _populate() || _ipad;
   } };
 
 
 
 /**
  * Copyright 2013-2015, Facebook, Inc.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree. An additional grant
  * of patent rights can be found in the PATENTS file in the same directory.
  *
  * @providesModule isEventSupported
  */
 
 'use strict';
 
 /**
  * Copyright (c) 2015, Facebook, Inc.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree. An additional grant
  * of patent rights can be found in the PATENTS file in the same directory.
  *
  * @providesModule ExecutionEnvironment
  */
 
 /*jslint evil: true */
 
 'use strict';
 
 var canUseDOM = !!(
 typeof window !== 'undefined' &&
 window.document &&
 window.document.createElement);
 
 
 /**
  * Simple, lightweight module assisting with the detection and context of
  * Worker. Helps avoid circular dependencies and allows code to reason about
  * whether or not they are in a Worker, even if they never include the main
  * `ReactWorker` dependency.
  */
 var ExecutionEnvironment = {
 
   canUseDOM: canUseDOM,
 
   canUseWorkers: typeof Worker !== 'undefined',
 
   canUseEventListeners:
   canUseDOM && !!(window.addEventListener || window.attachEvent),
 
   canUseViewport: canUseDOM && !!window.screen,
 
   isInWorker: !canUseDOM // For now, this is true - might change in the future.
 };
 
 
 
 
 var useHasFeature;
 if (ExecutionEnvironment.canUseDOM) {
   useHasFeature =
   document.implementation &&
   document.implementation.hasFeature &&
   // always returns true in newer browsers as per the standard.
   // @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
   document.implementation.hasFeature('', '') !== true;
 }
 
 /**
  * Checks if an event is supported in the current execution environment.
  *
  * NOTE: This will not work correctly for non-generic events such as `change`,
  * `reset`, `load`, `error`, and `select`.
  *
  * Borrows from Modernizr.
  *
  * @param {string} eventNameSuffix Event name, e.g. "click".
  * @param {?boolean} capture Check if the capture phase is supported.
  * @return {boolean} True if the event is supported.
  * @internal
  * @license Modernizr 3.0.0pre (Custom Build) | MIT
  */
 function isEventSupported(eventNameSuffix, capture) {
   if (!ExecutionEnvironment.canUseDOM ||
   capture && !('addEventListener' in document)) {
     return false;
   }
 
   var eventName = 'on' + eventNameSuffix;
   var isSupported = (eventName in document);
 
   if (!isSupported) {
     var element = document.createElement('div');
     element.setAttribute(eventName, 'return;');
     isSupported = typeof element[eventName] === 'function';
   }
 
   if (!isSupported && useHasFeature && eventNameSuffix === 'wheel') {
     // This is the only way to test support for the `wheel` event in IE9+.
     isSupported = document.implementation.hasFeature('Events.wheel', '3.0');
   }
 
   return isSupported;
 }
 
 
 
 // Reasonable defaults
 var PIXEL_STEP = 10;
 var LINE_HEIGHT = 40;
 var PAGE_HEIGHT = 800;
 
 /**
  * Mouse wheel (and 2-finger trackpad) support on the web sucks.  It is
  * complicated, thus this doc is long and (hopefully) detailed enough to answer
  * your questions.
  *
  * If you need to react to the mouse wheel in a predictable way, this code is
  * like your bestest friend. * hugs *
  *
  * As of today, there are 4 DOM event types you can listen to:
  *
  *   'wheel'                -- Chrome(31+), FF(17+), IE(9+)
  *   'mousewheel'           -- Chrome, IE(6+), Opera, Safari
  *   'MozMousePixelScroll'  -- FF(3.5 only!) (2010-2013) -- don't bother!
  *   'DOMMouseScroll'       -- FF(0.9.7+) since 2003
  *
  * So what to do?  The is the best:
  *
  *   normalizeWheel.getEventType();
  *
  * In your event callback, use this code to get sane interpretation of the
  * deltas.  This code will return an object with properties:
  *
  *   spinX   -- normalized spin speed (use for zoom) - x plane
  *   spinY   -- " - y plane
  *   pixelX  -- normalized distance (to pixels) - x plane
  *   pixelY  -- " - y plane
  *
  * Wheel values are provided by the browser assuming you are using the wheel to
  * scroll a web page by a number of lines or pixels (or pages).  Values can vary
  * significantly on different platforms and browsers, forgetting that you can
  * scroll at different speeds.  Some devices (like trackpads) emit more events
  * at smaller increments with fine granularity, and some emit massive jumps with
  * linear speed or acceleration.
  *
  * This code does its best to normalize the deltas for you:
  *
  *   - spin is trying to normalize how far the wheel was spun (or trackpad
  *     dragged).  This is super useful for zoom support where you want to
  *     throw away the chunky scroll steps on the PC and make those equal to
  *     the slow and smooth tiny steps on the Mac. Key data: This code tries to
  *     resolve a single slow step on a wheel to 1.
  *
  *   - pixel is normalizing the desired scroll delta in pixel units.  You'll
  *     get the crazy differences between browsers, but at least it'll be in
  *     pixels!
  *
  *   - positive value indicates scrolling DOWN/RIGHT, negative UP/LEFT.  This
  *     should translate to positive value zooming IN, negative zooming OUT.
  *     This matches the newer 'wheel' event.
  *
  * Why are there spinX, spinY (or pixels)?
  *
  *   - spinX is a 2-finger side drag on the trackpad, and a shift + wheel turn
  *     with a mouse.  It results in side-scrolling in the browser by default.
  *
  *   - spinY is what you expect -- it's the classic axis of a mouse wheel.
  *
  *   - I dropped spinZ/pixelZ.  It is supported by the DOM 3 'wheel' event and
  *     probably is by browsers in conjunction with fancy 3D controllers .. but
  *     you know.
  *
  * Implementation info:
  *
  * Examples of 'wheel' event if you scroll slowly (down) by one step with an
  * average mouse:
  *
  *   OS X + Chrome  (mouse)     -    4   pixel delta  (wheelDelta -120)
  *   OS X + Safari  (mouse)     -  N/A   pixel delta  (wheelDelta  -12)
  *   OS X + Firefox (mouse)     -    0.1 line  delta  (wheelDelta  N/A)
  *   Win8 + Chrome  (mouse)     -  100   pixel delta  (wheelDelta -120)
  *   Win8 + Firefox (mouse)     -    3   line  delta  (wheelDelta -120)
  *
  * On the trackpad:
  *
  *   OS X + Chrome  (trackpad)  -    2   pixel delta  (wheelDelta   -6)
  *   OS X + Firefox (trackpad)  -    1   pixel delta  (wheelDelta  N/A)
  *
  * On other/older browsers.. it's more complicated as there can be multiple and
  * also missing delta values.
  *
  * The 'wheel' event is more standard:
  *
  * http://www.w3.org/TR/DOM-Level-3-Events/#events-wheelevents
  *
  * The basics is that it includes a unit, deltaMode (pixels, lines, pages), and
  * deltaX, deltaY and deltaZ.  Some browsers provide other values to maintain
  * backward compatibility with older events.  Those other values help us
  * better normalize spin speed.  Example of what the browsers provide:
  *
  *                          | event.wheelDelta | event.detail
  *        ------------------+------------------+--------------
  *          Safari v5/OS X  |       -120       |       0
  *          Safari v5/Win7  |       -120       |       0
  *         Chrome v17/OS X  |       -120       |       0
  *         Chrome v17/Win7  |       -120       |       0
  *                IE9/Win7  |       -120       |   undefined
  *         Firefox v4/OS X  |     undefined    |       1
  *         Firefox v4/Win7  |     undefined    |       3
  *
  */
 function normalizeWheel( /*object*/event) /*object*/{
   var sX = 0,sY = 0, // spinX, spinY
   pX = 0,pY = 0; // pixelX, pixelY
 
   // Legacy
   if ('detail' in event) {sY = event.detail;}
   if ('wheelDelta' in event) {sY = -event.wheelDelta / 120;}
   if ('wheelDeltaY' in event) {sY = -event.wheelDeltaY / 120;}
   if ('wheelDeltaX' in event) {sX = -event.wheelDeltaX / 120;}
 
   // side scrolling on FF with DOMMouseScroll
   if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
     sX = sY;
     sY = 0;
   }
 
   pX = sX * PIXEL_STEP;
   pY = sY * PIXEL_STEP;
 
   if ('deltaY' in event) {pY = event.deltaY;}
   if ('deltaX' in event) {pX = event.deltaX;}
 
   if ((pX || pY) && event.deltaMode) {
     if (event.deltaMode == 1) {// delta in LINE units
       pX *= LINE_HEIGHT;
       pY *= LINE_HEIGHT;
     } else {// delta in PAGE units
       pX *= PAGE_HEIGHT;
       pY *= PAGE_HEIGHT;
     }
   }
 
   // Fall-back if spin cannot be determined
   if (pX && !sX) {sX = pX < 1 ? -1 : 1;}
   if (pY && !sY) {sY = pY < 1 ? -1 : 1;}
 
   return { spinX: sX,
     spinY: sY,
     pixelX: pX,
     pixelY: pY };
 }
 
 
 /**
  * The best combination if you prefer spinX + spinY normalization.  It favors
  * the older DOMMouseScroll for Firefox, as FF does not include wheelDelta with
  * 'wheel' event, making spin speed determination impossible.
  */
 normalizeWheel.getEventType = function () /*string*/{
   return UserAgent_DEPRECATED.firefox() ?
   'DOMMouseScroll' :
   isEventSupported('wheel') ?
   'wheel' :
   'mousewheel';
 };
 
 
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
       titles: document.querySelectorAll('.js-title'),
       lines: document.querySelectorAll('.js-progress-line') };
 
 
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
       down: store.isDevice ? 'touchstart' : 'mousedown',
       wheel: 'wheel',
       mousewheel: 'mousewheel' };
 
 
     this.init();
   }
 
   bindAll() {
     ['onDown', 'onMove', 'onUp', 'onWheel'].
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
     const { move, up, down, wheel, mousewheel } = this.events;
 
     window.addEventListener(down, this.onDown);
     window.addEventListener(move, this.onMove);
     window.addEventListener(up, this.onUp);
 
     window.addEventListener(wheel, this.onWheel);
     window.addEventListener(mousewheel, this.onWheel);
   }
 
   off() {
     const { move, up, down, wheel, mousewheel } = this.events;
 
     window.removeEventListener(down, this.onDown);
     window.removeEventListener(move, this.onMove);
     window.removeEventListener(up, this.onUp);
 
     window.addEventListener(wheel, this.onWheel);
     window.addEventListener(mousewheel, this.onWheel);
   }
 
   setup() {
     const { ww } = store;
     const state = this.state;
     const { items, titles } = this.ui;
 
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
 
 
     fromTo('.js-progress-line-2', {
       scaleX: 1 },
     {
       scaleX: 0,
       duration: 0.5,
       ease: 'power3' },
     0).
     fromTo('.js-titles', {
       yPercent: 0 },
     {
       yPercent: -(100 - 100 / titles.length) },
     0).
     fromTo('.js-progress-line', {
       scaleX: 0 },
     {
       scaleX: 1 },
     0);
 
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
     state.progress = gsap.utils.wrap(0, 1, state.currentRounded / state.max);
 
     this.tl && this.tl.progress(state.progress);
   }
 
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
     const start = left + translate;
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
   }
 
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
     // console.log(e);
     const normalized = normalizeWheel(e);
     const scrollDelta = normalized.pixelY * 0.2;
     // console.log(scrollDelta);
 
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
 
   }}
 
 
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
   vec4 texture = texture2D(uTexture, texScale);
 
   texScale.x += 0.15 * uVelo;
   if(uv.x < 1.) texture.g = texture2D(uTexture, texScale).g;
 
   texScale.x += 0.10 * uVelo;
   if(uv.x < 1.) texture.b = texture2D(uTexture, texScale).b;
 
   gl_FragColor = texture;
 }
 `;
 
 const loader = new THREE.TextureLoader();
 loader.crossOrigin = 'anonymous';
 
 class Gl {
 
   constructor() {
     this.scene = new THREE.Scene();
 
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
     const domEl = this.renderer.domElement;
     domEl.classList.add('dom-gl');
     document.body.appendChild(domEl);
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
       y: top + height / 2 - store.wh / 2 };
 
 
     this.position.y = this.pos.y;
     this.position.x = this.pos.x;
 
     this.updateX();
   }
 
   updateX(current) {
     current && (this.position.x = current + this.pos.x);
   }}
 
 
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
 
 gsap.ticker.add(tick);