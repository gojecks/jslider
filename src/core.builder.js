/**
 * 
 * @param {*} element 
 * @param {*} options 
 */
function buildSlider(element, options) {
    var $parent = jQuery(element),
        $container = jQuery('<div id="jslider-circle"></div>'),
        $sliderHandle = jQuery('<div id="jslider-picker"><div id="jslider-picker-circle"></div></div>'),
        $toolTip = jQuery('<div id="jslider-circle-in"><span class="tooltip_area"></span></div>'),
        helpers;

    /**
     * check if element was initialized
     */
    if ($parent.data('_jslider_')) {
        $parent.data('_jslider_').redraw(options);
        return;
    }

    var defaults = {
            "[[Target]]": {
                id: "_jslider_" + +new Date
            },
            min: 0,
            max: 0,
            step: 0,
            value: 0,
            division: 0,
            _end: 360,
            _start: 0,
            _min: null,
            _max: null,
            $value: 0,
            disabled: false,
            readonly: false,
            infinity: false,
            onChange: function() {},
            onDrag: function() {},
            onCreate: function() {},
            toolTip: function(val) {
                return val;
            },
            redraw: function(config) {
                if (config) {
                    jQuery.extend(this, config);
                    helpers.set_default_point();
                }
            },
            onDisabled: function(_ele) {
                $sliderHandle.hide();
            },
            onEnabled: function(_ele) {
                $sliderHandle.show();
            }
        },
        _options = jQuery.extend({}, defaults, options);
    // append the children
    $parent
        .html(
            $container.append($toolTip, $sliderHandle)
        );

    helpers = new SliderService({
        sliderWidth: $sliderHandle.width(),
        sliderHeight: $sliderHandle.height(),
        radius: $container.width() / 2,
        deg: 0,
        _ticks: [],
        $parentContainer: $container,
        $sliderHandle: $sliderHandle,
        core: _options
    });


    /**
     * register our data to the element
     */
    $parent.data('_jslider_', _options);

    var previous_angle = null,
        previous_value = null;

    helpers
        .set_default_point();

    /**
     * @param eventName
     * @return true if event is touch
     */
    function isTouchEvent(eventName) {
        return (eventName.indexOf('touch') > -1);
    }

    /**
     * Bind to events to the slider
     * MouseDown or TouchStart EVENT
     */
    $sliderHandle
        .on('mousedown touchstart', _handle_click);

    function _handle_click(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        previous_angle = helpers.get_mouse_angle(ev);
        previous_value = _options.value;
        helpers._dragStart = true;

        if (isTouchEvent(ev.type)) {
            $sliderHandle
                .on('touchmove.js', _rotate)
                .on('touchend.js', _rotateEnd);
        } else {
            window.addEventListener('mousemove', _rotate, false);
            window.addEventListener('mouseup', _rotateEnd, false);
        }
    }

    function _rotateEnd(ev) {
        helpers._dragStart = false;
        unBind(ev.type);
    }

    /***
        unBind slider eventListener
    **/

    function unBind(eventName) {
        if (isTouchEvent(eventName)) {
            $sliderHandle
                .off('.js');
        } else {
            window.removeEventListener('mousemove', _rotate);
            window.removeEventListener('mouseup', _rotateEnd);
        }
    }

    function _rotate(e) {
        if (!helpers._dragStart || _options.disabled) return;

        var new_angle = helpers.get_mouse_angle(e),
            old_angle = previous_angle;
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
            _value = Math.round(new_actual_value * _options.division) * _options.step;

            helpers.limitValue(_value);
            helpers.trigger('onDrag', _options.$value);
        }

    }

}

/**
 * register to jQuery
 */
jQuery.fn.jSlider = function(options) {
    return this.each(function(idx, ele) {
        buildSlider(ele, options);
    });
};