
			var container, stats=null;

			var camera, scene, group, renderer;

			function init(canvas) {

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
				camera.position.y = 200;

				scene = new THREE.Scene();

				var light, object, material;

				scene.add( new THREE.AmbientLight( 0x404040 ) );

				light = new THREE.DirectionalLight( 0xffffff, 1 );
				light.position.z = 1;
				scene.add( light );

				material = [
					new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/UV.jpg' ) } ),
					new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true, opacity: 0.1 } )
				];

				group = new THREE.Object3D();
				scene.add( group );

				object = new THREE.Mesh( new THREE.CubeGeometry( 100, 100, 100, 4, 4, 4 ), material );
				object.position.x = - 200;
				object.position.z = 200;
				group.add( object );


				object = new THREE.Mesh( new THREE.CylinderGeometry( 25, 75, 100, 40, 5 ), material );
				object.position.z = 200;
				group.add( object );

				object = new THREE.Mesh( new THREE.IcosahedronGeometry( 2 ), material );
				object.position.x = 200;
				object.position.z = 200;
				object.scale.x = object.scale.y = object.scale.z = 75;
				group.add( object );

				object = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 4, 4 ), material );
				object.position.x = - 200;
				group.add( object );

				object = new THREE.Mesh( new THREE.SphereGeometry( 75, 20, 10 ), material );
				group.add( object );

				var points = [];

				for ( var i = 0; i < 50; i ++ ) {

					points.push( new THREE.Vector3( Math.sin( i * 0.2 ) * 15 + 50, 0, ( i - 5 ) * 2 ) );

				}

				object = new THREE.Mesh( new THREE.LatheGeometry( points, 20 ), material );
				object.position.x = 200;
				group.add( object );

				object = new THREE.Mesh( new THREE.TorusGeometry( 50, 20, 20, 20 ), material );
				object.position.x = - 200;
				object.position.z = - 200;
				group.add( object );

				object = new THREE.Mesh( new THREE.TorusKnotGeometry( 50, 10, 50, 20 ), material );
				object.position.z = - 200;
				group.add( object );

				object = new THREE.Axes();
				object.position.x = 200;
				object.position.z = - 200;
				object.scale.x = object.scale.y = object.scale.z = 0.5;
				group.add( object );

			        renderer = new THREE.WebGLRenderer({canvas:canvas});
				//renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setSize( canvas.width, canvas.height );
			}
                        function initWithStats(canvas) {
			        init(canvas);
				stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';
				document.body.appendChild(stats.domElement);
			}


			//

			function animate() {

				requestAnimationFrame( animate );

				render();
			        if (stats) stats.update();

			}

			function render() {

				var timer = new Date().getTime() * 0.0001;

				camera.position.x = Math.cos( timer ) * 800;
				camera.position.z = Math.sin( timer ) * 800;
				camera.lookAt( scene.position );

				for ( var i = 0, l = group.children.length; i < l; i++ ) {

					var object = group.children[ i ];

					object.rotation.x += 0.01;
					object.rotation.y += 0.005;

				}

				renderer.render( scene, camera );

			}
