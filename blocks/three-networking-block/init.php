<?php

/**
 * Register environment block
 */
add_action('init', function () {
    if( file_exists(dirname(__FILE__, 3). "/build/block-environment.asset.php") ) {
        // if the 3ov multiplayer worker option is sset, register the multiplayer block
        if( get_option( '3ov_mp_multiplayerWorker' ) && get_option( '3ov_mp_multiplayerWorker' ) !== '' ) {
            $result = register_block_type_from_metadata( __DIR__, [
                'title'           => _x( 'Multiplayer Environment Block', 'block title', 'three-object-viewer' ),
                'description'     => _x( 'A 3D multiplayer environment component', 'block description', 'three-object-viewer' ),
            ] );
        }
    }
});
