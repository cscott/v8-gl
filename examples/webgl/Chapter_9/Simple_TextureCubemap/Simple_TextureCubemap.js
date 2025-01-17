//
// Book:      OpenGL(R) ES 2.0 Programming Guide
// Authors:   Aaftab Munshi, Dan Ginsburg, Dave Shreiner
// ISBN-10:   0321502795
// ISBN-13:   9780321502797
// Publisher: Addison-Wesley Professional
// URLs:      http://safari.informit.com/9780321563835
//            http://www.opengles-book.com
//

// Simple_TextureCubemap
//
//    This is a simple example that draws a sphere with a cubemap image applied.
//

UserData = function()
{
   // Handle to a program object
   this.programObject = 0;

   // Attribute locations
   this.positionLoc = 0;
   this.normalLoc = 0;

   // Sampler location
   this.samplerLoc = 0;

   // Texture handle
   this.textureId = 0;

   // VBOs
   this.vertPosObject = 0;
   this.vertNormalObject = 0;
   this.indicesObject = 0;
}

///
// Create a simple cubemap with a 1x1 face with a different
// color for each face
//
function CreateSimpleTextureCubemap( )
{
   var textureId;

   // Face 0 - Red
   var cubePixels0 = new Uint8Array([255, 0, 0]);
   // Face 1 - Green,
   var cubePixels1 = new Uint8Array([0, 255, 0]);
   // Face 2 - Blue
   var cubePixels2 = new Uint8Array([0, 0, 255]);
   // Face 3 - Yellow
   var cubePixels3 = new Uint8Array([255, 255, 0]);
   // Face 4 - Purple
   var cubePixels4 = new Uint8Array([255, 0, 255]);
   // Face 5 - White
   var cubePixels5 = new Uint8Array([255, 255, 255]);

   // Generate a texture object
   textureId = gl.createTexture ();

   // Bind the texture object
   gl.bindTexture ( gl.TEXTURE_CUBE_MAP, textureId );

   // Load the cube face - Positive X
   gl.texImage2D ( gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, 1, 1, 0,
                  gl.RGB, gl.UNSIGNED_BYTE, cubePixels0);

   // Load the cube face - Negative X
   gl.texImage2D ( gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, 1, 1, 0,
                  gl.RGB, gl.UNSIGNED_BYTE, cubePixels1 );

   // Load the cube face - Positive Y
   gl.texImage2D ( gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, 1, 1, 0,
                  gl.RGB, gl.UNSIGNED_BYTE, cubePixels2 );

   // Load the cube face - Negative Y
   gl.texImage2D ( gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, 1, 1, 0,
                  gl.RGB, gl.UNSIGNED_BYTE, cubePixels3 );

   // Load the cube face - Positive Z
   gl.texImage2D ( gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, 1, 1, 0,
                  gl.RGB, gl.UNSIGNED_BYTE, cubePixels4 );

   // Load the cube face - Negative Z
   gl.texImage2D ( gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, 1, 1, 0,
                  gl.RGB, gl.UNSIGNED_BYTE, cubePixels5 );

   // Set the filtering mode
   gl.texParameteri ( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
   gl.texParameteri ( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

   return textureId;

}

///
// Initialize the shader and program object
//
function Init ( esContext )
{
   var userData = esContext.userData;
   var vShaderStr =
      'attribute vec4 a_position;   \n\
       attribute vec3 a_normal;     \n\
       varying vec3 v_normal;       \n\
       void main()                  \n\
       {                            \n\
         gl_Position = a_position;  \n\
         v_normal = a_normal;       \n\
       }                            \n';

   var fShaderStr =
      'precision mediump float;                            \n\
       varying vec3 v_normal;                              \n\
       uniform samplerCube s_texture;                      \n\
       void main()                                         \n\
       {                                                   \n\
         gl_FragColor = textureCube( s_texture, v_normal );\n\
       }                                                   \n';

   // Load the shaders and get a linked program object
   userData.programObject = esLoadProgram ( vShaderStr, fShaderStr );

   // Get the attribute locations
   userData.positionLoc = gl.getAttribLocation ( userData.programObject, "a_position" );
   userData.normalLoc = gl.getAttribLocation ( userData.programObject, "a_normal" );

   // Get the sampler locations
   userData.samplerLoc = gl.getUniformLocation ( userData.programObject, "s_texture" );

   // Load the texture
   userData.textureId = CreateSimpleTextureCubemap ();

   // Generate the vertex data
   var shape = esGenSphere ( 20, 0.75, true, true, false, true );
   userData.numIndices = shape.numIndices;


   // Generate the VBOs
   userData.vertPosObject = gl.createBuffer();
   gl.bindBuffer ( gl.ARRAY_BUFFER, userData.vertPosObject );
   gl.bufferData ( gl.ARRAY_BUFFER, shape.vertices, gl.STATIC_DRAW );
   userData.vertNormalObject = gl.createBuffer();
   gl.bindBuffer ( gl.ARRAY_BUFFER, userData.vertNormalObject );
   gl.bufferData ( gl.ARRAY_BUFFER, shape.normals, gl.STATIC_DRAW );
   userData.indicesObject = gl.createBuffer();
   gl.bindBuffer ( gl.ELEMENT_ARRAY_BUFFER, userData.indicesObject );
   gl.bufferData ( gl.ELEMENT_ARRAY_BUFFER, shape.indices, gl.STATIC_DRAW );


   gl.clearColor ( 0.0, 0.0, 0.0, 1.0 );
   return true;
}

//
// Draw a triangle using the shader pair created in Init()
//
function Draw ( esContext )
{
   var userData = esContext.userData;

   // Set the viewport
   gl.viewport ( 0, 0, esContext.width, esContext.height );

   // Clear the color buffer
   gl.clear ( gl.COLOR_BUFFER_BIT );


   gl.cullFace ( gl.BACK );
   gl.enable ( gl.CULL_FACE );

   // Use the program object
   gl.useProgram ( userData.programObject );

   // Load the vertex position
   gl.bindBuffer ( gl.ARRAY_BUFFER, userData.vertPosObject );
   gl.vertexAttribPointer ( userData.positionLoc, 3, gl.FLOAT,
                            false, 0, 0 );
   // Load the normal
   gl.bindBuffer ( gl.ARRAY_BUFFER, userData.vertNormalObject );
   gl.vertexAttribPointer ( userData.normalLoc, 3, gl.FLOAT,
                            false, 0, 0 );

   gl.enableVertexAttribArray ( userData.positionLoc );
   gl.enableVertexAttribArray ( userData.normalLoc );

   // Bind the texture
   gl.activeTexture ( gl.TEXTURE0 );
   gl.bindTexture ( gl.TEXTURE_CUBE_MAP, userData.textureId );

   // Set the sampler texture unit to 0
   gl.uniform1i ( userData.samplerLoc, 0 );

   gl.bindBuffer ( gl.ELEMENT_ARRAY_BUFFER, userData.indicesObject );
   gl.drawElements ( gl.TRIANGLES, userData.numIndices,
                     gl.UNSIGNED_SHORT, 0 );
}


function main ( canvas )
{
   var esContext = new ESContext();
   var userData = new UserData();

   esInitContext ( esContext, canvas );
   esContext.userData = userData;

   if ( !Init ( esContext ) )
      return 0;

   esRegisterDrawFunc ( esContext, Draw );

   esMainLoop ( esContext );

   return esContext;
}
