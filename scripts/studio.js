$(function () {
  let logoSlider = $(".logo-carousel");

  logoSlider.slick({
    variableWidth: true,
    autoplay: true,
    autoplaySpeed: 0,
    speed: 2000,
    cssEase: "linear",
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    rows: 0,
    infinite: true,
  });
});

$(function () {
  $("#services").mouseenter(function () {
    $(".cursor").addClass("bg__dark");
  });

  $("#services").mouseleave(function () {
    $(".cursor").removeClass("bg__dark");
  });
});

$(function () {
  let content = $("#intro .content, #intro div.content, #intro h3");
  content.each(function () {
    let trigger = $(this);

    gsap.from(trigger, 1.7, {
      scrollTrigger: {
        trigger: trigger,
        start: "top 60%",
      },
      // opacity: 0,
      // y: 40,
      ease: "Power1.easeIn",
    });
    gsap.to(trigger, 1.7, {
      scrollTrigger: {
        trigger: trigger,
        start: "top 60%",
      },
      color: "#f0e1d1",
      ease: "Power1.easeIn",
    });
  });
});

function playVideoDesign() {
  let anim = $(".img-wrapper .design");
  gsap.to(anim, { display: "block", stagger: 0.125 });
}

function playVideoDev() {
  let anim = $(".img-wrapper .dev");
  gsap.to(anim, { display: "block", stagger: 0.125 });
}

function playVideoBranding() {
  let anim = $(".img-wrapper .branding");
  gsap.to(anim, { display: "block", stagger: 0.125 });
}

function playVideoIllustration() {
  let anim = $(".img-wrapper .illustration");
  gsap.to(anim, { display: "block", stagger: 0.125 });
}

function playVideoMarketing() {
  let anim = $(".img-wrapper .marketing");
  gsap.to(anim, { display: "block", stagger: 0.125 });
}

//start reverse

function revVideoDesign() {
  let anim = $(".img-wrapper .design");
  gsap.to(anim, { display: "none", stagger: -0.125 });
}

function revVideoDev() {
  let anim = $(".img-wrapper .dev");
  gsap.to(anim, { display: "none", stagger: -0.125 });
}

function revVideoBranding() {
  let anim = $(".img-wrapper .branding");
  gsap.to(anim, { display: "none", stagger: -0.125 });
}

function revVideoIllustration() {
  let anim = $(".img-wrapper .illustration");
  gsap.to(anim, { display: "none", stagger: -0.125 });
}

function revVideoMarketing() {
  let anim = $(".img-wrapper .marketing");
  gsap.to(anim, { display: "none", stagger: -0.125 });
}

$(function () {
  let services = $("body.studio #services .major .wrapper");

  services.each(function () {
    let trigger = $(this);
    var end = trigger.outerHeight();

    gsap.to(trigger, 1, {
      scrollTrigger: {
        trigger: trigger,
        start: "top 50%",
        end: "+=" + end,
        onToggle: function ({ isActive, direction }) {
          if (isActive) {
            if (direction > 0) {
              if (trigger.is(":nth-child(1)")) {
                playVideoDesign();
              } else if (trigger.is(":nth-child(2)")) {
                playVideoDev();
              } else if (trigger.is(":nth-child(3)")) {
                playVideoBranding();
              } else if (trigger.is(":nth-child(4)")) {
                playVideoIllustration();
              } else if (trigger.is(":nth-child(5)")) {
                playVideoMarketing();
              }
            } else {
              if (trigger.is(":nth-child(1)")) {
                revVideoDev();
              } else if (trigger.is(":nth-child(2)")) {
                revVideoBranding();
              } else if (trigger.is(":nth-child(3)")) {
                revVideoIllustration();
              } else if (trigger.is(":nth-child(4)")) {
                revVideoMarketing();
              }
            }
          }
        },
      },
    });
  });

  gsap.to($("body.studio #services .major .wrapper:first-of-type"), {
    scrollTrigger: {
      trigger: $("body.studio #services .major .wrapper:first-of-type"),
      start: "top 50%",
      onEnter: function () {
        $("#services").removeClass("bg__dark");
      },
      onLeaveBack: function () {
        $("#services").addClass("bg__dark");
      },
    },
  });

  gsap.to($("#team"), {
    scrollTrigger: {
      trigger: $("#team"),
      start: "top 25%",
      onEnter: function () {
        $("#team").addClass("bg__dark");
      },
      onLeaveBack: function () {
        $("#team").removeClass("bg__dark");
      },
    },
  });
});

$(function () {
  let trigger = $("#services").position().top - 70;
  let triggerEnd = trigger + $("#services").height();

  let nav = $(".viewport .nav");

  setInterval(() => {
    var matrix = $("#main")
      .css("transform")
      .replace(/[^0-9\-.,]/g, "")
      .split(",");
    var x = matrix[12] || matrix[4];
    var y = matrix[13] || matrix[5];

    if (y * -1 > trigger && y * -1 < triggerEnd) {
      nav.addClass("dark");
    } else {
      nav.removeClass("dark");
    }
  }, 100);
});

$(function () {
  let contact = $("#contact");

  gsap.to(contact, {
    scrollTrigger: {
      trigger: contact,
      start: "top 30%",
      onEnter: function () {
        contact.removeClass("uninit");
      },
    },
  });
});

$(function () {
  $(".members > .col").click(function () {
    var i = $(this).index();

    $(".members > .col").removeClass("active");
    $(this).addClass("active");

    $(".bio-container > .bio").removeClass("active");
    $(".bio-container > .bio").eq(i).addClass("active");
  });
});