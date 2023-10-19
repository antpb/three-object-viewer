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

export default function Edit({ attributes, setAttributes, isSelected }) {
	const ALLOWED_BLOCKS = allowed_blocks;
	const [focusPosition, setFocusPosition] = useState(new THREE.Vector3());
	const [focusPoint, setFocus] = useState(new THREE.Vector3());
	const [mainModel, setMainModel] = useState(attributes.threeObjectUrl ? attributes.threeObjectUrl : (threeObjectPlugin + defaultEnvironment));
	const changeFocusPoint = (newValue) => {
		setFocusPosition(newValue);
	}

	// useEffect to initialize the value of the threeObjectUrl attribute if it is not set
	useEffect(() => {
		if (!attributes.threeObjectUrl) {
			setAttributes({ threeObjectUrl: (threeObjectPlugin + defaultEnvironment) });
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
							<span>
								{__( "Select an image to be used as the preview image:", "three-object-viewer" )}
							</span>
						</PanelRow>
						<PanelRow>
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
							<span>{ __( "Object Display Type:", "three-object-viewer" ) }</span>
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
				style={{
					height: "90vh",
					maxWidth: "220px",
					width: "220px",
					overflowY: "scroll",
					position: "absolute",
					top: "0px",
					left: "0px",
					zIndex: "1",
					backgroundColor: "#2a2a2a"
				}}
				>
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
