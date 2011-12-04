load('dom.js'); // initial dom-like context
load('v8glcanvas.js'); // our canvas emulation

load('Common/esShader.js');
load('Common/esShapes.js');
load('Common/esTransform.js');
load('Common/esUtil.js');

load('Chapter_9/TextureWrap/TextureWrap.js');

esContext = main(v8gl_canvas);

if (_intervalFunc) { esContext.gl.mainLoop(_intervalFunc); }
