import * as THREE from 'three';
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Physics, RigidBody } from "@react-three/rapier";

import {
	OrthographicCamera,
	OrbitControls,
	useAnimations,
} from '@react-three/drei';
import { GLTFAudioEmitterExtension } from 'three-omi';
import {
	VRCanvas,
	ARCanvas,
	DefaultXRControllers,
	Hands,
} from '@react-three/xr';
import { VRM, VRMUtils, VRMSchema, VRMLoaderPlugin  } from '@pixiv/three-vrm'
import TeleportTravel from './TeleportTravel';
import defaultVRM from '../../../inc/avatars/mummy.vrm';

function SavedObject( props ) {
	const [ url, set ] = useState( props.url );
	useEffect( () => {
		setTimeout( () => set( props.url ), 2000 );
	}, [] );
	const [ listener ] = useState( () => new THREE.AudioListener() );

	useThree( ( { camera } ) => {
		camera.add( listener );
	} );

	const gltf = useLoader( GLTFLoader, url, ( loader ) => {
		loader.register(
			( parser ) => new GLTFAudioEmitterExtension( parser, listener )
		);
		loader.register( ( parser ) => {
            return new VRMLoaderPlugin( parser );
        } );
	} );
	const fallbackURL = threeObjectPlugin + defaultVRM;
	const playerURL = props.playerData.vrm ? props.playerData.vrm : fallbackURL

	const someSceneState = useLoader( GLTFLoader, playerURL, ( loader ) => {
		loader.register(
			( parser ) => new GLTFAudioEmitterExtension( parser, listener )
		);
		loader.register( ( parser ) => {
            return new VRMLoaderPlugin( parser );
        } );
	} );

	const { actions } = useAnimations( gltf.animations, gltf.scene );

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
	if(someSceneState?.userData?.gltfExtensions?.VRM){
		const playerController = someSceneState.userData.vrm;
		const { camera } = useThree();
		useFrame(() => {
			const offset = camera.position.z - 3;
			playerController.scene.position.set( camera.position.x, camera.position.y, offset );
			playerController.scene.rotation.set( camera.rotation.x, camera.rotation.y, camera.rotation.z );
		});
		VRMUtils.rotateVRM0( playerController );
		const rotationVRM = playerController.scene.rotation.y;
		playerController.scene.rotation.set( 0, rotationVRM, 0 );
		playerController.scene.scale.set( 1, 1, 1 );
		gltf.scene.position.set( 0, props.positionY, 0 );
		gltf.scene.rotation.set( 0, props.rotationY, 0 );
		gltf.scene.scale.set( props.scale, props.scale, props.scale );	
		return <><primitive object={ gltf.scene } /><primitive object={ playerController.scene } /></>;    
	}
    if(gltf?.userData?.gltfExtensions?.VRM){
			const vrm = gltf.userData.vrm;
			vrm.scene.position.set( 0, props.positionY, 0 );
			VRMUtils.rotateVRM0( vrm );
			const rotationVRM = vrm.scene.rotation.y + parseFloat(props.rotationY);
			vrm.scene.rotation.set( 0, rotationVRM, 0 );
			vrm.scene.scale.set( props.scale, props.scale, props.scale );
			return <primitive object={ vrm.scene } />;    
    }
    gltf.scene.position.set( 0, props.positionY, 0 );
    gltf.scene.rotation.set( 0, props.rotationY, 0 );
    gltf.scene.scale.set( props.scale, props.scale, props.scale );
	return <><primitive object={ gltf.scene } /></>;    
}

function ModelObject( model ) {
	console.log("ohcomeon");
	const [ url, set ] = useState( model.url );
	useEffect( () => {
		setTimeout( () => set( model.url ), 2000 );
	}, [] );
	const [ listener ] = useState( () => new THREE.AudioListener() );

	useThree( ( { camera } ) => {
		camera.add( listener );
	} );

	const gltf = useLoader( GLTFLoader, url, ( loader ) => {
		loader.register(
			( parser ) => new GLTFAudioEmitterExtension( parser, listener )
		);
		loader.register( ( parser ) => {
            return new VRMLoaderPlugin( parser );
        } );
	} );

	const { actions } = useAnimations( gltf.animations, gltf.scene );

	const animationList = model.animations ? model.animations.split( ',' ) : '';
	useEffect( () => {
		if ( animationList ) {
			animationList.forEach( ( name ) => {
				if ( Object.keys( actions ).includes( name ) ) {
					actions[ name ].play();
				}
			} );
		}
	}, [] );
    if(gltf?.userData?.gltfExtensions?.VRM){
			const vrm = gltf.userData.vrm;
			vrm.scene.position.set( model.positionX, model.positionY, model.positionZ );
			VRMUtils.rotateVRM0( vrm );
			const rotationVRM = vrm.scene.rotation.y + parseFloat(0);
			vrm.scene.rotation.set( 0, rotationVRM, 0 );
			vrm.scene.scale.set( 1, 1, 1 );
			// vrm.scene.scale.set( props.scale, props.scale, props.scale );
			return <primitive object={ vrm.scene } />;    
    }
    gltf.scene.position.set( model.positionX, model.positionY, model.positionZ );
    gltf.scene.rotation.set( 0, 0, 0 );
    gltf.scene.scale.set( 1, 1, 1 );
    // gltf.scene.scale.set( props.scale, props.scale, props.scale );
	return <><primitive object={ gltf.scene } /></>;    
}


function Floor( props ) {
	return (
		<mesh position={ [ 0, -2, 0 ] } rotation={ [ -Math.PI / 2, 0, 0 ] } { ...props }>
			<planeBufferGeometry args={ [ 1000, 1000 ] } attach="geometry" />
			<meshBasicMaterial
				opacity={ 0 }
				transparent={ true }
				attach="material"
			/>
		</mesh>
	);
}

export default function EnvironmentFront( props ) {	
	if ( props.deviceTarget === 'vr' ) {
		return (
			<>
				<VRCanvas
					camera={ { fov: 40, zoom: 1, position: [ 0, 0, 20 ] } }
					shadowMap
					style={ {
						backgroundColor: props.backgroundColor,
						margin: '0 Auto',
						height: '500px',
						width: '90%',
					} }
				>
					<Hands />
					<DefaultXRControllers />
					<ambientLight intensity={ 0.5 } />
					<directionalLight
						intensity={ 0.6 }
						position={ [ 0, 2, 2 ] }
						shadow-mapSize-width={ 2048 }
						shadow-mapSize-height={ 2048 }
						castShadow
					/>			
					<Suspense fallback={ null }>
					<Physics>			
							{ props.threeUrl && (
								<>						
									<TeleportTravel useNormal={ false }>
										<RigidBody type="kinematicPosition">
											<SavedObject
											positionY={ props.positionY }
											rotationY={ props.rotationY }
											url={ props.threeUrl }
											color={ props.backgroundColor }
											hasZoom={ props.hasZoom }
											scale={ props.scale }
											hasTip={ props.hasTip }
											animations={ props.animations }
											playerData={ props.userData }
											/>
										</RigidBody>

											{ Object.values(props.modelsToAdd).map((model, index)=>{
												const modelPosX = model.querySelector( 'p.model-block-position-x' )
												? model.querySelector( 'p.model-block-position-x' ).innerText
												: '';
										
												const modelPosY = model.querySelector( 'p.model-block-position-y' )
												? model.querySelector( 'p.model-block-position-y' ).innerText
												: '';
											
												const modelPosZ = model.querySelector( 'p.model-block-position-z' )
												? model.querySelector( 'p.model-block-position-z' ).innerText
												: '';
										
												const url = model.querySelector( 'p.model-block-url' )
												? model.querySelector( 'p.model-block-url' ).innerText
												: '';
										
												console.log("positionx", modelPosX);
												console.log("positiony", modelPosY);
												console.log("positionz", modelPosZ);
												console.log("url", url);
										
											return(<ModelObject url={url} positionX={modelPosX} positionY={modelPosY} positionZ={modelPosZ} />);											
										})}
									</TeleportTravel>
									<RigidBody>
											<Floor rotation={[-Math.PI / 2, 0, 0]} />
									</RigidBody>
								</>
							) }
					</Physics>
					</Suspense>
					<OrbitControls
						enableZoom={ true }
					/>
				</VRCanvas>
				{ props.hasTip === '1' ? (
					<p className="three-object-block-tip">Click and drag ^</p>
				) : (
					<p></p>
				) }
			</>
		);
	}
	if ( props.deviceTarget === '2d' ) {
		return (
			<>
				<Canvas
          camera={ { fov: 40, position: [0, 0, 20], zoom: props.zoom} }
					shadowMap
					style={ {
						backgroundColor: props.backgroundColor,
						margin: '0 Auto',
						height: '500px',
						width: '90%',
					} }
				>
					<ambientLight intensity={ 0.5 } />
					<directionalLight
						intensity={ 0.6 }
						position={ [ 0, 2, 2 ] }
						shadow-mapSize-width={ 2048 }
						shadow-mapSize-height={ 2048 }
						castShadow
					/>
					<Suspense fallback={ null }>
						{ props.threeUrl && (
							<SavedObject
								positionY={ props.positionY }
								rotationY={ props.rotationY }
								url={ props.threeUrl }
								color={ props.backgroundColor }
								hasZoom={ props.hasZoom }
								scale={ props.scale }
								hasTip={ props.hasTip }
								animations={ props.animations }
							/>
						) }
					</Suspense>
					<OrbitControls
						enableZoom={ props.hasZoom === '1' ? true : false }
					/>
				</Canvas>
				{ props.hasTip === '1' ? (
					<p className="three-object-block-tip">Click and drag ^</p>
				) : (
					<p></p>
				) }
			</>
		);
	}
}
