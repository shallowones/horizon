"use strict";!function(i){i(function(){var c="active",s="show",r=i(".js-weather"),n=i(".weather-hidden");r.on("click",function(a){var t=i(a.currentTarget),e=i(t.data("target"));r.removeClass(c),n.removeClass(s),t.addClass(c),e.addClass(s)});var a=i(".js-clients"),l=(i(".js-clients.active"),i(".clients-area"));a.on("click",function(a){var t=i(a.currentTarget),e=i(t.data("target")),s=e.html(),r=l.html(),n=i(".js-clients.active");r.length&&i(n.data("target")).html(r);n.removeClass(c),l.html(s),t.addClass(c),e.html("")}),i(".js-accordion").on("click",function(a){var t=i(a.currentTarget),e=t.hasClass(c);t.toggleClass(c,!e),t.parent().find(".accordion-hidden").slideToggle(e)})})}(jQuery);