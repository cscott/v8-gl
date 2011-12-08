// initial DOM-like context
window = this;
self = this;
document = {
    baseURI: './'
};
console = {
    log: function(s) { log("LOG: "+s+"\n"); },
    warn: function(s) { log("WARN: "+s+"\n"); },
    error: function(s) { log("ERROR: "+s+"\n"); }
};
function alert(s) { log("ALERT: "+s+"\n"); }
navigator = {
    userAgent: "v8-gl"
};
var _intervalFunc = null;
function setInterval(func, timeout) {
    // store this away; we'll use this in our 'draw' callback.
    _intervalFunc = func;
}
function requestAnimationFrame(func) {
    // store this away; we'll use this in our 'draw' callback.
    _intervalFunc = func;
}

// Create a pseudo-implementation of the <img> tag, to let WebGL stuff load
// textures they way they expect to.
function Image() {
}
Image.prototype = {
    // when user sets Image.src, load then invoke image.onload
    _loadImageFromSrc: function() {
	// compute relative URL
	var fullSrc = this.src;
	if (fullSrc.substring(0,1) != '/') {
	    var baseDir = document.baseURI;
	    var idx = baseDir.lastIndexOf("/");
	    if (idx >= 0) {
		baseDir = baseDir.substring(0, idx);
	    }
	    fullSrc = baseDir + "/" + fullSrc;
	}
	// load it!
	//log("Loading from src: "+this.src+" -> "+fullSrc+"\n");
	this._image = Glesutil.loadImage(fullSrc);
	// call the onload function
	if (this.onload) this.onload(this);
    }
};
Object.defineProperty(Image.prototype, "src", {
    get: function() { return this._src; },
    set: function(newValue) {
	this._src = newValue;
	// XXX could do this in event loop callback
	this._loadImageFromSrc();
    }
});
Object.defineProperty(Image.prototype, "width", {
    get: function() { return this._image.width; }
});
Object.defineProperty(Image.prototype, "height", {
    get: function() { return this._image.height; }
});
