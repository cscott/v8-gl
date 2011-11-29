
#include "glesutilbind.h"

#include <assert.h>
#include <stdlib.h>
#include "esUtil.h"
using namespace v8;

Persistent<Object> GlesutilFactory::self_;
Persistent<Context> GlesutilFactory::glesutil_persistent_context;
Persistent<ObjectTemplate> esContextTemplate;

/* esContext constructor/wrapper/destructor */
typedef struct wrappedContext {
    ESContext esContext;
    Persistent<Object> jsObject;
} WrappedContext;

void Glesutil_free(Persistent<Value> value, void *data) {
    WrappedContext *wrappedContext = (WrappedContext *) data;
    assert(value.IsNearDeath());
    free(wrappedContext);
    value.Dispose();
}

Handle<Value> Glesutil_initContext(const Arguments& args) {
    HandleScope handle_scope;

    // make a wrappedContext
    WrappedContext * wrappedContext = (WrappedContext *)
	malloc(sizeof(WrappedContext));
    esInitContext(&(wrappedContext->esContext));

    // wrap the wrappedContext
    Local<Object> obj = esContextTemplate->NewInstance();
    obj->SetInternalField(0, External::New(wrappedContext));
    // register destructor
    wrappedContext->jsObject = Persistent<Object>::New(obj);
    wrappedContext->jsObject.MakeWeak(wrappedContext, Glesutil_free);
    wrappedContext->jsObject.MarkIndependent();
    // stash away the javascript object for later C->JS calls
    wrappedContext->esContext.userData = (void *) &(wrappedContext->jsObject);

    return handle_scope.Close(obj);
}

static ESContext *_js2c(Local<Object> self) {
    HandleScope handle_scope;
    Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
    return &(static_cast<WrappedContext*>(wrap->Value()))->esContext;
}
static Persistent<Object> _c2js(ESContext *esContext) {
    WrappedContext *wrappedContext = (WrappedContext *)esContext;
    return wrappedContext->jsObject;
}

Handle<Value> Glesutil_createWindow(const Arguments& args) {
    HandleScope handle_scope;
    ESContext *esContext = _js2c(args.Holder());

    // args: 'title', 'width', 'height', 'flags'
    if (args.Length() < 4) return v8::Undefined();
    String::Utf8Value title(args[0]);
    unsigned int width = args[1]->Uint32Value();
    unsigned int height = args[2]->Uint32Value();
    unsigned int flags = args[3]->Uint32Value();

    return Boolean::New(esCreateWindow(esContext, *title,
				       (GLint) width, (GLint) height,
				       (GLuint) flags));
}
static void Glesutil_drawWrapper(ESContext *esContext) {
    HandleScope handle_scope;
    Persistent<Object> obj = Persistent<Object>(_c2js(esContext));
    Local<Value> drawFunc = obj->Get(String::NewSymbol("drawFunc"));
    // XXX should check type of drawFunc; ensure it's callable, etc.
    Handle<Value> args[1] = { obj };
    drawFunc->ToObject()->CallAsFunction(obj, 1, args);
    // ignore result.
}
Handle<Value> Glesutil_registerDrawFunc(const Arguments& args) {
    ESContext *esContext = _js2c(args.Holder());
    HandleScope handle_scope;

    Handle<Value> func = v8::Undefined();
    if (args.Length() >= 1) func = args[0];
    args.This()->Set(String::NewSymbol("drawFunc"), func);

    esRegisterDrawFunc(esContext,
		       (args.Length() >= 1) ? Glesutil_drawWrapper : NULL);

    return v8::Undefined();
}
static void Glesutil_updateWrapper(ESContext *esContext, float f) {
    HandleScope handle_scope;
    Persistent<Object> obj = Persistent<Object>(_c2js(esContext));
    Local<Value> updateFunc = obj->Get(String::NewSymbol("updateFunc"));
    // XXX should check type of updateFunc; ensure it's callable, etc.
    Handle<Value> args[2] = { obj, Number::New(f) };
    updateFunc->ToObject()->CallAsFunction(obj, 2, args);
    // ignore result.
}
Handle<Value> Glesutil_registerUpdateFunc(const Arguments& args) {
    ESContext *esContext = _js2c(args.Holder());
    HandleScope handle_scope;

    Handle<Value> func = v8::Undefined();
    if (args.Length() >= 1) func = args[0];
    args.Holder()->Set(String::NewSymbol("updateFunc"), func);

    esRegisterUpdateFunc(esContext,
			 (args.Length() >= 1) ? Glesutil_updateWrapper : NULL);

    return v8::Undefined();
}
static void Glesutil_keyWrapper(ESContext *esContext, unsigned char c, int i, int j) {
    HandleScope handle_scope;
    Persistent<Object> obj = Persistent<Object>(_c2js(esContext));
    Local<Value> keyFunc = obj->Get(String::NewSymbol("keyFunc"));
    // XXX should check type of keyFunc; ensure it's callable, etc.
    char cstr[2] = { c, 0 };
    Handle<Value> args[4] = { obj, String::New(cstr),
			      Uint32::New(i), Uint32::New(j) };
    keyFunc->ToObject()->CallAsFunction(obj, 4, args);
    // ignore result.
}
Handle<Value> Glesutil_registerKeyFunc(const Arguments& args) {
    ESContext *esContext = _js2c(args.Holder());
    HandleScope handle_scope;

    Handle<Value> func = v8::Undefined();
    if (args.Length() >= 1) func = args[0];
    args.Holder()->Set(String::NewSymbol("keyFunc"), func);

    esRegisterKeyFunc(esContext,
		      (args.Length() >= 1) ? Glesutil_keyWrapper : NULL);

    return v8::Undefined();
}

Handle<Value> Glesutil_mainLoop(const Arguments& args) {
    ESContext *esContext = _js2c(args.Holder());

    esMainLoop(esContext);

    return v8::Undefined();
}

Handle<Value> Glesutil_getWidth(Local<String> property,
				const AccessorInfo& info) {
    ESContext *esContext = _js2c(info.Holder());
    return Uint32::New(esContext->width);
}
Handle<Value> Glesutil_getHeight(Local<String> property,
				const AccessorInfo& info) {
    ESContext *esContext = _js2c(info.Holder());
    return Uint32::New(esContext->height);
}

/* Top-level context object. */
Handle<ObjectTemplate> GlesutilFactory::createGlesutil(void) {
    HandleScope handle_scope;

    Handle<ObjectTemplate> Glesutil = ObjectTemplate::New();

    Glesutil->SetInternalFieldCount(1);

    Glesutil->Set(String::NewSymbol("initContext"), FunctionTemplate::New(Glesutil_initContext));

    // template wrapper for ESContext
    Handle<ObjectTemplate> esContext = ObjectTemplate::New();
    esContext->SetInternalFieldCount(1);
    // constants
    esContext->Set(String::NewSymbol("WINDOW_RGB"),
		   Uint32::New(ES_WINDOW_RGB), ReadOnly);
    esContext->Set(String::NewSymbol("WINDOW_ALPHA"),
		   Uint32::New(ES_WINDOW_ALPHA), ReadOnly);
    esContext->Set(String::NewSymbol("WINDOW_DEPTH"),
		   Uint32::New(ES_WINDOW_DEPTH), ReadOnly);
    esContext->Set(String::NewSymbol("WINDOW_STENCIL"),
		   Uint32::New(ES_WINDOW_STENCIL), ReadOnly);
    esContext->Set(String::NewSymbol("WINDOW_MULTISAMPLE"),
		   Uint32::New(ES_WINDOW_MULTISAMPLE), ReadOnly);
    // function wrappers for ESContext object
    esContext->Set(String::NewSymbol("createWindow"),
		   FunctionTemplate::New(Glesutil_createWindow));
    esContext->Set(String::NewSymbol("registerDrawFunc"),
		   FunctionTemplate::New(Glesutil_registerDrawFunc));
    esContext->Set(String::NewSymbol("registerUpdateFunc"),
		   FunctionTemplate::New(Glesutil_registerUpdateFunc));
    esContext->Set(String::NewSymbol("registerKeyFunc"),
		   FunctionTemplate::New(Glesutil_registerKeyFunc));
    esContext->Set(String::NewSymbol("mainLoop"),
		   FunctionTemplate::New(Glesutil_mainLoop));
    // accessors for interesting properties of the ESContext
    esContext->SetAccessor(String::NewSymbol("width"),
			   Glesutil_getWidth);
    esContext->SetAccessor(String::NewSymbol("height"),
			   Glesutil_getHeight);

    esContextTemplate = Persistent<ObjectTemplate>::New(esContext);

    return handle_scope.Close(Glesutil);
}
