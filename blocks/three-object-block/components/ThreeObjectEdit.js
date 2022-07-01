import * as THREE from 'three';
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
	OrthographicCamera,
	PerspectiveCamera,
	OrbitControls,
	useAnimations,
} from '@react-three/drei';
import { GLTFAudioEmitterExtension } from 'three-omi';

function ThreeObject( props ) {
	const [ url, set ] = useState( props.url );
	useEffect( () => {
		setTimeout( () => set( props.url ), 2000 );
	}, [] );
	const [ listener ] = useState( () => new THREE.AudioListener() );

	useThree( ( { camera } ) => {
		camera.add( listener );
	} );

	const { scene, animations } = useLoader( GLTFLoader, url, ( loader ) => {
		loader.register(
			( parser ) => new GLTFAudioEmitterExtension( parser, listener )
		);
	} );

	const { actions } = useAnimations( animations, scene );

	const animationList = props.animations ? props.animations.split( ',' ) : '';
	useEffect( () => {
		if ( animationList ) {
			animationList.forEach( ( name ) => {
				if ( Object.keys( actions ).includes( name ) ) {
					actions[ name ].play();
				}
			} );
		}
	}, [] );

	scene.position.set( 0, props.positionY, 0 );
	scene.rotation.set( 0, props.rotationY, 0 );
	scene.scale.set( props.scale, props.scale, props.scale );
	return <primitive object={ scene } />;
}

export default function ThreeObjectEdit( props ) {
	return (
		<>
			<Canvas
				camera={ { fov: 40, zoom: props.zoom, position: [ 0, 0, 20 ] } }
				shadowMap
				style={ {
					backgroundColor: props.backgroundColor,
					margin: '0 Auto',
					height: '500px',
					width: '90%',
				} }
			>
				<PerspectiveCamera fov={40} position={[0,0,20]} makeDefault zoom={props.zoom} />
				<ambientLight intensity={ 0.5 } />
				<directionalLight
					intensity={ 0.6 }
					position={ [ 0, 2, 2 ] }
					shadow-mapSize-width={ 2048 }
					shadow-mapSize-height={ 2048 }
					castShadow
				/>
					{ props.url && (
                        <Suspense fallback={ null }>
                            <ThreeObject
                                url={ props.url }
                                positionX={ props.positionX }
                                positionY={ props.positionY }
                                rotationY={ props.rotationY }
                                scale={ props.scale }
                                zoom={props.zoom}
                                animations={ props.animations }
                            />
                        </Suspense>
					) }
				<OrbitControls enableZoom={ props.hasZoom } />
			</Canvas>
			{ props.hasTip && (
				<p className="three-object-block-tip">Click and drag ^</p>
			) }
		</>
	);
}
