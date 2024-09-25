(function (wp) {
	const AssetView = wp.Backbone.View.extend({
	  tagName: 'li',
	  className: 'asset-item',
	  style: 'margin: 10px;',
	  template: wp.template('asset-template'),
	  events: {
		'click .asset-details': 'selectAsset',
		'click .assets-load-more': 'loadMoreAssets',
	  },
	  initialize: function () {
		this.listenTo(this.model, 'change:selected', this.toggleSelected);
	  },
	  render: function () {
		this.$el.html(this.template(model= this.model));
		return this;
	  },
	  toggleSelected: function () {
		this.$el.toggleClass('selected', this.model.get('selected'));
	  },
	  selectAsset: function () {
		const parent = this.$el[0].parentElement;
		
		// Check if the current item is already selected
		const isSelected = this.$el.hasClass('selected');
		
		// Remove the 'selected' class from all children
		for (let i = 0; i < parent.children.length; i++) {
		  parent.children[i].classList.remove('selected');
		}
		
		// If the current item was not selected before, add the 'selected' class
		if (!isSelected) {
		  this.$el.addClass('selected');
		  this.model.set('selected', true);
		  this.trigger('select', this.model);
		} else {
		  // If the current item was already selected, deselect it
		  this.model.set('selected', false);
		  this.trigger('select', null);
		}
	  },
	});
	let currentPage = 1;
	let totalPages = 1;
	let hasMore = false;
	let offset = 0;
	let selectedCategories = [];
	let searchQuery = '';
	let nonce = threeovAssetsTab.toybox_nonce;
	const CustomMediaTab = wp.media.View.extend({
	  tagName: 'div',
	  className: 'custom-media-tab',
	  template: wp.template('custom-media-tab'),
	  events: {
		'click .category-filter': 'handleCategoryFilter',
		'click .search-submit': 'handleSearch', // Change the event to 'click' on the search submit button
		'click .clear-search': 'clearSearch',
		'click .assets-load-more': 'loadMoreAssets',
		'click .media-modal-close': 'close',
	  },
	  initialize: function (options) {
		this.apiKey = options.apiKey;
		this.assets = new wp.media.model.Attachments();
		this.listenTo(this.assets, 'reset', this.render);
		this.loadAssets();
		this.isThreeObjectViewerModal = options.controller.options.three_object_viewer_modal;
		console.log('isThreeObjectViewerModal', options);
	  },
	  render: function () {
		this.$el.html(this.template());
		this.$('.asset-list').empty();
		this.assets.each(this.renderAsset, this);
		this.renderCategories();
		return this;
	  },
	  renderAsset: function (asset) {
		  if (!asset.attributes.fileurl || !asset.attributes.filename) {
		  console.error('Incomplete asset data:', asset);
		  return;
		}
		const assetData = {
		  id: asset.attributes.id || 0,
		  fileurl: asset.attributes.fileurl,
		  filename: asset.attributes.filename,
		  thumburl: asset.attributes.thumburl,
		};
		const assetModel = new wp.media.model.Attachment(assetData);
		if (!assetModel) {
		  console.error('Failed to create asset model:', assetData);
		  return;
		}
		const assetView = new AssetView({ model: assetModel });
		this.listenTo(assetView, 'select', this.selectAttachment);
		this.$('.asset-list').append(assetView.render().el);
	  },
	  loadAssets: function () {
		const self = this;
		const apiUrl = '/wp-json/toybox/v1/assets';
		const params = {
			limit: 10,
			offset: offset,
			search: encodeURIComponent(searchQuery),
			categories: encodeURIComponent(selectedCategories.join(',')),
		};

		jQuery.ajax({
			url: apiUrl,
			method: 'GET',
			data: params,
			beforeSend: function ( xhr ) {
				xhr.setRequestHeader( 'X-WP-Nonce', nonce );
			},
			success: function (response) {
				self.assets.add(response.assets);
				totalPages = response.pagination.total;
				hasMore = response.pagination.hasMore;
				if (hasMore) {
					currentPage++;
				}
				self.render();
			},
			error: function (xhr, status, error) {
				console.error('Error:', error);
			},
		});
		},
		loadMoreAssets: function () {
		offset = currentPage * 10;
		this.loadAssets();
	  	},
		close: function () {
			// reset assets and pagination
			currentPage = 1;
			offset = 0;
			totalPages = 1;
			hasMore = false;
			selectedCategories = [];
			searchQuery = '';
			this.assets.reset();
		},
	  	selectAttachment: function (selectedModel) {
		  // Deselect all assets
		this.assets.each(function (asset) {
		  asset.set('selected', false);
		});
		
		// Set the selected asset
		selectedModel.set('selected', true);
		
		const attachment = {
		  id: selectedModel.get('id') || 0,
		  url: selectedModel.get('fileurl'),
		  alt: selectedModel.get('filename'),
		  thumb: selectedModel.get('thumburl'),
		  // Add other relevant attachment details
		};
		
		const selection = this.controller.state().get('selection');
		const attachmentModel = new wp.media.model.Attachment(attachment);
		selection.reset([attachmentModel]);
		// clear pagination and load more assets
		currentPage = 1;
		offset = 0;
		this.assets.reset();
		this.controller.trigger('selection:toggle');
	  },
	  handleCategoryFilter: function (event) {
		const category = jQuery(event.currentTarget).data('category');
		const index = selectedCategories.indexOf(category);
		if (index > -1) {
		  selectedCategories.splice(index, 1);
		} else {
		  selectedCategories.push(category);
		}
		currentPage = 1;
		offset = 0;
		this.assets.reset();
		this.loadAssets();
	  },
	  handleSearch: function (event) {
		event.preventDefault(); // Prevent form submission
		searchQuery = this.$('.search-input').val(); // Get the search query from the input field
		currentPage = 1;
		offset = 0;
		// clear the current assets and load new assets based on the search query
		this.assets.reset();
		this.loadAssets();
	  },
	  clearSearch: function () {
		searchQuery = '';
		this.$('.search-input').val('');
		currentPage = 1;
		offset = 0;
		selectedCategories = [];
		this.assets.reset();
		this.loadAssets();
	  },
	  renderCategories: function () {
		const self = this;
		const url = '/wp-json/toybox/v1/categories'; // Update the URL to the new endpoint
	
		jQuery.ajax({
			url: url,
			method: 'GET',
			beforeSend: function (xhr) {
				xhr.setRequestHeader('X-WP-Nonce', threeovAssetsTab.toybox_nonce);
			},
			success: function (categories) {
			const categoriesContainer = self.$('.category-filters');
			categoriesContainer.empty();
			categories.forEach(function (category) {
			  const isSelected = selectedCategories.includes(category.category);
			  const categoryButton = jQuery('<button>', {
				class: 'category-filter',
				'data-category': category.category,
				text: category.category,
			  });
			  if (isSelected) {
				categoryButton.addClass('selected');
			  }
			  categoriesContainer.append(categoryButton);
			});
			},
			error: function (xhr, status, error) {
				console.error('Error:', error);
			},
		});
	},
	});
  
	// Load MediaFrame dependencies
	const oldMediaFrame = wp.media.view.MediaFrame.Post;
	const oldMediaFrameSelect = wp.media.view.MediaFrame.Select;
  
	// Create custom media tab
	wp.media.view.MediaFrame.Select = oldMediaFrameSelect.extend({
	  browseRouter(routerView) {
		console.log('Custom browseRouter', this, routerView);
		console.log("wp", wp.media.view)

		oldMediaFrameSelect.prototype.browseRouter.apply(this, arguments);
		routerView.set({
		  custom: {
			text: 'Toybox',
			priority: 120,
		  },
		});
	  },
	  bindHandlers() {
		oldMediaFrameSelect.prototype.bindHandlers.apply(this, arguments);
		this.on("content:create:custom", this.frameContent, this);
	  },
	  frameContent() {
		const state = this.state();
		if (state) {
		  const apiKey = threeovAssetsTab.apiKey;
		  const customMediaTab = new CustomMediaTab({ apiKey: apiKey, controller: this });
		  this.content.set(customMediaTab);
		}
	  },
	});
  })(window.wp);
  