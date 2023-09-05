import React, { useEffect } from 'react';
import { Reflector } from 'three/examples/jsm/objects/Reflector';
import { PlaneGeometry, Color } from "three";

function ThreeMirrorBlockRender() {
	const mirror = new Reflector(
		new PlaneGeometry(10, 10),
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

	return (
		<group
			position={[0, 0, 0]}
			rotation={[0, 0, 0]}
			scale={[1, 1, 1]}
		>
			<primitive object={mirror} />
		</group>
	)
}

window.addEventListener('registerFrontPluginReady', function() {
  window.registerFrontPlugin(<ThreeMirrorBlockRender />);
});
