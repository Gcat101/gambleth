// priority: 4500

/**
 * @typedef {Object} TweenedOptions
 * 
 * @property {number} [duration]
 * @property {number} [delay]
 * @property {EasingFunction} [easing]
 */

/**
 * @param {number} val 
 * @param {TweenedOptions?} [options={}] 
 */
global.tweened = function (val, options) {
    this.tick = 0
    this.val = val

    this.options = options != null ? options : {}
}
global.tweened.prototype = {
    get: function () {return this.val},
    set: function (newVal, customOptions) {
        this.tick = 0
        this.newVal = newVal
        this.initVal = this.val

        /** @type {TweenedOptions} */
        this.oneTimeOptions = customOptions != null ? {
            duration: customOptions.duration != null ? customOptions.duration : this.options.duration,
            delay: customOptions.delay != null ? customOptions.delay : this.options.delay,
            easing: customOptions.easing != null ? customOptions.easing : this.options.easing,
        } : this.options
        this.duration = this.oneTimeOptions.duration != null ? Math.max(this.oneTimeOptions.duration, 0) : 0
        this.delay = this.oneTimeOptions.delay != null ? Math.max(this.oneTimeOptions.delay, 0) : 0
        this.easing = this.oneTimeOptions.easing != null ? this.oneTimeOptions.easing : global.easings.linear
    },

    update: function () {
        if (
            this.oneTimeOptions == null ||
            this.tick > (this.duration + this.delay)
        ) return

        if (this.tick == (this.duration + this.delay)) {
            this.val = this.newVal
            this.tick++

            return
        }

        if (this.tick >= this.delay) this.val = this.initVal + ((this.newVal - this.initVal) * this.easing((this.tick - this.delay) / this.duration))
        this.tick++
    }
}