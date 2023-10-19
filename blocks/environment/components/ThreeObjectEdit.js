import * as THREE from "three";
import React, { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import {
	PerspectiveCamera,
	OrbitControls,
	useAnimations,
	Html,
	TransformControls,
	Stats,
	Select,
	Text,
	useAspect,
	Sky,
	Environment,
	useContextBridge
} from "@react-three/drei";
import { VRMUtils, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { GLTFAudioEmitterExtension } from "three-omi";
import { Icon, moveTo, rotateLeft, resizeCornerNE } from "@wordpress/icons";
// import { A11y } from "@react-three/a11y";
import { Perf } from "r3f-perf";
// import EditControls from "./EditControls";
import { Resizable } from "re-resizable";
import defaultFont from "../../../inc/fonts/roboto.woff";
import audioIcon from "../../../inc/assets/audio_icon.png";
import lightIcon from "../../../inc/assets/light_icon.png";
import { EditorPluginProvider, useEditorPlugins, EditorPluginContext } from './EditorPluginProvider';  // Import the PluginProvider

const { registerStore } = wp.data;

function TextObject(text) {
	const textObj = useRef();
	const [isSelected, setIsSelected] = useState();
	const textBlockAttributes = wp.data
		.select("core/block-editor")
		.getBlockAttributes(text.htmlobjectId);
	const TransformController = ({ condition, wrap, children }) =>
		condition ? wrap(children) : children;

	useEffect(() => {
		if( text.focusID === text.htmlobjectId ) {
			const someFocus = new THREE.Vector3(Number(text.positionX), Number(text.positionY), Number(text.positionZ));
			text.changeFocusPoint(someFocus);
		}
	}, [text.focusID]);

	if (text) {
		return (
			<Select
				box
				multiple
				onChange={(e) => {
					e.length !== 0 ? setIsSelected(true) : setIsSelected(false);
				}}
				filter={(items) => items}
			>
				<TransformController
					condition={text.focusID === text.htmlobjectId}
					wrap={(children) => (
						<TransformControls
							mode={text.transformMode}
							enabled={text.focusID === text.htmlobjectId}
							object={textObj}
							size={0.5}
							onObjectChange={(e) => {
								const rot = new THREE.Euler(0, 0, 0, "XYZ");
								const scale = e?.target.worldScale;
								rot.setFromQuaternion(
									e?.target.worldQuaternion
								);
								wp.data
									.dispatch("core/block-editor")
									.updateBlockAttributes(text.htmlobjectId, {
										positionX: e?.target.worldPosition.x,
										positionY: e?.target.worldPosition.y,
										positionZ: e?.target.worldPosition.z,
										rotationX: rot.x,
										rotationY: rot.y,
										rotationZ: rot.z,
										scaleX: scale.x,
										scaleY: scale.y,
										scaleZ: scale.z
									});
							}}
						>
							{children}
						</TransformControls>
					)}
				>
					{textBlockAttributes && (
						<group
							ref={textObj}
							position={[
								textBlockAttributes.positionX,
								textBlockAttributes.positionY,
								textBlockAttributes.positionZ
							]}
							rotation={[
								textBlockAttributes.rotationX,
								textBlockAttributes.rotationY,
								textBlockAttributes.rotationZ
							]}
							scale={[text.scaleX, text.scaleY, text.scaleZ]}
						>
							<Text
								font={(threeObjectPlugin + defaultFont)}
								scale={[4, 4, 4]}
								color={text.textColor}
							>
								{text.textContent}
							</Text>
						</group>
					)}
				</TransformController>
			</Select>
		);
	}
}

function ThreeSky(sky) {
	const skyUrl = sky.src.skyUrl;
	if (skyUrl) {
		const texture_1 = useLoader(THREE.TextureLoader, skyUrl);

		return (
			<mesh
				visible
				position={[0, 0, 0]}
				scale={[1, 1, 1]}
				rotation={[0, 0, 0]}
			>
				<sphereGeometry args={[300, 50, 50]} />
				<meshBasicMaterial side={THREE.DoubleSide} map={texture_1} />
			</mesh>
		);
	} else {
		return(
			<Sky
				distance={sky.src.distance}
				sunPosition={[sky.src.sunPositionX, sky.src.sunPositionY, sky.src.sunPositionZ]}
				rayleigh={sky.src.rayleigh}
			/>
		)
	}
}

function Spawn(spawn) {
	const spawnObj = useRef();
	const [isSelected, setIsSelected] = useState();
	const spawnBlockAttributes = wp.data
		.select("core/block-editor")
		.getBlockAttributes(spawn.spawnpointID);
	const TransformController = ({ condition, wrap, children }) =>
		condition ? wrap(children) : children;

	useEffect(() => {
		if( spawn.focusID === spawn.spawnpointID ) {
			const someFocus = new THREE.Vector3(Number(spawn.positionX), Number(spawn.positionY), Number(spawn.positionZ));
			spawn.changeFocusPoint(someFocus);
		}
	}, [spawn.focusID]);
	
	if (spawn) {
		return (
			<Select
				box
				multiple
				onChange={(e) => {
					e.length !== 0 ? setIsSelected(true) : setIsSelected(false);
				}}
				filter={(items) => items}
			>
				<TransformController
					condition={spawn.focusID === spawn.spawnpointID}
					wrap={(children) => (
						<TransformControls
							mode={spawn.transformMode}
							enabled={spawn.focusID === spawn.spawnpointID}
							object={spawnObj}
							size={0.5}
							onObjectChange={(e) => {
								const rot = new THREE.Euler(0, 0, 0, "XYZ");
								const scale = e?.target.worldScale;
								rot.setFromQuaternion(
									e?.target.worldQuaternion
								);
								wp.data
									.dispatch("core/block-editor")
									.updateBlockAttributes(spawn.spawnpointID, {
										positionX: e?.target.worldPosition.x,
										positionY: e?.target.worldPosition.y,
										positionZ: e?.target.worldPosition.z,
										rotationX: rot.x,
										rotationY: rot.y,
										rotationZ: rot.z,
										scaleX: scale.x,
										scaleY: scale.y,
										scaleZ: scale.z
									});
							}}
						>
							{children}
						</TransformControls>
					)}
				>
					{spawnBlockAttributes && (
						<mesh
							ref={spawnObj}
							visible
							position={[
								spawnBlockAttributes.positionX,
								spawnBlockAttributes.positionY,
								spawnBlockAttributes.positionZ
							]}
							scale={[1, 1, 1]}
							rotation={[0, 0, 0]}
						>
							<capsuleGeometry args={[.5, 1.3]} />
							<meshStandardMaterial
								side={THREE.DoubleSide}
								color={0xff3399}
							/>
						</mesh>
					)}
				</TransformController>
			</Select>
		);
	}
}

function ImageObject(threeImage) {
	const texture2 = useLoader(THREE.TextureLoader, threeImage.url);
	const imgObj = useRef();
	const [isSelected, setIsSelected] = useState();
	const threeImageBlockAttributes = wp.data
		.select("core/block-editor")
		.getBlockAttributes(threeImage.imageID);
	const TransformController = ({ condition, wrap, children }) =>
		condition ? wrap(children) : children;

	useEffect(() => {
		if( threeImage.focusID === threeImage.imageID ) {
			const someFocus = new THREE.Vector3(Number(threeImage.positionX), Number(threeImage.positionY), Number(threeImage.positionZ));
			threeImage.changeFocusPoint(someFocus);
		}
	}, [threeImage.focusID]);
	
	return (
		<Select
			box
			multiple
			onChange={(e) => {
				e.length !== 0 ? setIsSelected(true) : setIsSelected(false);
			}}
			filter={(items) => items}
		>
			<TransformController
				condition={threeImage.focusID === threeImage.imageID}
				wrap={(children) => (
					<TransformControls
						mode={threeImage.transformMode}
						enabled={threeImage.focusID === threeImage.imageID}
						object={imgObj}
						size={0.5}
						onObjectChange={(e) => {
							const rot = new THREE.Euler(0, 0, 0, "XYZ");
							const scale = e?.target.worldScale;
							rot.setFromQuaternion(e?.target.worldQuaternion);
							wp.data
								.dispatch("core/block-editor")
								.updateBlockAttributes(threeImage.imageID, {
									positionX: e?.target.worldPosition.x,
									positionY: e?.target.worldPosition.y,
									positionZ: e?.target.worldPosition.z,
									rotationX: rot.x,
									rotationY: rot.y,
									rotationZ: rot.z,
									scaleX: scale.x,
									scaleY: scale.y,
									scaleZ: scale.z
								});
						}}
					>
						{children}
					</TransformControls>
				)}
			>
				{threeImageBlockAttributes && (
					<mesh
						ref={imgObj}
						visible
						position={[
							threeImageBlockAttributes.positionX,
							threeImageBlockAttributes.positionY,
							threeImageBlockAttributes.positionZ
						]}
						scale={[
							threeImageBlockAttributes.scaleX,
							threeImageBlockAttributes.scaleY,
							threeImageBlockAttributes.scaleZ
						]}
						rotation={[
							threeImageBlockAttributes.rotationX,
							threeImageBlockAttributes.rotationY,
							threeImageBlockAttributes.rotationZ
						]}
					>
						<planeGeometry
							args={[
								threeImageBlockAttributes.aspectWidth / 12,
								threeImageBlockAttributes.aspectHeight / 12
							]}
						/>
						{threeImageBlockAttributes.transparent ? (
							<meshBasicMaterial
								transparent
								side={THREE.DoubleSide}
								map={texture2}
							/>
						) : (
							<meshStandardMaterial
								side={THREE.DoubleSide}
								map={texture2}
							/>
						)}
					</mesh>
				)}
			</TransformController>
		</Select>
	);
}

function AudioObject(threeAudio) {
	const texture2 = useLoader(THREE.TextureLoader, (threeObjectPlugin + audioIcon));

	const [threeAudioBlockAttributes, setThreeAudioBlockAttributes] = useState(
		wp.data
			.select("core/block-editor")
			.getBlockAttributes(threeAudio.audioID)
	);
	  
	useEffect(() => {
		const attributes = wp.data
			.select("core/block-editor")
			.getBlockAttributes(threeAudio.audioID);
			setThreeAudioBlockAttributes(attributes);
	}, [threeAudio.audioID]);

	const [isSelected, setIsSelected] = useState();
 	  
	const clicked = true;
	const audioObj = useRef();
	const TransformController = ({ condition, wrap, children }) =>
		condition ? wrap(children) : children;

	// useEffect(() => void (clicked && video.play()), [video, clicked]);

	useEffect(() => {
		if( threeAudio.focusID === threeAudio.audioID ) {
			const someFocus = new THREE.Vector3(Number(threeAudio.positionX), Number(threeAudio.positionY), Number(threeAudio.positionZ));
			threeAudio.changeFocusPoint(someFocus);
		}
	}, [threeAudio.focusID]);

	return (
		<Select
			box
			multiple
			onChange={(e) => {
				e.length !== 0 ? setIsSelected(true) : setIsSelected(false);
			}}
			filter={(items) => items}
		>
			<TransformController
				condition={threeAudio.focusID === threeAudio.audioID}
				wrap={(children) => (
					<TransformControls
						enabled={threeAudio.focusID === threeAudio.audioID}
						mode={
							threeAudio.transformMode
								? threeAudio.transformMode
								: "translate"
						}
						object={audioObj}
						size={0.5}
						onMouseUp={(e) => {
							const rot = new THREE.Euler(0, 0, 0, "XYZ");
							const scale = e?.target.worldScale;
							rot.setFromQuaternion(e?.target.worldQuaternion);
							wp.data
								.dispatch("core/block-editor")
								.updateBlockAttributes(threeAudio.audioID, {
									positionX: e?.target.worldPosition.x,
									positionY: e?.target.worldPosition.y,
									positionZ: e?.target.worldPosition.z,
									rotationX: rot.x,
									rotationY: rot.y,
									rotationZ: rot.z,
								});
								setThreeAudioBlockAttributes(
								wp.data
									.select("core/block-editor")
									.getBlockAttributes(threeAudio.audioID)
							);
						}}
					>
						{children}
					</TransformControls>
				)}
			>					
				<group
					ref={audioObj}
					position={[
						threeAudioBlockAttributes.positionX,
						threeAudioBlockAttributes.positionY,
						threeAudioBlockAttributes.positionZ
					]}
					rotation={[
						threeAudioBlockAttributes.rotationX,
						threeAudioBlockAttributes.rotationY,
						threeAudioBlockAttributes.rotationZ
					]}
				>
				<mesh>
					<meshBasicMaterial
						transparent
						side={THREE.DoubleSide}
						map={texture2}
					/>
					<planeGeometry
						args={[
							1, 1
						]}
					/>
				</mesh>
			</group>
			</TransformController>
		</Select>
	);
}


function LightObject(threeLight) {
	const { scene } = useThree();
	// add lightRef
	const lightRef = useRef();

    let LightComponent;
	var colorValue = parseInt ( threeLight.color.replace("#","0x"), 16 );

	const color = new THREE.Color( colorValue );

    switch (threeLight.type) {
        case "directional":
            LightComponent = (
                <directionalLight
                    ref={lightRef}
                    color={color}
                    intensity={threeLight.intensity}
                    position={[
                        threeLight.positionX,
                        threeLight.positionY,
                        threeLight.positionZ
                    ]}
                />
            );
            break;
        case "point":
            LightComponent = (
                <pointLight
                    ref={lightRef}
                    color={color}
                    intensity={threeLight.intensity}
                    distance={threeLight.distance}
                    decay={threeLight.decay}
                    position={[
                        threeLight.positionX,
                        threeLight.positionY,
                        threeLight.positionZ
                    ]}
                />
            );
            break;
        case "spot":
            LightComponent = (
                <spotLight
                    ref={lightRef}
                    color={color}
                    intensity={threeLight.intensity}
                    distance={threeLight.distance}
                    angle={threeLight.angle}
                    penumbra={threeLight.penumbra}
                    decay={threeLight.decay}
                    position={[
                        threeLight.positionX,
                        threeLight.positionY,
                        threeLight.positionZ
                    ]}
                />
            );
            break;
			case "ambient":
				LightComponent = (
					<ambientLight
						ref={lightRef}
						color={threeLight.color}
						intensity={threeLight.intensity}
					/>
				);
				break;	
			default:
            LightComponent = null;
    }

	const texture2 = useLoader(THREE.TextureLoader, (threeObjectPlugin + lightIcon));

	const [threeLightBlockAttributes, setThreeLightBlockAttributes] = useState(
		wp.data
			.select("core/block-editor")
			.getBlockAttributes(threeLight.lightID)
	);
	  
	useEffect(() => {
		const attributes = wp.data
			.select("core/block-editor")
			.getBlockAttributes(threeLight.lightID);
			setThreeLightBlockAttributes(attributes);
	}, [threeLight.lightID]);

	const [isSelected, setIsSelected] = useState();
 	  
	const clicked = true;
	const lightObj = useRef();
	const TransformController = ({ condition, wrap, children }) =>
		condition ? wrap(children) : children;

	// useEffect(() => void (clicked && video.play()), [video, clicked]);

	useEffect(() => {
		if( threeLight.focusID === threeLight.lightID ) {
			const someFocus = new THREE.Vector3(Number(threeLight.positionX), Number(threeLight.positionY), Number(threeLight.positionZ));
			threeLight.changeFocusPoint(someFocus);
		}
	}, [threeLight.focusID]);

	return (
		<Select
			box
			multiple
			onChange={(e) => {
				e.length !== 0 ? setIsSelected(true) : setIsSelected(false);
			}}
			filter={(items) => items}
		>
			<TransformController
				condition={threeLight.focusID === threeLight.lightID}
				wrap={(children) => (
					<TransformControls
						enabled={threeLight.focusID === threeLight.lightID}
						mode={
							threeLight.transformMode
								? threeLight.transformMode
								: "translate"
						}
						object={lightObj}
						size={0.5}
						onMouseUp={(e) => {
							const rot = new THREE.Euler(0, 0, 0, "XYZ");
							const scale = e?.target.worldScale;
							rot.setFromQuaternion(e?.target.worldQuaternion);
							wp.data
								.dispatch("core/block-editor")
								.updateBlockAttributes(threeLight.lightID, {
									positionX: e?.target.worldPosition.x,
									positionY: e?.target.worldPosition.y,
									positionZ: e?.target.worldPosition.z,
									rotationX: rot.x,
									rotationY: rot.y,
									rotationZ: rot.z,
								});
								setThreeLightBlockAttributes(
								wp.data
									.select("core/block-editor")
									.getBlockAttributes(threeLight.lightID)
							);
						}}
					>
						{children}
					</TransformControls>
				)}
			>					
				<group
					ref={lightObj}
					position={[
						threeLightBlockAttributes.positionX,
						threeLightBlockAttributes.positionY,
						threeLightBlockAttributes.positionZ
					]}
					rotation={[
						threeLightBlockAttributes.rotationX,
						threeLightBlockAttributes.rotationY,
						threeLightBlockAttributes.rotationZ
					]}
				>
					{LightComponent}
					<mesh>
						<meshBasicMaterial
							transparent
							side={THREE.DoubleSide}
							map={texture2}
						/>
						<planeGeometry
							args={[
								1, 1
							]}
						/>
					</mesh>
				</group>
			</TransformController>
		</Select>
	);
}

function VideoObject(threeVideo) {
	const [url, setUrl] = useState(threeVideo.modelUrl);
	const [screen, setScreen] = useState(null);
	const [screenParent, setScreenParent] = useState(null);
	const [threeVideoBlockAttributes, setThreeVideoBlockAttributes] = useState(
		wp.data
			.select("core/block-editor")
			.getBlockAttributes(threeVideo.videoID)
	);
	const [customModel, setCustomModel] = useState(null);
	useEffect(() => {
		setCustomModel(threeVideoBlockAttributes.customModel);
	  }, [threeVideoBlockAttributes.customModel]);
	  
	useEffect(() => {
		const attributes = wp.data
			.select("core/block-editor")
			.getBlockAttributes(threeVideo.videoID);
		setThreeVideoBlockAttributes(attributes);
		setCustomModel(attributes.customModel);
	}, [threeVideo.videoID]);

	useEffect(() => {
	  setTimeout(() => setUrl(threeVideo.modelUrl), 2000);
	}, []);

	let gltf;
	if(customModel && threeVideo.modelUrl) {
		gltf = useLoader(GLTFLoader, threeVideo.modelUrl, (loader) => {
		loader.register((parser) => {
			return new VRMLoaderPlugin(parser);
		});
		});
	} else {
		gltf = null;
	}

	const [isSelected, setIsSelected] = useState();
 
	useEffect(() => {
		if (customModel) {
		  if (customModel && threeVideo.modelUrl) {
			gltf = useLoader(GLTFLoader, threeVideo.modelUrl, (loader) => {
			  loader.register((parser) => {
				return new VRMLoaderPlugin(parser);
			  });
			});
		  }
		  if (gltf?.scene) {
			let foundScreen = null;
			gltf.scene.traverse((child) => {
			  if (child.name === "screen") {
				foundScreen = child;
			  }
			});
	  
			if (foundScreen) {
			  setScreen(foundScreen);
			  setScreenParent(foundScreen.parent);
			  // Update screen's material with video texture
			  const videoTexture = new THREE.VideoTexture(video);
			  videoTexture.encoding= THREE.sRGBEncoding;
			  const material = new THREE.MeshBasicMaterial({ map: videoTexture, toneMapped: false });
			  foundScreen.material = material;
			}
		  }
		}
	  }, [video, customModel, threeVideoBlockAttributes.customModel]);
	  
	const clicked = true;
	const [video] = useState(() =>
		Object.assign(document.createElement("video"), {
			src: threeVideo.url,
			crossOrigin: "Anonymous",
			loop: true,
			muted: true
		})
	);
	const videoObj = useRef();
	const TransformController = ({ condition, wrap, children }) =>
		condition ? wrap(children) : children;

	useEffect(() => void (clicked && video.play()), [video, clicked]);

	useEffect(() => {
		if( threeVideo.focusID === threeVideo.videoID ) {
			const someFocus = new THREE.Vector3(Number(threeVideo.positionX), Number(threeVideo.positionY), Number(threeVideo.positionZ));
			threeVideo.changeFocusPoint(someFocus);
		}
	}, [threeVideo.focusID]);

	return (
		<Select
			box
			multiple
			onChange={(e) => {
				e.length !== 0 ? setIsSelected(true) : setIsSelected(false);
			}}
			filter={(items) => items}
		>
			<TransformController
				condition={threeVideo.focusID === threeVideo.videoID}
				wrap={(children) => (
					<TransformControls
						enabled={threeVideo.focusID === threeVideo.videoID}
						mode={
							threeVideo.transformMode
								? threeVideo.transformMode
								: "translate"
						}
						object={videoObj}
						size={0.5}
						onMouseUp={(e) => {
							const rot = new THREE.Euler(0, 0, 0, "XYZ");
							const scale = e?.target.worldScale;
							rot.setFromQuaternion(e?.target.worldQuaternion);
							wp.data
								.dispatch("core/block-editor")
								.updateBlockAttributes(threeVideo.videoID, {
									positionX: e?.target.worldPosition.x,
									positionY: e?.target.worldPosition.y,
									positionZ: e?.target.worldPosition.z,
									rotationX: rot.x,
									rotationY: rot.y,
									rotationZ: rot.z,
									scaleX: scale.x,
									scaleY: scale.y,
									scaleZ: scale.z
								});
							setThreeVideoBlockAttributes(
								wp.data
									.select("core/block-editor")
									.getBlockAttributes(threeVideo.videoID)
							);
						}}
					>
						{children}
					</TransformControls>
				)}
			>					
				<group
					ref={videoObj}
					scale={[
						threeVideoBlockAttributes.scaleX,
						threeVideoBlockAttributes.scaleY,
						threeVideoBlockAttributes.scaleZ
					]}					
					position={[
						threeVideoBlockAttributes.positionX,
						threeVideoBlockAttributes.positionY,
						threeVideoBlockAttributes.positionZ
					]}
					rotation={[
						threeVideoBlockAttributes.rotationX,
						threeVideoBlockAttributes.rotationY,
						threeVideoBlockAttributes.rotationZ
					]}
				>
				{threeVideoBlockAttributes && threeVideo.customModel ? (
						gltf?.scene && <primitive object={gltf?.scene} />
					) : (
						<mesh>
							<meshBasicMaterial toneMapped={false}>
								<videoTexture
									attach="map"
									args={[video]}
									encoding={THREE.sRGBEncoding}
								/>
							</meshBasicMaterial>
							<planeGeometry
								args={[
									threeVideo.aspectWidth / 12,
									threeVideo.aspectHeight / 12
								]}
							/>
						</mesh>
				)}
			</group>

			</TransformController>
		</Select>
	);
}

function ModelObject(props) {
	const [url, set] = useState(props.url);
	useEffect(() => {
		setTimeout(() => set(props.url), 2000);
	}, []);
	const [listener] = useState(() => new THREE.AudioListener());

	useThree(({ camera }) => {
		camera.add(listener);
	});
	const { camera } = useThree();

	const gltf = useLoader(GLTFLoader, props.url, (loader) => {
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath( threeObjectPluginRoot + "/inc/utils/draco/");
		dracoLoader.setDecoderConfig({type: 'js'}); // (Optional) Override detection of WASM support.
		loader.setDRACOLoader(dracoLoader);

		if(listener){
			loader.register(
				(parser) => new GLTFAudioEmitterExtension(parser, listener)
			);	
		}
		loader.register((parser) => {
			return new VRMLoaderPlugin(parser);
		});
	});

	const { actions } = useAnimations(gltf.animations, gltf.scene);

	const animationList = props.animations ? props.animations.split(",") : "";
	useEffect(() => {
		if (animationList) {
			animationList.forEach((name) => {
				if (Object.keys(actions).includes(name)) {
					actions[name].play();
				}
			});
		}
	}, []);
	const TransformController = ({ condition, wrap, children }) =>
	condition ? wrap(children) : children;
	const [isSelected, setIsSelected] = useState();
	const [modelBlockAttributes, setModelBlockAttributes] = useState(
		wp.data.select("core/block-editor").getBlockAttributes(props.modelID)
	);
	const obj = useRef();

	// update id if active
	useEffect(() => {
		if( props.focusID === props.modelID ) {
			const someFocus = new THREE.Vector3(Number(props.positionX), Number(props.positionY), Number(props.positionZ));
			props.changeFocusPoint(someFocus);
		}
	}, [props.focusID]);

	if (gltf?.userData?.gltfExtensions?.VRM) {
		const vrm = gltf.userData.vrm;
		VRMUtils.rotateVRM0(vrm);
		const rotationVRM = vrm.scene.rotation.y + parseFloat(0);
		return (
			<>
				<Select
					box
					multiple
					onChange={(e) => {
						e.length !== 0 ? setIsSelected(true) : setIsSelected(false);
					}}
					filter={(items) => items}
				>
					<TransformController
						condition={props.focusID === props.modelID}
						wrap={(children) => (
							<TransformControls
								enabled={props.focusID === props.modelID}
								mode={
									props.transformMode
										? props.transformMode
										: "translate"
								}
								object={obj}
								size={0.5}
								onMouseUp={(e) => {
									const rot = new THREE.Euler(0, 0, 0, "XYZ");
									const scale = e?.target.worldScale;
									rot.setFromQuaternion(
										e?.target.worldQuaternion
									);
									wp.data
										.dispatch("core/block-editor")
										.updateBlockAttributes(props.modelID, {
											positionX: e?.target.worldPosition.x,
											positionY: e?.target.worldPosition.y,
											positionZ: e?.target.worldPosition.z,
											rotationX: rot.x,
											rotationY: rot.y,
											rotationZ: rot.z,
											scaleX: scale.x,
											scaleY: scale.y,
											scaleZ: scale.z
										});
									setModelBlockAttributes(
										wp.data
											.select("core/block-editor")
											.getBlockAttributes(props.modelID)
									);
								}}
							>
								{children}
							</TransformControls>
						)}
					>
						{modelBlockAttributes && (
							<group
								ref={obj}
								position={[
									modelBlockAttributes.positionX,
									modelBlockAttributes.positionY,
									modelBlockAttributes.positionZ
								]}
								rotation={[
									modelBlockAttributes.rotationX,
									modelBlockAttributes.rotationY,
									modelBlockAttributes.rotationZ
								]}
								scale={[
									modelBlockAttributes.scaleX,
									modelBlockAttributes.scaleY,
									modelBlockAttributes.scaleZ
								]}
							>
								<primitive object={vrm.scene} />
							</group>
						)}
					</TransformController>
				</Select>
			</>
		);	
	}
	gltf.scene.rotation.set(0, 0, 0);
	// const copyGltf = useMemo(() => gltf.scene.clone(), [gltf.scene]);

	return (
		<>
			<Select
				box
				multiple
				onChange={(e) => {
					e.length !== 0 ? setIsSelected(true) : setIsSelected(false);
				}}
				filter={(items) => items}
			>
				<TransformController
					condition={props.focusID === props.modelID}
					wrap={(children) => (
						<TransformControls
							enabled={props.focusID === props.modelID}
							mode={
								props.transformMode
									? props.transformMode
									: "translate"
							}
							object={obj}
							size={0.5}
							onMouseUp={(e) => {
								const rot = new THREE.Euler(0, 0, 0, "XYZ");
								const scale = e?.target.worldScale;
								rot.setFromQuaternion(
									e?.target.worldQuaternion
								);
								wp.data
									.dispatch("core/block-editor")
									.updateBlockAttributes(props.modelID, {
										positionX: e?.target.worldPosition.x,
										positionY: e?.target.worldPosition.y,
										positionZ: e?.target.worldPosition.z,
										rotationX: rot.x,
										rotationY: rot.y,
										rotationZ: rot.z,
										scaleX: scale.x,
										scaleY: scale.y,
										scaleZ: scale.z
									});
								setModelBlockAttributes(
									wp.data
										.select("core/block-editor")
										.getBlockAttributes(props.modelID)
								);
							}}
						>
							{children}
						</TransformControls>
					)}
				>
					{modelBlockAttributes && (
						<group
							ref={obj}
							position={[
								modelBlockAttributes.positionX,
								modelBlockAttributes.positionY,
								modelBlockAttributes.positionZ
							]}
							rotation={[
								modelBlockAttributes.rotationX,
								modelBlockAttributes.rotationY,
								modelBlockAttributes.rotationZ
							]}
							scale={[
								modelBlockAttributes.scaleX,
								modelBlockAttributes.scaleY,
								modelBlockAttributes.scaleZ
							]}
						>
							<primitive object={gltf.scene} />
						</group>
					)}
				</TransformController>
			</Select>
		</>
	);
}

function NPCObject(props) {
	const [url, set] = useState(props.url);
	useEffect(() => {
		setTimeout(() => set(props.url), 2000);
	}, []);

	const gltf = useLoader(GLTFLoader, props.url, (loader) => {
		loader.register((parser) => {
			return new VRMLoaderPlugin(parser);
		});
	});

	const { actions } = useAnimations(gltf.animations, gltf.scene);

	const TransformController = ({ condition, wrap, children }) =>
	condition ? wrap(children) : children;
	const [isSelected, setIsSelected] = useState();
	const [modelBlockAttributes, setModelBlockAttributes] = useState(
		wp.data.select("core/block-editor").getBlockAttributes(props.modelID)
	);
	const obj = useRef();

	// update id if active
	useEffect(() => {
		if( props.focusID === props.modelID ) {
			const someFocus = new THREE.Vector3(Number(props.positionX), Number(props.positionY), Number(props.positionZ));
			props.changeFocusPoint(someFocus);
		}
	}, [props.focusID]);

	if (gltf?.userData?.gltfExtensions?.VRM) {
		const vrm = gltf.userData.vrm;
		VRMUtils.rotateVRM0(vrm);
		const rotationVRM = vrm.scene.rotation.y + parseFloat(0);
		let defaultColor = "0x000000";
		var colorValue = parseInt ( defaultColor.replace("#","0x"), 16 );
	
		const color = new THREE.Color( colorValue );
			
		return (
			<>
				<Select
					box
					multiple
					onChange={(e) => {
						e.length !== 0 ? setIsSelected(true) : setIsSelected(false);
					}}
					filter={(items) => items}
				>
					<TransformController
						condition={props.focusID === props.modelID}
						wrap={(children) => (
							<TransformControls
								enabled={props.focusID === props.modelID}
								mode={
									props.transformMode && props.transformMode !== "scale"
										? props.transformMode
										: "translate"
								}
								object={obj}
								size={0.5}
								onMouseUp={(e) => {
									const rot = new THREE.Euler(0, 0, 0, "XYZ");
									const scale = e?.target.worldScale;
									rot.setFromQuaternion(
										e?.target.worldQuaternion
									);
									wp.data
										.dispatch("core/block-editor")
										.updateBlockAttributes(props.modelID, {
											positionX: e?.target.worldPosition.x,
											positionY: e?.target.worldPosition.y,
											positionZ: e?.target.worldPosition.z,
											rotationX: rot.x,
											rotationY: rot.y,
											rotationZ: rot.z,
										});
									setModelBlockAttributes(
										wp.data
											.select("core/block-editor")
											.getBlockAttributes(props.modelID)
									);
								}}
							>
								{children}
							</TransformControls>
						)}
					>
						{modelBlockAttributes && (
							<group
								ref={obj}
								position={[
									modelBlockAttributes.positionX,
									modelBlockAttributes.positionY,
									modelBlockAttributes.positionZ
								]}
								rotation={[
									modelBlockAttributes.rotationX,
									modelBlockAttributes.rotationY,
									modelBlockAttributes.rotationZ
								]}
							>
								<mesh position={[0.6, 0.9, -0.01]}>
									<planeGeometry attach="geometry" args={[0.65, 1.5]} />
									<meshBasicMaterial attach="material" color={color} opacity={0.5}	transparent={ true } />
								</mesh>
								<primitive object={vrm.scene} />
							</group>
						)}
					</TransformController>
				</Select>
			</>
		);
	}
	gltf.scene.rotation.set(0, 0, 0);
	// const copyGltf = useMemo(() => gltf.scene.clone(), [gltf.scene]);

	return (
		<>
			<Select
				box
				multiple
				onChange={(e) => {
					e.length !== 0 ? setIsSelected(true) : setIsSelected(false);
				}}
				filter={(items) => items}
			>
				<TransformController
					condition={props.focusID === props.modelID}
					wrap={(children) => (
						<TransformControls
							enabled={props.focusID === props.modelID}
							mode={
								props.transformMode
									? props.transformMode
									: "translate"
							}
							object={obj}
							size={0.5}
							onMouseUp={(e) => {
								const rot = new THREE.Euler(0, 0, 0, "XYZ");
								const scale = e?.target.worldScale;
								rot.setFromQuaternion(
									e?.target.worldQuaternion
								);
								wp.data
									.dispatch("core/block-editor")
									.updateBlockAttributes(props.modelID, {
										positionX: e?.target.worldPosition.x,
										positionY: e?.target.worldPosition.y,
										positionZ: e?.target.worldPosition.z,
										rotationX: rot.x,
										rotationY: rot.y,
										rotationZ: rot.z,
									});
								setModelBlockAttributes(
									wp.data
										.select("core/block-editor")
										.getBlockAttributes(props.modelID)
								);
							}}
						>
							{children}
						</TransformControls>
					)}
				>
					{modelBlockAttributes && (
						<group
							ref={obj}
							position={[
								modelBlockAttributes.positionX,
								modelBlockAttributes.positionY,
								modelBlockAttributes.positionZ
							]}
							rotation={[
								modelBlockAttributes.rotationX,
								modelBlockAttributes.rotationY,
								modelBlockAttributes.rotationZ
							]}
							scale={[
							1,1,1
							]}
						>
							<primitive object={gltf.scene} />
						</group>
					)}
				</TransformController>
			</Select>
		</>
	);
}


function PortalObject(model) {
	const [isSelected, setIsSelected] = useState();
	const [portalBlockAttributes, setPortalBlockAttributes] = useState(
		wp.data.select("core/block-editor").getBlockAttributes(model.portalID)
	);

	useEffect(() => {
		if( model.focusID === model.portalID ) {
			const someFocus = new THREE.Vector3(Number(model.positionX), Number(model.positionY), Number(model.positionZ));
			model.changeFocusPoint(someFocus);
		}
	}, [model.focusID]);

	const TransformController = ({ condition, wrap, children }) =>
		condition ? wrap(children) : children;

	const [url, set] = useState(model.url);
	useEffect(() => {
		setTimeout(() => set(model.url), 2000);
	}, []);
	const [listener] = useState(() => new THREE.AudioListener());

	useThree(({ camera }) => {
		camera.add(listener);
	});
	const { camera } = useThree();

	const gltf = useLoader(GLTFLoader, model.url, (loader) => {
		loader.register(
			(parser) => new GLTFAudioEmitterExtension(parser, listener)
		);
		loader.register((parser) => {
			return new VRMLoaderPlugin(parser);
		});
	});

	const { actions } = useAnimations(gltf.animations, gltf.scene);

	const animationList = model.animations ? model.animations.split(",") : "";
	useEffect(() => {
		if (animationList) {
			animationList.forEach((name) => {
				if (Object.keys(actions).includes(name)) {
					actions[name].play();
				}
			});
		}
	}, []);
	if (gltf?.userData?.gltfExtensions?.VRM) {
		const vrm = gltf.userData.vrm;
		vrm.scene.position.set(
			model.positionX,
			model.positionY,
			model.positionZ
		);
		VRMUtils.rotateVRM0(vrm);
		const rotationVRM = vrm.scene.rotation.y + parseFloat(0);
		vrm.scene.rotation.set(0, rotationVRM, 0);
		vrm.scene.scale.set(1, 1, 1);
		vrm.scene.scale.set(model.scaleX, model.scaleY, model.scaleZ);
		
		return (
			// <A11y role="content" description={model.alt} >
			<primitive object={vrm.scene} />
			// </A11y>
		);
	}
	gltf.scene.rotation.set(0, 0, 0);
	const obj = useRef();
	const copyGltf = useMemo(() => gltf.scene.clone(), [gltf.scene]);

	return (
		<>
			<Select
				box
				multiple
				onChange={(e) => {
					e.length !== 0 ? setIsSelected(true) : setIsSelected(false);
				}}
				filter={(items) => items}
			>
				<TransformController
					condition={model.focusID === model.portalID}
					wrap={(children) => (
						<TransformControls
							enabled={model.focusID === model.portalID}
							mode={
								model.transformMode
									? model.transformMode
									: "translate"
							}
							object={obj}
							size={0.5}
							onMouseUp={(e) => {
								const rot = new THREE.Euler(0, 0, 0, "XYZ");
								const scale = e?.target.worldScale;
								rot.setFromQuaternion(
									e?.target.worldQuaternion
								);
								wp.data
									.dispatch("core/block-editor")
									.updateBlockAttributes(model.portalID, {
										positionX: e?.target.worldPosition.x,
										positionY: e?.target.worldPosition.y,
										positionZ: e?.target.worldPosition.z,
										rotationX: rot.x,
										rotationY: rot.y,
										rotationZ: rot.z,
										scaleX: scale.x,
										scaleY: scale.y,
										scaleZ: scale.z
									});
								setPortalBlockAttributes(
									wp.data
										.select("core/block-editor")
										.getBlockAttributes(model.portalID)
								);
							}}
						>
							{children}
						</TransformControls>
					)}
				>
					{portalBlockAttributes && (
						<group
							ref={obj}
							position={[
								portalBlockAttributes.positionX,
								portalBlockAttributes.positionY,
								portalBlockAttributes.positionZ
							]}
							rotation={[
								portalBlockAttributes.rotationX,
								portalBlockAttributes.rotationY,
								portalBlockAttributes.rotationZ
							]}
							scale={[
								portalBlockAttributes.scaleX,
								portalBlockAttributes.scaleY,
								portalBlockAttributes.scaleZ
							]}
						>
							<Text
								font={(threeObjectPlugin + defaultFont)}
								scale={[2, 2, 2]}
								color={portalBlockAttributes.labelTextColor}
								maxWidth={1}
								alignX="center"
								textAlign="center"
								position={[
									0 + portalBlockAttributes.labelOffsetX,
									0 + portalBlockAttributes.labelOffsetY,
									0 + portalBlockAttributes.labelOffsetZ
								]}
							>
								{portalBlockAttributes.label +
									": " +
									portalBlockAttributes.destinationUrl}
							</Text>
							<primitive object={copyGltf} />
						</group>
					)}
				</TransformController>
			</Select>
		</>
	);
}

function ThreeObject(props) {
	const [registeredThreeovBlocks, setRegisteredThreeovBlocks] = useState([]);

	const { plugins } = useEditorPlugins();  // From your own context

	useEffect(() => {
		if (plugins.length > 0) {
			plugins.forEach((plugin) => {
			  // add the plugin to the registered blocks
			  setRegisteredThreeovBlocks((registeredThreeovBlocks) => [
				...registeredThreeovBlocks,
				plugin,
			  ]);
			});
		  }
	}, [plugins]);
	  
	let skyobject;
	let skyobjectId;

	let spawnpoint;
	let spawnpointID;

	let modelobject;
	let modelID;
	const editorModelsToAdd = [];

	let npcObject;
	let npcID;
	const editorNPCsToAdd = [];

	let portalobject;
	let portalID;
	const editorPortalsToAdd = [];

	let imageID;
	const imageElementsToAdd = [];
	let imageobject;

	let videoID;
	let videoobject;
	const videoElementsToAdd = [];

	let audioID;
	let audioObject;
	const audioElementsToAdd = [];

	let lightID;
	let lightObject;
	const lightElementsToAdd = [];

	const editorHtmlToAdd = [];
	let htmlobject;
	let htmlobjectId;
	const { select } = wp.data;

	function getNestedBlocks(clientId) {
		const blockEditor = select("core/block-editor");
		const blocks = blockEditor.getBlocks(clientId);
		let allBlocks = [...blocks];
		blocks.forEach(block => {
			const innerBlocks = getNestedBlocks(block.clientId);
			allBlocks = [...allBlocks, ...innerBlocks];
		});

		return allBlocks;
	}

	const currentBlocks = getNestedBlocks(props.clientId);
	if (currentBlocks) {
		currentBlocks.forEach((block) => {
			if (block.name === "three-object-viewer/environment") {
				const currentInnerBlocks = block.innerBlocks;
				if (currentInnerBlocks) {
					currentInnerBlocks.forEach((innerBlock) => {
						if (
							innerBlock.name === "three-object-viewer/sky-block"
						) {
							skyobject = innerBlock.attributes;
							skyobjectId = innerBlock.clientId;
						}
						if (
							innerBlock.name ===
							"three-object-viewer/spawn-point-block"
						) {
							spawnpoint = innerBlock.attributes;
							spawnpointID = innerBlock.clientId;
						}
						if (
							innerBlock.name ===
							"three-object-viewer/model-block"
						) {
							modelobject = innerBlock.attributes;
							modelID = innerBlock.clientId;
							editorModelsToAdd.push({ modelobject, modelID });
						}
						if (
							innerBlock.name ===
							"three-object-viewer/npc-block"
						) {
							npcObject = innerBlock.attributes;
							npcID = innerBlock.clientId;
							editorNPCsToAdd.push({ npcObject, npcID });
						}
						if (
							innerBlock.name ===
							"three-object-viewer/three-image-block"
						) {
							imageobject = innerBlock.attributes;
							imageID = innerBlock.clientId;
							imageElementsToAdd.push({ imageobject, imageID });
						}
						if (
							innerBlock.name ===
							"three-object-viewer/three-video-block"
						) {
							videoobject = innerBlock.attributes;
							videoID = innerBlock.clientId;
							videoElementsToAdd.push({ videoobject, videoID });
						}
						if (
							innerBlock.name ===
							"three-object-viewer/three-audio-block"
						) {
							audioObject = innerBlock.attributes;
							audioID = innerBlock.clientId;
							audioElementsToAdd.push({ audioObject, audioID });
						}
						if (
							innerBlock.name ===
							"three-object-viewer/three-light-block"
						) {
							lightObject = innerBlock.attributes;
							lightID = innerBlock.clientId;
							lightElementsToAdd.push({ lightObject, lightID });
						}
						if (
							innerBlock.name ===
							"three-object-viewer/three-portal-block"
						) {
							portalobject = innerBlock.attributes;
							portalID = innerBlock.clientId;
							const something = [{ portalobject, portalID }];
							editorPortalsToAdd.push({ portalobject, portalID });
						}
						if (
							innerBlock.name ===
							"three-object-viewer/three-text-block"
						) {
							htmlobject = innerBlock.attributes;
							htmlobjectId = innerBlock.clientId;
							editorHtmlToAdd.push({ htmlobject, htmlobjectId });
						}
					});
				}
			}
		});
	}

	const [url, set] = useState(props.url);
	useEffect(() => {
		setTimeout(() => set(props.url), 2000);
	}, [props.url]);
	const [listener] = useState(() => new THREE.AudioListener());

	useThree(({ camera }) => {
		camera.add(listener);
	});

	const gltf = useLoader(GLTFLoader, url, (loader) => {
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath( threeObjectPluginRoot + "/inc/utils/draco/");
		dracoLoader.setDecoderConfig({type: 'js'}); // (Optional) Override detection of WASM support.
		loader.setDRACOLoader(dracoLoader);

		loader.register(
			(parser) => new GLTFAudioEmitterExtension(parser, listener)
		);
		loader.register((parser) => {
			return new VRMLoaderPlugin(parser);
		});
	});

	const { actions } = useAnimations(gltf.animations, gltf.scene);

	const animationList = props.animations ? props.animations.split(",") : "";

	useEffect(() => {
		if (animationList) {
			animationList.forEach((name) => {
				if (Object.keys(actions).includes(name)) {
					actions[name].play();
				}
			});
		}
	}, []);

	if (gltf?.userData?.gltfExtensions?.VRM) {
		const vrm = gltf.userData.vrm;
		vrm.scene.position.set(0, props.positionY, 0);
		VRMUtils.rotateVRM0(vrm);
		const rotationVRM = vrm.scene.rotation.y + parseFloat(props.rotationY);
		vrm.scene.rotation.set(0, rotationVRM, 0);
		vrm.scene.scale.set(props.scale, props.scale, props.scale);
		return <primitive object={vrm.scene} />;
	}
	gltf.scene.position.set(0, props.positionY, 0);
	gltf.scene.rotation.set(0, props.rotationY, 0);
	gltf.scene.scale.set(props.scale, props.scale, props.scale);
	// const copyGltf = useMemo(() => gltf.scene.clone(), [gltf.scene])
	const TransformController = ({ condition, wrap, children }) =>
		condition ? wrap(children) : children;

	return (
		<>
			{registeredThreeovBlocks.length > 0 && registeredThreeovBlocks.map((blockElement, index) => {
				const BlockComponent = blockElement.type;
				const blockPosition = wp.data
				.select("core/block-editor")
				.getBlockAttributes(blockElement.props.pluginObjectId);
				if (blockPosition !== null) {
					return ( props.focusID === blockElement.props.pluginObjectId ) ? (
						<TransformController 
							condition={ props.focusID === blockElement.props.pluginObjectId }
							wrap={(children) => (
								<TransformControls
									mode={props.transformMode}
									enabled={true}
									size={0.5}
									position={ [ blockPosition.positionX, blockPosition.positionY, blockPosition.positionZ ] }
									onObjectChange={(e) => {
										const rot = new THREE.Euler(0, 0, 0, "XYZ");
										const scale = e?.target.worldScale;
										rot.setFromQuaternion(
											e?.target.worldQuaternion
										);
										wp.data
											.dispatch("core/block-editor")
											.updateBlockAttributes(blockElement.props.pluginObjectId, {
												positionX: e?.target.worldPosition.x,
												positionY: e?.target.worldPosition.y,
												positionZ: e?.target.worldPosition.z,
												rotationX: rot.x,
												rotationY: rot.y,
												rotationZ: rot.z,
												scaleX: scale.x,
												scaleY: scale.y,
												scaleZ: scale.z
											});
									}}
								>
							{children}
							</TransformControls>
						)}
						>
							<BlockComponent key={index} {...blockElement.props} />
						</TransformController>
					) : (
						<group 
							position={ [ blockPosition.positionX, blockPosition.positionY, blockPosition.positionZ ] }
							rotation={ [ blockPosition.rotationX, blockPosition.rotationY, blockPosition.rotationZ ] }
							scale={ [ blockPosition.scaleX, blockPosition.scaleY, blockPosition.scaleZ ] }
						>
							<BlockComponent key={index} {...blockElement.props} />
						</group>
					);
				}
			})}
			{skyobject && <ThreeSky skyobjectId={skyobjectId} src={skyobject} />}
			{spawnpoint && (
				<Spawn
					spawnpointID={spawnpointID}
					focusID ={props.focusID}
					setFocusPosition={props.setFocusPosition}
					selected={props.selected}
					positionX={spawnpoint.positionX}
					positionY={spawnpoint.positionY}
					positionZ={spawnpoint.positionZ}
					transformMode={props.transformMode}
					changeFocusPoint={props.changeFocusPoint}					
					// setFocusPosition={props.setFocusPosition}
					shouldFocus={props.shouldFocus}
				/>
			)}
			{Object.values(editorModelsToAdd).map((model, index) => {
				if (model.modelobject.threeObjectUrl) {
					return (
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
							focusID ={props.focusID}
							setFocusPosition={props.setFocusPosition}
							focusPosition={props.focusPosition}
							selected={props.selected}
							modelID={model.modelID}
							changeFocusPoint={props.changeFocusPoint}
							transformMode={props.transformMode}
							// setFocusPosition={props.setFocusPosition}
							shouldFocus={props.shouldFocus}
						/>
					);
				}
			})}
			{Object.values(editorNPCsToAdd).map((npc, index) => {
				if (npc.npcObject.threeObjectUrl) {
					return (
						<NPCObject
							url={npc.npcObject.threeObjectUrl}
							positionX={npc.npcObject.positionX}
							positionY={npc.npcObject.positionY}
							positionZ={npc.npcObject.positionZ}
							rotationX={npc.npcObject.rotationX}
							rotationY={npc.npcObject.rotationY}
							rotationZ={npc.npcObject.rotationZ}
							alt={npc.npcObject.alt}
							animations={npc.npcObject.animations}
							focusID ={props.focusID}
							setFocusPosition={props.setFocusPosition}
							focusPosition={props.focusPosition}
							selected={props.selected}
							modelID={npc.npcID}
							changeFocusPoint={props.changeFocusPoint}
							transformMode={props.transformMode}
							// setFocusPosition={props.setFocusPosition}
							shouldFocus={props.shouldFocus}
						/>
					);
				}
			})}
			{Object.values(editorPortalsToAdd).map((model, index) => {
				if (model.portalobject.threeObjectUrl) {
					return (
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
							focusID ={props.focusID}
							changeFocusPoint={props.changeFocusPoint}
							setFocusPosition={props.setFocusPosition}
							transformMode={props.transformMode}
							// setFocusPosition={props.setFocusPosition}
							shouldFocus={props.shouldFocus}
						/>
					);
				}
			})}
			{Object.values(imageElementsToAdd).map((model, index) => {
				if (model.imageobject.imageUrl) {
					return (
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
							focusID ={props.focusID}
							changeFocusPoint={props.changeFocusPoint}
							setFocusPosition={props.setFocusPosition}
							aspectHeight={model.imageobject.aspectHeight}
							aspectWidth={model.imageobject.aspectWidth}
							transformMode={props.transformMode}
							// setFocusPosition={props.setFocusPosition}
							shouldFocus={props.shouldFocus}
						/>
					);
				}
			})}
			{Object.values(videoElementsToAdd).map((model, index) => {
				if (model.videoobject.videoUrl) {
					return (
						<VideoObject
							url={model.videoobject.videoUrl}
							customModel={model.videoobject.customModel}
							modelUrl={model.videoobject.modelUrl}
							positionX={model.videoobject.positionX}
							positionY={model.videoobject.positionY}
							positionZ={model.videoobject.positionZ}
							scaleX={model.videoobject.scaleX}
							scaleY={model.videoobject.scaleY}
							scaleZ={model.videoobject.scaleZ}
							rotationX={model.videoobject.rotationX}
							rotationY={model.videoobject.rotationY}
							rotationZ={model.videoobject.rotationZ}
							selected={props.selected}
							videoID={model.videoID}
							focusID ={props.focusID}
							changeFocusPoint={props.changeFocusPoint}
							setFocusPosition={props.setFocusPosition}
							aspectHeight={model.videoobject.aspectHeight}
							aspectWidth={model.videoobject.aspectWidth}
							transformMode={props.transformMode}
							shouldFocus={props.shouldFocus}
						/>
					);
				}
			})}
			{Object.values(audioElementsToAdd).map((model, index) => {
				if (model.audioObject.audioUrl) {
					return (
						<AudioObject
							url={model.audioObject.audioUrl}
							customModel={model.audioObject.customModel}
							modelUrl={model.audioObject.modelUrl}
							positionX={model.audioObject.positionX}
							positionY={model.audioObject.positionY}
							positionZ={model.audioObject.positionZ}
							rotationX={model.audioObject.rotationX}
							rotationY={model.audioObject.rotationY}
							rotationZ={model.audioObject.rotationZ}
							selected={props.selected}
							audioID={model.audioID}
							focusID ={props.focusID}
							changeFocusPoint={props.changeFocusPoint}
							setFocusPosition={props.setFocusPosition}
							transformMode={props.transformMode}
							shouldFocus={props.shouldFocus}
						/>
					);
				}
			})}
			{ lightElementsToAdd.length < 1 && (
					<>
						<ambientLight intensity={0.5} />
						<directionalLight
							intensity={0.6}
							position={[0, 2, 2]}
							shadow-mapSize-width={2048}
							shadow-mapSize-height={2048}
							castShadow
						/>
					</>
			)}
			{Object.values(lightElementsToAdd).map((model, index) => {
				if (model.lightObject.type) {
					return (
						<LightObject
							type={model.lightObject.type}
							color={model.lightObject.color}
							intensity={model.lightObject.intensity}
							distance={model.lightObject.distance}
							decay={model.lightObject.decay}
							angle={model.lightObject.angle}
							penumbra={model.lightObject.penumbra}
							positionX={model.lightObject.positionX}
							positionY={model.lightObject.positionY}
							positionZ={model.lightObject.positionZ}
							rotationX={model.lightObject.rotationX}
							rotationY={model.lightObject.rotationY}
							rotationZ={model.lightObject.rotationZ}
							targetX={model.lightObject.targetX}
							targetY={model.lightObject.targetY}
							targetZ={model.lightObject.targetZ}

							selected={props.selected}
							lightID={model.lightID}
							focusID ={props.focusID}
							changeFocusPoint={props.changeFocusPoint}
							setFocusPosition={props.setFocusPosition}
							transformMode={props.transformMode}
							shouldFocus={props.shouldFocus}
						/>
					);
				}
			})}
			{Object.values(editorHtmlToAdd).map((text, index) => {
				return (
					<TextObject
						key={index}
						textContent={text.htmlobject.textContent}
						positionX={text.htmlobject.positionX}
						positionY={text.htmlobject.positionY}
						positionZ={text.htmlobject.positionZ}
						scaleX={text.htmlobject.scaleX}
						scaleY={text.htmlobject.scaleY}
						scaleZ={text.htmlobject.scaleZ}
						rotationX={text.htmlobject.rotationX}
						rotationY={text.htmlobject.rotationY}
						rotationZ={text.htmlobject.rotationZ}
						textColor={text.htmlobject.textColor}
						focusID ={props.focusID}
						changeFocusPoint={props.changeFocusPoint}
						setFocusPosition={props.setFocusPosition}
						htmlobjectId={text.htmlobjectId}
						transformMode={props.transformMode}
					/>
				);
			})}
			<primitive object={gltf.scene} />
		</>
	);
}

export default function ThreeObjectEdit(props) {

	const [transformMode, setTransformMode] = useState("translate");

	const ObjectControls = (props) => {
		const [label, setLabel] = useState("transform");
	  
		const handleClick = (newLabel) => {
		  setLabel(newLabel);
		};
	  
		return (
		  <div style={{ position: "relative", zIndex: 100 }}>
			<div
			  style={{
				display: "flex",
				justifyContent: "flex-start",
				position: "absolute",
				top: "15px",
				left: "250px",
			  }}
			>
			  <div style={{ display: "flex", justifyContent: "space-between" }}>
				<button
					title="translate"
					style={{
						backgroundColor:
							props.transformMode === "translate" ? "lightgray" : "white",
							borderRadius: "10px",
							paddingTop: "5px",
							marginRight: "5px",
						}}
					active={true}
					onClick={() => props.setTransformMode("translate")}>
						<Icon size={20} icon={moveTo}/>
				</button>
				<button
					title="rotate"
					style={{
						backgroundColor:
							props.transformMode === "rotate" ? "lightgray" : "white",
							borderRadius: "10px",
							paddingTop: "5px",
							marginRight: "5px",
					}}
					onClick={() => props.setTransformMode("rotate")}
				>
						<Icon size={20} icon={rotateLeft}/>
				</button>
				<button
					title="scale"
					style={{
						backgroundColor:
							props.transformMode === "scale" ? "lightgray" : "white",
							borderRadius: "10px",
							paddingTop: "5px",
							marginRight: "5px",
						}}
					onClick={() => props.setTransformMode("scale")}>
						<Icon size={20} icon={resizeCornerNE}/>
				</button>
			  </div>
			</div>
		  </div>
		);
	  };

	const [focusID, setFocusID] = useState([0, 0, 0]);
	const [shouldFocus, setShouldFocus] = useState(false);
	useEffect(() => {
		function onKeyUp(event) {
			switch (event.code) {
				case "KeyT":
					setTransformMode("translate");
					break;
				case "KeyR":
					setTransformMode("rotate");
					break;
				case "KeyS":
					setTransformMode("scale");
					break;
				case "KeyF":
					props.setFocus(props.focusPosition);
					break;
				default:
			}
		};
		window.addEventListener('keyup', onKeyUp);
		return () => {
		  window.removeEventListener('keyup', onKeyUp);
		};		
	}, [props.focusPosition]);

	useEffect(() => {
		registerStore( 'three-object-environment-events', {
			reducer: ( state = {}, action ) => {
				return action;
			},
			actions: {
				setFocusEvent( focus ) {
					setFocusID(focus);
					return { type: 'SET_FOCUS', focus };
				}
			}
		});
	}, []);
	const canvasRef = useRef(null);
	const handleCanvasCreated = ({ gl, size, viewport }) => {
		gl.setPixelRatio(viewport.dpr);
		gl.setSize(size.width, size.height);
	};
	const ContextBridge = useContextBridge(EditorPluginContext);

	return (
		<>
			<ObjectControls transformMode={transformMode} setTransformMode={setTransformMode}/>
				<Canvas
					name={"maincanvas"}
					camera={{
						fov: 50,
						near: 0.1,
						far: 1000,
						zoom: props.zoom,
						position: [0, 0, 20]
					}}
					ref={canvasRef}
					// shadowMap
					performance={{ min: 0.5 }}
					onCreated={handleCanvasCreated}
					style={{
						margin: "0 Auto",
						height: "100vh",
						// width: "100vw",
						boxSizing: "border-box"
					}}
				>
					<ContextBridge>
						{/* <Perf className="stats" /> */}
						<PerspectiveCamera
							fov={50}
							position={[0, 0, 20]}
							makeDefault
							zoom={1}
						/>
						{props.url && (
							<Suspense fallback={null}>
								{props.hdr && 
									<Environment
										blur={0.05}
										files={props.hdr}
										background
									/>
								}
								{/* <EditControls/> */}
									<ThreeObject
										url={props.url}
										positionY={props.positionY}
										rotationY={props.rotationY}
										scale={props.scale}
										animations={props.animations}
										transformMode={transformMode}
										setFocus={props.setFocus}
										focusID={focusID}
										setFocusPosition={props.setFocusPosition}
										focusPosition={props.focusPosition}
										shouldFocus={shouldFocus}
										changeFocusPoint={props.changeFocusPoint}
										clientId={props.clientId}
									/>
							</Suspense>
						)}
						<OrbitControls makeDefault enableZoom={props.selected} target={props.focusPoint}/>
					</ContextBridge>
				</Canvas>
		</>
	);
}
