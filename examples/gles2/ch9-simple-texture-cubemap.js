//load libraries
load("common.js", "shaderutil.js");

//
// Create a simple cubemap texture
//
function CreateSimpleTextureCubemap()
{
    // Generate a texture object.  genTextures always returns
    // an array, and we're only interested in the first element
    var textureId = Gles.genTextures(1)[0];

    // Bind the texture object
    Gles.bindTexture(Gles.TEXTURE_CUBE_MAP, textureId);

    // Load each cube face
    Gles.texImage2D(Gles.TEXTURE_CUBE_MAP_POSITIVE_X, 0, Gles.RGB, 1, 1, 0, Gles.RGB, Gles.UNSIGNED_BYTE, [ 255, 0, 0 ]);
    Gles.texImage2D(Gles.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, Gles.RGB, 1, 1, 0, Gles.RGB, Gles.UNSIGNED_BYTE, [ 0, 255, 0 ]);
    Gles.texImage2D(Gles.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, Gles.RGB, 1, 1, 0, Gles.RGB, Gles.UNSIGNED_BYTE, [ 0, 0, 255 ]);
    Gles.texImage2D(Gles.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, Gles.RGB, 1, 1, 0, Gles.RGB, Gles.UNSIGNED_BYTE, [ 255, 255, 0 ]);
    Gles.texImage2D(Gles.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, Gles.RGB, 1, 1, 0, Gles.RGB, Gles.UNSIGNED_BYTE, [ 255, 0, 255 ]);
    Gles.texImage2D(Gles.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, Gles.RGB, 1, 1, 0, Gles.RGB, Gles.UNSIGNED_BYTE, [ 255, 255, 255 ]);

    // set up filtering modes
    Gles.texParameteri(Gles.TEXTURE_CUBE_MAP, Gles.TEXTURE_MIN_FILTER, Gles.NEAREST);
    Gles.texParameteri(Gles.TEXTURE_CUBE_MAP, Gles.TEXTURE_MAG_FILTER, Gles.NEAREST);

    return textureId;
}

function Init(es)
{
    es.userData = {};
    // Create the linked program object
    es.userData.programObject = getProgram("shaders/ch9-vshader.sl",
                                           "shaders/ch9-fshader.sl");
    if (es.userData.programObject == 0)
      return false;

    // Get the attribute locations
    es.userData.positionLoc = Gles.getAttribLocation(es.userData.programObject, "a_position");
    es.userData.normalLoc = Gles.getAttribLocation(es.userData.programObject, "a_normal");

    // Get the sampler location
    es.userData.samplerLoc = Gles.getUniformLocation(es.userData.programObject, "s_texture");

    // Load the texture
    es.userData.textureId = CreateSimpleTextureCubemap();

    // Create a sphere object
    es.userData.obj = esGenSphere(20, 0.75);

    // set up the clear color to clear to transparent black
    Gles.clearColor (0, 0, 0, 0);

    return true;
}

//
// Draw the sphere we created in init()
//
function Draw(es)
{
    // set up the viewport
    Gles.viewport (0, 0, es.width, es.height);

    // clear
    Gles.clear (Gles.COLOR_BUFFER_BIT);

    Gles.cullFace(Gles.BACK);

    Gles.enable(Gles.CULL_FACE);
    // use the program
    Gles.useProgram (es.userData.programObject);

    // load the vertex positions
    Gles.vertexAttribPointer (es.userData.positionLoc, 3, Gles.FLOAT, false, 0, es.userData.obj.vertices);

    // load the texture coordinates
    Gles.vertexAttribPointer (es.userData.normalLoc, 3, Gles.FLOAT, false, 0, es.userData.obj.normals);

    Gles.enableVertexAttribArray (es.userData.positionLoc);
    Gles.enableVertexAttribArray (es.userData.normalLoc);

    // bind the texture
    Gles.activeTexture(Gles.TEXTURE0);
    Gles.bindTexture(Gles.TEXTURE_CUBE_MAP, es.userData.textureId);

    // and set the sampler to texture unit 0
    Gles.uniform1i(es.userData.samplerLoc, 0);

    // and finally do the draw
    Gles.drawElements(Gles.TRIANGLES, es.userData.obj.indices.length, Gles.UNSIGNED_SHORT, es.userData.obj.indices);
}

function ShutDown(es) {
    Gles.deleteTextures(1, [es.userData.textureId]);
    Gles.deleteProgram( es.userData.programObject );
    es.userData = null;
}

function main()
{
    es = Glesutil.initContext();
    es.createWindow("Simple Texture Cubemap", 320, 240, es.WINDOW_RGB);
    if (!Init(es))
        return 0;
    es.registerDrawFunc( Draw );
    es.mainLoop();

    Shutdown(es);
}

main();
