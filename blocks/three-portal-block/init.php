<?php

/**
 * Register environment block
 */
add_action('init', function () {
    if( file_exists(dirname(__FILE__, 3). "/build/block-three-portal-block.asset.php") ) {
        register_block_type_from_metadata(__DIR__);
    }
});
