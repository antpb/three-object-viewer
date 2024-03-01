// add the missing imports
import React, { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, SpriteAnimator } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { VRMUtils, VRMLoaderPlugin } from "@pixiv/three-vrm";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import defaultVRM from "../../../../../inc/avatars/3ov_default_avatar.vrm";
import blankVRM from "../../../../../inc/avatars/blank_avatar.vrm";
import defaultFont from "../../../../../inc/fonts/roboto.woff";
import idle from "../../../../../inc/avatars/friendly.fbx";
import walk from "../../../../../inc/avatars/walking.fbx";
import run from "../../../../../inc/avatars/running.fbx";
import jump from "../../../../../inc/avatars/Jump.fbx";
// import the mixamo rig utility
import { getMixamoRig } from "../../../utils/rigMap";
import useParticipantsStore from './utils/participantsStore';

/**
 * A map from Mixamo rig name to VRM Humanoid bone name
 */
const mixamoVRMRigMap = getMixamoRig();

/**
 * Download Mixamo animation, convert it for usage with three-vrm, and return the converted animation.
 *
 * @param {string} url - The URL of Mixamo animation data
 * @param {VRM} vrm - The target VRM
 * @returns {Promise<AnimationClip>} - The adapted AnimationClip
 */
function loadMixamoAnimation(url, vrm) {
	let loader;
	if (url.endsWith('.fbx')) {
		loader = new FBXLoader();
	} else {
		loader = new GLTFLoader();
	}
	return loader.loadAsync(url).then((resource) => {
		const clip = resource.animations[0];

		// if resource is GLB, get the scene
		if (url.endsWith('.glb')) {
			resource = resource.scene;
		}

		let tracks = [];

		let restRotationInverse = new THREE.Quaternion();
		let parentRestWorldRotation = new THREE.Quaternion();
		let _quatA = new THREE.Quaternion();
		let _vec3 = new THREE.Vector3();

		// Adjust according to the height of the hips.
		let mixamoHips = resource.getObjectByName('mixamorigHips');
		let regularHips = resource.getObjectByName('hips');
		let mainHip;
		if (mixamoHips) {
			mainHip = mixamoHips.position.y;
		} else if (regularHips) {
			mainHip = regularHips.position.y;
		}
		const vrmHipsY = vrm.humanoid?.getNormalizedBoneNode('hips').getWorldPosition(_vec3).y;
		const vrmRootY = vrm.scene.getWorldPosition(_vec3).y;
		const vrmHipsHeight = Math.abs(vrmHipsY - vrmRootY);
		const hipsPositionScale = vrmHipsHeight / mainHip;

		clip.tracks.forEach((track) => {
			// Convert each track for VRM usage, and push to `tracks`
			let trackSplitted = track.name.split('.');
			let mixamoRigName = trackSplitted[0];
			let vrmBoneName = mixamoVRMRigMap[mixamoRigName];
			let vrmNodeName = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName)?.name;
			let mixamoRigNode = resource.getObjectByName(mixamoRigName);

			if (vrmNodeName != null) {

				let propertyName = trackSplitted[1];

				// Store rotations of rest-pose.
				mixamoRigNode.getWorldQuaternion(restRotationInverse).invert();
				mixamoRigNode.parent.getWorldQuaternion(parentRestWorldRotation);

				if (track instanceof THREE.QuaternionKeyframeTrack) {

					// Retarget rotation of mixamoRig to NormalizedBone.
					for (let i = 0; i < track.values.length; i += 4) {

						let flatQuaternion = track.values.slice(i, i + 4);

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
						new THREE.QuaternionKeyframeTrack(
							`${vrmNodeName}.${propertyName}`,
							track.times,
							track.values.map((v, i) => (vrm.meta?.metaVersion === '0' && i % 2 === 0 ? - v : v)),
						),
					);

				} else if (track instanceof THREE.VectorKeyframeTrack) {
					let value = track.values.map((v, i) => (vrm.meta?.metaVersion === '0' && i % 3 !== 1 ? - v : v) * hipsPositionScale);
					tracks.push(new THREE.VectorKeyframeTrack(`${vrmNodeName}.${propertyName}`, track.times, value));
				}

			}
		});
		return new THREE.AnimationClip('vrmAnimation', clip.duration, tracks);

	});
}

/**
 * Represents a participant in a virtual reality scene.
 *
 * @param {Object} participant - The props for the participant.
 *
 * @return {JSX.Element} The participant.
 */
function Participant(participant) {

	const fallbackURL = defaultVRM;
	let playerURL = participant.playerVRM;
	const clonedModelRef = useRef(null);
	const animationMixerRef = participant.animationMixerRef;
	const animationsRef = participant.animationsRef;
	const vrmsRef = participant.vrmsRef;
	const mixers = participant.mixers;
	const [someVRM, setSomeVRM] = useState(null);
	const [frameName, setFrameName] = useState('BackwardIdle');
	const theScene = useThree();
	const displayNameTextRef = useRef(null);
	const setTextRef = (el) => {
        textRef(el);
    };


	// Load the VRM model
	useEffect(() => {
		const loader = new GLTFLoader();
		loader.register(parser => new VRMLoaderPlugin(parser));
		if( playerURL.endsWith( '.png' ) ){
			// console.log("visitor url is", playerURL);
			playerURL = blankVRM;
		}

		loader.load(playerURL, gltf => {
			setSomeVRM(gltf);
		});
	}, [playerURL]);

	useEffect(() => {
		if (someVRM?.userData?.gltfExtensions?.VRM) {
			const playerController = someVRM.userData.vrm;
			// add the playerController to the vrmsRef
			vrmsRef.current[participant.playerName] = playerController;
			const fetchProfile = async (pfp, modelToModify) => {
				console.log("modelToModify", modelToModify);

				try {
					const response = await fetch(pfp);
					console.log("pfp", pfp, response);
					if (response.status === 200) {
						const textureLoader = new THREE.TextureLoader();
						textureLoader.crossOrigin = '';
						textureLoader.load(pfp, (loadedProfile) => {
							// Now we are sure the texture is loaded
							if(modelToModify.isObject3D){
								modelToModify.traverse((obj) => {
									obj.frustumCulled = false;
				
									if (obj.name === "profile" && obj.material) {
										console.log("profile", obj);
										const newMat = obj.material.clone();
										newMat.map = loadedProfile;
										newMat.map.needsUpdate = true;
										newMat.needsUpdate = true;
										obj.material = newMat;
									}
								});	
							}
						});
						return response;
					}
				} catch (err) {
					// Handle the error properly or rethrow it to be caught elsewhere.
					// console.error("Error fetching profile:", err);
					// throw err;
				}
			};

			// VRMUtils.rotateVRM0(playerController);
			// playerController.scene.rotation.y = 0;
			playerController.scene.scale.set(1, 1, 1);

			// Animation files
			const idleFile = idle;
			const walkingFile = walk;
			const runningFile = run;
			const jumpFile	= jump;
			// Load animations
			let animationFiles = [idleFile, walkingFile, runningFile, jumpFile];
			let animationsPromises = animationFiles.map(file => loadMixamoAnimation(file, playerController));

			// Clone the model
			// const clonedModel = SkeletonUtils.clone(playerController.scene);
			// clonedModel.userData.vrm = clonedModel;

			// Create animation mixer for the cloned model
			const newMixer = new THREE.AnimationMixer(playerController.scene);
			animationMixerRef.current[participant.playerName] = newMixer;
			// console.log("heres the current mixers", animationMixerRef.current[participant.name]);
			mixers.current[participant.playerName] = animationMixerRef.current[participant.playerName];
			participant.profileUserData.current[participant.playerName] = {inWorldName : participant.playerName, pfp: participant.pfp };
			Promise.all(animationsPromises).then(animations => {
				animationsRef.current[participant.playerName] = animations;

				const idleAction = animationMixerRef.current[participant.playerName].clipAction(animations[0]);
				const walkingAction = animationMixerRef.current[participant.playerName].clipAction(animations[1]);
				const runningAction = animationMixerRef.current[participant.playerName].clipAction(animations[2]);
				// console.log("animationmixer", animationMixerRef.current[participant.name] , idleAction, walkingAction, runningAction);
				idleAction.timeScale = 1;
				idleAction.play();
			});
			let isProfileFetched = false;
			// return () => {
			// 	// Cleanup function to stop and dispose mixers
			// 	mixers.current[participant.name].forEach(mixer => mixer.stopAllAction());
			// 	mixers.current[participant.name] = [];
			// };
		}
	}, [someVRM, theScene, participant.p2pcf]);

	useFrame((state, delta) => {
		if(mixers.current[participant.playerName]){
				// Log each action in the mixer
				// mixer._actions.forEach(action => {
				// 	console.log(`Action: ${action._clip.name}, Is Running: ${action.isRunning()}, Effective Weight: ${action.getEffectiveWeight()}, Current Time: ${action.time}`);
				// });
				// Find and play the idle animation explicitly
				const idleAction = mixers.current[participant.playerName]._actions.find(action => action._clip.name === 'idle');
				if (idleAction && !idleAction.isRunning()) {
					console.log("idle action", idleAction);
					idleAction.reset().play();
				}
	
				// Update the mixer
				mixers.current[participant.playerName].update(delta);
		}
	
		if (someVRM?.userData?.vrm) {
			someVRM.userData.vrm.update(delta);  // Update the VRM model
		}
		if (clonedModelRef?.current?.userData?.vrm) {
			clonedModelRef.current.userData.vrm.update(delta);  // Update the cloned VRM model
		}
	});
	
	if (!someVRM || !someVRM.userData?.gltfExtensions?.VRM) {
		return null;
	}

	const playerController = someVRM.userData.vrm;
	const modelClone = SkeletonUtils.clone(playerController.scene);
	modelClone.userData.vrm = playerController;

	//calculate the height of the avatar to be used in the Text component position below
	const box = new THREE.Box3().setFromObject(modelClone);
	let height = (box.max.y - box.min.y) + 0.1;
	// if the height is negative infinity, set the height to 1.5
	if (height === -Infinity) {
		height = 1.8;
	}

	// use textureLoader to load the profile image.
	const textureLoader = new THREE.TextureLoader();
	textureLoader.crossOrigin = '';
	const profileImage = textureLoader.load(participant.profileImage);
	const displayName = participant.inWorldName ? participant.inWorldName : participant.playerName;

	let planeWidth = 0.25;
	let fontSize = 0.04;
	let xPos = 0.045;
	if(displayName.length > 8){
		planeWidth = 0.35;
		xPos = -0.005;
	}
	if(displayName.length >= 16){
		planeWidth = 0.35;
		fontSize = 0.032;
		xPos = -0.005;
	}

	// ends with participant.playerVRM is png?
	let isPng = participant.playerVRM.endsWith('.png');
	return (
		<group userData={{ camExcludeCollision: true }}>
			<group rotation={[0, Math.PI, 0 ]}>
				<mesh
					visible={true}
					position={[0.22, height, 0.005]}
					rotation-y={-Math.PI}
					geometry={new THREE.PlaneGeometry(0.1, 0.1)}
					name="displayNamePfp"
				>
					<meshPhongMaterial side={THREE.DoubleSide} shininess={0} map={profileImage} />
				</mesh>
				<mesh
					visible={true}
					position={[xPos, height, 0.005]}
					rotation-y={-Math.PI}
					geometry={new THREE.PlaneGeometry(planeWidth, 0.07)}
					name="displayNameBackground"
				>
					<meshPhongMaterial side={THREE.DoubleSide} shininess={0} color={0x000000} />
				</mesh>
					<Text
						font={defaultFont}
						anchorX="left"
						overflowWrap="break-word"
						// whiteSpace="nowrap"
						// anchorY="middle"				  
						ref={participant.textRef}
						className="content"
						scale={[1, 1, 1]}
						fontSize={fontSize}
						rotation-y={-Math.PI}
						width={0.5}
						maxWidth={0.5}
						height={10}
						position={[0.15, (height - 0.005), 0]}
						// color={model.textColor}
						transform
					>
						{displayName}
					</Text>
			</group>
			<primitive name={participant.playerName} object={playerController.scene} rotation={[0, Math.PI, 0 ]}/>
			{ isPng && <SpriteAnimator
				position={[0, 1, 0]}
				frameName={frameName}
				scale={[2, 2, 2]}
				fps={10}
				animationNames={['WalkForward', 'WalkBackward', 'ForwardIdle', 'BackwardIdle', 'WalkLeft', 'WalkRight']}
				autoPlay={true}
				asSprite={false}
				alphaTest={0.1}
				loop={true}
				textureImageURL={participant.playerVRM}
				textureDataURL={threeObjectPluginRoot + "/inc/utils/sprite.json"}
			/>}
		</group>
	);
}


export function Participants(props) {
	const theScene = useThree();
	// create a ref for the profile user data information for each participant to be held in an array
	const profileUserData = useRef([]);
	// make ref for animation mixer for each participant
	const animationMixerRef = useRef([]);
	const animationsRef = useRef([]);
	const mixers = useRef([]);
	const displayNameTextRef = useRef(null);
    const textRefs = useRef({});
	const participantRefs = useRef({});
	const vrmsRef = useRef({});
	// const [participants, setParticipant] = useState([]);
	// zustand state and setters
	const participants = useParticipantsStore(state => state.participants);
	const setParticipants = useParticipantsStore(state => state.setParticipants);
	const addParticipant = useParticipantsStore(state => state.addParticipant);
	const removeParticipant = useParticipantsStore(state => state.removeParticipant);

	useEffect(() => {
		if(window.p2pcf){
			window.p2pcf.on("msg", (peer, data) => {
				if(!(peer.id in window.participants)){
					return;
				}
				const finalData = new TextDecoder("utf-8").decode(data);
				const participantData = JSON.parse(finalData);
				const participantObject = theScene.scene.getObjectByName(peer.client_id);
	
				if (animationsRef.current[peer.client_id]) {
					const walkAction = animationMixerRef.current[peer.client_id].clipAction(animationsRef.current[peer.client_id][1]);
					const idleAction = animationMixerRef.current[peer.client_id].clipAction(animationsRef.current[peer.client_id][0]);
					const runAction = animationMixerRef.current[peer.client_id].clipAction(animationsRef.current[peer.client_id][2]);
					const jumpAction = animationMixerRef.current[peer.client_id].clipAction(animationsRef.current[peer.client_id][3]);
					// get their headbone and apply the rotation using the participantData[peer.client_id].headRotation

					if (participantData[peer.client_id].isMoving && participantData[peer.client_id].isMoving === "walking") {
						jumpAction.stop();
						walkAction.play();
						runAction.stop();
						idleAction.stop();
					} else if (participantData[peer.client_id].isMoving && participantData[peer.client_id].isMoving === "jumping") {
						// if jumpaction is not playing stop all others and play it
						if(!jumpAction.isRunning()){
							walkAction.stop();
							runAction.stop();
							idleAction.stop();
							jumpAction.setEffectiveTimeScale(1);
							jumpAction.setEffectiveWeight(1);
							jumpAction.setLoop(THREE.LoopOnce, 1);
							jumpAction.clampWhenFinished = true;
							// initialize on the last frame of the jump animation
							jumpAction.time = jumpAction._clip.duration;
							jumpAction.play();
						}
					} else if (participantData[peer.client_id].isMoving && participantData[peer.client_id].isMoving === "running") {
						walkAction.stop();
						runAction.play();
						idleAction.stop();
						jumpAction.stop();
					} else {
						idleAction.play();
						walkAction.stop();
						runAction.stop();
						jumpAction.stop();
					}

				}
	
				if (participantObject) {
					if(participantData[peer.client_id]?.position && participantData[peer.client_id]?.rotation){
						participantObject.parent.position.fromArray(participantData[peer.client_id].position);
						participantObject.parent.rotation.fromArray(participantData[peer.client_id].rotation);
						// const targetPosition = new THREE.Vector3().fromArray(participantData[peer.client_id].position);
						// participantObject.parent.position.lerp(targetPosition, 0.9); // Adjust the 0.1 factor as needed for smoothness
						// const targetQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler().fromArray(participantData[peer.client_id].rotation));
						// participantObject.parent.quaternion.slerp(targetQuaternion, 0.9); // Adjust the 0.1 factor for smoothness

					}
				}
				if(textRefs.current[peer.client_id] && participantData[peer.client_id]?.inWorldName) {
					textRefs.current[peer.client_id].text = participantData[peer.client_id].inWorldName;
					window.participants[peer.id] = participantData[peer.client_id].inWorldName;
				} else {
					window.participants[peer.id] = participantData[peer.client_id].inWorldName;
				}
			});
		}
	}, []);	

	useEffect(() => {
		const p2pcf = window.p2pcf;
		if (p2pcf) {
			p2pcf.on("peerclose", (peer) => {
				// Directly delete from global participants
				delete window.participants[peer.id];
				const participantObject = theScene.scene.getObjectByName(peer.client_id);
				if (participantObject) {
					theScene.scene.remove(participantObject);
					// Clean up related references
					delete animationMixerRef.current[peer.client_id];
					delete animationsRef.current[peer.client_id];
					delete mixers.current[peer.client_id];
				}
				// Use Zustand's removeParticipant action
				removeParticipant(peer.client_id);
			});
		}
	}, [removeParticipant, theScene.scene]); // Add removeParticipant and theScene.scene as dependencies
	
	useEffect(() => {
		const p2pcf = window.p2pcf;
		if (p2pcf) {
			p2pcf.on("msg", (peer, data) => {
				if (!(peer.id in window.participants)) {
					const finalData = new TextDecoder("utf-8").decode(data);
					const participantData = JSON.parse(finalData);
					// Initialize participant entry if not present
					window.participants[peer.id] = "";
	
					// Construct participant array
					const newParticipant = [peer.client_id, participantData.playerVRM, participantData.inWorldName, participantData.profileImage];
	
					// Use Zustand's addParticipant action
					addParticipant(newParticipant);
				}
				});
		}
	}, [addParticipant]); // Add addParticipant as a dependency
	
	return (
		<>
			{participants && participants.map((item, index) => (
				<Participant 
					key={index}
					playerName={item[0]}
					p2pcf={p2pcf}
					animationMixerRef={animationMixerRef}
					vrmsRef={vrmsRef}
					animationsRef={animationsRef}
					mixers={mixers}
					textRef={(ref) => textRefs.current[item[0]] = ref}
					profileUserData={profileUserData}
					playerVRM = {item[1]}
					inWorldName = {item[2]}
					profileImage = {item[3]}
				/>
			))}
		</>
	);
}

