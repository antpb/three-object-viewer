import React, { useState, useEffect } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { AudioListener, Group, Quaternion, VectorKeyframeTrack, QuaternionKeyframeTrack, LoopPingPong, AnimationClip, NumberKeyframeTrack, AnimationMixer, Vector3, BufferGeometry, MeshBasicMaterial, DoubleSide, Mesh, CircleGeometry, sRGBEncoding } from "three";
import { RigidBody } from "@react-three/rapier";
import {
	useAnimations,
	Text
} from "@react-three/drei";
import { GLTFAudioEmitterExtension } from "three-omi";
import { GLTFGoogleTiltBrushMaterialExtension } from "three-icosa";
import { VRMUtils, VRMSchema, VRMLoaderPlugin, VRMExpressionPresetName } from "@pixiv/three-vrm";
import idle from "../../../../../inc/avatars/friendly.fbx";
import { getMixamoRig } from "../../../utils/rigMap";

/**
 * A map from Mixamo rig name to VRM Humanoid bone name
 */
const mixamoVRMRigMap = getMixamoRig();

/* global THREE, mixamoVRMRigMap */

/**
 * Load Mixamo animation, convert for three-vrm use, and return it.
 *
 * @param {string} url A url of mixamo animation data
 * @param {VRM} vrm A target VRM
 * @returns {Promise<AnimationClip>} The converted AnimationClip
 */
function loadMixamoAnimation(url, vrm, positionY, positionX, positionZ, scaleX, scaleY, scaleZ, rotationX, rotationY, rotationZ, rotationW) {
	const loader = new FBXLoader();
	return loader.loadAsync(url).then((asset) => {
		const clip = AnimationClip.findByName(asset.animations, 'mixamo.com');
		const tracks = [];

		const restRotationInverse = new Quaternion();
		const parentRestWorldRotation = new Quaternion();
		const _quatA = new Quaternion();
		const _vec3 = new Vector3();

		// Adjust with reference to hips height.
		const motionHipsHeight = asset.getObjectByName('mixamorigHips').position.y;
		const vrmHipsY = vrm.humanoid?.getNormalizedBoneNode('hips').getWorldPosition(_vec3).y;
		const vrmRootY = vrm.scene.getWorldPosition(_vec3).y;
		const vrmHipsHeight = Math.abs(vrmHipsY - vrmRootY);
		const hipsPositionScale = vrmHipsHeight / motionHipsHeight;

		clip.tracks.forEach((track) => {
			// Convert each tracks for VRM use, and push to `tracks`
			const trackSplitted = track.name.split('.');
			const mixamoRigName = trackSplitted[0];
			const vrmBoneName = mixamoVRMRigMap[mixamoRigName];
			const vrmNodeName = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName)?.name;
			const mixamoRigNode = asset.getObjectByName(mixamoRigName);

			if (vrmNodeName != null) {

				const propertyName = trackSplitted[1];

				// Store rotations of rest-pose.
				mixamoRigNode.getWorldQuaternion(restRotationInverse).invert();
				mixamoRigNode.parent.getWorldQuaternion(parentRestWorldRotation);

				if (track instanceof QuaternionKeyframeTrack) {

					// Retarget rotation of mixamoRig to NormalizedBone.
					for (let i = 0; i < track.values.length; i += 4) {

						const flatQuaternion = track.values.slice(i, i + 4);

						_quatA.fromArray(flatQuaternion);

						_quatA
							.premultiply(parentRestWorldRotation)
							.multiply(restRotationInverse);

						_quatA.toArray(flatQuaternion);

						flatQuaternion.forEach((v, index) => {

							track.values[index + i] = v;

						});

					}

					tracks.push(
						new QuaternionKeyframeTrack(
							`${vrmNodeName}.${propertyName}`,
							track.times,
							track.values.map((v, i) => (vrm.meta?.metaVersion === '0' && i % 2 === 0 ? - v : v)),
						),
					);

				} else if (track instanceof VectorKeyframeTrack) {
					const value = track.values.map((v, i) => (vrm.meta?.metaVersion === '0' && i % 3 !== 1 ? - v : v) * hipsPositionScale);
					tracks.push(new VectorKeyframeTrack(`${vrmNodeName}.${propertyName}`, track.times, value));
				}

			}

		});

		return new AnimationClip('vrmAnimation', clip.duration, tracks);

	});

}

/**
 * Represents a model object in a virtual reality scene.
 *
 * @param {Object} model - The props for the model object.
 *
 * @return {JSX.Element} The model object.
 */
export function ModelObject(model) {
	const [idleFile, setIdleFile] = useState(model.threeObjectPlugin + idle);
	const [clicked, setClickEvent] = useState();
	const [url, set] = useState(model.url);
	useEffect(() => {
		setTimeout(() => set(model.url), 2000);
	}, []);	

	const [listener] = useState(() => new AudioListener());
	const { scene, clock } = useThree();
	useThree(({ camera }) => {
		camera.add(listener);
	});

	const gltf = useLoader(GLTFLoader, url, (loader) => {
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath( model.threeObjectPluginRoot + "/inc/utils/draco/");
		dracoLoader.setDecoderConfig({type: 'js'});
		loader.setDRACOLoader(dracoLoader);

		loader.register(
			(parser) => new GLTFAudioEmitterExtension(parser, listener)
		);
		if (openbrushEnabled === true) {
			loader.register(
				(parser) =>
					new GLTFGoogleTiltBrushMaterialExtension(
						parser,
						openbrushDirectory
					)
			);
		}
		loader.register((parser) => {
			return new VRMLoaderPlugin(parser);
		});
	});

	const audioObject = gltf.scene.getObjectByProperty('type', 'Audio');

	const { actions } = useAnimations(gltf.animations, gltf.scene);
	const animationClips = gltf.animations;
	const animationList = model.animations ? model.animations.split(",") : "";

	useEffect(() => {
		if (animationList) {
			animationList.forEach((name) => {
				if (Object.keys(actions).includes(name)) {
					console.log(actions[name].play());
				}
			});
		}
	}, []);

	const generator = gltf.asset.generator;

	// return tilt brush if tilt brush
	if (String(generator).includes("Tilt Brush")) {
		return (
			<primitive
				rotation={[model.rotationX, model.rotationY, model.rotationZ]}
				position={[model.positionX, model.positionY, model.positionZ]}
				scale={[model.scaleX, model.scaleY, model.scaleZ]}
				object={gltf.scene}
			/>
		);
	}

	if (gltf?.userData?.gltfExtensions?.VRM) {	
		const vrm = gltf.userData.vrm;
		VRMUtils.rotateVRM0(vrm);
		// Disable frustum culling
		vrm.scene.traverse((obj) => {
			obj.frustumCulled = false;
		});

		// scene.add(vrm.scene);

		const currentVrm = vrm;
		const currentMixer = new AnimationMixer(currentVrm.scene);
		// Load animation
		useFrame((state, delta) => {
			if (currentVrm) {
				currentVrm.update(delta);
			}
			if (currentMixer) {
				currentMixer.update(delta);
			}
		});

		// retarget the animations from mixamo to the current vrm
		useEffect(() => {
		if (currentVrm) {
			loadMixamoAnimation(idleFile, currentVrm, model.positionX, model.positionY, model.positionZ, model.scaleX, model.scaleY, model.scaleZ).then((clip) => {
				currentMixer.clipAction(clip).play();
				currentMixer.update(clock.getDelta());
			});
		}
		}, []);
		return (
			<group
				position={[model.positionX, model.positionY, model.positionZ]}
				rotation={[model.rotationX, model.rotationY, model.rotationZ]}
			>
				<primitive object={vrm.scene} />
			</group>
		);
	}
	// gltf.scene.castShadow = true;
	// enable shadows @todo figure this out
	// gltf.scene.traverse(function (node) {
	// 	if (node.isMesh) {
	// 		node.castShadow = true;
	// 		node.receiveShadow = true;
	// 	}
	// });

	// @todo figure out how to clone gltf proper with extensions and animations
	// const copyGltf = useMemo(() => gltf.scene.clone(), [gltf.scene]);
	// const modelClone = SkeletonUtils.clone(gltf.scene);
	// modelClone.scene.castShadow = true;

	//audioObject
	// Add a triangle mesh on top of the video
	const [triangle] = useState(() => {
		const points = [];
		points.push(
			new Vector3(0, -3, 0),
			new Vector3(0, 3, 0),
			new Vector3(4, 0, 0)
		);
		const geometry = new BufferGeometry().setFromPoints(points);
		const material = new MeshBasicMaterial({
			color: 0x00000,
			side: DoubleSide
		});
		const triangle = new Mesh(geometry, material);
		return triangle;
	});

	const [circle] = useState(() => {
		const geometryCircle = new CircleGeometry(5, 32);
		const materialCircle = new MeshBasicMaterial({
			color: 0xfffff,
			side: DoubleSide
		});
		const circle = new Mesh(geometryCircle, materialCircle);
		return circle;
	});

	if (model.collidable === "1") {
		return (
				<RigidBody
					type="fixed"
					colliders={audioObject ? "cuboid" : "trimesh"}
					lockRotations={true}
					lockTranslations={true}
					friction={0.8}
					rotation={[
						model.rotationX,
						model.rotationY,
						model.rotationZ
					]}
					position={[
						Number(model.positionX),
						Number(model.positionY),
						Number(model.positionZ)
					]}
					scale={[Number(model.scaleX) + 0.01, Number(model.scaleY) + 0.01, Number(model.scaleZ) + 0.01]}
					onCollisionEnter={(manifold, target, other) => {
						if (audioObject) {
							setClickEvent(!clicked);
							if (clicked) {
								audioObject.play();
								triangle.material.visible = false;
								circle.material.visible = false;
							} else {
								audioObject.pause();
								triangle.material.visible = true;
								circle.material.visible = true;
							}
						}
					}}
				>
					<primitive
						object={gltf.scene}
					/>
				</RigidBody>
		);
	}
	return (
		<>
			<primitive
				object={gltf.scene}
				// castShadow
				// receiveShadow
				rotation={[model.rotationX, model.rotationY, model.rotationZ]}
				position={[model.positionX, model.positionY, model.positionZ]}
				scale={[model.scaleX, model.scaleY, model.scaleZ]}
			/>
		</>
	);
}