import AssetImage from '../models/asset-image';

const AssetImages = Backbone.Collection.extend({
  model: AssetImage,
});

export default AssetImages;