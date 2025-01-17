//
// Book:      OpenGL(R) ES 2.0 Programming Guide
// Authors:   Aaftab Munshi, Dan Ginsburg, Dave Shreiner
// ISBN-10:   0321502795
// ISBN-13:   9780321502797
// Publisher: Addison-Wesley Professional
// URLs:      http://safari.informit.com/9780321563835
//            http://www.opengles-book.com
//

//  Hello_Triangle
//
//    This is a simple example that draws a single triangle with
//    a minimal vertex/fragment shader.  The purpose of this
//    example is to demonstrate the basic concepts of
//    OpenGL ES 2.0 rendering.

UserData = function()
{
    // Handle to a program object
    this.programObject = 0;

    // Position vertex attribute location
    this.vertexAttribLoc = 0;
    
    // Handle to vertex position VBO
    this.vertexPosObject = 0;
}

///
// Create a shader object, load the shader source, and
// compile the shader.
//
function LoadShader ( type, shaderSrc )
{
   var shader;
   var compiled;

   // Create the shader object
   shader = gl.createShader ( type );

   if ( shader == 0 )
   	return 0;

   // Load the shader source
   gl.shaderSource ( shader, shaderSrc );

   // Compile the shader
   gl.compileShader ( shader );

   // Check the compile status
   compiled = gl.getShaderParameter ( shader, gl.COMPILE_STATUS );

   if ( !compiled )
   {
       alert( gl.getShaderInfoLog ( shader ) );
       gl.deleteShader ( shader );
       return 0;
   }

   return shader;
}

///
// Initialize the shader and program object
//
function Init ( esContext )
{
   var userData = esContext.userData;
   var vShaderStr =
      'attribute vec4 vPosition;    \n\
       void main()                  \n\
       {                            \n\
          gl_Position = vPosition;  \n\
       }                            \n';

   var fShaderStr =
      'precision mediump float;\n\
       void main()                                  \n\
       {                                            \n\
         gl_FragColor = vec4 ( 1.0, 0.0, 0.0, 1.0 );\n\
       }                                            \n';

   var vertexShader;
   var fragmentShader;
   var programObject;
   var linked;

   // Load the vertex/fragment shaders
   vertexShader = LoadShader ( gl.VERTEX_SHADER, vShaderStr );
   fragmentShader = LoadShader ( gl.FRAGMENT_SHADER, fShaderStr );

   // Create the program object
   programObject = gl.createProgram ( );

   if ( programObject == 0 )
      return 0;

   gl.attachShader ( programObject, vertexShader );
   gl.attachShader ( programObject, fragmentShader );


   // Link the program
   gl.linkProgram ( programObject );

   // Check the link status
   linked = gl.getProgramParameter ( programObject, gl.LINK_STATUS );

   if ( !linked )
   {
       alert ( glGetProgramInfoLog ( programObject ) );
       gl.deleteProgram ( programObject );
       return false;
   }

   // Store the program object
   userData.programObject = programObject;
   userData.vertexAttribLoc = gl.getAttribLocation( programObject, "vPosition");

   gl.clearColor ( 0.0, 0.0, 0.0, 1.0 );
   return true;
}

///
// Draw a triangle using the shader pair created in Init()
//
function Draw ( esContext )
{
   var userData = esContext.userData;
   

   // NOTE:
   //   In this example in the book, we use client-side vertex
   //   array data to pass the vVertices array in.  In this example,
   //   we create a vertex buffer object.  The reason for this
   //   change is that WebGL does *NOT* support client-side vertex
   //   arrays.
   if ( userData.vertexPosObject == 0)
   {
       var vVertices = new Float32Array([ 0.0,  0.5, 0.0,
                                         -0.5, -0.5, 0.0,
                                          0.5, -0.5, 0.0 ]);
       userData.vertexPosObject = gl.createBuffer();
       gl.bindBuffer(gl.ARRAY_BUFFER, userData.vertexPosObject);
       gl.bufferData(gl.ARRAY_BUFFER, vVertices, gl.STATIC_DRAW);
   }

   // Set the viewport
   gl.viewport ( 0, 0, esContext.width, esContext.height );

   // Clear the color buffer
   gl.clear ( gl.COLOR_BUFFER_BIT );

   // Use the program object
   gl.useProgram ( userData.programObject );

   // Bind the vertex data
   gl.bindBuffer(gl.ARRAY_BUFFER, userData.vertexPosObject);
   gl.vertexAttribPointer(userData.vertexAttribLoc, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(userData.vertexAttribLoc);

   gl.drawArrays ( gl.TRIANGLES, 0, 3 );
}


function main ( canvas )
{
   var esContext = new ESContext();
   var userData = new UserData();

   esInitContext( esContext, canvas );
   esContext.userData = userData;

   if ( !Init ( esContext ) )
      return;

   esRegisterDrawFunc ( esContext, Draw );

   esMainLoop ( esContext );

   return esContext;
}
