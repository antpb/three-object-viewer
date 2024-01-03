import P2PCF from "./p2pcf/p2pcf.js";
import React, { useEffect, useMemo } from "react";
import audioIcon from '../../../inc/assets/mic_icon.png';
import audioIconMute from '../../../inc/assets/mic_icon_mute.png';
import participants from '../../../inc/assets/participants.png';
import worldIcon from '../../../inc/assets/world_icon.png';
import cornerAccent from '../../../inc/assets/corner_accent.png';
import { color } from "@wordpress/icons";

const Networking = (props) => {


	let isMuted = false;  // Initial state of the microphone
	let localStream = null;  // To hold the local media stream
    const RoomDropdownContent = () => {
        let dropdown = document.getElementById("room-dropdown");
        dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    };

	// Function to toggle mute on the local audio stream
	const toggleMute = async (stream) => {
		if (stream) {
			var muteIcon = document.getElementById("mute-icon");

			isMuted = !isMuted;
			// mute the local stream microphone
			stream.getAudioTracks()[0].enabled = !isMuted;
			if(muteIcon){
				if (stream.getAudioTracks()[0].enabled) {
					muteIcon.style.backgroundImage = `url(${threeObjectPlugin + audioIcon})`;
				} else {
					muteIcon.style.backgroundImage = `url(${threeObjectPlugin + audioIconMute})`;
				}	
			}

		}
	};

	// Function to get the user's media
	const getUserMedia = async () => {
		try {
			localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
			// Do something with the stream like sending it to other peers
		} catch (error) {
			console.error('Error accessing the microphone', error);
		}
	};
	// Call this function when you want to toggle mute (e.g., when a button is pressed)
	const onMuteButtonPressed = (stream) => {
		toggleMute(stream);
	};
	
	if (!document.location.hash) {
		document.location = document.location.toString() + `#3ov-${props.postSlug}`;
	}
	const userProfileName =
		userData.userId === ""
			? Math.floor(Math.random() * 100000)
			: userData.userId;
	const p2pcf = new P2PCF(
		"user-" + userProfileName,
		document.location.hash.substring(1),
		{
			workerUrl: multiplayerWorker,
			slowPollingRateMs: 5000,
			fastPollingRateMs: 1500
		}
	);

	window.p2pcf = p2pcf;
	console.log("client id:", p2pcf.clientId);

	const removePeerUi = (clientId) => {
		document.getElementById(clientId)?.remove();
		document.getElementById(`${clientId}-video`)?.remove();
	};

	const addPeerUi = (sessionId) => {
		// if (document.getElementById(sessionId)) return;
		var peerIcon = document.createElement("button");
		peerIcon.style.backgroundImage = `url(${threeObjectPlugin + participants})`;
		peerIcon.style.backgroundSize = "cover";
		peerIcon.style.width = "40px";
		peerIcon.style.height = "40px";
		peerIcon.style.padding = "10px";
		peerIcon.style.boxSizing = "border-box";
		peerIcon.style.borderRadius = "50%";
		peerIcon.style.backgroundPosition = "center";
		peerIcon.style.backgroundRepeat = "no-repeat";
		peerIcon.style.backgroundColor = "#FFFFFF";
		peerIcon.style.border = "solid 1px #959595";
		peerIcon.style.backgroundSize = "30px";
		peerIcon.style.marginRight = "5px";
		peerIcon.style.marginTop = "3px";
		peerIcon.style.cursor = "pointer";

		// const peerEl = document.createElement("div");
		// peerEl.style = "display: flex;";

		// const name = document.createElement("div");
		// name.innerText = sessionId.substring(0, 5);

		// peerEl.id = sessionId;
		// peerEl.appendChild(name);

		document.getElementById("network-ui-container").prepend(peerIcon);
	};
	const addRoomUi = (sessionId) => {
		// if (document.getElementById(sessionId)) return;
		var roomIcon = document.createElement("button");
		console.log("icon", threeObjectPlugin + audioIcon);
		roomIcon.style.backgroundImage = `url(${threeObjectPlugin + worldIcon})`;
		roomIcon.style.backgroundSize = "cover";
		roomIcon.style.width = "40px";
		roomIcon.style.height = "40px";
		roomIcon.style.padding = "10px";
		roomIcon.style.marginTop = "3px";
		roomIcon.style.marginRight = "5px";
		roomIcon.style.marginLeft = "5px";
		roomIcon.style.boxSizing = "border-box";
		roomIcon.style.borderRadius = "50%";
		roomIcon.style.backgroundPosition = "center";
		roomIcon.style.backgroundRepeat = "no-repeat";
		roomIcon.style.backgroundColor = "#FFFFFF";
		roomIcon.style.border = "solid 1px #959595";
		roomIcon.style.cursor = "pointer";
		roomIcon.style.backgroundSize = "30px";
        roomIcon.addEventListener("click", (event) => {
			RoomDropdownContent();
            // Position the dropdown near the roomIcon
			let dropdown = document.getElementById("room-dropdown");
			dropdown.style.left = roomIcon.offsetLeft + "px";
			dropdown.style.top = roomIcon.offsetTop + roomIcon.offsetHeight + "px";
        });

		let dropdown = document.getElementById("room-dropdown");
		dropdown.style.display = "none";
		dropdown.style.position = "absolute";
		dropdown.style.backgroundColor = "black";
		dropdown.style.color = "white";
		dropdown.style.padding = "10px";
		dropdown.style.width = "200px";
		dropdown.style.height = "150px";
		dropdown.style.borderRadius = "5px";
		dropdown.innerText = "Room: " + p2pcf.roomId;

		// create a paragraph element to be added after the dropdown
		let roomParagraph = document.createElement("p");
		roomParagraph.innerText = "User: " + p2pcf.clientId;
		roomParagraph.style.marginTop = "10px";
		roomParagraph.style.marginBottom = "10px";
		roomParagraph.style.textAlign = "left";
		
		dropdown.appendChild(roomParagraph);

		document.getElementById("network-ui-container").prepend(roomIcon);
	};

	const addMessage = (message) => {
		const messageEl = document.createElement("div");
		messageEl.innerText = message;

		document.getElementById("messages").appendChild(messageEl);
	};
	let stream;
	p2pcf.on("peerconnect", (peer) => {
		console.log("Peer connect", peer.id, peer);
		console.log(peer.client_id);

		if (stream) {
			peer.addStream(stream);
		}
		peer.on("track", (track, stream) => {
			console.log("got track", track);
			const video = document.createElement("audio");
			video.id = `${peer.id}-audio`;
			video.srcObject = stream;
			video.setAttribute("playsinline", true);
			document.getElementById("videos").appendChild(video);
			video.play();
		});
	});

	p2pcf.on("peerclose", (peer) => {
		console.log("Peer close", peer.id, peer);
		removePeerUi(peer.id);
	});

	p2pcf.on("msg", (peer, data) => {
		addMessage(
			peer.id.substring(0, 5) +
				": " +
				new TextDecoder("utf-8").decode(data)
		);
	});	
	
	useEffect(() => {
		const go = () => {
			// document.getElementById("session-id").innerText = "Room: " + p2pcf.roomId;

			// document.getElementById('send-button').addEventListener('click', () => {
			//     const box = document.getElementById('send-box');
			//     addMessage(p2pcf.sessionId.substring(0, 5) + ': ' + box.value);
			//     p2pcf.broadcast(new TextEncoder().encode(box.value));
			//     box.value = '';
			// })
			const mainContainer = document.getElementById("networking");
			// set container background to accent image
			mainContainer.style.backgroundImage = `url(${threeObjectPlugin + cornerAccent})`;
			mainContainer.style.backgroundSize = "cover";
			mainContainer.style.display = "block";

			const audioButton = document.getElementById("audio-button");
			if(audioButton){
				audioButton.addEventListener("click", async (button) => {
					getUserMedia();  // Initialize media stream

					stream = await navigator.mediaDevices.getUserMedia({
						audio: true
					});

					for (const peer of p2pcf.peers.values()) {
						peer.addStream(stream);
					}
					console.log("button", button.target.parentNode);
					var audioJoin = button.target.parentNode;
					audioJoin.style.display = "none";

					var muteIcon = document.createElement("button");
					console.log("icon", threeObjectPlugin + audioIcon);
					muteIcon.style.backgroundImage = `url(${threeObjectPlugin + audioIcon})`;
					muteIcon.style.backgroundSize = "cover";
					muteIcon.id = "mute-icon";
					muteIcon.style.width = "40px";
					muteIcon.style.height = "40px";
					muteIcon.style.padding = "10px";
					muteIcon.style.marginTop = "3px";
					muteIcon.style.marginRight = "5px";
					muteIcon.style.boxSizing = "border-box";
					muteIcon.style.borderRadius = "50%";
					muteIcon.style.backgroundPosition = "center";
					muteIcon.style.backgroundRepeat = "no-repeat";
					muteIcon.style.backgroundColor = "#FFFFFF";
					muteIcon.style.border = "solid 1px #959595";
					muteIcon.style.backgroundSize = "30px";
					muteIcon.addEventListener("click", (event) => {
						// console.log("mute", event);
						// stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0]
						// 	.enabled;
						onMuteButtonPressed(stream);
					});
					//append to the audio button
					if(audioJoin.parentNode){
						audioJoin.parentNode.appendChild(muteIcon);
						// remove the audioJoin button
						//audioJoin.remove();
						toggleMute(stream);
					}
				});
			}

			p2pcf.start();
			addPeerUi();
			addRoomUi();
		};
		const handleLoaded = (event) => {
			console.log("loaded", event);
			go();
			// Remove the event listener after handling the first 'loaded' event
			window.removeEventListener("loaded", handleLoaded);
		};
		
		window.addEventListener("loaded", handleLoaded);

	}, []);

	return <></>;
};

export default Networking;