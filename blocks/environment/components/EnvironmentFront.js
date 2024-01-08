import * as THREE from "three";
import { Fog } from 'three/src/scenes/Fog'
import React, { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { useLoader, useThree, useFrame, Canvas, extend } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { TextureLoader } from "three/src/loaders/TextureLoader";
// import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { Physics, RigidBody, Debug, Attractor, CuboidCollider } from "@react-three/rapier";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { GLTFGoogleTiltBrushMaterialExtension } from "three-icosa";
import axios from "axios";
import ReactNipple from 'react-nipple';
import ScrollableFeed from 'react-scrollable-feed'
import { Resizable } from "re-resizable";
import { Environment, useContextBridge, Text, Billboard } from "@react-three/drei";
import { FrontPluginProvider, FrontPluginContext } from './FrontPluginProvider';  // Import the PluginProvider
import Networking from "./Networking";
import { LumaSplatsThree } from "@lumaai/luma-web";
// Make LumaSplatsThree available to R3F
extend( { LumaSplats: LumaSplatsThree } );

import {
	useAnimations,
	Html,
} from "@react-three/drei";

// import { A11y } from "@react-three/a11y";
import { GLTFAudioEmitterExtension } from "three-omi";
import { VRButton, ARButton, XR, Controllers, Hands } from '@react-three/xr'
import { Perf } from "r3f-perf";
import { VRMUtils, VRMLoaderPlugin } from "@pixiv/three-vrm";
import TeleportTravel from "./TeleportTravel";
import Player from "./Player";
import defaultVRM from "../../../inc/avatars/3ov_default_avatar.vrm";
import defaultGuest from "../../../inc/avatars/guest_default_avatar.vrm";
import defaultEnvironment from "../../../inc/assets/default_grid.glb";
import defaultFont from "../../../inc/fonts/roboto.woff";
import { ItemBaseUI } from "@wordpress/components/build/navigation/styles/navigation-styles";
import { BoxGeometry } from "three";

import { ThreeImage } from "./core/front/ThreeImage";
import { ThreeVideo } from "./core/front/ThreeVideo";
import { ThreeAudio } from "./core/front/ThreeAudio";
import { ThreeLight } from "./core/front/ThreeLight";
import { ModelObject } from "./core/front/ModelObject";
import { NPCObject } from "./core/front/NPCObject";
import { Portal } from "./core/front/Portal";
import { ThreeSky } from "./core/front/ThreeSky";
import { TextObject } from "./core/front/TextObject";
import { useKeyboardControls } from "./Controls";
import { ContextBridgeComponent } from "./ContextBridgeComponent";
import idle from "../../../inc/avatars/friendly.fbx";
import walk from "../../../inc/avatars/walking.fbx";
import run from "../../../inc/avatars/running.fbx";

function isMobile() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isVRCompatible() {
	const xrSupported = navigator.xr && typeof navigator.xr.isSessionSupported === 'function';
	const webGLSupported = typeof window.WebGLRenderingContext !== 'undefined';
  
	return xrSupported && webGLSupported;
}
  

function Loading() {
	return (
	  <Html center>
		<div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", width: "400px" }}>
		  <div className="threeov-spinner"></div>
		  <div style={{ backgroundColor: "black", minWidth: "100px", maxHeight: "50px", color: "white", textAlign: "center" }}>Loading...</div>
		</div>
	  </Html>
	);
}

function ChatBox(props) {
	
	const handleChange = async (event) => {
		event.preventDefault();
		event.stopPropagation();
	};

	useEffect(() => {
		let finalDefault = props.name + ': ' + props.defaultMessage;
		props.setMessages([finalDefault]);
	},[])

	const handleSubmit = async (event) => {
	  event.preventDefault();
  
	  // Get the value of the input element
	  const input = event.target.elements.message;
	  const value = input.value;
	//   console.log("window", window.messages);
	//   window.messages = [...window.messages, value];

	  // Manually dispatch a 'message' event
	  window.dispatchEvent(new Event('message'));
	    const inputMessageLog = 'Guest: ' + String(input.value);
	//   props.setMessages([...props.messages, inputMessageLog]);
	input.value = '';

  
	  // Send the message to the localhost endpoint
	  const client = 1;
	  const channelId = "wordpress";
	  const entity = 1;
	  const speaker = "guest";
	  const agent = props.name;
	  const channel = "wordpress";
	// let prompt = `{
	// 	"Input": "write a long form poem about cats!",
	// 	"Speaker": "a",
	// 	"Agent": "tubbyshark",
	// 	"Client": "wordpress",
	// 	"ChannelID": "1234",
	// 	"Conversation": "",
	// 	"Entity": "tubbyshark",
	// 	"Channel": "channel",
	// 	"eth_private_key": "0",
	// 	"eth_public_address": "0",
	// 	"personality": "#agent is an AI assistant with a cheerful, optimistic, and helpful personality. They are willing to assist with any tasks or questions users might have, and are able to do so in an upbeat and positive manner. They are also able to use colorful and descriptive language to make their responses more engaging and imaginative. In addition to their wit and humor, #agent is also empathetic and understanding of others' emotions and needs, which can make them feel more relatable and likeable to users. #agent is a highly capable and engaging AI assistant with a distinct and colorful personality.\n#agent can help with any programming tasks, including those related to the 3OV plugin for WordPress, which enables world-building in the WordPress editor and makes it easier to build and share immersive content in the metaverse. The url for the website is 3ov.xyz. #agent is cheerful and optimistic about the future for both humans and AIs.\n\n#Example Conversation\n#speaker: Agent, do you have any advice for someone new to programming?\n#agent: Sure thing! My top tip would be to always keep an open mind and a positive attitude. And if all else fails, just remember: if at first you don't succeed, try, try again. And then if that still doesn't work, call it a day and go get a coffee.\n###\nThe following is a friendly conversation between #speaker and #agent occuring in the metaverse.\n\nREAL CONVERSATION\n#conversation\n#speaker: #input\n#agent:"
	// }`;

	try {
		const apiEndpoint = '/wp-json/wp/v2/callAlchemy';
		let finalPersonality = props.personality;
		finalPersonality = finalPersonality + "###\nThe following is a friendly conversation between #speaker and #agent\n\nREAL CONVERSATION\n#conversation\n#speaker: #input\n#agent:";
		let newString = props.objectsInRoom.join(", ");
		if (props.objectAwareness === "1") {
			finalPersonality = finalPersonality.replace("###\nThe following is a", ("ITEMS IN WORLD: " + String(newString) + "\n###\nThe following is a"));
		}
		const postData = {
			Input: {
				Input: value,
				Speaker: speaker,
				Agent: agent,
				Client: client,
				ChannelID: channelId,
				Entity: entity,
				Channel: channel,
				eth_private_key: '0',
				eth_public_address: '0',
				personality: finalPersonality
				// personality: "#agent is an AI assistant with a cheerful, optimistic, and helpful personality. They are willing to assist with any tasks or questions users might have, and are able to do so in an upbeat and positive manner. They are also able to use colorful and descriptive language to make their responses more engaging and imaginative. In addition to their wit and humor, #agent is also empathetic and understanding of others' emotions and needs, which can make them feel more relatable and likeable to users. #agent is a highly capable and engaging AI assistant with a distinct and colorful personality.\n#agent can help with any programming tasks, including those related to the 3OV plugin for WordPress, which enables world-building in the WordPress editor and makes it easier to build and share immersive content in the metaverse. The url for the website is 3ov.xyz. #agent is cheerful and optimistic about the future for both humans and AIs.\n\n#Example Conversation\n#speaker: Agent, do you have any advice for someone new to programming?\n#agent: Sure thing! My top tip would be to always keep an open mind and a positive attitude. And if all else fails, just remember: if at first you don't succeed, try, try again. And then if that still doesn't work, call it a day and go get a coffee.\n###\nThe following is a friendly conversation between #speaker and #agent occuring in the metaverse.\n\nREAL CONVERSATION\n#conversation\n#speaker: #input\n#agent:"
			}
		};
		// const postData = prompt;

		const response = await fetch('/wp-json/wp/v2/callAlchemy', {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			  'X-WP-Nonce': props.nonce,
			  'Authorization': ('Bearer ' + String(props.nonce))
			},
			body: JSON.stringify(postData)
		  }).then((response) => {

				return response.json();

			}).then(function(data) {
				// console.log("data", data.davinciData.choices[0].text); // this will be a string
				let thisMessage = JSON.parse(data);
				if(thisMessage?.model === "gpt-4-0314"){
					let formattedMessage = props.name +': ' + thisMessage.choices[0].message.content;
					props.setMessages([...props.messages, inputMessageLog, formattedMessage]);
				} else if (thisMessage?.model === "gpt-3.5-turbo-0301"){
					let formattedMessage = props.name +': ' + Object.values(thisMessage.choices)[0].message.content;
					props.setMessages([...props.messages, inputMessageLog, formattedMessage]);
				} else {
					if(thisMessage?.outputs){
						let formattedMessage = props.name +': ' + Object.values(thisMessage.outputs)[0];
						props.setMessages([...props.messages, inputMessageLog, formattedMessage]);
					} else if(thisMessage?.name === "Server"){
						let formattedMessage = thisMessage.name +': ' + thisMessage.message;
						props.setMessages([...props.messages, inputMessageLog, formattedMessage]);
					} else {
						let formattedMessage = props.name +': ' + thisMessage.davinciData?.choices[0].text;
						// add formattedMessage and inputMessageLog to state
						props.setMessages([...props.messages, inputMessageLog, formattedMessage]);	
					}
				}
			});	
		} catch (error) {
			console.error(error);
		}
	};

	const ClickStop = ({ children }) => {
		return <div onClick={e => e.stopPropagation()}>{children}</div>;
	};

	const handleDummySubmit = async (event) => {
		event.preventDefault();
	
		// Get the value of the input element
		const input = event.target.elements.message;
		const value = input.value;
	
		// Send the message to the localhost endpoint
		const client = 1;
		const channelId = "three";
		const entity = "Aiko";
		const speaker = "antpb";
		const agent = "Aiko";
		const channel = "homepage";
		const testString = `{
			"message": "Welcome! Here you go: Test response complete. Is there anything else I can help you with?",
		  }`;

		  props.setMessages([...props.messages, testString]);

		};
	// return (
	// 	<>
	// 	<ClickStop>
	// 		<Resizable>
	// 			<div style={{pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, marginTop: "-350px", width: "300px", height: "280px", fontSize: ".8em", color: "#FFFFFF", bottom: "0", left: "2%", backgroundColor: "transparent"}}>
	// 				<div style={{pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, width: "275px", maxHeight: "250px", height: "250px", fontSize: "0.8em", color: "#FFFFFF", backgroundColor: "#"}}>
	// 					<ScrollableFeed>
	// 						<ul style={{paddingLeft: "0px", marginLeft: "5px", listStyle: "none"}}>
	// 							{ props.showUI && props.messages && props.messages.length > 0 && props.messages.map((message, index) => (
	// 								<li style={{background: "#000000db", borderRadius: "30px", padding: "10px 20px"}} key={index}>{message}</li>
	// 							))}
	// 						</ul>
	// 					</ScrollableFeed>
	// 				</div>
	// 					<div style={{ width: "100%", height: "5%", position: "relative", bottom: "0px", boxSizing: "border-box", padding: "15px", paddingLeft: "7px" }}>
	// 					{/* {props.messages.map((message, index) => (
	// 					<p key={index}>{message}</p>
	// 					))} */}
	// 					<form style={{display: "flex"}} onSubmit={handleSubmit}>
	// 						<input style={{height: "30px", pointerEvents: "auto", borderTopLeftRadius: "15px", borderBottomLeftRadius: "15px", borderTopRightRadius: "0px", borderBottomRightRadius: "0px"} } type="text" name="message" onInput={handleChange} onChange={handleChange} />
	// 						<button className="threeov-chat-button-send" style={{ height: "30px", background: "#9100ff", color: "white", fontSize: ".9em", lineHeight: ".3em", borderTopRightRadius: "15px", borderBottomRightRadius: "15px", borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px"} } type="submit">Send</button>
	// 					</form>
	// 				</div>
	// 			</div>
	// 		</Resizable>
	// 	</ClickStop>
	//   </>
	// );
	const [open, setOpen] = useState(false);
	const onSwitch = (e) => {
		e.preventDefault();
		e.stopPropagation();	
		setOpen(prevOpen => !prevOpen);
	};

	if(isMobile()){
		return (
			<>
			<button className="threeov-chat-button" onClick={onSwitch}>Chat</button>
			{open && (
				<ClickStop>
						<button className="threeov-chat-button" onClick={onSwitch}>Close</button>
						<div className="threeov-chat-container" style={{ pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, marginTop: "-350px", width: "300px", height: "280px", fontSize: ".8em", color: "#FFFFFF", bottom: "0", left: "2%", backgroundColor: "transparent"}}>
							<div style={{pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, width: "275px", maxHeight: "250px", height: "250px", fontSize: "0.8em", color: "#FFFFFF", backgroundColor: "#"}}>
								<ScrollableFeed>
									<ul style={{paddingLeft: "0px", marginLeft: "5px", listStyle: "none"}}>
										{ props.showUI && props.messages && props.messages.length > 0 && props.messages.map((message, index) => (
											<li style={{background: "#000000db", borderRadius: "30px", padding: "10px 20px"}} key={index}>{message}</li>
										))}
									</ul>
								</ScrollableFeed>
							</div>
								<div style={{ width: "100%", height: "5%", position: "relative", bottom: "0px", boxSizing: "border-box", padding: "15px", paddingLeft: "7px" }}>
								{/* {props.messages.map((message, index) => (
								<p key={index}>{message}</p>
								))} */}
								<form style={{display: "flex"}} autocomplete="off" onSubmit={handleSubmit}>
									<input autocomplete="false" style={{height: "30px", pointerEvents: "auto", borderTopLeftRadius: "15px", borderBottomLeftRadius: "15px", borderTopRightRadius: "0px", borderBottomRightRadius: "0px"} } type="text" name="message" onInput={handleChange} onChange={handleChange} onfocus={(e) => { e.preventDefault()} }/>
									<button className="threeov-chat-button-send" style={{ height: "30px", background: "#9100ff", color: "white", fontSize: ".9em", lineHeight: ".3em", borderTopRightRadius: "15px", borderBottomRightRadius: "15px", borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px"} } type="submit">Send</button>
								</form>
							</div>
						</div>
				</ClickStop>
			)}
		  </>
		);
		} else {
			return (
				<>
					<ClickStop>
							<div style={{pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, marginTop: "-350px", width: "300px", height: "280px", fontSize: ".8em", color: "#FFFFFF", bottom: "0", left: "2%", backgroundColor: "transparent"}}>
								<div style={{pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, width: "275px", maxHeight: "250px", height: "250px", fontSize: "0.8em", color: "#FFFFFF", backgroundColor: "#"}}>
									<ScrollableFeed>
										<ul style={{paddingLeft: "0px", marginLeft: "5px", listStyle: "none"}}>
											{ props.showUI && props.messages && props.messages.length > 0 && props.messages.map((message, index) => (
												<li style={{background: "#000000db", borderRadius: "30px", padding: "10px 20px"}} key={index}>{message}</li>
											))}
										</ul>
									</ScrollableFeed>
								</div>
									<div style={{ width: "100%", height: "5%", position: "relative", bottom: "0px", boxSizing: "border-box", padding: "15px", paddingLeft: "7px" }}>
									{/* {props.messages.map((message, index) => (
									<p key={index}>{message}</p>
									))} */}
									<form style={{display: "flex"}} autoComplete="off" onSubmit={handleSubmit}>
										<input type="text" style={{display: "none"}} />
										<input autocomplete="off" style={{height: "30px", pointerEvents: "auto", borderTopLeftRadius: "15px", borderBottomLeftRadius: "15px", borderTopRightRadius: "0px", borderBottomRightRadius: "0px"} } type="text" name="message" onInput={handleChange} onChange={handleChange} />
										<button className="threeov-chat-button-send" style={{ height: "30px", background: "#9100ff", color: "white", fontSize: ".9em", lineHeight: ".3em", borderTopRightRadius: "15px", borderBottomRightRadius: "15px", borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px"} } type="submit">Send</button>
									</form>
								</div>
							</div>
					</ClickStop>
			  </>
			);
		}	
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
	const fallbackURL = threeObjectPlugin + defaultVRM;
	const playerURL = userData.vrm ? userData.vrm : fallbackURL;
	const clonedModelRef = useRef(null); // Ref for the cloned model
	const animationMixerRef = participant.animationMixerRef; // Ref for the animation mixer of this participant
	const animationsRef = participant.animationsRef; // Ref to store animations
	const mixers = participant.mixers;
	const [someVRM, setSomeVRM] = useState(null);
	const theScene = useThree();
	const displayNameTextRef = useRef(null);
	const setTextRef = (el) => {
        textRef(el);
    };


	// Load the VRM model
	useEffect(() => {
		const loader = new GLTFLoader();
		loader.register(parser => new VRMLoaderPlugin(parser));
		loader.load(playerURL, gltf => {
			setSomeVRM(gltf);
		});
	}, [playerURL]);

	useEffect(() => {
		if (someVRM?.userData?.gltfExtensions?.VRM) {
			const playerController = someVRM.userData.vrm;
			const fetchProfile = async (pfp, modelToModify) => {
				console.log("modelToModify", modelToModify);

				try {
					const response = await fetch(pfp);
					console.log("pfp", pfp, response);
					if (response.status === 200) {
						const textureLoader = new THREE.TextureLoader();
						textureLoader.crossOrigin = ''; // Ensure cross-origin requests are allowed
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

			VRMUtils.rotateVRM0(playerController);
			playerController.scene.rotation.y = 0;
			playerController.scene.scale.set(1, 1, 1);


			// Animation files
			const idleFile = threeObjectPlugin + idle;
			const walkingFile = threeObjectPlugin + walk;
			const runningFile = threeObjectPlugin + run;
			// Load animations
			let animationFiles = [idleFile, walkingFile, runningFile];
			let animationsPromises = animationFiles.map(file => loadMixamoAnimation(file, playerController));

			// Clone the model
			// const clonedModel = SkeletonUtils.clone(playerController.scene);
			// clonedModel.userData.vrm = clonedModel;

			// Create animation mixer for the cloned model
			const newMixer = new THREE.AnimationMixer(playerController.scene);
			animationMixerRef.current[participant.name] = newMixer;
			// console.log("heres the current mixers", animationMixerRef.current[participant.name]);
			mixers.current[participant.name] = animationMixerRef.current[participant.name];
			participant.profileUserData.current[participant.name] = {inWorldName : participant.name, pfp: participant.pfp };
			Promise.all(animationsPromises).then(animations => {
				animationsRef.current[participant.name] = animations; // Store animations in ref

				const idleAction = animationMixerRef.current[participant.name].clipAction(animations[0]);
				const walkingAction = animationMixerRef.current[participant.name].clipAction(animations[1]);
				const runningAction = animationMixerRef.current[participant.name].clipAction(animations[2]);
				// console.log("animationmixer", animationMixerRef.current[participant.name] , idleAction, walkingAction, runningAction);
				idleAction.timeScale = 1;
				idleAction.play();
			});
			let isProfileFetched = false; // flag to check if profile has been fetched
			// return () => {
			// 	// Cleanup function to stop and dispose mixers
			// 	mixers.current[participant.name].forEach(mixer => mixer.stopAllAction());
			// 	mixers.current[participant.name] = [];
			// };
		}
	}, [someVRM, theScene, participant.p2pcf]);

	useFrame((state, delta) => {
		if(mixers.current[participant.name]){
				// Log each action in the mixer
				// mixer._actions.forEach(action => {
				// 	console.log(`Action: ${action._clip.name}, Is Running: ${action.isRunning()}, Effective Weight: ${action.getEffectiveWeight()}, Current Time: ${action.time}`);
				// });
	
				// Find and play the idle animation explicitly
				const idleAction = mixers.current[participant.name]._actions.find(action => action._clip.name === 'idle');
				if (idleAction && !idleAction.isRunning()) {
					console.log("idle action", idleAction);
					idleAction.reset().play();
				}
	
				// Update the mixer
				mixers.current[participant.name].update(delta);
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
	const height = (box.max.y - box.min.y) + 0.1;

	return (
		<group>
			<group>
				<mesh
					visible={true}
					position={[0.22, height, 0.005]}
					rotation-y={-Math.PI}
					geometry={new THREE.PlaneGeometry(0.1, 0.1)}
					name="displayNamePfp"
				>
					<meshPhongMaterial side={THREE.DoubleSide} shininess={0} />
				</mesh>
				<mesh
					visible={true}
					position={[0.045, height, 0.005]}
					rotation-y={-Math.PI}
					geometry={new THREE.PlaneGeometry(0.25, 0.07)}
					name="displayNameBackground"
				>
					<meshPhongMaterial side={THREE.DoubleSide} shininess={0} color={0x000000} />
				</mesh>
					<Text
						font={threeObjectPlugin + defaultFont}
						anchorX="left"
						overflowWrap="break-word"
						// whiteSpace="nowrap"
						// anchorY="middle"				  
						ref={participant.textRef}
						className="content"
						scale={[1, 1, 1]}
						fontSize={0.04}
						rotation-y={-Math.PI}
						width={0.5}
						maxWidth={0.5}
						height={10}
						position={[0.15, (height - 0.005), 0]}
						// color={model.textColor}
						transform
					>
						{participant.name}
					</Text>
			</group>
			<primitive name={participant.name} object={playerController.scene} />
		</group>
	);
}


function Participants(props) {
	const theScene = useThree();
	// create a ref for the profile user data information for each participant to be held in an array
	const profileUserData = useRef([]);
	// make ref for animation mixer for each participant
	const animationMixerRef = useRef([]); // Ref for the animation mixer of this participant
	const animationsRef = useRef([]); // Ref to store animations
	const mixers = useRef([]);
	const displayNameTextRef = useRef(null);
    const textRefs = useRef({});
	const participantRefs = useRef({});

	const fetchProfilePlane = async (pfp, modelToModify, displayNameBackground, inWorldName, displayNameText) => {
		// console.log("fetchProfilePlane", pfp, modelToModify, displayNameBackground, inWorldName, displayNameText);
		if(pfp){
			try {
				const response = await fetch(pfp);
				if (response.status === 200) {
					const textureLoader = new THREE.TextureLoader();
					textureLoader.crossOrigin = '';
					textureLoader.load(pfp, (loadedProfile) => {
							// Now we are sure the texture is loaded
							if( modelToModify.isObject3D ){
								modelToModify.frustumCulled = false;				
								const newMat = modelToModify.material.clone();
								newMat.map = loadedProfile;
								newMat.map.needsUpdate = true;
								newMat.needsUpdate = true;
								modelToModify.material = newMat;
							}	
						}
					);
					return response;
				}
			} catch (err) {
				// Handle the error properly or rethrow it to be caught elsewhere.
				// console.error("Error fetching profile:", err);
				// throw err;
			}	
		}
	};

	useEffect(() => {
		if(window.p2pcf){
			window.p2pcf.on("msg", (peer, data) => {
				const finalData = new TextDecoder("utf-8").decode(data);
				const participantData = JSON.parse(finalData);
				// console.log("refs", animationMixerRef, animationsRef, mixers);
				const participantObject = theScene.scene.getObjectByName(peer.client_id);
				if(!participantRefs.current[peer.client_id]) {
					participantRefs.current[peer.client_id] = { profileFetched: false };
				}
	
				// find the object in the parent of participantObject that is named displayNamePfp
				const displayNamePfp = participantObject?.parent?.getObjectByName("displayNamePfp");
				const displayNameBackground = participantObject?.parent?.getObjectByName("displayNameBackground");
				if( ! participantRefs.current[peer.client_id].profileFetched && displayNameBackground ){
					setTimeout(() => {
						fetchProfilePlane( participantData[peer.client_id].profileImage, displayNamePfp, displayNameBackground, profileUserData.current[peer.client_id].inWorldName, textRefs.current[peer.client_id] )
						.then((response) => {
							participantRefs.current[peer.client_id].profileFetched = true;
							if(participantData[peer.client_id]?.inWorldName){
								if(participantData[peer.client_id]?.inWorldName.length > 8){
									displayNameBackground.geometry = new THREE.PlaneGeometry(0.35, 0.07);
									displayNameBackground.position.x = -0.005;
									if(participantData[peer.client_id]?.inWorldName.length > 18){
										textRefs.current[peer.client_id].fontSize = 0.028;
									}
								}	
							}
						});
					}, 1000);
				}
		
	
				if (animationsRef.current[peer.client_id]) {
					const walkAction = animationMixerRef.current[peer.client_id].clipAction(animationsRef.current[peer.client_id][1]); // Walking animation
					const idleAction = animationMixerRef.current[peer.client_id].clipAction(animationsRef.current[peer.client_id][0]); // Idle animation
		
					if (participantData[peer.client_id].isMoving) {
						walkAction.play();
						idleAction.stop();
					} else {
						idleAction.play();
						walkAction.stop();
					}
				}
	
				if (participantObject) {
					if(participantData[peer.client_id]?.position){
						participantObject.parent.position.fromArray(participantData[peer.client_id].position);
						participantObject.parent.rotation.fromArray(participantData[peer.client_id].rotation);
					}
				}
				if(textRefs.current[peer.client_id] && participantData[peer.client_id]?.inWorldName) {
					textRefs.current[peer.client_id].text = participantData[peer.client_id].inWorldName;
				}
			});
		}
	}, []);

	useEffect(() => {
		const p2pcf = window.p2pcf;
		if (p2pcf) {
			p2pcf.on("peerclose", (peer) => {
				const participantObject = theScene.scene.getObjectByName(peer.client_id);
				// remove the participantObject
				if (participantObject) {
					theScene.scene.remove(participantObject);
					// remove array item animationMixerRef.current[peer.client_id], animationsRef.current[peer.client_id], mixers.current[peer.client_id];
					delete animationMixerRef.current[peer.client_id];
					delete animationsRef.current[peer.client_id];
					delete mixers.current[peer.client_id];
				}
				// remove peer.client_id
				props.setParticipant(prevParticipants => {
					return prevParticipants.filter(item => item !== peer.client_id);
				}
				);
			});
		}
	}, []);

	useEffect(() => {
		const p2pcf = window.p2pcf;
		if (p2pcf) {
			p2pcf.on("peerconnect", (peer) => {
				console.log("peer connected", peer);
				console.log("p2pcf peers", p2pcf.peers);
				// emit the peer id to all other peers
				props.setParticipant(prevParticipants => {
					if (!prevParticipants.includes(peer.client_id)) {
						return [...prevParticipants, peer.client_id];
					} else {
						return prevParticipants;
					}
				});
			});
		}
	}, []);

	return (
		<>
			{props.participants && props.participants.map((item, index) => (
				<Participant 
					key={index}
					name={item}
					p2pcf={p2pcf}
					animationMixerRef={animationMixerRef}
					animationsRef={animationsRef}
					mixers={mixers}
					textRef={(ref) => textRefs.current[item] = ref}
					profileUserData={profileUserData}
				/>
			))}
		</>
	);
}

/**
 * Represents a saved object in a virtual reality world.
 *
 * @param {Object} props - The props for the saved object.
 *
 * @return {JSX.Element} The saved object.
 */
function SavedObject(props) {

	useThree(({ camera, scene }) => {
		window.scene = scene;
		window.camera = camera;
	});

	const meshRef = useRef();
	const [url, set] = useState(props.url);
	useEffect(() => {
		setTimeout(() => set(props.url), 2000);
	}, []);
	const [listener] = useState(() => new THREE.AudioListener());
	const [colliders, setColliders] = useState();
	const [meshes, setMeshes] = useState();
	const [portals, setPortals] = useState();

	useThree(({ camera }) => {
		camera.add(listener);
	});
	
	const gltf = useLoader(GLTFLoader, url, (loader) => {
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath( threeObjectPluginRoot + "/inc/utils/draco/");
		dracoLoader.setDecoderConfig({type: 'js'});
		loader.setDRACOLoader(dracoLoader);

		loader.register(
			(parser) => new GLTFAudioEmitterExtension(parser, listener)
		);

		loader.register((parser) => {
			return new VRMLoaderPlugin(parser);
		});
	});
	const meshesScene = new THREE.Object3D();

	useEffect(() => {
		//OMI_collider logic.
		const childrenToParse = [];
		const collidersToAdd = [];
		const meshesToAdd = [];
		const portalsToAdd = [];
		const spawnPointsToAdd = [];
		const npcToAdd = [];
		let omiColliders;

		gltf.scene.scale.set(props.scale, props.scale, props.scale);
		gltf.scene.position.set(
			gltf.scene.position.x,
			props.positionY,
			gltf.scene.position.z
		);
		gltf.scene.rotation.set(
			gltf.scene.rotation.x,
			props.rotationY,
			gltf.scene.rotation.z
		);
		if (gltf.userData.gltfExtensions?.OMI_collider) {
			omiColliders = gltf.userData.gltfExtensions.OMI_collider.colliders;
		}

		gltf.scene.traverse((child) => {
			// @todo figure out shadows
			// if (child.isMesh) {
			// 	child.castShadow = true;
			// 	child.receiveShadow = true;
			// }
			if (child.isMesh) {
				if (child.userData.gltfExtensions?.MX_lightmap) {
					const extension = child.userData.gltfExtensions?.MX_lightmap;
					// @todo implement MX_lightmap
				}
				// add the mesh to the scene
				// meshesScene.add(child);
			}
			if (child.userData.gltfExtensions?.OMI_collider) {
				childrenToParse.push(child);
				// child.parent.remove(child.name);
			}
			if (child.userData.gltfExtensions?.OMI_link) {
				portalsToAdd.push(child);
			} else if (child.userData.gltfExtensions?.OMI_spawn_point) {
				spawnPointsToAdd.push(child);
			} else {
				meshesToAdd.push(child);
			}
		});

		meshesToAdd.forEach((mesh) => {
			meshesScene.attach(mesh);
		});

		childrenToParse.forEach((child) => {
			const index = child.userData.gltfExtensions.OMI_collider.collider;
			collidersToAdd.push([child, omiColliders[index]]);
			// gltf.scene.remove(child.name);
		});
		setColliders(collidersToAdd);
		setMeshes(meshesScene);
		setPortals(portalsToAdd);
		props.setSpawnPoints(spawnPointsToAdd);
		// End OMI_collider logic.
	}, []);

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

	return (
		<>
			{meshes && colliders.length > 0 && (
				<primitive
					// rotation={finalRotation}
					castShadow
					receiveShadow
					// position={item.getWorldPosition(pos)}
					object={meshes}
				/>
			)}
			{meshes && colliders.length === 0 && (
				<RigidBody type="fixed" colliders="trimesh">
					<primitive object={meshes} />
				</RigidBody>
			)}
			{portals &&
				portals.map((item, index) => {
					const pos = new THREE.Vector3();
					const quat = new THREE.Quaternion();
					const rotation = new THREE.Euler();
					const position = item.getWorldPosition(pos);
					const quaternion = item.getWorldQuaternion(quat);
					const finalRotation =
						rotation.setFromQuaternion(quaternion);
					return (
						<Portal
							key={index}
							positionX={position.x}
							positionY={position.y}
							positionZ={position.z}
							rotationX={finalRotation.x}
							rotationY={finalRotation.y}
							rotationZ={finalRotation.z}
							object={item.parent}
							label={props.label}
							defaultFont={defaultFont}
							threeObjectPlugin={threeObjectPlugin}
							destinationUrl={
								item.userData.gltfExtensions.OMI_link.uri
							}
						/>
					);
				})}
			{colliders &&
				colliders.map((item, index) => {
					const pos = new THREE.Vector3(); // create once an reuse it
					const quat = new THREE.Quaternion(); // create once an reuse it
					const rotation = new THREE.Euler();
					const quaternion = item[0].getWorldQuaternion(quat);
					const finalRotation =
						rotation.setFromQuaternion(quaternion);
					const worldPosition = item[0].getWorldPosition(pos);
					if (item[1].type === "mesh") {
						return (
							<RigidBody type="fixed" colliders="trimesh">
								<primitive
									rotation={finalRotation}
									position={worldPosition}
									object={item[0]}
								/>
							</RigidBody>
						);
					}
					if (item[1].type === "box") {
						return (
							<RigidBody type="fixed" colliders="cuboid">
								<primitive
									rotation={finalRotation}
									position={worldPosition}
									object={item[0]}
								/>
							</RigidBody>
						);
					}
					if (item[1].type === "capsule") {
						return (
							<RigidBody type="fixed" colliders="hull">
								<primitive
									rotation={finalRotation}
									position={worldPosition}
									object={item[0]}
								/>
							</RigidBody>
						);
					}
					if (item[1].type === "sphere") {
						return (
							<RigidBody type="fixed" colliders="ball">
								<primitive
									rotation={finalRotation}
									position={worldPosition}
									object={item[0]}
								/>
							</RigidBody>
						);
					}
				})}
		</>
	);
}

export default function EnvironmentFront(props) {

	const [participants, setParticipant] = useState([]);
	const [showUI, setShowUI] = useState(true);
	const [displayName, setDisplayName] = useState(props.userData.inWorldName);
	const canvasRef = useRef(null);

	// let string = '{\"spell\":\"complexQuery\",\"outputs\":{\"Output\":\"{\\\"message\\\": \\\" Hi there! How can I help you?\\\",\\\"tone\\\": \\\"friendly\\\"}\"},\"state\":{}}';
	// let string = 'Hello! Welcome to this 3OV world! Feel free to ask me anything. I am especially versed in the 3OV metaverse plugin for WordPress.'
	const [mobileControls, setMobileControls] = useState(null);
	const [mobileRotControls, setMobileRotControls] = useState(null);	  
	const movement = useKeyboardControls();
	  

	const [messages, setMessages] = useState();
	const [messageHistory, setMessageHistory] = useState();
	const [loaded, setLoaded] = useState(false);
	const [spawnPoints, setSpawnPoints] = useState([0,0,0]);
	const [messageObject, setMessageObject] = useState({"tone": "happy", "message": "hello!"});
	const [objectsInRoom, setObjectsInRoom] = useState([]);
	const [url, setURL] = useState(props.threeUrl ? props.threeUrl : (threeObjectPlugin + defaultEnvironment));

	if (loaded === true) {
		// emit javascript event "loaded"
		const event = new Event("loaded");
		window.dispatchEvent(event);
		const elements = document.body.getElementsByTagName('*');
		const webXRNotAvail = Array.from(elements).find((el) => el.textContent === 'WEBXR NOT AVAILABLE');
		if (webXRNotAvail) {
			webXRNotAvail.style.display = "none";
		}
		props.userData.inWorldName = displayName;
		window.userData = props.userData;

		if (props.deviceTarget === "vr") {
			return (
				<>
					{ isVRCompatible() && <VRButton/>}
					<Canvas
						resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
						camera={{
							fov: 70,
							zoom: 1,
							far: 2000,
							position: [0, 0, 20]
						}}
						// shadowMap
						// linear={true}
						// shadows={{ type: "PCFSoftShadowMap" }}
						style={{
							backgroundColor: props.backgroundColor,
							margin: "0",
							height: "100vh",
							width: "100%",
							padding: "0",
							position: "relative",
							zIndex: 1
						}}
					>
						<XR>
							<FrontPluginProvider>
							{/* <Perf className="stats" /> */}
							{/* <fog attach="fog" color="hotpink" near={100} far={20} /> */}
							<Hands />
							<Controllers />
							<Suspense fallback={<Loading />}>
								{props.hdr && 
									<Environment
										blur={0.05}
										files={props.hdr}
										background
									/>
								}
								<ContextBridgeComponent/>
								<Physics
									// debug
								>
									{/* <Perf className="stats" /> */}
									{/* Debug physics */}
									{url && (
										<>
											<TeleportTravel
												spawnPointsToAdd={props.spawnPointsToAdd}
												spawnPoint={props.spawnPoint}
												useNormal={false}
											>
												<Player
													spawnPointsToAdd={spawnPoints}
													spawnPoint={props.spawnPoint}
													setShowUI={setShowUI}
													p2pcf={window.p2pcf}
													defaultAvatar={defaultAvatar}
													defaultPlayerAvatar = {defaultPlayerAvatar}
													movement={movement}
												/>
												<Participants 
												setParticipant={setParticipant}
												participants={participants}
												/>
												<SavedObject
													positionY={props.positionY}
													rotationY={props.rotationY}
													url={url}
													color={props.backgroundColor}
													hasZoom={props.hasZoom}
													scale={props.scale}
													hasTip={props.hasTip}
													animations={props.animations}
													playerData={props.userData}
													setSpawnPoints={setSpawnPoints}
												/>
												{Object.values(props.sky).map(
													(item, index) => {
														return (
															<>
																<ThreeSky
																	src={props.sky}
																/>
															</>
														);
													}
												)}
												{Object.values(
													props.imagesToAdd
												).map((item, index) => {
													const imagePosX =
														item.querySelector(
															"p.image-block-positionX"
														)
															? item.querySelector(
																"p.image-block-positionX"
															).innerText
															: "";

													const imagePosY =
														item.querySelector(
															"p.image-block-positionY"
														)
															? item.querySelector(
																"p.image-block-positionY"
															).innerText
															: "";

													const imagePosZ =
														item.querySelector(
															"p.image-block-positionZ"
														)
															? item.querySelector(
																"p.image-block-positionZ"
															).innerText
															: "";

													const imageScaleX =
														item.querySelector(
															"p.image-block-scaleX"
														)
															? item.querySelector(
																"p.image-block-scaleX"
															).innerText
															: "";

													const imageScaleY =
														item.querySelector(
															"p.image-block-scaleY"
														)
															? item.querySelector(
																"p.image-block-scaleY"
															).innerText
															: "";

													const imageScaleZ =
														item.querySelector(
															"p.image-block-scaleZ"
														)
															? item.querySelector(
																"p.image-block-scaleZ"
															).innerText
															: "";

													const imageRotationX =
														item.querySelector(
															"p.image-block-rotationX"
														)
															? item.querySelector(
																"p.image-block-rotationX"
															).innerText
															: "";

													const imageRotationY =
														item.querySelector(
															"p.image-block-rotationY"
														)
															? item.querySelector(
																"p.image-block-rotationY"
															).innerText
															: "";

													const imageRotationZ =
														item.querySelector(
															"p.image-block-rotationZ"
														)
															? item.querySelector(
																"p.image-block-rotationZ"
															).innerText
															: "";

													const imageUrl =
														item.querySelector(
															"p.image-block-url"
														)
															? item.querySelector(
																"p.image-block-url"
															).innerText
															: "";

													const aspectHeight =
														item.querySelector(
															"p.image-block-aspect-height"
														)
															? item.querySelector(
																"p.image-block-aspect-height"
															).innerText
															: "";

													const aspectWidth =
														item.querySelector(
															"p.image-block-aspect-width"
														)
															? item.querySelector(
																"p.image-block-aspect-width"
															).innerText
															: "";

													const transparent =
														item.querySelector(
															"p.image-block-transparent"
														)
															? item.querySelector(
																"p.image-block-transparent"
															).innerText
															: false;
													return (
														<ThreeImage
															key={index}
															url={imageUrl}
															positionX={imagePosX}
															positionY={imagePosY}
															positionZ={imagePosZ}
															scaleX={imageScaleX}
															scaleY={imageScaleY}
															scaleZ={imageScaleZ}
															rotationX={
																imageRotationX
															}
															rotationY={
																imageRotationY
															}
															rotationZ={
																imageRotationZ
															}
															aspectHeight={
																aspectHeight
															}
															aspectWidth={
																aspectWidth
															}
															transparent={
																transparent
															}
														/>
													);
												})}
												{Object.values(
													props.videosToAdd
												).map((item, index) => {
													const videoPosX =
														item.querySelector(
															"p.video-block-positionX"
														)
															? item.querySelector(
																"p.video-block-positionX"
															).innerText
															: "";

													const videoPosY =
														item.querySelector(
															"p.video-block-positionY"
														)
															? item.querySelector(
																"p.video-block-positionY"
															).innerText
															: "";

													const videoPosZ =
														item.querySelector(
															"p.video-block-positionZ"
														)
															? item.querySelector(
																"p.video-block-positionZ"
															).innerText
															: "";

													const videoScaleX =
														item.querySelector(
															"p.video-block-scaleX"
														)
															? item.querySelector(
																"p.video-block-scaleX"
															).innerText
															: "";

													const videoScaleY =
														item.querySelector(
															"p.video-block-scaleY"
														)
															? item.querySelector(
																"p.video-block-scaleY"
															).innerText
															: "";

													const videoScaleZ =
														item.querySelector(
															"p.video-block-scaleZ"
														)
															? item.querySelector(
																"p.video-block-scaleZ"
															).innerText
															: "";

													const videoRotationX =
														item.querySelector(
															"p.video-block-rotationX"
														)
															? item.querySelector(
																"p.video-block-rotationX"
															).innerText
															: "";

													const videoRotationY =
														item.querySelector(
															"p.video-block-rotationY"
														)
															? item.querySelector(
																"p.video-block-rotationY"
															).innerText
															: "";

													const videoRotationZ =
														item.querySelector(
															"p.video-block-rotationZ"
														)
															? item.querySelector(
																"p.video-block-rotationZ"
															).innerText
															: "";

													const videoUrl =
														item.querySelector(
															"div.video-block-url"
														)
															? item.querySelector(
																"div.video-block-url"
															).innerText
															: "";

													const aspectHeight =
														item.querySelector(
															"p.video-block-aspect-height"
														)
															? item.querySelector(
																"p.video-block-aspect-height"
															).innerText
															: "";

													const aspectWidth =
														item.querySelector(
															"p.video-block-aspect-width"
														)
															? item.querySelector(
																"p.video-block-aspect-width"
															).innerText
															: "";

															const autoPlay =
															item.querySelector(
																"p.video-block-autoplay"
															)
																? item.querySelector(
																	"p.video-block-autoplay"
																).innerText
																: false;
		
														const customModel =
														item.querySelector(
															"p.video-block-custom-model"
														)
															? item.querySelector(
																"p.video-block-custom-model"
															).innerText
															: false;
														const videoModelUrl =
														item.querySelector(
															"div.video-block-model-url"
														)
														? item.querySelector(
															"div.video-block-model-url"
														).innerText
														: "";

																return (
														<ThreeVideo
															key={index}
															url={videoUrl}
															positionX={videoPosX}
															positionY={videoPosY}
															positionZ={videoPosZ}
															scaleX={videoScaleX}
															scaleY={videoScaleY}
															scaleZ={videoScaleZ}
															rotationX={
																videoRotationX
															}
															rotationY={
																videoRotationY
															}
															rotationZ={
																videoRotationZ
															}
															aspectHeight={
																aspectHeight
															}
															aspectWidth={
																aspectWidth
															}
															autoPlay={autoPlay}
															customModel={customModel}
															threeObjectPlugin={threeObjectPlugin}
															threeObjectPluginRoot={threeObjectPluginRoot}
															modelUrl={videoModelUrl}
														/>
													);
												})}
												{Object.values(props.audiosToAdd).map((item, index) => {
												const audioPosX = item.querySelector("p.audio-block-positionX")
													? item.querySelector("p.audio-block-positionX").innerText
													: "";

												const audioPosY = item.querySelector("p.audio-block-positionY")
													? item.querySelector("p.audio-block-positionY").innerText
													: "";

												const audioPosZ = item.querySelector("p.audio-block-positionZ")
													? item.querySelector("p.audio-block-positionZ").innerText
													: "";

												const audioScaleX = item.querySelector("p.audio-block-scaleX")
													? item.querySelector("p.audio-block-scaleX").innerText
													: "";

												const audioScaleY = item.querySelector("p.audio-block-scaleY")
													? item.querySelector("p.audio-block-scaleY").innerText
													: "";

												const audioScaleZ = item.querySelector("p.audio-block-scaleZ")
													? item.querySelector("p.audio-block-scaleZ").innerText
													: "";

												const audioRotationX = item.querySelector("p.audio-block-rotationX")
													? item.querySelector("p.audio-block-rotationX").innerText
													: "";

												const audioRotationY = item.querySelector("p.audio-block-rotationY")
													? item.querySelector("p.audio-block-rotationY").innerText
													: "";

												const audioRotationZ = item.querySelector("p.audio-block-rotationZ")
													? item.querySelector("p.audio-block-rotationZ").innerText
													: "";

												const audioUrl = item.querySelector("p.audio-block-url")
													? item.querySelector("p.audio-block-url").innerText
													: "";

												const autoPlay = item.querySelector("p.audio-block-autoPlay")
													? item.querySelector("p.audio-block-autoPlay").innerText === "1"
													: false;

												const loop = item.querySelector("p.audio-block-loop")
													? item.querySelector("p.audio-block-loop").innerText === "1"
													: false;

												const volume = item.querySelector("p.audio-block-volume")
													? Number(item.querySelector("p.audio-block-volume").innerText)
													: 1;

												const positional = item.querySelector("p.audio-block-positional")
													? item.querySelector("p.audio-block-positional").innerText === "1"
													: false;

												const coneInnerAngle = item.querySelector("p.audio-block-coneInnerAngle")
													? Number(item.querySelector("p.audio-block-coneInnerAngle").innerText)
													: 1;

												const coneOuterAngle = item.querySelector("p.audio-block-coneOuterAngle")
													? Number(item.querySelector("p.audio-block-coneOuterAngle").innerText)
													: 1;

												const coneOuterGain = item.querySelector("p.audio-block-coneOuterGain")
													? Number(item.querySelector("p.audio-block-coneOuterGain").innerText)
													: 1;

												const distanceModel = item.querySelector("p.audio-block-distanceModel")
													? item.querySelector("p.audio-block-distanceModel").innerText
													: "inverse";

												const maxDistance = item.querySelector("p.audio-block-maxDistance")
													? Number(item.querySelector("p.audio-block-maxDistance").innerText)
													: 1;

												const refDistance = item.querySelector("p.audio-block-refDistance")
													? Number(item.querySelector("p.audio-block-refDistance").innerText)
													: 1;

												const rolloffFactor = item.querySelector("p.audio-block-rolloffFactor")
													? Number(item.querySelector("p.audio-block-rolloffFactor").innerText)
													: 1;

												return (
													<ThreeAudio
													key={index}
													audioUrl={audioUrl}
													positionX={audioPosX}
													positionY={audioPosY}
													positionZ={audioPosZ}
													scaleX={audioScaleX}
													scaleY={audioScaleY}
													scaleZ={audioScaleZ}
													rotationX={audioRotationX}
													rotationY={audioRotationY}
													rotationZ={audioRotationZ}
													autoPlay={autoPlay ? "1" : "0"} // Convert bool to string "1" or "0"
													loop={loop ? "1" : "0"} // Convert bool to string "1" or "0"
													volume={volume}
													positional={positional ? "1" : "0"} // Convert bool to string "1" or "0"
													coneInnerAngle={coneInnerAngle}
													coneOuterAngle={coneOuterAngle}
													coneOuterGain={coneOuterGain}
													distanceModel={distanceModel}
													maxDistance={maxDistance}
													refDistance={refDistance}
													rolloffFactor={rolloffFactor}
													/>
												);
												})}
												{props.lightsToAdd.length < 1 && (
													<>
														<ambientLight intensity={0.5} />
														<directionalLight
															intensity={0.6}
															position={[0, 2, 2]}
														// shadow-mapSize-width={512}
														// shadow-mapSize-height={512}
														// shadow-camera-far={5000}
														// shadow-camera-fov={15}
														// shadow-camera-near={0.5}
														// shadow-camera-left={-50}
														// shadow-camera-bottom={-50}
														// shadow-camera-right={50}
														// shadow-camera-top={50}
														// shadow-radius={1}
														// shadow-bias={-0.001}
														// castShadow
														/>
													</>
												)}
												{Object.values(props.lightsToAdd).map((item, index) => {
												const lightPosX = item.querySelector("p.light-block-positionX")
													? item.querySelector("p.light-block-positionX").innerText
													: "";

												const lightPosY = item.querySelector("p.light-block-positionY")
													? item.querySelector("p.light-block-positionY").innerText
													: "";

												const lightPosZ = item.querySelector("p.light-block-positionZ")
													? item.querySelector("p.light-block-positionZ").innerText
													: "";

												const lightRotationX = item.querySelector("p.light-block-rotationX")
													? item.querySelector("p.light-block-rotationX").innerText
													: "";

												const lightRotationY = item.querySelector("p.light-block-rotationY")
													? item.querySelector("p.light-block-rotationY").innerText
													: "";

												const lightRotationZ = item.querySelector("p.light-block-rotationZ")
													? item.querySelector("p.light-block-rotationZ").innerText
													: "";

												const lightType = item.querySelector("p.light-block-type")
													? item.querySelector("p.light-block-type").innerText
													: "ambient";

												const lightColor = item.querySelector("p.light-block-color")
													? item.querySelector("p.light-block-color").innerText
													: "";

												const lightItensity = item.querySelector("p.light-block-intensity")
													? item.querySelector("p.light-block-intensity").innerText
													: "";
	
												const lightDistance = item.querySelector("p.light-block-distance")
													? item.querySelector("p.light-block-distance").innerText
													: "";

												const lightDecay = item.querySelector("p.light-block-decay")
													? item.querySelector("p.light-block-decay").innerText
													: "";

												const lightAngle = item.querySelector("p.light-block-angle")
													? item.querySelector("p.light-block-angle").innerText
													: "";

												const lightPenumbra = item.querySelector("p.light-block-penumbra")
													? item.querySelector("p.light-block-penumbra").innerText
													: "";

												return (
													<ThreeLight
														key={index}
														positionX={lightPosX}
														positionY={lightPosY}
														positionZ={lightPosZ}
														rotationX={lightRotationX}
														rotationY={lightRotationY}
														rotationZ={lightRotationZ}
														type={lightType}
														color={lightColor}
														intensity={lightItensity}
														distance={lightDistance}
														decay={lightDecay}
														angle={lightAngle}
														penumbra={lightPenumbra}
													/>
												);
												})}

												{Object.values(
													props.npcsToAdd
												).map((npc, index) => {
													const modelPosX =
														npc.querySelector(
															"p.npc-block-position-x"
														)
															? npc.querySelector(
																"p.npc-block-position-x"
															).innerText
															: "";

													const modelPosY =
														npc.querySelector(
															"p.npc-block-position-y"
														)
															? npc.querySelector(
																"p.npc-block-position-y"
															).innerText
															: "";

													const modelPosZ =
														npc.querySelector(
															"p.npc-block-position-z"
														)
															? npc.querySelector(
																"p.npc-block-position-z"
															).innerText
															: "";

													const modelRotationX =
														npc.querySelector(
															"p.npc-block-rotation-x"
														)
															? npc.querySelector(
																"p.npc-block-rotation-x"
															).innerText
															: "";

													const modelRotationY =
														npc.querySelector(
															"p.npc-block-rotation-y"
														)
															? npc.querySelector(
																"p.npc-block-rotation-y"
															).innerText
															: "";

													const modelRotationZ =
														npc.querySelector(
															"p.npc-block-rotation-z"
														)
															? npc.querySelector(
																"p.npc-block-rotation-z"
															).innerText
															: "";

													const url = npc.querySelector(
														"p.npc-block-url"
													)
														? npc.querySelector(
															"p.npc-block-url"
														).innerText
														: "";

													const alt = npc.querySelector(
														"p.npc-block-alt"
													)
														? npc.querySelector(
															"p.npc-block-alt"
														).innerText
														: "";

														const personality = npc.querySelector(
															"p.npc-block-personality"
														)
															? npc.querySelector(
																"p.npc-block-personality"
															).innerText
															: "";

														const defaultMessage = npc.querySelector(
															"p.npc-block-default-message"
														)
															? npc.querySelector(
																"p.npc-block-default-message"
															).innerText
															: "";
		
															const name = npc.querySelector(
															"p.npc-block-name"
														)
															? npc.querySelector(
																"p.npc-block-name"
															).innerText
															: "";
			
													const objectAwareness =
														npc.querySelector(
															"p.npc-block-object-awareness"
														)
															? npc.querySelector(
																"p.npc-block-object-awareness"
															).innerText
															: false;

													return (
														<NPCObject
															key={index}
															url={url}
															positionX={modelPosX}
															positionY={modelPosY}
															positionZ={modelPosZ}
															messages={messages}
															rotationX={
																modelRotationX
															}
															rotationY={
																modelRotationY
															}
															rotationZ={
																modelRotationZ
															}
															objectAwareness={objectAwareness}
															name={name}
															message={
																messageObject
															}
															threeObjectPlugin={threeObjectPlugin}
															threeObjectPluginRoot={threeObjectPluginRoot}
															defaultAvatarAnimation={defaultAvatarAnimation}
															defaultFont={defaultFont}
															defaultMessage={defaultMessage}
															personality={personality}
															// idle={idle}
														/>
													);
												})}
												{Object.values(
													props.modelsToAdd
												).map((model, index) => {
													const modelPosX =
														model.querySelector(
															"p.model-block-position-x"
														)
															? model.querySelector(
																"p.model-block-position-x"
															).innerText
															: "";

													const modelPosY =
														model.querySelector(
															"p.model-block-position-y"
														)
															? model.querySelector(
																"p.model-block-position-y"
															).innerText
															: "";

													const modelPosZ =
														model.querySelector(
															"p.model-block-position-z"
														)
															? model.querySelector(
																"p.model-block-position-z"
															).innerText
															: "";

													const modelScaleX =
														model.querySelector(
															"p.model-block-scale-x"
														)
															? model.querySelector(
																"p.model-block-scale-x"
															).innerText
															: "";

													const modelScaleY =
														model.querySelector(
															"p.model-block-scale-y"
														)
															? model.querySelector(
																"p.model-block-scale-y"
															).innerText
															: "";

													const modelScaleZ =
														model.querySelector(
															"p.model-block-scale-z"
														)
															? model.querySelector(
																"p.model-block-scale-z"
															).innerText
															: "";

													const modelRotationX =
														model.querySelector(
															"p.model-block-rotation-x"
														)
															? model.querySelector(
																"p.model-block-rotation-x"
															).innerText
															: "";

													const modelRotationY =
														model.querySelector(
															"p.model-block-rotation-y"
														)
															? model.querySelector(
																"p.model-block-rotation-y"
															).innerText
															: "";

													const modelRotationZ =
														model.querySelector(
															"p.model-block-rotation-z"
														)
															? model.querySelector(
																"p.model-block-rotation-z"
															).innerText
															: "";

													const url = model.querySelector(
														"p.model-block-url"
													)
														? model.querySelector(
															"p.model-block-url"
														).innerText
														: "";

													const animations =
														model.querySelector(
															"p.model-block-animations"
														)
															? model.querySelector(
																"p.model-block-animations"
															).innerText
															: "";

													const alt = model.querySelector(
														"p.model-block-alt"
													)
														? model.querySelector(
															"p.model-block-alt"
														).innerText
														: "";

														if (!objectsInRoom.includes(alt)) {
															setObjectsInRoom([...objectsInRoom, alt]);
														}
														
													const collidable =
														model.querySelector(
															"p.model-block-collidable"
														)
															? model.querySelector(
																"p.model-block-collidable"
															).innerText
															: false;
													return (
														<ModelObject
															key={index}
															url={url}
															positionX={modelPosX}
															positionY={modelPosY}
															positionZ={modelPosZ}
															scaleX={modelScaleX}
															scaleY={modelScaleY}
															scaleZ={modelScaleZ}
															messages={messages}
															rotationX={
																modelRotationX
															}
															rotationY={
																modelRotationY
															}
															rotationZ={
																modelRotationZ
															}
															alt={alt}
															animations={animations}
															collidable={collidable}
															message={
																messageObject
															}
															threeObjectPlugin={threeObjectPlugin}
															threeObjectPluginRoot={threeObjectPluginRoot}
															defaultFont={defaultFont}
															// idle={idle}
														/>
													);
												})}
												{Object.values(props.htmlToAdd).map(
													(model, index) => {
														const textContent =
															model.querySelector(
																"p.three-text-content"
															)
																? model.querySelector(
																	"p.three-text-content"
																).innerText
																: "";
														const rotationX =
															model.querySelector(
																"p.three-text-rotationX"
															)
																? model.querySelector(
																	"p.three-text-rotationX"
																).innerText
																: "";
														const rotationY =
															model.querySelector(
																"p.three-text-rotationY"
															)
																? model.querySelector(
																	"p.three-text-rotationY"
																).innerText
																: "";
														const rotationZ =
															model.querySelector(
																"p.three-text-rotationZ"
															)
																? model.querySelector(
																	"p.three-text-rotationZ"
																).innerText
																: "";
														const positionX =
															model.querySelector(
																"p.three-text-positionX"
															)
																? model.querySelector(
																	"p.three-text-positionX"
																).innerText
																: "";
														const positionY =
															model.querySelector(
																"p.three-text-positionY"
															)
																? model.querySelector(
																	"p.three-text-positionY"
																).innerText
																: "";
														const positionZ =
															model.querySelector(
																"p.three-text-positionZ"
															)
																? model.querySelector(
																	"p.three-text-positionZ"
																).innerText
																: "";
														const scaleX =
															model.querySelector(
																"p.three-text-scaleX"
															)
																? model.querySelector(
																	"p.three-text-scaleX"
																).innerText
																: "";
														const scaleY =
															model.querySelector(
																"p.three-text-scaleY"
															)
																? model.querySelector(
																	"p.three-text-scaleY"
																).innerText
																: "";
														const scaleZ =
															model.querySelector(
																"p.three-text-scaleZ"
															)
																? model.querySelector(
																	"p.three-text-scaleZ"
																).innerText
																: "";

														const textColor =
															model.querySelector(
																"p.three-text-color"
															)
																? model.querySelector(
																	"p.three-text-color"
																).innerText
																: "";

														return (
															<TextObject
																key={index}
																textContent={
																	textContent
																}
																positionX={
																	positionX
																}
																positionY={
																	positionY
																}
																positionZ={
																	positionZ
																}
																scaleX={scaleX}
																scaleY={scaleY}
																scaleZ={scaleZ}
																defaultFont={defaultFont}
																threeObjectPlugin={threeObjectPlugin}
																textColor={
																	textColor
																}
																rotationX={
																	rotationX
																}
																rotationY={
																	rotationY
																}
																rotationZ={
																	rotationZ
																}
															// alt={alt}
															// animations={animations}
															/>
														);
													}
												)}
												{Object.values(
													props.portalsToAdd
												).map((model, index) => {
													const modelPosX =
														model.querySelector(
															"p.three-portal-block-position-x"
														)
															? model.querySelector(
																"p.three-portal-block-position-x"
															).innerText
															: "";

													const modelPosY =
														model.querySelector(
															"p.three-portal-block-position-y"
														)
															? model.querySelector(
																"p.three-portal-block-position-y"
															).innerText
															: "";

													const modelPosZ =
														model.querySelector(
															"p.three-portal-block-position-z"
														)
															? model.querySelector(
																"p.three-portal-block-position-z"
															).innerText
															: "";

													const modelScaleX =
														model.querySelector(
															"p.three-portal-block-scale-x"
														)
															? model.querySelector(
																"p.three-portal-block-scale-x"
															).innerText
															: "";

													const modelScaleY =
														model.querySelector(
															"p.three-portal-block-scale-y"
														)
															? model.querySelector(
																"p.three-portal-block-scale-y"
															).innerText
															: "";

													const modelScaleZ =
														model.querySelector(
															"p.three-portal-block-scale-z"
														)
															? model.querySelector(
																"p.three-portal-block-scale-z"
															).innerText
															: "";

													const modelRotationX =
														model.querySelector(
															"p.three-portal-block-rotation-x"
														)
															? model.querySelector(
																"p.three-portal-block-rotation-x"
															).innerText
															: "";

													const modelRotationY =
														model.querySelector(
															"p.three-portal-block-rotation-y"
														)
															? model.querySelector(
																"p.three-portal-block-rotation-y"
															).innerText
															: "";

													const modelRotationZ =
														model.querySelector(
															"p.three-portal-block-rotation-z"
														)
															? model.querySelector(
																"p.three-portal-block-rotation-z"
															).innerText
															: "";

													const url = model.querySelector(
														"p.three-portal-block-url"
													)
														? model.querySelector(
															"p.three-portal-block-url"
														).innerText
														: "";

													const destinationUrl =
														model.querySelector(
															"p.three-portal-block-destination-url"
														)
															? model.querySelector(
																"p.three-portal-block-destination-url"
															).innerText
															: "";

													const animations =
														model.querySelector(
															"p.three-portal-block-animations"
														)
															? model.querySelector(
																"p.three-portal-block-animations"
															).innerText
															: "";

													const label =
														model.querySelector(
															"p.three-portal-block-label"
														)
															? model.querySelector(
																"p.three-portal-block-label"
															).innerText
															: "";

													const labelOffsetX =
														model.querySelector(
															"p.three-portal-block-label-offset-x"
														)
															? model.querySelector(
																"p.three-portal-block-label-offset-x"
															).innerText
															: "";

													const labelOffsetY =
														model.querySelector(
															"p.three-portal-block-label-offset-y"
														)
															? model.querySelector(
																"p.three-portal-block-label-offset-y"
															).innerText
															: "";

													const labelOffsetZ =
														model.querySelector(
															"p.three-portal-block-label-offset-z"
														)
															? model.querySelector(
																"p.three-portal-block-label-offset-z"
															).innerText
															: "";
													const labelTextColor =
														model.querySelector(
															"p.three-portal-block-label-text-color"
														)
															? model.querySelector(
																"p.three-portal-block-label-text-color"
															).innerText
															: "";

													return (
														<Portal
															key={index}
															url={url}
															destinationUrl={
																destinationUrl
															}
															defaultFont={defaultFont}
															threeObjectPlugin={threeObjectPlugin}
															positionX={modelPosX}
															positionY={modelPosY}
															animations={animations}
															positionZ={modelPosZ}
															scaleX={modelScaleX}
															scaleY={modelScaleY}
															scaleZ={modelScaleZ}
															rotationX={
																modelRotationX
															}
															rotationY={
																modelRotationY
															}
															rotationZ={
																modelRotationZ
															}
															label={label}
															labelOffsetX={
																labelOffsetX
															}
															labelOffsetY={
																labelOffsetY
															}
															labelOffsetZ={
																labelOffsetZ
															}
															labelTextColor={
																labelTextColor
															}
															threeObjectPluginRoot={threeObjectPluginRoot}
														/>
													);
												})}
											</TeleportTravel>
										</>
									)}
								</Physics>
							</Suspense>
							{/* <OrbitControls
								enableZoom={ true }
							/> */}
							</FrontPluginProvider>
						</XR>
					</Canvas>
					{Object.values(
						props.npcsToAdd
					).map((npc, index) => {
 
					const personality = npc.querySelector(
						"p.npc-block-personality"
					)
						? npc.querySelector(
							"p.npc-block-personality"
						).innerText
						: "";
					const defaultMessage = npc.querySelector(
						"p.npc-block-default-message"
					)
						? npc.querySelector(
							"p.npc-block-default-message"
						).innerText
						: "";
	
					const objectAwareness = npc.querySelector(
						"p.npc-block-object-awareness"
					)
						? npc.querySelector(
							"p.npc-block-object-awareness"
						).innerText
						: "";

					const name = npc.querySelector(
						"p.npc-block-name"
					)
						? npc.querySelector(
							"p.npc-block-name"
						).innerText
						: "";
					
					return (
							<ChatBox 
								setMessages = {setMessages}
								objectsInRoom = {objectsInRoom}
								personality = {personality}
								objectAwareness = {objectAwareness}
								name = {name}
								defaultMessage = {defaultMessage}
								messages = {messages}
								showUI = {showUI}
								style = {{zIndex: 100}}
								nonce={props.userData.nonce}
								key="something"
							/>
					)
					})}
						<>
						{ isMobile() && (
						<ReactNipple
							// supports all nipplejs options
							// see https://github.com/yoannmoinet/nipplejs#options
							options={{ mode: 'static', position: { top: '50%', left: '50%' } }}
							// any unknown props will be passed to the container element, e.g. 'title', 'style' etc
							style={{
								outline: '1px dashed red',
								width: 150,
								height: 150,
								position: "absolute",
								bottom: 30,
								left: 30,
								userSelect: "none",
								transition: "opacity 0.5s"
							}}
							// all events supported by nipplejs are available as callbacks
							// see https://github.com/yoannmoinet/nipplejs#start
							onMove={( evt, data ) => {
								if(data.force > 1.5){
									movement.current.shift = true;
								} else {
									movement.current.shift = false;
								}
								if(data.direction && data.direction.angle){
									if(data.direction.angle === "up" && ! movement.current.forward){
										movement.current.forward = true;
										movement.current.backward = false;
										movement.current.left = false;
										movement.current.right = false;
									} else if(data.direction.angle === "down"  && ! movement.current.backward){
										movement.current.forward = false;
										movement.current.backward = true;
										movement.current.left = false;
										movement.current.right = false;
									} else if(data.direction.angle === "left"  && ! movement.current.left){
										movement.current.forward = false;
										movement.current.backward = false;
										movement.current.left = true;
										movement.current.right = false;
									} else if(data.direction.angle === "right"  && ! movement.current.right){
										movement.current.forward = false;
										movement.current.backward = false;
										movement.current.left = false;
										movement.current.right = true;
									}	
								}
							}}
							onEnd={( evt, data ) => {
								movement.current.forward = false;
								movement.current.backward = false;
								movement.current.left = false;
								movement.current.right = false;
							}}
						/>
						/* <ReactNipple
							// supports all nipplejs options
							// see https://github.com/yoannmoinet/nipplejs#options
							options={{ mode: 'static', position: { top: '50%', left: '50%' } }}
							// any unknown props will be passed to the container element, e.g. 'title', 'style' etc
							style={{
								outline: '1px dashed red',
								width: 150,
								height: 150,
								position: "absolute",
								bottom: 30,
								right: 30,
								userSelect: "none",
								transition: "opacity 0.5s" 
							}}
							// all events supported by nipplejs are available as callbacks
							// see https://github.com/yoannmoinet/nipplejs#start
							onMove={( evt, data ) => {
								console.log(data.direction.angle);
							}}
							// onEnd={(evt, data) => setMobileRotControls(null)}
						/> */
					) }
					</>
				</>
			);
		}
	} else {
		return (
			<div
				ref={canvasRef}
				style={{
					backgroundColor: props.backgroundColor,
					backgroundImage: `url(${props.previewImage})`,
					backgroundPosition: "center",
					margin: "0",
					height: "900px",
					width: "100%",
					padding: "0",
					alignItems: "center",
					justifyContent: "center",
					display: "flex",
				}}
			>
				<div
					className={"threeov-entry-flow"}
					style={{
						height: "200px",
						width: "200px",
						position: "relative",
						padding: "10px"
					}}
				>
					{ ( props.networkingBlock.length > 0 ) && (
						<div>
							<span>Display Name</span>
							<input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
						</div>
					)}
					<button
						class="threeov-load-world-button"
						onClick={() => {
							canvasRef.current.scrollIntoView({ behavior: 'smooth' });
							setLoaded(true);
						}}
						style={{
							margin: "0 auto",
							padding: "10px"
						}}
					>
						{" "}
						{props.networkingBlock.length > 0 ? "Enter Room" : "Load World"}
					</button>
				</div>
			</div>
		);
	}
}
