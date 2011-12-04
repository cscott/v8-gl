// initial DOM-like context
window = this;
self = this;
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
