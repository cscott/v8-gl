// Run the webgl example in webgl_geometries.html ... but standalone.

load('dom.js');
load("v8glcanvas.js");

load("three.js/Three.js");

load('three.js/webgl_geometries.js');

init(v8gl_canvas);

renderer.context.mainLoop(animate);
