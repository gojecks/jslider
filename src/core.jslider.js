	function slider_core_helpers(definition)
	{
		this._counter = 0;
		this._options = definition;
		this.get_mouse_cursor = function(e){
			var cursor = [e.clientX, e.clientY];

			// Or finger touch position.
			if (e.targetTouches && e.targetTouches[0]) {
				cursor = [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
			}

			return cursor;
		};

		this.get_mouse_angle = function(e){
			var center = this.get_center_position(e.currentTarget);
			// Mouse position.
			var cursor = this.get_mouse_cursor(e),
            	rad = Math.atan2(cursor[1] - center[1], cursor[0] - center[0]);

				rad += Math.PI / 2;

			return rad;
		};

		this.get_center_position=function(currentTarget){
			var rect = currentTarget.parentNode.getBoundingClientRect();
			return [
					rect.left + (rect.right - rect.left) / 2,
					rect.top + (rect.bottom - rect.top) / 2
				];
		};

		this.set_slider_position = function(){
	        //for attraction to multiple of 90 degrees
	        var distance = Math.abs( this._options.deg - ( Math.round(this._options.deg / 90) * 90 ) );
	        
	        if( distance <= 5 ){
	            this._options.deg = Math.round(this._options.deg / 90) * 90;
	        }
		};

		this.handle_position = function(){
			var X = Math.round(this._options.radius* Math.sin(this._options.deg*Math.PI/180)),
        		Y = Math.round(this._options.radius*  -Math.cos(this._options.deg*Math.PI/180));
        	return { 
        			left: X+this._options.radius-this._options.sliderWidth/2, 
        			top: Y+this._options.radius-this._options.sliderHeight/2
        	};
		};

		this.getTick = function(){
			return this._options._ticks[this._counter] || 0;
		}
	}


	slider_core_helpers.prototype.float_or_default = function(x, def) {
		x = parseFloat(x);
		return isNaN(x) ? def : x;
	};

	slider_core_helpers.prototype.int_or_default = function(x, def) {
		x = parseInt(x, 10);
		return isNaN(x) ? def : x;
	};

	slider_core_helpers.prototype.update_value = function(){
		// Sanity check.
		if (!Number.isFinite(this._options.core.value)) {
			this._options.core.value = 0;
		}

		// Snapping to one of the circle divisions.
		if (Number.isFinite(this._options.core.divisions) && this._options.core.divisions >= 2) {
			this._options.core.value = Math.round(this._options.core.value * this._options.core.division) / this._options.core.division;
		}

		// Clamping to the defined min..max range.
		if (Number.isFinite(this._options.core.max) && this._options.core.value > this._options.core.max) {
			this._options.core.value = this._options.core.max;
		}

		if (Number.isFinite(this._options.core.min) && this._options.core.value < this._options.core.min) {
			this._options.core.value = this._options.core.min;
		}

	};

	slider_core_helpers.prototype.update_rotation = function(e){
		var radius = this._options.radius,
			cursor = this.get_mouse_cursor(e),
			_slider = e.currentTarget;

        var atan = Math.atan2(cursor[0]-radius, cursor[1]-radius);
        this._options.deg = -atan/(Math.PI/180) + 180; // final (0-360 positive) degrees from mouse position 
       	this.set_slider_position();
       
       this.set_default_point(_slider);
	};

	slider_core_helpers.prototype.set_default_point = function(_slider, CB){
		var pos =this.handle_position();
        // set the position
        for(var prop in pos){
        	_slider.style[prop] = pos[prop];
        }

        (CB || function(){})();

        return this;
	};

	slider_core_helpers.prototype._valueToStep = function(value){
		return (((value - this._options.core.min) / (this._options.core.max - this._options.core.min)) * this._options.core._end) + this._options.core._start;
	};

	slider_core_helpers.prototype._stepToValue = function(step){
		return ((step / this._options.core._end) * (this._options.core.max - this._options.core.min) + this._options.core.min);
	};

	slider_core_helpers.prototype.limitValue = function(_val){
		if(this._options.core.max && this._options.core.hasMaxValue){
			_val = (_val > this._options.core.max?this._options.core.max : _val);
		}

		 this._options.core.$value = _val
	};


	slider_core_helpers.prototype.generateTicks = function(){
		var max = this._options.core.max,
			min = this._options.core.min,
			step = this._options.core.step,
			diff = max / step;

		for(var i=0; i<=diff; i++){
			this._options._ticks.push( this._valueToStep(step * i, this._options.core))
		}

		return this;
	};

	slider_core_helpers.prototype.trigger = function(type, options){
		(this._options.core[type] || function(){})(options);
		var toolTipHTML = document.querySelector('div#rotationSliderDegrees span.tooltip_area');
		if(toolTipHTML){
			toolTipHTML.innerHTML = this._options.core.toolTip(this._options.core.$value);
		}
		return this;
	};

		function buildSlider(element, options){
			var $parent = jQuery(element),
				$container = jQuery('<div id="rotationSliderContainer"></div>'),
				$slider = jQuery('<div id="rotationSlider"></div>'),
				$degrees = jQuery('<div id="rotationSliderDegrees"><span class="tooltip_area"></span></div>');


			var defaults = {
				min:0,
				max:100,
				step:0,
				value:0,
				division:0,
				_end:360,
				_start:0,
				$value:0,
				infinity: false,
				onChange: function(){},
				onDrag:function(){},
				onCreate:function(){},
				toolTip:function(val){
					return val;
				}
			},
			_options = jQuery.extend({},defaults, options);

			// set division when max value is defined

			if(_options.max && _options.infinity && !_options.division){
				var _divs = Math.round(_options.max / (_options._end *_options.step));
				_options.division = _divs < 20 ? 20 : _div;
				_options.hasMaxValue = true;
			}

			// append the children
			$parent.append(
				$container.append($slider, $degrees)
			);

			var helpers = new slider_core_helpers({
				sliderWidth: $slider.width(),
				sliderHeight: $slider.height(),
				radius:$container.width()/2,
				deg:0,
				_ticks:[],
				core:_options
			});

			var previous_angle=null, 
		    	previous_value=null;

		    helpers
		    	.generateTicks(_options)
		    	.set_default_point($slider[0], function(){
		    		helpers.trigger('onCreate', _options);
		    	});

		    $slider
		    .bind('mousedown',_handle_click)
		    .bind('touchstart',_handle_click);

		    function _handle_click(ev) { 
		    	ev.preventDefault();
				ev.stopPropagation();
				previous_angle = helpers.get_mouse_angle(ev);
				previous_value = _options.value;
				helpers._dragStart = true;

				$slider
			    .bind('mousemove.js',_rotate)
			    .bind('touchmove.js',_rotate)

			    .bind('mouseup.js',_rotateEnd)
			    .bind('touchend.js',_rotateEnd);
		    }

		    function _rotateEnd(e) { 
		    	helpers._dragStart = false;
		    	unBind();
		    }

		    /***
				unBind slider eventListener
		    **/

		    function unBind(){
		    	$slider
		    	.unbind('.js');
		    }

		    function _rotate(e) {

		    	if(!helpers._dragStart) return;

				var new_angle = helpers.get_mouse_angle(e);
				var old_angle = previous_angle;
				previous_angle = new_angle;

				var delta_angle = new_angle - old_angle;
				if (delta_angle < 0) {
					// Because this is a circle
					delta_angle += Math.PI * 2;
				}
				if (delta_angle > Math.PI) {
					// Converting from 0..360 to -180..180.
					delta_angle -= Math.PI * 2;
				}

				var delta_value = delta_angle / Math.PI / 2;
				var new_proposed_value = previous_value + delta_value;
				var old_actual_value = _options.value;
				
				_options.value = helpers.float_or_default(new_proposed_value, 0);
				helpers.update_value();
				previous_value = new_proposed_value;
				helpers.update_rotation(e);

				var new_actual_value = _options.value;
				if (old_actual_value !== new_actual_value) {
					var _value;
					// broadcast event
					if(!_options.infinity){
			        	_value = Math.round(helpers._stepToValue(helpers._options.deg));
			        }else{
			        	_value = Math.round(new_actual_value * _options.division) * _options.step;
			        }
			        helpers.limitValue(_value);

			        helpers.trigger('onDrag',_options.$value);
		        }
		        		        
		    }

		}
		
	/***
		jSlider jQuery FN
	***/
	jQuery.fn.jSlider = function(options){
		return this.each(function(idx,ele){
			buildSlider(ele, options);
		});
	};
