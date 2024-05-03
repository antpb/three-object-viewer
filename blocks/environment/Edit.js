import { __ } from "@wordpress/i18n";
import React, { useState, useEffect } from "react";
import "./editor.scss";
import {
	useBlockProps,
	ColorPalette,
	InspectorControls,
	MediaUpload,
	InnerBlocks
} from "@wordpress/block-editor";
import { useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

import {
	Panel,
	PanelBody,
	PanelRow,
	RangeControl,
	ToggleControl,
	SelectControl,
	TextControl,
	DropZone
} from "@wordpress/components";
import { Icon, moveTo, more, rotateLeft, resizeCornerNE } from "@wordpress/icons";
import * as THREE from "three";
import defaultEnvironment from "../../inc/assets/default_grid.glb";
import ThreeObjectEdit from "./components/ThreeObjectEdit";
import { EditorPluginProvider, useEditorPlugins, EditorPluginContext } from './components/EditorPluginProvider';  // Import the PluginProvider

export default function Edit({ attributes, setAttributes, isSelected, clientId }) {
	const ALLOWED_BLOCKS = allowed_blocks;
	const [focusPosition, setFocusPosition] = useState(new THREE.Vector3());
	const [focusPoint, setFocus] = useState(new THREE.Vector3());
	const [mainModel, setMainModel] = useState(attributes.threeObjectUrl ? attributes.threeObjectUrl : (defaultEnvironment));
	const changeFocusPoint = (newValue) => {
		setFocusPosition(newValue);
	}

	// useEffect to initialize the value of the threeObjectUrl attribute if it is not set
	useEffect(() => {
		if (!attributes.threeObjectUrl) {
			setAttributes({ threeObjectUrl: (defaultEnvironment) });
		}
	}, []);
	const removeHDR = (imageObject) => {
		setAttributes({ hdr: null });
	};

	const onChangeAnimations = (animations) => {
		setAttributes({ animations });
	};

	const onImageSelect = (imageObject) => {
		setAttributes({ threeObjectUrl: null });
		setMainModel(null);
		setMainModel(imageObject.url);
		setAttributes({ threeObjectUrl: imageObject.url });
	};

	const onPreviewImageSelect = (imageObject) => {
		setAttributes({ threePreviewImage: null });
		setAttributes({ threePreviewImage: imageObject.url });
	};

	const onHDRImageSelect = (imageObject) => {
		setAttributes({ hdr: null });
		setAttributes({ hdr: imageObject.url });
	};

	const onChangePositionY = (posy) => {
		setAttributes({ positionY: posy });
	};

	const onChangeScale = (scale) => {
		setAttributes({ scale });
	};

	const onChangerotationY = (rotz) => {
		setAttributes({ rotationY: rotz });
	};

	const setDeviceTarget = (target) => {
		setAttributes({ deviceTarget: target });
	};

	const setCamCollisions = (collisions) => {
		setAttributes({ camCollisions: collisions });
	};
		

	const [enteredURL, setEnteredURL] = useState("");

	const { mediaUpload } = wp.editor;

	const ALLOWED_MEDIA_TYPES = [
		"model/gltf-binary",
		"application/octet-stream"
	];

	const HDR = [
		"image/vnd.radiance"
	];

	const TEMPLATE = [            
		['three-object-viewer/spawn-point-block', { positionX: "0", positionY: "1.3", positionZ: "-5", rotationX: "0", rotationY: "0", rotationZ: "0"}],
	];	  

	const MyDropZone = () => {
		const [hasDropped, setHasDropped] = useState(false);
		return (
			<div>
				{hasDropped ? "Dropped!" : "Drop a glb here or"}
				<DropZone
					onFilesDrop={(files) =>
						mediaUpload({
							allowedTypes: ALLOWED_MEDIA_TYPES,
							filesList: files,
							onFileChange: ([images]) => {
								onImageSelect(images);
							}
						})
					}
				/>
			</div>
		);
	};
    // "name": "three-object-viewer/model-block",
    // "attributes": {
    //     "scaleX": {
    //         "type": "int",
    //         "default":1
    //     },
    //     "name": {
    //         "type": "string"
    //     },
    //     "scaleY": {
    //         "type": "int",
    //         "default":1
    //     },
    //     "scaleZ": {
    //         "type": "int",
    //         "default":1
    //     },
    //     "positionX": {
    //         "type": "int",
    //         "default":0
    //     },
    //     "positionY": {
    //         "type": "int",
    //         "default":0
    //     },
    //     "positionZ": {
    //         "type": "int",
    //         "default":0
    //     },
    //     "rotationX": {
    //         "type": "int",
    //         "default":0
    //     },
    //     "rotationY": {
    //         "type": "int",
    //         "default":0
    //     },
    //     "rotationZ": {
    //         "type": "int",
    //         "default":0
    //     },
    //     "threeObjectUrl": {
    //         "type": "string",
    //         "default": null
    //     },
    //     "animations": {
    //         "type": "string",
    //         "default": ""
    //     },
    //     "alt": {
    //         "type": "string",
    //         "default": ""
    //     },
    //     "collidable": {
    //         "type": "boolean",
    //         "default": false
    //     }
    // },
    // "category": "spatial",
    // "parent":  [ "three-object-viewer/environment" ],
	const { insertBlock } = useDispatch('core/block-editor');

	const handleDrop = (e) => {
		e.dataTransfer.dropEffect = 'copy';
		const fileUrl = e.dataTransfer.getData('text');
		console.log('event', fileUrl);
		e.preventDefault();
		e.stopPropagation();
	
		// Create a new block based on the dropped URL
		const newBlock = createBlock('three-object-viewer/model-block', {
			threeObjectUrl: fileUrl,
		});
	
		// Insert the new block as an inner block
		insertBlock(newBlock, undefined, clientId);
	  };

	return (
		<div {...useBlockProps()}>
			<InspectorControls key="setting">
				<Panel
					className="three-object-environment-edit-container three-object-viewer-edit-panel"
					header={ __( "Environment Settings", "three-object-viewer" ) }
				>
					<PanelBody
						title={ __( 'Environment Object (Changing this value changes your scene ground planes)', 'three-object-viewer' ) }
						icon={more}
						initialOpen={true}
					>
						<PanelRow>
							<span>
							{__( "Select a glb file from your media library. This will be treated as a collidable mesh that visitors can walk on:", "three-object-viewer" )}
							</span>
						</PanelRow>
						<PanelRow>
							<MediaUpload
								onSelect={(imageObject) =>
									onImageSelect(imageObject)
								}
								type="image"
								label="GLB File"
								allowedTypes={ALLOWED_MEDIA_TYPES}
								value={attributes.threeObjectUrl}
								render={({ open }) => (
									<button onClick={open}>
										{attributes.threeObjectUrl
											? __( "Replace Environment", "three-object-viewer" )
											: __( "Select Environment", "three-object-viewer" ) }
									</button>
								)}
							/>
						</PanelRow>
						<PanelRow>
							<button onClick={() => setAttributes({ threeObjectUrl: null })}>
								{ __( 'Remove Environment', 'three-object-viewer' ) }
							</button>
						</PanelRow>
						<PanelRow>
							<span>
								{__( "Select an image to be used as the preview image:", "three-object-viewer" )}
							</span>
						</PanelRow>
						<PanelRow>
							{attributes.threePreviewImage && (
								<span>
									<img
										alt="Preview"
										src={
											attributes.threePreviewImage
												? attributes.threePreviewImage
												: ""
										}
										style={{
											maxHeight: "150px"
										}}
									/>
								</span>
							)}
						</PanelRow>
						<PanelRow>
							<MediaUpload
								onSelect={(imageObject) =>
									onPreviewImageSelect(imageObject)
								}
								type="image"
								label="Image File"
								// allowedTypes={ ALLOWED_MEDIA_TYPES }
								value={attributes.threePreviewImage}
								render={({ open }) => (
									<button onClick={open}>
										{attributes.threePreviewImage
											? __( "Replace Image", "three-object-viewer" )
											: __( "Select Image", "three-object-viewer" ) }
									</button>
								)}
							/>
						</PanelRow>
						<PanelRow>
							{attributes.hdr && (<span>
								{ attributes.hdr }
							</span>)}
						</PanelRow>
						<PanelRow>
							<span>
								{__( "Use an .hdr to give your scene a HDR image to use as the environment. This influences lighting and reflections.", "three-object-viewer" )}
							</span>
						</PanelRow>
						<PanelRow>
							<MediaUpload
								onSelect={(imageObject) =>
									onHDRImageSelect(imageObject)
								}
								type="image"
								label="HDR Image"
								allowedTypes={ HDR }
								value={attributes.hdr}
								render={({ open }) => (
									<>
										<button onClick={open}>
											{attributes.hrd
												? __( "Replace HDR", "three-object-viewer" )
												: __( "Select HDR", "three-object-viewer" ) }
										</button>
										{attributes.hdr && (
											<button onClick={removeHDR}>		
													{ __( 'Remove HDR', 'three-object-viewer' ) }
											</button>
										)}
									</>											
								)}
							/>
						</PanelRow>
					</PanelBody>
					<PanelBody
						title={__( "Scene Settings", "three-object-viewer" )}
						icon={more}
						initialOpen={true}
					>
						<PanelRow>
							<span>{ __( "Device Target Type:", "three-object-viewer" ) }</span>
						</PanelRow>
						<PanelRow>
							<SelectControl
								// label="Device Target"
								value={attributes.deviceTarget}
								options={[{ label: "VR", value: "vr" }]}
								onChange={(target) => setDeviceTarget(target)}
							/>
						</PanelRow>
						<PanelRow>
						<span>{ __( "Camera Collisions:", "three-object-viewer" ) }</span>
						</PanelRow>
						<PanelRow>
							<ToggleControl
									label={ __( "Camera Collisions will avoid the camera from going out of view of the player. Disable this setting if you are noticing frame rate dips.", 'three-object-viewer' ) }
									help={
										attributes.camCollisions
											? __( "Camera is currently collidable. May impact performance.", 'three-object-viewer' )
											: __( "Camera is not collidable.", 'three-object-viewer' )
									}
									checked={attributes.camCollisions}
									onChange={(e) => {
										setCamCollisions(e);
									}}
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								label={ __( "Loop Animations", "three-object-viewer" ) }
								help={ __( "Separate each animation name you wish to loop with a comma", "three-object-viewer" ) }
								value={attributes.animations}
								onChange={(value) => onChangeAnimations(value)}
							/>
						</PanelRow>
						<PanelRow className="wide-slider">
							<RangeControl
								label={ __( "Scale", "three-object-viewer" ) }
								value={attributes.scale}
								min={0}
								max={200}
								onChange={onChangeScale}
							/>
						</PanelRow>
						<PanelRow className="wide-slider">
							<RangeControl
								label={ __( "Position Y", "three-object-viewer" ) }
								value={attributes.positionY}
								min={-100}
								max={100}
								step={0.01}
								onChange={onChangePositionY}
							/>
						</PanelRow>
						<PanelRow className="wide-slider">
							<RangeControl
								label={ __( "Rotation Y", "three-object-viewer" ) }
								value={attributes.rotationY}
								min={-10}
								max={10}
								step={0.001}
								onChange={onChangerotationY}
							/>
						</PanelRow>
					</PanelBody>
				</Panel>
			</InspectorControls>
				<>
				<div
					className="threeov-block-list-container"
					style={{
						height: "100%",
						maxWidth: "220px",
						width: "220px",
						overflowY: "scroll",
						position: "absolute",
						top: "0px",
						left: "0px",
						zIndex: "1",
						// background: "linear-gradient(180deg, #23192adb 0%, #23192a3b 100%)",
						borderRight: "3px solid #ffffff1f",
					}}
				>
					<DropZone onDrop={handleDrop} />

					<InnerBlocks
						renderAppender={ InnerBlocks.ButtonBlockAppender }
						allowedBlocks={ALLOWED_BLOCKS}
						template={TEMPLATE}
					/>
				</div>
					{mainModel && (
						<>
							<EditorPluginProvider>
								<ThreeObjectEdit
									url={mainModel}
									hdr={attributes.hdr}
									deviceTarget={attributes.deviceTarget}
									backgroundColor={attributes.bg_color}
									zoom={attributes.zoom}
									scale={attributes.scale}
									hasZoom={attributes.hasZoom}
									hasTip={attributes.hasTip}
									positionX={attributes.positionX}
									positionY={attributes.positionY}
									animations={attributes.animations}
									camCollisions={attributes.camCollisions ? attributes.camCollisions : true}
									rotationY={attributes.rotationY}
									setFocusPosition={setFocusPosition}
									setFocus={setFocus}
									changeFocusPoint={changeFocusPoint}
									focusPosition={focusPosition}
									focusPoint={focusPoint}
									selected={isSelected}
								/>
							</EditorPluginProvider>
						</>
					)}
				</>
		</div>
	);
}
