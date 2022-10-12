import * as THREE from 'three';
import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
	PerspectiveCamera,
	OrbitControls,
	useAnimations,
	Html,
	TransformControls,
	Stats
} from '@react-three/drei';
import { VRMUtils, VRMLoaderPlugin  } from '@pixiv/three-vrm'
import { GLTFAudioEmitterExtension } from 'three-omi';
import {
	A11y,
} from '@react-three/a11y';
import { Perf } from 'r3f-perf';
import EditControls from './EditControls';
import CustomComponent from '../../../../four-object-viewer/blocks/four-portal-block/components/CustomComponent';
import { Resizable } from 're-resizable';
import { useAspect } from '@react-three/drei';

function Markup( model ) {
	const htmlObj = useRef();
	return(<>
		<TransformControls 
			enabled={model.selected}
			mode={model.transformMode}
			object={ htmlObj }
			size={0.5}
			onObjectChange={ ( e ) => {
				const rot = new THREE.Euler( 0, 0, 0, 'XYZ' );
				rot.setFromQuaternion(e?.target.worldQuaternion);
				wp.data.dispatch( 'core/block-editor' ).updateBlockAttributes(model.htmlobjectId, { 
					positionX: e?.target.worldPosition.x,
					positionY: e?.target.worldPosition.y,
					positionZ: e?.target.worldPosition.z, 
					rotationX: rot.x,
					rotationY: rot.y,
					rotationZ: rot.z, 
				})
			}}
		>
			<group ref={ htmlObj } position={[model.positionX, model.positionY, model.positionZ]} rotation={[model.rotationX, model.rotationY, model.rotationZ]}>
			<mesh>
				<meshBasicMaterial attach="material" color={ 0xffffff } />
				<Html className="content" rotation-y={-Math.PI / 2} width={10} height={10} position={[-0.2,0,-1]} transform >
					<div className="wrapper three-html-block-inner-wrapper" style={{backgroundColor: "#ffffff" }} dangerouslySetInnerHTML={ { __html: model.markup } }>
					</div>
				</Html>
			</mesh>
			</group>
		</TransformControls>
	</>);    
}

function Sky( sky ) {
		const skyUrl = sky.src.skyUrl;
		if(skyUrl){
			const texture_1 = useLoader(THREE.TextureLoader, skyUrl);

			return (
				<mesh visible position={[0, 0, 0]} scale={[200,200,200]} rotation={[0, 0, 0]} >
					<sphereBufferGeometry args={[5, 200, 200]} />
					<meshStandardMaterial side={THREE.DoubleSide} map={texture_1} />
				</mesh>
				);	
		}
}

function ImageObject( threeImage ) {
	// console.log(threeImage.aspectWidth, threeImage.aspectHeight);
	const texture_2 = useLoader(THREE.TextureLoader, threeImage.url);	
	const imgObj = useRef();

	return (
		<TransformControls 
			enabled={threeImage.selected}
			mode={threeImage.transformMode}
			object={ imgObj }
			size={0.5}
			onObjectChange={ ( e ) => {
				const rot = new THREE.Euler( 0, 0, 0, 'XYZ' );
				rot.setFromQuaternion(e?.target.worldQuaternion);
				wp.data.dispatch( 'core/block-editor' ).updateBlockAttributes(threeImage.imageID, {
					positionX: e?.target.worldPosition.x,
					positionY: e?.target.worldPosition.y,
					positionZ: e?.target.worldPosition.z, 
					rotationX: rot.x,
					rotationY: rot.y,
					rotationZ: rot.z, 
				})
			}}
		>
			<mesh ref={imgObj} visible position={[threeImage.positionX, threeImage.positionY, threeImage.positionZ]} scale={[threeImage.scaleX, threeImage.scaleY, threeImage.scaleZ]} rotation={[threeImage.rotationX, threeImage.rotationY, threeImage.rotationZ]} >
				<planeBufferGeometry args={[threeImage.aspectWidth/12, threeImage.aspectHeight/12]} />
				<meshStandardMaterial side={THREE.DoubleSide} map={texture_2} />
			</mesh>
		</TransformControls>
	);
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
	const {camera} = useThree();

	const gltf = useLoader( GLTFLoader, model.url, ( loader ) => {
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
			vrm.scene.scale.set( model.scaleX, model.scaleY, model.scaleZ );
			return (
				// <A11y role="content" description={model.alt} >
					<primitive object={ vrm.scene } /> 
				// </A11y>
			); 
	}
	gltf.scene.rotation.set( 0, 0, 0 );
	const obj = useRef();
	const copyGltf = useMemo(() => gltf.scene.clone(), [gltf.scene])

	return ( model.transformMode !== undefined ? (<>
		<TransformControls 
			enabled={model.selected}
			mode={model.transformMode ? model.transformMode : "translate" }
			object={ obj }
			size={0.5}
			onObjectChange={ ( e ) => {
					const rot = new THREE.Euler( 0, 0, 0, 'XYZ' );
					rot.setFromQuaternion(e?.target.worldQuaternion);
					wp.data.dispatch( 'core/block-editor' ).updateBlockAttributes(model.modelId, { 
						positionX: e?.target.worldPosition.x,
						positionY: e?.target.worldPosition.y,
						positionZ: e?.target.worldPosition.z, 
						rotationX: rot.x,
						rotationY: rot.y,
						rotationZ: rot.z, 
					});

					if(model.shouldFocus){
						// model.setFocusPosition([e?.target.worldPosition.x, e?.target.worldPosition.y, e?.target.worldPosition.z]);
						// camera.position.set(model.focusPosition);
					}
				}
			}
		>
			<group 
				ref={ obj } 
				position={[model.positionX, model.positionY, model.positionZ ]}
				rotation={[ model.rotationX , model.rotationY, model.rotationZ ]}
				scale={[ model.scaleX , model.scaleY, model.scaleZ ]}
			>
				<primitive object={ copyGltf } />
			</group>
		</TransformControls>
	</>) : 	(<>
		<group 
			ref={ obj } 
			position={[model.positionX, model.positionY, model.positionZ ]}
			rotation={[ model.rotationX , model.rotationY, model.rotationZ ]}
			scale={[ model.scaleX , model.scaleY, model.scaleZ ]}
		>
			<primitive object={ copyGltf } />
		</group>
	</>)
	);    
}

function PortalObject( model ) {
	const [ url, set ] = useState( model.url );
	useEffect( () => {
		setTimeout( () => set( model.url ), 2000 );
	}, [] );
	const [ listener ] = useState( () => new THREE.AudioListener() );

	useThree( ( { camera } ) => {
		camera.add( listener );
	} );
	const {camera} = useThree();

	const gltf = useLoader( GLTFLoader, model.url, ( loader ) => {
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
			vrm.scene.scale.set( model.scaleX, model.scaleY, model.scaleZ );
			return (
				// <A11y role="content" description={model.alt} >
					<primitive object={ vrm.scene } /> 
				// </A11y>
			); 
	}
	gltf.scene.rotation.set( 0, 0, 0 );
	const obj = useRef();
	const copyGltf = useMemo(() => gltf.scene.clone(), [gltf.scene])

	return ( model.transformMode !== undefined ? (<>
		<TransformControls 
			enabled={model.selected}
			mode={model.transformMode ? model.transformMode : "translate" }
			object={ obj }
			size={0.5}
			onObjectChange={ ( e ) => {
					const rot = new THREE.Euler( 0, 0, 0, 'XYZ' );
					rot.setFromQuaternion(e?.target.worldQuaternion);
					wp.data.dispatch( 'core/block-editor' ).updateBlockAttributes(model.portalID, { 
						positionX: e?.target.worldPosition.x,
						positionY: e?.target.worldPosition.y,
						positionZ: e?.target.worldPosition.z, 
						rotationX: rot.x,
						rotationY: rot.y,
						rotationZ: rot.z, 
					});

					if(model.shouldFocus){
						// model.setFocusPosition([e?.target.worldPosition.x, e?.target.worldPosition.y, e?.target.worldPosition.z]);
						// camera.position.set(model.focusPosition);
					}
				}
			}
		>
			<group 
				ref={ obj } 
				position={[model.positionX, model.positionY, model.positionZ ]}
				rotation={[ model.rotationX , model.rotationY, model.rotationZ ]}
				scale={[ model.scaleX , model.scaleY, model.scaleZ ]}
			>
				<primitive object={ copyGltf } />
			</group>
		</TransformControls>
	</>) : 	(<>
		<group 
			ref={ obj } 
			position={[model.positionX, model.positionY, model.positionZ ]}
			rotation={[ model.rotationX , model.rotationY, model.rotationZ ]}
			scale={[ model.scaleX , model.scaleY, model.scaleZ ]}
		>
			<primitive object={ copyGltf } />
		</group>
	</>)
	);    
}

function ThreeObject( props ) {
	let skyobject;
	let skyobjectId;
	let modelobject;
	let portalobject;
	let modelID;
	let portalID;
	let imageID;
	let imageobject;
	let imageElementsToAdd = [];
	let editorModelsToAdd = [];
	let editorPortalsToAdd = [];
	let editorHtmlToAdd= [];
	let htmlobject;
	let htmlobjectId;

	const currentBlocks = wp.data.select( 'core/block-editor' ).getBlocks();
	if(currentBlocks){
		currentBlocks.forEach( ( block ) => {
			if (block.name === "three-object-viewer/environment"){
				const currentInnerBlocks = block.innerBlocks;
				if (currentInnerBlocks) {
					currentInnerBlocks.forEach( ( innerBlock ) => {
						// console.log(innerBlock);
						if(innerBlock.name === "three-object-viewer/sky-block"){
							skyobject = innerBlock.attributes;
							skyobjectId = innerBlock.clientId;
						}
						if(innerBlock.name === "three-object-viewer/model-block"){
							modelobject = innerBlock.attributes;
							modelID = innerBlock.clientId;
							let something = [{modelobject, modelID}]
							editorModelsToAdd.push({modelobject, modelID});
						}
						if(innerBlock.name === "three-object-viewer/three-image-block"){
							imageobject = innerBlock.attributes;
							imageID = innerBlock.clientId;
							let something = [{imageobject, imageID}]
							imageElementsToAdd.push({imageobject, imageID});
						}
						if(innerBlock.name === "three-object-viewer/three-portal-block"){
							portalobject = innerBlock.attributes;
							portalID = innerBlock.clientId;
							let something = [{portalobject, portalID}]
							editorPortalsToAdd.push({portalobject, portalID});
						}
						if(innerBlock.name === "three-object-viewer/three-html-block"){
							htmlobject = innerBlock.attributes;
							htmlobjectId = innerBlock.clientId;
							editorHtmlToAdd.push({htmlobject, htmlobjectId});
						}
					});
				}
			}
		});
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
	const copyGltf = useMemo(() => gltf.scene.clone(), [gltf.scene])

	return(
		<>									
			{skyobject && <Sky skyobjectId={skyobjectId} src={ skyobject }/>}
			{ Object.values(editorModelsToAdd).map((model, index)=>{
					if(model.modelobject.threeObjectUrl){
					return(
						<ModelObject 
						url={model.modelobject.threeObjectUrl} 
						positionX={model.modelobject.positionX} 
						positionY={model.modelobject.positionY} 
						positionZ={model.modelobject.positionZ} 
						scaleX={model.modelobject.scaleX} 
						scaleY={model.modelobject.scaleY} 
						scaleZ={model.modelobject.scaleZ} 
						rotationX={model.modelobject.rotationX} 
						rotationY={model.modelobject.rotationY} 
						rotationZ={model.modelobject.rotationZ} 
						alt={model.modelobject.alt}
						animations={model.modelobject.animations}
						selected={props.selected}
						modelId={model.modelID}
						transformMode={props.transformMode}
						setFocusPosition={props.setFocusPosition}
						shouldFocus={props.shouldFocus}
						/>
					);
				}
			})}
			{ Object.values(editorPortalsToAdd).map((model, index)=>{
					if(model.portalobject.threeObjectUrl){
					return(
						<PortalObject 
						url={model.portalobject.threeObjectUrl} 
						positionX={model.portalobject.positionX} 
						positionY={model.portalobject.positionY} 
						positionZ={model.portalobject.positionZ} 
						scaleX={model.portalobject.scaleX} 
						scaleY={model.portalobject.scaleY} 
						scaleZ={model.portalobject.scaleZ} 
						rotationX={model.portalobject.rotationX} 
						rotationY={model.portalobject.rotationY} 
						rotationZ={model.portalobject.rotationZ} 
						alt={model.portalobject.alt}
						animations={model.portalobject.animations}
						selected={props.selected}
						portalID={model.portalID}
						transformMode={props.transformMode}
						setFocusPosition={props.setFocusPosition}
						shouldFocus={props.shouldFocus}
						/>
					);
				}
			})}
			{ Object.values(imageElementsToAdd).map((model, index)=>{
				if(model.imageobject.imageUrl){
					return(
						<ImageObject 
							url={model.imageobject.imageUrl} 
							positionX={model.imageobject.positionX} 
							positionY={model.imageobject.positionY} 
							positionZ={model.imageobject.positionZ} 
							scaleX={model.imageobject.scaleX} 
							scaleY={model.imageobject.scaleY} 
							scaleZ={model.imageobject.scaleZ} 
							rotationX={model.imageobject.rotationX} 
							rotationY={model.imageobject.rotationY} 
							rotationZ={model.imageobject.rotationZ} 
							alt={model.imageobject.alt}
							animations={model.imageobject.animations}
							selected={props.selected}
							imageID={model.imageID}
							aspectHeight={model.imageobject.aspectHeight}
							aspectWidth={model.imageobject.aspectWidth} 
							transformMode={props.transformMode}
							setFocusPosition={props.setFocusPosition}
							shouldFocus={props.shouldFocus}
						/>
					);
				}
			})}
			{ Object.values(editorHtmlToAdd).map((markup, index)=>{
				return(<Markup 
					markup={ markup.htmlobject.markup }
					positionX={markup.htmlobject.positionX} 
					positionY={markup.htmlobject.positionY} 
					positionZ={markup.htmlobject.positionZ} 
					scaleX={markup.htmlobject.scaleX} 
					scaleY={markup.htmlobject.scaleY} 
					scaleZ={markup.htmlobject.scaleZ} 
					rotationX={markup.htmlobject.rotationX} 
					rotationY={markup.htmlobject.rotationY} 
					rotationZ={markup.htmlobject.rotationZ}
					htmlobjectId={markup.htmlobjectId}
					transformMode={props.transformMode}
				/>);
			})}
			{/* {modelobject && props.transformMode && modelobject.threeObjectUrl && 
				<ModelObject 
					url={modelobject.threeObjectUrl} 
					positionX={modelobject.positionX} 
					positionY={modelobject.positionY} 
					positionZ={modelobject.positionZ} 
					scaleX={modelobject.scaleX} 
					scaleY={modelobject.scaleY} 
					scaleZ={modelobject.scaleZ} 
					rotationX={modelobject.rotationX} 
					rotationY={modelobject.rotationY} 
					rotationZ={modelobject.rotationZ} 
					alt={modelobject.alt}
					animations={modelobject.animations}
					selected={props.selected}
					modelId={modelID}
					transformMode={props.transformMode}
				/>
			} */}
			<primitive object={ copyGltf } />
		</>
	);
}

export default function ThreeObjectEdit( props ) {

	const [ transformMode, setTransformMode ] = useState("translate");
	const [ focusPosition, setFocusPosition ] = useState([0,0,0]);
	const [ shouldFocus, setShouldFocus ] = useState(false);
	const onKeyUp = function ( event ) {
		switch ( event.code ) {
			case 'KeyT':
				setTransformMode( "translate" );
				console.log(transformMode)
				break;	
			case 'KeyR':
				setTransformMode( "rotate" );
				console.log(transformMode)
				break;
			case 'KeyF':
				console.log(focusPosition)
				setShouldFocus(true);
				break;	
			default:
				return;
		}
	};
	document.addEventListener( 'keyup', onKeyUp );


	return (
		<>
			<Resizable
				defaultSize={{
					height:550,
				}}
				enable={{
					top:false, right:false, bottom:true, left:false, topRight:false, bottomRight:false, bottomLeft:false, topLeft:false
				}}
			>
			<Canvas
				name={"maincanvas"}
				camera={ { fov: 50, near: 0.1, far: 1000, zoom: props.zoom, position: [ 0, 0, 20 ] } }
				shadowMap
				performance={{ min: 0.5 }}
				style={ {
					margin: '0 Auto',
					height: '100%',
					width: '100%',
				} }
			>
				{/* <Perf className="stats"/> */}
				<PerspectiveCamera fov={50} position={[0,0,20]} makeDefault zoom={1} />
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
								{/* <EditControls/> */}
								<ThreeObject
									url={ props.url }
									positionY={ props.positionY }
									rotationY={ props.rotationY }
									scale={ props.scale }
									animations={ props.animations }
									transformMode={transformMode}
									setFocusPosition={setFocusPosition}
									shouldFocus={shouldFocus}
								/>
						</Suspense>
					) }
				<OrbitControls makeDefault enableZoom={ props.selected } />
			</Canvas>
			</Resizable>
		</>
	);
}
