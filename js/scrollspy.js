/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.5
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================
  /**
   * 完成滚动对象、nav对象、滚动事件绑定、初始化refresh()和process()
   * @param {object} element 含有[data-spy="scroll"]的dom对象
   * @param {object} options 定义offsets的参数
   */
  function ScrollSpy(element, options) {
    this.$body          = $(document.body)
    // 滚动对象，如果绑定在body上，则滚动对象为window，否则为绑定的元素
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element) 
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.3.5'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }
  /**
   * 获取要监听的元素的内容高度，或body的内容高度
   * @return {number} 内容高度
   */
  ScrollSpy.prototype.getScrollHeight = function () {
    // scrollHeigth是元素内容的高度，包括overflow导致不可见的部分
    // this.$body[0].scrollHeight和document.body.scrollHeight其实是一样的
    // 在DTD声明和未声明时，document.documentElement.scrollHeight和document.body.scrollHeight有一个会为可视窗口高度
    // 所以用Math.max取得全部内容高度
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }
  /**
   * 确定各a标签（放到targets中），及其对应的锚点位置（放到offsets中）
   * @return {undefined} 无返回值
   */
  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()
    // 如果监听的滚动对象不是body，则使用position方法来获取offsets值
    // jquery的offset()方法是获取匹配元素在当前视口的相对偏移
    // position()方法是获取匹配元素相对父元素的偏移
    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      // 找到全部的锚点
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)
        // 返回由[offsets，锚点]组成的数组
        // jquery的map有点奇怪，return值或return[值]得到的都是数组。return [[值]]得到的才是数组组成的数组
        return ($href 
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }
  /**
   * 根据this.offsets与当前的scrollTop比较，判断是否需要activate
   * @return {undefined} 没有返回值
   */
  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset // 加上规定offset的，距离顶部的值
    var scrollHeight = this.getScrollHeight() // 当前的内容高度
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height() // offset值+内容高度-可视高度得到的最大可滚动高度
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget // 当前的激活nav
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }
    // 超过当前元素的最大可滚动高度，直接激活最后一个nav
    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }
    // 没超过第一个offset，清除当前的激活对象
    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }
    // 最精彩的部分，循环判断是否需要激活
    for (i = offsets.length; i--;) {
      activeTarget != targets[i] // 满足当前遍历的target不是激活对象
        && scrollTop >= offsets[i] // 满足当前滚动高度大于对应的offset
        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1]) // 满足当前滚动高度小于下一个滚动高度，或下一个滚动高度未定义
        && this.activate(targets[i]) // 激活该nav
    }
  }
  /**
   * 激活传进来的dom对象（即为其添加active类）
   * @param  {object} target dom对象
   * @return {undefined}        无返回值
   */
  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target // 先把该对象存入实例对象中

    this.clear() // 清除当前的激活对象

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'
    // 为对应的a标签的父元素li添加active类
    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }
    // 触发自定义事件
    active.trigger('activate.bs.scrollspy')
  }
  /**
   * 清除当前的nav中的激活对象
   * @return {[type]} [description]
   */
  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================
/**
 * 把[data-spy="scroll"]的dom元素，及元素property上的参数传给ScrollSpy构造函数
 * @param {object} option 之前绑定在元素上的property对象
 *                        自定义的包含指定content的对象，如{target: '#nav-example'}
 */
function Plugin(option) {
  return this.each(function () {
    var $this   = $(this)
    var data    = $this.data('bs.scrollspy')
    var options = typeof option == 'object' && option

    if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
    if (typeof option == 'string') data[option]()
  })
}

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);
