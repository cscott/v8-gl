//
// Book:      OpenGL(R) ES 2.0 Programming Guide
// Authors:   Aaftab Munshi, Dan Ginsburg, Dave Shreiner
// ISBN-10:   0321502795
// ISBN-13:   9780321502797
// Publisher: Addison-Wesley Professional
// URLs:      http://safari.informit.com/9780321563835
//            http://www.opengles-book.com
//

// Simple_Texture2D
//
//    This is a simple example that draws a quad with a 2D
//    texture image. The purpose of this example is to demonstrate
//    the basics of 2D texturing
//

UserData = function()
{
   // Handle to a program object
   this.programObject = 0;

   // Attribute locations
   this.positionLoc = 0;
   this.texCoordLoc = 0;

   // Sampler location
   this.samplerLoc = 0;

   // Texture handle
   this.textureId = 0;

   // VBOs
   this.vertexObject = 0;
   this.vertexBytesPerElement = 0;
   this.indexObject = 0;
}

///
// Create a simple 2x2 texture image with four different colors
//
function CreateSimpleTexture2D( )
{
   // Texture object handle
   var textureId;

   // 2x2 Image, 3 bytes per pixel (R, G, B)
   var pixels =
    new Uint8Array([
      255,   0,   0, // Red
        0, 255,   0, // Green
        0,   0, 255, // Blue
      255, 255,   0  // Yellow
    ]);

   // Use tightly packed data
   gl.pixelStorei ( gl.UNPACK_ALIGNMENT, 1 );

   // Generate a texture object
   textureId = gl.createTexture ( );

   // Bind the texture object
   gl.bindTexture ( gl.TEXTURE_2D, textureId );

   // Load the texture
   gl.texImage2D ( gl.TEXTURE_2D, 0, gl.RGB, 2, 2, 0, gl.RGB, gl.UNSIGNED_BYTE, pixels );

   // Set the filtering mode
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

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
       attribute vec2 a_texCoord;   \n\
       varying vec2 v_texCoord;     \n\
       void main()                  \n\
       {                            \n\
          gl_Position = a_position; \n\
          v_texCoord = a_texCoord;  \n\
       }                            \n';

   var fShaderStr =
      'precision mediump float;                            \n\
       varying vec2 v_texCoord;                            \n\
       uniform sampler2D s_texture;                        \n\
       void main()                                         \n\
       {                                                   \n\
         gl_FragColor = texture2D( s_texture, v_texCoord );\n\
       }                                                   \n';

   // Load the shaders and get a linked program object
   userData.programObject = esLoadProgram ( vShaderStr, fShaderStr );

   // Get the attribute locations
   userData.positionLoc = gl.getAttribLocation ( userData.programObject, "a_position" );
   userData.texCoordLoc = gl.getAttribLocation ( userData.programObject, "a_texCoord" );

   // Get the sampler location
   userData.samplerLoc = gl.getUniformLocation ( userData.programObject, "s_texture" );

   // Load the texture
   userData.textureId = CreateSimpleTexture2D ();
   
   // Setup the vertex data
   var vVertices = new Float32Array(
                         [ -0.5,  0.5, 0.0,  // Position 0
                            0.0,  0.0,       // TexCoord 0
                           -0.5, -0.5, 0.0,  // Position 1
                            0.0,  1.0,       // TexCoord 1
                            0.5, -0.5, 0.0,  // Position 2
                            1.0,  1.0,       // TexCoord 2
                            0.5,  0.5, 0.0,  // Position 3
                            1.0,  0.0        // TexCoord 3
                         ]);
   var indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

   userData.vertexObject = gl.createBuffer();
   gl.bindBuffer ( gl.ARRAY_BUFFER, userData.vertexObject );
   gl.bufferData ( gl.ARRAY_BUFFER, vVertices, gl.STATIC_DRAW );
   userData.vertexBytesPerElement = vVertices.BYTES_PER_ELEMENT;
   userData.indexObject = gl.createBuffer();
   gl.bindBuffer ( gl.ELEMENT_ARRAY_BUFFER, userData.indexObject );
   gl.bufferData ( gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW );

   gl.clearColor ( 0.0, 0.0, 0.0, 1.0 );
   return true;
}

///
// Draw a triangle using the shader pair created in Init()
//
function Draw ( esContext )
{
   var userData = esContext.userData;
   

   // Set the viewport
   gl.viewport ( 0, 0, esContext.width, esContext.height );

   // Clear the color buffer
   gl.clear ( gl.COLOR_BUFFER_BIT );

   // Use the program object
   gl.useProgram ( userData.programObject );

   // Load the vertex position
   gl.bindBuffer ( gl.ARRAY_BUFFER, userData.vertexObject );
   gl.vertexAttribPointer ( userData.positionLoc, 3, gl.FLOAT,
                           false, 5 * userData.vertexBytesPerElement, 0 );
   // Load the texture coordinate
   gl.vertexAttribPointer ( userData.texCoordLoc, 2, gl.FLOAT,
                           false, 5 * userData.vertexBytesPerElement, 
                           3 * userData.vertexBytesPerElement );

   gl.enableVertexAttribArray ( userData.positionLoc );
   gl.enableVertexAttribArray ( userData.texCoordLoc );

   // Bind the texture
   gl.activeTexture ( gl.TEXTURE0 );
   gl.bindTexture ( gl.TEXTURE_2D, userData.textureId );

   // Set the sampler texture unit to 0
   gl.uniform1i ( userData.samplerLoc, 0 );

   gl.bindBuffer ( gl.ELEMENT_ARRAY_BUFFER, userData.indexObject );
   gl.drawElements ( gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0 );
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
