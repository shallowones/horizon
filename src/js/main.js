(function ($, Swiper, jBox, document, window) {

  $(function () {

    const ACTIVE = 'active'

    const SHOW = 'show'

    const OPEN = 'open'

    const PLAN_WIDTH = 1024

    const $document = $(document)

    const $window = $(window)

    const $page = $('.page')

    const is = (el) => { return typeof el !== 'undefined' && el.length }

    // weather presets
    {
      const $weatherButtons = $('.js-weather')
      const $weatherHidden = $('.weather-hidden')
      $weatherButtons.on('click', (e) => {
        const $this = $(e.currentTarget)
        const $target = $($this.data('target'))
        $weatherButtons.removeClass(ACTIVE)
        $weatherHidden.removeClass(SHOW)
        $this.addClass(ACTIVE)
        $target.addClass(SHOW)
      })
    }

    // clients
    {
      const $clientButtons = $('.js-clients')
      const $clientArea = $('.clients-area')
      $clientButtons.on('click', (e) => {
        const $this = $(e.currentTarget)
        if ($this.hasClass(ACTIVE)) {
          return;
        }
        const $target = $($this.data('target'))
        const html = $target.html()
        const areaHtml = $clientArea.html()
        const $clientActiveButton = $('.js-clients.active')
        if (areaHtml.length) {
          const $clientActiveTarget = $($clientActiveButton.data('target'))
          $clientActiveTarget.html(areaHtml)
        }
        $clientActiveButton.removeClass(ACTIVE)
        $clientArea.html(html)
        $this.addClass(ACTIVE)
        $target.html('')
      })
    }

    // accordion
    {
      $('.js-accordion').on('click', (e) => {
        const $this = $(e.currentTarget)
        const isActive = $this.hasClass(ACTIVE)
        $this.toggleClass(ACTIVE, !isActive)
        $this.parent().find('.accordion-hidden').slideToggle(isActive)
      })
    }

    // custom select
    {
      $('.js-select').SumoSelect()
    }

    // map pins
    {
      new jBox('Tooltip', {
        attach: '.js-pin',
        trigger: 'click',
        offset: {
          x: 0,
          y: 29
        },
        zIndex: 10,
        closeOnClick: 'body',
        animation: 'move',
        fade: 300,
        onInit: function () {
          const tooltip = this
          const parents = [$document.find('html'), $page]
          parents.some(($parent) => {
            const isScrolling = $parent.css('overflow-y') === 'auto'
            if (isScrolling) {
              $parent.on( 'scroll', tooltip.close.bind(tooltip) )
            }
            return isScrolling
          })
        },
        onOpen: function () {
          const $source = this.source
          const html = $source.find('div[hidden]').html()
          this.setContent(html)
          this.content.find('i').on('click', this.close.bind(this))
        }
      })
    }

    // slider
    {
      new Swiper('.js-slider', {
        slidesPerView: 'auto',
        navigation: {
          nextEl: '.js-slider-next',
          prevEl: '.js-slider-prev'
        }
      })
    }

    // mobile
    {
      const $mobile = $('.mobile')
      const $mobileButton = $('.js-mobile')

      // button
      $mobileButton.on('click', (e) => {
        const $this = $(e.currentTarget)
        const isOpen = $this.hasClass(OPEN)
        $this.toggleClass(OPEN, !isOpen)
        $mobile.slideToggle(!isOpen)
      })

      // menu
      $mobile.find('.mobile-menu button').on('click', (e) => {
        const $this = $(e.currentTarget)
        const isOpen = $this.hasClass(OPEN)
        $this.toggleClass(OPEN, !isOpen)
        $this.parent().find('.mobile-menu-sub').slideToggle(!isOpen)
      })

      // close menu on resize to pc
      $window.resize((e) => {
        if (e.currentTarget.innerWidth > PLAN_WIDTH) {
          $mobileButton.removeClass(OPEN)
          $mobile.removeAttr('style')
          $mobile.find('.mobile-menu button').removeClass(OPEN)
          $mobile.find('.mobile-menu-sub').removeAttr('style')
        }
      })
    }

    // search
    {
      const $searchButtons = $('.js-search')
      $searchButtons.on('click', (e) => {
        const $this = $(e.currentTarget)
        const $target = $($this.data('target'))
        const isActive = $this.hasClass(ACTIVE)
        $this.toggleClass(ACTIVE, !isActive)
        $target.toggleClass(SHOW, !isActive)
        if (!isActive) {
          setTimeout(() => {
            $target.find('input').focus()
          }, 500)
        }
      })
      const closeSearchForm = () => {
        $searchButtons.each((index, el) => {
          const $this = $(el)
          const $target = $($this.data('target'))
          $this.removeClass(ACTIVE)
          $target.removeClass(SHOW)
        })
      }
      $document.scroll(closeSearchForm)
      $window.resize(() => {
        if (document.activeElement.type !== 'text' && $searchButtons.hasClass(ACTIVE)) {
          closeSearchForm()
        }
      })
    }

    // popup + file custom
    {
      const AJAX_COMPLETE_EVENT = 'procurementAjaxComplete'
      const MODAL = '.js-modal'

      const fileCustom = ($el) => {
        const $file = $el.find('.js-file')
        $file.jfilestyle({
          text: 'Выбрать...',
          placeholder: 'Выберите файл',
          dragdrop: false
        })
      }
      fileCustom($document)

      const modal = new jBox('Modal', {
        attach: MODAL,
        closeOnClick: false,
        closeButton: false,
        onOpen: function () {
          const $source = this.source
          const $target = $source.parent().find('[hidden]')
          $target.find('.js-file').jfilestyle('destroy')
          const html = $target.html()
          $target.html('')
          this.setContent(html)
          fileCustom(this.content)
          this.content.find('[data-close]').on('click', this.close.bind(this))

          // rerender captcha
          const gCaptcha = window.grecaptcha
          const $captcha = this.content.find('.g-recaptcha')
          if (is($captcha) && typeof gCaptcha !== 'undefined' && gCaptcha.hasOwnProperty('render')) {
            $captcha.html('')
            gCaptcha.render($captcha[0])
          }
        },
        onCloseComplete: function () {
          const $source = this.source
          const $target = $source.parent().find('[hidden]')
          this.content.find('.js-file').jfilestyle('destroy')
          const html = this.content.html()
          this.setContent('')
          $target.html(html)
        }
      })

      $document.on(AJAX_COMPLETE_EVENT, (e) => {
        const $this = $(e.currentTarget)
        modal.attach($this.find(MODAL))
      })
    }

    // floating menu
    {
      const SCROLL_TOP = 'fixed-scroll-top'
      const SCROLL_BOTTOM = 'fixed-scroll-bottom'
      const DIFF_MORE = 200

      const $float = $('.header-bottom__wrap')
      const $headerBottom = $('.header-bottom')
      const plusPixels = $headerBottom.offset().top

      let previousPosition = 0
      $page.scroll((e) => {
        const headerTopPosition = $headerBottom.offset().top
        const currentPosition = e.currentTarget.scrollTop
        if (currentPosition > headerTopPosition + plusPixels) {
          if (previousPosition > currentPosition) {
            if (previousPosition - currentPosition > DIFF_MORE + headerTopPosition) {
              $float.removeClass(SCROLL_BOTTOM)
              $float.addClass(SCROLL_TOP)
              previousPosition = currentPosition
            }
          } else {
            if ($float.hasClass(SCROLL_TOP)) {
              $float.removeClass(SCROLL_TOP)
              $float.addClass(SCROLL_BOTTOM)
            }
            previousPosition = currentPosition
          }
        } else {
          $float.removeClass(SCROLL_TOP + ' ' + SCROLL_BOTTOM)
        }
      })
    }

  })
})(jQuery, Swiper, jBox, document, window)
