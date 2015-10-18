/* ========================================================================
 * Bootstrap: dropdown.js v3.3.5
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================
  /** @type {String} 用于匹配backdrop类的字符串 */
  var backdrop = '.dropdown-backdrop'
  /** @type {String} 用于匹配含有data-toggle触发器的元素的字符串 */
  var toggle   = '[data-toggle="dropdown"]'
  /**
   * 先需找在触发器通过data-target或href指定的容器，若没有则默认是其父容器
   * @param  {jquery对象} $this 有data-toggle的触发器
   * @return {jquery对象}       包含触发器的容器
   */
  function getParent($this) {
    var selector = $this.attr('data-target')
    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }
    var $parent = selector && $(selector)
    // 可以在触发器上用data-target或href来自定义父容器
    // 如果没有自定义容器，则默认是触发器的父元素
    return $parent && $parent.length ? $parent : $this.parent()
  }
  /**
   * each遍历，把所有容器的open类去除，以此保证只能有一个出现
   * @param  {e} e 事件对象
   * @return {undefined}   无返回
   */
  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }
      // 如果容器没有open，就不继续
      if (!$parent.hasClass('open')) return
      // 例外条件
      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return
      // 不明白干什么的
      $this.attr('aria-expanded', 'false')
      // 隐藏下拉框
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }
  /**
   * 只是对传进来的元素绑定点击事件
   */
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.3.5'

  
  /**
   * 下拉框的toggle，并返回false阻止冒泡到document上
   * @param  {object} e 事件对象
   * @return {boolean}   false
   */
  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)
    if ($this.is('.disabled, :disabled')) return
    // 包含下拉框的容器
    var $parent  = getParent($this)
    // 通过容器切换open类，来控制下拉框的显示与隐藏
    var isActive = $parent.hasClass('open')
    // 先隐藏页面的所有下拉框
    clearMenus()
    // 如果点击元素的容器没有.open（即下拉框隐藏）
    if (!isActive) {
      // 用ontouchstart来判断是否移动端
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        // 移动端的click事件不会冒泡到document？实验证明，没有这一段，也能实现点击下拉框外关闭的效果
        // 移动端插入一个dropdown-backdrop元素（全屏但z-index比下拉框小），做点击下拉框外时隐藏的效果
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)
    }
    // 在这里return false阻止冒泡到document上，导致下拉框隐藏
    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================
  // 事件触发顺序是，如果指定事件目标，则先触发目标上的绑定事件处理程序，然后再冒泡到document
  $(document)
    .on('click.bs.dropdown.data-api', clearMenus) // 点击冒泡到document时（即点击不在下拉框内时），隐藏下拉框
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() }) // 事件代理，在dropdown form上点击会阻止冒泡
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle) // 在含有data-toggle="dropdown"的元素除点击，会调用toggle方法。这里会先触发
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)
}(jQuery);
