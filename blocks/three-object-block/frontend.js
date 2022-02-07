const { Component, render } = wp.element;

import ThreeObjectFront from "./ThreeObjectFront";  

const threeApp = document.querySelector(
  ".three-object-three-app"
);

if ( threeApp ){
  const threeUrl = threeApp.querySelector("p.three-object-block-url").innerText;
  const deviceTarget = threeApp.querySelector("p.three-object-block-device-target").innerText;
  const backgroundColor = threeApp.querySelector("p.three-object-background-color").innerText;
  const zoom = threeApp.querySelector("p.three-object-zoom").innerText;
  const scale = threeApp.querySelector("p.three-object-scale").innerText;
  const hasZoom = threeApp.querySelector("p.three-object-has-zoom").innerText;
  const hasTip = threeApp.querySelector("p.three-object-has-tip").innerText;
  const positionY = threeApp.querySelector("p.three-object-position-y").innerText;
  const rotationY = threeApp.querySelector("p.three-object-rotation-y").innerText;

  render(
      <ThreeObjectFront
      threeUrl={threeUrl}
      deviceTarget={deviceTarget}
      zoom={zoom}
      scale={scale}
      hasTip={hasTip}
      hasZoom={hasZoom}
      positionY={positionY}
      rotationY={rotationY}
      backgroundColor={backgroundColor}/>,
      threeApp
  );
}