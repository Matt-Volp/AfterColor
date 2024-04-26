(function(thisObj) {

	var picker = {};
	picker.name = "Color Picker";
	picker.blue = [0.2117647059, 0.6274509804, 0.937254902, 1];
	picker.grey = [0.568627451, 0.568627451, 0.568627451, 1];
	picker.lastMousePosition = [0, 0];
	picker.isMouseDown = false;
	picker.maxVal = {h: 360, s: 100, br: 100, r: 255, g: 255, b: 255};
	picker.h = 0;
	picker.s = 0;
	picker.br = 0;
	picker.r = 0;
	picker.g = 0;
	picker.b = 0;

	buildUI(thisObj);

	function buildUI(thisObj) {

		var dialog = new Window("dialog", picker.name);
		dialog.orientation = "row";
		dialog.alignChildren = ['left', 'top'];
		dialog.opacity = 1;
		dialog.margins = [20, 15, 20, 12];

		picker.group = dialog.add("group");
		picker.group.spacing = 8;

		picker.largeGroup = picker.group.add("group");
		picker.largeGroup.orientation = "stack";

		picker.large = picker.largeGroup.add("customview");
		picker.large.preferredSize = [260,260];
		picker.large.stop = 10;
		picker.large.step = picker.large.preferredSize.width / picker.large.stop;

		drawPicker(colorValToRgb(360, 100, 100));

		function drawPicker(hue) {
			picker.large.onDraw = function() {
				var g = this.graphics;
				var colors, brush;
				for (var i = 0; i < this.step; i++) {
					colors = generateColorArray(rangeMapArray([1,1,1], [0,0,0], i, this.step - 1), rangeMapArray(hue, [0,0,0], i, this.step - 1), this.step);
					for (var j = 0; j < this.step; j++) {
						brush = g.newBrush(g.BrushType.SOLID_COLOR, colors[j]);
						g.newPath();
						g.rectPath(j * this.stop, i * this.stop, this.stop, this.stop);
						g.fillPath(brush);
					}
				}
			};
			picker.large.hide();
			picker.large.show();
		}
		
		picker.sample = picker.largeGroup.add("group");
		picker.sample.preferredSize = [260,260];
		picker.sample.isMouseDown = false;

		picker.sample.addEventListener("mousedown", function(event) {
			this.isMouseDown = true;
		});

		picker.sample.addEventListener("mousemove", function(event){
			if (this.isMouseDown) {
				drawSample(event.clientX, event.clientY);
				this.hide();
				this.show();
			}
		});

		picker.sample.addEventListener("mouseup", function(event){
			drawSample(event.clientX, event.clientY);
			this.hide();
			this.show();
			this.isMouseDown = false;
		});

		function drawSample(x, y) {
			picker.sample.onDraw = function() {
				var g = this.graphics;
				var white = g.newPen(g.PenType.SOLID_COLOR, [0,0,0,1], 2);
				g.ellipsePath(x,y,12,12);
				g.strokePath(white);
			};
		}

		picker.small = picker.group.add("scrollbar");
		picker.small.preferredSize = [38,268];
		picker.small.minvalue = 0;
		picker.small.maxvalue = 360;
		picker.small.value = 0;
		picker.small.stop = 2;
		picker.small.step = 260 / picker.small.stop;
		picker.small.colors = generateHueColorArray(picker.small.step);
		picker.small.isMouseDown = false;

		picker.small.addEventListener("mousedown", function(event){
			picker.small.isMouseDown = true;
			event.preventDefault();
		});

		picker.small.addEventListener("mousemove", function(event){
			if (picker.small.isMouseDown) {
				this.value = rangeMap(event.clientY, 0, 268, 0, 360);
				drawPicker(colorValToRgb(360-this.value, 100, 100));
			}
		});

		picker.small.addEventListener("mouseup", function(event){
			this.value = rangeMap(event.clientY, 0, 268, 0, 360);
			drawPicker(colorValToRgb(360-this.value, 100, 100));
			picker.small.isMouseDown = false;
		});

		picker.small.onDraw = function() {
			var g = this.graphics;
			var brush;
			for (var i = 0; i < this.step; i++) {
				brush = g.newBrush(g.BrushType.SOLID_COLOR, this.colors[i]);
				g.newPath();
				g.rectPath(10, 4 + (i * this.stop), 18, this.stop);
				g.fillPath(brush);
			}
			var coords = [[2.65,7.57,2,6.93,4.93,4,2,1.07,2.65,.43,6.22,4,2.65,7.57],[35.35,.43,36,1.07,33.07,4,36,6.93,35.35,7.57,31.78,4,35.35,.43]];
			var grey = g.newBrush(g.BrushType.SOLID_COLOR, picker.grey);
			for (var i = 0; i < coords.length; i++) {
				g.newPath();
				for (var j = 0; j <= coords[i].length - 1; j += 2) {
					if (j === 0) {
						g.moveTo(coords[i][j], coords[i][j + 1] + rangeMap(this.value, 0, 360, 0, 260));
					} else {
						g.lineTo(coords[i][j], coords[i][j + 1] + rangeMap(this.value, 0, 360, 0, 260));
					}
				}
				g.fillPath(grey);
			}
		};

		picker.options = picker.group.add("group");
		picker.options.orientation = "column";
		picker.options.preferredSize = [80, 260];
		picker.options.spacing = 12;
		picker.options.alignChildren = ["left", "top"];

		picker.preview = picker.options.add("group");
		picker.preview.orientation = "column";
		picker.preview.preferredSize = [60, 68];
		picker.preview.spacing = 0;

		picker.selected = picker.preview.add("customview");
		picker.selected.preferredSize = [60, 34];
		updateSwatch(picker.selected, [1,1,1]);

		picker.current = picker.preview.add("customview");
		picker.current.preferredSize = [60, 34];
		updateSwatch(picker.current, [0,0,0]);

		function updateSwatch(swatch, rgb) {
			rgb.push(1);
			swatch.onDraw = function() {
				var g = this.graphics;
				var brush = g.newBrush(g.BrushType.SOLID_COLOR, rgb);
				g.rectPath(0, 0, this.preferredSize.width, this.preferredSize.height);
				g.fillPath(brush);
			}
		}

		picker.colorAttrs = picker.options.add("group");
		picker.colorAttrs.orientation = "row";
		picker.colorAttrs.alignChildren = ["left", "top"];
		picker.colorAttrs.spacing = 3;

		picker.colorAttrBtns = picker.colorAttrs.add("group");
		picker.colorAttrBtns.orientation = "column";
		picker.colorAttrBtns.alignChildren = ["left", "top"];
		picker.colorAttrBtns.spacing = 3;

		picker.colorAttrBtns.h = picker.colorAttrBtns.add("radiobutton", undefined, "H:");
		picker.colorAttrBtns.h.value = true;
		picker.colorAttrBtns.h.preferredSize = [-1, 20];
		picker.colorAttrBtns.s = picker.colorAttrBtns.add("radiobutton", undefined, "S:");
		picker.colorAttrBtns.s.preferredSize = [-1, 20];
		picker.colorAttrBtns.br = picker.colorAttrBtns.add("radiobutton", [0,0,30,25], "B:");
		picker.colorAttrBtns.br.preferredSize = [-1, 20];

		picker.colorAttrBtns.r = picker.colorAttrBtns.add("radiobutton", undefined, "R:");
		picker.colorAttrBtns.r.preferredSize = [-1, 20];
		picker.colorAttrBtns.g = picker.colorAttrBtns.add("radiobutton", undefined, "G:");
		picker.colorAttrBtns.g.preferredSize = [-1, 20];
		picker.colorAttrBtns.b = picker.colorAttrBtns.add("radiobutton", undefined, "B:");
		picker.colorAttrBtns.b.preferredSize = [-1, 20];

		picker.colorAttrVals = picker.colorAttrs.add("group");
		picker.colorAttrVals.orientation = "column";
		picker.colorAttrVals.alignChildren = ["left", "top"];
		picker.colorAttrVals.spacing = 3;
		picker.colorAttrVals.margins = [0, -2, 0, 0];

		picker.colorAttrs.h = new ColorAttr(picker.colorAttrVals, {
			attr: "h",
			symbol: "°"
		});

		picker.colorAttrs.s = new ColorAttr(picker.colorAttrVals, {
			attr: "s",
			symbol: "%"
		});

		picker.colorAttrs.br = new ColorAttr(picker.colorAttrVals, {
			attr: "br",
			symbol: "%"
		});

		picker.colorAttrs.r = new ColorAttr(picker.colorAttrVals, {
			attr: "r",
			symbol: ""
		});

		picker.colorAttrs.g = new ColorAttr(picker.colorAttrVals, {
			attr: "g",
			symbol: ""
		});

		picker.colorAttrs.b = new ColorAttr(picker.colorAttrVals, {
			attr: "b",
			symbol: ""
		});

		picker.hexGroup = picker.options.add("group");
		picker.hexGroup.orientation = "row";
		picker.hexGroup.alignChildren = ["left", "center"];
		picker.hexGroup.spacing = 3;
		picker.hexGroup.margins = [-5, -5, 0, 0];

		picker.hexGroup.add("staticText", undefined, "#");
		picker.hex = picker.hexGroup.add("editText", undefined, "000000");
		picker.hex.preferredSize = [60, 20];

		picker.actions = picker.group.add("group");
		picker.actions.orientation = "column";
		picker.actions.spacing = 10;
		picker.actions.preferredSize = [-1, 260];
		picker.actions.alignChildren = ["left", "top"];

		picker.ok = picker.actions.add("button", undefined, "OK");
		picker.cancel = picker.actions.add("button", undefined, "Cancel");

		picker.group.addEventListener("mousemove", function(event) {
			if (picker.small.isMouseDown) {
				this.value = rangeMap(event.clientY, 0, 266, 0, 360);
				drawPicker(colorValToRgb(360-this.value, 100, 100));
			}
			if (picker.isMouseDown) {
				var t = picker.target;
				if (t !== "small") {
					var colorAttr = picker.colorAttrs[t];

					var mouseDistance = event.screenX - picker.lastMousePosition[0];
					var value = parseFloat(picker[t]) + mouseDistance;
					var maxVal = picker.maxVal[t] || 0;
					value = Math.max(0, Math.min(value, maxVal));
					colorAttr.staticText.text = value;

					colorAttr.width = colorAttr.graphics.measureString(value.toString())[0];
					colorAttr.unit.margins = [colorAttr.width + 3, 0, 0, 0];
					colorAttr.staticText.maximumSize.width = colorAttr.width;
					colorAttr.staticText.minimumSize.width = colorAttr.width;

					colorAttr.parent.layout.layout(true);
				}
			}
		});

		picker.group.addEventListener("mouseup", function(event) {
			if (picker.isMouseDown) {
				var t = picker.target;
				if (t !== "small") {
					var colorAttr = picker.colorAttrs[t];
					var staticText = colorAttr.staticText;

					picker[t] = staticText.text;
					picker.isMouseDown = false;
					picker.lastMousePosition = [0, 0];
					colorAttr.editText.text = picker[t];
					staticText.text = Math.round(picker[t]);

					colorAttr.width = colorAttr.graphics.measureString(Math.round(picker[t]).toString())[0];
					colorAttr.unit.margins = [colorAttr.width + 3, 0, 0, 0];
					staticText.maximumSize.width = colorAttr.width;
					staticText.minimumSize.width = colorAttr.width;

					colorAttr.parent.layout.layout(true);
				}
			}
		});

		picker.group.addEventListener("mouseout", function(event) {
			if (picker.isMouseDown && event.eventPhase === "target") {
				var t = picker.target;
				if (t !== "small") {
					var colorAttr = picker.colorAttrs[t];
					var staticText = colorAttr.staticText;

					picker[t] = staticText.text;
					picker.isMouseDown = false;
					colorAttr.editText.text = picker[t];
					staticText.text = Math.round(picker[t]);

					colorAttr.width = colorAttr.graphics.measureString(Math.round(picker[t]).toString())[0];
					colorAttr.unit.margins = [colorAttr.width + 3, 0, 0, 0];
					staticText.maximumSize.width = colorAttr.width;
					staticText.minimumSize.width = colorAttr.width;

					colorAttr.parent.layout.layout(true);
				}
			}
		});

		dialog.center();
		dialog.show();
	}

	function colorValToRgb(h, s, b) {
		h = (h % 360 + 360) % 360;
		s = Math.max(0, Math.min(1, s));
		b = Math.max(0, Math.min(1, b));
		var c = b * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = b - c;
		var r, g, bl;
		if (h < 60) { r = c; g = x; bl = 0; }
		else if (h < 120) { r = x; g = c; bl = 0; }
		else if (h < 180) { r = 0; g = c; bl = x; }
		else if (h < 240) { r = 0; g = x; bl = c; }
		else if (h < 300) { r = x; g = 0; bl = c; }
		else { r = c; g = 0; bl = x; }
		return [r + m, g + m, bl + m];
	}

	function generateHueColorArray(step) {
		var colors = [];
		for (var i = 0; i < step; i++) {
			var hue = (360 / (step - 1)) * i;
			var rgb = colorValToRgb(360 - hue, 100, 100);
			colors.push([rgb[0], rgb[1], rgb[2], 1]);
		}
		return colors;
	}

	function generateColorArray(startColor, endColor, step) {
		var colors = [];
		for (var i = 0; i < step; i++) {
			var r = startColor[0] + ((endColor[0] - startColor[0]) / step) * i;
			var g = startColor[1] + ((endColor[1] - startColor[1]) / step) * i;
			var b = startColor[2] + ((endColor[2] - startColor[2]) / step) * i;
			colors.push([r, g, b, 1]);
		}
		return colors;
	}

	function rangeMap(value, inMin, inMax, outMin, outMax) {
		return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
	}

	function rangeMapArray(startArray, endArray, index, totalSteps) {
		var mappedArray = [];
		for (var i = 0; i < startArray.length; i++) {
			var step = (endArray[i] - startArray[i]) / totalSteps;
			mappedArray.push(startArray[i] + step * index);
		}
		mappedArray.push(1);
		return mappedArray;
	}

	function ColorAttr(parentGroup, params) {
		var ca = parentGroup.add("group");
		ca.attr = params.attr;
		ca.symbol = params.symbol;

		ca.orientation = "stack";
		ca.preferredSize = [60, -1];
		ca.alignChildren = ["left", "bottom"];
		if (ca.attr === "r") {
			ca.margins = [0, 5, 0, 0];
		}

		ca.width = ca.graphics.measureString(picker[ca.attr].toString())[0];

		ca.unit = ca.add("group");
		ca.unit.alignment = ["left", "fill"];
		ca.unit.margins = [ca.width + 3, 0, 0, 0];
		ca.unit.add("staticText", undefined, params.symbol);

		ca.staticText = ca.add("staticText", undefined, picker[ca.attr]);
		ca.staticText.graphics.foregroundColor = ca.staticText.graphics.newPen(ca.staticText.graphics.PenType.SOLID_COLOR, picker.blue, 2);
		ca.staticText.minimumSize = [ca.width, 20];
		ca.staticText.maximumSize = ca.staticText.minimumSize;

		ca.editText = ca.add("editText", undefined, picker[ca.attr]);
		ca.editText.preferredSize = [37, 20];
		ca.editText.hide();

		ca.addEventListener("mousedown", function(event) {
			if (event.target === this) {
				picker.target = ca.attr;
				picker.isMouseDown = true;
				picker.lastMousePosition = [event.screenX, event.screenY];
			}
		});

		ca.staticText.addEventListener("click", function(event) {
			picker.isMouseDown = false;
			picker.lastMousePosition = [0, 0];
			ca.editText.show();
			ca.editText.active = true;
		});

		ca.editText.addEventListener("keydown", function(event) {
			if (event.eventPhase === "target") {
				var shiftKey = event.shiftKey;
				var ctrlKey = (event.ctrlKey || ($.os.indexOf("Windows") !== -1 ? event.ctrlKey : event.metaKey));
				var val = parseFloat(this.text);
				if (!isNaN(val)) {
					var step = shiftKey ? 10 : (ctrlKey ? 0.1 : 1);
					if (event.keyName === "Up") {
						event.preventDefault();
						this.text = Math.min(val + step, picker.maxVal[ca.attr]);
					} else if (event.keyName === "Down") {
						event.preventDefault();
						this.text = Math.max(val - step, 0);
					}
				}
			}
		});

		ca.editText.onChanging = function() {
			var pattern = new RegExp("^[0-9.]+$");
			if (!pattern.test(this.text)) {
				this.text = "0";
				picker[ca.attr] = 0;
			} else {
				picker[ca.attr] = Math.max(0, Math.min(parseFloat(this.text), picker.maxVal[ca.attr]));
			}
			ca.width = ca.staticText.graphics.measureString(Math.round(picker[ca.attr]))[0];
		}

		ca.editText.addEventListener("blur", function() {
			ca.editText.hide();
			ca.editText.active = false;
			ca.unit.margins = [ca.width + 3, 0, 0, 0];
			ca.staticText.maximumSize.width = 0;
			ca.staticText.minimumSize.width = 0;
			ca.staticText.maximumSize.width = ca.width;
			ca.staticText.minimumSize.width = ca.width;
			ca.staticText.text = Math.round(picker[ca.attr]);
			ca.parent.layout.layout(true);
		});

		return ca;
	}

})(this);