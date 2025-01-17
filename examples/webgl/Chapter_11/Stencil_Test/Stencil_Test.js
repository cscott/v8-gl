//
// Book:      OpenGL(R) ES 2.0 Programming Guide
// Authors:   Aaftab Munshi, Dan Ginsburg, Dave Shreiner
// ISBN-10:   0321502795
// ISBN-13:   9780321502797
// Publisher: Addison-Wesley Professional
// URLs:      http://safari.informit.com/9780321563835
//            http://www.opengles-book.com
//

// Stencil_Test.c
//
//    This example shows various stencil buffer
//    operations.
//

UserData = function()
{
   // Handle to a program object
   this.programObject = 0;

   // Attribute locations
   this.positionLoc = 0;

   // Uniform locations
   this.colorLoc = 0;

   // VBOs
   this.vertexObject = 0;
   this.vertexBytesPerElement = 0;
   this.indexObject = 0;
}

///
// Initialize the shader and program object
//
function Init ( esContext )
{
   var userData = esContext.userData;
   var vShaderStr =
      'attribute vec4 a_position;   \n\
       void main()                  \n\
       {                            \n\
          gl_Position = a_position; \n\
       }                            \n';

   var fShaderStr =
      'precision mediump float;               \n\
       uniform vec4 u_color;                  \n\
       void main()                            \n\
       {                                      \n\
         gl_FragColor = u_color;              \n\
       }                                      \n';

   // Load the shaders and get a linked program object
   userData.programObject = esLoadProgram ( vShaderStr, fShaderStr );

   // Get the attribute locations
   userData.positionLoc = gl.getAttribLocation ( userData.programObject, "a_position" );

   // Get the sampler location
   userData.colorLoc = gl.getUniformLocation ( userData.programObject, "u_color" );

   
   // Setup the vertex data
   var vVertices = new Float32Array(
      [-0.75,  0.25,  0.50, // Quad #0
       -0.25,  0.25,  0.50,
       -0.25,  0.75,  0.50,
       -0.75,  0.75,  0.50,
        0.25,  0.25,  0.90, // Quad #1
	0.75,  0.25,  0.90,
        0.75,  0.75,  0.90,
	0.25,  0.75,  0.90,
       -0.75, -0.75,  0.50, // Quad #2
       -0.25, -0.75,  0.50,
       -0.25, -0.25,  0.50,
       -0.75, -0.25,  0.50,
        0.25, -0.75,  0.50, // Quad #3
        0.75, -0.75,  0.50,
        0.75, -0.25,  0.50,
        0.25, -0.25,  0.50,
       -1.00, -1.00,  0.00, // Big Quad
        1.00, -1.00,  0.00,
        1.00,  1.00,  0.00,
       -1.00,  1.00,  0.00]);

   var indices = new Uint8Array(
       [  0,  1,  2,  0,  2,  3 , // Quad #0
          4,  5,  6,  4,  6,  7 , // Quad #1
          8,  9, 10,  8, 10, 11 , // Quad #2
         12, 13, 14, 12, 14, 15 , // Quad #3
         16, 17, 18, 16, 18, 19 ]  // Big Quad
   );

   userData.vertexObject = gl.createBuffer();
   gl.bindBuffer ( gl.ARRAY_BUFFER, userData.vertexObject );
   gl.bufferData ( gl.ARRAY_BUFFER, vVertices, gl.STATIC_DRAW );
   userData.vertexBytesPerElement = vVertices.BYTES_PER_ELEMENT;
   userData.indexObject = gl.createBuffer();
   gl.bindBuffer ( gl.ELEMENT_ARRAY_BUFFER, userData.indexObject );
   gl.bufferData ( gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW );

   gl.clearColor ( 0.0, 0.0, 0.0, 1.0 );
   
   // Set the stencil clear value
   gl.clearStencil ( 0x1 );

   // Set the depth clear value
   gl.clearDepth( 0.75 );

   // Enable the depth and stencil tests
   gl.enable( gl.DEPTH_TEST );
   gl.enable( gl.STENCIL_TEST );
   return true;
}

///
// Initialize the stencil buffer values, and then use those
//   values to control rendering
//
function Draw ( esContext )
{
   var  i;

   var userData = esContext.userData;

   var NumTests = 4;
   var  colors = new Array(NumTests);
   colors[0] = new Float32Array([ 1.0, 0.0, 0.0, 1.0 ]);
   colors[1] = new Float32Array([ 0.0, 1.0, 0.0, 1.0 ]);
   colors[2] = new Float32Array([ 0.0, 0.0, 1.0, 1.0]);
   colors[3] = new Float32Array([ 1.0, 1.0, 0.0, 0.0]);
   
   var   numStencilBits;
   var   stencilValues = new Uint8Array([
      0x7, // Result of test 0
      0x0, // Result of test 1
      0x2, // Result of test 2
      0xff // Result of test 3.  We need to fill this
           //  value in a run-time
   ]);

   // Set the viewport
   gl.viewport ( 0, 0, esContext.width, esContext.height );

   // Clear the color, depth, and stencil buffers.  At this
   //   point, the stencil buffer will be 0x1 for all pixels
   gl.clear ( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT );

   // Use the program object
   gl.useProgram ( userData.programObject );

   // Load the vertex position
   gl.bindBuffer ( gl.ARRAY_BUFFER, userData.vertexObject );
   gl.vertexAttribPointer ( userData.positionLoc, 3, gl.FLOAT,
                            false, 0, 0 );

   gl.enableVertexAttribArray ( userData.positionLoc );

   // Test 0:
   //
   // Initialize upper-left region.  In this case, the
   //   stencil-buffer values will be replaced because the
   //   stencil test for the rendered pixels will fail the
   //   stencil test, which is
   //
   //        ref   mask   stencil  mask
   //      ( 0x7 & 0x3 ) < ( 0x1 & 0x7 )
   //
   //   The value in the stencil buffer for these pixels will
   //   be 0x7.
   //
   gl.stencilFunc( gl.LESS, 0x7, 0x3 );
   gl.stencilOp( gl.REPLACE, gl.DECR, gl.DECR );
   gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, userData.indexObject );
   gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0 );

   // Test 1:
   //
   // Initialize the upper-right region.  Here, we'll decrement
   //   the stencil-buffer values where the stencil test passes
   //   but the depth test fails.  The stencil test is
   //
   //        ref  mask    stencil  mask
   //      ( 0x3 & 0x3 ) > ( 0x1 & 0x3 )
   //
   //    but where the geometry fails the depth test.  The
   //    stencil values for these pixels will be 0x0.
   //
   gl.stencilFunc( gl.GREATER, 0x3, 0x3 );
   gl.stencilOp( gl.KEEP, gl.DECR, gl.KEEP );
   gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 6 );

   // Test 2:
   //
   // Initialize the lower-left region.  Here we'll increment
   //   (with saturation) the stencil value where both the
   //   stencil and depth tests pass.  The stencil test for
   //   these pixels will be
   //
   //        ref  mask     stencil  mask
   //      ( 0x1 & 0x3 ) == ( 0x1 & 0x3 )
   //
   //   The stencil values for these pixels will be 0x2.
   //
   gl.stencilFunc( gl.EQUAL, 0x1, 0x3 );
   gl.stencilOp( gl.KEEP, gl.INCR, gl.INCR );
   gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 12 );

   // Test 3:
   //
   // Finally, initialize the lower-right region.  We'll invert
   //   the stencil value where the stencil tests fails.  The
   //   stencil test for these pixels will be
   //
   //        ref   mask    stencil  mask
   //      ( 0x2 & 0x1 ) == ( 0x1 & 0x1 )
   //
   //   The stencil value here will be set to ~((2^s-1) & 0x1),
   //   (with the 0x1 being from the stencil clear value),
   //   where 's' is the number of bits in the stencil buffer
   //
   gl.stencilFunc( gl.EQUAL, 0x2, 0x1 );
   gl.stencilOp( gl.INVERT, gl.KEEP, gl.KEEP );
   gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 18 );

   // Since we don't know at compile time how many stecil bits are present,
   //   we'll query, and update the value correct value in the
   //   stencilValues arrays for the fourth tests.  We'll use this value
   //   later in rendering.
   numStencilBits = gl.getParameter( gl.STENCIL_BITS );

   stencilValues[3] = ~(((1 << numStencilBits) - 1) & 0x1) & 0xff;

   // Use the stencil buffer for controlling where rendering will
   //   occur.  We diable writing to the stencil buffer so we
   //   can test against them without modifying the values we
   //   generated.
   gl.stencilMask( 0x0 );

   for ( i = 0; i < NumTests; ++i )
   {
      gl.stencilFunc( gl.EQUAL, stencilValues[i], 0xff );
      gl.uniform4fv( userData.colorLoc, colors[i] );
      gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 24 );
   }

   // Reset stencil (especially mask)
   gl.stencilFunc( gl.ALWAYS, 0, ~0 );
   gl.stencilOp( gl.KEEP, gl.KEEP, gl.KEEP );
   gl.stencilMask( ~0 );
}

function main ( canvas )
{
   var esContext = new ESContext();
   var userData = new UserData();

   esInitContext ( esContext, canvas, { stencil: true } );
   esContext.userData = userData;

   if ( !Init ( esContext ) )
      return 0;

   esRegisterDrawFunc ( esContext, Draw );

   esMainLoop ( esContext );

   return esContext;
}
