import { __ } from "@wordpress/i18n";
import React, { useState, useEffect } from "react";
import { DropZone } from "@wordpress/components";
import "./editor.scss";
import {
	useBlockProps,
	ColorPalette,
	InspectorControls,
	MediaUpload,
} from "@wordpress/block-editor";
import {
	Panel,
	PanelBody,
	PanelRow,
	RangeControl,
	ToggleControl,
	SelectControl,
	TextControl
} from "@wordpress/components";
import { more } from "@wordpress/icons";

export default function Edit({ attributes, setAttributes, isSelected, clientId }) {
	const { select, dispatch } = wp.data;

	useEffect(() => {
		if( isSelected ){
					dispatch( 'three-object-environment-events' ).setFocusEvent( clientId );
			}
	}, [isSelected]);

    const onChangeName = (name) => {
        setAttributes({ name });
    };

    const onChangePositionX = (positionX) => {
        setAttributes({ positionX });
    };
    const onChangePositionY = (positionY) => {
        setAttributes({ positionY });
    };
    const onChangePositionZ = (positionZ) => {
        setAttributes({ positionZ });
    };

    const onChangeType = (type) => {
        setAttributes({ type });
    };

	const onChangeColor = (color) => {
        setAttributes({ color });
    };
    const onChangeIntensity = (intensity) => {
        setAttributes({ intensity });
    };
    const onChangeDistance = (distance) => {
        setAttributes({ distance });
    };
    const onChangeDecay = (decay) => {
        setAttributes({ decay });
    };
    const onChangeAngle = (angle) => {
        setAttributes({ angle });
    };
    const onChangePenumbra = (penumbra) => {
        setAttributes({ penumbra });
    };
    const onChangeTargetX = (targetX) => {
        setAttributes({ targetX });
    };
    const onChangeTargetY = (targetY) => {
        setAttributes({ targetY });
    };
    const onChangeTargetZ = (targetZ) => {
        setAttributes({ targetZ });
    };

	return (
		<div {...useBlockProps()}>
			<InspectorControls key="setting">
				<Panel header="Settings">
					<PanelBody
						title="Light Object"
						icon={more}
						initialOpen={true}
					>
						<PanelRow>
							<legend className="blocks-base-control__label">
								{__("Position", "three-object-viewer")}
							</legend>
						</PanelRow>
						<PanelRow>
							<TextControl
								className="position-inputs"
								label="X"
								// help="position x"
								value={attributes.positionX}
								onChange={(value) => onChangePositionX(value)}
							/>
							<TextControl
								className="position-inputs"
								label="Y"
								// help="position y"
								value={attributes.positionY}
								onChange={(value) => onChangePositionY(value)}
							/>
							<TextControl
								className="position-inputs"
								label="Z"
								// help="position z"
								value={attributes.positionZ}
								onChange={(value) => onChangePositionZ(value)}
							/>
						</PanelRow>
						<PanelRow>
							<legend className="blocks-base-control__label">
								{__("Rotation", "three-object-viewer")}
							</legend>
						</PanelRow>
						<PanelRow>
							<TextControl
								className="position-inputs"
								label="X"
								// help="position x"
								value={attributes.rotationX}
								onChange={(value) => onChangeRotationX(value)}
							/>
							<TextControl
								className="position-inputs"
								label="Y"
								// help="position y"
								value={attributes.rotationY}
								onChange={(value) => onChangeRotationY(value)}
							/>
							<TextControl
								className="position-inputs"
								label="Z"
								// help="position z"
								value={attributes.rotationZ}
								onChange={(value) => onChangeRotationZ(value)}
							/>
						</PanelRow>
						<PanelRow>
						<ColorPalette
							// colors={ attributes.color }
							value={ attributes.color }
							onChange={ ( color ) => onChangeColor( color ) }
						/>
						</PanelRow>
						<PanelRow>
							<SelectControl
								label="Light Type"
								value={attributes.type}
								options={[
									{ label: "Point", value: "point" },
									{ label: "Spot", value: "spot" },
									{ label: "Ambient", value: "ambient" },
									{ label: "Directional", value: "directional" },
							]}
								onChange={(target) => onChangeType(target)}
							/>
						</PanelRow>
						<PanelRow>
							<RangeControl
								className="position-inputs"
								label="Intensity"
								// help="Unitless multiplier against original source volume for determining emitter loudness."
								max={10}
								min={0}
								step={0.01}
								// help="position x"
								value={attributes.intensity}
								onChange={(value) => onChangeIntensity(value)}
							/>
						</PanelRow>
						<PanelRow>
							<RangeControl
								className="position-inputs"
								label="Distance"
								// help="Unitless multiplier against original source volume for determining emitter loudness."
								max={1000}
								min={0.1}
								step={0.1}
								// help="position x"
								value={attributes.distance}
								onChange={(value) => onChangeDistance(value)}
							/>
						</PanelRow>
						<PanelRow>
							<RangeControl
								className="position-inputs"
								label="Decay"
								// help="Unitless multiplier against original source volume for determining emitter loudness."
								max={10}
								min={0}
								step={0.01}
								// help="position x"
								value={attributes.decay}
								onChange={(value) => onChangeDecay(value)}
							/>
						</PanelRow>
						<PanelRow>
							<RangeControl
								className="position-inputs"
								label="Angle"
								// help="Unitless multiplier against original source volume for determining emitter loudness."
								max={10}
								min={0}
								step={0.01}
								// help="position x"
								value={attributes.angle}
								onChange={(value) => onChangeAngle(value)}
							/>
						</PanelRow>
						<PanelRow>
							<RangeControl
								className="position-inputs"
								label="Penumbra"
								// help="Unitless multiplier against original source volume for determining emitter loudness."
								max={1}
								min={0}
								step={0.01}
								// help="position x"
								value={attributes.penumbra}
								onChange={(value) => onChangePenumbra(value)}
							/>
						</PanelRow>
					</PanelBody>
				</Panel>
			</InspectorControls>
			{isSelected ? (
				<>
					<div className="three-object-viewer-inner">
						<div className="three-object-viewer-inner-edit-container">
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
							<p>
								<b>Light Block</b>
							</p>
							{/* <p>URL: {attributes.threeObjectUrl}</p> */}
						</div>
					</div>
				</>
			) : (
				<>
					<div className="three-object-viewer-inner">
						<div className="three-object-viewer-inner-edit-container">
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
							<p>
								<b>Light Block</b>
							</p>
							{/* <p>URL: {attributes.threeObjectUrl}</p> */}
						</div>
					</div>
				</>
			)}
		</div>
	);
}
