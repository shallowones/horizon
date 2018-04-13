(function ($, ScrollMagic, TweenMax, window) {

  const PLAN_WIDTH = 1024

  const $window = $(window)

  /**
   * Функция, отвечающая за анимацию на главной странице
   */
  addEventListener('DOMContentLoaded', () => {
    const animate = (() => {

      return (controller, $animationGroup, number) => {
        if (!$animationGroup.length) return

        const fade = TweenMax.staggerTo($animationGroup, 0.5, {
          opacity: 1,
          transform: 'translateY(0)'
        }, 0.1)

        new ScrollMagic.Scene({
          triggerElement: '#animation-trigger-' + number,
          triggerHook: 0.2,
          reverse: false
        })
          .setTween(fade)
          .addTo(controller)
      }
    })()

    const controller = new ScrollMagic.Controller({
      addIndicators: true // плагин подключается только в режиме разработки
    })

    const $loader = $('.js-loader')
    $loader.addClass('start')

    addEventListener('load', () => {
      TweenMax.to($loader, 1, {
        opacity: 0,
        delay: 2,
        onComplete: () => {
          $loader.remove()

          const animationGroups = ['.animation-group-1', '.animation-group-2']
          animationGroups.forEach((el, index) => {
            animate(controller, $(el), index + 1)
          })

          // for responsive
          if ($window.width() <= PLAN_WIDTH) {
            controller.enabled(false)
          }
          $window.on('resize', (e) => {
            const isPlan = e.currentTarget.innerWidth <= PLAN_WIDTH && controller.enabled()
            controller.enabled(!isPlan)
            controller.update(true)
          })
        }
      })
    }, false)
  }, false)

})(jQuery, ScrollMagic, TweenMax, window)
