//
// Book:      OpenGL(R) ES 2.0 Programming Guide
// Authors:   Aaftab Munshi, Dan Ginsburg, Dave Shreiner
// ISBN-10:   0321502795
// ISBN-13:   9780321502797
// Publisher: Addison-Wesley Professional
// URLs:      http://safari.informit.com/9780321563835
//            http://www.opengles-book.com
//

// TextureWrap
//
//    This is an example that demonstrates the three texture
//    wrap modes available on 2D textures
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
//  Generate an RGB8 checkerboard image
//
function GenCheckImage( width, height, checkSize )
{
   var x,
       y;
   var pixels = new Uint8Array( width * height * 3 );

   for ( y = 0; y < height; y++ )
      for ( x = 0; x < width; x++ )
      {
         var rColor = 0;
         var bColor = 0;

         if ( ( x / checkSize ) % 2 == 0 )
         {
            rColor = 255 * ( ( y / checkSize ) % 2 );
            bColor = 255 * ( 1 - ( ( y / checkSize ) % 2 ) );
         }
         else
         {
            bColor = 255 * ( ( y / checkSize ) % 2 );
            rColor = 255 * ( 1 - ( ( y / checkSize ) % 2 ) );
         }

         pixels[(y * height + x) * 3] = rColor;
         pixels[(y * height + x) * 3 + 1] = 0;
         pixels[(y * height + x) * 3 + 2] = bColor;
      }

   return pixels;
}

///
// Create a 2D texture image
//
function CreateTexture2D( )
{
   // Texture object handle
   var textureId;
   var width = 256,
       height = 256;
   var pixels;

   pixels = GenCheckImage( width, height, 64 );

   // Use tightly packed data
   gl.pixelStorei ( gl.UNPACK_ALIGNMENT, 1 );

   // Generate a texture object
   textureId = gl.createTexture ();

   // Bind the texture object
   gl.bindTexture ( gl.TEXTURE_2D, textureId );

   // Load mipmap level 0
   gl.texImage2D ( gl.TEXTURE_2D, 0, gl.RGB, width, height,
                   0, gl.RGB, gl.UNSIGNED_BYTE, pixels );

   // Set the filtering mode
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

   return textureId;
}



///
// Initialize the shader and program object
//
function Init ( esContext )
{
   var userData = esContext.userData;
   var vShaderStr =
      'uniform float u_offset;      \n\
       attribute vec4 a_position;   \n\
       attribute vec2 a_texCoord;   \n\
       varying vec2 v_texCoord;     \n\
       void main()                  \n\
       {                            \n\
          gl_Position = a_position; \n\
          gl_Position.x += u_offset;\n\
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

   // Get the offset location
   userData.offsetLoc = gl.getUniformLocation( userData.programObject, "u_offset" );

   // Load the texture
   userData.textureId = CreateTexture2D ();

   // Setup the vertex data
   var vVertices = new Float32Array(
                         [ -0.3,  0.3, 0.0, 1.0,  // Position 0
                           -1.0,  -1.0,           // TexCoord 0
                           -0.3, -0.3, 0.0, 1.0,  // Position 1
                           -1.0,  2.0,            // TexCoord 1
                            0.3, -0.3, 0.0, 1.0,  // Position 2
                            2.0,  2.0,            // TexCoord 2
                            0.3,  0.3, 0.0, 1.0,  // Position 3
                            2.0,  -1.0            // TexCoord 3
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
   gl.vertexAttribPointer ( userData.positionLoc, 4, gl.FLOAT,
                            false, 6 * userData.vertexBytesPerElement, 0 );
   // Load the texture coordinate
   gl.vertexAttribPointer ( userData.texCoordLoc, 2, gl.FLOAT,
                            false, 6 * userData.vertexBytesPerElement,
                            4 * userData.vertexBytesPerElement );

   gl.enableVertexAttribArray ( userData.positionLoc );
   gl.enableVertexAttribArray ( userData.texCoordLoc );

   // Bind the texture
   gl.activeTexture ( gl.TEXTURE0 );
   gl.bindTexture ( gl.TEXTURE_2D, userData.textureId );

   // Set the sampler texture unit to 0
   gl.uniform1i ( userData.samplerLoc, 0 );

   // Draw quad with repeat wrap mode
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
   gl.uniform1f ( userData.offsetLoc, -0.7 );
   gl.bindBuffer ( gl.ELEMENT_ARRAY_BUFFER, userData.indexObject );
   gl.drawElements ( gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0 );

   // Draw quad with clamp to edge wrap mode
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
   gl.uniform1f ( userData.offsetLoc, 0.0 );
   gl.drawElements ( gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0 );

   // Draw quad with mirrored repeat
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT );
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT );
   gl.uniform1f ( userData.offsetLoc, 0.7 );
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
