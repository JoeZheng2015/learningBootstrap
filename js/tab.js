/* ========================================================================
 * Bootstrap: tab.js v3.3.5
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element)
    // jscs:enable requireDollarBeforejQueryAssignment
  }

  Tab.VERSION = '3.3.5'

  Tab.TRANSITION_DURATION = 150
  /**
   * 找到需要activate的元素，以及其container元素
   * 调用两次activate函数，一次切换tab，一次切换content 
   * @return {undefined} 没有返回值
   */
  Tab.prototype.show = function () {
    var $this    = this.element // 默认的tab，或用jquery绑定的元素
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')// 每个tab对应的content

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }
    // 如果点击的是自己，则不没有变化（即不执行后面的代码）
    if ($this.parent('li').hasClass('active')) return
    var $previous = $ul.find('.active:last a')
    // 自定义触发前事件并触发
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(selector)
    // 传入当前tab的a标签的li，及其container，完成tab页切换
    this.activate($this.closest('li'), $ul)
    // 同上，完成content页的切换，且自定义触发后事件
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      })
    })
  }
  // 负责去除container中的active类，和为element增加active类
  // 利用transitionEnd完美衔接当前元素和下一个元素的过渡
  /**
   * 负责去除container内的active类，激活element，然后调用callback（即自定义的触发后事件)
   * @param  {[type]}   element   [description]
   * @param  {[type]}   container [description]
   * @param  {Function} callback  [description]
   * @return {[type]}             [description]
   */
  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
          .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
            .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
            .attr('aria-expanded', true)
      }

      callback && callback()
    }
    // 如果有过渡效果，等待当前元素消失，触发transitionEnd事件，然后再出现
    // 如果是没有过渡效果的，直接切换active。
    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()
    // 使得当前的显示的元素渐隐
    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================
  /**
   * 遍历初始化对应的Tab实例，并把实例存在其data里（即Property里）
   * 遍历jquery对象组，把对应的dom对象传入Tab构造函数
   * @param {string} option 有两种情况：自带的绑定，传入'show'，则会在触发点击事件是调用show()函数
   *                        用js自定义如：$el.tab()，则只是绑定事件
   */
  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============
  // 这种方式，使得Plugin这个构造函数作为一个入口
  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);
