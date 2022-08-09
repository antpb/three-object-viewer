
import { registerBlockType } from "@wordpress/blocks";
import Edit from './Edit';
import Save from './Save';

const blockConfig = require('./block.json');
registerBlockType(blockConfig.name, {
    ...blockConfig,
    apiVersion: 2,
    edit: Edit,
    save: Save
});
