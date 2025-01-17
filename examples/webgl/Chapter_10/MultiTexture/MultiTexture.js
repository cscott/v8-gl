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

   // Sampler locations
   this.baseMapLoc = 0;
   this.lightMapLoc = 0;

   // Texture handle
   this.baseMapTexId = 0;
   this.lightMapTexId = 0;

   // VBOs
   this.vertexObject = 0;
   this.vertexBytesPerElement = 0;
   this.indexObject = 0;
}

///
// Load texture from image
//
function LoadTexture ( texture )
{
   var width,
       height;

   gl.bindTexture ( gl.TEXTURE_2D, texture );
   gl.texImage2D ( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image );
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
   gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
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
       uniform sampler2D s_baseMap;                        \n\
       uniform sampler2D s_lightMap;                       \n\
       void main()                                         \n\
       {                                                   \n\
         vec4 baseColor;                                   \n\
         vec4 lightColor;                                  \n\
                                                           \n\
         baseColor = texture2D( s_baseMap, v_texCoord );   \n\
         lightColor = texture2D( s_lightMap, v_texCoord ); \n\
         gl_FragColor = baseColor * (lightColor + 0.25);   \n\
       }                                                   \n';

   // Load the shaders and get a linked program object
   userData.programObject = esLoadProgram ( vShaderStr, fShaderStr );

   // Get the attribute locations
   userData.positionLoc = gl.getAttribLocation ( userData.programObject, "a_position" );
   userData.texCoordLoc = gl.getAttribLocation ( userData.programObject, "a_texCoord" );

   // Get the sampler location
   userData.baseMapLoc = gl.getUniformLocation ( userData.programObject, "s_baseMap" );
   userData.lightMapLoc = gl.getUniformLocation ( userData.programObject, "s_lightMap" );

   // Load the textures
   userData.baseMapTexId = gl.createTexture();
   userData.baseMapTexId.image = new Image();
   userData.baseMapTexId.image.onload = function () {
       LoadTexture( userData.baseMapTexId );
   }
   userData.baseMapTexId.image.src = "basemap.gif";
   userData.lightMapTexId = gl.createTexture();
   userData.lightMapTexId.image = new Image();
   userData.lightMapTexId.image.onload = function () {
       LoadTexture( userData.lightMapTexId );
   }
   userData.lightMapTexId.image.src = "lightmap.gif";

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

   // Bind the base map
   gl.activeTexture ( gl.TEXTURE0 );
   gl.bindTexture ( gl.TEXTURE_2D, userData.baseMapTexId );

   // Set the base map sampler to texture unit to 0
   gl.uniform1i ( userData.baseMapLoc, 0 );

   // Bind the light map
   gl.activeTexture ( gl.TEXTURE1 );
   gl.bindTexture ( gl.TEXTURE_2D, userData.lightMapTexId );

   // Set the light map sampler to texture unit 1
   gl.uniform1i ( userData.lightMapLoc, 1 );

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
