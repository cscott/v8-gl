// Run the webgl example in webgl_performance.html ... but standalone.

load('dom.js');
load("v8glcanvas.js");

load("three.js/Three.js");

document.baseURI = 'three.js/webgl_performance.js';
load(document.baseURI);

v8gl_canvas.width=window.innerWidth=1024;
v8gl_canvas.height=window.innerHeight=768;
init(v8gl_canvas);
mouseX=500;
mouseY=100;

renderer.context.mainLoop(animate);
