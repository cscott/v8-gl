function LoadShader(type, shaderSrc) {

   // Create the shader object
   var shader = Gles.createShader ( type );

   if ( shader == 0 )
       return 0;

   // Load the shader source
   Gles.shaderSource ( shader, shaderSrc );

   // Compile the shader
   Gles.compileShader ( shader );

   // Check the compile status
   var compiled = Gles.getShaderiv ( shader, Gles.COMPILE_STATUS );

   if ( !compiled )
   {
       // Something went wrong during compilation; get the error
       var error = Gles.getShaderInfoLog(shader);
       Gles.deleteShader(shader);
       return 0;
   }

   return shader;
}


function Init(es) {
    es.userData = {};

    var vShaderStr =
	"attribute vec4 vPosition;    \n" +
	"void main()                  \n" +
	"{                            \n" +
	"   gl_Position = vPosition;  \n" +
	"}                            \n";
    var fShaderStr =
	"precision mediump float;\n" +
	"void main()                                  \n" +
	"{                                            \n" +
	"  gl_FragColor = vec4 ( 1.0, 0.0, 0.0, 1.0 );\n" +
	"}                                            \n";
    var vertexShader = LoadShader( Gles.VERTEX_SHADER, vShaderStr );
    var fragmentShader = LoadShader( Gles.FRAGMENT_SHADER, fShaderStr );

    if (!vertexShader || !fragmentShader)
	return false;

    programObject = Gles.createProgram();
    if (programObject == 0)
	return false;

    Gles.attachShader( programObject, vertexShader );
    Gles.attachShader( programObject, fragmentShader );

    // Bind vPosition to attribute 0
    Gles.bindAttribLocation ( programObject, 0, "vPosition" );

    // Link the program
    Gles.linkProgram ( programObject );

    // Check the link status
    var linked = Gles.getProgramiv (programObject, Gles.LINK_STATUS);
    if (!linked) {
		// something went wrong with the link
		var error = Gles.getProgramInfoLog (programObject);

		Gles.deleteProgram(programObject);
		Gles.deleteProgram(fragmentShader);
		Gles.deleteProgram(vertexShader);

		return false;
    }

    es.userData.programObject = programObject;

    // set up the clear color to clear to transparent black
    Gles.clearColor (0, 0, 0, 0);
    return true;
}

// Actually draw the triangle, using the program created in init()
function Draw(es) {
    var vertices = [  0.0,  0.5,  0.0,
		      -0.5, -0.5,  0.0,
		      0.5, -0.5,  0.0  ];

    // Set up the viewport
    Gles.viewport(0, 0, es.width, es.height);

    // Clear the color buffer
    Gles.clear(Gles.COLOR_BUFFER_BIT);

    // Use the program object we created in init()
    Gles.useProgram(es.userData.programObject);

    // Load the vertex data
    Gles.vertexAttribPointer(0, 3, Gles.FLOAT, false, 0, vertices);
    Gles.enableVertexAttribArray(0);

    // Do the draw, as triangles
    Gles.drawArrays(Gles.TRIANGLES, 0, 3);
}


function main() {
    es = Glesutil.initContext();
    es.createWindow("Hello Triangle", 320, 240, es.WINDOW_RGB);
    if ( !Init(es) ) {
	return 0;
    }
    log(es.width);
    log(es.height);

    es.registerDrawFunc( Draw );

    es.mainLoop();
}
main();
