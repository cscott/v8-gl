load('dom.js'); // initial dom-like context
load('v8glcanvas.js'); // our canvas emulation

load('Common/esShader.js');
load('Common/esShapes.js');
load('Common/esTransform.js');
load('Common/esUtil.js');

document.baseURI = 'Chapter_13/ParticleSystem/ParticleSystem.js';
load(document.baseURI);

esContext = main(v8gl_canvas);

if (_intervalFunc) { esContext.gl.mainLoop(_intervalFunc); }
