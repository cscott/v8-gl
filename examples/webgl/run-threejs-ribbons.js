// Run the webgl example in webgl_ribbons.html ... but standalone.

load('dom.js');
load("v8glcanvas.js");

load("three.js/Three.js");

load("three.js/js/ShaderExtras.js");
load("three.js/js/postprocessing/EffectComposer.js");
load("three.js/js/postprocessing/MaskPass.js");
load("three.js/js/postprocessing/RenderPass.js");
load("three.js/js/postprocessing/ShaderPass.js");
load("three.js/js/postprocessing/BloomPass.js");

document.baseURI = 'three.js/webgl_ribbons.js';
load(document.baseURI);

v8gl_canvas.width=window.innerWidth=1024;
v8gl_canvas.height=window.innerHeight=768;
init(v8gl_canvas);

var startTime = new Date().getTime();
function myAnimate() {
    var elapsed = new Date().getTime() - startTime;
    mouseX = 500*Math.sin(elapsed/1000);
    mouseY = 500*Math.cos(elapsed/1000);
    animate();
}

renderer.context.mainLoop(animate);
