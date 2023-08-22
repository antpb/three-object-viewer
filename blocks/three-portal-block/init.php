<?php

/**
 * Register environment block
 */
add_action('init', function () {
    if( file_exists(dirname(__FILE__, 3). "/build/block-three-portal-block.asset.php") ) {
        $result = register_block_type_from_metadata( __DIR__, [
            'title'           => _x( 'Portal Block', 'block title', 'three-object-viewer' ),
            'description'     => _x( 'A portal for traversal', 'block description', 'three-object-viewer' ),
        ] );
    }
});
