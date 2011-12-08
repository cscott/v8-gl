#include "glesutilbind.h"

/* stbi image-reading library (header file) */
#define STBI_HEADER_FILE_ONLY
#include "stb_image.c"
#undef  STBI_HEADER_FILE_ONLY

#include <assert.h>
#include <stdlib.h>
#include "esUtil.h"
using namespace v8;

Persistent<Object> GlesutilFactory::self_;
Persistent<Context> GlesutilFactory::glesutil_persistent_context;
Persistent<ObjectTemplate> esContextTemplate, esImageTemplate;

/* esContext constructor/wrapper/destructor */
typedef struct wrappedContext {
    ESContext esContext;
    Persistent<Object> jsObject;
} WrappedContext;

void Glesutil_freeContext(Persistent<Value> value, void *data) {
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
    wrappedContext->jsObject.MakeWeak(wrappedContext, Glesutil_freeContext);
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
static int Glesutil_drawWrapper(ESContext *esContext) {
    HandleScope handle_scope;
    Persistent<Object> obj = Persistent<Object>(_c2js(esContext));
    Local<Value> drawFunc = obj->Get(String::NewSymbol("drawFunc"));
    if (drawFunc.IsEmpty()) return 0; // nothing in 'drawFunc'
    Local<Object> drawFuncObj = drawFunc->ToObject();
    if (drawFunc.IsEmpty()) return 0; // not an object
    Handle<Value> args[1] = { obj };
    Handle<Value> result = drawFuncObj->CallAsFunction(obj, 1, args);
    if (result.IsEmpty()) return 0; // some problem with call
    return 1;
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
static int Glesutil_updateWrapper(ESContext *esContext, float f) {
    HandleScope handle_scope;
    Persistent<Object> obj = Persistent<Object>(_c2js(esContext));
    Local<Value> updateFunc = obj->Get(String::NewSymbol("updateFunc"));
    if (updateFunc.IsEmpty()) return 0; // nothing in 'updateFunc'
    Local<Object> updateFuncObj = updateFunc->ToObject();
    if (updateFunc.IsEmpty()) return 0; // not an object
    Handle<Value> args[2] = { obj, Number::New(f) };
    Handle<Value> result = updateFuncObj->CallAsFunction(obj, 2, args);
    if (result.IsEmpty()) return 0; // some problem with call
    return 1;
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
static int Glesutil_keyWrapper(ESContext *esContext, unsigned char c, int i, int j) {
    HandleScope handle_scope;
    Persistent<Object> obj = Persistent<Object>(_c2js(esContext));
    Local<Value> keyFunc = obj->Get(String::NewSymbol("keyFunc"));
    if (keyFunc.IsEmpty()) return 0; // nothing in 'keyFunc'
    Local<Object> keyFuncObj = keyFunc->ToObject();
    if (keyFunc.IsEmpty()) return 0; // not an object

    char cstr[2] = { c, 0 };
    Handle<Value> args[4] = { obj, String::New(cstr),
			      Uint32::New(i), Uint32::New(j) };
    Handle<Value> result = keyFuncObj->CallAsFunction(obj, 4, args);
    if (result.IsEmpty()) return 0; // some problem with call
    return 1;
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

/* Very simple image support, based on stb_image.c */
void Glesutil_freeImage(Persistent<Value> value, void *image) {
    assert(value.IsNearDeath());
    stbi_image_free(image);
    value.Dispose();
}
Handle<Value> Glesutil_loadImage(const Arguments& args) {
    HandleScope handle_scope;

    int width, height, components;
    if (args.Length() < 1 || !args[0]->IsString())
	return ThrowException(String::New("Bad arguments"));
    String::Utf8Value value0(args[0]);
    char *arg0 = *value0;
    // get filename argument
    char *path = V8GLUtils::getRealPath(arg0);
    // load the image
    uint8_t *image = stbi_load(path, &width, &height, &components, 4);
    if (image == NULL) {
	fprintf(stderr, "Couldn't read %s: %s\n", path,
		stbi_failure_reason());
	delete[] path;
	return ThrowException(String::New("Failed to load file"));
    }
    delete[] path;

    // reconstruct size of *image
    int imagesize = width * height * 4; // always RGBA for now
    // convert to JavaScript object
    Local<Object> img = esImageTemplate->NewInstance();
    img->Set(String::New("width"), Int32::New(width), ReadOnly);
    img->Set(String::New("height"), Int32::New(height), ReadOnly);
    img->Set(String::New("bpp"), Int32::New(components * 8), ReadOnly);
    img->SetIndexedPropertiesToExternalArrayData
	(image, kExternalUnsignedByteArray, imagesize);
    // deallocate when gc'ed
    Persistent<Object> persistentHandle = Persistent<Object>::New(img);
    persistentHandle.MakeWeak(image, Glesutil_freeImage);
    persistentHandle.MarkIndependent();

    return handle_scope.Close(img);
}

/* Top-level context object. */
Handle<ObjectTemplate> GlesutilFactory::createGlesutil(void) {
    HandleScope handle_scope;

    Handle<ObjectTemplate> Glesutil = ObjectTemplate::New();

    Glesutil->SetInternalFieldCount(1);

    Glesutil->Set(String::NewSymbol("initContext"), FunctionTemplate::New(Glesutil_initContext));
    Glesutil->Set(String::NewSymbol("loadImage"), FunctionTemplate::New(Glesutil_loadImage));

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
    // make a persistent handle
    esContextTemplate = Persistent<ObjectTemplate>::New(esContext);

    // template wrapper for images
    Handle<ObjectTemplate> esImage = ObjectTemplate::New();
    // make a persistent handle
    esImageTemplate = Persistent<ObjectTemplate>::New(esImage);

    return handle_scope.Close(Glesutil);
}
