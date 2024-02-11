import P2PCF from "./p2pcf/p2pcf.js";
import React, { useEffect, useMemo } from "react";
import audioIcon from '../../../inc/assets/mic_icon.png';
import audioIconMute from '../../../inc/assets/mic_icon_mute.png';
import participants from '../../../inc/assets/participants.png';
import worldIcon from '../../../inc/assets/world_icon.png';
import cornerAccent from '../../../inc/assets/corner_accent.png';
import settingsIcon from '../../../inc/assets/settings_icon.png';
import { color } from "@wordpress/icons";
import { XRButton } from "@react-three/xr";

const Networking = (props) => {
	let isMuted = false;  // Initial state of the microphone
	let localStream = null;  // To hold the local media stream

	const returnXRButton = (props) => {
		return <XRButton {...props} />;
	};

	const RoomDropdownContent = () => {
		let dropdown = document.getElementById("room-dropdown");
		// empty the contents of the dropdown
		dropdown.innerHTML = "";
		dropdown.innerText = "Room: " + p2pcf.roomId;

		// create a paragraph element to be added after the dropdown
		let roomParagraph = document.createElement("p");
		roomParagraph.innerText = "Description: ";
		roomParagraph.style.marginTop = "10px";
		roomParagraph.style.marginBottom = "10px";
		roomParagraph.style.textAlign = "left";

		dropdown.appendChild(roomParagraph);

		dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    };

	const AudioDropdownContent = async (button) => {
		let dropdown = document.getElementById("room-dropdown");
		// empty the contents of the dropdown
		dropdown.innerHTML = "";
		// add a h3 heading that says "Select Microphone"
		let heading = document.createElement("h4");
		heading.innerText = "Select Microphone";
		heading.style.marginTop = "10px";
		heading.style.marginBottom = "10px";
		heading.style.textAlign = "left";
		heading.style.fontSize = "0.7em";
		heading.style.textAlign = "left";
		heading.style.fontWeight = "600";
		heading.style.color = "white";
		heading.style.paddingLeft = "5px";
		heading.style.fontWeight = "600";
		heading.style.fontFamily = "Arial";
		dropdown.appendChild(heading);
		// make the inner text of the dropdown a list of the users in the room
		// loop with index for each peer
		// add a select toggle and a button to change the microphone device
		let select = document.createElement("select");
		select.id = "audio-select";
		select.style.marginTop = "10px";
		select.style.marginBottom = "10px";
		select.style.textAlign = "left";
		select.style.fontSize = "0.6em";
		select.style.width = "100%";
		select.style.height = "30px";
		select.style.borderRadius = "5px";
		select.style.cursor = "pointer";
		select.style.backgroundColor = "white";
		select.style.color = "black";
		select.style.padding = "5px";
		select.style.marginBottom = "10px";
		select.style.marginTop = "10px";
		select.style.marginLeft = "0px";
		select.style.marginRight = "0px";
		select.style.border = "solid 1px #959595";
		select.style.boxSizing = "border-box";
		// populate the select with the available audio devices
		navigator.mediaDevices.enumerateDevices().then(function(devices) {
			devices.forEach(function(device) {
				if (device.kind === 'audioinput') {
					let option = document.createElement("option");
					option.value = device.deviceId;
					option.text = device.label;
					select.appendChild(option);
				}
			});
		});
		dropdown.appendChild(select);
		// create a button for submitting the audio device change
		let submit = document.createElement("button");
		submit.innerText = "Join";
		submit.style.marginTop = "10px";
		submit.style.marginBottom = "10px";
		submit.style.textAlign = "center";
		submit.style.fontSize = "0.6em";
		submit.style.fontWeight = "600";
		submit.style.height = "35px";
		submit.style.borderRadius = "15px";
		submit.style.backgroundColor = "white";
		submit.style.color = "black";
		submit.style.width = "55px";
		submit.style.padding = "10px";
		submit.style.marginBottom = "10px";
		submit.style.marginTop = "10px";
		submit.style.marginLeft = "0px";
		submit.style.marginRight = "0px";
		submit.style.border = "solid 1px #959595";
		submit.style.cursor = "pointer";
		submit.style.boxSizing = "border-box";
		submit.addEventListener("click", async (event) => {
			// get the selected audio device
			let audioSelect = document.getElementById("audio-select");
			let audioDevice = audioSelect.options[audioSelect.selectedIndex].value;
			// set the audio device
			navigator.mediaDevices.getUserMedia({ audio: { deviceId: audioDevice } }).then(function(stream) {
				// set the local stream to the new stream
				localStream = stream;
				// set a window variable for the local stream
				window.localStream = stream;
				// loop through the peers and set their streams to the new stream
				for (const peer of p2pcf.peers.values()) {
					peer.addStream(stream);
				}
			});
			// getUserMedia();  // Initialize media stream

			stream = await navigator.mediaDevices.getUserMedia({
				audio: true
			});
	
			// for (const peer of p2pcf.peers.values()) {
			// 	peer.addStream(stream);
			// }
			var audioJoin = button.target.parentNode;
			audioJoin.style.display = "none";
			dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
			var muteIcon = document.createElement("button");
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
			var settingsIconElement = document.createElement("button");
			settingsIconElement.style.backgroundImage = `url(${threeObjectPlugin + settingsIcon})`;
			settingsIconElement.style.backgroundSize = "cover";
			settingsIconElement.id = "mute-icon";
			settingsIconElement.style.width = "40px";
			settingsIconElement.style.height = "40px";
			settingsIconElement.style.padding = "10px";
			settingsIconElement.style.marginTop = "3px";
			settingsIconElement.style.marginRight = "5px";
			settingsIconElement.style.boxSizing = "border-box";
			settingsIconElement.style.borderRadius = "50%";
			settingsIconElement.style.backgroundPosition = "center";
			settingsIconElement.style.backgroundRepeat = "no-repeat";
			settingsIconElement.style.backgroundColor = "#FFFFFF";
			settingsIconElement.style.border = "solid 1px #959595";
			settingsIconElement.style.backgroundSize = "30px";
			settingsIconElement.addEventListener("click", (event) => {
				// console.log("mute", event);
				// stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0]
				// 	.enabled;
				SettingsDopdownContent()
			});

			//append to the audio button
			if(audioJoin.parentNode){
				audioJoin.parentNode.appendChild(muteIcon);
				audioJoin.parentNode.appendChild(settingsIconElement);
				// remove the audioJoin button
				//audioJoin.remove();
				toggleMute(stream);
			}

		});
		dropdown.appendChild(submit);

		dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
		
	};

	const SettingsDopdownContent = async (button) => {

		let dropdown = document.getElementById("room-dropdown");
		// empty the contents of the dropdown
		dropdown.innerHTML = "";
		// add a h3 heading that says "Select Microphone"
		let heading = document.createElement("h4");
		heading.innerText = "Select Microphone";
		heading.style.marginTop = "10px";
		heading.style.marginBottom = "10px";
		heading.style.textAlign = "left";
		heading.style.fontSize = "0.7em";
		heading.style.textAlign = "left";
		heading.style.fontWeight = "600";
		heading.style.color = "white";
		heading.style.paddingLeft = "5px";
		heading.style.fontWeight = "600";
		heading.style.fontFamily = "Arial";
		dropdown.appendChild(heading);
		// make the inner text of the dropdown a list of the users in the room
		// loop with index for each peer
			// add a select toggle and a button to change the microphone device
			let select = document.createElement("select");
			select.id = "audio-select";
			select.style.marginTop = "10px";
			select.style.marginBottom = "10px";
			select.style.textAlign = "left";
			select.style.fontSize = "0.6em";
			select.style.width = "100%";
			select.style.height = "30px";
			select.style.borderRadius = "5px";
			select.style.cursor = "pointer";
			select.style.backgroundColor = "white";
			select.style.color = "black";
			select.style.padding = "5px";
			select.style.marginBottom = "10px";
			select.style.marginTop = "10px";
			select.style.marginLeft = "0px";
			select.style.marginRight = "0px";
			select.style.border = "solid 1px #959595";
			select.style.boxSizing = "border-box";
			// populate the select with the available audio devices
			navigator.mediaDevices.enumerateDevices().then(function(devices) {
				devices.forEach(function(device) {
					if (device.kind === 'audioinput') {
						let option = document.createElement("option");
						option.value = device.deviceId;
						option.text = device.label;
						select.appendChild(option);
					}
				});
			});
			dropdown.appendChild(select);
			// create a button for submitting the audio device change
			let submit = document.createElement("button");
			submit.innerText = "Switch";
			submit.style.marginTop = "10px";
			submit.style.marginBottom = "10px";
			submit.style.textAlign = "center";
			submit.style.fontSize = "0.6em";
			submit.style.fontWeight = "600";
			submit.style.height = "35px";
			submit.style.borderRadius = "15px";
			submit.style.backgroundColor = "white";
			submit.style.color = "black";
			submit.style.width = "55px";
			submit.style.padding = "10px";
			submit.style.marginBottom = "10px";
			submit.style.marginTop = "10px";
			submit.style.marginLeft = "0px";
			submit.style.marginRight = "0px";
			submit.style.border = "solid 1px #959595";
			submit.style.cursor = "pointer";
			submit.style.boxSizing = "border-box";
			submit.addEventListener("click", async (event) => {
				// get the selected audio device
				let audioSelect = document.getElementById("audio-select");
				let audioDevice = audioSelect.options[audioSelect.selectedIndex].value;
				// set the audio device
				navigator.mediaDevices.getUserMedia({ audio: { deviceId: audioDevice } }).then(function(stream) {
					// loop through the peers and set their streams to the new stream
					for (const peer of p2pcf.peers.values()) {
						peer.removeStream(localStream);
						peer.addStream(stream);
					}
					// set the local stream to the new stream
					localStream = stream;
				});
				getUserMedia();  // Initialize media stream

				stream = await navigator.mediaDevices.getUserMedia({
					audio: true
				});
				for (const peer of p2pcf.peers.values()) {
					peer.addStream(stream);
				}
			});
			dropdown.appendChild(submit);
	
			dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
		
	};


    const PeerDropdownContent = () => {
		const userProfileName =
		userData.userId === ""
			? Math.floor(Math.random() * 100000)
			: userData.userId;

		window.participants[p2pcf.sessionId] = window.userData.inWorldName ? window.userData.inWorldName : "User-" + userProfileName;
	
        let dropdown = document.getElementById("room-dropdown");
		// empty the contents of the dropdown
		dropdown.innerHTML = "";
		// make the inner text of the dropdown a list of the users in the room
		// loop with index for each peer
		let index = 1;
		if( index === 1 ){
			let playerParagraph = document.createElement("p");
			if(window.participants[p2pcf.sessionId]){
				playerParagraph.innerHTML = '<b>' + index + ": </b>" + window.participants[p2pcf.sessionId];
			} else {
				playerParagraph.innerHTML = '<b>' + index + ": </b>" + peer.client_id;
			}
			playerParagraph.style.marginTop = "10px";
			playerParagraph.style.marginBottom = "10px";
			playerParagraph.style.textAlign = "left";
			playerParagraph.style.fontSize = "0.6em";
			dropdown.appendChild(playerParagraph);
			index++;
		}

		for (const peer of p2pcf.peers.values()) {
			let peerParagraph = document.createElement("p");

			if(window.participants[peer.id]){
				peerParagraph.innerHTML = '<b>' + index + ": </b>" + window.participants[peer.id];
			} else {
				peerParagraph.innerHTML = '<b>' + index + ": </b>" + peer.client_id;
			}
			// peerParagraph.innerHTML = '<b>' + index + ": </b>" + window.participants[peer.id].inWorldName;
			peerParagraph.style.marginTop = "10px";
			peerParagraph.style.marginBottom = "10px";
			peerParagraph.style.textAlign = "left";
			peerParagraph.style.fontSize = "0.6em";
			dropdown.appendChild(peerParagraph);
			index++;
		}

        dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    };
	// Function to toggle mute on the local audio stream
	const toggleMute = async (stream) => {
		if (stream) {
			var muteIcon = document.getElementById("mute-icon");

			isMuted = !isMuted;
			// mute the local stream microphone
			// localStream.getAudioTracks()[0].enabled = !isMuted;
			for (let i = 0; i < window.localStream.getAudioTracks().length; i++) {
				window.localStream.getAudioTracks()[i].enabled = !isMuted;
			}

			if(muteIcon){
				if (localStream.getAudioTracks()[0].enabled) {
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
	let p2pcf = new P2PCF(
		"user-" + userProfileName,
		document.location.hash.substring(1),
		{
			workerUrl: multiplayerWorker,
			slowPollingRateMs: 5000,
			fastPollingRateMs: 1500
		}
	);

	window.p2pcf = p2pcf;
	window.participants = [];

	const removePeerUi = (clientId) => {
		document.getElementById(clientId)?.remove();
		document.getElementById(`${clientId}-video`)?.remove();
	};
	const setupP2PCF = (p2pcfInstance) => {
		// Start the P2PCF instance with any necessary configurations
		p2pcfInstance.start({ playerVRM: userData.playerVRM ? userData.playerVRM : defaultAvatar });
		window.p2pcf = p2pcfInstance;
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

		// add click listener
		peerIcon.addEventListener("click", (event) => {
			PeerDropdownContent();
            // Position the dropdown near the roomIcon
			let dropdown = document.getElementById("room-dropdown");
		});

		document.getElementById("network-ui-container").prepend(peerIcon);
	};
	const addRoomUi = (sessionId) => {
		// if (document.getElementById(sessionId)) return;
		var roomIcon = document.createElement("button");
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
		dropdown.style.backgroundColor = "#000000cc";
		dropdown.style.color = "white";
		dropdown.style.padding = "10px";
		dropdown.style.width = "200px";
		dropdown.style.height = "150px";
		dropdown.style.borderRadius = "15px";
		// add corner accent
		dropdown.style.backgroundImage = `url(${threeObjectPlugin + cornerAccent})`;
		dropdown.style.backgroundSize = "auto";
		dropdown.style.backgroundPosition = "top left"
		dropdown.style.backgroundRepeat = "no-repeat";
		

		document.getElementById("network-ui-container").prepend(roomIcon);
		// prepend the returnXRButton to the network-ui-container
	};

	const addMessage = (message) => {
		const messageEl = document.createElement("div");
		messageEl.innerText = message;

		document.getElementById("messages").appendChild(messageEl);
	};
	let stream;
	p2pcf.on("roomfullrefresh", (peer) => {
		console.log("So sorry, Room full refresh", peer);
    // Wait for the URL hash to update to ensure room ID is new
    setTimeout(() => {
		// remove the window.p2pcf object from the window
		delete window.p2pcf;
        // Reinitialize P2PCF with the new room ID
        p2pcf = new P2PCF(
            "user-" + userProfileName,
            window.location.hash.substring(1),
            {
                workerUrl: multiplayerWorker,
                slowPollingRateMs: 5000,
                fastPollingRateMs: 1500
            }
        );

        // Re-setup the P2PCF instance with necessary configurations and event listeners
        setupP2PCF(p2pcf); // Implement this function to configure the new instance

    }, 500); // Adjust delay as needed

});

	p2pcf.on("peerconnect", (peer) => {
		if (stream) {
			peer.addStream(stream);
		}
		peer.on("track", (track, stream) => {
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
					// request permissions for microphone devices then do audioDropdownContent
					navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
						AudioDropdownContent(button);
					});
				});
			}

			p2pcf.start({ playerVRM: userData.playerVRM ? userData.playerVRM : defaultAvatar });
			addPeerUi();
			addRoomUi();
		};
		const handleLoaded = (event) => {
			go();
			// Remove the event listener after handling the first 'loaded' event
			window.removeEventListener("loaded", handleLoaded);
		};
		
		window.addEventListener("loaded", handleLoaded);

	}, []);

	return <></>;
};

export default Networking;