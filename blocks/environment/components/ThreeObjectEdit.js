import * as THREE from "three";
import React, { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
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
	Sky
} from "@react-three/drei";
import { VRMUtils, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { GLTFAudioEmitterExtension } from "three-omi";
import { Icon, moveTo, rotateLeft, resizeCornerNE } from "@wordpress/icons";
// import { A11y } from "@react-three/a11y";
import { Perf } from "r3f-perf";
// import EditControls from "./EditControls";
import { Resizable } from "re-resizable";
import defaultFont from "../../../inc/fonts/roboto.woff";
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
				<meshStandardMaterial side={THREE.DoubleSide} map={texture_1} />
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

function VideoObject(threeVideo) {

	const [url, set] = useState(threeVideo.modelUrl);
	const [screen, setScreen] = useState(null);
	const [screenParent, setScreenParent] = useState(null);
  
	useEffect(() => {
	  setTimeout(() => set(threeVideo.modelUrl), 2000);
	}, []);
  
	const gltf = useLoader(GLTFLoader, threeVideo.modelUrl, (loader) => {
	  loader.register((parser) => {
		return new VRMLoaderPlugin(parser);
	  });
	});
  
	useEffect(() => {
		if (gltf.scene) {
		  let foundScreen;
		  gltf.scene.traverse((child) => {
			if (child.name === "screen") {
			  console.log("found it", child);
			  foundScreen = child;
			}
		  });
	  
		  if (foundScreen) {
			setScreen(foundScreen);
			setScreenParent(foundScreen.parent);
			// Update screen's material with video texture
			const videoTexture = new THREE.VideoTexture(video);
			videoTexture.encoding = THREE.sRGBEncoding;
			const material = new THREE.MeshBasicMaterial({ map: videoTexture, toneMapped: false });
			foundScreen.material = material;
		  }
		}  
	}, [gltf, video]);
	// log the video object
	console.log(threeVideo, "threeVideo");
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
	const [isSelected, setIsSelected] = useState();
	const [threeVideoBlockAttributes, setThreeVideoBlockAttributes] = useState(
		wp.data
			.select("core/block-editor")
			.getBlockAttributes(threeVideo.videoID)
	);
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
				{threeVideoBlockAttributes && (
					<group>
						{threeVideoBlockAttributes.customModel ? (
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
						]}>
						{gltf.scene && <primitive object={gltf.scene} />}
						</group>
						) : (
						<mesh
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
							<meshBasicMaterial toneMapped={false}>
								<videoTexture
									attach="map"
									args={[video]}
									encoding={THREE.sRGBEncoding}
								/>
							</meshBasicMaterial>
							<planeGeometry
								args={[
									threeVideoBlockAttributes.aspectWidth / 12,
									threeVideoBlockAttributes.aspectHeight / 12
								]}
							/>
						</mesh>
						)}
					</group>
				)}
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
									<meshBasicMaterial attach="material" color={0x000000} opacity={0.5}	transparent={ true } />
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

	const editorHtmlToAdd = [];
	let htmlobject;
	let htmlobjectId;

	const currentBlocks = wp.data.select("core/block-editor").getBlocks();
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
							const something = [{ modelobject, modelID }];
							editorModelsToAdd.push({ modelobject, modelID });
						}
						if (
							innerBlock.name ===
							"three-object-viewer/npc-block"
						) {
							npcObject = innerBlock.attributes;
							npcID = innerBlock.clientId;
							const something = [{ npcObject, npcID }];
							editorNPCsToAdd.push({ npcObject, npcID });
						}
						if (
							innerBlock.name ===
							"three-object-viewer/three-image-block"
						) {
							imageobject = innerBlock.attributes;
							imageID = innerBlock.clientId;
							const something = [{ imageobject, imageID }];
							imageElementsToAdd.push({ imageobject, imageID });
						}
						if (
							innerBlock.name ===
							"three-object-viewer/three-video-block"
						) {
							videoobject = innerBlock.attributes;
							videoID = innerBlock.clientId;
							const something = [{ videoobject, videoID }];
							videoElementsToAdd.push({ videoobject, videoID });
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
		// const dracoLoader = new DRACOLoader();
		// dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
		// loader.setDRACOLoader(dracoLoader);

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

	return (
		<>
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
				justifyContent: "flex-end",
				position: "absolute",
				top: "0",
				right: "0",
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

	return (
		<>
			<ObjectControls transformMode={transformMode} setTransformMode={setTransformMode}/>
			<Resizable
				defaultSize={{
					height: "90vh",
					width: "100%",
				}}
				enable={{
					top: false,
					right: false,
					bottom: true,
					left: false,
					topRight: false,
					bottomRight: false,
					bottomLeft: false,
					topLeft: false,
				}}
				style={{
					flex: 1,
					paddingLeft: "220px",
					backgroundColor: "#cbcbcb",
				}}
			>
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
					shadowMap
					performance={{ min: 0.5 }}
					onCreated={handleCanvasCreated}
					style={{
						margin: "0 Auto",
						height: "100vh",
						// width: "100vw",
						boxSizing: "border-box"
					}}
				>
					{/* <Perf className="stats" /> */}
					<PerspectiveCamera
						fov={50}
						position={[0, 0, 20]}
						makeDefault
						zoom={1}
					/>
					<ambientLight intensity={0.5} />
					<directionalLight
						intensity={0.6}
						position={[0, 2, 2]}
						shadow-mapSize-width={2048}
						shadow-mapSize-height={2048}
						castShadow
					/>
					{props.url && (
						<Suspense fallback={null}>
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
							/>
						</Suspense>
					)}
					<OrbitControls makeDefault enableZoom={props.selected} target={props.focusPoint}/>
				</Canvas>
			</Resizable>
		</>
	);
}
