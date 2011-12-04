// Run the webgl example in sample/index.html... but standalone.

load('dom.js');
log('Loading Three.js\n');
load("three.js/Three.js");
log('Loading sample.js\n');
load("three.js/sample/index.js");
log('Creating a canvas proxy.\n');
load("v8glcanvas.js");
log('Drawing the sphere!\n');
var r = draw_sphere(v8gl_canvas);

r[0].context.mainLoop(r[1]);
