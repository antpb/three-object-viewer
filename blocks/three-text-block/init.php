<?php

/**
 * Register environment block
 */
add_action('init', function () {
    if( file_exists(dirname(__FILE__, 3). "/build/block-three-text-block.asset.php") ) {
        $result = register_block_type_from_metadata( __DIR__, [
            'title'           => _x( 'Text Block', 'block title', 'three-object-viewer' ),
            'description'     => _x( 'A 3D Text Block', 'block description', 'three-object-viewer' ),
        ] );
    }
});
