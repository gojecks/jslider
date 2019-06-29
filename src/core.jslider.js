	/**
	 * 
	 * @param {*} definition 
	 */
	function SliderService(definition) {
	    this._counter = 0;
	    this._options = definition;
	    this.transform = (function() {
	        var prefs = ['t', 'WebkitT', 'MozT', 'msT', 'OT'],
	            style = document.documentElement.style,
	            p
	        for (var i = 0, len = prefs.length; i < len; i++) {
	            if ((p = prefs[i] + 'ransform') in style) return p
	        }

	        alert('your browser doesnt support css transforms!')
	    })();

	    this.get_mouse_cursor = function(e) {
	        var cursor = [e.clientX, e.clientY];

	        // Or finger touch position.
	        if (e.targetTouches && e.targetTouches[0]) {
	            cursor = [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
	        }

	        return cursor;
	    };

	    this.get_mouse_angle = function(e) {
	        var center = this.get_center_position(e.currentTarget);
	        // Mouse position.
	        var cursor = this.get_mouse_cursor(e),
	            rad = Math.atan2(cursor[1] - center[1], cursor[0] - center[0]);

	        rad += Math.PI / 2;
	        return rad;
	    };

	    this.get_center_position = function(update) {
	        var rect = this._options.$parentContainer[0].getBoundingClientRect();

	        if (update) {
	            return [
	                rect.left + rect.width / 2,
	                rect.top + rect.height / 2
	            ];
	        }

	        return [
	            rect.left + (rect.right - rect.left) / 2,
	            rect.top + (rect.bottom - rect.top) / 2
	        ];
	    };


	    this.getTick = function() {
	        return this._options._ticks[this._counter] || 0;
	    };
	}


	SliderService.prototype.float_or_default = function(x, def) {
	    x = parseFloat(x);
	    return isNaN(x) ? def : x;
	};

	SliderService.prototype.int_or_default = function(x, def) {
	    x = parseInt(x, 10);
	    return isNaN(x) ? def : x;
	};

	SliderService.prototype.update_value = function() {
	    // Sanity check.
	    if (!Number.isFinite(this._options.core.value)) {
	        this._options.core.value = 0;
	    }

	    // Snapping to one of the circle divisions.
	    if (Number.isFinite(this._options.core.division) && this._options.core.division >= 2) {
	        this._options.core.value = Math.round(this._options.core.value * this._options.core.division) / this._options.core.division;
	    }

	    // Clamping to the defined min..max range.
	    if (Number.isFinite(this._options.core._max) && this._options.core.value > this._options.core._max) {
	        this._options.core.value = this._options.core._max;
	    }

	    if (Number.isFinite(this._options.core._min) && this._options.core.value < this._options.core._min) {
	        this._options.core.value = this._options.core._min;
	    }

	};

	SliderService.prototype.update_rotation = function(ev) {
	    this._options
	        .$sliderHandle
	        .css(this.transform, 'rotate(' + (this._options.core.value * 360) + 'deg)');
	};

	SliderService.prototype._max = function() {
	    // update max
	    this._options.core._max = this._getDiff(
	        ((this._options.core.max > this._options.core.$value) ? this._options.core.max : this._options.core.$value)
	    );
	    this._options.core.value = this.float_or_default(this._options.core._max, null);
	    this.update_value();
	};

	SliderService.prototype._min = function() {
	    // update min
	    this._options.core._min = this._getDiff(this._options.core.min);
	    this._options.core.value = this.float_or_default(this._options.core._min, null);
	    this.update_value();
	};

	SliderService.prototype._getDiff = function(val) {
	    return (val / this._options.core.step) / this._options.core.division;
	};

	SliderService.prototype._setDivision = function() {
	    var _divs = Math.round(this._options.core.max / (this._options.core._end * this._options.core.step));
	    // set division when max value is defined
	    if (this._options.core.infinity) {
	        if (this._options.core.max && !this._options.core.division) {
	            this._options.core.division = _divs < 20 ? 20 : _divs;
	            this._options.core.hasMaxValue = true;
	        }
	    } else {
	        this._options.core.division = this._options.core.max / this._options.core.step;
	    }
	}

	SliderService.prototype.set_default_point = function(CB) {
	    this._setDivision();
	    // set the minimum trip value
	    if (this._options.core.min !== null && this._options.core.min !== 'undefined') {
	        this._min();
	    }

	    // set the maximum trip value
	    if (this._options.core.max) {
	        this._max();
	    }

	    // check if stop is defined
	    if (this._options.core.stop) {
	        this._options.core._max = this._getDiff(this._options.core.stop);
	    }

	    /***
	    	set the default rotation value
	    	based on options.$value
	    **/
	    this._options.core.value = this._getDiff(this._options.core.$value);

	    // update rotation
	    this.update_rotation();
	    this.limitValue(this._options.core.$value);
	    // check if slider is disabled
	    this._options.core[this._options.core.disabled ? 'onDisabled' : 'onEnabled'](this._options.$parentContainer);
	    this.trigger('onCreate', this._options.core);

	    return this;
	};

	SliderService.prototype._valueToStep = function(value) {
	    return (((value - this._options.core.min) / (this._options.core.max - this._options.core.min)) * this._options.core._end) + this._options.core._start;
	};

	SliderService.prototype._stepToValue = function(step) {
	    return ((step / this._options.core._end) * (this._options.core.max - this._options.core.min) + this._options.core.min);
	};

	SliderService.prototype.limitValue = function(_val) {
	    if (this._options.core.max && this._options.core.hasMaxValue) {
	        _val = (_val > this._options.core.max ? this._options.core.max : _val);
	    }

	    this._options.core.$value = _val;

	    if (this._options.core.stop) {
	        this._options.core.$value = (_val - this._options.core.min);
	    }
	};


	SliderService.prototype.generateTicks = function() {
	    var max = this._options.core.max,
	        min = this._options.core.min,
	        step = this._options.core.step,
	        diff = max / step;

	    for (var i = 0; i <= diff; i++) {
	        this._options._ticks.push(this._valueToStep(step * i, this._options.core))
	    }

	    return this;
	};

	SliderService.prototype.trigger = function(type, options) {
	    (this._options.core[type] || function() {})(options);
	    var toolTipHTML = this._options.$parentContainer.find('span.tooltip_area');
	    if (toolTipHTML) {
	        toolTipHTML.html(this._options.core.toolTip(this._options.core.$value));
	    }
	    return this;
	};

	SliderService.prototype.stopRotate = function() {
	    /**
	    	check if stop is defined
	    **/
	    if (this._options.core.hasOwnProperty('stop')) {
	        return (this._options.core.stop === this._options.core.$value);
	    }

	    return false;
	}