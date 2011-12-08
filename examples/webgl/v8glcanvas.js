// WebGL implemented on top of v8gl's EGL bindings.

var v8gl_canvas = (function() {
    // read bindings definitions
    var glesbind = JSON.parse(read("../../glesbindings/glesbind.json"));
    var INITIAL_WIDTH = 320;
    var INITIAL_HEIGHT = 240;

    function WebGLContext(context, width, height) {
	context = context || {};
	this.alpha = true;
	this.depth = true;
	this.stencil = false;
	this.antialias = true;
	this.premultipliedAlpha = true;
	this.preserveDrawingBuffer = false;
	if ('alpha' in context) this.alpha = context.alpha;
	if ('depth' in context) this.depth = context.depth;
	if ('stencil' in context) this.stencil = context.stencil;
	if ('antialias' in context) this.antialias = context.antialias;
	if ('premultipliedAlpha' in context) this.premultipliedAlpha = context.premultipliedAlpha;
	if ('preserveDrawingBuffer' in context) this.preserveDrawingBuffer = context.preserveDrawingBuffer;
	this._es = Glesutil.initContext();
	var flags = this._es.WINDOW_RGB;
	if (this.alpha) flags |= this._es.WINDOW_ALPHA;
	if (this.depth) flags |= this._es.WINDOW_DEPTH;
	if (this.stencil) flags |= this._es.WINDOW_STENCIL;
	// hm: have to call createWindow before gl will talk to me!
	this._es.createWindow("Hello WebGL", width, height, flags);
    };
    function WebGLContextPrototype() { }
    WebGLContextPrototype.prototype = Gles;
    WebGLContext.prototype = new WebGLContextPrototype();
    // WebGL-specific enums
    WebGLContext.prototype.UNPACK_FLIP_Y_WEBGL            = 0x9240;
    WebGLContext.prototype.UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
    WebGLContext.prototype.CONTEXT_LOST_WEBGL             = 0x9242;
    WebGLContext.prototype.UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
    WebGLContext.prototype.BROWSER_DEFAULT_WEBGL          = 0x9244;

    // Hook for esUtil main loop
    WebGLContext.prototype.mainLoop = function(draw) {
	this._es.registerDrawFunc(draw);
	this._es.mainLoop();
    };
    // Wrap certain GLes methods
    WebGLContext.prototype.getParameter = function(id) {
	// XXX handle WebGL-specific parameters,
	//     like GL_UNPACK_COLORSPACE_CONVERSION_WEBGL
	var retval = Gles.getParameter(id);
	// error checking
	if (Gles.getError() != Gles.NO_ERROR)
	    throw new Error("Bad parameter value: "+id);
	// WebGL fixup
	if (id == this.VERSION) {
	    retval = "WebGL 1.0 "+retval;
	}
	if (id == this.SHADING_LANGUAGE_VERSION) {
	    retval = "WebGL GLSL ES 1.0 "+retval;
	}
	return retval;
    };

    // WebGLBuffers!
    function WebGLBuffer(id) {
	this._id = id;
    };
    WebGLContext.prototype.createBuffer = function() {
	// XXX note that these can leak! should tweak wrapper
	//     to use weak references so they are automatically freed.
	var buffers = Gles.genBuffers(1);
	return new WebGLBuffer(buffers[0]);
    };
    WebGLContext.prototype.deleteBuffer = function(buffer) {
	if (!this.isBuffer(buffer)) {
	    throw new Error("Not a WebGLBuffer!");
	}
	Gles.deleteBuffers(1, [buffer._id]);
    };
    WebGLContext.prototype.isBuffer = function(buffer) {
	return buffer instanceof WebGLBuffer;
    };
    WebGLContext.prototype.bindBuffer = function(target, buffer) {
	// overrides bindbuffer in Gles prototype
	if (!this.isBuffer(buffer)) {
	    throw new Error("Not a WebGLBuffer!");
	}
	Gles.bindBuffer(target, buffer._id);
    };
    WebGLContext.prototype.bufferData = function(target, data_or_size, usage) {
	if (typeof(data_or_size) != 'object' ||
	    !('length' in data_or_size)) {
	    throw new Error("integer size argument not supported yet");
	}
	Gles.bufferData(target, data_or_size, 0, usage);
    };
    WebGLContext.prototype.bufferSubData = function(target, offset, data) {
	throw new Error("unimplemented");
    };

    // WebGLShaders!
    function WebGLShader(id) {
	this._id = id;
    };
    WebGLContext.prototype.createShader = function(type) {
	// XXX may leak shader object
	return new WebGLShader(Gles.createShader(type));
    };
    WebGLContext.prototype.deleteShader = function(shader) {
	if (!this.isShader(shader)) { throw new Error("Not a WebGLShader!"); }
	Gles.deleteShader(shader._id);
    };
    WebGLContext.prototype.isShader = function(shader) {
	return shader instanceof WebGLShader &&
	    Gles.isShader(shader._id);
    };
    WebGLContext.prototype.compileShader = function(shader) {
	if (!this.isShader(shader)) { throw new Error("Not a WebGLShader!"); }
	return Gles.compileShader(shader._id);
    };
    WebGLContext.prototype.getShaderParameter = function(shader, pname) {
	if (!this.isShader(shader)) { throw new Error("Not a WebGLShader!"); }
	return Gles.getShaderiv(shader._id, pname);
    };
    WebGLContext.prototype.attachShader = function(program, shader) {
	if (!this.isProgram(program)) { throw new Error("Not a WebGLProgram!"); }
	if (!this.isShader(shader)) { throw new Error("Not a WebGLShader!"); }
	Gles.attachShader(program._id, shader._id);
    };
    WebGLContext.prototype.detachShader = function(program, shader) {
	if (!this.isProgram(program)) { throw new Error("Not a WebGLProgram!"); }
	if (!this.isShader(shader)) { throw new Error("Not a WebGLShader!"); }
	Gles.detachShader(program._id, shader._id);
    };
    WebGLContext.prototype.getAttachedShaders = function(program) {
	// if we make new wrappers for the shaders, they won't compare as equal
	// to the other wrappers for the same shader ids.  really we want an
	// array of shader wrappers, or some such?
	throw new Error("Unimplemented.");
    };
    WebGLContext.prototype.getShaderPrecisionFormat = function(shadertype,precisiontype) {
	throw new Error("Unimplemented.");
    };
    WebGLContext.prototype.getShaderInfoLog = function(shader) {
	return Gles.getShaderInfoLog(shader._id);
    };
    WebGLContext.prototype.getShaderSource = function(shader) {
	return Gles.getShaderSource(shader._id);
    };
    WebGLContext.prototype.shaderSource = function(shader, source) {
	Gles.shaderSource(shader._id, source);
    };

    // WebGLPrograms!
    function WebGLProgram(id) {
	this._id = id;
    };
    WebGLContext.prototype.createProgram = function() {
	// XXX may leak program object
	return new WebGLProgram(Gles.createProgram());
    };
    WebGLContext.prototype.deleteProgram = function(program) {
	if (!this.isProgram(program)) { throw new Error("Not a WebGLProgram!"); }
	Gles.deleteProgram(program._id);
    };
    WebGLContext.prototype.isProgram = function(program) {
	return program instanceof WebGLProgram &&
	    Gles.isProgram(program._id);
    };
    WebGLContext.prototype.linkProgram = function(program) {
	if (!this.isProgram(program)) { throw new Error("Not a WebGLProgram!"); }
	Gles.linkProgram(program._id);
    };
    WebGLContext.prototype.useProgram = function(program) {
	if (!this.isProgram(program)) { throw new Error("Not a WebGLProgram!"); }
	Gles.useProgram(program._id);
    };
    WebGLContext.prototype.validateProgram = function(program) {
	if (!this.isProgram(program)) { throw new Error("Not a WebGLProgram!"); }
	Gles.validateProgram(program._id);
    };
    WebGLContext.prototype.bindAttribLocation = function(program, index, name) {
	if (!this.isProgram(program)) { throw new Error("Not a WebGLProgram!"); }
	throw new Error("unimplemented");
    };
    WebGLContext.prototype.getProgramParameter = function(program, pname) {
	if (!this.isProgram(program)) { throw new Error("Not a WebGLProgram!"); }
	return Gles.getProgramiv(program._id, pname);
    };
    WebGLContext.prototype.getProgramInfoLog = function(program) {
	if (!this.isProgram(program)) { throw new Error("Not a WebGLProgram!"); }
	return Gles.getProgramInfoLog(program._id);
    };
    WebGLContext.prototype.getActiveAttrib = function(program, index) {
	if (!this.isProgram(program)) { throw new Error("Not a WebGLProgram!"); }
	throw new Error("should return a WebGLActiveInfo object");
	return Gles.getActiveAttrib(program._id, index);
    };
    WebGLContext.prototype.getActiveUniform = function(program, index) {
	if (!this.isProgram(program)) { throw new Error("Not a WebGLProgram!"); }
	throw new Error("should return a WebGLActiveInfo object");
	return Gles.getActiveUniform(program._id, index);
    };
    WebGLContext.prototype.getAttribLocation = function(program, name) {
	if (!this.isProgram(program)) { throw new Error("Not a WebGLProgram!"); }
	return Gles.getAttribLocation(program._id, name);
    };
    WebGLContext.prototype.getUniformLocation = function(program, name) {
	if (!this.isProgram(program)) { throw new Error("Not a WebGLProgram!"); }
	loc = Gles.getUniformLocation(program._id, name);
	if (loc < 0) return null;
	return loc;
    };

    // WebGLTexture
    function WebGLTexture(id) {
	this._id = id;
    };
    WebGLContext.prototype.createTexture = function() {
	// XXX may leak texture object
	var textures = Gles.genTextures(1);
	return new WebGLTexture(textures[0]);
    };
    WebGLContext.prototype.deleteTexture = function(texture) {
	if (!this.isTexture(texture)) { throw new Error("Not a WebGLTexture!"); }
	Gles.deleteTextures(1, [texture._id]);
    };
    WebGLContext.prototype.isTexture = function(texture) {
	return texture instanceof WebGLTexture &&
	    Gles.isTexture(texture._id);
    };
    WebGLContext.prototype.bindTexture = function(target, texture) {
	if (!(texture instanceof WebGLTexture)) {
	    throw new Error("Not a WebGLTexture!");
	}
	Gles.bindTexture(target, texture._id);
    };
    WebGLContext.prototype._texImage2D = Gles.texImage2D;
    WebGLContext.prototype.texImage2D = function(target, level, internalformat,
						 format, type, source) {
	if (arguments.length == 9) {
	    // long form arguments.
	    return this._texImage2D.apply(this, arguments);
	}
	if (arguments.length == 6 &&
	    internalformat == Gles.RGBA &&
	    format == Gles.RGBA &&
	    type == Gles.UNSIGNED_BYTE &&
	    source instanceof Image) {
	    return this._texImage2D(target, level, internalformat,
				    source.width, source.height, 0,
				    format, type, source._image);
	}
	// XXX convert 'source' to pixel data
	throw new Error("unsupported");
    };

    var canvas = {
	getContext: function(type, parameters) {
	    if (type=='experimental-webgl') {
		return new WebGLContext(parameters, this.width, this.height);
	    }
	    return null;
	},
	width: INITIAL_WIDTH,
	height: INITIAL_HEIGHT
    };
    // XXX should watch width/height as well.
    return canvas;
})();
