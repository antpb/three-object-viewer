const { Component, render } = wp.element;
import React, { Suspense, useRef, useState, useEffect, useMemo } from "react";

import EnvironmentFront from "./components/EnvironmentFront";
import Networking from "./components/Networking";
import ThreeObjectFront from "./components/ThreeObjectFront";

let threeObjectViewerBlocks;

if(document.querySelectorAll('three-object-viewer-block').length > 0) {
	threeObjectViewerBlocks = document.querySelectorAll('three-object-viewer-block');
} else {
	threeObjectViewerBlocks = document.querySelectorAll(".three-object-three-app");
}
let threeApp;
if(document.querySelectorAll('three-environment-block').length > 0) {
	threeApp = document.querySelectorAll('three-environment-block');	
} else {
	threeApp = document.querySelectorAll(
		".three-object-three-app-environment"
	);
}

let modelsToAdd;
if(document.querySelectorAll('three-model-block').length > 0) {
	modelsToAdd = document.querySelectorAll('three-model-block');
} else {
	modelsToAdd = document.querySelectorAll(
		".three-object-three-app-model-block"
	);
}

let networkingBlock;
if(document.querySelectorAll('three-networking-block').length > 0) {
	networkingBlock = document.querySelectorAll('three-networking-block');
} else {
	networkingBlock = document.querySelectorAll(
		".three-object-three-app-networking-block"
	);
}

let npcsToAdd;
if(document.querySelectorAll('three-npc-block').length > 0) {
	npcsToAdd = document.querySelectorAll('three-npc-block');
} else {
	npcsToAdd = document.querySelectorAll(
		".three-object-three-app-npc-block"
	);
}

let textToAdd;
if(document.querySelectorAll('three-text-block').length > 0) {
	textToAdd = document.querySelectorAll('three-text-block');
} else {
	textToAdd = document.querySelectorAll(
		".three-object-three-app-three-text-block"
	);	
}

let portalsToAdd;
if(document.querySelectorAll('three-portal-block').length > 0) {
	portalsToAdd = document.querySelectorAll('three-portal-block');
} else {
	portalsToAdd = document.querySelectorAll(
		".three-object-three-app-three-portal-block"
	);
}

let sky;
if(document.querySelectorAll('three-sky-block').length > 0) {
	sky = document.querySelectorAll('three-sky-block');
} else {
	sky = document.querySelectorAll(".three-object-three-app-sky-block");
}

let imagesToAdd;
if(document.querySelectorAll('three-image-block').length > 0) {
	imagesToAdd = document.querySelectorAll('three-image-block');
} else {
	imagesToAdd = document.querySelectorAll(
		".three-object-three-app-image-block"
	);
}

let spawnToAdd;
if(document.querySelectorAll('three-spawn-point-block').length > 0) {
	spawnToAdd = document.querySelectorAll('three-spawn-point-block');
} else {
	spawnToAdd = document.querySelectorAll(
		".three-object-three-app-spawn-point-block"
	);
}

let videosToAdd;
if(document.querySelectorAll('three-video-block').length > 0) {
	videosToAdd = document.querySelectorAll('three-video-block');
} else {
	videosToAdd = document.querySelectorAll(".three-object-three-app-video-block");
}

let audiosToAdd;
if(document.querySelectorAll('three-audio-block').length > 0) {
	audiosToAdd = document.querySelectorAll('three-audio-block');
} else {
	audiosToAdd = document.querySelectorAll(
		".three-object-three-app-audio-block"
	);
}

let lightsToAdd;
if(document.querySelectorAll('three-light-block').length > 0) {
	lightsToAdd = document.querySelectorAll('three-light-block');
} else {
	lightsToAdd = document.querySelectorAll(
		".three-object-three-app-light-block"
	);
}

// All blocks.
if(threeApp[0]){
	window.threeApp = threeApp[0].querySelectorAll("div");
}

threeApp.forEach((threeApp) => {
	if (threeApp) {
		const hdr = document.querySelector(
			"p.three-object-block-hdr"
		)? document.querySelector(
			"p.three-object-block-hdr"
			).innerText : "";
		let spawnPoint;
		let spawnPointX;
		let spawnPointY;
		let spawnPointZ;
		let spawnPointRotationX;
		let spawnPointRotationY;
		let spawnPointRotationZ;
		let savedPoint = spawnToAdd[0];
		if(savedPoint?.tagName.toLowerCase() === 'three-spawn-point-block') {
			spawnPointX = savedPoint.getAttribute('positionX');
			spawnPointY = savedPoint.getAttribute('positionY');
			spawnPointZ = savedPoint.getAttribute('positionZ');
			spawnPointRotationX = savedPoint.getAttribute('rotationX');
			spawnPointRotationY = savedPoint.getAttribute('rotationY');
			spawnPointRotationZ = savedPoint.getAttribute('rotationZ');
			spawnPoint = [
				spawnPointX ? spawnPointX : 0,
				spawnPointY ? spawnPointY : 0,
				spawnPointZ ? spawnPointZ : 0,
		  ];
		} else {
			spawnPointX = spawnToAdd[0].querySelector( "p.spawn-point-block-positionX" );
			spawnPointY = spawnToAdd[0].querySelector( "p.spawn-point-block-positionY" );
			spawnPointZ = spawnToAdd[0].querySelector( "p.spawn-point-block-positionZ" );
			spawnPointRotationX = spawnToAdd[0].querySelector( "p.spawn-point-block-rotationX" );
			spawnPointRotationY = spawnToAdd[0].querySelector( "p.spawn-point-block-rotationY" );
			spawnPointRotationZ = spawnToAdd[0].querySelector( "p.spawn-point-block-rotationZ" );
			spawnPoint = [
				spawnPointX ? spawnPointX.innerText : 0,
				spawnPointY ? spawnPointY.innerText : 0,
				spawnPointZ ? spawnPointZ.innerText : 0,
		  	];
		}

		let threeUrl, threePreviewImage, deviceTarget, backgroundColor, zoom, scale, hasZoom, hasTip, positionY, rotationY, animations;	
		if(threeApp.tagName.toLowerCase() === 'three-environment-block') {
			threeUrl = threeApp.getAttribute('threeObjectUrl');
			threePreviewImage = threeApp.getAttribute('threePreviewImage');
			deviceTarget = threeApp.getAttribute('deviceTarget');
			backgroundColor = threeApp.getAttribute('bg_color');
			zoom = threeApp.getAttribute('zoom');
			scale = threeApp.getAttribute('scale');
			hasZoom = threeApp.getAttribute('hasZoom');
			hasTip = threeApp.getAttribute('hasTip');
			positionY = threeApp.getAttribute('positionY');
			rotationY = threeApp.getAttribute('rotationY');
			animations = threeApp.getAttribute('animations');	
		} else {
			threeUrl = threeApp.querySelector("p.three-object-block-url")
				? threeApp.querySelector("p.three-object-block-url").innerText
				: "";
			threePreviewImage = threeApp.querySelector(
				"p.three-object-preview-image"
			)
				? threeApp.querySelector("p.three-object-preview-image").innerText
				: "";
			deviceTarget = threeApp.querySelector(
				"p.three-object-block-device-target"
			)
				? threeApp.querySelector("p.three-object-block-device-target")
						.innerText
				: "2D";
			backgroundColor = threeApp.querySelector(
				"p.three-object-background-color"
			)
				? threeApp.querySelector("p.three-object-background-color")
						.innerText
				: "#ffffff";
			zoom = threeApp.querySelector("p.three-object-zoom")
				? threeApp.querySelector("p.three-object-zoom").innerText
				: 90;
			scale = threeApp.querySelector("p.three-object-scale")
				? threeApp.querySelector("p.three-object-scale").innerText
				: 1;
			hasZoom = threeApp.querySelector("p.three-object-has-zoom")
				? threeApp.querySelector("p.three-object-has-zoom").innerText
				: false;
			hasTip = threeApp.querySelector("p.three-object-has-tip")
				? threeApp.querySelector("p.three-object-has-tip").innerText
				: true;
			positionY = threeApp.querySelector("p.three-object-position-y")
				? threeApp.querySelector("p.three-object-position-y").innerText
				: 0;
			rotationY = threeApp.querySelector("p.three-object-rotation-y")
				? threeApp.querySelector("p.three-object-rotation-y").innerText
				: 0;
			animations = threeApp.querySelector("p.three-object-animations")
				? threeApp.querySelector("p.three-object-animations").innerText
				: "";
		}

		render(
			<>
				{ ( networkingBlock.length > 0 ) && (
					<>
						<div id="networking" class="threeov-networking-controls">
							{/* <div id="session-id">Room: </div> */}
							{/* <p>Peers</p> */}
							{/* <div id="peers"></div> */}
							{/* <p>Messages</p> */}
							<div id="messages" style={{display: "none"}}></div>
							<div id="network-ui-container" style={{display: "flex"}}>
								<button class="button" id="audio-button">
									<span style={{fontSize: "0.6em", display:"block" }}>JOIN</span>
									<span>VOICE</span>
								</button>
							</div>
							<div id="room-dropdown"></div>
							<div id="videos"></div>
						</div>
						<Networking
								postSlug={postSlug}
								userData={userData}
						/>
					</>
				)
				}
					<EnvironmentFront
						threeUrl={threeUrl}
						deviceTarget={deviceTarget}
						zoom={zoom}
						scale={scale}
						hasTip={hasTip}
						hasZoom={hasZoom}
						positionY={positionY}
						rotationY={rotationY}
						animations={animations}
						backgroundColor={backgroundColor}
						userData={userData}
						postSlug={postSlug}
						defaultAvatarAnimation={defaultAvatarAnimation}
						networkingBlock={networkingBlock}
						modelsToAdd={modelsToAdd}
						portalsToAdd={portalsToAdd}
						imagesToAdd={imagesToAdd}
						videosToAdd={videosToAdd}
						audiosToAdd={audiosToAdd}
						lightsToAdd={lightsToAdd}
						spawnPoint={spawnPoint ? spawnPoint : null}
						textToAdd={textToAdd}
						npcsToAdd={npcsToAdd}
						sky={sky ? sky : ""}
						previewImage={threePreviewImage}
						hdr ={hdr ? hdr : ""}
					/>
			</>,
			threeApp
		);
	}
});

threeObjectViewerBlocks.forEach((threeApp) => {
	let threeUrl, deviceTarget, backgroundColor, zoom, scale, hasZoom, hasTip, positionY, rotationY, animations;
	if (threeApp) {
		if(threeApp.tagName.toLowerCase() === 'three-object-viewer-block') {
			deviceTarget = threeApp.getAttribute('device-target');
			threeUrl = threeApp.getAttribute('three-object-url');
			scale = threeApp.getAttribute('scale');
			backgroundColor = threeApp.getAttribute('bg-color');
			zoom = threeApp.getAttribute('zoom');
			hasZoom = threeApp.getAttribute('has-zoom');
			hasTip = threeApp.getAttribute('has-tip');
			positionY = threeApp.getAttribute('position-y');
			rotationY = threeApp.getAttribute('rotation-y');
			animations = threeApp.getAttribute('animations');	
		} else {
			threeUrl = threeApp.querySelector("p.three-object-block-url")
				? threeApp.querySelector("p.three-object-block-url").innerText
				: "";
			deviceTarget = threeApp.querySelector(
				"p.three-object-block-device-target"
			)
				? threeApp.querySelector("p.three-object-block-device-target")
						.innerText
				: "2D";
			backgroundColor = threeApp.querySelector(
				"p.three-object-background-color"
			)
				? threeApp.querySelector("p.three-object-background-color")
						.innerText
				: "#ffffff";
			zoom = threeApp.querySelector("p.three-object-zoom")
				? threeApp.querySelector("p.three-object-zoom").innerText
				: 90;
			scale = threeApp.querySelector("p.three-object-scale")
				? threeApp.querySelector("p.three-object-scale").innerText
				: 1;
			hasZoom = threeApp.querySelector("p.three-object-has-zoom")
				? threeApp.querySelector("p.three-object-has-zoom").innerText
				: false;
			hasTip = threeApp.querySelector("p.three-object-has-tip")
				? threeApp.querySelector("p.three-object-has-tip").innerText
				: true;
			positionY = threeApp.querySelector("p.three-object-position-y")
				? threeApp.querySelector("p.three-object-position-y").innerText
				: 0;
			rotationY = threeApp.querySelector("p.three-object-rotation-y")
				? threeApp.querySelector("p.three-object-rotation-y").innerText
				: 0;
			animations = threeApp.querySelector("p.three-object-animations")
				? threeApp.querySelector("p.three-object-animations").innerText
				: "";
		}
		render(
			<ThreeObjectFront
				threeObjectPlugin={threeObjectPlugin}
				defaultAvatarAnimation={defaultAvatarAnimation}
				threeUrl={threeUrl}
				deviceTarget={deviceTarget}
				zoom={zoom}
				scale={scale}
				hasTip={hasTip}
				hasZoom={hasZoom}
				positionY={positionY}
				rotationY={rotationY}
				animations={animations}
				backgroundColor={backgroundColor}
			/>,
			threeApp
		);
	}
});

