//
// Book:      OpenGL(R) ES 2.0 Programming Guide
// Authors:   Aaftab Munshi, Dan Ginsburg, Dave Shreiner
// ISBN-10:   0321502795
// ISBN-13:   9780321502797
// Publisher: Addison-Wesley Professional
// URLs:      http://safari.informit.com/9780321563835
//            http://www.opengles-book.com
//

// MipMap2D
//
//    This is a simple example that demonstrates generating a mipmap chain
//    and rendering with it
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

   // Offset location
   this.offsetLoc = 0;

   // Texture handle
   this.textureId = 0;

   // VBOs
   this.vertexObject = 0;
   this.vertexBytesPerElement = 0;
   this.indexObject = 0;
}


///
//  From an RGB8 source image, generate the next level mipmap
//
function GenMipMap2D( src, srcWidth, srcHeight, dstWidth, dstHeight )
{
   var x,
       y;
   var texelSize = 3;

   var dst = new Uint8Array(texelSize * (dstWidth) * (dstHeight) );
   
   for ( y = 0; y < dstHeight; y++ )
   {
      for( x = 0; x < dstWidth; x++ )
      {
         var srcIndex = new Array(4);
         var r = 0,
             g = 0,
             b = 0;
         var sample;

         // Compute the offsets for 2x2 grid of pixels in previous
         // image to perform box filter
         srcIndex[0] =
            (((y * 2) * srcWidth) + (x * 2)) * texelSize;
         srcIndex[1] =
            (((y * 2) * srcWidth) + (x * 2 + 1)) * texelSize;
         srcIndex[2] =
            ((((y * 2) + 1) * srcWidth) + (x * 2)) * texelSize;
         srcIndex[3] =
            ((((y * 2) + 1) * srcWidth) + (x * 2 + 1)) * texelSize;

         // Sum all pixels
         for ( sample = 0; sample < 4; sample++ )
         {
            r += src[srcIndex[sample]];
            g += src[srcIndex[sample] + 1];
            b += src[srcIndex[sample] + 2];
         }

         // Average results
         r /= 4;
         g /= 4;
         b /= 4;

         // Store resulting pixels
         dst[ ( y * (dstWidth) + x ) * texelSize ] = r;
         dst[ ( y * (dstWidth) + x ) * texelSize + 1] = g;
         dst[ ( y * (dstWidth) + x ) * texelSize + 2] = b;
      }
   }

   return dst;
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
// Create a mipmapped 2D texture image
//
function CreateMipMappedTexture2D( )
{
   // Texture object handle
   var textureId;
   var width = 256,
       height = 256;
   var level;
   var pixels;
   var prevImage;
   var newImage;

   pixels = GenCheckImage( width, height, 8 );

   // Use tightly packed data
   gl.pixelStorei ( gl.UNPACK_ALIGNMENT, 1 );

   // Generate a texture object
   textureId = gl.createTexture();

   // Bind the texture object
   gl.bindTexture ( gl.TEXTURE_2D, textureId );

   // Load mipmap level 0
   gl.texImage2D ( gl.TEXTURE_2D, 0, gl.RGB, width, height,
                  0, gl.RGB, gl.UNSIGNED_BYTE, pixels );

   level = 1;
   prevImage = pixels;

   while ( width > 1 && height > 1 )
   {
      var dstWidth = 0,
          dstHeight = 0;

      dstWidth = width / 2;
      if ( dstWidth <= 0 )
          dstWidth = 1;

      dstHeight = height / 2;
      if ( dstHeight <= 0 )
          dstHeight = 1;


      // Generate the next mipmap level
      newImage = GenMipMap2D( prevImage, width, height,
                              dstWidth, dstHeight );

      // Load the mipmap level
      gl.texImage2D( gl.TEXTURE_2D, level, gl.RGB,
                     dstWidth, dstHeight, 0, gl.RGB,
                     gl.UNSIGNED_BYTE, newImage );

      // Set the previous image for the next iteration
      prevImage = newImage;
      level++;

      // Half the width and height
      width = dstWidth;
      height = dstHeight;
   }

   // Set the filtering mode
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST );
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
   userData.textureId = CreateMipMappedTexture2D ();

   // Generate the VBOs
   var vVertices = new Float32Array(
                         [ -0.5,  0.5, 0.0, 1.5,  // Position 0
                            0.0,  0.0,            // TexCoord 0
                           -0.5, -0.5, 0.0, 0.75, // Position 1
                            0.0,  1.0,            // TexCoord 1
                            0.5, -0.5, 0.0, 0.75, // Position 2
                            1.0,  1.0,            // TexCoord 2
                            0.5,  0.5, 0.0, 1.5,  // Position 3
                            1.0,  0.0             // TexCoord 3
                         ]);
   var indices = new Uint16Array([ 0, 1, 2, 0, 2, 3 ]);

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
                            false, 6 * userData.vertexBytesPerElement, 0);
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

   // Draw quad with nearest sampling
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
   gl.uniform1f ( userData.offsetLoc, -0.6 );
   gl.bindBuffer ( gl.ELEMENT_ARRAY_BUFFER, userData.indexObject );
   gl.drawElements ( gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0 );

   // Draw quad with trilinear filtering
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
   gl.uniform1f ( userData.offsetLoc, 0.6 );
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
