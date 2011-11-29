/*
 * glesutilbind.h
 *
 */

#ifndef GLESUTILBIND_H_
#define GLESUTILBIND_H_

#include <v8.h>
#include "../utils.h"

class GlesutilFactory {
public:
	static v8::Handle<v8::ObjectTemplate> createGlesutil(void);
	static v8::Persistent<v8::Context> glesutil_persistent_context;
	static v8::Persistent<v8::Object> self_;
};

#endif /* GLESBIND_H_ */
