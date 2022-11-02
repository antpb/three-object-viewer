import { __ } from '@wordpress/i18n';
import React, { useState } from 'react';
import { DropZone } from '@wordpress/components';
import './editor.scss';
import {
	useBlockProps,
	ColorPalette,
	InspectorControls,
	MediaUpload,
} from '@wordpress/block-editor';
import {
	Panel,
	PanelBody,
	PanelRow,
	RangeControl,
	ToggleControl,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { more } from '@wordpress/icons';

export default function Edit( { attributes, setAttributes, isSelected } ) {

	const onChangePositionX = ( positionX ) => {
		setAttributes( { positionX: positionX } );
	};
	const onChangePositionY = ( positionY ) => {
		setAttributes( { positionY: positionY } );
	};
	const onChangePositionZ = ( positionZ ) => {
		setAttributes( { positionZ: positionZ } );
	};
	const onChangeRotationX = ( rotationX ) => {
		setAttributes( { rotationX: rotationX } );
	};
	const onChangeRotationY = ( rotationY ) => {
		setAttributes( { rotationY: rotationY } );
	};
	const onChangeRotationZ = ( rotationZ ) => {
		setAttributes( { rotationZ: rotationZ } );
	};
  
	return (
		<div { ...useBlockProps() }>
			<InspectorControls key="setting">
				<Panel header="Settings">
					<PanelBody
						title="Spawn Point"
						icon={ more }
						initialOpen={ true }
					>
						<PanelRow>
							<TextControl
								className="position-inputs"
								label="X"
								// help="position x"
								value={ attributes.positionX }
								onChange={ ( value ) =>
									onChangePositionX( value )
								}
							/>
							<TextControl
								className="position-inputs"
								label="Y"
								// help="position y"
								value={ attributes.positionY }
								onChange={ ( value ) =>
									onChangePositionY( value )
								}
							/>
							<TextControl
								className="position-inputs"
								label="Z"
								// help="position z"
								value={ attributes.positionZ }
								onChange={ ( value ) =>
									onChangePositionZ( value )
								}
							/>
						</PanelRow>
						<PanelRow>                            
							<legend className="blocks-base-control__label">
                                { __( 'Rotation', 'three-object-viewer' ) }
                            </legend>
						</PanelRow>
						<PanelRow>
							<TextControl
								className="position-inputs"
								label="X"
								// help="position x"
								value={ attributes.rotationX }
								onChange={ ( value ) =>
									onChangeRotationX( value )
								}
							/>
							<TextControl
								className="position-inputs"
								label="Y"
								// help="position y"
								value={ attributes.rotationY }
								onChange={ ( value ) =>
									onChangeRotationY( value )
								}
							/>
							<TextControl
								className="position-inputs"
								label="Z"
								// help="position z"
								value={ attributes.rotationZ }
								onChange={ ( value ) =>
									onChangeRotationZ( value )
								}
							/>
						</PanelRow>
					</PanelBody>
				</Panel>
			</InspectorControls>
				<>
				<div className="three-object-viewer-inner">
				<div className="three-object-viewer-inner-edit-container">
					<svg
						class="custom-icon custom-icon-cube"
						viewBox="0 0 40 40"
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
					>
						<g transform="matrix(1,0,0,1,-1.1686,0.622128)">
							<path d="M37.485,28.953L21.699,38.067L21.699,19.797L37.485,10.683L37.485,28.953ZM21.218,19.821L21.218,38.065L5.435,28.953L5.435,10.709L21.218,19.821ZM37.207,10.288L21.438,19.392L5.691,10.301L21.46,1.197L37.207,10.288Z" />
						</g>
					</svg>
					<p><b>Spawn Point</b></p>
				</div>
				</div>
				</>
		</div>
	);
}
