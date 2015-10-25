/* ========================================================================
 * Bootstrap: transition.js v3.3.5
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================
  /**
   * 通过创建并遍历元素的style判断当前浏览器是否支持transitionEnd事件
   * 及若支持，是支持哪种事件
   * @return {object} 若支持，则返回包含end属性（即对应事件）的对象。若不支持则返回false
   */
  function transitionEnd() {
    var el = document.createElement('bootstrap')
    // 不同的transitionEnd事件
    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }
    // 通过遍历样式是否存在来判断当前浏览器支持哪种过渡结束事件
    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }
    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  /**
   * 用于保证transitionEnd事件一定在过渡完成后被触发
   * @param  {number} duration 过渡时间的时长
   * @return {object}          jquery对象
   */
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false // transitionEnd是否已触发的标识
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    // 回调函数，实现如果未触发，则强制触发
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    // 在过渡结束的时间后检查是否触发
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    // 储存当前浏览器是否支持，若支持是支持哪种transitionEnd事件
    $.support.transition = transitionEnd()

    if (!$.support.transition) return
    // $.event.special.bsTransitionEnd是用于传入事件类型，来自定义事件
    // 这样就能自己添加事件$el.one('bsTransitionEnd', function() {})
    // 而不用$el.one($.support.transition.end, function() {})
    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      // 定义事件处理函数
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);
