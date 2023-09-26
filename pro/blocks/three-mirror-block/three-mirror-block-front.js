import React, { useState, useEffect } from 'react';
import { Reflector } from 'three/examples/jsm/objects/Reflector';
import { PlaneGeometry, Color } from "three";

function ThreeMirrorBlockRender() {
	const [scaleX, setScaleX] = useState(null);
	const [scaleY, setScaleY]  = useState(null);
	const [scaleZ, setScaleZ]  = useState(null);
	const [positionX, setPositionX]  = useState(null);
	const [positionY, setPositionY]  = useState(null);
	const [positionZ, setPositionZ]  = useState(null);
	const [rotationX, setRotationX]  = useState(null);
	const [rotationY, setRotationY]  = useState(null);
	const [rotationZ, setRotationZ] = useState(null);
	const [height, setHeight] = useState(null);
	const [width, setWidth]  = useState(null);

    // console.log("hi from the front render", window.threeApp);
	useEffect(() => {
		window.threeApp.forEach((item) => {
			if (item.className === 	"three-mirror-block-scaleX"){
				setScaleX(Number(item.innerText));
			}
			if (item.className === 	"three-mirror-block-scaleY"){
				setScaleY(Number(item.innerText));
			}
			if (item.className === 	"three-mirror-block-scaleZ"){
				setScaleZ(Number(item.innerText));
			}
			if (item.className === 	"three-mirror-block-positionX"){
				setPositionX(Number(item.innerText));
			}
			if (item.className === "three-mirror-block-positionY"){
				setPositionY(Number(item.innerText));
			}
			if (item.className === 	"three-mirror-block-positionZ"){
				setPositionZ(Number(item.innerText));
			}
			if (item.className === "three-mirror-block-rotationX"){
				setRotationX(Number(item.innerText));
			}
			if (item.className === "three-mirror-block-rotationY"){
				setRotationY(Number(item.innerText));
			}
			if (item.className === "three-mirror-block-rotationZ"){
				setRotationZ(Number(item.innerText));
			}
			if (item.className === "three-mirror-block-height"){
				setHeight(Number(item.innerText));
			}
			if (item.className === "three-mirror-block-width"){
				setWidth(Number(item.innerText));
			}
		});
	}, []);  // The empty dependency array means this effect will only run once when the component mounts.



	const mirror = new Reflector(
		new PlaneGeometry(Number(height), Number(width)),
		{
		  color: new Color(0x7f7f7f),
		  textureWidth: window.innerWidth * window.devicePixelRatio,
		  textureHeight: window.innerHeight * window.devicePixelRatio
		}
	  );

	// Animation loop example.
	// useEffect(() => {
	// 	const animate = () => {
	// 	mirror.rotation.x += 0.01;
	// 	mirror.rotation.y += 0.01;
	// 	requestAnimationFrame(animate);
	// 	}
	// 	animate();
	// }, []);

	if ( positionX ) {
		return (
			<group
				position={[Number(positionX), Number(positionY), Number(positionZ)]}
				rotation={[Number(rotationX), Number(rotationY), Number(rotationZ)]}
				scale={[Number(scaleX), Number(scaleY), Number(scaleZ)]}
			>
				<primitive object={mirror} />
			</group>
		)	
	}
}

window.addEventListener('registerFrontPluginReady', function() {
  window.registerFrontPlugin(<ThreeMirrorBlockRender />);
});
