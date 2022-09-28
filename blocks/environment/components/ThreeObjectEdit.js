import * as THREE from 'three';
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
	PerspectiveCamera,
	OrbitControls,
	useAnimations,
	Html,
	TransformControls
} from '@react-three/drei';
import { VRMUtils, VRMLoaderPlugin  } from '@pixiv/three-vrm'
import { GLTFAudioEmitterExtension } from 'three-omi';
import {
	A11y,
} from '@react-three/a11y';
import EditControls from './EditControls';
import CustomComponent from '../../../../four-object-viewer/blocks/four-portal-block/components/CustomComponent';

function Markup( model ) {
	const targetLoc = useRef();

	return(<>
		<group ref={ targetLoc }>
          <mesh scale={[model.scaleX, model.scaleY, model.scaleZ]} position={[model.positionX, model.positionY, model.positionZ]} rotation={[model.rotationX, model.rotationY, model.rotationZ]}>
			<meshBasicMaterial attach="material" color={ 0xffffff } />
            <Html className="content" rotation-y={-Math.PI / 2} width={10} height={10} position={[-0.2,0,-1]} transform occlude>
              <div className="wrapper three-html-block-inner-wrapper" style={{backgroundColor: "#ffffff" }} dangerouslySetInnerHTML={ { __html: model.markup } }>
              </div>
            </Html>
          </mesh>
		</group>

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

function ModelObject( model ) {
	const [ url, set ] = useState( model.url );
	useEffect( () => {
		setTimeout( () => set( model.url ), 2000 );
	}, [] );
	const [ listener ] = useState( () => new THREE.AudioListener() );

	useThree( ( { camera } ) => {
		camera.add( listener );
	} );

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
			return (<A11y role="content" description={model.alt} >
				<primitive object={ vrm.scene } /> 
				</A11y>); 
	}
	// gltf.scene.position.set( model.positionX, model.positionY, model.positionZ );
	gltf.scene.rotation.set( 0, 0, 0 );
	gltf.scene.scale.set(model.scaleX , model.scaleY, model.scaleZ );
	// console.log(model.rotationX, model.rotationY, model.rotationZ);
	gltf.scene.rotation.set(model.rotationX , model.rotationY, model.rotationZ );
	// gltf.scene.scale.set( props.scale, props.scale, props.scale );
	const obj = useRef();
	return <>
		<A11y role="content" description={model.alt} >
		<TransformControls 
			enabled={model.selected}
			mode="translate"
			object={obj ? obj : ''}
			onObjectChange={ ( e ) =>
				//updateBlockAttributes
				wp.data.dispatch( 'core/block-editor' ).updateBlockAttributes(model.modelId, { positionX: e?.target.worldPosition.x, positionY: e?.target.worldPosition.y, positionZ: e?.target.worldPosition.z })
				// console.log( model.modelId, e?.target.worldPosition )
			}
		>
			<group ref={ obj } position={[model.positionX, model.positionY, model.positionZ ]}>
				<primitive object={ gltf.scene } />
			</group>
		</TransformControls>
		</A11y>
	</>;    
}
	
function ThreeObject( props ) {
	let skyobject = null;
	let modelobject = null;
	let modelID = null;
	let htmlobject = null;
	const currentBlocks = wp.data.select( 'core/block-editor' ).getBlocks();
	if(currentBlocks){
		currentBlocks.forEach( ( block ) => {
			if (block.name === "three-object-viewer/environment"){
				const currentInnerBlocks = block.innerBlocks;
				if (currentInnerBlocks) {
					currentInnerBlocks.forEach( ( innerBlock ) => {
						if(innerBlock.name === "three-object-viewer/sky-block"){
							skyobject = innerBlock.attributes;
						}
						if(innerBlock.name === "three-object-viewer/model-block"){
							modelobject = innerBlock.attributes;
							modelID= innerBlock.clientId;
						}
						if(innerBlock.name === "three-object-viewer/three-html-block"){
							htmlobject = innerBlock.attributes;
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
	return(
		<>									
			{skyobject && <Sky src={ skyobject }/>}
			{htmlobject && 
				<Markup 
					markup={ htmlobject.markup }
					positionX={htmlobject.positionX} 
					positionY={htmlobject.positionY} 
					positionZ={htmlobject.positionZ} 
					scaleX={htmlobject.scaleX} 
					scaleY={htmlobject.scaleY} 
					scaleZ={htmlobject.scaleZ} 
					rotationX={htmlobject.rotationX} 
					rotationY={htmlobject.rotationY} 
					rotationZ={htmlobject.rotationZ} 
				/>
			}
			{modelobject && modelobject.threeObjectUrl && 
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
				/>
			}
			<primitive object={ gltf.scene } />
		</>
	);
}

export default function ThreeObjectEdit( props ) {
	return (
		<>
			<Canvas
				name={"maincanvas"}
				camera={ { fov: 40, zoom: props.zoom, position: [ 0, 0, 20 ] } }
				shadowMap
				style={ {
					margin: '0 Auto',
					height: '550px',
					width: '100%',
				} }
			>
				<PerspectiveCamera fov={40} position={[0,0,20]} makeDefault zoom={1} />
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
								/>
						</Suspense>
					) }
					<CustomComponent/>
				<OrbitControls makeDefault enableZoom={ props.selected } />
			</Canvas>
		</>
	);
}
