(function ($) {
  $(function () {

    const ACTIVE = 'active'

    const SHOW = 'show'

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
      const $clientActiveButton = $('.js-clients.active')
      const $clientArea = $('.clients-area')
      $clientButtons.on('click', (e) => {
        const $this = $(e.currentTarget)
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

  })
})(jQuery)
