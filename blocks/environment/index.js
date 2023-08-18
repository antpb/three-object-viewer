import { registerBlockType } from "@wordpress/blocks";
import Edit from "./Edit";
import Save from "./Save";
import { useBlockProps } from "@wordpress/block-editor";
import { useCommand } from '@wordpress/commands';
import { registerPlugin } from '@wordpress/plugins';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import React, { Suspense, useRef, useMemo } from "react";


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

const QuickCommand = () => {

	// Get the current post type
	const postType = wp.data.select("core/editor").getCurrentPostType();

	// Get the post type object
	const postTypeObject = wp.data.select("core").getPostType(postType);

	// If post type does not support thumbnails, exit.
	if ( postTypeObject?.supports && ! postTypeObject?.supports.thumbnail) {
		return null;
	}

	const { hasBlocks } = useSelect( ( select ) => {
        return {
            hasBlocks: select( 'core/block-editor' ).getBlockCount() > 0,
        };
    }, [] );

	const { selectedBlock } = useSelect( ( select ) => {
        return {
            selectedBlock: select('core/block-editor').getSelectedBlock(),
        };
    }, [] );
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const shouldPrependBlock = urlParams.get('prepend_block');

        if (shouldPrependBlock === 'three-object-viewer' && !hasBlocks) {
			const postContent = `
			<!-- wp:three-object-viewer/environment -->
			<div class="wp-block-three-object-viewer-environment alignfull">
				<div class="three-object-three-app-environment">
					<p class="three-object-block-device-target">vr</p><p class="three-object-block-url"></p><p class="three-object-scale">1</p><p class="three-object-background-color"></p><p class="three-object-zoom"></p><p class="three-object-has-zoom">0</p><p class="three-object-has-tip">0</p><p class="three-object-position-y">0</p><p class="three-object-rotation-y">0</p><p class="three-object-scale">1</p><p class="three-object-preview-image"></p><p class="three-object-animations"></p>
				</div>
			</div>
			<!-- /wp:three-object-viewer/environment -->
			`;
		
			// Use postContent in your command's callback:
			wp.data.dispatch('core/editor').editPost({
				title: 'New World',
				content: postContent,
				status: 'draft'
			});
        }
    }, []);

	useCommand({
		name: 'create-post-with-environment-block',
		label: 'Add 3D World',
		icon: icon,
		callback: () => {
			document.location.href = 'post-new.php?post_type=post&prepend_block=three-object-viewer';
		},
		context: 'block-editor',
	});

	return null;
}

registerPlugin( 'quick-action', { render: QuickCommand } );

const blockConfig = require("./block.json");
registerBlockType(blockConfig.name, {
	...blockConfig,
	icon,
	apiVersion: 2,
	edit: Edit,
	save: Save,
	deprecated: [
		{
			attributes: {
				bg_color: {
					type: "string",
					default: "#FFFFFF"
				},
				zoom: {
					type: "integer",
					default: 90
				},
				scale: {
					type: "integer",
					default: 1
				},
				positionX: {
					type: "integer",
					default: 0
				},
				positionY: {
					type: "integer",
					default: 0
				},
				rotationY: {
					type: "integer",
					default: 0
				},
				threeObjectUrl: {
					type: "string",
					default: null
				},
				hasZoom: {
					type: "bool",
					default: false
				},
				hasTip: {
					type: "bool",
					default: true
				},
				deviceTarget: {
					type: "string",
					default: "2d"
				}
			},
			save(props) {
				return (
					<div {...useBlockProps.save()}>
						<>
							<div className="three-object-three-app">
								<p className="three-object-block-device-target">
									{props.attributes.deviceTarget}
								</p>
								<p className="three-object-block-url">
									{props.attributes.threeObjectUrl}
								</p>
								<p className="three-object-scale">
									{props.attributes.scale}
								</p>
								<p className="three-object-background-color">
									{props.attributes.bg_color}
								</p>
								<p className="three-object-zoom">
									{props.attributes.zoom}
								</p>
								<p className="three-object-has-zoom">
									{props.attributes.hasZoom ? 1 : 0}
								</p>
								<p className="three-object-has-tip">
									{props.attributes.hasTip ? 1 : 0}
								</p>
								<p className="three-object-position-y">
									{props.attributes.positionY}
								</p>
								<p className="three-object-rotation-y">
									{props.attributes.rotationY}
								</p>
								<p className="three-object-scale">
									{props.attributes.scale}
								</p>
							</div>
						</>
					</div>
				);
			}
		},
		{
			attributes: {
				bg_color: {
					type: "string",
					default: "#FFFFFF"
				},
				zoom: {
					type: "integer",
					default: 90
				},
				scale: {
					type: "integer",
					default: 1
				},
				positionX: {
					type: "integer",
					default: 0
				},
				positionY: {
					type: "integer",
					default: 0
				},
				rotationY: {
					type: "integer",
					default: 0
				},
				threeObjectUrl: {
					type: "string",
					default: null
				},
				hasZoom: {
					type: "bool",
					default: false
				},
				hasTip: {
					type: "bool",
					default: true
				},
				deviceTarget: {
					type: "string",
					default: "2d"
				},
				animations: {
					type: "string",
					default: ""
				}
			},
			save(props) {
				return (
					<div {...useBlockProps.save()}>
						<>
							<div className="three-object-three-app">
								<p className="three-object-block-device-target">
									{props.attributes.deviceTarget}
								</p>
								<p className="three-object-block-url">
									{props.attributes.threeObjectUrl}
								</p>
								<p className="three-object-scale">
									{props.attributes.scale}
								</p>
								<p className="three-object-background-color">
									{props.attributes.bg_color}
								</p>
								<p className="three-object-zoom">
									{props.attributes.zoom}
								</p>
								<p className="three-object-has-zoom">
									{props.attributes.hasZoom ? 1 : 0}
								</p>
								<p className="three-object-has-tip">
									{props.attributes.hasTip ? 1 : 0}
								</p>
								<p className="three-object-position-y">
									{props.attributes.positionY}
								</p>
								<p className="three-object-rotation-y">
									{props.attributes.rotationY}
								</p>
								<p className="three-object-scale">
									{props.attributes.scale}
								</p>
								<p className="three-object-animations">
									{props.attributes.animations}
								</p>
							</div>
						</>
					</div>
				);
			}
		},
		{
			attributes: {
				align: {
					type: "string",
					default: "full"
				},  
				scale: {
					type: "integer",
					default: 1
				},
				positionX: {
					type: "integer",
					default: 0
				},
				positionY: {
					type: "integer",
					default: 0
				},
				rotationY: {
					type: "integer",
					default: 0
				},
				threeObjectUrl: {
					type: "string",
					default: null
				},
				threePreviewImage: {
					type: "string",
					default: null
				},
				deviceTarget: {
					type: "string",
					default: "vr"
				},
				animations: {
					type: "string",
					default: ""
				}
		},
		save(props) {
			return (
				<div {...useBlockProps.save()}>
					<>
						<div className="three-object-three-app-environment">
							<p className="three-object-block-device-target">
								{props.attributes.deviceTarget}
							</p>
							<p className="three-object-block-url">
								{props.attributes.threeObjectUrl}
							</p>
							<p className="three-object-scale">{props.attributes.scale}</p>
							<p className="three-object-background-color">
								{props.attributes.bg_color}
							</p>
							<p className="three-object-zoom">{props.attributes.zoom}</p>
							<p className="three-object-has-zoom">
								{props.attributes.hasZoom ? 1 : 0}
							</p>
							<p className="three-object-has-tip">
								{props.attributes.hasTip ? 1 : 0}
							</p>
							<p className="three-object-position-y">
								{props.attributes.positionY}
							</p>
							<p className="three-object-rotation-y">
								{props.attributes.rotationY}
							</p>
							<p className="three-object-scale">{props.attributes.scale}</p>
							<p className="three-object-preview-image">
								{props.attributes.threePreviewImage}
							</p>
							<p className="three-object-animations">
								{props.attributes.animations}
							</p>
						</div>
					</>
				</div>
			);
		}
		}
	]
});
