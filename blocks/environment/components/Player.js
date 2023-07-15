import { Mesh, DoubleSide, MeshBasicMaterial, RingGeometry, AudioListener, Group, Quaternion, Matrix4, VectorKeyframeTrack, QuaternionKeyframeTrack, LoopPingPong, AnimationClip, NumberKeyframeTrack, AnimationMixer, Vector3, BufferGeometry, CircleGeometry, sRGBEncoding, MathUtils } from "three";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { useFrame, useLoader, useThree, Interactive } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from '@react-three/drei';
import { useKeyboardControls } from "./Controls"
import { useRef, useState, useEffect } from "react";
import { RigidBody, CapsuleCollider, useRapier } from "@react-three/rapier";
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
	console.log("hit")
	const animationsRef = useRef();
	const orbitRef = useRef();

	const idleFile = threeObjectPlugin + idle;
	const walkingFile	= threeObjectPlugin + walk;
	const runningFile	= threeObjectPlugin + run;
	// const [walkFile, setWalkFile] = useState(model.threeObjectPlugin + walk);
	const spawnPoint = props.spawnPoint.map(Number);  // convert spawnPoint to numbers
	const { controllers } = useXR();
	const { camera, scene, clock } = useThree();
	const { world, rapier } = useRapier();
	const participantObject = scene.getObjectByName("playerOne");
	const [rapierId, setRapierId] = useState("");
	const [contactPoint, setContactPoint] = useState("");
	const [headPoint, setHeadPoint] = useState("");
	const rigidRef = useRef();
	
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
	console.log(defaultAvatarURL);
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
		const fetchProfile = async () => {
			fetch(userData.profileImage)
			.then((response) => {
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
			}).catch(err => {
				return Promise.reject(err)
		   })
		};
		// fetch profile after timeout of 1 second
		setTimeout(() => {
			fetchProfile();
		}, 1000);

		VRMUtils.rotateVRM0(playerController);
		const currentVrm = playerController;
		const currentMixer = new AnimationMixer(currentVrm.scene);

		useEffect(() => {
			// setHeadPoint(
			// 	playerController.firstPerson.humanoid.humanBones.head.node
			// 		.position.y
			// );
			// set the HeadPoint to the world position of the head bone
			// setHeadPoint(
			// 	playerController.firstPerson.humanoid.humanBones.head.node
			// 		.getWorldPosition()
			// 		.y
			// );
			
		}, []);

		useEffect(() => {
			const playerThing = world.getRigidBody(rigidRef.current.handle);
			console.log(spawnPoint)
			console.log(playerThing)
			setTimeout(() => {
				// playerThing.setBodyType(rapier.RigidBodyType.Dynamic, 0);
				// playerThing.setTranslation(spawnPoint);
			}, 20);
		}, []);
	
		// need to dynamically do this on scroll
		// playerController.firstPerson.humanoid.humanBones.head.node.scale.set([
		// 	0, 0, 0
		// ]);

		const movement = useKeyboardControls();
		const velocity = useRef([0, 0, 0]);  // Use a ref instead of state for velocity
		let lastUpdateTime = 0;

		useFrame((state, delta) => {
			const currentTime = state.clock.elapsedTime;
			const timeSinceLastUpdate = currentTime - lastUpdateTime;
			const rigidBodyPosition = rigidRef.current.translation();
			const forward = new Vector3();
			camera.getWorldDirection(forward);
			forward.negate(); // In Three.js camera looks towards negative Z, so we negate the vector
			forward.normalize();
			// Get camera's right vector
			const right = new Vector3();
			right.crossVectors(camera.up, forward);
			right.normalize();
		  
			if (timeSinceLastUpdate >= 0.1) { // Update every 100 milliseconds
				lastUpdateTime = currentTime;
			}
			if (currentVrm) {
				currentVrm.update(delta);
			}
			if (currentMixer) {
				currentMixer.update(delta);
			}

			let speed = 0.05;
			if (movement.current.shift){
				speed = 0.1;
			}		

			let newVelocity = [...velocity.current];

				// initialize the moving state to false
			let isMoving = false;
		
			if (movement.current.backward){
				// playerController.scene.rotation.y = Math.PI;
				newVelocity[0] += speed * forward.x;
				newVelocity[2] += speed * forward.z;
				isMoving = true;
			}
			if (movement.current.forward){
				// playerController.scene.rotation.y = 0;
				newVelocity[0] -= speed * forward.x;
				newVelocity[2] -= speed * forward.z;
				isMoving = true;
			}
			if (movement.current.left){
				// playerController.scene.rotation.y = -Math.PI / 2;
				newVelocity[0] -= speed * right.x;
				newVelocity[2] -= speed * right.z;
				isMoving = true;
			}
			if (movement.current.right){
				// playerController.scene.rotation.y = Math.PI / 2;
				newVelocity[0] += speed * right.x;
				newVelocity[2] += speed * right.z;
				isMoving = true;
			}
			// if shift is pressed, run by setting speed to 0.1
			velocity.current = newVelocity;
			// move the player using the new velocity
			// Define the speed of rotation
			const rotationSpeed = 0.5;

			if (isMoving) {

				if (movement.current.backward) {
					orbitRef.current.minPolarAngle = Math.PI / 1.8;
					orbitRef.current.maxPolarAngle = Math.PI / 1.25;
					orbitRef.current.maxDistance = 2;
					orbitRef.current.minDistance = 2;
				} else {
					// Reset properties to default values
					orbitRef.current.minPolarAngle = Math.PI / 1.8;
					orbitRef.current.maxPolarAngle = Math.PI / 1.2;
					orbitRef.current.maxDistance = 2;
					orbitRef.current.minDistance = 1.3;
				}
				
				// We compute the direction from the camera to the player
				let direction = camera.getWorldDirection(new Vector3());
				// normalize the direction to not be looking up or downward
				direction.normalize();
				direction.y = 0; // Ignore vertical difference
				
				// Adjust the direction based on the movement direction
				if(movement.current.backward) {
					direction.negate();  // for backward movement, we want to reverse the direction
				} else if (movement.current.right) {
					direction.applyAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2);  // for right movement, rotate the direction 90 degrees counterclockwise
				} else if (movement.current.left) {
					direction.applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);  // for left movement, rotate the direction 90 degrees clockwise
				}
			
				// Define the desired rotation matrix
				let matrix = new Matrix4();
				matrix.lookAt(new Vector3(0,0,0), direction, new Vector3(0,1,0));
			
				// Create a quaternion from the rotation matrix
				let desiredQuaternion = new Quaternion();
				desiredQuaternion.setFromRotationMatrix(matrix);
			
				// Apply slerp to the player's current quaternion, gradually aligning it with the desired quaternion
				playerController.scene.quaternion.slerp(desiredQuaternion, rotationSpeed);
			
				const newPosition = [
					velocity.current[0],
					rigidBodyPosition.y,
					velocity.current[2]
				];
				participantObject.parent.position.set(...newPosition);
			}
			// animation logic
			if (animationsRef.current) {
				const { idle, walking, running } = animationsRef.current;

				if (isMoving) {
					// If moving, but idle animation is playing, stop it and play walking animation
					// if (idle.isRunning()) {
						// blend from idle to walking
						if(movement.current.shift) {
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
				// camera.position.setY(participantObject.parent.position.y + 2.5);
				// camera.position.setX(participantObject.parent.position.x);
				// camera.position.setZ(participantObject.parent.position.z - 3.5);
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

					

					// orbitRef.current.target.set(
					// 	participantObject.parent.position.x,
					// 	playerController.firstPerson.humanoid.humanBones.head.node.getWorldPosition(new Vector3()).y + 1.5,
					// 	participantObject.parent.position.z
					// );
					// set the zoom to 1
					// orbitRef.current.zoom = 2;
				}
			}
		
			// update rigidBody's position
			if (rigidRef.current) {
				// // match the rigidBody's position to the participantObject's position.
				// rigidRef.current.position.x = participantObject.parent.position.x;
				// rigidRef.current.position.z = participantObject.parent.position.z;
				// console.log("participantObject.parent.position.x", participantObject.parent.position.x);

				// set the rigidbody type to one that can be moved by setTranslation
				rigidRef.current.setBodyType(rapier.RigidBodyType.Dynamic, 1);

				// set a const of the rigidBody's current position
				rigidRef.current.setTranslation({ x: participantObject.parent.position.x, y: rigidBodyPosition.y, z: participantObject.parent.position.z});

				// console.log("rigidRef.current.position.x", rigidRef.current);
				// rigidRef.current.position.x = participantObject.parent.position.x;
				// rigidRef.current.position.z = participantObject.parent.position.z;
			}
		});
				
		let animationFiles = [idleFile, walkingFile, runningFile];
		let animationsPromises = animationFiles.map(file => loadMixamoAnimation(file, currentVrm));
		
		Promise.all(animationsPromises)
		.then(animations => {
			const idleAction = currentMixer.clipAction(animations[0]);
			const walkingAction = currentMixer.clipAction(animations[1]);
			const runningAction = currentMixer.clipAction(animations[2]);
			idleAction.timeScale = 1;  // speed up the idle animation
			walkingAction.timeScale = 1;  // speed up the walking animation
			runningAction.timeScale = 1;  // speed up the walking animation

			animationsRef.current = { idle: idleAction, walking: walkingAction, running: runningAction };
			// Set idle animation to play by default
			idleAction.play();
		});

		return (
			<>
			  {playerController && (
				<>
				<OrbitControls
					minDistance={1.3}
					maxDistance={2}
					maxZoom={2}
					minZoom={2}
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
					colliders={false}
					ref={rigidRef}
					lockRotations={true}
					type={"dynamic"}
					onCollisionEnter={({ manifold, target }) => {
					  setRapierId(target.colliderSet.map.data[1]);
					  setContactPoint(manifold.solverContactPoint(0));
					}}
					linearVelocity={velocity.current}
				  >
					<CapsuleCollider position={[0, 1, 0]} args={[0.45, 0.4]} />
					<primitive visible={true} name="playerOne" object={playerController.scene} position={[0, .2, 0]}/>
				  </RigidBody>
				</>
			  )}
			</>
		  );
	}
}
