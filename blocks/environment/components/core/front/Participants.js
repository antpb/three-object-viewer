import React, { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, SpriteAnimator } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
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
	const animationMixerRef = participant.animationMixerRef;
	const animationsRef = participant.animationsRef;
	const vrmsRef = participant.vrmsRef;
	const mixers = participant.mixers;
	const [someVRM, setSomeVRM] = useState(null);
	const [frameName, setFrameName] = useState('BackwardIdle');
	const theScene = useThree();
	const { gl } = theScene;
	const displayNameTextRef = useRef(null);
	const [participantData, setParticipantData] = useState(null);
	const participantObject = useRef(null);
	const interpolationDuration = 300; // Adjust this value to control the smoothness
	const [profileImage, setProfileImage] = useState(null);
	const lastJumpTimes = useRef({});
	const height = useRef(1.8);

	useEffect(() => {
			const textureLoader = new THREE.TextureLoader();
			textureLoader.crossOrigin = '';
			textureLoader.load(participant.profileImage, (texture) => {
				setProfileImage(texture);
			});
	}, []);

	// Load the VRM model
	useEffect(() => {
	  const loader = new GLTFLoader();
	  const ktx2Loader = new KTX2Loader();
	  ktx2Loader.setTranscoderPath(threeObjectPluginRoot + "/inc/utils/basis/");
	  ktx2Loader.detectSupport(gl);
	  loader.setKTX2Loader(ktx2Loader);
	  loader.register(parser => new VRMLoaderPlugin(parser));
	  if (playerURL.endsWith('.png')) {
		playerURL = blankVRM;
	  }
  
	  loader.load(playerURL, gltf => {
		setSomeVRM(gltf);
	  });
	}, [playerURL, gl]);
  
	useEffect(() => {
	  if (someVRM?.userData?.gltfExtensions?.VRM) {
		const playerController = someVRM.userData.vrm;
		vrmsRef.current[participant.playerName] = playerController;
		playerController.scene.scale.set(1, 1, 1);
  
		// Animation files
		const animationFiles = [idle, walk, run, jump];
		const animationsPromises = animationFiles.map(file => loadMixamoAnimation(file, playerController));
  
		// Create animation mixer
		const newMixer = new THREE.AnimationMixer(playerController.scene);
		animationMixerRef.current[participant.playerName] = newMixer;
		mixers.current[participant.playerName] = animationMixerRef.current[participant.playerName];
		participant.profileUserData.current[participant.playerName] = { inWorldName: participant.playerName, pfp: participant.pfp };
  
		Promise.all(animationsPromises).then(animations => {
		  animationsRef.current[participant.playerName] = animations;
  
		  const idleAction = animationMixerRef.current[participant.playerName].clipAction(animations[0]);
		  const walkAction = animationMixerRef.current[participant.playerName].clipAction(animations[1]);
		  const runAction = animationMixerRef.current[participant.playerName].clipAction(animations[2]);
		  const jumpAction = animationMixerRef.current[participant.playerName].clipAction(animations[3]);
		  walkAction.setEffectiveWeight(0);
		  runAction.setEffectiveWeight(0);
		  jumpAction.setEffectiveWeight(0);
		  idleAction.setEffectiveWeight(1);
		  idleAction.timeScale = 1;
		  idleAction.play();
		});
	  }
	}, [someVRM, theScene, participant.p2pcf, participant.playerName, participant.pfp, vrmsRef, animationMixerRef, mixers, animationsRef]);
  
	useEffect(() => {
		if (window.p2pcf) {
		  window.p2pcf.on("msg", (peer, data) => {
			if (!(peer.id in window.participants)) {
			  return;
			}

			const finalData = new TextDecoder("utf-8").decode(data);
			const participantData = JSON.parse(finalData);
			if (participantObject.current) {
				// Calculate the height of the avatar
				const box = new THREE.Box3().setFromObject(participantObject.current);
				height.current = (box.max.y - box.min.y) + (participantData[peer.client_id].isMoving?.action === "jumping" ? 0.5 : 0.1);
				if (height.current === -Infinity) {
					height.current = 1.8;
				}

				if (participantData[peer.client_id]?.position && participantData[peer.client_id]?.rotation) {
					setParticipantData((prevData) => ({
						...prevData,
						[peer.client_id]: {
						...participantData[peer.client_id],
						position: participantData[peer.client_id].position,
						rotation: participantData[peer.client_id].rotation,
						timestamp: Date.now(),
						},
					}));
				}
			}

			if (animationsRef.current[peer.client_id]) {
				const idleAction = animationMixerRef.current[peer.client_id].clipAction(animationsRef.current[peer.client_id][0]);
				const walkAction = animationMixerRef.current[peer.client_id].clipAction(animationsRef.current[peer.client_id][1]);
				const runAction = animationMixerRef.current[peer.client_id].clipAction(animationsRef.current[peer.client_id][2]);
				const jumpAction = animationMixerRef.current[peer.client_id].clipAction(animationsRef.current[peer.client_id][3]);
				if (participantData[peer.client_id].isMoving && participantData[peer.client_id].isMoving.action === "jumping") {	
				  if (!jumpAction.isRunning()) {
					const currentTime = Date.now();
					const lastJumpTime = lastJumpTimes.current[peer.client_id] || 0;
					const jumpCooldown = 1000; // Adjust this value to set a cooldown between jumps
			  
					if (currentTime - lastJumpTime >= jumpCooldown) {
					  lastJumpTimes.current[peer.client_id] = currentTime;
					  walkAction.stop();
					  runAction.stop();
					  idleAction.stop();
					  jumpAction.setEffectiveWeight(1);
					  idleAction.setEffectiveWeight(0);
					  runAction.setEffectiveWeight(0);
					  walkAction.setEffectiveWeight(0);	  
					  jumpAction.reset();
					  jumpAction.setEffectiveTimeScale(1);
					  jumpAction.setLoop(THREE.LoopOnce, 1);
					  jumpAction.clampWhenFinished = true;
					  jumpAction.play();
					}
				  }
				} else if (participantData[peer.client_id].isMoving && participantData[peer.client_id].isMoving.action === "walking") {
					jumpAction.setEffectiveWeight(0);
					idleAction.setEffectiveWeight(0);
					runAction.setEffectiveWeight(0);
					walkAction.setEffectiveWeight(1);
					jumpAction.stop();
					walkAction.play();
					runAction.stop();
					idleAction.stop();
				} else if (participantData[peer.client_id].isMoving && participantData[peer.client_id].isMoving.action === "running") {
					jumpAction.setEffectiveWeight(0);
					idleAction.setEffectiveWeight(0);
					runAction.setEffectiveWeight(1);
					walkAction.setEffectiveWeight(0);
					walkAction.stop();
					runAction.play();
					idleAction.stop();
					jumpAction.stop();
				} else {
					jumpAction.setEffectiveWeight(0);
					idleAction.setEffectiveWeight(1);
					runAction.setEffectiveWeight(0);
					walkAction.setEffectiveWeight(0);
					idleAction.play();
					walkAction.stop();
					runAction.stop();
					jumpAction.stop();
				}
			  }
					  
			if (displayNameTextRef.current && participantData[peer.client_id]?.inWorldName) {
			  displayNameTextRef.current.text = participantData[peer.client_id].inWorldName;
			  window.participants[peer.id] = participantData[peer.client_id].inWorldName;
			} else {
			  window.participants[peer.id] = participantData[peer.client_id].inWorldName;
			}
		  });
		}
	  }, [window.p2pcf, animationMixerRef, animationsRef]);
	  
	useFrame((state, delta) => {
		if (participantObject.current && participantData && participantData[participant.playerName]) {
			const { position, rotation, timestamp, isMoving } = participantData[participant.playerName];
			const now = Date.now();
			const interpolationFactor = isMoving.action === "jumping" ? Math.min((now - timestamp) / 800, 1) :  Math.min((now - timestamp) / interpolationDuration, 1);

			if(isMoving?.action === "jumpStop") {
				console.log("we got a stopper")
				//statically set the position, no lerp.
				participantObject.current.parent.position.lerp(new THREE.Vector3(...position), Math.min((now - timestamp) / 100, 1));
				// set the action to idle
				setParticipantData((prevData) => ({
					...prevData,
					[participant.playerName]: {
						...prevData[participant.playerName],
						isMoving: false,
						position: position,
					},
				}));				
			} else{
				participantObject.current.parent.position.lerp(new THREE.Vector3(...position), interpolationFactor);
			}
		
			// Convert rotation array to Euler
			const targetRotation = new THREE.Euler(...rotation);
			// Create a Quaternion from the target rotation
			const targetQuaternion = new THREE.Quaternion().setFromEuler(targetRotation);
			// Slerp the current rotation towards the target rotation
			participantObject.current.parent.quaternion.slerp(targetQuaternion, interpolationFactor);
		}
	  
		if (mixers.current[participant.playerName]) {
		//   const idleAction = mixers.current[participant.playerName]._actions.find(action => action._clip.name === 'idle');
		  const idleAction = mixers.current[participant.playerName]._actions[0];
		  const walkAction = mixers.current[participant.playerName]._actions[1];
		  const runAction = mixers.current[participant.playerName]._actions[2];
		  const jumpAction = mixers.current[participant.playerName]._actions[3];

		//   if (idleAction && !idleAction.isRunning()) {
		// 	idleAction.setEffectiveWeight(1);
		// 	jumpAction.setEffectiveWeight(0);
		// 	walkAction.setEffectiveWeight(0);
		// 	runAction.setEffectiveWeight(0);
		// 	idleAction.reset().play();
		//   }
	  
		  mixers.current[participant.playerName].update(state.clock.getDelta());
		}
		if (mixers.current[participant.playerName]) {
			mixers.current[participant.playerName].update(delta);
		  }
		
		  if (someVRM?.userData?.vrm) {
			someVRM.userData.vrm.update(delta);
		  }
			  
		if (someVRM?.userData?.vrm) {
		  someVRM.userData.vrm.update(state.clock.getDelta());
		}
		
	});
		
	if (!someVRM || !someVRM.userData?.gltfExtensions?.VRM) {
	  return null;
	}
  
	const playerController = someVRM.userData.vrm;
	const modelClone = SkeletonUtils.clone(playerController.scene);
	modelClone.userData.vrm = playerController;
  
	const displayName = participant.inWorldName ? participant.inWorldName : participant.playerName;
  
	let planeWidth = 0.25;
	let fontSize = 0.04;
	let xPos = 0.045;
	if (displayName.length > 8) {
	  planeWidth = 0.35;
	  xPos = -0.005;
	}
	if (displayName.length >= 16) {
	  planeWidth = 0.35;
	  fontSize = 0.032;
	  xPos = -0.005;
	}
  
	const isPng = participant.playerVRM.endsWith('.png');
	const color = "#000000";
	const colorValue = new THREE.Color(parseInt(color.replace("#", "0x"), 16));
  
	return (
		<group userData={{ camExcludeCollision: true }}>
			<group userData={{ camExcludeCollision: true }} rotation={[0, Math.PI, 0]}>
				<mesh
					visible={true}
					position={[0.22, height.current, 0.005]}
					rotation-y={-Math.PI}
					geometry={new THREE.PlaneGeometry(0.1, 0.1)}
					name="displayNamePfp"
				>
					<meshPhongMaterial side={THREE.DoubleSide} shininess={0} map={profileImage} />
				</mesh>
				<mesh
					visible={true}
					position={[xPos, height.current, 0.005]}
					rotation-y={-Math.PI}
					geometry={new THREE.PlaneGeometry(planeWidth, 0.07)}
					name="displayNameBackground"
				>
					<meshPhongMaterial side={THREE.DoubleSide} shininess={0} color={colorValue} />
				</mesh>
				<Text
					font={defaultFont}
					anchorX="left"
					overflowWrap="break-word"
					ref={displayNameTextRef}
					className="content"
					scale={[1, 1, 1]}
					fontSize={fontSize}
					rotation-y={-Math.PI}
					width={0.5}
					maxWidth={0.5}
					height={10}
					position={[0.15, (height.current - 0.005), 0]}
					transform
				>
					{displayName}
				</Text>
			</group>
		<primitive userData={{ camExcludeCollision: true }} ref={participantObject} name={participant.playerName} object={playerController.scene} rotation={[0, Math.PI, 0]} />
		{isPng && (
		  <SpriteAnimator
			position={[0, 1, 0]}
			frameName={frameName}
			userData={{ camExcludeCollision: true }}
			scale={[2, 2, 2]}
			fps={10}
			animationNames={['WalkForward', 'WalkBackward', 'ForwardIdle', 'BackwardIdle', 'WalkLeft', 'WalkRight']}
			autoPlay={true}
			asSprite={false}
			alphaTest={0.1}
			loop={true}
			textureImageURL={participant.playerVRM}
			textureDataURL={threeObjectPluginRoot + "/inc/utils/sprite.json"}
		  />
		)}
	  </group>
	);
  }

export function Participants(props) {
	const theScene = useThree();
	const profileUserData = useRef([]);
	const animationMixerRef = useRef([]);
	const animationsRef = useRef([]);
	const mixers = useRef([]);
	const vrmsRef = useRef({});
	const participants = useParticipantsStore(state => state.participants);
	const addParticipant = useParticipantsStore(state => state.addParticipant);
	const removeParticipant = useParticipantsStore(state => state.removeParticipant);
	// const lastJumpTimes = useRef({});

	// useEffect(() => {
	// 	if (window.p2pcf) {
	// 	  window.p2pcf.on("msg", (peer, data) => {
	// 		if (!(peer.id in window.participants)) {
	// 		  return;
	// 		}
	  
	// 		const finalData = new TextDecoder("utf-8").decode(data);
	// 		const participantData = JSON.parse(finalData);
	  
	// 		if (animationsRef.current[peer.client_id]) {
	// 		  const walkAction = animationMixerRef.current[peer.client_id].clipAction(animationsRef.current[peer.client_id][1]);
	// 		  const idleAction = animationMixerRef.current[peer.client_id].clipAction(animationsRef.current[peer.client_id][0]);
	// 		  const runAction = animationMixerRef.current[peer.client_id].clipAction(animationsRef.current[peer.client_id][2]);
	// 		  const jumpAction = animationMixerRef.current[peer.client_id].clipAction(animationsRef.current[peer.client_id][3]);
	  
	// 		  if (participantData[peer.client_id].isMoving && participantData[peer.client_id].isMoving.action === "jumping") {
	// 			walkAction.stop();
	// 			runAction.stop();
	// 			idleAction.stop();
			  
	// 			if (!jumpAction.isRunning()) {
	// 			  const currentTime = Date.now();
	// 			  const lastJumpTime = lastJumpTimes.current[peer.client_id] || 0;
	// 			  const jumpCooldown = 1000; // Adjust this value to set a cooldown between jumps
			  
	// 			  if (currentTime - lastJumpTime >= jumpCooldown) {
	// 				console.log("Jumping. this should only happen once.");
	// 				lastJumpTimes.current[peer.client_id] = currentTime;
	// 				jumpAction.reset();
	// 				jumpAction.setEffectiveTimeScale(1);
	// 				jumpAction.setEffectiveWeight(1);
	// 				jumpAction.setLoop(THREE.LoopOnce, 1);
	// 				jumpAction.clampWhenFinished = true;
	// 				jumpAction.play();
	// 			  }
	// 			}
	// 		  } else if (participantData[peer.client_id].isMoving && participantData[peer.client_id].isMoving.action === "walking") {
	// 			jumpAction.stop();
	// 			walkAction.play();
	// 			runAction.stop();
	// 			idleAction.stop();
	// 		  } else if (participantData[peer.client_id].isMoving && participantData[peer.client_id].isMoving.action === "running") {
	// 			walkAction.stop();
	// 			runAction.play();
	// 			idleAction.stop();
	// 			jumpAction.stop();
	// 		  } else {
	// 			idleAction.play();
	// 			walkAction.stop();
	// 			runAction.stop();
	// 			jumpAction.stop();
	// 		  }
	// 		}

	// 		if (participantData[peer.client_id]?.inWorldName) {
	// 		  window.participants[peer.id] = participantData[peer.client_id].inWorldName;
	// 		}
	// 	  });
	// 	}
	//   }, [window.p2pcf, animationMixerRef, animationsRef]);

	useEffect(() => {
	  const p2pcf = window.p2pcf;
	  if (p2pcf) {
		p2pcf.on("peerclose", (peer) => {
		  delete window.participants[peer.id];
		  delete animationMixerRef.current[peer.client_id];
		  delete animationsRef.current[peer.client_id];
		  delete mixers.current[peer.client_id];
		  removeParticipant(peer.client_id);
		});
	  }
	}, [removeParticipant, window.p2pcf]);
  
	useEffect(() => {
	  const p2pcf = window.p2pcf;
	  if (p2pcf) {
		p2pcf.on("msg", (peer, data) => {
		  if (!(peer.id in window.participants)) {
			const finalData = new TextDecoder("utf-8").decode(data);
			const participantData = JSON.parse(finalData);
			window.participants[peer.id] = "";
  
			const newParticipant = [peer.client_id, participantData.playerVRM, participantData.inWorldName, participantData.profileImage];
			addParticipant(newParticipant);
		  }
		});
	  }
	}, [window.p2pcf]);
  
	return (
		<>
		  {participants && participants.map((item, index) => {
			const profileImage = item[3];
			if (profileImage) {
			  return (
				<Participant
				  key={index}
				  playerName={item[0]}
				  p2pcf={p2pcf}
				  animationMixerRef={animationMixerRef}
				  vrmsRef={vrmsRef}
				  animationsRef={animationsRef}
				  mixers={mixers}
				  profileUserData={profileUserData}
				  playerVRM={item[1]}
				  inWorldName={item[2]}
				  profileImage={profileImage}
				/>
			  );
			}
	
			return null;
		  })}
		</>
	  );
}	