'use strict';

var controls, camera, scene, renderer, material, mesh;
var cameraZoomDirection = new THREE.Vector3();
var yRotatorPreviousVal = 180;

var xAxis = new THREE.Vector3( 1, 0, 0 ),
	yAxis = new THREE.Vector3( 0, 1, 0 ),
	zAxis = new THREE.Vector3( 0, 0, 1 );

var playing = false;

var globalRequestAnimationID,
	animating = false;

var lastChangedTrait = 0;

var simmental = (function () {

	'use strict';

	var spinner;

	$( document ).ready(function () {

		if ( screenfull.enabled ) {
		    document.addEventListener(screenfull.raw.fullscreenchange, function () {
		    	$( '#fullscreenButton' ).toggleClass( 'btn-warning transparent-controls' );
		    	$( '#fullscreenButton > i' ).toggleClass( 'fa-expand fa-compress' );
		    });
		}

		init();
		animate();

		function rotationReset() {
			//controls.reset();
			mesh.rotation.x = 0;
			mesh.rotation.y = 0;
			mesh.rotation.z = 0;
			$( '#yRotator' ).val( 180 );
			yRotatorPreviousVal = 180;
		}

		function cameraZoomReset() {
			// 135 is an optimal viewing camera distance
			camera.position.z = 95;
			camera.fov = 40;
			camera.updateProjectionMatrix();
		}

		function playPause() {
			$( '#rotateButton > i' ).toggleClass( 'fa-play fa-pause' );
			playing = !playing;
		}

		function toggleFullscreen() {
			if ( screenfull.enabled ) {
		        screenfull.toggle();
			}			
		}

		function makeZoomFunction( multiplier ) {
			return function () {
				cameraZoomDirection
					.subVectors( camera.position, mesh.position )
					.normalize()
					.multiplyScalar( multiplier );
				camera.position.add( cameraZoomDirection );
				camera.updateProjectionMatrix();
			};
		}

		function guardedZoomIn( zoomFunc ) {
			return function () {
				var minZoomDistance = 20;
				var dist = cameraZoomDirection.subVectors( camera.position, mesh.position ).length();
				if ( dist > minZoomDistance ) {
					zoomFunc();	
				}
			};
		}

		$( '#cameraZoomResetButton' ).on( 'click', cameraZoomReset );
		$( '#rotationResetButton' ).on( 'click', rotationReset );
		$( '#rotateButton' ).on( 'click', playPause );
		$( '#fullscreenButton' ).on( 'click', toggleFullscreen );
		$( '#zoomOutButton' ).on( 'click', makeZoomFunction( 5 ) );
		$( '#zoomInButton' ).on( 'click', guardedZoomIn( makeZoomFunction( -5 ) ));

		$( '#rotateLeftButton' ).on( 'click', function() {
			mesh.rotation.y += 0.1;
		}); 
		$( '#rotateRightButton' ).on( 'click', function() {
			mesh.rotation.y -= 0.1;
		});

		require(['js/intl', 'js/defaultTraitAttributes'], function( intl, defaultTraitAttributes ) {

			var morphsStartAt = [];
			var morphsCountPerTrait = [];
			var offsetAccumulator = 0;

			var traitCount = Object.keys(defaultTraitAttributes).length;

			for (var i = 0; i < traitCount; i++) {
    			morphsStartAt[i] = offsetAccumulator;
    			morphsCountPerTrait[i] = defaultTraitAttributes[i].morphsList.length;
    			offsetAccumulator += defaultTraitAttributes[i].morphsList.length;
			};

			// console.log(morphsStartAt);
			// console.log(morphsCountPerTrait);

			function createSliders() {
				var	templateContext = { features: intl['Czech']['bodyFeatures'] },
					handlebarsTemplateName = 'slider',
					renderedTemplateHtml = Handlebars.templates[ handlebarsTemplateName ]( templateContext );

				$('#sliders').append( renderedTemplateHtml );

				function singleSliderMorpher( traitIndex, defaultModelTraitValue, selectedRangeValue ) {
					// selectedRangeValue is between 1 and 9

					function resetCurrentTraitMorphs() {
						for (var i = 0; i < morphsCountPerTrait[ traitIndex ]; i++) {
							mesh.morphTargetInfluences[ morphsStartAt[ traitIndex ] + i ] = 0;
						}
					}

					var dml = defaultTraitAttributes[traitIndex].morphsList;

					//console.log(mesh.morphTargetInfluences);
					//console.log(selectedRangeValue + ' ' + defaultModelTraitValue);

					if ( selectedRangeValue === defaultModelTraitValue ) {
						resetCurrentTraitMorphs();
					} else {
						var positionInsideMorphsList = dml.indexOf( selectedRangeValue );

					 	if ( positionInsideMorphsList !== -1 ) {
					 		resetCurrentTraitMorphs();
							mesh.morphTargetInfluences[ morphsStartAt[ traitIndex ] + positionInsideMorphsList ] = 1;
						} else {
							resetCurrentTraitMorphs();

							// important to set indexes to -1, Default
							// for cases that Default it the Leftmost or Rightmost index
							var leftIndex = -1;
							var rightIndex = -1;
							var reverseI;

							for (var i = 0; i < dml.length; i++) {
								reverseI = (dml.length - 1) - i;

								if ( dml[i] < selectedRangeValue ) {
									leftIndex = i;
								}

								if ( selectedRangeValue < dml[reverseI] ) {
									rightIndex = reverseI;
								}
							}

							if ( defaultModelTraitValue < selectedRangeValue 
								&& dml[leftIndex] < defaultModelTraitValue ) {
								leftIndex = -1; //sentinel value signifying that Default is used as Left
							}

							if ( selectedRangeValue < defaultModelTraitValue
								&& defaultModelTraitValue < dml[rightIndex] ) {
								rightIndex = -1; //sentinel value signifying that Default is used as Right
							}

							if ( leftIndex !== -1 ) {
								if ( rightIndex === -1 ) {
									mesh.morphTargetInfluences[ morphsStartAt[ traitIndex ] + leftIndex ] = 
										(defaultModelTraitValue - selectedRangeValue) / (defaultModelTraitValue - dml[leftIndex]);
								} else {
									mesh.morphTargetInfluences[ morphsStartAt[ traitIndex ] + leftIndex ] = 
										(dml[rightIndex] - selectedRangeValue) / (dml[rightIndex] - dml[leftIndex]);
								}
							}
							if ( rightIndex !== -1 ) {
								if ( leftIndex === -1 ) {
									mesh.morphTargetInfluences[ morphsStartAt[ traitIndex ] + rightIndex ] =
										(selectedRangeValue - defaultModelTraitValue) / (dml[rightIndex] - defaultModelTraitValue);
								} else {
									mesh.morphTargetInfluences[ morphsStartAt[ traitIndex ] + rightIndex ] =
										(selectedRangeValue - dml[leftIndex]) / (dml[rightIndex] - dml[leftIndex]);
								}
							}
						}
					}
				}
				/*
				function singleSliderMorpher( traitIndex, defaultModelTraitValue, rangeValue ) {
					// rangeValue is between 0 and 2

					var firstMorphIndex  = traitIndex * 2,
						secondMorphIndex = traitIndex * 2 + 1;

					switch ( defaultModelTraitValue ) {
						case 1:
							if ( rangeValue <= 1 ) {
								mesh.morphTargetInfluences[ firstMorphIndex ] = rangeValue;
								mesh.morphTargetInfluences[ secondMorphIndex ] = 0;
							} else {
								mesh.morphTargetInfluences[ firstMorphIndex ] = 1 - (rangeValue - 1);
								mesh.morphTargetInfluences[ secondMorphIndex ] = rangeValue - 1;
							}
							break;
						case 5:
							if ( rangeValue <= 1 ) {
								mesh.morphTargetInfluences[ firstMorphIndex ] = 1 - rangeValue;
								mesh.morphTargetInfluences[ secondMorphIndex ] = 0;
							} else {
								mesh.morphTargetInfluences[ firstMorphIndex ] = 0;
								mesh.morphTargetInfluences[ secondMorphIndex ] = rangeValue - 1;
							}
							break;
						case 9:						
							if ( rangeValue <= 1 ) {
								mesh.morphTargetInfluences[ firstMorphIndex ] = 1 - rangeValue;
								mesh.morphTargetInfluences[ secondMorphIndex ] = rangeValue;
							} else {
								mesh.morphTargetInfluences[ firstMorphIndex ] = 0;
								mesh.morphTargetInfluences[ secondMorphIndex ] = 2 - rangeValue;
							}
							break;
					}
				}
				*/

				function slideEventHandlerMaker( index ) {
					var defaultTrait = ( defaultTraitAttributes[index].trait === undefined ) ? 5 : defaultTraitAttributes[index].trait;

					$( '#morph' + index ).val( defaultTrait );
					$( '#morph' + index + 'Span' ).text( defaultTrait );
					return function ( slideEvent ) {
						// `this` refers to the changed range input DOM element
						
						if ( lastChangedTrait !== index ) {
							// reset last modified trait to `Default Value`
							$( '#morph' + lastChangedTrait ).val( defaultTraitAttributes[ lastChangedTrait ].trait );
							$( '#morph' + lastChangedTrait ).trigger( 'change' );
							lastChangedTrait = index;
						}

						$( '#morph' + index + 'Span' ).text( slideEvent.target.value );

						// (slideEvent.target.value - 1) / 4
						singleSliderMorpher( index, defaultTrait, parseInt( slideEvent.target.value ) );
					};
				}

				function lookAtBodyFeatureHandlerMaker( index ) {
					return function() {
						rotationReset();
						mesh.rotation.y = defaultTraitAttributes[index].meshRotation;
						camera.position.z = defaultTraitAttributes[index].cameraZoom;						
						camera.updateProjectionMatrix();
					};
				}

				for ( var i = 0; i < intl['Czech']['bodyFeatures'].length; i++ ) {
					$( '#morph' + i ).on('change input', slideEventHandlerMaker(i));
					$( '#lookAtBodyFeature' + i ).on('click', lookAtBodyFeatureHandlerMaker(i));
				}

				// function setAllSlidersAtOnce( masterValue ) {
				// 	for ( var i = 0; i < intl['Czech']['bodyFeatures'].length; i++ ) {
				// 		$( '#morph' + i ).val( masterValue );
				// 		$( '#morph' + i ).trigger( 'change' );
				// 	}
				// }

				function setAllSlidersToDefault() {
					for ( var i = 0; i < intl['Czech']['bodyFeatures'].length; i++ ) {
						$( '#morph' + i ).val( defaultTraitAttributes[ i ].trait );
						$( '#morph' + i ).trigger( 'change' );
					}
				}

				$( '#resetTraitSliders' ).on('click', function () {
					setAllSlidersToDefault();
				});
			}

			createSliders();

			function translate( bodyFeatures ) {
				for (var i = 0; i < bodyFeatures.length; i++) {
					$( '#bodyFeatureLabel' + i ).text( bodyFeatures[i] );
				}
			}

			function languageChanger( language ) {
				return function () {
					translate( intl[language]['bodyFeatures'] );
					$( '#bodyFeaturesPanelTitle' ).text( intl[language]['bodyFeaturesPanelTitle'] );
					$( '#currentLanguage' ).text( intl[language]['language'] );
				}
			}

			var supportedLanguages = Object.keys(intl);
			var langNamePairs = [];
			for (var i = 0; i < supportedLanguages.length; i++) {
				langNamePairs[i] = {
					englishName: supportedLanguages[i],
					localName: intl[supportedLanguages[i]]['language']
				};
			}

			function createListOfLanguages( ls ) {
				var	templateContext = { languages: ls },
					handlebarsTemplateName = 'langs',
					renderedTemplateHtml = Handlebars.templates[ handlebarsTemplateName ]( templateContext );

				$('#languageButtonLanguages').append( renderedTemplateHtml );		
			}

			createListOfLanguages( langNamePairs );
			
			for (var i = 0; i < supportedLanguages.length; i++) {
				$( '#lang' + supportedLanguages[i] ).on( 'click', languageChanger( supportedLanguages[i] ));
			}
		});

		function rotateCameraX( degreesDelta ) {
			var angle = degreesDelta * Math.PI / 180;
			mesh.rotateX(angle);
			// var quaternion = new THREE.Quaternion();
			// quaternion.setFromAxisAngle( xAxis, angle );
			// camera.position = camera.position.applyQuaternion( quaternion );
		}

		function rotateCameraY( degreesDelta ) {
			var angle = degreesDelta * Math.PI / 180;
			mesh.rotateY(angle);
		}

		function rotateCameraZ( degreesDelta ) {
			var angle = degreesDelta * Math.PI / 180;
			mesh.rotateZ(angle);
		}

		// need `input` event for browsers that don't fire event on slider
		// movement but on release
		$( '#yRotator' ).on( 'change input', function ( event ) {
			rotateCameraY( yRotatorPreviousVal - event.target.value );
			yRotatorPreviousVal = event.target.value;
		} );

		function addSpinner() {
			var opts = {
				lines    : 12,        // The number of lines to draw
				length   : 20,        // The length of each line
				width    : 10,        // The line thickness
				radius   : 30,        // The radius of the inner circle
				corners  : 1,         // Corner roundness (0..1)
				rotate   : 0,         // The rotation offset
				direction: 1,         // 1: clockwise, -1: counterclockwise
				color    : '#000',    // #rgb or #rrggbb or array of colors
				speed    : 1.8,       // Rounds per second
				trail    : 60,        // Afterglow percentage
				shadow   : false,     // Whether to render a shadow
				hwaccel  : true,      // Whether to use hardware acceleration
				className: 'spinner', // The CSS class to assign to the spinner
				zIndex   : 2e9,       // The z-index (defaults to 2000000000)
				top      : '40%',     // Top position relative to parent in px
				left     : '50%'      // Left position relative to parent in px
			};

			$( '#loadingContainer' ).height( window.innerHeight / 2 );
			var domTarget = document.getElementById( 'loadingContainer' );
			return new Spinner( opts ).spin( domTarget );
		}

		spinner = addSpinner();
	});

	$( window ).resize(function () {
		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	});

	$( window ).blur(function() {
  		cancelAnimationFrame( globalRequestAnimationID );
  		globalRequestAnimationID = false;
	});

	$( window ).focus(function() {
		if (globalRequestAnimationID === false) {
			animate();
		}
	});

	function initRenderer( renderer ) {
		var backgroundColor = 0xffffff;
		renderer.setClearColor( backgroundColor );
	    renderer.setSize( window.innerWidth, window.innerHeight );
	    $( '#container' ).append( renderer.domElement );
	}

	function setCameraControls( controls ) {
		// These variables set the camera behaviour and sensitivity.
		controls.rotateSpeed = 5.0;
		controls.zoomSpeed = 5;
		controls.panSpeed = 2;
		controls.noZoom = false;
		controls.noPan = false;
		controls.staticMoving = true;
		controls.dynamicDampingFactor = 0.3;
	}

	function setupLights() {
		var lightColor = 0xf2f2ff,
			lightIntensity = 0.6;

		// var light = new THREE.DirectionalLight( lightColor, lightIntensity );
		// light.position.set( 0, 1, 0 ).normalize();
		// scene.add( light );
		// var light = new THREE.DirectionalLight( lightColor, lightIntensity );
		// light.position.set( 0, -1, 0 ).normalize();
		// scene.add( light );
		// var light = new THREE.DirectionalLight( lightColor, lightIntensity );
		// light.position.set( 1, 0, 0 ).normalize();
		// scene.add( light );
		// var light = new THREE.DirectionalLight( lightColor, lightIntensity );
		// light.position.set( -1, 0, 1 ).normalize();
		// scene.add( light );
		var light = new THREE.DirectionalLight( lightColor, lightIntensity );
		light.position.set( 0, 0, 1 ).normalize();
		scene.add( light );
		// var light = new THREE.DirectionalLight( lightColor, lightIntensity );
		// light.position.set( 0, 0, -1 ).normalize();
		// scene.add( light );

		var ambientLight = new THREE.AmbientLight( 0x7E7E85 );
		scene.add(ambientLight);
	}

	function init() {
	    scene = new THREE.Scene();

	    var VIEW_ANGLE = 40,
	        ASPECT_RATIO = window.innerWidth / window.innerHeight,
	        NEAR = 1,
	        FAR = 2000;

	    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT_RATIO, NEAR, FAR );
	    camera.position.z = 95;
		scene.add( camera );

		setupLights();

	    THREE.ImageUtils.loadTexture( 'model/texture.jpg', undefined, function ( texture ) {
		    texture.needsUpdate = true;
		    texture.magFilter = THREE.LinearFilter;
		    texture.minFilter = THREE.NearestMipMapLinearFilter;
			THREE.ImageUtils.loadTexture( 'model/normal_bump.jpg', undefined, function ( normalMapImage ) {
				var material = new THREE.MeshPhongMaterial( {
					map: texture,
					normalMap: normalMapImage,
					//shading: THREE.SmoothShading,
					//bumpScale: 4,
					morphTargets: true
				} );
				
				var loader = new THREE.JSONLoader();
				
				loader.load( 'model/cow.json', function ( geometry ) {
					spinner.stop();
					$( '#loadingContainer' ).remove();
					$( 'div.invisible' ).removeClass( 'invisible' );

					//mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0x606060 } ) );
					mesh = new THREE.Mesh( geometry, material );
				    scene.add( mesh );
				});
			});
	    });

		//var matParams = { morphTargets: true, color: 0x000000, wireframe: true };
	    //material = new THREE.MeshBasicMaterial({ morphTargets: false, map: texture });

		// By default, bind position to attribute index 0. In WebGL, attribute 0
		// should always be used to avoid potentially expensive emulation.
		// material.index0AttributeName = 'position';
		
		renderer = Detector.webgl ? new THREE.WebGLRenderer( { antialias: true } ) : new THREE.CanvasRenderer();
		initRenderer( renderer );

		//controls = new THREE.TrackballControls( camera, renderer.domElement );
	    //setCameraControls( controls );				
	}

	function render() {
		if (playing === true) {
		    mesh.rotation.y += 0.002;
		}
		//controls.update();
		camera.lookAt( scene.position );
	    renderer.render( scene, camera );
	}

	function animate() {
	    // note: three.js includes requestAnimationFrame shim
	    globalRequestAnimationID = requestAnimationFrame( animate );
	    render();
	}

}());