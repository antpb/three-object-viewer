import { useState } from '@wordpress/element';
import { useCommand } from '@wordpress/commands';
import { registerPlugin } from '@wordpress/plugins';
import { image, external, plus } from '@wordpress/icons';
import { Modal, Button, TextControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

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

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const shouldPrependBlock = urlParams.get('prepend_block');

        if (shouldPrependBlock === 'three-object-viewer' && !hasBlocks) {
			const postContent = `
			<!-- wp:three-object-viewer/environment -->
			<div class="wp-block-three-object-viewer-environment alignfull"><div class="three-object-three-app-environment"><p class="three-object-block-device-target">vr</p><p class="three-object-block-url"></p><p class="three-object-scale">1</p><p class="three-object-background-color"></p><p class="three-object-zoom"></p><p class="three-object-has-zoom">0</p><p class="three-object-has-tip">0</p><p class="three-object-position-y">0</p><p class="three-object-rotation-y">0</p><p class="three-object-scale">1</p><p class="three-object-preview-image"></p><p class="three-object-animations"></p></div></div>
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
		icon: plus,
		callback: () => {
			document.location.href = 'post-new.php?post_type=post&prepend_block=three-object-viewer';
		},
		context: 'block-editor',
	});

	return null;
}
registerPlugin( 'quick-action', { render: QuickCommand } );

export default QuickCommand;