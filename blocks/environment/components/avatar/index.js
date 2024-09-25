import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRMLLoader } from 'three/examples/jsm/loaders/VRMLLoader';
import { VRMUtils, VRMSchema, VRMHumanBoneName } from '@pixiv/three-vrm';

class ExokitAvatar {
  constructor(model, options = {}) {
	this.vrm = model;
	this.model = model.scene;

    this.options = {
      fingers: true,
      hair: true,
      decapitate: false,
      visemes: true,
      microphoneMediaStream: null,
      muted: true,
      debug: false,
      ...options,
    };

    this.inputs = {
      hmd: {
        position: new THREE.Vector3(),
        quaternion: new THREE.Quaternion(),
      },
      leftGamepad: {
        position: new THREE.Vector3(),
        quaternion: new THREE.Quaternion(),
        pointer: 0,
        grip: 0,
      },
      rightGamepad: {
        position: new THREE.Vector3(),
        quaternion: new THREE.Quaternion(),
        pointer: 0,
        grip: 0,
      },
    };

    this.floorHeight = 0;
    this.microphoneVolume = 0;

    this.init();
  }

  async init() {
	this.applyOptions();
	this.setUpAnimations();
	this.setUpAudio();
  }
  
  
  applyOptions() {
    const { vrm } = this.vrm;

    if (vrm) {
      const invisibleMeshes = [];

      if (!this.options.fingers) {
        invisibleMeshes.push(
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftIndexDistal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftIndexIntermediate),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftIndexProximal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftLittleDistal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftLittleIntermediate),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftLittleProximal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftMiddleDistal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftMiddleIntermediate),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftMiddleProximal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftRingDistal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftRingIntermediate),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftRingProximal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftThumbDistal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftThumbIntermediate),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftThumbProximal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightIndexDistal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightIndexIntermediate),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightIndexProximal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightLittleDistal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightLittleIntermediate),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightLittleProximal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightMiddleDistal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightMiddleIntermediate),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightMiddleProximal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightRingDistal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightRingIntermediate),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightRingProximal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightThumbDistal),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightThumbIntermediate),
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightThumbProximal),
        );
      }

      if (!this.options.hair) {
        invisibleMeshes.push(
          ...vrm.secondaryAnimation._colliderGroups._colliders
            .map(collider => collider.node)
            .filter(node => node !== undefined),
        );
      }

      if (this.options.decapitate) {
        invisibleMeshes.push(vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Head));
      }

      invisibleMeshes.forEach(mesh => {
        if (mesh) {
          mesh.visible = false;
        }
      });

      if (!this.options.visemes || this.options.muted) {
        vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Aa, 0);
        vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Ih, 0);
        vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Ou, 0);
        vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Ee, 0);
        vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.Oh, 0);
      }

      if (this.options.debug) {
        vrm.scene.add(new THREE.SkeletonHelper(vrm.scene));
      }
    }
  }

  setUpAnimations() {
    this.animations = {};

    if (this.vrm) {
		console.log("bones", this.vrm.humanoid.humanBones);

		console.log("bones", this.vrm.humanoid.humanBones);

		const boneMap = {
		  [VRMHumanBoneName.Hips]: 0,
		  [VRMHumanBoneName.Spine]: 1,
		  [VRMHumanBoneName.Chest]: 2,
		  [VRMHumanBoneName.UpperChest]: 3,
		  [VRMHumanBoneName.Neck]: 4,
		  [VRMHumanBoneName.Head]: 5,
		  [VRMHumanBoneName.LeftShoulder]: 6,
		  [VRMHumanBoneName.LeftUpperArm]: 7,
		  [VRMHumanBoneName.LeftLowerArm]: 8,
		  [VRMHumanBoneName.LeftHand]: 9,
		  [VRMHumanBoneName.RightShoulder]: 10,
		  [VRMHumanBoneName.RightUpperArm]: 11,
		  [VRMHumanBoneName.RightLowerArm]: 12,
		  [VRMHumanBoneName.RightHand]: 13,
		};
		
		console.log("All bones:", this.vrm.humanoid.humanBones);

		Object.entries(this.vrm.humanoid.humanBones).forEach(([boneName, boneData]) => {
		  console.log(`Processing bone: ${boneName}`);
		  if (boneData && boneData.node) {
			console.log(`Bone ${boneName} found`);
			this.animations[boneName] = {
			  position: boneData.node.position.clone(),
			  quaternion: boneData.node.quaternion.clone(),
			  originalPosition: boneData.node.position.clone(),
			  originalQuaternion: boneData.node.quaternion.clone()
			};
		  } else {
			console.warn(`Bone ${boneName} not found or doesn't have a node`);
		  }
		});
				
		console.log("Animations object:", this.animations);
	}
  }

  setUpAudio() {
    if (this.options.microphoneMediaStream) {
      const audioContext = THREE.AudioContext.getContext();
      const source = audioContext.createMediaStreamSource(this.options.microphoneMediaStream);
      this.analyser = audioContext.createAnalyser();
      source.connect(this.analyser);
    }
  }

  setHeadPose(position, quaternion) {
    this.inputs.hmd.position.copy(position);
    this.inputs.hmd.quaternion.copy(quaternion);
  }

  setLeftHandPose(position, quaternion, pointer, grip) {
    this.inputs.leftGamepad.position.copy(position);
    this.inputs.leftGamepad.quaternion.copy(quaternion);
    this.inputs.leftGamepad.pointer = pointer;
    this.inputs.leftGamepad.grip = grip;
  }

  setRightHandPose(position, quaternion, pointer, grip) {
    this.inputs.rightGamepad.position.copy(position);
    this.inputs.rightGamepad.quaternion.copy(quaternion);
    this.inputs.rightGamepad.pointer = pointer;
    this.inputs.rightGamepad.grip = grip;
  }

  setFloorHeight(floorHeight) {
    this.floorHeight = floorHeight;
  }

  update(delta) {
	this.updateAnimations(delta);
	this.updateVisemes();
	this.model.updateMatrixWorld(true);
  }
  
  
  updateAnimations() {
	console.log("updateAnimations called");
  
	if (!this.vrm) {
	  console.log("VRM model not available");
	  return;
	}
	console.log("VRM loaded:", this.vrm);
	console.log("VRM Humanoid:", this.vrm.humanoid);
  
	const { hmd, leftGamepad, rightGamepad } = this.inputs;
  
	// Update the hips position and rotation based on the HMD
	const hipsNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Hips);
	if (hipsNode) {
	  hipsNode.position.copy(hmd.position);
	  hipsNode.quaternion.copy(hmd.quaternion);
	}
  
	// Update the chest and spine rotations based on the HMD
	const chestNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Chest);
	const upperChestNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.UpperChest);
	const neckNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Neck);
	if (chestNode && upperChestNode && neckNode) {
	  const chestRotation = new THREE.Quaternion();
	  const upperChestRotation = new THREE.Quaternion();
	  const neckRotation = new THREE.Quaternion();
	  // Calculate the chest, upper chest, and neck rotations based on the HMD rotation
	  // ...
	  chestNode.quaternion.copy(chestRotation);
	  upperChestNode.quaternion.copy(upperChestRotation);
	  neckNode.quaternion.copy(neckRotation);
	}
  
	// Update the head rotation based on the HMD
	const headNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Head);
	if (headNode) {
	  headNode.quaternion.copy(hmd.quaternion);
	}
  
	// Update the shoulder positions based on the shoulder width
	const shoulderWidth = 0.3;
	const leftShoulderPosition = new THREE.Vector3(-shoulderWidth / 2, 0, 0);
	const rightShoulderPosition = new THREE.Vector3(shoulderWidth / 2, 0, 0);
	const leftShoulderNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftShoulder);
	const rightShoulderNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightShoulder);
	if (leftShoulderNode) {
	  leftShoulderNode.position.copy(leftShoulderPosition);
	}
	if (rightShoulderNode) {
	  rightShoulderNode.position.copy(rightShoulderPosition);
	}
  
	// Update the upper arm rotations based on the gamepads
	const leftUpperArmNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftUpperArm);
	const rightUpperArmNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightUpperArm);
	if (leftUpperArmNode) {
	  leftUpperArmNode.quaternion.copy(leftGamepad.quaternion);
	}
	if (rightUpperArmNode) {
	  rightUpperArmNode.quaternion.copy(rightGamepad.quaternion);
	}
  
	// Update the lower arm rotations based on the gamepads
	const leftLowerArmNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftLowerArm);
	const rightLowerArmNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightLowerArm);
	if (leftLowerArmNode) {
	  leftLowerArmNode.quaternion.copy(leftGamepad.quaternion);
	}
	if (rightLowerArmNode) {
	  rightLowerArmNode.quaternion.copy(rightGamepad.quaternion);
	}
  
  // Update the hand positions and rotations based on the gamepads
  const leftHandNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftHand);
  const rightHandNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightHand);

  if (leftHandNode) {
    const leftHandWorldPosition = new THREE.Vector3().copy(leftGamepad.position);
    const leftHandLocalPosition = leftHandNode.parent.worldToLocal(leftHandWorldPosition);
    leftHandNode.position.copy(leftHandLocalPosition);
    leftHandNode.quaternion.copy(leftGamepad.quaternion);
  }

  if (rightHandNode) {
    const rightHandWorldPosition = new THREE.Vector3().copy(rightGamepad.position);
    const rightHandLocalPosition = rightHandNode.parent.worldToLocal(rightHandWorldPosition);
    rightHandNode.position.copy(rightHandLocalPosition);
    rightHandNode.quaternion.copy(rightGamepad.quaternion);
  }
  
	// Update the finger rotations based on the gamepad inputs
	if (this.options.fingers) {
	  this.updateFingers('left', leftGamepad);
	  this.updateFingers('right', rightGamepad);
	}
  
	// Update the upper leg rotations based on the IK solver
	const leftUpperLegNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftUpperLeg);
	const rightUpperLegNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightUpperLeg);
	if (leftUpperLegNode && rightUpperLegNode) {
	  const leftUpperLegRotation = new THREE.Quaternion();
	  const rightUpperLegRotation = new THREE.Quaternion();
	  // Calculate the upper leg rotations based on the IK solver
	  // ...
	  leftUpperLegNode.quaternion.copy(leftUpperLegRotation);
	  rightUpperLegNode.quaternion.copy(rightUpperLegRotation);
	}
  
	// Update the lower leg rotations based on the IK solver
	const leftLowerLegNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftLowerLeg);
	const rightLowerLegNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightLowerLeg);
	if (leftLowerLegNode && rightLowerLegNode) {
	  const leftLowerLegRotation = new THREE.Quaternion();
	  const rightLowerLegRotation = new THREE.Quaternion();
	  // Calculate the lower leg rotations based on the IK solver
	  // ...
	  leftLowerLegNode.quaternion.copy(leftLowerLegRotation);
	  rightLowerLegNode.quaternion.copy(rightLowerLegRotation);
	}
  
	// Update the foot positions and rotations based on the IK solver
	const leftFootNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.LeftFoot);
	const rightFootNode = this.vrm.humanoid.getRawBoneNode(VRMHumanBoneName.RightFoot);
	if (leftFootNode && rightFootNode) {
	  const leftFootPosition = new THREE.Vector3();
	  const rightFootPosition = new THREE.Vector3();
	  const leftFootRotation = new THREE.Quaternion();
	  const rightFootRotation = new THREE.Quaternion();
	  // Calculate the foot positions and rotations based on the IK solver
	  // ...
	  leftFootNode.position.copy(leftFootPosition);
	  leftFootNode.quaternion.copy(leftFootRotation);
	  rightFootNode.position.copy(rightFootPosition);
	  rightFootNode.quaternion.copy(rightFootRotation);
	}
  }

  updateFingers(side, gamepad) {
    const fingerBones = [
      VRMHumanBoneName.ThumbProximal,
      VRMHumanBoneName.ThumbIntermediate,
      VRMHumanBoneName.ThumbDistal,
      VRMHumanBoneName.IndexProximal,
      VRMHumanBoneName.IndexIntermediate,
      VRMHumanBoneName.IndexDistal,
      VRMHumanBoneName.MiddleProximal,
      VRMHumanBoneName.MiddleIntermediate,
      VRMHumanBoneName.MiddleDistal,
      VRMHumanBoneName.RingProximal,
      VRMHumanBoneName.RingIntermediate,
      VRMHumanBoneName.RingDistal,
      VRMHumanBoneName.LittleProximal,
      VRMHumanBoneName.LittleIntermediate,
      VRMHumanBoneName.LittleDistal,
    ];

    fingerBones.forEach(boneName => {
      const bone = this.vrm.humanoid.getRawBoneNode(
        side === 'left' ? `Left${boneName}` : `Right${boneName}`,
      );

      if (!bone) return;

      const t = side === 'left' ? gamepad.pointer : gamepad.grip;
      const euler = new THREE.Euler(
        -t * Math.PI * 0.5,
        0,
        0,
        'YXZ',
      );
      bone.quaternion.setFromEuler(euler);
    });
  }

  updateVisemes() {
    if (!this.options.visemes || !this.analyser) return;

    const frequencies = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(frequencies);

    const volume = frequencies.reduce((sum, f) => sum + f, 0) / frequencies.length;

    if (this.options.muted) {
      this.microphoneVolume = 0;
    } else {
      this.microphoneVolume = volume / 255;
    }

    const blendShapes = {
      [VRMSchema.BlendShapePresetName.Aa]: 0,
      [VRMSchema.BlendShapePresetName.Ih]: 0,
      [VRMSchema.BlendShapePresetName.Ou]: 0,
      [VRMSchema.BlendShapePresetName.Ee]: 0,
      [VRMSchema.BlendShapePresetName.Oh]: 0,
    };

    if (this.microphoneVolume > 0.2) {
      const vowels = ['Aa', 'Ih', 'Ou', 'Ee', 'Oh'];
      const vowelIndex = Math.floor(Math.random() * vowels.length);
      const vowel = vowels[vowelIndex];
      blendShapes[VRMSchema.BlendShapePresetName[vowel]] = this.microphoneVolume;
    }

    Object.entries(blendShapes).forEach(([blendShape, value]) => {
      this.vrm.blendShapeProxy.setValue(blendShape, value);
    });
  }
}

export { ExokitAvatar };
