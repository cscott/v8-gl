// Run the webgl example in webgl_geometries.html ... but standalone.

load('dom.js');
load("v8glcanvas.js");

load("three.js/Three.js");

document.baseURI = 'three.js/webgl_geometries.js';
load(document.baseURI);

v8gl_canvas.width=window.innerWidth=1024;
v8gl_canvas.height=window.innerHeight=768;
init(v8gl_canvas);

renderer.context.mainLoop(animate);
