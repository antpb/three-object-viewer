<?php

/**
 * Register environment block
 */
add_action('init', function () {
    if( file_exists(dirname(__FILE__, 3). "/build/block-environment.asset.php") ) {
        $result = register_block_type_from_metadata( __DIR__, [
            'title'           => _x( '3D Networking Block', 'block title', 'three-object-viewer' ),
            'description'     => _x( 'A networking block for your environment.', 'block description', 'three-object-viewer' ),
        ] );
    }
});
