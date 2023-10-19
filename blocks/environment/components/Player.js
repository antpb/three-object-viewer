import { Mesh, Raycaster, DoubleSide, MeshBasicMaterial, RingGeometry, AudioListener, Group, Quaternion, Matrix4, VectorKeyframeTrack, QuaternionKeyframeTrack, LoopPingPong, AnimationClip, NumberKeyframeTrack, AnimationMixer, Vector3, Vector2, BufferGeometry, CircleGeometry, sRGBEncoding, MathUtils } from "three";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { useFrame, useLoader, useThree, Interactive } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from '@react-three/drei';
import { useKeyboardControls } from "./Controls"
import { useRef, useState, useEffect } from "react";
import { RigidBody, CapsuleCollider, useRapier, vec3, interactionGroups, CuboidCollider } from "@react-three/rapier";
import defaultVRM from "../../../inc/avatars/3ov_default_avatar.vrm";
import { VRMUtils, VRMSchema, VRMLoaderPlugin, VRMExpressionPresetName, VRMHumanBoneName } from "@pixiv/three-vrm";
import { useXR } from "@react-three/xr";
import idle from "../../../inc/avatars/friendly.fbx";
import walk from "../../../inc/avatars/walking.fbx";
import run from "../../../inc/avatars/running.fbx";

function Reticle() {
	const { camera } = useThree();
	var reticle = new Mesh(
		new RingGeometry( 0.85 * 5, 5, 32),
		new MeshBasicMaterial( {color: 0xffffff, side: DoubleSide })
	);
	reticle.scale.set(1.3, 1.3, 1.3);
	reticle.position.z = -1000;
	reticle.name = "reticle";
	reticle.frustumCulled = false;
	reticle.renderOrder = 1000;
	reticle.lookAt(camera.position)
	reticle.material.depthTest = false;
	reticle.material.depthWrite = false;
	reticle.material.opacity = 0.025;

	return reticle;
}
/**
 * A map from Mixamo rig name to VRM Humanoid bone name
 */
const mixamoVRMRigMap = {
	mixamorigHips: 'hips',
	mixamorigSpine: 'spine',
	mixamorigSpine1: 'chest',
	mixamorigSpine2: 'upperChest',
	mixamorigNeck: 'neck',
	mixamorigHead: 'head',
	mixamorigLeftShoulder: 'leftShoulder',
	mixamorigLeftArm: 'leftUpperArm',
	mixamorigLeftForeArm: 'leftLowerArm',
	mixamorigLeftHand: 'leftHand',
	mixamorigLeftHandThumb1: 'leftThumbMetacarpal',
	mixamorigLeftHandThumb2: 'leftThumbProximal',
	mixamorigLeftHandThumb3: 'leftThumbDistal',
	mixamorigLeftHandIndex1: 'leftIndexProximal',
	mixamorigLeftHandIndex2: 'leftIndexIntermediate',
	mixamorigLeftHandIndex3: 'leftIndexDistal',
	mixamorigLeftHandMiddle1: 'leftMiddleProximal',
	mixamorigLeftHandMiddle2: 'leftMiddleIntermediate',
	mixamorigLeftHandMiddle3: 'leftMiddleDistal',
	mixamorigLeftHandRing1: 'leftRingProximal',
	mixamorigLeftHandRing2: 'leftRingIntermediate',
	mixamorigLeftHandRing3: 'leftRingDistal',
	mixamorigLeftHandPinky1: 'leftLittleProximal',
	mixamorigLeftHandPinky2: 'leftLittleIntermediate',
	mixamorigLeftHandPinky3: 'leftLittleDistal',
	mixamorigRightShoulder: 'rightShoulder',
	mixamorigRightArm: 'rightUpperArm',
	mixamorigRightForeArm: 'rightLowerArm',
	mixamorigRightHand: 'rightHand',
	mixamorigRightHandPinky1: 'rightLittleProximal',
	mixamorigRightHandPinky2: 'rightLittleIntermediate',
	mixamorigRightHandPinky3: 'rightLittleDistal',
	mixamorigRightHandRing1: 'rightRingProximal',
	mixamorigRightHandRing2: 'rightRingIntermediate',
	mixamorigRightHandRing3: 'rightRingDistal',
	mixamorigRightHandMiddle1: 'rightMiddleProximal',
	mixamorigRightHandMiddle2: 'rightMiddleIntermediate',
	mixamorigRightHandMiddle3: 'rightMiddleDistal',
	mixamorigRightHandIndex1: 'rightIndexProximal',
	mixamorigRightHandIndex2: 'rightIndexIntermediate',
	mixamorigRightHandIndex3: 'rightIndexDistal',
	mixamorigRightHandThumb1: 'rightThumbMetacarpal',
	mixamorigRightHandThumb2: 'rightThumbProximal',
	mixamorigRightHandThumb3: 'rightThumbDistal',
	mixamorigLeftUpLeg: 'leftUpperLeg',
	mixamorigLeftLeg: 'leftLowerLeg',
	mixamorigLeftFoot: 'leftFoot',
	mixamorigLeftToeBase: 'leftToes',
	mixamorigRightUpLeg: 'rightUpperLeg',
	mixamorigRightLeg: 'rightLowerLeg',
	mixamorigRightFoot: 'rightFoot',
	mixamorigRightToeBase: 'rightToes',
};

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
		loader = new FBXLoader(); // Use an FBX loader
	} else {
		loader = new GLTFLoader(); // Use a GLTF loader
	}
	return loader.loadAsync(url).then((resource) => {
		const clip = resource.animations[0]; // Extract the AnimationClip

		// if resource is GLB, get the scene
		if (url.endsWith('.glb')) {
			resource = resource.scene;
		}

		let tracks = []; // KeyframeTracks compatible with VRM to be stored here

		let restRotationInverse = new Quaternion();
		let parentRestWorldRotation = new Quaternion();
		let _quatA = new Quaternion();
		let _vec3 = new Vector3();

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

				if (track instanceof QuaternionKeyframeTrack) {

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
						new QuaternionKeyframeTrack(
							`${vrmNodeName}.${propertyName}`,
							track.times,
							track.values.map((v, i) => (vrm.meta?.metaVersion === '0' && i % 2 === 0 ? - v : v)),
						),
					);

				} else if (track instanceof VectorKeyframeTrack) {
					let value = track.values.map((v, i) => (vrm.meta?.metaVersion === '0' && i % 3 !== 1 ? - v : v) * hipsPositionScale);
					tracks.push(new VectorKeyframeTrack(`${vrmNodeName}.${propertyName}`, track.times, value));
				}

			}

		});

		return new AnimationClip('vrmAnimation', clip.duration, tracks);

	});
}

export default function Player(props) {
	const canMoveRef = useRef(true);
	const falling = useRef(true);
	const animationsRef = useRef();
	const orbitRef = useRef();
	const rigidRef = useRef();
	const castRef = useRef();

	const idleFile = threeObjectPlugin + idle;
	const walkingFile	= threeObjectPlugin + walk;
	const runningFile	= threeObjectPlugin + run;
	// const [walkFile, setWalkFile] = useState(model.threeObjectPlugin + walk);
	const spawnPoint = props.spawnPoint? props.spawnPoint.map(Number) : [0,0,0];  // convert spawnPoint to numbers
	const { controllers } = useXR();
	const { camera, scene, clock } = useThree();
	const { world, rapier } = useRapier();
	const participantObject = scene.getObjectByName("playerOne");
	const mouse = new Vector2();
		
	// if (!scene.getObjectByName("reticle")){
	// 	camera.add(Reticle());
	// }

	if ( controllers.length > 0 ) {
		scene.remove(scene.getObjectByName("reticle"));
	}


	// useFrame(() => {
	// 	if (participantObject) {
	// 		const posY = participantObject.parent.position.y;
	// 		camera.position.setY(posY + 0.23);
	// 	}
	// });

	// Participant VRM.
	const fallbackURL = threeObjectPlugin + defaultVRM;
	const defaultAvatarURL = props.defaultAvatar;
	let playerURL = userData.vrm ? userData.vrm : fallbackURL;
	if(defaultAvatarURL){
		playerURL = defaultAvatarURL;
	}
	const someSceneState = useLoader(GLTFLoader, playerURL, (loader) => {
		loader.register((parser) => {
			return new VRMLoaderPlugin(parser);
		});
	});

	if (someSceneState?.userData?.gltfExtensions?.VRM) {
		const playerController = someSceneState.userData.vrm;
		// Check if the avatar is reachable with a 200 response code.
		// Check if the avatar is reachable with a 200 response code.
		const fetchProfile = async () => {
			try {
			const response = await fetch(userData.profileImage);
			if (response.status === 200) {
				const loadedProfile = useLoader(TextureLoader, userData.profileImage);
		
				playerController.scene.traverse((obj) => {
				obj.frustumCulled = false;
		
				if (obj.name === "profile") {
					const newMat = obj.material.clone();
					newMat.map = loadedProfile;
					obj.material = newMat;
					obj.material.map.needsUpdate = true;
				}
				});
			}
			return response;
			} catch (err) {
			// Handle the error properly or rethrow it to be caught elsewhere.
			// console.error("Error fetching profile:", err);
			// throw err;
			}
		};
		setTimeout(() => {
			fetchProfile()
			  .then((response) => {
				// handle the response here if needed
			  })
			  .catch((err) => {
				// Handle the error here if needed
			  });
		}, 1000);
		// VRMUtils.rotateVRM0(playerController);
		const currentVrm = playerController;
		const currentMixer = new AnimationMixer(currentVrm.scene);

	
		// need to dynamically do this on scroll
		// playerController.firstPerson.humanoid.humanBones.head.node.scale.set([
		// 	0, 0, 0
		// ]);

		// const movement = useKeyboardControls();
		const velocity = useRef(spawnPoint);  // Use a ref instead of state for velocity
		let lastUpdateTime = 0;
		let blinkTimer = 0;  // Initialize the blinkTimer outside the useFrame loop.
		let blinkInterval = 5 + Math.random() * 10;  // Blink roughly every 2 to 6 seconds

		// frame loop
		useFrame((state, delta) => {
			let isMoving = false;
			const currentTime = state.clock.elapsedTime;
			const timeSinceLastUpdate = currentTime - lastUpdateTime;
			let rigidBodyPosition = [0, 0, 0]
			if(rigidRef.current?.translation()){
				rigidBodyPosition = rigidRef.current.translation();
			}
			const forward = new Vector3();
			camera.getWorldDirection(forward);
			forward.negate(); // In Three.js camera looks towards negative Z, so we negate the vector
			forward.normalize();
			const right = new Vector3();
			right.crossVectors(camera.up, forward);
			right.normalize();
			// initialize the moving state to false
			const raycaster = state.raycaster;		
			if (timeSinceLastUpdate >= 0.1) {
				lastUpdateTime = currentTime;
			}
			if (currentVrm) {
				currentVrm.update(delta);
			}
			if (currentMixer) {
				currentMixer.update(delta);
			}
			blinkTimer += delta;  // Increment timer
		
			//blink
			if (blinkTimer > blinkInterval) {
				if (currentVrm) {
					// Randomize the duration of the blink between 0.05 and 0.15 seconds
					const blinkDuration = 0.05 + Math.random() * 0.1;
					const steps = Math.round(blinkDuration / 0.01);  // We want each step to be roughly 0.01 seconds
			
					// Close both eyes over the course of the blink duration
					for(let i = 0; i <= steps; i++) {
						const s = i / steps;
						setTimeout(() => {
							currentVrm.expressionManager.setValue('blinkLeft', s);
							currentVrm.expressionManager.setValue('blinkRight', s);
						}, s * blinkDuration * 1000);
					}
			
					// Open both eyes over the course of the blink duration, after a small delay
					setTimeout(() => {
						for(let i = 0; i <= steps; i++) {
							const s = 1 - i / steps;
							setTimeout(() => {
								currentVrm.expressionManager.setValue('blinkLeft', s);
								currentVrm.expressionManager.setValue('blinkRight', s);
							}, (1 - s) * blinkDuration * 1000);
						}
					}, blinkDuration * 1000 + 200);  // Add a small delay before opening the eyes
			
					blinkTimer = 0;  // Reset the timer
					blinkInterval = 5 + Math.random() * 10;  // Blink roughly every 10 to 25 seconds
				}
			}
			let speedPerSecondFB = 3.6;  // This is equivalent to 0.06 per frame at 60 FPS
			let speedPerSecondLR = 1.8;  // This is equivalent to 0.03 per frame at 60 FPS
			
			if (props.movement.current.shift) {
				speedPerSecondFB = 7.2;  // This is equivalent to 0.12 per frame at 60 FPS
				speedPerSecondLR = 4.2;  // This is equivalent to 0.07 per frame at 60 FPS
			}

			let newVelocity = [...velocity.current];
			let newPosition = null;

			if (props.movement.current.backward && canMoveRef.current) {
				let speed = speedPerSecondFB * delta;
				newVelocity[0] += speed * forward.x;
				newVelocity[2] += speed * forward.z;
				isMoving = true;
			} else if (props.movement.current.forward && canMoveRef.current) {
				let speed = speedPerSecondFB * delta;
				newVelocity[0] -= speed * forward.x;
				newVelocity[2] -= speed * forward.z;
				isMoving = true;
			} else if (props.movement.current.left && canMoveRef.current) {
				let speed = speedPerSecondLR * delta;
				newVelocity[0] -= speed * right.x;
				newVelocity[2] -= speed * right.z;
				isMoving = true;
			} else if (props.movement.current.right && canMoveRef.current) {
				let speed = speedPerSecondLR * delta;
				newVelocity[0] += speed * right.x;
				newVelocity[2] += speed * right.z;
				isMoving = true;
			}
			if(props.movement.current.respawn === true){
				newPosition = spawnPoint;
				newVelocity = spawnPoint;
				velocity.current = spawnPoint;
			}
		
			// if shift is pressed, run by setting speed to 0.1
			if(canMoveRef.current){
				velocity.current = newVelocity;				
			}

			const rotationSpeed = 0.5;
			if (props.movement.current.backward) {
				orbitRef.current.minPolarAngle = Math.PI / 1.8;
				orbitRef.current.maxPolarAngle = Math.PI / 1.25;
				orbitRef.current.maxDistance = 2;
				orbitRef.current.minDistance = 2;
			} else {
				// Reset properties to default values
				if(isMoving){
					orbitRef.current.minPolarAngle = Math.PI / 1.5;
				} else {
					orbitRef.current.minPolarAngle = Math.PI / 1.8;
				}
				orbitRef.current.maxPolarAngle = Math.PI / 1.2;
				orbitRef.current.maxDistance = 2;
				orbitRef.current.minDistance = 1.3;
			}

			// send a raycast from the orbit camera and check if there is an obstacle in the way
			
			// We compute the direction from the camera to the player
			let direction = camera.getWorldDirection(new Vector3());
			// normalize the direction to not be looking up or downward
			direction.normalize();
			direction.y = 0;
			
			// Adjust the direction based on the movement direction
			if(props.movement.current.backward) {
				direction.negate();  // for backward movement, we want to reverse the direction
			} else if (props.movement.current.right && !props.movement.current.left && !props.movement.current.forward && !props.movement.current.backward) {
				direction.applyAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2);  // for right movement, rotate the direction 90 degrees counterclockwise
			} else if (props.movement.current.left && !props.movement.current.right && !props.movement.current.forward && !props.movement.current.backward) {
				direction.applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);  // for left movement, rotate the direction 90 degrees clockwise
			}

			// Define the desired rotation matrix
			let matrix = new Matrix4();
			matrix.lookAt(new Vector3(0,0,0), direction, new Vector3(0,1,0));
		
			// Create a quaternion from the rotation matrix
			let desiredQuaternion = new Quaternion();
			desiredQuaternion.setFromRotationMatrix(matrix);

			if ( props.movement.current.forward === true ||
				props.movement.current.backward === true ||
				props.movement.current.left === true ||
				props.movement.current.right === true
			) {
				// Apply slerp to the player's current quaternion, gradually aligning it with the desired quaternion
				playerController.scene.quaternion.slerp(desiredQuaternion, rotationSpeed);
			}
			if(castRef.current){
				castRef.current.setRotation(desiredQuaternion);
			}

			if (isMoving && canMoveRef.current) {
				newPosition = [
					velocity.current[0],
					rigidBodyPosition.y,
					velocity.current[2]
				];
				participantObject.parent.position.set(...newPosition);
				castRef.current.setTranslation({x: newPosition[0], y: newPosition[1], z: newPosition[2]});
			}
			// animation logic
			if (animationsRef.current) {
				const { idle, walking, running } = animationsRef.current;

				if (isMoving) {
					// If moving, but idle animation is playing, stop it and play walking animation
					// if (idle.isRunning()) {
						// blend from idle to walking
						if(props.movement.current.shift) {
							if (walking.isRunning()) {
								walking.crossFadeTo(running, 1);
							} else {
							idle.crossFadeTo(running, 1);
							}
							running.enabled = true;
							running.setEffectiveTimeScale(1);
							running.setEffectiveWeight(1);
							idle.enabled = true;
							idle.setEffectiveTimeScale(1);
							idle.setEffectiveWeight(0);
							walking.enabled = true;
							walking.setEffectiveTimeScale(1);
							walking.setEffectiveWeight(0);
							running.play();
						} else {
							if (running.isRunning()) {
								running.crossFadeTo(walking, 1);
							} else {
								idle.crossFadeTo(walking, 1);
							}
							walking.enabled = true;
							walking.setEffectiveTimeScale(1);
							walking.setEffectiveWeight(1);
							running.enabled = true;
							running.setEffectiveTimeScale(1);
							running.setEffectiveWeight(0);
							idle.enabled = true;
							idle.setEffectiveTimeScale(1);
							idle.setEffectiveWeight(0);
							walking.play();
						}
					// }
				} else {
					// If not moving, but walking animation is playing, stop it and play idle animation
					if (walking.isRunning()) {
						// blend from walking to idle
						walking.crossFadeTo(idle, 1);
						// set the walking animation to lower weight so it blends into the idle animation
						walking.enabled = true;
						walking.setEffectiveTimeScale(1);
						walking.setEffectiveWeight(0);
						running.setEffectiveTimeScale(1);
						running.setEffectiveWeight(0);
						idle.enabled = true;
						idle.setEffectiveTimeScale(1);
						idle.setEffectiveWeight(1);
						idle.play();
					} else if (running.isRunning()) {
						// blend from running to idle
						running.crossFadeTo(idle, 1);
						// set the running animation to lower weight so it blends into the idle animation
						running.enabled = true;
						running.setEffectiveTimeScale(1);
						running.setEffectiveWeight(0);
						walking.setEffectiveTimeScale(1);
						walking.setEffectiveWeight(0);
						idle.enabled = true;
						idle.setEffectiveTimeScale(1);
						idle.setEffectiveWeight(1);
						idle.play();
					}
				}
			}

			if (participantObject) {
				camera.lookAt(
					participantObject.parent.position.x,
					playerController.firstPerson.humanoid.humanBones.head.node.getWorldPosition(new Vector3()).y,
					participantObject.parent.position.z
				);
				
				if (orbitRef.current){
					let newTarget = new Vector3(
						participantObject.parent.position.x,
						playerController.firstPerson.humanoid.humanBones.head.node.getWorldPosition(new Vector3()).y + 1.5,
						participantObject.parent.position.z
					);
					// lerpVectors() orbitRef from current position target to newTarget
					orbitRef.current.target.lerpVectors(orbitRef.current.target, newTarget, 0.5);
				}
			}
		
			// update rigidBody's position
			if (rigidRef.current && participantObject?.parent?.position?.x) {
				// // match the rigidBody's position to the participantObject's position.
				// set the rigidbody type to one that can be moved by setTranslation
				if(props.movement.current.backward || props.movement.current.forward || props.movement.current.left || props.movement.current.right || falling.current === true) {
					rigidRef.current.setBodyType(rapier.RigidBodyType.Dynamic, 1);
					// rigidRef.current.setFriction(1); // Set the friction to 1 so the player doesn't slide
				} else {
					rigidRef.current.setBodyType(rapier.RigidBodyType.Fixed, 1);
				}

				// set a const of the rigidBody's current position
				rigidRef.current.setTranslation({ x: participantObject.parent.position.x, y: rigidBodyPosition.y, z: participantObject.parent.position.z});
			}
			if(props.movement.current.respawn === true){

				const x = Number(props.spawnPoint[0]);
				const y = Number(props.spawnPoint[1]);
				const z = Number(props.spawnPoint[2]);
				if (props.spawnPointsToAdd) {
					let finalPoints = [];
					props.spawnPointsToAdd.forEach((point) => {
					finalPoints.push([Number(point.position.x), Number(point.position.y), Number(point.position.z)]);
					});
					finalPoints.push([x, y, z]);
					//pick a random point
					let randomPoint = finalPoints[Math.floor(Math.random() * finalPoints.length)];
					if([x, y, z] !== [camera.position.x, camera.position.y, camera.position.z]){
						// Check if the converted values are valid and finite
						// Set the camera's position
						// orbitRef.position.set(randomPoint[0], randomPoint[1], randomPoint[2]);
						castRef.current.setTranslation({
						x: randomPoint[0],
						y: randomPoint[1],
						z: randomPoint[2]
						});
						participantObject.parent.position.set(randomPoint[0], randomPoint[1], randomPoint[2]);
						// move the rigidRef to the new position
						rigidRef.current.setTranslation({
							x: randomPoint[0],
							y: randomPoint[1],
							z: randomPoint[2]
						});
					}
		
				} else {
					// Check if the converted values are valid and finite
					// Set the camera's position
					camera.position.set(x, y, z);
		
					castRef.current.setTranslation({
					x: x,
					y: y,
					z: z
					});
				}
			}
		});


		let animationFiles = [idleFile, walkingFile, runningFile];
		let animationsPromises = animationFiles.map(file => loadMixamoAnimation(file, currentVrm));
	
		Promise.all(animationsPromises)
			.then(animations => {
			const idleAction = currentMixer.clipAction(animations[0]);
			const walkingAction = currentMixer.clipAction(animations[1]);
			const runningAction = currentMixer.clipAction(animations[2]);
			idleAction.timeScale = 1;
			walkingAction.timeScale = 1;
			runningAction.timeScale = 1;
	
			animationsRef.current = { idle: idleAction, walking: walkingAction, running: runningAction };
			idleAction.play();
		});
		
		return (
			<>
			  {playerController && (
				<>
				<OrbitControls
					minDistance={1.3}
					maxDistance={2}
					maxZoom={2.2}
					minZoom={2.2}
					enableDamping={true}
					maxPolarAngle={Math.PI / 1.2}
					minPolarAngle={Math.PI / 1.8}
					ref={orbitRef}
					makeDefault
					enableZoom={false}
				/>
				{/* <CameraControls
					ref={orbitRef}
				/> */}
				<RigidBody
					position={spawnPoint}  // use spawnPoint as initial position
					collisionGroups={interactionGroups(0, [0, 1, 2])} 
					colliders={false}
					ref={rigidRef}
					lockRotations={true}
					mass={1}
					friction={1}
					linearDamping={0.5}
					type={"kinematicPositionBased"}
					angularVelocity={[0, 0, 0]}
					linearVelocity={[0, 0, 0]}
				>
					<CapsuleCollider position={[0, 1, 0]} args={[0.45, 0.3]} />
					<primitive visible={true} name="playerOne" object={playerController.scene} position={[0, .3, 0]}/>
				</RigidBody>
				<RigidBody
					position={spawnPoint}  // use spawnPoint as initial position
					collisionGroups={interactionGroups(1, [0, 1])} 
					colliders={false}
					ref={castRef}
					type={"dynamic"}
					lockRotations={true}
					lockTranslations={true}
					mass={1}
					friction={1}
					linearDamping={0.5}
					sensor
					//type={"Fixed"}
					onIntersectionEnter={({ manifold, target }) => {
						canMoveRef.current = false;
					}}
					onIntersectionExit={({ manifold, target }) => {
						canMoveRef.current = true;
					}}
					angularVelocity={[0, 0, 0]}
					linearVelocity={[0, 0, 0]}
				>
					<CuboidCollider
						// onIntersectionEnter={() => console.log("enter")}
						position={[0, 1.4, -0.5]}
						args={[0.03, 0.03, 0.03]}
					/>
				</RigidBody>
				</>
			  )}
			</>
		  );
	}
}
