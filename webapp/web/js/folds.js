"use strict";

const $ = require("jquery");

$(function() {
  $(".reveal").click(function(e) {
    let $this = $(this);
    let target = $this.attr("data-show");
    let $target = $(target);

    let shouldOpen = $this.hasClass("closed");

    $(".fold").slideUp(500).promise().done(function() {
      $(".reveal.open").removeClass("open").addClass("closed");
      if (shouldOpen) {
        $target.slideDown(500).promise().done(function() {
          $this.removeClass("closed").addClass("open");
        });
      }
    });

    e.preventDefault();
  });
});

