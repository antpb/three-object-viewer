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
import Controls from './Controls';
import Networking from './Networking';
import { useAspect } from '@react-three/drei'

function Participant( participant ) {
	const [participantPosition, setParticipantPosition] = useState([]);
	console.log("welcome,", participant.name);
	participant.p2pcf.on('msg', (peer, data) => {
		let newPosition = new TextDecoder('utf-8').decode(data);
        // console.log("some position data", new TextDecoder('utf-8').decode(data));
		const arrayPosition = JSON.parse( newPosition );
        console.log("some position data", arrayPosition);

		setParticipantPosition(arrayPosition);
    })

	return (
		<mesh name={participant} scale={ [ 1,1,1 ] } position={ [0,0,0] } rotation={ [ -Math.PI / 2, 0, 0 ] }>
			<boxBufferGeometry args={ [ 1, 1 ] } attach="geometry" />
			<meshBasicMaterial
				attach="material"
			/>
		</mesh>
	);
}

function SavedObject( props ) {
	const [ participants, setParticipant ] = useState([]);
	const meshRef = useRef();

	console.log(participants);

	const p2pcf = window.p2pcf;
	if(p2pcf){
		p2pcf.on('peerconnect', peer => {
			setParticipant(current => [...current, peer.client_id]);	
		})
	}


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

	// Player controller.
	// const fallbackURL = threeObjectPlugin + defaultVRM;
	// const playerURL = props.playerData.vrm ? props.playerData.vrm : fallbackURL

	// const someSceneState = useLoader( GLTFLoader, playerURL, ( loader ) => {
	// 	loader.register(
	// 		( parser ) => new GLTFAudioEmitterExtension( parser, listener )
	// 	);
	// 	loader.register( ( parser ) => {
    //         return new VRMLoaderPlugin( parser );
    //     } );
	// } );

	// if(someSceneState?.userData?.gltfExtensions?.VRM){
	// 	const playerController = someSceneState.userData.vrm;
	// 	const { camera } = useThree();
	// 	useFrame(() => {
	// 		const offsetZ = camera.position.z - 0.4;
	// 		const offsetY = camera.position.y - 10;
	// 		playerController.scene.position.set( camera.position.x, offsetY, offsetZ );
	// 		playerController.scene.rotation.set( camera.rotation.x, camera.rotation.y, camera.rotation.z );
	// 	});
	// 	VRMUtils.rotateVRM0( playerController );
	// 	const rotationVRM = playerController.scene.rotation.y;
	// 	playerController.scene.rotation.set( 0, rotationVRM, 0 );
	// 	playerController.scene.scale.set( 1, 1, 1 );
	// 	gltf.scene.position.set( 0, props.positionY, 0 );
	// 	gltf.scene.rotation.set( 0, props.rotationY, 0 );
	// 	gltf.scene.scale.set( props.scale, props.scale, props.scale );	
	// 	return <><primitive object={ gltf.scene } /><primitive object={ playerController.scene } /></>;    
	// }
	// End controller.

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
		return(<>
			<primitive object={ gltf.scene } />
			{ participants && participants.map((item, index)=>{
				console.log("stuff", item);
				return (
					<>
						<Participant
							name={item}
							p2pcf={p2pcf}
						/>
					</>
				)})}
		</>);
}

function ModelObject( model ) {
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
    gltf.scene.scale.set(model.scaleX , model.scaleY, model.scaleZ );
	// console.log(model.rotationX, model.rotationY, model.rotationZ);
    gltf.scene.rotation.set(model.rotationX , model.rotationY, model.rotationZ );
    // gltf.scene.scale.set( props.scale, props.scale, props.scale );
	return <>
		<primitive object={ gltf.scene } />
	</>;    
}


function Sky( sky ) {
	// console.log(sky.src);
	const skyUrl = sky.src[0].querySelector( 'p.sky-block-url' )
	? sky.src[0].querySelector( 'p.sky-block-url' ).innerText
	: '';

	const texture_1 = useLoader(THREE.TextureLoader, skyUrl);

	return (
	<mesh visible position={[0, 0, 0]} scale={[200,200,200]} rotation={[0, 0, 0]} >
		<sphereBufferGeometry args={[5, 200, 200]} />
		<meshStandardMaterial side={THREE.DoubleSide} map={texture_1} />
	</mesh>
	);
}

function ThreeImage( threeImage ) {
	// console.log(threeImage.aspectWidth, threeImage.aspectHeight);
	const texture_2 = useLoader(THREE.TextureLoader, threeImage.url);	

	return (
		<mesh visible position={[threeImage.positionX, threeImage.positionY, threeImage.positionZ]} rotation={[threeImage.rotationX, threeImage.rotationY, threeImage.rotationZ]} >
			<planeBufferGeometry args={useAspect(threeImage.aspectWidth, threeImage.aspectHeight)} />
			<meshStandardMaterial side={THREE.DoubleSide} map={texture_2} />
		</mesh>
	);
}

function ThreeVideo(threeVideo) {
	console.log(threeVideo);
	const clicked = true;
	const [video] = useState(() => Object.assign(document.createElement('video'), { src: threeVideo.url, crossOrigin: 'Anonymous', loop: true, muted: true }));

	useEffect(() => void (clicked && video.play()), [video, clicked]);

	return (
	<mesh scale={[1,1,1]} position={[0, 0, 0]} rotation={[0, 0, 0]} >
		<meshBasicMaterial toneMapped={false}>
			<videoTexture attach="map" args={[video]} encoding={THREE.sRGBEncoding} />
		</meshBasicMaterial>
		<planeBufferGeometry args={useAspect(threeVideo.aspectWidth, threeVideo.aspectHeight)} />
	</mesh>
	);
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
				<Networking
					postSlug={props.postSlug}
					userData={props.userData}
				/>
				<VRCanvas
					camera={ { fov: 40, zoom: 1, far: 2000, position: [ 0, 0, 20 ] } }
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
					<Controls 
					/>
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
										{ props.threeUrl && (
											<>
												<Sky src={ props.sky }/>
											</>
										)}
										{ Object.values(props.imagesToAdd).map((item, index)=>{
											const imagePosX = item.querySelector( 'p.image-block-positionX' )
											? item.querySelector( 'p.image-block-positionX' ).innerText
											: '';
									
											const imagePosY = item.querySelector( 'p.image-block-positionY' )
											? item.querySelector( 'p.image-block-positionY' ).innerText
											: '';
										
											const imagePosZ = item.querySelector( 'p.image-block-positionZ' )
											? item.querySelector( 'p.image-block-positionZ' ).innerText
											: '';

											const imageScaleX = item.querySelector( 'p.image-block-scaleX' )
											? item.querySelector( 'p.image-block-scaleX' ).innerText
											: '';

											const imageScaleY = item.querySelector( 'p.image-block-scaleY' )
											? item.querySelector( 'p.image-block-scaleY' ).innerText
											: '';

											const imageScaleZ = item.querySelector( 'p.image-block-scaleZ' )
											? item.querySelector( 'p.image-block-scaleZ' ).innerText
											: '';

											const imageRotationX = item.querySelector( 'p.image-block-rotationX' )
											? item.querySelector( 'p.image-block-rotationX' ).innerText
											: '';

											const imageRotationY = item.querySelector( 'p.image-block-rotationY' )
											? item.querySelector( 'p.image-block-rotationY' ).innerText
											: '';

											const imageRotationZ = item.querySelector( 'p.image-block-rotationZ' )
											? item.querySelector( 'p.image-block-rotationZ' ).innerText
											: '';

											const imageUrl = item.querySelector( 'p.image-block-url' )
											? item.querySelector( 'p.image-block-url' ).innerText
											: '';

											const aspectHeight = item.querySelector( 'p.image-block-aspect-height' )
											? item.querySelector( 'p.image-block-aspect-height' ).innerText
											: '';

											const aspectWidth = item.querySelector( 'p.image-block-aspect-width' )
											? item.querySelector( 'p.image-block-aspect-width' ).innerText
											: '';
												
											return(<ThreeImage 
												url={imageUrl} 
												positionX={imagePosX} 
												positionY={imagePosY} 
												positionZ={imagePosZ} 
												scaleX={imageScaleX} 
												scaleY={imageScaleY} 
												scaleZ={imageScaleZ} 
												rotationX={imageRotationX} 
												rotationY={imageRotationY} 
												rotationZ={imageRotationZ}
												aspectHeight={aspectHeight}
												aspectWidth={aspectWidth} 
												/>);											
											})}
											{ Object.values(props.videosToAdd).map((item, index)=>{
												const videoPosX = item.querySelector( 'p.video-block-positionX' )
												? item.querySelector( 'p.video-block-positionX' ).innerText
												: '';

												const videoPosY = item.querySelector( 'p.video-block-positionY' )
												? item.querySelector( 'p.video-block-positionY' ).innerText
												: '';

												const videoPosZ = item.querySelector( 'p.video-block-positionZ' )
												? item.querySelector( 'p.video-block-positionZ' ).innerText
												: '';

												const videoScaleX = item.querySelector( 'p.video-block-scaleX' )
												? item.querySelector( 'p.video-block-scaleX' ).innerText
												: '';

												const videoScaleY = item.querySelector( 'p.video-block-scaleY' )
												? item.querySelector( 'p.video-block-scaleY' ).innerText
												: '';

												const videoScaleZ = item.querySelector( 'p.video-block-scaleZ' )
												? item.querySelector( 'p.video-block-scaleZ' ).innerText
												: '';

												const videoRotationX = item.querySelector( 'p.video-block-rotationX' )
												? item.querySelector( 'p.video-block-rotationX' ).innerText
												: '';

												const videoRotationY = item.querySelector( 'p.video-block-rotationY' )
												? item.querySelector( 'p.video-block-rotationY' ).innerText
												: '';

												const videoRotationZ = item.querySelector( 'p.video-block-rotationZ' )
												? item.querySelector( 'p.video-block-rotationZ' ).innerText
												: '';

												const videoUrl = item.querySelector( 'p.video-block-url' )
												? item.querySelector( 'p.video-block-url' ).innerText
												: '';
												console.log("no url?", videoUrl);
												console.log(item);

												const aspectHeight = item.querySelector( 'p.video-block-aspect-height' )
												? item.querySelector( 'p.video-block-aspect-height' ).innerText
												: '';

												const aspectWidth = item.querySelector( 'p.video-block-aspect-width' )
												? item.querySelector( 'p.video-block-aspect-width' ).innerText
												: '';
												
												return(<ThreeVideo 
													url={videoUrl} 
													// positionX={videoPosX} 
													// positionY={videoPosY} 
													// positionZ={videoPosZ} 
													// scaleX={videoScaleX} 
													// scaleY={videoScaleY} 
													// scaleZ={videoScaleZ} 
													// rotationX={videoRotationX} 
													// rotationY={videoRotationY} 
													// rotationZ={videoRotationZ}
													aspectHeight={aspectHeight}
													aspectWidth={aspectWidth} 
													/>);											
												})}

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

												const modelScaleX = model.querySelector( 'p.model-block-scale-x' )
												? model.querySelector( 'p.model-block-scale-x' ).innerText
												: '';

												const modelScaleY = model.querySelector( 'p.model-block-scale-y' )
												? model.querySelector( 'p.model-block-scale-y' ).innerText
												: '';

												const modelScaleZ = model.querySelector( 'p.model-block-scale-z' )
												? model.querySelector( 'p.model-block-scale-z' ).innerText
												: '';

												const modelRotationX = model.querySelector( 'p.model-block-rotation-x' )
												? model.querySelector( 'p.model-block-rotation-x' ).innerText
												: '';

												const modelRotationY = model.querySelector( 'p.model-block-rotation-y' )
												? model.querySelector( 'p.model-block-rotation-y' ).innerText
												: '';

												const modelRotationZ = model.querySelector( 'p.model-block-rotation-z' )
												? model.querySelector( 'p.model-block-rotation-z' ).innerText
												: '';

												const url = model.querySelector( 'p.model-block-url' )
												? model.querySelector( 'p.model-block-url' ).innerText
												: '';
																				
											return(<ModelObject 
												url={url} 
												positionX={modelPosX} 
												positionY={modelPosY} 
												positionZ={modelPosZ} 
												scaleX={modelScaleX} 
												scaleY={modelScaleY} 
												scaleZ={modelScaleZ} 
												rotationX={modelRotationX} 
												rotationY={modelRotationY} 
												rotationZ={modelRotationZ} 
												/>);											
										})}
									</TeleportTravel>
									<RigidBody>
											<Floor rotation={[-Math.PI / 2, 0, 0]} />
									</RigidBody>
								</>
							) }
					</Physics>
					</Suspense>
					{/* <OrbitControls
						enableZoom={ true }
					/> */}
				</VRCanvas>
			</>
		);
	}
	// if ( props.deviceTarget === '2d' ) {
	// 	return (
	// 		<>
	// 			<Canvas
    //       camera={ { fov: 40, position: [0, 0, 20], zoom: props.zoom} }
	// 				shadowMap
	// 				style={ {
	// 					backgroundColor: props.backgroundColor,
	// 					margin: '0 Auto',
	// 					height: '500px',
	// 					width: '90%',
	// 				} }
	// 			>
	// 				<ambientLight intensity={ 0.5 } />
	// 				<directionalLight
	// 					intensity={ 0.6 }
	// 					position={ [ 0, 2, 2 ] }
	// 					shadow-mapSize-width={ 2048 }
	// 					shadow-mapSize-height={ 2048 }
	// 					castShadow
	// 				/>
	// 				<Suspense fallback={ null }>
	// 					{ props.threeUrl && (
	// 						<SavedObject
	// 							positionY={ props.positionY }
	// 							rotationY={ props.rotationY }
	// 							url={ props.threeUrl }
	// 							color={ props.backgroundColor }
	// 							hasZoom={ props.hasZoom }
	// 							scale={ props.scale }
	// 							hasTip={ props.hasTip }
	// 							animations={ props.animations }
	// 						/>
	// 					) }
	// 				</Suspense>
	// 				<OrbitControls
	// 					enableZoom={ props.hasZoom === '1' ? true : false }
	// 				/>
	// 			</Canvas>
	// 			{ props.hasTip === '1' ? (
	// 				<p className="three-object-block-tip">Click and drag ^</p>
	// 			) : (
	// 				<p></p>
	// 			) }
	// 		</>
	// 	);
	// }
}
