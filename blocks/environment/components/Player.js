import { Mesh, Raycaster, PerspectiveCamera, ArrowHelper, Euler, NearestFilter, LoopOnce, DoubleSide, MeshBasicMaterial, RingGeometry, BoxGeometry, AudioListener, Color, Group, Quaternion, Matrix4, VectorKeyframeTrack, QuaternionKeyframeTrack, LoopPingPong, AnimationClip, NumberKeyframeTrack, AnimationMixer, Vector3, Vector2, BufferGeometry, CircleGeometry, sRGBEncoding, MathUtils } from "three";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { useFrame, useLoader, useThree, Interactive } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls, SpriteAnimator, KeyboardControls } from '@react-three/drei';
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
// import { useKeyboardControls } from "./Controls"
import { useRef, useState, useEffect } from "react";
import { RigidBody, CapsuleCollider, useRapier, vec3, interactionGroups, CuboidCollider } from "@react-three/rapier";
import defaultVRM from "../../../inc/avatars/3ov_default_avatar.vrm";
import blankVRM from "../../../inc/avatars/blank_avatar.vrm";
import { VRMUtils, VRMSchema, VRMLoaderPlugin, VRMExpressionPresetName, VRMHumanBoneName } from "@pixiv/three-vrm";
import { useXR } from "@react-three/xr";
import idle from "../../../inc/avatars/friendly.fbx";
import walk from "../../../inc/avatars/walking.fbx";
import run from "../../../inc/avatars/running.fbx";
import jump from "../../../inc/avatars/Jump.fbx";
import fall from "../../../inc/avatars/falling.fbx";
import { getMixamoRig } from "../utils/rigMap";
import Ecctrl, { EcctrlAnimation, useGame, useFollowCam, useJoystickControls } from "ecctrl";

function useGameWithLogging() {
	const gameStore = useGame();

	// A helper function to wrap the original actions with logging
	const wrapWithLogging = (action) => {
	return (...args) => {
		// console.log(`${action.name} action triggered`, ...args);
		return action(...args);
	};
	};

	const idle = wrapWithLogging(gameStore.idle);
	const walk = wrapWithLogging(gameStore.walk);
	const run = wrapWithLogging(gameStore.run);

	return {
	...gameStore,
	idle,
	walk,
	run,
	};
}

function Reticle() {
	const { camera } = useThree();
	const color = 0xffffff;
	var colorValue = new Color( parseInt ( color.replace("#","0x"), 16 ) );

	var reticle = new Mesh(
		new RingGeometry( 0.85 * 5, 5, 32),
		new MeshBasicMaterial( {color: colorValue, side: DoubleSide })
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

// add a button to the body of the document at a fixed position on the bottom left corner of the screen
function addResetButton(props) {

	const button = document.createElement('button');
	button.innerHTML = 'Respawn';
	// change the props.movement.current.respawn to true when the button is clicked
	button.onclick = () => {
		props.movement.current.respawn = true;
		setTimeout(() => {
			props.movement.current.respawn = false;
		}
		, 100);
	};

	button.style.position = 'fixed';
	button.style.bottom = '190px';
	button.style.left = '10px';
	button.style.zIndex = '1000';
	button.style.padding = '10px';
	button.style.border = 'none';
	button.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
	button.style.color = 'white';
	button.style.cursor = 'pointer';
	button.style.borderRadius = '5px';
	button.style.fontFamily = 'Arial';
	button.style.fontSize = '16px';
	button.style.fontWeight = 'bold';
	document.body.appendChild(button);
}


export default function Player(props) {
	const [isModelLoaded, setIsModelLoaded] = useState(false);
	const currentPlayerAvatarRef = useRef(null);
	const playerControllerRef = useRef(null);
	const playerMixerRef = useRef(null);
	const { camera, gl } = useThree();
	const { isPresenting } = useXR();
	const [ presentingState, setPresentingState ] = useState(false);

	const characterRef = useRef(null);

	const [ frameName, setFrameName ] = useState();
	
	let heightOffset = 0;

	const canMoveRef = useRef(true);
	const spriteRef = useRef();
	const animationsRef = useRef();
	const playerModelRef = useRef();

	const orbitRef = useRef();
	const rigidRef = useRef();
	const castRef = useRef();
	const [loaderIsGone, setLoaderIsGone] = useState(false);
	const [avatarIsSprite, setAvatarIsSprite] = useState(false);

	const curAnimation = useGame((state) => state.curAnimation);
	const initializeAnimationSet = useGame(
		(state) => state.initializeAnimationSet
	);
	const idleAnimation = useGame((state) => state.idle);
	const walkAnimation = useGame((state) => state.walk);
	const runAnimation = useGame((state) => state.run);
	// const jumpAnimation = useGame((state) => state.jump);
	// const jumpIdleAnimation = useGame((state) => state.jumpIdle);
	// const jumpLandAnimation = useGame((state) => state.jumpLand);
	// const fallAnimation = useGame((state) => state.fall);
	const action1Animation = useGame((state) => state.action1);
	const action2Animation = useGame((state) => state.action2);
	const action3Animation = useGame((state) => state.action3);
	const action4Animation = useGame((state) => state.action4);
	const resetAnimation = useGame((state) => state.reset);
	const [open, setOpen] = useState(false)

	// useXR to get the controllers
	// const [ playerPosition, deathCount, levelIndex, death ] = useGame(state => [ state.playerPosition, state.deathCount, state.levelIndex, state.death ])	
	
	// useEffect(() => {
	// 	// Play the current animation, with special handling for certain animations
	// 	if(animationsRef.current){
	// 		const action = animationsRef.current[curAnimation ? curAnimation : animationSet.idle];
	// 		if ([animationSet.jump ].includes(curAnimation)) {
	// 			action.reset().fadeIn(0.2).setLoop(LoopOnce, void 0).play();
	// 			action.clampWhenFinished = true;
	// 		} else {
	// 			action.reset().fadeIn(0.2).play();
	// 		}
		
	// 		// Reset animation when the current action finishes
	// 		const onFinish = () => resetAnimation();
	// 		action._mixer.addEventListener('finished', onFinish);
		
	// 		// Cleanup
	// 		return () => {
	// 		action.fadeOut(0.2);
	// 		action._mixer.removeEventListener('finished', onFinish);
	// 		// Ensure listeners are cleared to prevent memory leaks
	// 		action._mixer._listeners = [];
	// 		};
	// 	}
	//   }, [curAnimation, animationsRef.current, animationSet, resetAnimation]);
	
	// useEffect(() => {
	// 	if(animationsRef.current){
	// 		if(curAnimation){
	// 			console.log("curAnimation", curAnimation);
	// 		}
	// 		if(curAnimation === "jump"){
	// 			animationsRef.current.jump.reset()
	// 			.fadeIn(0.2)
	// 			.setLoop(LoopOnce, 1)
	// 			.play();
	// 			// fade back to idle
	// 			animationsRef.current.jump.clampWhenFinished = true;
	// 		} else {
	// 			// when jump is done playing, fade back to idle
	// 			if(animationsRef.current.jump.isRunning()){
	// 			animationsRef.current.jump.clampWhenFinished = false;
	// 				animationsRef.current.jump.onLoop = () => {
	// 					animationsRef.current.jump.stop();
	// 					animationsRef.current.idle.reset().fadeIn(0.2).play();
	// 				}
	// 			} else {
	// 				animationsRef.current.idle.reset().fadeIn(0.2).play();
	// 			}
	// 		}
	// 	}
	// }, [curAnimation]);

	const animationSet = {
		idle: "idle",
		walk: "walking",
		run: "running",
		jump: "jump",
	};
	
	useEffect(() => {
		// Initialize animation set
		initializeAnimationSet(animationSet);
	}, []);

	// useEffect(() => {
	// 	// if the curAnimation is changing log it
	// 	if(curAnimation){
	// 		console.log("curAnimation", curAnimation);
	// 	}
	// }, [curAnimation]);

	
	useEffect(() => {
		const handleReady = () => {
			setLoaderIsGone(true);
			removeEventListener('loaderIsGone', handleReady);
		};
		window.addEventListener('loaderIsGone', handleReady);
		addResetButton(props);
	}, []);

	const idleFile = idle;
	const walkingFile	= walk;
	const runningFile	= run;
	const jumpFile	= jump;
	const fallingFile	= fall;
	// const [walkFile, setWalkFile] = useState(model.threeObjectPlugin + walk);
	const spawnPoint = props.spawnPoint? props.spawnPoint.map(Number) : [0,0,0];  // convert spawnPoint to numbers
	const { controllers } = useXR();
	const { scene, clock } = useThree();
	const { world, rapier } = useRapier();
	const participantObject = scene.getObjectByName("playerOne");
	const mouse = new Vector2();

	// if (!scene.getObjectByName("reticle")){
	// 	camera.add(Reticle());
	// }

	if ( controllers.length > 0 ) {
		scene.remove(scene.getObjectByName("reticle"));
	}

	// Participant VRM.
	const fallbackURL = defaultVRM;
	const defaultAvatarURL = props.defaultPlayerAvatar;
	let playerURL;
	if(defaultAvatarURL){
		playerURL = defaultAvatarURL;
	}
	playerURL = userData.playerVRM ? userData.playerVRM : fallbackURL;
	if( playerURL.endsWith( '.png' ) ){
		playerURL = blankVRM;
	}
	
	// if the playerURL ends in .png
	useEffect(() => {
		if( userData.playerVRM.endsWith( '.png' ) ){
			setAvatarIsSprite(true);
		}
	}, []);
	// 	// ignore the loader and just use create a blank vrm
	// const currentPlayerAvatar = useLoader(GLTFLoader, playerURL, (loader) => {

	// 	const { gl } = useThree();

	// 	// Create and configure KTX2Loader
	// 	const ktx2Loader = new KTX2Loader();
	// 	ktx2Loader.setTranscoderPath(threeObjectPluginRoot + "/inc/utils/basis/");
	// 	ktx2Loader.detectSupport(gl);
	// 	loader.setKTX2Loader(ktx2Loader);

	// 	loader.register((parser) => {
	// 		return new VRMLoaderPlugin(parser);
	// 	});
	// });
	// Loading the character model only once
	let animationFiles = [idleFile, walkingFile, runningFile, jumpFile];

	useEffect(() => {
		if (!currentPlayerAvatarRef.current) {
		const loader = new GLTFLoader();
		const ktx2Loader = new KTX2Loader();
		ktx2Loader.setTranscoderPath(threeObjectPluginRoot + "/inc/utils/basis/");
		ktx2Loader.detectSupport(gl);
		loader.setKTX2Loader(ktx2Loader);
		loader.register(parser => new VRMLoaderPlugin(parser));
	
		loader.load(playerURL, (gltf) => {
			currentPlayerAvatarRef.current = gltf;
			playerControllerRef.current = gltf.userData.vrm;
			setIsModelLoaded(true);
		}, undefined, error => {
			console.error('An error happened during the loading of the model:', error);
		});
		}
	}, [playerURL, gl]);
		
	useEffect(() => {
		if (isModelLoaded && playerControllerRef.current) {
		const playerController = playerControllerRef.current;
		const animationsMixer = new AnimationMixer(playerController.scene);
		playerMixerRef.current = animationsMixer;
		let animationsPromises = animationFiles.map(file => loadMixamoAnimation(file, playerController));
		playerController.scene.visible = false;

		Promise.all(animationsPromises)
			.then(animations => {
			const idleAction = animationsMixer.clipAction(animations[0]);
			const walkingAction = animationsMixer.clipAction(animations[1]);
			const runningAction = animationsMixer.clipAction(animations[2]);
			const jumpingAction = animationsMixer.clipAction(animations[3]);
			//   const fallingAction = animationsMixer.clipAction(animations[4]);
			idleAction.timeScale = 1;
			walkingAction.timeScale = 0;
			runningAction.timeScale = 0;
			jumpingAction.timeScale = 0;
			animationsRef.current = { idle: idleAction, walking: walkingAction, running: runningAction, jump: jumpingAction };
			idleAction.play();
			playerController.scene.visible = true;
		});  
		}
	}, [isModelLoaded]);
	
		const setupCharacter = (gltf) => {
			// Assuming you have a function to add the character to the scene
			// and perform initial setup like setting position, adding animations, etc.
			// Example: addCharacterToScene(gltf.scene);
			console.log('Character loaded:', gltf);
			// Further setup here
		};
		let lastUpdateTime = 0;
		let blinkTimer = 0;
		let blinkInterval = getRandomBlinkInterval();
		
		function getRandomBlinkInterval() {
			return 5 + Math.random() * 10;
		}
		
		function handleBlinking(delta) {
			blinkTimer += delta;
			if (blinkTimer > blinkInterval && playerControllerRef.current) {
				performBlink(playerControllerRef.current);
				blinkTimer = 0;
				blinkInterval = getRandomBlinkInterval();
			}
		}
		
		function performBlink(vrm) {
			const blinkDuration = 0.05 + Math.random() * 0.1;
			const steps = Math.round(blinkDuration / 0.01);
		
			for (let i = 0; i <= steps; i++) {
				const s = i / steps;
				setTimeout(() => {
					vrm.expressionManager.setValue('blinkLeft', s);
					vrm.expressionManager.setValue('blinkRight', s);
				}, s * blinkDuration * 1000);
			}
		
			setTimeout(() => {
				for (let i = 0; i <= steps; i++) {
					const s = 1 - i / steps;
					setTimeout(() => {
						vrm.expressionManager.setValue('blinkLeft', s);
						vrm.expressionManager.setValue('blinkRight', s);
					}, (1 - s) * blinkDuration * 1000);
				}
			}, blinkDuration * 1000 + 200);
		}

		const movementTimeoutRef = useRef(null);
		// fps for network updates
		const updateRate = 1000 / 30;
		let lastNetworkUpdateTime = 0;
		let countHangtime = 0;
		let isMoving;
		useEffect(() => {
			isMoving = false;
		}, []);
		let isJumping = false;
		const getJoystickValues = useJoystickControls(
			(state) => state.getJoystickValues
		);
	
		useFrame((state, delta) => {
			const joystickValues = getJoystickValues();
			let forward = props.movement.current.forward;
			let backward = props.movement.current.backward;
			let left = props.movement.current.left;
			let right = props.movement.current.right;
			let shift = props.movement.current.shift;
			let space = props.movement.current.space;
			if(joystickValues){
				// if the joystick angle is between .6 and 2.2 set the forward movement to true
				if(joystickValues.joystickAng > 0){
					if(joystickValues.joystickDis > 60){
						shift = true;
					}
					forward = true;
				}
				if(joystickValues.button1Pressed === true){
					space = true;
				}
			}
			if (playerControllerRef.current) {
				playerControllerRef.current.update(delta);
			}
			if (playerMixerRef.current) {
				playerMixerRef.current.update(delta);
			}
			if (backward || forward || left || right) {
				if(characterRef.current.userData.canJump){
					isMoving = true;
				}
			} else {
				isMoving = false;
			}

			const now = state.clock.elapsedTime * 1000;
			if (isPresenting && !presentingState) {
				const newCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

				// Entering XR
				const xrCamera = gl.xr.getCamera(newCamera);
				gl.xr.enabled = true;
				console.log("xrCamera", state);
				// set it as the default camera for the scene
				state.camera = xrCamera;
				// Adjust the xrCamera as needed here
				// For example, you might need to set its position or properties based on your character controller or scene requirements
				setPresentingState(true);
			} else if (!isPresenting && presentingState) {
				setPresentingState(false);
			}

			handleBlinking(delta);


			// if(avatarIsSprite && isMoving && frameName !== 'WalkForward'){
			// 	console.log("forwardwalk", frameName);
			// 	setFrameName('WalkForward');
			// }

			// if( avatarIsSprite && !isMoving && frameName !== 'ForwardIdle' ){
			// 	console.log("forwardidle", frameName);
			// 	setFrameName('ForwardIdle');
			// }
			if(animationsRef.current){
				if (playerControllerRef.current && participantObject) {
					// Calculate character's current forward vector in world space
					const cameraWorldQuaternion = new Quaternion();
					camera.getWorldQuaternion(cameraWorldQuaternion);
					const cameraForward = new Vector3(0, 0, -1).applyQuaternion(cameraWorldQuaternion);

					const characterWorldQuaternion = new Quaternion();
					participantObject.parent.getWorldQuaternion(characterWorldQuaternion);
					const characterForward = new Vector3(0, 0, 1).applyQuaternion(characterWorldQuaternion);
					const neutralRotation = new Euler(0, 0, 0);
	
					// Calculate vector from character to camera
					const characterToCamera = new Vector3().subVectors(camera.position, participantObject.getWorldPosition(new Vector3())).normalize();
				
					// Determine azimuthal angle
					const dotProduct = characterForward.dot(cameraForward);
					const azimuthalAngle = Math.acos(Math.min(Math.max(dotProduct, -1), 1));
									
					// Perform head rotation if within the desired azimuthal range
					const angleThreshold = Math.PI / 2; // 60 degrees
					if ( azimuthalAngle < angleThreshold ) {
							if( avatarIsSprite ){
								if( isMoving && frameName !== 'WalkForward' ){
									setFrameName('WalkForward');
								}
								if( isMoving === false ){
									if( frameName !== 'ForwardIdle' ){
										setFrameName( 'ForwardIdle' );
									}
								}
							}
						} else {
						if( avatarIsSprite && isMoving && frameName !== 'WalkBackward'){
							setFrameName('WalkBackward');
						}
						if( avatarIsSprite && isMoving === false && frameName !== 'BackwardIdle' ){
							setFrameName('BackwardIdle');
						}	
					}
				}
	
				const { idle, walking, running, jump, falling } = animationsRef.current;
				// if the player hits the R key respawn using the characterRef to move it to the origin spawn point
				if(props.movement.current.respawn){
					characterRef.current.setBodyType(rapier.RigidBodyType.Fixed, 1);
					characterRef.current.setTranslation(new Vector3(Number(spawnPoint[0]), Number(spawnPoint[1]), Number(spawnPoint[2])), true);
				} else if(!props.movement.current.respawn && characterRef.current.bodyType() === 1){
					characterRef.current.setBodyType(rapier.RigidBodyType.Dynamic, 0);
				}
				if ( isMoving && characterRef.current.userData.canJump ) {
					jump.clampWhenFinished = false;
					jump.reset();
					jump.setEffectiveTimeScale(0);
					jump.setEffectiveWeight(0);
				} else if( !isMoving && characterRef.current.userData.canJump ) {
					jump.clampWhenFinished = false;
					jump.reset();
					jump.setEffectiveTimeScale(0);
					jump.setEffectiveWeight(0);
					// and now play idle
					idle.setEffectiveTimeScale(1);
					idle.setEffectiveWeight(1);
				}
				if ( ! characterRef.current.userData.canJump ) {
					if (window.p2pcf) {
						const participantObject = scene.getObjectByName("playerOne");

						var target = new Vector3();
						var worldPosition = participantObject.getWorldPosition( target );
						const position = [
							worldPosition.x,
							worldPosition.y,
							worldPosition.z
						];
						// console.log("sending position", participantObject, position);

						const rotation = [
							participantObject.parent.parent.rotation.x,
							participantObject.parent.parent.rotation.y,
							participantObject.parent.parent.rotation.z
						];
						// console.log("userData", userData);
						const messageObject = {
							[window.p2pcf.clientId]: {
								position: position,
								rotation: rotation,
								profileImage: userData.profileImage,
								playerVRM: userData.playerVRM,
								vrm: userData.vrm,
								inWorldName: window.userData.inWorldName ? window.userData.inWorldName : userData.inWorldName,
								isMoving: "jumping"
							}
						};
						// console.log("userdata", userData);
						clearTimeout(movementTimeoutRef.current);
						movementTimeoutRef.current = setTimeout(() => {
							// Send "isMoving: false" message here
							const messageStopObject = {
								[window.p2pcf.clientId]: {
									isMoving: false
								}
							};
							const messageStop = JSON.stringify(messageStopObject);
							isMoving = false;
							window.p2pcf.broadcast(new TextEncoder().encode(messageStop));
						}, 100);

						const message = JSON.stringify(messageObject);
						if (now - lastNetworkUpdateTime > updateRate) {
							window.p2pcf.broadcast(new TextEncoder().encode(message)), window.p2pcf;
							lastNetworkUpdateTime = now;
						}
					}

					// start tracking hangtime
					countHangtime++;
					// if the current timescale of the jump animation is 0, set it to 1
					if(jump.getEffectiveTimeScale() === 0){
						if(countHangtime > 3){
							jump.setEffectiveTimeScale(1);
							jump.setEffectiveWeight(1);
							jump.clampWhenFinished = true;
							// initialize on the last frame of the jump animation
							jump.time = jump._clip.duration;
							jump.play();
							running.setEffectiveTimeScale(0);
							running.setEffectiveWeight(0);
							walking.setEffectiveTimeScale(0);
							walking.setEffectiveWeight(0);
							// console.log("falling all", "idle:" + idle.getEffectiveTimeScale() + idle.getEffectiveWeight(), "walking:" + walking.getEffectiveTimeScale() + walking.getEffectiveWeight(), "running:" + running.getEffectiveTimeScale() + running.getEffectiveWeight(), "jumping" + jump.getEffectiveTimeScale() + jump.getEffectiveWeight());
						}
					}
				}

				if ( isMoving && characterRef.current.userData.canJump ) {
					countHangtime = 0;

							if(shift) {
								if (walking.isRunning()) {
									walking.crossFadeTo(running, 1.1);
								} else {
									idle.crossFadeTo(running, 1.1);
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

						//if moving, send a network event of where we are and our current state....animations probably need to go here too.
						if (window.p2pcf) {
							const participantObject = scene.getObjectByName("playerOne");

							var target = new Vector3();
							var worldPosition = participantObject.getWorldPosition( target );
							const position = [
								worldPosition.x,
								worldPosition.y,
								worldPosition.z
							];
							// console.log("sending position", participantObject, position);

							const rotation = [
								participantObject.parent.parent.rotation.x,
								participantObject.parent.parent.rotation.y,
								participantObject.parent.parent.rotation.z
							];
							// console.log("userData", userData);
							const currentAction = ! characterRef.current.userData.canJump ? "jumping" : "walking";
							const messageObject = {
								[window.p2pcf.clientId]: {
									position: position,
									rotation: rotation,
									profileImage: userData.profileImage,
									playerVRM: userData.playerVRM,
									vrm: userData.vrm,
									inWorldName: window.userData.inWorldName ? window.userData.inWorldName : userData.inWorldName,
									isMoving: currentAction
								}
							};
							if( shift && characterRef.current.userData.canJump ){
								messageObject[window.p2pcf.clientId].isMoving = "running";
							}
							// console.log("userdata", userData);
							clearTimeout(movementTimeoutRef.current);
							movementTimeoutRef.current = setTimeout(() => {
								// Send "isMoving: false" message here
								const messageStopObject = {
									[window.p2pcf.clientId]: {
										isMoving: false
									}
								};
								const messageStop = JSON.stringify(messageStopObject);
								isMoving = false;
								window.p2pcf.broadcast(new TextEncoder().encode(messageStop));
							}, 100);

							const message = JSON.stringify(messageObject);
							if (now - lastNetworkUpdateTime > updateRate) {
								window.p2pcf.broadcast(new TextEncoder().encode(message)), window.p2pcf;
								lastNetworkUpdateTime = now;
							}
						}
					// }
				} else {
					if(characterRef.current.userData.canJump){
						isJumping = false;
						if (walking.isRunning()) {	
							walking.crossFadeTo(idle, 1);
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
				if(space) {
					if( characterRef.current.userData.canJump ) {
						isJumping = true;
						// reset hangtime
						countHangtime = 0;
						jump.setEffectiveTimeScale(1);
						jump.setEffectiveWeight(1);

						// set all animations to timescale of 0
						idle.setEffectiveTimeScale(0);
						walking.setEffectiveTimeScale(0);
						running.setEffectiveTimeScale(0);
						// falling.setEffectiveTimeScale(0);
						idle.setEffectiveWeight(0);
						walking.setEffectiveWeight(0);
						running.setEffectiveWeight(0);
						// falling.setEffectiveWeight(0);

						// console.log("jump all", "idle:" + idle.getEffectiveTimeScale() + idle.getEffectiveWeight(), "walking:" + walking.getEffectiveTimeScale() + walking.getEffectiveWeight(), "running:" + running.getEffectiveTimeScale() + running.getEffectiveWeight(), "jumping" + jump.getEffectiveTimeScale() + jump.getEffectiveWeight());
						jump.setLoop(LoopOnce, 1);
						jump.reset();
						jump.clampWhenFinished = true;
						jump.play();			
					}
				}
			}

		});

			const keyboardMap = [
				{ name: "forward", keys: ["ArrowUp", "KeyW"] },
				{ name: "backward", keys: ["ArrowDown", "KeyS"] },
				{ name: "leftward", keys: ["ArrowLeft", "KeyA"] },
				{ name: "rightward", keys: ["ArrowRight", "KeyD"] },
				{ name: "jump", keys: ["Space"] },
				{ name: "run", keys: ["Shift"] },
				// Optional animation key map
				{ name: "action1", keys: ["1"] },
				{ name: "action2", keys: ["2"] },
				{ name: "action3", keys: ["3"] },
				{ name: "action4", keys: ["KeyF"] },
			];

			return (
				<>
				<KeyboardControls map={keyboardMap}>
					<Ecctrl
						ref={characterRef}
						position={[Number(props.spawnPoint[0]), Number(props.spawnPoint[1]), Number(props.spawnPoint[2])]}
						turnSpeed={20} // Increased for snappier turns
						maxVelLimit={5} // Increased for faster movement
						jumpVel={7} // Increased for higher jumps
						camInitDis={-3} // Adjusted for a better initial view
						camMaxDis={-6} // More range for zooming out
						camMinDis={-0.5} // Allows for a closer view when needed
						animated
						camMoveSpeed={1.5} // Increased camera movement speed for more dynamic camera follow
						camZoomSpeed={1.5} // Faster zoom to adjust view quicker
						autoBalance={true} // Disabled to prevent auto-balance
						//sprintMult={1.9} // Slightly increased for a faster sprint option
						airDragMultiplier={0.05} // Slightly reduced to decrease hangtime
						fallingGravityScale={3.5} // Increased to accelerate descent
						wakeUpDelay={5000}
						camCollision={props.camCollisions === "1" ? true : false}
						disableFollowCam={ isPresenting ? true : false }
						canSleep={true}
						ccd={true}
						additionalSolverIterations={1}
					>
						{isModelLoaded && playerControllerRef.current && (
							<>
								<primitive visible={true} name="playerOne" object={playerControllerRef.current.scene} position={[0, -0.9, 0]} rotation={[0, Math.PI, 0 ]}/>
								{avatarIsSprite && <SpriteAnimator
									name="playerOneSprite"
									ref={spriteRef}
									position={[0, 0, 0]}
									frameName={frameName}
									startFrame={0}
									scale={[2, 2, 2]}
									fps={10}
									animationNames={['WalkForward', 'WalkBackward', 'ForwardIdle', 'BackwardIdle', 'WalkLeft', 'WalkRight']}
									autoPlay={true}
									asSprite={false}
									loop={true}
									alphaTest={0.1}
									textureImageURL={ userData.playerVRM }
									textureDataURL={( threeObjectPluginRoot + '/inc/utils/sprite.json' )}
								/>}
							</>
						)}
						</Ecctrl>
				</KeyboardControls>
				</>
			);
		}