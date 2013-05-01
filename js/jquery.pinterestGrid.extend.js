;(function($) {
	$.fn.pinterestGrid = function(options) {
		elements = $(this);
		winObject = $(window);
		opts = $.extend({}, $.fn.pinterestGrid.defaults, options);

		setCol();
		applyPinterestGrid();

		winObject.unbind('resize').resize(function() {
			var containerWidth,
				winWidth = winObject.width() - opts.offsetX * 2;
			if(winWidth < colWidth * numOfCol) {
				setCol();
				containerWidth =  colWidth * (numOfCol - 1);
			} else if (winWidth > colWidth * (numOfCol + 1)) {
				setCol();
				containerWidth =  colWidth * (numOfCol + 1);
			}
			if (containerWidth) {
				var current = elements.width();
				elements.width(colWidth * numOfCol);
				applyPinterestGrid();
			}
		});

		return this;
	}

	// デフォルトオプション
	$.fn.pinterestGrid.defaults = {
		offsetX: 5,
		offsetY: 5,
		gridElement: 'div'
	};

	var elements,
		winObject,
		numOfCol,
		opts = {},
		colWidth,
		gridArray = [];

	// 初期化
	var applyPinterestGrid = function() {
		createEmptyGridArray();

		elements.children(opts.gridElement).each(function(index) {
			setPosition($(this));
		});

		//最後にエレメントの高さを設定
		var heightArray = getHeightArray(0, gridArray.length);
		elements.height(heightArray.max + opts.offsetY);
	};

	// カラムの数とwidthを設定する
	var setCol = function() {
		colWidth = $(opts.gridElement).outerWidth() + opts.offsetX * 2;
		numOfCol = Math.floor((winObject.width() - opts.offsetX * 2) / colWidth);
	};

	//空のgridArrayを作成
	var createEmptyGridArray = function() {
		//最初にgridArrayを初期化
		gridArray = [];
		for(var i=0; i<numOfCol; i++) {
			pushGridArray(i, 0, 1, -opts.offsetY);
		}
	};

	//gridArrayに新しいgridを追加
	var pushGridArray = function(x, y, size, height) {
		//define grid object based on grid width
		for (var i=0; i<size; i++) {
			var grid = [];
			grid.x = x + i;
			grid.size = size;
			grid.endY = y + height + opts.offsetY * 2;

			gridArray.push(grid);
		}
	};

	//gridArrayからgridを削除
	var removeGridArray = function(x, size) {
		for(var i=0; i<size; i++) {
			//remove grid beside
			var idx = getGridIndex(x + i);
			gridArray.splice(idx, 1);
		}
	};

	// gridのx値を基準にgridのインデックスを検索
	var getGridIndex = function(x) {
		for (var i=0; i<gridArray.length; i++) {
			var obj = gridArray[i];
			if (obj.x === x) {
				return i;
			}
		}
	};

	//gridのx値とサイズに基づいてgridArrayにある高さの最小値と最大値、最小値のあるx値を取得
	//retrun min and max height
	var getHeightArray = function(x, size) {
		var heightArray = [];
		var temps = [];
		for (var i=0; i<size; i++) {
			var idx = getGridIndex(x + i);
			temps.push(gridArray[idx].endY);
		}
		heightArray.min = Math.min.apply(Math, temps);
		heightArray.max = Math.max.apply(Math, temps);
		heightArray.x = temps.indexOf(heightArray.min);

		return heightArray;
	};

	//gridが配置されるx座標値、y座標値を取得
	var getGridPosition = function(size) {
		if (size > 1) {
			var arrayLimit = gridArray.length - size,
				defined = false,
				tempHeight;

			for (var i=0; i<gridArray.length; i++) {
				var obj = gridArray[i],
					x = obj.x;

				if (x >= 0 && x <= arrayLimit) {
					var heightArray = getHeightArray(x, size);

					if (!defined) {
						defined = true;
						tempHeight = heightArray;
						tempHeight.x = x;
					} else {
						if (heightArray.max < tempHeight.max) {
							tempHeight = heightArray;
							tempHeight.x = x;
						}
					}
				}
			}
			return tempHeight;
		} else {
			return getHeightArray(0, gridArray.length);
		}
	};

	//gridを配置
	var setPosition = function(grid) {
		//check grid size
		var size;
		if (!grid.data('size') || grid.data('size') < 0) {
			size = 1;
		} else if (grid.data('size') > numOfCol) {	// extra
			size = numOfCol;
		} else {
			size = grid.data('size');
		}

		// gridの情報を定義
		var pos = [];
		var tempHeight = getGridPosition(size);	// extra
		pos.x = tempHeight.x;
		if (size > 1) {
			pos.y = tempHeight.max;
		} else {
			pos.y = tempHeight.min;
		}

		var gridWidth = colWidth * size - (grid.outerWidth() - grid.width());	// extra

		// gridのスタイルを更新
		grid.css({
			'width': gridWidth - opts.offsetX * 2,	// extra
			'left': pos.x * colWidth,
			'top': pos.y,
			'position': 'absolute'
		});

		// gridArrayを新しいgridで更新
		removeGridArray(pos.x, size);
		pushGridArray(pos.x, pos.y, size, grid.outerHeight());
	};


	//IE用にArray.indexOfメソッドを追加
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function(elt /*, from*/) {
			var len = this.length >>> 0;

			var from = Number(arguments[1]) || 0;
			from = (from < 0) ? Math.ceil(from) : Math.floor(from);
			if (from < 0) {
				from += len;
			}

			for (; from < len; from++) {
				if (from in this && this[from] === elt) {
					return from;
				}
			}
			return -1;
		};
	}

})(jQuery);