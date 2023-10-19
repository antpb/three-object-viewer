import { registerBlockType } from "@wordpress/blocks";
import Edit from "./Edit";
import Save from "./Save";
import { useBlockProps } from "@wordpress/block-editor";
import React, { Suspense, useRef, useMemo } from "react";

import { useState } from '@wordpress/element';
import { useCommand } from '@wordpress/commands';
import { registerPlugin } from '@wordpress/plugins';

// Adds pixel features
import { image, external, plus } from '@wordpress/icons';
import { Modal, Button, TextControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { VRMUtils, VRMSchema, VRMLoaderPlugin, VRMExpressionPresetName, VRMHumanBoneName } from "@pixiv/three-vrm";
import idle from "../../inc/avatars/friendly.fbx";
import defaultVRM from "../../inc/avatars/3ov_default_avatar.vrm";
import { useLoader, useThree, useFrame, Canvas } from "@react-three/fiber";
import { VRCanvas, DefaultXRControllers, Hands, XRButton, XR } from "@react-three/xr";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { Mesh, Raycaster, DoubleSide, MeshBasicMaterial, RingGeometry, AudioListener, Group, Quaternion, Matrix4, VectorKeyframeTrack, QuaternionKeyframeTrack, LoopPingPong, AnimationClip, NumberKeyframeTrack, AnimationMixer, Vector3, Vector2, BufferGeometry, CircleGeometry, sRGBEncoding, MathUtils } from "three";
import ScrollableFeed from 'react-scrollable-feed'
import { OrbitControls } from '@react-three/drei';

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

	//convert props.selectedBlock to string
	let selectedBlockString = JSON.stringify(props.selectedBlock);

	try {
			console.log("selectedBlock", props.selectedBlock);
			const apiEndpoint = '/wp-json/wp/v2/callAlchemy';
			let finalPersonality;
			if(props.selectedBlock.name === "three-object-viewer/environment") {
				finalPersonality = "CURRENT SELECTED BLOCK: " + selectedBlockString + "###\nThe following is a friendly conversation between #speaker and #agent. #user is currently in the wordpress block editor and focused on the CURRENT SELECTED BLOCK. #Agent will not user filler language and respond with the generated text requested.\n\nREAL CONVERSATION\n#conversation\n#speaker: #input\n#agent:";
			} else {
				finalPersonality = "CURRENT SELECTED BLOCK: " + selectedBlockString + "###\nThe following is a friendly conversation between #speaker and #agent. #user is currently in the wordpress block editor and focused on the CURRENT SELECTED BLOCK. #Agent will not user filler language and respond with the generated text requested.\n\nREAL CONVERSATION\n#conversation\n#speaker: #input\n#agent:";
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
				}
			};

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
					// Extract message content based on OpenAI model
					let messageContent;
					const text_triggers = ["add a text block:", "insert text:", "create text:", "add text:" ];
					let isTextBlockCommand = text_triggers.some(trigger => value.includes(trigger));
					const formatTextBlockResponse = (content) => {
						return {
							blockType: "Three Text Block",
							attrs: {
								scaleX: 1,
								scaleY: 1,
								scaleZ: 1,
								positionX: 0,
								positionY: 0,
								positionZ: 0,
								rotationX: 0,
								rotationY: 0,
								rotationZ: 0,
								textContent: content,
								textColor: "0x000000"
							}
						};
					};

						if(props.selectedBlock.name === "three-object-viewer/environment") {
							// const block = wp.blocks.createBlock( 
							// 	'three-object-viewer/text-block', { content: 'Hi Roy!' }
							//    );
					
							if (thisMessage === "gpt-3.5-turbo-0301") {
								messageContent = Object.values(thisMessage.choices)[0].message.content;
							} else if (thisMessage === "gpt-4-0314") {
								messageContent = thisMessage.choices[0].message.content;
							} else if (thisMessage?.outputs) {
								messageContent = Object.values(thisMessage.outputs)[0];
							} else {
								messageContent = thisMessage.davinciData?.choices[0].text;
							}
							// Check if user input was a text block command
							if (isTextBlockCommand) {
								let textBlockData = formatTextBlockResponse(messageContent);
								// wp.blocks.createBlock( 
								// 	'three-object-viewer/text-block', textBlockData.attrs;
								// );
								wp.data.dispatch( 'core/block-editor' ).insertBlock(
									wp.blocks.createBlock( 'three-object-viewer/three-text-block', textBlockData.attrs ),
									0,
									props.selectedBlock.clientId
								);
								let finalMessage = props.name +': ' + "Text block added! Here's the raw data:" + JSON.stringify(textBlockData);
								// Here, do something with the textBlockData like adding it to the editor or storing it
								// For now, just adding it to messages
								props.setMessages([...props.messages, inputMessageLog, JSON.stringify(finalMessage)]);
							} else {
								let formattedMessage = `${props.name}: ${messageContent}`;
								props.setMessages([...props.messages, inputMessageLog, formattedMessage]);
							}
						} else {			
						if(thisMessage?.model === "gpt-4-0314"){
							messageContent = thisMessage.choices[0].message.content;
							let formattedMessage = props.name +': ' + thisMessage.choices[0].message.content;
							props.setMessages([...props.messages, inputMessageLog, formattedMessage]);
						} else if (thisMessage?.model === "gpt-3.5-turbo-0301"){
							messageContent = Object.values(thisMessage.choices)[0].message.content;

							let formattedMessage = props.name +': ' + Object.values(thisMessage.choices)[0].message.content;
							props.setMessages([...props.messages, inputMessageLog, formattedMessage]);
						} else {
							if(thisMessage?.outputs){
								messageContent = Object.values(thisMessage.outputs)[0];

								let formattedMessage = props.name +': ' + Object.values(thisMessage.outputs)[0];
								props.setMessages([...props.messages, inputMessageLog, formattedMessage]);
							} else if(thisMessage?.name === "Server"){
								let formattedMessage = thisMessage.name +': ' + thisMessage.message;
								props.setMessages([...props.messages, inputMessageLog, formattedMessage]);
							} else {
								messageContent = thisMessage.davinciData?.choices[0].text;

								let formattedMessage = props.name +': ' + thisMessage.davinciData?.choices[0].text;
								// add formattedMessage and inputMessageLog to state
								props.setMessages([...props.messages, inputMessageLog, formattedMessage]);	
							}
						}
						// Check if user input was a text block command
						if (isTextBlockCommand) {
							let textBlockData = formatTextBlockResponse(messageContent);
							// Here, do something with the textBlockData like adding it to the editor or storing it
							// For now, just adding it to messages
							props.setMessages([...props.messages, inputMessageLog, JSON.stringify(textBlockData)]);
						} else {
							let formattedMessage = `${props.name}: ${messageContent}`;
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

	const [open, setOpen] = useState(false);
	const onSwitch = (e) => {
		e.preventDefault();
		e.stopPropagation();	
		setOpen(prevOpen => !prevOpen);
	};


	return (
		<>
			<ClickStop>
					<div style={{pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, margin: "0 auto", width: "390px", height: "280px", fontSize: ".8em", color: "#FFFFFF", bottom: "0", backgroundColor: "transparent"}}>
						<div style={{pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, width: "390px", maxHeight: "350px", height: "350px", fontSize: "0.8em", color: "#FFFFFF", backgroundColor: "#"}}>
							<ScrollableFeed>
								<ul style={{paddingLeft: "0px", marginLeft: "5px", listStyle: "none"}}>
									{ props.showUI && props.messages && props.messages.length > 0 && props.messages.map((message, index) => (
										<li style={{background: "#000000db", borderRadius: "30px", padding: "10px 20px", fontSize: "1.4em"}} key={index}>{message}</li>
									))}
								</ul>
							</ScrollableFeed>
						</div>
							<div style={{ width: "100%", height: "5%", position: "relative", bottom: "0px", boxSizing: "border-box", padding: "15px", paddingLeft: "7px" }}>
							{/* {props.messages.map((message, index) => (
							<p key={index}>{message}</p>
							))} */}
							<form style={{display: "flex"}} onSubmit={handleSubmit}>
								<input autoComplete="off" style={{height: "30px", pointerEvents: "auto", width: "390px", borderTopLeftRadius: "15px", borderBottomLeftRadius: "15px", borderTopRightRadius: "0px", borderBottomRightRadius: "0px"} } type="text" name="message" onInput={handleChange} onChange={handleChange} />
								<button className="threeov-chat-button-send" style={{ height: "30px", background: "#9100ff", color: "white", fontSize: "1em", lineHeight: "1em", borderTopRightRadius: "15px", borderBottomRightRadius: "15px", borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px"} } type="submit">Send</button>
							</form>
						</div>
					</div>
			</ClickStop>
		</>
	);
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


const AIModal = ( props ) => {
	const [messages, setMessages] = useState();
	const personality = `"#agent is an AI assistant with a cheerful, optimistic, and helpful personality. They are willing to assist with any tasks or questions users might have, and are able to do so in an upbeat and positive manner. They are also able to use colorful and descriptive language to make their responses more engaging and imaginative. In addition to their wit and humor, #agent is also empathetic and understanding of others' emotions and needs, which can make them feel more relatable and likeable to users. #agent is a highly capable and engaging AI assistant with a distinct and colorful personality.\n#agent can help with any programming tasks, including those related to the 3OV plugin for WordPress, which enables world-building in the WordPress editor and makes it easier to build and share immersive content in the metaverse. The url for the website is 3ov.xyz. #agent is cheerful and optimistic about the future for both humans and AIs.\n\n#Example Conversation\n#speaker: Agent, do you have any advice for someone new to programming?\n#agent: Sure thing! My top tip would be to always keep an open mind and a positive attitude. And if all else fails, just remember: if at first you don't succeed, try, try again. And then if that still doesn't work, call it a day and go get a coffee.\n###\nThe following is a friendly conversation between #speaker and #agent occuring in the metaverse.\n\nREAL CONVERSATION\n#conversation\n#speaker: #input\n#agent:"`;

		return (
			<>
				<Modal
					className="pixel-modal"
					title=""
					onRequestClose={ () => {
						props.onRequestClose();
					}}
					shouldCloseOnClickOutside={ false }
					shouldCloseOnEsc={ false }
					style={{
						backgroundColor: "transparent",
						margin: "0",
						height: "100vh",
						width: "100vw",
						maxHeight: "100vh",
						padding: "0",
						position: "relative",
						boxShadow: "none",
						margin: "0",
						zIndex: 1
					}}				
				>
					<div
						style={{
							// backgroundColor: props.backgroundColor,
							margin: "0 auto",
							height: "500px",
							width: "500px",
							padding: "0",
							position: "relative",
							zIndex: 1,
							background: "#f0f0f1c4",
							borderRadius: "40px",
							boxShadow: "#0000005e 0px 5px 21px"
						}}						
					>
						<ChatBox 
								setMessages = {setMessages}
								personality = {personality}
								name = {"Pixel"}
								defaultMessage = {"Howdy!"}
								messages = {messages}
								showUI = {true}
								style = {{zIndex: 100}}
								nonce={userData.nonce}
								key="something"
								selectedBlock={props.selectedBlock}
						/>
					</div>
					<Canvas
						camera={{
							fov: 70,
							zoom: 2.3,
							far: 2000,
							position: [0, 0, 0],
							rotation: [2, 0, 0]
						}}
						style={{
							// backgroundColor: props.backgroundColor,
							margin: "0",
							marginTop: "-70px",
							bottom: "0",
							height: "480px",
							width: "100vw",
							padding: "0",
							position: "relative",
							zIndex: 1
						}}				
					>
						<Pixel/>
					</Canvas>
				</Modal>
			</>
		);
};

const icon = (
	<svg
		className="custom-icon custom-icon-cube"
		viewBox="0 0 40 40"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g transform="matrix(1,0,0,1,-1.1686,0.622128)">
			<path d="M37.485,28.953L21.699,38.067L21.699,19.797L37.485,10.683L37.485,28.953ZM21.218,19.821L21.218,38.065L5.435,28.953L5.435,10.709L21.218,19.821ZM37.207,10.288L21.438,19.392L5.691,10.301L21.46,1.197L37.207,10.288Z" />
		</g>
	</svg>
);

const blockConfig = require("./block.json");
registerBlockType(blockConfig.name, {
	...blockConfig,
	icon,
	apiVersion: 2,
	edit: Edit,
	save: Save,
	deprecated: [
		{
			attributes: {
				bg_color: {
					type: "string",
					default: "#FFFFFF"
				},
				zoom: {
					type: "integer",
					default: 90
				},
				scale: {
					type: "integer",
					default: 1
				},
				positionX: {
					type: "integer",
					default: 0
				},
				positionY: {
					type: "integer",
					default: 0
				},
				rotationY: {
					type: "integer",
					default: 0
				},
				threeObjectUrl: {
					type: "string",
					default: null
				},
				hasZoom: {
					type: "bool",
					default: false
				},
				hasTip: {
					type: "bool",
					default: true
				},
				deviceTarget: {
					type: "string",
					default: "2d"
				}
			},
			save(props) {
				return (
					<div {...useBlockProps.save()}>
						<>
							<div className="three-object-three-app">
								<p className="three-object-block-device-target">
									{props.attributes.deviceTarget}
								</p>
								<p className="three-object-block-url">
									{props.attributes.threeObjectUrl}
								</p>
								<p className="three-object-scale">
									{props.attributes.scale}
								</p>
								<p className="three-object-background-color">
									{props.attributes.bg_color}
								</p>
								<p className="three-object-zoom">
									{props.attributes.zoom}
								</p>
								<p className="three-object-has-zoom">
									{props.attributes.hasZoom ? 1 : 0}
								</p>
								<p className="three-object-has-tip">
									{props.attributes.hasTip ? 1 : 0}
								</p>
								<p className="three-object-position-y">
									{props.attributes.positionY}
								</p>
								<p className="three-object-rotation-y">
									{props.attributes.rotationY}
								</p>
								<p className="three-object-scale">
									{props.attributes.scale}
								</p>
							</div>
						</>
					</div>
				);
			}
		},
		{
			attributes: {
				bg_color: {
					type: "string",
					default: "#FFFFFF"
				},
				zoom: {
					type: "integer",
					default: 90
				},
				scale: {
					type: "integer",
					default: 1
				},
				positionX: {
					type: "integer",
					default: 0
				},
				positionY: {
					type: "integer",
					default: 0
				},
				rotationY: {
					type: "integer",
					default: 0
				},
				threeObjectUrl: {
					type: "string",
					default: null
				},
				hasZoom: {
					type: "bool",
					default: false
				},
				hasTip: {
					type: "bool",
					default: true
				},
				deviceTarget: {
					type: "string",
					default: "2d"
				},
				animations: {
					type: "string",
					default: ""
				}
			},
			save(props) {
				return (
					<div {...useBlockProps.save()}>
						<>
							<div className="three-object-three-app">
								<p className="three-object-block-device-target">
									{props.attributes.deviceTarget}
								</p>
								<p className="three-object-block-url">
									{props.attributes.threeObjectUrl}
								</p>
								<p className="three-object-scale">
									{props.attributes.scale}
								</p>
								<p className="three-object-background-color">
									{props.attributes.bg_color}
								</p>
								<p className="three-object-zoom">
									{props.attributes.zoom}
								</p>
								<p className="three-object-has-zoom">
									{props.attributes.hasZoom ? 1 : 0}
								</p>
								<p className="three-object-has-tip">
									{props.attributes.hasTip ? 1 : 0}
								</p>
								<p className="three-object-position-y">
									{props.attributes.positionY}
								</p>
								<p className="three-object-rotation-y">
									{props.attributes.rotationY}
								</p>
								<p className="three-object-scale">
									{props.attributes.scale}
								</p>
								<p className="three-object-animations">
									{props.attributes.animations}
								</p>
							</div>
						</>
					</div>
				);
			}
		},
		{
			attributes: {
				align: {
					type: "string",
					default: "full"
				},  
				scale: {
					type: "integer",
					default: 1
				},
				positionX: {
					type: "integer",
					default: 0
				},
				positionY: {
					type: "integer",
					default: 0
				},
				rotationY: {
					type: "integer",
					default: 0
				},
				threeObjectUrl: {
					type: "string",
					default: null
				},
				threePreviewImage: {
					type: "string",
					default: null
				},
				deviceTarget: {
					type: "string",
					default: "vr"
				},
				animations: {
					type: "string",
					default: ""
				}
		},
		save(props) {
			return (
				<div {...useBlockProps.save()}>
					<>
						<div className="three-object-three-app-environment">
							<p className="three-object-block-device-target">
								{props.attributes.deviceTarget}
							</p>
							<p className="three-object-block-url">
								{props.attributes.threeObjectUrl}
							</p>
							<p className="three-object-scale">{props.attributes.scale}</p>
							<p className="three-object-background-color">
								{props.attributes.bg_color}
							</p>
							<p className="three-object-zoom">{props.attributes.zoom}</p>
							<p className="three-object-has-zoom">
								{props.attributes.hasZoom ? 1 : 0}
							</p>
							<p className="three-object-has-tip">
								{props.attributes.hasTip ? 1 : 0}
							</p>
							<p className="three-object-position-y">
								{props.attributes.positionY}
							</p>
							<p className="three-object-rotation-y">
								{props.attributes.rotationY}
							</p>
							<p className="three-object-scale">{props.attributes.scale}</p>
							<p className="three-object-preview-image">
								{props.attributes.threePreviewImage}
							</p>
							<p className="three-object-animations">
								{props.attributes.animations}
							</p>
						</div>
					</>
				</div>
			);
		}
		}
	]
});
