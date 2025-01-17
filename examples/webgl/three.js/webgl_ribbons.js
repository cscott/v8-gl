			var container, stats=null;
			var camera, scene, renderer, ribbon, geometry, geometry2, materials = [], ribbons = [],
				parameters, i, i2, h, color, x, y, z, z2, s, n, n2, nribbons, grid;

			var mouseX = 0, mouseY = 0;

			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;

			var postprocessing = { enabled  : true };

			var composer;

			function init(canvas) {

				camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 3000 );
				camera.position.z = 1200;

				scene = new THREE.Scene();
				scene.fog = new THREE.FogExp2( 0x000000, 0.0016 );

				geometry = new THREE.Geometry();
				geometry2 = new THREE.Geometry();

				n = 1000;
				n2 = 2 * n;

				for ( i = -n; i < n; i++ ) {

					i2 = i + n;

					x = i * 1.175;
					y = ( i2 % 2 ) * 5;

					if ( i2 % 2 )  {

						z = 10 * Math.sin( i2 * 0.3 ) * Math.cos( i2 * 0.1 );

					}

					vector = new THREE.Vector3( x, y, z );
					geometry.vertices.push( new THREE.Vertex( vector ) );

					vector = new THREE.Vector3( x, y, z );
					geometry2.vertices.push( new THREE.Vertex( vector ) );

					h = i2 % 2 ? 1 : 0.15;
					if( i2 % 4 <= 2 ) h -= 0.15;

					color = new THREE.Color( 0xffffff );
					color.setHSV( 0.1 , 0, h );
					geometry.colors.push( color );
					geometry2.colors.push( color );

				}

				var tmpRot = new THREE.Matrix4();
				tmpRot.setRotationAxis( new THREE.Vector3( 1, 0, 0 ), Math.PI/2 );

				xgrid = 34;
				ygrid = 15;
				nribbons = xgrid * ygrid;

				c = 0;
				for ( i = 0; i < xgrid; i ++ )
				for ( j = 0; j < ygrid; j ++ ) {

					materials[ c ] = new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: true } );

					ribbon = new THREE.Ribbon( i % 2 ? geometry : geometry2, materials[ c ] );
					ribbon.rotation.x = 0;
					ribbon.rotation.y = Math.PI / 2;
					ribbon.rotation.z = Math.PI;

					x = 40 * ( i - xgrid/2 );
					y = 40 * ( j - ygrid/2 );
					z = 0;
					ribbon.position.set( x, y, z );

					materials[c].color.setHSV( i / xgrid, 0.3 +  0.7 * j / ygrid, 1 );

					ribbon.doubleSided = true;
					ribbon.matrixAutoUpdate = false;

					// manually create local matrix

					ribbon.matrix.setPosition( ribbon.position );
					ribbon.matrixRotationWorld.setRotationFromEuler( ribbon.rotation );

					ribbon.matrix.n11 = ribbon.matrixRotationWorld.n11;
					ribbon.matrix.n12 = ribbon.matrixRotationWorld.n12;
					ribbon.matrix.n13 = ribbon.matrixRotationWorld.n13;

					ribbon.matrix.n21 = ribbon.matrixRotationWorld.n21;
					ribbon.matrix.n22 = ribbon.matrixRotationWorld.n22;
					ribbon.matrix.n23 = ribbon.matrixRotationWorld.n23;

					ribbon.matrix.n31 = ribbon.matrixRotationWorld.n31;
					ribbon.matrix.n32 = ribbon.matrixRotationWorld.n32;
					ribbon.matrix.n33 = ribbon.matrixRotationWorld.n33;

					ribbon.matrix.multiplySelf( tmpRot );

					ribbon.matrix.scale( ribbon.scale );
					ribbon.boundRadiusScale = Math.max( ribbon.scale.x, Math.max( ribbon.scale.y, ribbon.scale.z ) );

					ribbons.push( ribbon );
					scene.add( ribbon );

					c ++;

				}

				scene.matrixAutoUpdate = false;

				//

			    renderer = new THREE.WebGLRenderer( { antialias: false, canvas: canvas } );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.autoClear = false;
				renderer.setClearColor( scene.fog.color, 1 );

				//

				var renderModel = new THREE.RenderPass( scene, camera );
				var effectBloom = new THREE.BloomPass( 1.0 );
				var effectScreen = new THREE.ShaderPass( THREE.ShaderExtras[ "screen" ] );

				effectScreen.renderToScreen = true;

				composer = new THREE.EffectComposer( renderer );

				composer.addPass( renderModel );
				composer.addPass( effectBloom );
				composer.addPass( effectScreen );

			}
                        function initWithStats(canvas) {
			        init(canvas);
				stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';
				stats.domElement.style.zIndex = 100;
				document.body.appendChild(stats.domElement);
			}

			function onDocumentMouseMove( event ) {

				mouseX = event.clientX - windowHalfX;
				mouseY = event.clientY - windowHalfY;

			}

			function onDocumentTouchStart( event ) {

				if ( event.touches.length == 1 ) {

					event.preventDefault();

					mouseX = event.touches[ 0 ].pageX - windowHalfX;
					mouseY = event.touches[ 0 ].pageY - windowHalfY;

				}
			}

			function onDocumentTouchMove( event ) {

				if ( event.touches.length == 1 ) {

					event.preventDefault();

					mouseX = event.touches[ 0 ].pageX - windowHalfX;
					mouseY = event.touches[ 0 ].pageY - windowHalfY;

				}

			}

			//

			function animate() {

				requestAnimationFrame( animate );

				render();
			        if (stats) stats.update();

			}

			function render() {

				var time = new Date().getTime() * 0.00005;

				camera.position.x += ( mouseX - camera.position.x ) * 0.036;
				camera.position.y += ( - mouseY - camera.position.y ) * 0.036;

				camera.lookAt( scene.position );

				for ( i = -n; i < n; i ++ ) {

					i2 = i + n;

					z  =  10 * Math.sin( i2 * 0.1 + time*30 );
					z2 =  20 * Math.cos( Math.sin( i2 * 0.1 + time * 20 ) );

					geometry.vertices[ i2 ].position.z = z;
					geometry2.vertices[ i2 ].position.z = z2;

				}

				geometry.__dirtyVertices = true;
				geometry2.__dirtyVertices = true;

				for( i = 0; i < nribbons; i++ ) {

					h = ( 360 * ( i / nribbons + time ) % 360 ) / 360;
					materials[ i ].color.setHSV( h, 0.5 + 0.5 * ( i % 20 / 20 ), 1 );

				}

				renderer.clear();
				composer.render( 0.1 );

			}
