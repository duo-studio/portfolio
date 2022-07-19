$(function () {
  if ($(window).width() < 901) {
    $("#contact.contact, #contact #thank-you").height(window.innerHeight - 80);
  }
});

$(function () {
  function projectAnimation() {
    var tl = gsap.timeline();
    tl.set("#contact .anim__project", { clearProps: "all" });
    tl.to(
      "#contact .anim:not(.init), #contact .anim-wrap.tag .anim, .anim__return.init",
      {
        yPercent: -100,
        opacity: 0,
        stagger: 0.2,
        ease: "Power1.easeOut",
      }
    );
    // tl.set("#contact .major", { padding: "0" });
    tl.set(".anim-wrap.tag", { display: "none" });
    tl.set("#contact .anim-wrap", {
      height: $(
        "#contact.contact .major .anim-wrap:not(:first-of-type) h2"
      ).height(),
    });
    // tl.set("#contact .major .container", { height: 540 });
    tl.to("#contact .anim__project", {
      y: 0,
      opacity: 1,
      stagger: 0.2,
      ease: "Power1.easeOut",
    });
    tl.to("#contact .major aside", 0.5, { opacity: 0 }, "-=1.5");
    tl.set("form.project", { display: "flex" });
    tl.set("#contact .major aside", { display: "none" });
    tl.to("form.project", 0.7, { opacity: 1 });
    tl.set("#contact .anim", { className: "+=anim init" });
    tl.set("#contact .anim__project", { className: "+=anim__project init" });
    tl.set("#contact .anim, .anim__return", { clearProps: "all" });
    tl.set(".anim__return", { className: "+=anim__return init" });
  }

  function helloAnimation() {
    var tl = gsap.timeline();
    tl.set("#contact .anim__hello", { clearProps: "all" });
    tl.to(
      "#contact .anim:not(.init), #contact .anim-wrap.tag .anim, .anim__return.init",
      {
        yPercent: -100,
        opacity: 0,
        stagger: 0.2,
        ease: "Power1.easeOut",
      }
    );
    // tl.set("#contact .major", { padding: "0" });
    tl.set(".anim-wrap.tag", { display: "none" });
    tl.set("#contact .anim-wrap", {
      height: $(
        "#contact.contact .major .anim-wrap:not(:first-of-type) h2"
      ).height(),
    });
    tl.to("#contact .anim__hello", {
      y: 0,
      opacity: 1,
      stagger: 0.2,
      ease: "Power1.easeOut",
    });
    tl.to("#contact .major aside", 0.5, { opacity: 0 }, "-=1.5");
    tl.set("form.hello", { display: "flex" });
    tl.set("#contact .major aside", { display: "none" });
    tl.to("form.hello", 0.7, { opacity: 1 });
    tl.set("#contact .anim", { className: "+=anim init" });
    tl.set("#contact .anim__hello", { className: "+=anim__hello init" });
    tl.set("#contact .anim, .anim__return", { clearProps: "all" });
    tl.set(".anim__return", { className: "+=anim__return init" });
  }

  function prevAnimation() {
    var tl = gsap.timeline();
    tl.to("#contact .anim__project.init, #contact .anim__hello.init", {
      yPercent: -100,
      opacity: 0,
      stagger: 0.2,
      ease: "Power1.easeOut",
    });
    // tl.set("#contact .major", { padding: "4em 0 0" });
    tl.set(".anim-wrap.tag", { display: "block", height: "unset" });
    // tl.set("#contact .major .container", { height: 360 });
    tl.set("#contact .anim-wrap:not(:first-of-type)", {
      height: $("#contact .anim-wrap:not(:first-of-type) h1").height(),
    });
    tl.to("#contact .major form, #contact .major aside", {
      clearProps: "display",
    });
    tl.to(
      "#contact .anim__return, .anim-wrap.tag .anim",
      {
        y: 0,
        opacity: 1,
        stagger: 0.2,
        ease: "Power1.easeOut",
      },
      "-=.5"
    );
    tl.to("#contact .major form", 0.7, { opacity: 0 }, "-=1.5");
    tl.to("#contact .major aside", {
      opacity: 1,
      stagger: 0.3,
      ease: "Power1.easeOut",
    });
    tl.set("#contact .anim__project", { className: "-=anim__project" });
  }

  $("button.project").click(function () {
    projectAnimation();
  });

  $("button.hello").click(function () {
    helloAnimation();
  });

  $(".prev").click(function () {
    prevAnimation();
  });
});

$(function () {
  let budget = $("form .budget");
  let btn = budget.find(".btn-round");
  let input = budget.find("input");

  input.focus(function () {
    budget.addClass("active");
  });

  btn.click(function () {
    let val = $(this).attr("value");
    input.attr("value", val);
  });

  input.focusout(function () {
    setTimeout(() => {
      budget.removeClass("active");
    }, 150);
  });
});

$(function () {
  let service = $("form .checkbox-wrapper .btn-round");

  service.click(function () {
    $(this).toggleClass("active");
    var i = $(this).index();

    if ($(this).hasClass("active")) {
      $(".checkbox-wrapper .checkboxes > input").eq(i).prop("checked", true);
    } else {
      $(".checkbox-wrapper .checkboxes > input").eq(i).prop("checked", false);
    }
  });
});

// form submission

$("form").submit(function (e) {
  e.preventDefault();

  var $form = $(this);
  let name = $form.find(".name").val().split(" ", 1)[0];

  let anim = $(".anim__fixed");
  let form = $("#contact.contact .major");
  let thankYou = $("#thank-you");

  $.post($form.attr("action"), $form.serialize()).then(function () {
    window.scrollTo(0, 0);

    var tl = gsap.timeline({
      onStart: function () {
        $("#thank-you .name").text(name);
        anim.addClass("shake");
      },
    });
    tl.to(anim, 2, { marginTop: "-200vh" });
    tl.set(thankYou, { zIndex: 2 });
    tl.to(thankYou, { opacity: 1, y: 0, zIndex: 2 });

    gsap.to(form, { y: -20, opacity: 0 });
  });
});