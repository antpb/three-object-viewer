import { registerBlockType } from "@wordpress/blocks";
import Edit from "./Edit";
import Save from "./Save";
import { useBlockProps } from "@wordpress/block-editor";
import React from "react";
import Deprecated from "./Deprecated";
import { useState } from '@wordpress/element';

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
const deprecated = Deprecated();
const blockConfig = require("./block.json");
registerBlockType(blockConfig.name, {
	...blockConfig,
	icon,
	apiVersion: 2,
	edit: Edit,
	save: Save,
	deprecated: deprecated
});
