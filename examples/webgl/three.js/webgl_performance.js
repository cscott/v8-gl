			var container, stats=null;

			var camera, scene, renderer;

			var mesh, zmesh, lightMesh, geometry;

			var mouseX = 0, mouseY = 0;

			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;

			function init( canvas ) {

				camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
				camera.position.z = 3200;

				scene = new THREE.Scene();

				var material = new THREE.MeshNormalMaterial( { shading: THREE.SmoothShading } );

				var loader = new THREE.JSONLoader();
				loader.load( { model: 'obj/Suzanne.js', callback: function ( geometry ) {

					geometry.computeVertexNormals();

					for ( var i = 0; i < 5000; i ++ ) {

						var mesh = new THREE.Mesh( geometry, material );

						mesh.position.x = Math.random() * 10000 - 5000;
						mesh.position.y = Math.random() * 10000 - 5000;
						mesh.position.z = Math.random() * 10000 - 5000;
						mesh.rotation.x = Math.random() * 360 * ( Math.PI / 180 );
						mesh.rotation.y = Math.random() * 360 * ( Math.PI / 180 );
						mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50 + 100;
						mesh.matrixAutoUpdate = false;
						mesh.updateMatrix();

						//mesh.frustumCulled = false;

						scene.add( mesh );

					}

				} } );

			        renderer = new THREE.WebGLRenderer( { preserveDrawingBuffer: true, canvas: canvas } );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.sortObjects = false;
				renderer.autoClearColor = false;
			}
                        function initWithStats(canvas) {
			        init(canvas);
				stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';
				stats.domElement.style.zIndex = 100;
				document.body.appendChild(stats.domElement);
			}

			function onDocumentMouseMove(event) {

				mouseX = ( event.clientX - windowHalfX ) * 10;
				mouseY = ( event.clientY - windowHalfY ) * 10;

			}

			//

			function animate() {

				requestAnimationFrame( animate );

				render();
			        if (stats) stats.update();

			}

			function render() {

				camera.position.x += ( mouseX - camera.position.x ) * .05;
				camera.position.y += ( - mouseY - camera.position.y ) * .05;

				camera.lookAt( scene.position );

				renderer.render( scene, camera );

			}
