<?php

/**
 * Register mirror block
 */
add_action('init', function () {
    if( file_exists(dirname(__FILE__, 4). "/build/block-environment.asset.php") ) {
        register_block_type_from_metadata(__DIR__);
    }
});

// enqueue javascript on the post frontend. file in the same directory ./three-mirror-block-front.js
add_action( 'enqueue_block_assets', function () {
    wp_enqueue_script(
        'three-mirror-block-front',
        plugins_url( '../../../build/assets/js/blocks.three-mirror-block.js', __FILE__ ),
        array( 'wp-blocks', 'wp-element', 'wp-editor' )
    );
});