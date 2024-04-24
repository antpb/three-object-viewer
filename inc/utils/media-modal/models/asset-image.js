const AssetImage = Backbone.Model.extend({
	defaults: {
	  fileurl: '',
	  filename: '',
	  filesize: 0,
	  polycount: 0,
	  vertcount: 0,
	  thumburl: '',
	},
  });
  
  export default AssetImage;
  