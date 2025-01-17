//
// Book:      OpenGL(R) ES 2.0 Programming Guide
// Authors:   Aaftab Munshi, Dan Ginsburg, Dave Shreiner
// ISBN-10:   0321502795
// ISBN-13:   9780321502797
// Publisher: Addison-Wesley Professional
// URLs:      http://safari.informit.com/9780321563835
//            http://www.opengles-book.com
//

// ParticleSystem.c
//
//    This is an example that demonstrates rendering a particle system
//    using a vertex shader and point sprites.
//
const  NUM_PARTICLES = 2000;
const  PARTICLE_SIZE = 7;

UserData = function()
{
   // Handle to a program object
   this.programObject = 0;

   // Attribute locations
   this.lifetimeLoc = 0;
   this.startPositionLoc = 0;
   this.endPositionLoc = 0;

   // Uniform location
   this.timeLoc = 0;
   this.colorLoc = 0;
   this.centerPositionLoc = 0;
   this.samplerLoc = 0;

   // Texture handle
   this.textureId = 0;

   // Particle vertex data
   this.particleData = new Float32Array(NUM_PARTICLES * PARTICLE_SIZE);

   // Current time
   this.time = 0;

   // VBO
   this.vertexObject = 0;
   this.vertexBytesPerElement = 0;

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
   var i;

   var vShaderStr =
      'uniform float u_time;		                    \n\
       uniform vec3 u_centerPosition;                       \n\
       attribute float a_lifetime;                          \n\
       attribute vec3 a_startPosition;                      \n\
       attribute vec3 a_endPosition;                        \n\
       varying float v_lifetime;                            \n\
       void main()                                          \n\
       {                                                    \n\
         if ( u_time <= a_lifetime )                        \n\
         {                                                  \n\
           gl_Position.xyz = a_startPosition +              \n\
                             (u_time * a_endPosition);      \n\
           gl_Position.xyz += u_centerPosition;             \n\
           gl_Position.w = 1.0;                             \n\
         }                                                  \n\
         else                                               \n\
            gl_Position = vec4( -1000, -1000, 0, 0 );       \n\
         v_lifetime = 1.0 - ( u_time / a_lifetime );        \n\
         v_lifetime = clamp ( v_lifetime, 0.0, 1.0 );       \n\
         gl_PointSize = ( v_lifetime * v_lifetime ) * 40.0; \n\
       }';
   var fShaderStr =
      'precision mediump float;                             \n\
       uniform vec4 u_color;		                    \n\
       varying float v_lifetime;                            \n\
       uniform sampler2D s_texture;                         \n\
       void main()                                          \n\
       {                                                    \n\
         vec4 texColor;                                     \n\
         texColor = texture2D( s_texture, gl_PointCoord );  \n\
         gl_FragColor = vec4( u_color ) * texColor;         \n\
         gl_FragColor.a *= v_lifetime;                      \n\
       }                                                    \n';
   // Load the shaders and get a linked program object
   userData.programObject = esLoadProgram ( vShaderStr, fShaderStr );

   // Get the attribute locations
   userData.lifetimeLoc = gl.getAttribLocation ( userData.programObject, "a_lifetime" );
   userData.startPositionLoc = gl.getAttribLocation ( userData.programObject, "a_startPosition" );
   userData.endPositionLoc = gl.getAttribLocation ( userData.programObject, "a_endPosition" );

   // Get the uniform locations
   userData.timeLoc = gl.getUniformLocation ( userData.programObject, "u_time" );
   userData.centerPositionLoc = gl.getUniformLocation ( userData.programObject, "u_centerPosition" );
   userData.colorLoc = gl.getUniformLocation ( userData.programObject, "u_color" );
   userData.samplerLoc = gl.getUniformLocation ( userData.programObject, "s_texture" );

   gl.clearColor ( 0.0, 0.0, 0.0, 1.0 );

   // Fill in particle data array
   for ( i = 0; i < NUM_PARTICLES; i++ )
   {
      // Lifetime of particle
      userData.particleData[i * PARTICLE_SIZE + 0] = Math.random();

      // End position of particle
      userData.particleData[i * PARTICLE_SIZE + 1] = Math.random() * 2 - 1;
      userData.particleData[i * PARTICLE_SIZE + 2] = Math.random() * 2 - 1;
      userData.particleData[i * PARTICLE_SIZE + 3] = Math.random() * 2 - 1;

      // Start position of particle
      userData.particleData[i * PARTICLE_SIZE + 4] = Math.random() * 0.25 - 0.125;
      userData.particleData[i * PARTICLE_SIZE + 5] = Math.random() * 0.25 - 0.125;
      userData.particleData[i * PARTICLE_SIZE + 6] = Math.random() * 0.25 - 0.125;
   }

   userData.vertexObject = gl.createBuffer();
   gl.bindBuffer( gl.ARRAY_BUFFER, userData.vertexObject );
   gl.bufferData( gl.ARRAY_BUFFER, userData.particleData, gl.STATIC_DRAW );
   userData.vertexBytesPerElement = userData.particleData.BYTES_PER_ELEMENT;

   // Initialize time to cause reset on first update
   userData.time = 1.0;

   userData.textureId = gl.createTexture();
   userData.textureId.image = new Image();
   userData.textureId.image.onload = function () {
       LoadTexture( userData.textureId );
   }
   userData.textureId.image.src = "smoke.gif";

   return true;
}

///
//  Update time-based variables
//
function Update ( esContext,  deltaTime )
{
   var userData = esContext.userData;

   userData.time += deltaTime * 0.001125;
   console.log(userData.time);

   if ( userData.time >= 1.0 )
   {
      var centerPos = new Float32Array(3);
      var color = new Float32Array(4);

      userData.time = 0.0;

      // Pick a new start location and color
      centerPos[0] = Math.random() - 0.5;
      centerPos[1] = Math.random() - 0.5;
      centerPos[2] = Math.random() - 0.5;

      gl.uniform3fv ( userData.centerPositionLoc, centerPos );

      // Random color
      color[0] = Math.random() * 0.5 + 0.5;
      color[1] = Math.random() * 0.5 + 0.5;
      color[2] = Math.random() * 0.5 + 0.5;
      color[3] = 1.0;

      gl.uniform4fv ( userData.colorLoc, color );
   }

   // Load uniform time variable
   gl.uniform1f ( userData.timeLoc, userData.time );
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

   // Load the vertex attributes
   gl.bindBuffer( gl.ARRAY_BUFFER, userData.vertexObject );
   gl.vertexAttribPointer ( userData.lifetimeLoc, 1, gl.FLOAT,
                           false, PARTICLE_SIZE * userData.vertexBytesPerElement,
                           0 );

   gl.vertexAttribPointer ( userData.endPositionLoc, 3, gl.FLOAT,
                           false, PARTICLE_SIZE * userData.vertexBytesPerElement,
                           1 * userData.vertexBytesPerElement );

   gl.vertexAttribPointer ( userData.startPositionLoc, 3, gl.FLOAT,
                           false, PARTICLE_SIZE * userData.vertexBytesPerElement,
                           4 * userData.vertexBytesPerElement );

   gl.enableVertexAttribArray ( userData.lifetimeLoc );
   gl.enableVertexAttribArray ( userData.endPositionLoc );
   gl.enableVertexAttribArray ( userData.startPositionLoc );

   // Blend particles
   gl.enable ( gl.BLEND );
   gl.blendFunc ( gl.SRC_ALPHA, gl.ONE );

   // Bind the texture
   gl.activeTexture ( gl.TEXTURE0 );
   gl.bindTexture ( gl.TEXTURE_2D, userData.textureId );
   gl.enable ( gl.TEXTURE_2D );

   // Set the sampler texture unit to 0
   gl.uniform1i ( userData.samplerLoc, 0 );

   gl.drawArrays( gl.POINTS, 0, NUM_PARTICLES );

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
   esRegisterUpdateFunc ( esContext, Update );

   esMainLoop ( esContext );

   return esContext;
}
