import { Box3,
	Mesh,
	Raycaster,
	PerspectiveCamera,
	ArrowHelper,
	Euler, MathUtils, NearestFilter, LoopOnce, DoubleSide, MeshBasicMaterial, RingGeometry, BoxGeometry, AudioListener, Color, Group, Quaternion, Matrix4, VectorKeyframeTrack, QuaternionKeyframeTrack, LoopPingPong, AnimationClip, NumberKeyframeTrack, AnimationMixer, Vector3, Vector2, BufferGeometry, CircleGeometry, sRGBEncoding } from "three";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { useFrame, useLoader, useThree, Interactive } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls, SpriteAnimator, KeyboardControls } from '@react-three/drei';
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { useRef, useState, useEffect } from "react";
import { useXR, useController } from '@react-three/xr';
import { RigidBody, CapsuleCollider, useRapier, vec3, interactionGroups, CuboidCollider } from "@react-three/rapier";
import defaultVRM from "../../../inc/avatars/3ov_default_avatar.vrm";
import blankVRM from "../../../inc/avatars/blank_avatar.vrm";
import { VRMUtils, VRMHumanBones, VRMSchema, VRMLoaderPlugin, VRMSpringBoneManager, VRMExpressionPresetName, VRMHumanBoneName, VRM } from "@pixiv/three-vrm";

import idle from "../../../inc/avatars/friendly.fbx";
import walk from "../../../inc/avatars/walking.fbx";
import run from "../../../inc/avatars/running.fbx";
import jump from "../../../inc/avatars/Jump.fbx";
import fall from "../../../inc/avatars/falling.fbx";
import { getMixamoRig } from "../utils/rigMap";
import ShapePointsMesh from "../utils/ShapePointsMesh";
import DynLineMesh from "../utils/DynLineMesh";
import Ecctrl, { EcctrlAnimation, useGame, useFollowCam, useJoystickControls } from "ecctrl";

import { 
	Armature,
	Pose,
	BipedRig,
	IKChain,
	HipSolver,
	SpineSolver,
	LimbSolver,
	FootSolver,
	SwingTwistSolver,
	SwingTwistEndsSolver,
	ZSolver
 } from 'ossos';

const DamperTimeS = 0.15;

const __rot = new Quaternion();
const __shoulderWPos = new Vector3();
const __originWPos = new Vector3();
const __originWDir = new Vector3();
const __offset = new Vector3();

const mixamoVRMRigMap = getMixamoRig();

function loadMixamoAnimation(url, vrm) {
  let loader;
  if (url.endsWith('.fbx')) {
    loader = new FBXLoader();
  } else {
    loader = new GLTFLoader();
  }
  return loader.loadAsync(url).then((resource) => {
    const clip = resource.animations[0];

    if (url.endsWith('.glb')) {
      resource = resource.scene;
    }

    let tracks = [];

    let restRotationInverse = new Quaternion();
    let parentRestWorldRotation = new Quaternion();
    let _quatA = new Quaternion();
    let _vec3 = new Vector3();

    let mixamoHips = resource.getObjectByName('mixamorigHips');
    let regularHips = resource.getObjectByName('hips');
    let mainHip;
    if (mixamoHips) {
      mainHip = mixamoHips.position.y;
    } else if (regularHips) {
      mainHip = regularHips.position.y;
    }
	VRMUtils.rotateVRM0(vrm);
	VRMUtils.removeUnnecessaryVertices( vrm.scene );
	VRMUtils.removeUnnecessaryJoints( vrm.scene );
	const vrmHipsY = vrm.humanoid?.getNormalizedBoneNode('hips').getWorldPosition(_vec3).y;
    const vrmRootY = vrm.scene.getWorldPosition(_vec3).y;
    const vrmHipsHeight = Math.abs(vrmHipsY - vrmRootY);
    const hipsPositionScale = vrmHipsHeight / mainHip;

    clip.tracks.forEach((track) => {
      let trackSplitted = track.name.split('.');
      let mixamoRigName = trackSplitted[0];
      let vrmBoneName = mixamoVRMRigMap[mixamoRigName];
      let vrmNodeName = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName)?.name;
      let mixamoRigNode = resource.getObjectByName(mixamoRigName);

      if (vrmNodeName != null) {
        let propertyName = trackSplitted[1];

        mixamoRigNode.getWorldQuaternion(restRotationInverse).invert();
        mixamoRigNode.parent.getWorldQuaternion(parentRestWorldRotation);

        if (track instanceof QuaternionKeyframeTrack) {
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
              track.values.map((v, i) => (vrm.meta?.metaVersion === '0' && i % 2 === 0 ? -v : v)),
            ),
          );
        } else if (track instanceof VectorKeyframeTrack) {
          let value = track.values.map((v, i) => (vrm.meta?.metaVersion === '0' && i % 3 !== 1 ? -v : v) * hipsPositionScale);
          tracks.push(new VectorKeyframeTrack(`${vrmNodeName}.${propertyName}`, track.times, value));
        }
      }
    });

    return new AnimationClip('vrmAnimation', clip.duration, tracks);
  });
}

function addResetButton(props) {
  const button = document.createElement('button');
  button.innerHTML = 'Respawn';
  button.onclick = () => {
    props.movement.current.respawn = true;
    setTimeout(() => {
      props.movement.current.respawn = false;
    }, 100);
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

class XrHead {
  constructor(context) {
    this.context = context;
    this.position = new Vector3();
    this.quaternion = new Quaternion();
    this.worldUp = new Vector3();
    this.forward = new Vector3();
    this.up = new Vector3();
    this.right = new Vector3();
  }

  update() {
    this.context.camera.getWorldPosition(this.position);
    this.context.camera.getWorldQuaternion(this.quaternion);
    this.worldUp.set(0, 1, 0);
    this.up.set(0, 1, 0).applyQuaternion(this.quaternion);
    this.forward.set(0, 0, -1).applyQuaternion(this.quaternion);
    this.right.set(1, 0, 0).applyQuaternion(this.quaternion);
  }
}

class Vector3Damper {
  constructor(period) {
    this.period = period || 0.15;
    this._samples = [];
    this._total = new Vector3();
    this._average = new Vector3();
  }

  add(time, sample) {
    const removeSamplesBefore = time - this.period;
    while (this._samples.length && this._samples[0].time < removeSamplesBefore) {
      const s = this._samples.shift();
      this._total.x -= s.x;
      this._total.y -= s.y;
      this._total.z -= s.z;
    }
    this._total.x += sample.x;
    this._total.y += sample.y;
    this._total.z += sample.z;
    this._samples.push({ time: time, x: sample.x, y: sample.y, z: sample.z });
    const count = this._samples.length;
    this._average.set(this._total.x / count, this._total.y / count, this._total.z / count);
    return this._average;
  }

  get average() {
    return this._average;
  }

  clear() {
    this._samples = [];
    this._total.setScalar(0);
    this._average.setScalar(0);
  }
}  

export default function Player(props) {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const currentPlayerAvatarRef = useRef(null);
  const playerControllerRef = useRef(null);
  const playerMixerRef = useRef(null);
  const { camera, gl } = useThree();
  const { isPresenting } = useXR();
  const [presentingState, setPresentingState] = useState(false);
  const prevPositionRef = useRef(null);
  const { controllers } = useXR();
  const rightController = useController('right');
  const leftController = useController('left');
  const head = useRef(new XrHead(useThree()));
  const pointerOriginDamper = useRef(new Vector3Damper(DamperTimeS));
  const pointerDirectionDamper = useRef(new Vector3Damper(DamperTimeS));

  const characterRef = useRef(null);

  const [frameName, setFrameName] = useState();

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
  const action1Animation = useGame((state) => state.action1);
  const action2Animation = useGame((state) => state.action2);
  const action3Animation = useGame((state) => state.action3);
  const action4Animation = useGame((state) => state.action4);
  const resetAnimation = useGame((state) => state.reset);
  const [open, setOpen] = useState(false);
  const HEAD_LAYER = 1;


  const animationSet = {
    idle: "idle",
    walk: "walking",
    run: "running",
    jump: "jump",
  };

  useEffect(() => {
    initializeAnimationSet(animationSet);
  }, []);

  useEffect(() => {
    const handleReady = () => {
      setLoaderIsGone(true);
      removeEventListener('loaderIsGone', handleReady);
    };
    window.addEventListener('loaderIsGone', handleReady);
    addResetButton(props);
  }, []);

  const idleFile = idle;
  const walkingFile = walk;
  const runningFile = run;
  const jumpFile = jump;
  const fallingFile = fall;
  const spawnPoint = props.spawnPoint ? props.spawnPoint.map(Number) : [0, 0, 0];
  const { scene, clock } = useThree();
  const { world, rapier } = useRapier();
  const participantObject = scene.getObjectByName("playerOne");
  let debug   = {};

  useEffect(() => {
    if (userData.playerVRM.endsWith('.png')) {
      setAvatarIsSprite(true);
    }
  }, []);

  let animationFiles = [idleFile, walkingFile, runningFile, jumpFile];
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

  useEffect(() => {
    if (!currentPlayerAvatarRef.current) {
      const loader = new GLTFLoader();
      const ktx2Loader = new KTX2Loader();
      ktx2Loader.setTranscoderPath(threeObjectPluginRoot + "/inc/utils/basis/");
      ktx2Loader.detectSupport(gl);
      loader.setKTX2Loader(ktx2Loader);
	  const helperRoot = new Group();
	  helperRoot.renderOrder = 10000;
	  scene.add(helperRoot);
	  debug.pnt = new ShapePointsMesh();
	  debug.ln  = new DynLineMesh();
	  scene.add(debug.pnt);
	  scene.add(debug.ln);

	loader.register( parser => new VRMLoaderPlugin( parser, { helperRoot } ) );
	// loader.register( parser => new VRMLoaderPlugin( parser ) );

	  loader.load(playerURL, (gltf) => {
		currentPlayerAvatarRef.current = gltf;
		playerControllerRef.current = gltf.userData.vrm;
	  
		// Calculate the avatar's height offset
		const headBone = gltf.userData.vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head);
		headBone.layers.set(HEAD_LAYER);
		headBone.visible = false;
		// traverse the head bone to hide the mesh
		headBone.traverse((child) => {
			if(child.isMesh){
				child.visible = false;
			}
		});
		const headWorldPosition = new Vector3();
		headBone.getWorldPosition(headWorldPosition);
	  
		const avatarWorldPosition = new Vector3();
		gltf.scene.getWorldPosition(avatarWorldPosition);
	  
		props.avatarHeightOffset.current = headWorldPosition.y - avatarWorldPosition.y;
	  
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

  useEffect(() => {
	if( isPresenting ){
		console.log( 'Presenting' );
		// kill all animations
		// if (playerMixerRef.current) {
		// 	playerMixerRef.current.stopAllAction();
		// } 
		// stop idle
		if (animationsRef.current) {
			const { idle, walking, running, jump, falling } = animationsRef.current;
			if(idle){
				idle.stop();
			}
			if(walking){
				walking.stop();
			}
			if(running){
				running.stop();
			}
			if(jump){
				jump.stop();
			}
		}
	}
   }, [isPresenting]);

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
  const updateRate = 1000 / 5;
  const lastNetworkUpdateTimeRef = useRef(0);
  let countHangtime = 0;
  let isMoving;
  let lastKeyPressTime = 0;
  let wasJumping = false;

  useEffect(() => {
    isMoving = false;
  }, []);
  let isJumping = false;
  const getJoystickValues = useJoystickControls(
    (state) => state.getJoystickValues
  );
  const playerForward = new Vector3(0, 0, 1);

	useFrame((state, delta) => {
    const joystickValues = getJoystickValues();
    let forward = props.movement.current.forward;
    let backward = props.movement.current.backward;
    let left = props.movement.current.left;
    let right = props.movement.current.right;
    let shift = props.movement.current.shift;
    let space = props.movement.current.space;

    if (joystickValues) {
      if (joystickValues.joystickAng > 0) {
        if (joystickValues.joystickDis > 60) {
          shift = true;
        }
        forward = true;
      }
      if (joystickValues.button1Pressed === true) {
        space = true;
      }
    }

    if (playerControllerRef.current) {
      playerControllerRef.current.update(delta);
    }

    if (playerMixerRef.current) {
      playerMixerRef.current.update(delta);
    }

    const now = state.clock.elapsedTime * 1000;

    if (backward || forward || left || right) {
      if (characterRef.current.userData.canJump) {
        isMoving = true;

        if (now - lastKeyPressTime > 100) {
          if (window.p2pcf) {
            const participantObject = scene.getObjectByName("playerOne");

            var target = new Vector3();
            var worldPosition = participantObject.getWorldPosition(target);
            const position = [
              worldPosition.x,
              worldPosition.y,
              worldPosition.z
            ];

            const rotation = [
              participantObject.parent.parent.rotation.x,
              participantObject.parent.parent.rotation.y,
              participantObject.parent.parent.rotation.z
            ];

            const currentAction = !characterRef.current.userData.canJump ? "jumping" : "walking";
            const messageObject = {
              [window.p2pcf.clientId]: {
                position: position,
                rotation: rotation,
                profileImage: userData.profileImage,
                playerVRM: userData.playerVRM,
                vrm: userData.vrm,
                inWorldName: window.userData.inWorldName ? window.userData.inWorldName : userData.inWorldName,
                isMoving: {
                  action: currentAction,
                  instance: 'update',
                  hangtime: countHangtime
                }
              }
            };

            if (shift && characterRef.current.userData.canJump) {
              messageObject[window.p2pcf.clientId].isMoving.action = "running";
            }

            const message = JSON.stringify(messageObject);
            window.p2pcf.broadcast(new TextEncoder().encode(message)), window.p2pcf;
            lastKeyPressTime = now;
            lastNetworkUpdateTimeRef.current = now;
          }
        }

        if (now - lastNetworkUpdateTimeRef.current > updateRate) {
          if (window.p2pcf) {
            const participantObject = scene.getObjectByName("playerOne");

            var target = new Vector3();
            var worldPosition = participantObject.getWorldPosition(target);
            const position = [
              worldPosition.x,
              worldPosition.y,
              worldPosition.z
            ];

            const rotation = [
              participantObject.parent.parent.rotation.x,
              participantObject.parent.parent.rotation.y,
              participantObject.parent.parent.rotation.z
            ];

            const currentAction = !characterRef.current.userData.canJump ? "jumping" : "walking";

            const messageObject = {
              [window.p2pcf.clientId]: {
                position: position,
                rotation: rotation,
                profileImage: userData.profileImage,
                playerVRM: userData.playerVRM,
                vrm: userData.vrm,
                inWorldName: window.userData.inWorldName ? window.userData.inWorldName : userData.inWorldName,
                isMoving: {
                  action: currentAction,
                  instance: 'update',
                  hangtime: countHangtime
                }
              }
            };

            if (shift && characterRef.current.userData.canJump) {
              messageObject[window.p2pcf.clientId].isMoving.action = "running";
            }

            const message = JSON.stringify(messageObject);
            window.p2pcf.broadcast(new TextEncoder().encode(message)), window.p2pcf;
            lastNetworkUpdateTimeRef.current = now;
          }
        }

        clearTimeout(movementTimeoutRef.current);
        movementTimeoutRef.current = setTimeout(() => {
          isMoving = false;
        }, 500);
      }
    } else {
      if (isMoving) {
        isMoving = false;
        clearTimeout(movementTimeoutRef.current);
        if (window.p2pcf?.clientId) {
          const participantObject = scene.getObjectByName("playerOne");
          var target = new Vector3();
          var worldPosition = participantObject.getWorldPosition(target);
          const position = [
            worldPosition.x,
            worldPosition.y,
            worldPosition.z
          ];

          const messageStopObject = {
            [window.p2pcf.clientId]: {
              isMoving: false,
              position: position
            }
          };
          const messageStop = JSON.stringify(messageStopObject);
          window.p2pcf.broadcast(new TextEncoder().encode(messageStop));
          lastNetworkUpdateTimeRef.current = now;
        }
      }
    }

    if (isPresenting && !presentingState) {
      const newCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	  const participantObject = scene.getObjectByName("playerOne");
	// set the rotation to 0
	participantObject.parent.parent.rotation.set(0, 0, 0);
	participantObject.rotation.set(0, 0, 0);
      const xrCamera = gl.xr.getCamera(newCamera);
      gl.xr.enabled = true;
      state.camera = xrCamera;
      setPresentingState(true);
    } else if (!isPresenting && presentingState) {
      setPresentingState(false);
    }

    handleBlinking(delta);

    if (animationsRef.current) {
      if (playerControllerRef.current && participantObject) {
        const cameraWorldQuaternion = new Quaternion();
        camera.getWorldQuaternion(cameraWorldQuaternion);
        const cameraForward = new Vector3(0, 0, -1).applyQuaternion(cameraWorldQuaternion);

        const characterWorldQuaternion = new Quaternion();
        participantObject.parent.getWorldQuaternion(characterWorldQuaternion);
        const characterForward = new Vector3(0, 0, 1).applyQuaternion(characterWorldQuaternion);
        const neutralRotation = new Euler(0, 0, 0);

        const characterToCamera = new Vector3().subVectors(camera.position, participantObject.getWorldPosition(new Vector3())).normalize();

        const dotProduct = characterForward.dot(cameraForward);
        const azimuthalAngle = Math.acos(Math.min(Math.max(dotProduct, -1), 1));

        const angleThreshold = Math.PI / 2;
        if (azimuthalAngle < angleThreshold) {
          if (avatarIsSprite) {
            if (isMoving && frameName !== 'WalkForward') {
              setFrameName('WalkForward');
            }
            if (isMoving === false) {
              if (frameName !== 'ForwardIdle') {
                setFrameName('ForwardIdle');
              }
            }
          }
        } else {
          if (avatarIsSprite && isMoving && frameName !== 'WalkBackward') {
            setFrameName('WalkBackward');
          }
          if (avatarIsSprite && isMoving === false && frameName !== 'BackwardIdle') {
            setFrameName('BackwardIdle');
          }
        }
      }

      const { idle, walking, running, jump, falling } = animationsRef.current;

      if (props.movement.current.respawn) {
        characterRef.current.setBodyType(rapier.RigidBodyType.Fixed, 1);
        characterRef.current.setTranslation(new Vector3(Number(spawnPoint[0]), Number(spawnPoint[1]), Number(spawnPoint[2])), true);
      } else if (!props.movement.current.respawn && characterRef.current.bodyType() === 1) {
        characterRef.current.setBodyType(rapier.RigidBodyType.Dynamic, 0);
      }

      if (isMoving && characterRef.current.userData.canJump) {
        jump.clampWhenFinished = false;
        jump.reset();
        jump.setEffectiveTimeScale(0);
        jump.setEffectiveWeight(0);
      } else if (!isMoving && characterRef.current.userData.canJump) {
        jump.clampWhenFinished = false;
        jump.reset();
        jump.setEffectiveTimeScale(0);
        jump.setEffectiveWeight(0);
        idle.setEffectiveTimeScale(1);
        idle.setEffectiveWeight(1);
      }

      if (!characterRef.current.userData.canJump) {
        if (window.p2pcf) {
			const participantObject = scene.getObjectByName("playerOne");

			var target = new Vector3();
			var worldPosition = participantObject.getWorldPosition(target);
			const position = [
			  worldPosition.x,
			  worldPosition.y,
			  worldPosition.z
			];
  
			const rotation = [
			  participantObject.parent.parent.rotation.x,
			  participantObject.parent.parent.rotation.y,
			  participantObject.parent.parent.rotation.z
			];
			if (!prevPositionRef.current || Math.abs(position[1] - prevPositionRef.current[1]) > 0.01) {
			  const messageObject = {
				[window.p2pcf.clientId]: {
				  position: position,
				  rotation: rotation,
				  profileImage: userData.profileImage,
				  playerVRM: userData.playerVRM,
				  vrm: userData.vrm,
				  inWorldName: window.userData.inWorldName ? window.userData.inWorldName : userData.inWorldName,
				  isMoving: {
					action: "jumping",
					instance: 'first',
					hangtime: countHangtime
				  }
				}
			  };
			  const message = JSON.stringify(messageObject);
			  if ((now - lastNetworkUpdateTimeRef.current > updateRate) && (lastNetworkUpdateTimeRef.current !== 0)) {
				window.p2pcf.broadcast(new TextEncoder().encode(message)), window.p2pcf;
				lastNetworkUpdateTimeRef.current = now;
			  }
			}
			prevPositionRef.current = position;
		  }
  
		  countHangtime++;
  
		  if (jump.getEffectiveTimeScale() === 0) {
			if (countHangtime > 3) {
			  jump.setEffectiveTimeScale(1);
			  jump.setEffectiveWeight(1);
			  jump.clampWhenFinished = true;
			  jump.time = jump._clip.duration;
			  jump.play();
			  running.setEffectiveTimeScale(0);
			  running.setEffectiveWeight(0);
			  walking.setEffectiveTimeScale(0);
			  walking.setEffectiveWeight(0);
			}
		  }
  
		  wasJumping = true;
		} else {
		  if (wasJumping) {
			if (window.p2pcf) {
			  const participantObject = scene.getObjectByName("playerOne");
			  setTimeout(() => {
				var target = new Vector3();
				var worldPosition = participantObject.getWorldPosition(target);
				const position = [
				  worldPosition.x,
				  worldPosition.y,
				  worldPosition.z
				];
  
				const rotation = [
				  participantObject.parent.parent.rotation.x,
				  participantObject.parent.parent.rotation.y,
				  participantObject.parent.parent.rotation.z
				];
  
				if ((countHangtime > 0) && lastNetworkUpdateTimeRef.current !== 0) {
				  const messageStopObject = {
					[window.p2pcf.clientId]: {
					  isMoving: {
						action: "jumpStop",
						hangtime: countHangtime
					  },
					  position: position,
					  rotation: rotation
					}
				  };
				  const messageStop = JSON.stringify(messageStopObject);
				  window.p2pcf.broadcast(new TextEncoder().encode(messageStop));
				  countHangtime = 0;
				  lastNetworkUpdateTimeRef.current = now;
				}
			  }, 100);
			}
  
			wasJumping = false;
		  }
		}
  
		if (isMoving && characterRef.current.userData.canJump) {
		  countHangtime = 0;
  
		  if (shift) {
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
		} else {
		  if (characterRef.current.userData.canJump) {
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
  
		if (space) {
		  if (characterRef.current.userData.canJump) {
			isJumping = true;
			countHangtime = 0;
			jump.setEffectiveTimeScale(1);
			jump.setEffectiveWeight(1);
			idle.setEffectiveTimeScale(0);
			walking.setEffectiveTimeScale(0);
			running.setEffectiveTimeScale(0);
			idle.setEffectiveWeight(0);
			walking.setEffectiveWeight(0);
			running.setEffectiveWeight(0);
			jump.setLoop(LoopOnce, 1);
			jump.reset();
			jump.clampWhenFinished = true;
			jump.play();
		  }
		}
		}
	});

	function applySimpleIK(spineBone, boneChain, targetPosition, iterations = 10, elbowWeight = 0.8, wristWeight = 0.2, shoulderWeight = 0.2) {
		const endEffector = boneChain[boneChain.length - 1];
	
		for (let i = 0; i < iterations; i++) {
		for (let j = boneChain.length - 2; j >= 0; j--) {
			const bone = boneChain[j];
			const nextBone = boneChain[j + 1];
			
			const toTarget = targetPosition.clone().sub(bone.getWorldPosition(new Vector3()));
			const toNextBone = nextBone.getWorldPosition(new Vector3()).sub(bone.getWorldPosition(new Vector3()));
			
			const quaternion = new Quaternion().setFromUnitVectors(toNextBone.normalize(), toTarget.normalize());
			
			let weight;
			if (j === 0) {
			weight = shoulderWeight;
			} else if (j === 1) {
			const spineWorldPosition = new Vector3();
			spineBone.getWorldPosition(spineWorldPosition);
			const distanceToBody = targetPosition.distanceTo(spineWorldPosition);
			const elbowBendThreshold = 0.3;
		
			if (distanceToBody < elbowBendThreshold) {
				const elbowBendAngle = Math.PI / 16;
				const elbowBendAxis = new Vector3(0, 0, 1);
				const elbowBendQuaternion = new Quaternion().setFromAxisAngle(elbowBendAxis, elbowBendAngle);
				quaternion.multiply(elbowBendQuaternion);
			}
			weight = elbowWeight;
			} else {
			weight = wristWeight;
			}
			// limit weight to reasonable values
			weight = MathUtils.clamp(weight, 0, 1);

			bone.quaternion.slerp(quaternion, weight);
		}
		}
	}

	// useFrame((state, delta) => {
	// 	if (isPresenting) {
	// 		camera.layers.disableAll();
	// 		camera.layers.enable(0); // Enable the default layer
	// 		camera.layers.disable(HEAD_LAYER); // Disable the head layer
	// 		// console.log('Presenting', playerControllerRef.current.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head));
	// 	} else {
	// 		camera.layers.enableAll(); // Enable all layers when not in presenting mode
	// 	}
		
	// 	if (isPresenting && playerControllerRef.current && (rightController || leftController)) {
	// 	const vrm = playerControllerRef.current;
	// 	const avatarRootGroup = vrm.scene;
	
	// 	// Align the avatar's position relative to the camera
	// 	const cameraPosition = new Vector3();
	// 	camera.getWorldPosition(cameraPosition);
	// 	avatarRootGroup.parent.parent.position.set(
	// 		cameraPosition.x,
	// 		cameraPosition.y - (props.avatarHeightOffset.current - 0.6),
	// 		cameraPosition.z
	// 	);
	
	// 	// Set the avatar's body rotation to match the camera's Y rotation
	// 	const cameraRotation = new Quaternion();
	// 	camera.getWorldQuaternion(cameraRotation);
	// 	const yRotation = new Euler().setFromQuaternion(cameraRotation, 'YXZ').y;
	// 	avatarRootGroup.parent.parent.rotation.y = yRotation;
	
	// 	const applyArmIK = (controllerVisible, controller, shoulderBone, upperArmBone, lowerArmBone, handBone, isRightArm) => {
	// 		if (controllerVisible) {
	// 		const handTarget = new Vector3();
	// 		const handRotation = new Quaternion();
	// 		controller.controller.getWorldPosition(handTarget);
	// 		controller.controller.getWorldQuaternion(handRotation);
		
	// 		const avatarWorldMatrix = new Matrix4();
	// 		avatarRootGroup.matrixWorld.copy(avatarWorldMatrix);
	// 		avatarWorldMatrix.invert();
	// 		handTarget.applyMatrix4(avatarWorldMatrix);
		
	// 		const handDistance = handTarget.distanceTo(cameraPosition);
		
	// 		const offsetScale = 0.1;
	// 		const handOffset = new Vector3(controllerVisible === rightController ? -offsetScale * handDistance : offsetScale * handDistance, 0, 0);
		
	// 		handTarget.add(handOffset);
		
	// 		const armChain = [shoulderBone, upperArmBone, lowerArmBone];
	// 		const spineBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Spine);
		
	// 		applySimpleIK(spineBone, armChain, handTarget, 10);
		
	// 		const spineWorldPosition = new Vector3();
	// 		spineBone.getWorldPosition(spineWorldPosition);
	// 		const distanceToBody = handTarget.distanceTo(spineWorldPosition);
	// 		const elbowBendThreshold = 0.45;
		
	// 		if (distanceToBody < elbowBendThreshold) {
	// 			const minRotationX = 0; // Block rotation around X-axis
	// 			const maxRotationX = 0; // Block rotation around X-axis
	// 			const minRotationY = 0; // Block rotation around Y-axis
	// 			const maxRotationY = 0; // Block rotation around Y-axis
	// 			const minRotationZ = isRightArm ? 0 : -Math.PI / 2; // Allow rotation around Z-axis based on arm
	// 			const maxRotationZ = isRightArm ? Math.PI / 2 : 0; // Limit the maximum rotation around Z-axis based on arm
		
	// 			const lowerArmWorldQuaternion = new Quaternion();
	// 			lowerArmBone.getWorldQuaternion(lowerArmWorldQuaternion);
		
	// 			const elbowBendAngle = MathUtils.clamp(Math.PI / 8 * (1 - distanceToBody / elbowBendThreshold), minRotationZ, maxRotationZ);
	// 			const elbowBendAxis = new Vector3(0, 0, 1);
	// 			const elbowBendQuaternion = new Quaternion().setFromAxisAngle(elbowBendAxis, elbowBendAngle);
		
	// 			const targetRotation = lowerArmWorldQuaternion.multiply(elbowBendQuaternion);
		
	// 			const lowerArmLocalRotation = new Euler().setFromQuaternion(targetRotation.multiply(lowerArmBone.parent.quaternion.clone().invert()), 'YXZ');
	// 			lowerArmLocalRotation.x = MathUtils.clamp(lowerArmLocalRotation.x, minRotationX, maxRotationX);
	// 			lowerArmLocalRotation.y = MathUtils.clamp(lowerArmLocalRotation.y, minRotationY, maxRotationY);
	// 			lowerArmLocalRotation.z = MathUtils.clamp(lowerArmLocalRotation.z, minRotationZ, maxRotationZ);
		
	// 			lowerArmBone.quaternion.setFromEuler(lowerArmLocalRotation);
	// 		} else {
	// 			lowerArmBone.quaternion.slerp(new Quaternion(), 0.1); // Smoothly reset the rotation
	// 		}
	// 			handBone.quaternion.copy(handRotation);
	// 		}
	// 	};
						
	// 		// Get the avatar's arm bones
	// 		const rightShoulderBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightShoulder);
	// 		const rightUpperArmBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm);
	// 		const rightLowerArmBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightLowerArm);
	// 		const rightHandBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightHand);
	// 		const leftShoulderBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftShoulder);
	// 		const leftUpperArmBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm);
	// 		const leftLowerArmBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftLowerArm);
	// 		const leftHandBone = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftHand);
	// 		// Apply IK to the right arm
	// 		applyArmIK(rightController, rightController, rightShoulderBone, rightUpperArmBone, rightLowerArmBone, rightHandBone, true);

	// 		// Apply IK to the left arm
	// 		applyArmIK(leftController, leftController, leftShoulderBone, leftUpperArmBone, leftLowerArmBone, leftHandBone, false);
	
	// 		// Get the world rotation of the right and left controllers
	// 		const rightWristRotation = new Quaternion();
	// 		const leftWristRotation = new Quaternion();
	// 		if (rightController) {
	// 			rightController.controller.getWorldQuaternion(rightWristRotation);
	// 		}
	// 		if (leftController) {
	// 			leftController.controller.getWorldQuaternion(leftWristRotation);
	// 		}

	// 		// add a threshold to influence the y rotation of the lower arm
	// 		const yRotationThresholdLeft = 0.001;
	// 		const yRotationThresholdRight = 0.001;

	// 		// determine the current rotation of the hand bone
	// 		const rightHandBoneWorldQuaternion = new Quaternion();
	// 		const leftHandBoneWorldQuaternion = new Quaternion();
	// 		rightHandBone.getWorldQuaternion(rightHandBoneWorldQuaternion);
	// 		leftHandBone.getWorldQuaternion(leftHandBoneWorldQuaternion);

	// 		// apply the influence of the y rotation to the lower arm bone based on the hands and limit the rotation to only a 10 degree angle
	// 		const rightHandBoneLocalRotation = new Euler().setFromQuaternion(rightHandBoneWorldQuaternion.multiply(rightLowerArmBone.parent.quaternion.clone().invert()), 'YXZ');
	// 		const leftHandBoneLocalRotation = new Euler().setFromQuaternion(leftHandBoneWorldQuaternion.multiply(leftLowerArmBone.parent.quaternion.clone().invert()), 'YXZ');
	// 		rightHandBoneLocalRotation.y = MathUtils.clamp(rightHandBoneLocalRotation.y, -yRotationThresholdRight, yRotationThresholdRight);
	// 		leftHandBoneLocalRotation.y = MathUtils.clamp(leftHandBoneLocalRotation.y, -yRotationThresholdLeft, yRotationThresholdLeft);

	// 		// dont allow a rotation greater than 10 degrees
	// 		rightHandBoneLocalRotation.z = MathUtils.clamp(rightHandBoneLocalRotation.z, -0.0005, 0.0005);
	// 		leftHandBoneLocalRotation.z = MathUtils.clamp(leftHandBoneLocalRotation.z, -0.0005, 0.0005);

	// 		// set the rotation of the lower arm bone based on the hand rotation
	// 		rightLowerArmBone.quaternion.setFromEuler(rightHandBoneLocalRotation);
	// 		leftLowerArmBone.quaternion.setFromEuler(leftHandBoneLocalRotation);

	// 		// Configurable rotation offsets for each axis (in degrees)
	// 		const rightHandRotationOffsetX = 0;
	// 		const rightHandRotationOffsetY = 0;
	// 		const rightHandRotationOffsetZ = -90;

	// 		const leftHandRotationOffsetX = 0;
	// 		const leftHandRotationOffsetY = 0;
	// 		const leftHandRotationOffsetZ = 90;

	// 		// Configurable rotation axes for each hand
	// 		const rightHandRotationAxisX = new Vector3(1, 0, 0); // X-axis
	// 		const rightHandRotationAxisY = new Vector3(0, 1, 0); // Y-axis
	// 		const rightHandRotationAxisZ = new Vector3(0, 0, 1); // Z-axis

	// 		const leftHandRotationAxisX = new Vector3(1, 0, 0); // X-axis
	// 		const leftHandRotationAxisY = new Vector3(0, 1, 0); // Y-axis
	// 		const leftHandRotationAxisZ = new Vector3(0, 0, 1); // Z-axis

	// 		// Convert degrees to radians
	// 		const rightHandRotationOffsetXRad = rightHandRotationOffsetX * (Math.PI / 180);
	// 		const rightHandRotationOffsetYRad = rightHandRotationOffsetY * (Math.PI / 180);
	// 		const rightHandRotationOffsetZRad = rightHandRotationOffsetZ * (Math.PI / 180);

	// 		const leftHandRotationOffsetXRad = leftHandRotationOffsetX * (Math.PI / 180);
	// 		const leftHandRotationOffsetYRad = leftHandRotationOffsetY * (Math.PI / 180);
	// 		const leftHandRotationOffsetZRad = leftHandRotationOffsetZ * (Math.PI / 180);

	// 		// Adjust the rotation offset for the right hand
	// 		const rightHandRotationOffset = new Quaternion()
	// 		.setFromAxisAngle(rightHandRotationAxisX, rightHandRotationOffsetXRad) // Rotate around the X-axis
	// 		.multiply(new Quaternion().setFromAxisAngle(rightHandRotationAxisY, rightHandRotationOffsetYRad)) // Rotate around the Y-axis
	// 		.multiply(new Quaternion().setFromAxisAngle(rightHandRotationAxisZ, rightHandRotationOffsetZRad)); // Rotate around the Z-axis

	// 		// Adjust the rotation offset for the left hand
	// 		const leftHandRotationOffset = new Quaternion()
	// 		.setFromAxisAngle(leftHandRotationAxisX, leftHandRotationOffsetXRad) // Rotate around the X-axis
	// 		.multiply(new Quaternion().setFromAxisAngle(leftHandRotationAxisY, leftHandRotationOffsetYRad)) // Rotate around the Y-axis
	// 		.multiply(new Quaternion().setFromAxisAngle(leftHandRotationAxisZ, leftHandRotationOffsetZRad)); // Rotate around the Z-axis

	// 		// Get the user's WebXR camera rotation
	// 		const cameraRot = new Quaternion();
	// 		camera.getWorldQuaternion(cameraRot);

	// 		// Extract the camera's Y rotation (heading)
	// 		const cameraHeading = new Euler().setFromQuaternion(cameraRot, 'YXZ').y;

	// 		// Calculate the adjustment factor based on the camera's heading
	// 		const adjustmentFactor = Math.abs(Math.sin(cameraHeading));

	// 		// Clamp the adjustment factor to a desired range (e.g., 0.5 to 1.0)
	// 		const clampedAdjustmentFactor = MathUtils.clamp(adjustmentFactor, 0.5, 1.0);

	// 		if (rightController) {
	// 		const rightHandLocalQuaternion = rightHandBone.quaternion.clone();
	// 		const adjustedRightHandLocalQuaternion = rightHandLocalQuaternion.slerp(
	// 			rightHandLocalQuaternion.multiply(rightHandRotationOffset),
	// 			clampedAdjustmentFactor
	// 		);
	// 		rightHandBone.quaternion.copy(adjustedRightHandLocalQuaternion);
	// 		}
	// 		if (leftController) {
	// 		const leftHandLocalQuaternion = leftHandBone.quaternion.clone();
	// 		const adjustedLeftHandLocalQuaternion = leftHandLocalQuaternion.slerp(
	// 			leftHandLocalQuaternion.multiply(leftHandRotationOffset),
	// 			clampedAdjustmentFactor
	// 		);
	// 		leftHandBone.quaternion.copy(adjustedLeftHandLocalQuaternion);
	// 		}
	// 	}
	// });
 
	useFrame((state, delta) => {
		if (isPresenting) {
			camera.layers.disableAll();
			camera.layers.enable(0); // Enable the default layer
			camera.layers.disable(HEAD_LAYER); // Disable the head layer
		} else {
			camera.layers.enableAll(); // Enable all layers when not in presenting mode
		}
		
		if (isPresenting && playerControllerRef.current && (rightController || leftController)) {
			const vrm = playerControllerRef.current;
			const avatarRootGroup = vrm.scene;
		
			// Align the avatar's position relative to the camera
			const cameraPosition = new Vector3();
			camera.getWorldPosition(cameraPosition);
			avatarRootGroup.parent.parent.position.set(
			cameraPosition.x,
			cameraPosition.y - (props.avatarHeightOffset.current - 0.6),
			cameraPosition.z
			);
		
			// Set the avatar's body rotation to match the camera's Y rotation
			const cameraRotation = new Quaternion();
			camera.getWorldQuaternion(cameraRotation);
			const yRotation = new Euler().setFromQuaternion(cameraRotation, 'YXZ').y;
			avatarRootGroup.parent.parent.rotation.y = yRotation;

			// Create an Ossos armature using the VRM humanoid bones
			const arm = new Armature();
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Hips).name, -1);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Spine).name, 0);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Chest).name, 1);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.UpperChest).name, 2);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Neck).name, 3);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head).name, 4);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftShoulder).name, 3);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm).name, 6);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftLowerArm).name, 7);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftHand).name, 8);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightShoulder).name, 3);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm).name, 10);
			arm.addBone('forearm_r', 11);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightHand).name, 12);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperLeg).name, 0);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftLowerLeg).name, 14);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftFoot).name, 15);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftToes).name, 16);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperLeg).name, 0);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightLowerLeg).name, 18);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightFoot).name, 19);
			arm.addBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightToes).name, 20);

			const pose = arm.newPose();

			// Create a biped rig and auto-rig it
			const rig = new BipedRig();
			rig.autoRig(arm);
			rig.bindPose(pose);
			rig.useSolversForRetarget( arm );  // Use Default Solvers for known chains, Should Happen After Bind

			// // Set up solvers for the hands
			// if (rig.handL) {
			// 	rig.handL.setSolver(new SwingTwistSolver().initData(pose, rig.handL));
			// }
		
			// if (rig.handR) {
			// 	rig.handR.setSolver(new SwingTwistSolver().initData(pose, rig.handR));
			// }
		
			// Set up the right arm
			const rightShoulderBone = arm.getBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightShoulder).name);
			const rightShoulderPose = pose.bones[rightShoulderBone.idx];
			const rightUpperArmBone = arm.getBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm).name);
			const rightUpperArmPose = pose.bones[rightUpperArmBone.idx];
			const rightLowerArmBone = arm.getBone('forearm_r');
			const rightLowerArmPose = pose.bones[rightLowerArmBone.idx];
			const rightHandBone = arm.getBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightHand).name);
			const rightHandPose = pose.bones[rightHandBone.idx];

			// Adjust the rest pose of the right arm
			const rightArmRestRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);
			const rightShoulderRestPoseQuat = new Quaternion(
			rightShoulderPose.local.rot[0],
			rightShoulderPose.local.rot[1],
			rightShoulderPose.local.rot[2],
			rightShoulderPose.local.rot[3]
			);
			// rightShoulderRestPoseQuat.multiply(rightArmRestRotation);

			// Ensure local.rot is a valid Float32Array
			if (!(rightShoulderPose.local.rot instanceof Float32Array) || rightShoulderPose.local.rot.length !== 4) {
			rightShoulderPose.local.rot = new Float32Array(4);
			}

			rightShoulderPose.local.rot[0] = rightShoulderRestPoseQuat.x;
			rightShoulderPose.local.rot[1] = rightShoulderRestPoseQuat.y;
			rightShoulderPose.local.rot[2] = rightShoulderRestPoseQuat.z;
			rightShoulderPose.local.rot[3] = rightShoulderRestPoseQuat.w;

			// Set up the left arm
			const leftShoulderBone = arm.getBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftShoulder).name);
			const leftShoulderPose = pose.bones[leftShoulderBone.idx];
			const leftUpperArmBone = arm.getBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm).name);
			const leftUpperArmPose = pose.bones[leftUpperArmBone.idx];
			const leftLowerArmBone = arm.getBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftLowerArm).name);
			const leftLowerArmPose = pose.bones[leftLowerArmBone.idx];
			const leftHandBone = arm.getBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftHand).name);
			const leftHandPose = pose.bones[leftHandBone.idx];

			// Adjust the rest pose of the left arm
			const leftArmRestRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI);
			const leftShoulderRestPoseQuat = new Quaternion(
			leftShoulderPose.local.rot[0],
			leftShoulderPose.local.rot[1],
			leftShoulderPose.local.rot[2],
			leftShoulderPose.local.rot[3]
			);
			// leftShoulderRestPoseQuat.multiply(leftArmRestRotation);

			// Ensure local.rot is a valid Float32Array
			if (!(leftShoulderPose.local.rot instanceof Float32Array) || leftShoulderPose.local.rot.length !== 4) {
			leftShoulderPose.local.rot = new Float32Array(4);
			}

			leftShoulderPose.local.rot[0] = leftShoulderRestPoseQuat.x;
			leftShoulderPose.local.rot[1] = leftShoulderRestPoseQuat.y;
			leftShoulderPose.local.rot[2] = leftShoulderRestPoseQuat.z;
			leftShoulderPose.local.rot[3] = leftShoulderRestPoseQuat.w;

			// // Set the target pole for the arms
			// rig.armR.solver.setTargetPole(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm).getWorldDirection(new Vector3()));
			// rig.armL.solver.setTargetPole(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm).getWorldDirection(new Vector3()));

			  

			// Set up the leg chains and solvers
			const FWD = [0, 0, 1];
			const UP = [0, 1, 0];
			const DN = [0, -1, 0];


		if (rightController) {
			const rightHandTarget = new Vector3();
			rightController.controller.getWorldPosition(rightHandTarget);
			rightHandTarget.sub(avatarRootGroup.parent.parent.getWorldPosition(new Vector3()));
			const rightPole = new Vector3().subVectors(rightHandTarget, 
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightShoulder).getWorldPosition(new Vector3()));
			// const rightPoleNormalized = rightPole.normalize();
			// rig.armR.solver.setTargetPole([rightPoleNormalized.x, rightPoleNormalized.y, rightPoleNormalized.z]);
			rig.armR.solver.setTargetPos([rightHandTarget.x, rightHandTarget.y, rightHandTarget.z]);
				
		// Set up the right hand pose
		const rightHandBone = arm.getBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightHand).name);
		const rightHandPose = pose.bones[rightHandBone.idx];

		// Adjust the rest pose of the right hand
		const rightHandRestRotation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
		const rightHandRestPoseQuat = new Quaternion(
		rightHandPose.local.rot[0],
		rightHandPose.local.rot[1],
		rightHandPose.local.rot[2],
		rightHandPose.local.rot[3]
		);
		rightHandRestPoseQuat.multiply(rightHandRestRotation);
		rightHandPose.local.rot.set(
		rightHandRestPoseQuat.x,
		rightHandRestPoseQuat.y,
		rightHandRestPoseQuat.z,
		rightHandRestPoseQuat.w
		);
	  }
	  if (leftController) {  
		const leftHandTarget = new Vector3();
		leftController.controller.getWorldPosition(leftHandTarget);
		leftHandTarget.sub(avatarRootGroup.parent.parent.getWorldPosition(new Vector3()));
		console.log("leftHandTarget", leftHandTarget);
		const leftPole = new Vector3().subVectors(leftHandTarget,
		vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftShoulder).getWorldPosition(new Vector3()));
		// const leftPoleNormalized = leftPole.normalize();
		// rig.armL.solver.setTargetPole([leftPole.x, leftPole.y, leftPole.z]);
		rig.armL.solver.setTargetPos([leftHandTarget.x, leftHandTarget.y, leftHandTarget.z]);
		
		// Set up the left hand pose
		const leftHandBone = arm.getBone(vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftHand).name);
		const leftHandPose = pose.bones[leftHandBone.idx];

		// Adjust the rest pose of the left hand
		const leftHandRestRotation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
		const leftHandRestPoseQuat = new Quaternion(
		leftHandPose.local.rot[0],
		leftHandPose.local.rot[1],
		leftHandPose.local.rot[2],
		leftHandPose.local.rot[3]
		);
		leftHandRestPoseQuat.multiply(leftHandRestRotation);
		leftHandPose.local.rot.set(
		leftHandRestPoseQuat.x,
		leftHandRestPoseQuat.y,
		leftHandRestPoseQuat.z,
		leftHandRestPoseQuat.w
		);
	  }

	      // Solve the IK and update the pose
		  pose.updateWorld();
		  rig.resolveToPose(pose, debug);
		  pose.updateWorld();
	  
		  // new quaternion from the rot[0], rot[1], rot[2], rot[3] values
		  const hipsQuaternion = new Quaternion(pose.bones[0].world.rot[0], pose.bones[0].world.rot[1], pose.bones[0].world.rot[2], pose.bones[0].world.rot[3]);
		  const spineQuaternion = new Quaternion(pose.bones[1].world.rot[0], pose.bones[1].world.rot[1], pose.bones[1].world.rot[2], pose.bones[1].world.rot[3]);
		  const chestQuaternion = new Quaternion(pose.bones[2].world.rot[0], pose.bones[2].world.rot[1], pose.bones[2].world.rot[2], pose.bones[2].world.rot[3]);
		  const upperChestQuaternion = new Quaternion(pose.bones[3].world.rot[0], pose.bones[3].world.rot[1], pose.bones[3].world.rot[2], pose.bones[3].world.rot[3]);
		  const neckQuaternion = new Quaternion(pose.bones[4].world.rot[0], pose.bones[4].world.rot[1], pose.bones[4].world.rot[2], pose.bones[4].world.rot[3]);
		  const headQuaternion = new Quaternion(pose.bones[5].world.rot[0], pose.bones[5].world.rot[1], pose.bones[5].world.rot[2], pose.bones[5].world.rot[3]);
		  const leftShoulderQuaternion = new Quaternion(pose.bones[6].world.rot[0], pose.bones[6].world.rot[1], pose.bones[6].world.rot[2], pose.bones[6].world.rot[3]);
		  const leftUpperArmQuaternion = new Quaternion(pose.bones[7].world.rot[0], pose.bones[7].world.rot[1], pose.bones[7].world.rot[2], pose.bones[7].world.rot[3]);
		  const leftLowerArmQuaternion = new Quaternion(pose.bones[8].world.rot[0], pose.bones[8].world.rot[1], pose.bones[8].world.rot[2], pose.bones[8].world.rot[3]);
		  const leftHandQuaternion = new Quaternion(pose.bones[9].world.rot[0], pose.bones[9].world.rot[1], pose.bones[9].world.rot[2], pose.bones[9].world.rot[3]);
		  const rightShoulderQuaternion = new Quaternion(pose.bones[10].world.rot[0], pose.bones[10].world.rot[1], pose.bones[10].world.rot[2], pose.bones[10].world.rot[3]);
		  const rightUpperArmQuaternion = new Quaternion(pose.bones[11].world.rot[0], pose.bones[11].world.rot[1], pose.bones[11].world.rot[2], pose.bones[11].world.rot[3]);
		  const rightLowerArmQuaternion = new Quaternion(pose.bones[12].world.rot[0], pose.bones[12].world.rot[1], pose.bones[12].world.rot[2], pose.bones[12].world.rot[3]);
		  const rightHandQuaternion = new Quaternion(pose.bones[13].world.rot[0], pose.bones[13].world.rot[1], pose.bones[13].world.rot[2], pose.bones[13].world.rot[3]);
		  const leftUpperLegQuaternion = new Quaternion(pose.bones[14].world.rot[0], pose.bones[14].world.rot[1], pose.bones[14].world.rot[2], pose.bones[14].world.rot[3]);
		  const leftLowerLegQuaternion = new Quaternion(pose.bones[15].world.rot[0], pose.bones[15].world.rot[1], pose.bones[15].world.rot[2], pose.bones[15].world.rot[3]);
		  const leftFootQuaternion = new Quaternion(pose.bones[16].world.rot[0], pose.bones[16].world.rot[1], pose.bones[16].world.rot[2], pose.bones[16].world.rot[3]);
		  const leftToesQuaternion = new Quaternion(pose.bones[17].world.rot[0], pose.bones[17].world.rot[1], pose.bones[17].world.rot[2], pose.bones[17].world.rot[3]);
		  const rightUpperLegQuaternion = new Quaternion(pose.bones[18].world.rot[0], pose.bones[18].world.rot[1], pose.bones[18].world.rot[2], pose.bones[18].world.rot[3]);
		  const rightLowerLegQuaternion = new Quaternion(pose.bones[19].world.rot[0], pose.bones[19].world.rot[1], pose.bones[19].world.rot[2], pose.bones[19].world.rot[3]);
		  const rightFootQuaternion = new Quaternion(pose.bones[20].world.rot[0], pose.bones[20].world.rot[1], pose.bones[20].world.rot[2], pose.bones[20].world.rot[3]);
		  const rightToesQuaternion = new Quaternion(pose.bones[21].world.rot[0], pose.bones[21].world.rot[1], pose.bones[21].world.rot[2], pose.bones[21].world.rot[3]);

		  
			// Update the VRM bones with the solved pose
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Hips).rotation.setFromQuaternion(hipsQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Spine).rotation.setFromQuaternion(spineQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Chest).rotation.setFromQuaternion(chestQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.UpperChest).rotation.setFromQuaternion(upperChestQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Neck).rotation.setFromQuaternion(neckQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head).rotation.setFromQuaternion(headQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftShoulder).rotation.setFromQuaternion(leftShoulderQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm).rotation.setFromQuaternion(leftUpperArmQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftLowerArm).rotation.setFromQuaternion(leftLowerArmQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftHand).rotation.setFromQuaternion(leftHandQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightShoulder).rotation.setFromQuaternion(rightShoulderQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm).rotation.setFromQuaternion(rightUpperArmQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightLowerArm).rotation.setFromQuaternion(rightLowerArmQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightHand).rotation.setFromQuaternion(rightHandQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperLeg).rotation.setFromQuaternion(leftUpperLegQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftLowerLeg).rotation.setFromQuaternion(leftLowerLegQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftFoot).rotation.setFromQuaternion(leftFootQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftToes).rotation.setFromQuaternion(leftToesQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperLeg).rotation.setFromQuaternion(rightUpperLegQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightLowerLeg).rotation.setFromQuaternion(rightLowerLegQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightFoot).rotation.setFromQuaternion(rightFootQuaternion);
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightToes).rotation.setFromQuaternion(rightToesQuaternion);
			

			// Update the bone positions
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Hips).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Spine).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Chest).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.UpperChest).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Neck).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftShoulder).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftLowerArm).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftHand).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightShoulder).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightLowerArm).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightHand).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperLeg).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftLowerLeg).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftFoot).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftToes).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperLeg).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightLowerLeg).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightFoot).updateMatrixWorld();
			vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightToes).updateMatrixWorld();	
			vrm.scene.updateMatrixWorld(true);
		
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
  
	const canvas = document.querySelector('div.threeov-main-canvas');
  
	return (
	  <>
		<KeyboardControls
		  map={keyboardMap}
		  domElement={canvas}
		>
		  <Ecctrl
			ref={characterRef}
			position={[Number(props.spawnPoint[0]), Number(props.spawnPoint[1]), Number(props.spawnPoint[2])]}
			turnSpeed={20}
			maxVelLimit={5}
			jumpVel={7}
			camInitDis={-3}
			camMaxDis={-6}
			camMinDis={-0.5}
			animated
			restitution={0.0}
			springK={0}
			camMoveSpeed={1.5}
			camZoomSpeed={1.5}
			autoBalance={true}
			airDragMultiplier={0.05}
			fallingGravityScale={3.5}
			wakeUpDelay={5000}
			camCollision={props.camCollisions === "1" ? true : false}
			disableFollowCam={isPresenting ? true : false}
			canSleep={true}
			ccd={true}
			additionalSolverIterations={1}
		  >
			{isModelLoaded && playerControllerRef.current && (
			  <>
				<primitive
				  userData={{ camExcludeCollision: true }}
				  visible={true}
				  name="playerOne"
				  object={playerControllerRef.current.scene}
				  position={[0, -0.65, 0]}
				  rotation={[0, 0, 0]}
				/>
				{avatarIsSprite && (
				  <SpriteAnimator
					name="playerOneSprite"
					userData={{ camExcludeCollision: true }}
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
					textureImageURL={userData.playerVRM}
					textureDataURL={(threeObjectPluginRoot + '/inc/utils/sprite.json')}
				  />
				)}
			  </>
			)}
		  </Ecctrl>
		</KeyboardControls>
	  </>
	);
  }
