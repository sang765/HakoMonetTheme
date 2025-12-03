function _toConsumableArray(t) {
    return (
        _arrayWithoutHoles(t) ||
        _iterableToArray(t) ||
        _unsupportedIterableToArray(t) ||
        _nonIterableSpread()
    );
}
function _nonIterableSpread() {
    throw new TypeError(
        "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
    );
}
function _unsupportedIterableToArray(t, e) {
    if (t) {
        if ("string" == typeof t) return _arrayLikeToArray(t, e);
        var n = Object.prototype.toString.call(t).slice(8, -1);
        return (
            "Object" === n && t.constructor && (n = t.constructor.name),
            "Map" === n || "Set" === n
                ? Array.from(t)
                : "Arguments" === n ||
                    /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                  ? _arrayLikeToArray(t, e)
                  : void 0
        );
    }
}
function _iterableToArray(t) {
    if (
        ("undefined" != typeof Symbol && null != t[Symbol.iterator]) ||
        null != t["@@iterator"]
    )
        return Array.from(t);
}
function _arrayWithoutHoles(t) {
    if (Array.isArray(t)) return _arrayLikeToArray(t);
}
function _arrayLikeToArray(t, e) {
    (null == e || e > t.length) && (e = t.length);
    for (var n = 0, o = new Array(e); n < e; n++) o[n] = t[n];
    return o;
}
function _regeneratorRuntime() {
    "use strict";
    _regeneratorRuntime = function () {
        return e;
    };
    var t,
        e = {},
        n = Object.prototype,
        o = n.hasOwnProperty,
        r =
            Object.defineProperty ||
            function (t, e, n) {
                t[e] = n.value;
            },
        i = "function" == typeof Symbol ? Symbol : {},
        a = i.iterator || "@@iterator",
        s = i.asyncIterator || "@@asyncIterator",
        c = i.toStringTag || "@@toStringTag";
    function l(t, e, n) {
        return (
            Object.defineProperty(t, e, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0,
            }),
            t[e]
        );
    }
    try {
        l({}, "");
    } catch (t) {
        l = function (t, e, n) {
            return (t[e] = n);
        };
    }
    function m(t, e, n, o) {
        var i = e && e.prototype instanceof v ? e : v,
            a = Object.create(i.prototype),
            s = new L(o || []);
        return (r(a, "_invoke", { value: T(t, n, s) }), a);
    }
    function u(t, e, n) {
        try {
            return { type: "normal", arg: t.call(e, n) };
        } catch (t) {
            return { type: "throw", arg: t };
        }
    }
    e.wrap = m;
    var d = "suspendedStart",
        f = "suspendedYield",
        h = "executing",
        p = "completed",
        g = {};
    function v() {}
    function y() {}
    function $() {}
    var k = {};
    l(k, a, function () {
        return this;
    });
    var b = Object.getPrototypeOf,
        _ = b && b(b(O([])));
    _ && _ !== n && o.call(_, a) && (k = _);
    var w = ($.prototype = v.prototype = Object.create(k));
    function x(t) {
        ["next", "throw", "return"].forEach(function (e) {
            l(t, e, function (t) {
                return this._invoke(e, t);
            });
        });
    }
    function C(t, e) {
        function n(r, i, a, s) {
            var c = u(t[r], t, i);
            if ("throw" !== c.type) {
                var l = c.arg,
                    m = l.value;
                return m && "object" == _typeof(m) && o.call(m, "__await")
                    ? e.resolve(m.__await).then(
                          function (t) {
                              n("next", t, a, s);
                          },
                          function (t) {
                              n("throw", t, a, s);
                          },
                      )
                    : e.resolve(m).then(
                          function (t) {
                              ((l.value = t), a(l));
                          },
                          function (t) {
                              return n("throw", t, a, s);
                          },
                      );
            }
            s(c.arg);
        }
        var i;
        r(this, "_invoke", {
            value: function (t, o) {
                function r() {
                    return new e(function (e, r) {
                        n(t, o, e, r);
                    });
                }
                return (i = i ? i.then(r, r) : r());
            },
        });
    }
    function T(e, n, o) {
        var r = d;
        return function (i, a) {
            if (r === h) throw new Error("Generator is already running");
            if (r === p) {
                if ("throw" === i) throw a;
                return { value: t, done: !0 };
            }
            for (o.method = i, o.arg = a; ; ) {
                var s = o.delegate;
                if (s) {
                    var c = S(s, o);
                    if (c) {
                        if (c === g) continue;
                        return c;
                    }
                }
                if ("next" === o.method) o.sent = o._sent = o.arg;
                else if ("throw" === o.method) {
                    if (r === d) throw ((r = p), o.arg);
                    o.dispatchException(o.arg);
                } else "return" === o.method && o.abrupt("return", o.arg);
                r = h;
                var l = u(e, n, o);
                if ("normal" === l.type) {
                    if (((r = o.done ? p : f), l.arg === g)) continue;
                    return { value: l.arg, done: o.done };
                }
                "throw" === l.type &&
                    ((r = p), (o.method = "throw"), (o.arg = l.arg));
            }
        };
    }
    function S(e, n) {
        var o = n.method,
            r = e.iterator[o];
        if (r === t)
            return (
                (n.delegate = null),
                ("throw" === o &&
                    e.iterator.return &&
                    ((n.method = "return"),
                    (n.arg = t),
                    S(e, n),
                    "throw" === n.method)) ||
                    ("return" !== o &&
                        ((n.method = "throw"),
                        (n.arg = new TypeError(
                            "The iterator does not provide a '" +
                                o +
                                "' method",
                        )))),
                g
            );
        var i = u(r, e.iterator, n.arg);
        if ("throw" === i.type)
            return (
                (n.method = "throw"),
                (n.arg = i.arg),
                (n.delegate = null),
                g
            );
        var a = i.arg;
        return a
            ? a.done
                ? ((n[e.resultName] = a.value),
                  (n.next = e.nextLoc),
                  "return" !== n.method && ((n.method = "next"), (n.arg = t)),
                  (n.delegate = null),
                  g)
                : a
            : ((n.method = "throw"),
              (n.arg = new TypeError("iterator result is not an object")),
              (n.delegate = null),
              g);
    }
    function j(t) {
        var e = { tryLoc: t[0] };
        (1 in t && (e.catchLoc = t[1]),
            2 in t && ((e.finallyLoc = t[2]), (e.afterLoc = t[3])),
            this.tryEntries.push(e));
    }
    function E(t) {
        var e = t.completion || {};
        ((e.type = "normal"), delete e.arg, (t.completion = e));
    }
    function L(t) {
        ((this.tryEntries = [{ tryLoc: "root" }]),
            t.forEach(j, this),
            this.reset(!0));
    }
    function O(e) {
        if (e || "" === e) {
            var n = e[a];
            if (n) return n.call(e);
            if ("function" == typeof e.next) return e;
            if (!isNaN(e.length)) {
                var r = -1,
                    i = function n() {
                        for (; ++r < e.length; )
                            if (o.call(e, r))
                                return ((n.value = e[r]), (n.done = !1), n);
                        return ((n.value = t), (n.done = !0), n);
                    };
                return (i.next = i);
            }
        }
        throw new TypeError(_typeof(e) + " is not iterable");
    }
    return (
        (y.prototype = $),
        r(w, "constructor", { value: $, configurable: !0 }),
        r($, "constructor", { value: y, configurable: !0 }),
        (y.displayName = l($, c, "GeneratorFunction")),
        (e.isGeneratorFunction = function (t) {
            var e = "function" == typeof t && t.constructor;
            return (
                !!e &&
                (e === y || "GeneratorFunction" === (e.displayName || e.name))
            );
        }),
        (e.mark = function (t) {
            return (
                Object.setPrototypeOf
                    ? Object.setPrototypeOf(t, $)
                    : ((t.__proto__ = $), l(t, c, "GeneratorFunction")),
                (t.prototype = Object.create(w)),
                t
            );
        }),
        (e.awrap = function (t) {
            return { __await: t };
        }),
        x(C.prototype),
        l(C.prototype, s, function () {
            return this;
        }),
        (e.AsyncIterator = C),
        (e.async = function (t, n, o, r, i) {
            void 0 === i && (i = Promise);
            var a = new C(m(t, n, o, r), i);
            return e.isGeneratorFunction(n)
                ? a
                : a.next().then(function (t) {
                      return t.done ? t.value : a.next();
                  });
        }),
        x(w),
        l(w, c, "Generator"),
        l(w, a, function () {
            return this;
        }),
        l(w, "toString", function () {
            return "[object Generator]";
        }),
        (e.keys = function (t) {
            var e = Object(t),
                n = [];
            for (var o in e) n.push(o);
            return (
                n.reverse(),
                function t() {
                    for (; n.length; ) {
                        var o = n.pop();
                        if (o in e) return ((t.value = o), (t.done = !1), t);
                    }
                    return ((t.done = !0), t);
                }
            );
        }),
        (e.values = O),
        (L.prototype = {
            constructor: L,
            reset: function (e) {
                if (
                    ((this.prev = 0),
                    (this.next = 0),
                    (this.sent = this._sent = t),
                    (this.done = !1),
                    (this.delegate = null),
                    (this.method = "next"),
                    (this.arg = t),
                    this.tryEntries.forEach(E),
                    !e)
                )
                    for (var n in this)
                        "t" === n.charAt(0) &&
                            o.call(this, n) &&
                            !isNaN(+n.slice(1)) &&
                            (this[n] = t);
            },
            stop: function () {
                this.done = !0;
                var t = this.tryEntries[0].completion;
                if ("throw" === t.type) throw t.arg;
                return this.rval;
            },
            dispatchException: function (e) {
                if (this.done) throw e;
                var n = this;
                function r(o, r) {
                    return (
                        (s.type = "throw"),
                        (s.arg = e),
                        (n.next = o),
                        r && ((n.method = "next"), (n.arg = t)),
                        !!r
                    );
                }
                for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                    var a = this.tryEntries[i],
                        s = a.completion;
                    if ("root" === a.tryLoc) return r("end");
                    if (a.tryLoc <= this.prev) {
                        var c = o.call(a, "catchLoc"),
                            l = o.call(a, "finallyLoc");
                        if (c && l) {
                            if (this.prev < a.catchLoc)
                                return r(a.catchLoc, !0);
                            if (this.prev < a.finallyLoc)
                                return r(a.finallyLoc);
                        } else if (c) {
                            if (this.prev < a.catchLoc)
                                return r(a.catchLoc, !0);
                        } else {
                            if (!l)
                                throw new Error(
                                    "try statement without catch or finally",
                                );
                            if (this.prev < a.finallyLoc)
                                return r(a.finallyLoc);
                        }
                    }
                }
            },
            abrupt: function (t, e) {
                for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                    var r = this.tryEntries[n];
                    if (
                        r.tryLoc <= this.prev &&
                        o.call(r, "finallyLoc") &&
                        this.prev < r.finallyLoc
                    ) {
                        var i = r;
                        break;
                    }
                }
                i &&
                    ("break" === t || "continue" === t) &&
                    i.tryLoc <= e &&
                    e <= i.finallyLoc &&
                    (i = null);
                var a = i ? i.completion : {};
                return (
                    (a.type = t),
                    (a.arg = e),
                    i
                        ? ((this.method = "next"),
                          (this.next = i.finallyLoc),
                          g)
                        : this.complete(a)
                );
            },
            complete: function (t, e) {
                if ("throw" === t.type) throw t.arg;
                return (
                    "break" === t.type || "continue" === t.type
                        ? (this.next = t.arg)
                        : "return" === t.type
                          ? ((this.rval = this.arg = t.arg),
                            (this.method = "return"),
                            (this.next = "end"))
                          : "normal" === t.type && e && (this.next = e),
                    g
                );
            },
            finish: function (t) {
                for (var e = this.tryEntries.length - 1; e >= 0; --e) {
                    var n = this.tryEntries[e];
                    if (n.finallyLoc === t)
                        return (
                            this.complete(n.completion, n.afterLoc),
                            E(n),
                            g
                        );
                }
            },
            catch: function (t) {
                for (var e = this.tryEntries.length - 1; e >= 0; --e) {
                    var n = this.tryEntries[e];
                    if (n.tryLoc === t) {
                        var o = n.completion;
                        if ("throw" === o.type) {
                            var r = o.arg;
                            E(n);
                        }
                        return r;
                    }
                }
                throw new Error("illegal catch attempt");
            },
            delegateYield: function (e, n, o) {
                return (
                    (this.delegate = {
                        iterator: O(e),
                        resultName: n,
                        nextLoc: o,
                    }),
                    "next" === this.method && (this.arg = t),
                    g
                );
            },
        }),
        e
    );
}
function _typeof(t) {
    return (
        (_typeof =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                ? function (t) {
                      return typeof t;
                  }
                : function (t) {
                      return t &&
                          "function" == typeof Symbol &&
                          t.constructor === Symbol &&
                          t !== Symbol.prototype
                          ? "symbol"
                          : typeof t;
                  }),
        _typeof(t)
    );
}
function asyncGeneratorStep(t, e, n, o, r, i, a) {
    try {
        var s = t[i](a),
            c = s.value;
    } catch (t) {
        return void n(t);
    }
    s.done ? e(c) : Promise.resolve(c).then(o, r);
}
function _asyncToGenerator(t) {
    return function () {
        var e = this,
            n = arguments;
        return new Promise(function (o, r) {
            var i = t.apply(e, n);
            function a(t) {
                asyncGeneratorStep(i, o, r, a, s, "next", t);
            }
            function s(t) {
                asyncGeneratorStep(i, o, r, a, s, "throw", t);
            }
            a(void 0);
        });
    };
}
function checkDomain() {
    return _checkDomain.apply(this, arguments);
}
function _checkDomain() {
    return (_checkDomain = _asyncToGenerator(
        _regeneratorRuntime().mark(function t() {
            var e, n, o, r, i, a, s;
            return _regeneratorRuntime().wrap(
                function (t) {
                    for (;;)
                        switch ((t.prev = t.next)) {
                            case 0:
                                ((e = window.location.host),
                                    (n = [
                                        "docln.net",
                                        "docln.sbs",
                                        "docln.top",
                                        "ln.hako.vn",
                                    ]).unshift(e),
                                    (o = 0),
                                    (r = n));
                            case 4:
                                if (!(o < r.length)) {
                                    t.next = 24;
                                    break;
                                }
                                return (
                                    (i = r[o]),
                                    (t.prev = 6),
                                    (t.next = 9),
                                    fetch("https://".concat(i, "/api/health"))
                                );
                            case 9:
                                return ((a = t.sent), (t.next = 12), a.json());
                            case 12:
                                if (
                                    ((s = t.sent),
                                    console.log(s),
                                    "ok" !== s.status)
                                ) {
                                    t.next = 16;
                                    break;
                                }
                                return t.abrupt("return", i != e && i);
                            case 16:
                                t.next = 21;
                                break;
                            case 18:
                                return (
                                    (t.prev = 18),
                                    (t.t0 = t.catch(6)),
                                    t.abrupt("continue", 21)
                                );
                            case 21:
                                (o++, (t.next = 4));
                                break;
                            case 24:
                                return t.abrupt("return", null);
                            case 25:
                            case "end":
                                return t.stop();
                        }
                },
                t,
                null,
                [[6, 18]],
            );
        }),
    )).apply(this, arguments);
}
function listab(t, e) {
    ((e = e || 0),
        $(t + " .tab-title")
            .filter(function (t) {
                return t != e;
            })
            .addClass("tab-off"),
        $(".tab-content").eq(e).removeClass("none"),
        $(".tab-content")
            .filter(function (t) {
                return t != e;
            })
            .hide(),
        $(t + " .tab-title").on("click", function () {
            var e = $(this).data("tab-index");
            ($(this).hasClass("tab-off") &&
                ($(t + " .tab-title").addClass("tab-off"),
                $(this).removeClass("tab-off")),
                $(".tab-content").hide(),
                $("#tab-content-" + e).fadeIn("slow"));
        }));
}
function scrollhide(t) {
    var e,
        n = 0;
    $(t).outerHeight();
    ($(window).scroll(function (t) {
        e = !0;
    }),
        setInterval(function () {
            e &&
                (!(function () {
                    var e = $(this).scrollTop();
                    if (Math.abs(n - e) <= 1) return;
                    e >= n
                        ? $(t).hide()
                        : e + $(window).height() < $(document).height() &&
                          $(t).show();
                    n = e;
                })(),
                (e = !1));
        }, 250));
}
function scrollmenuside(t) {
    var e,
        n = 0;
    $(t).outerHeight();
    ($(window).scroll(function (t) {
        e = !0;
    }),
        setInterval(function () {
            e &&
                (!(function () {
                    var e = $(this).scrollTop();
                    if (Math.abs(n - e) <= 1) return;
                    e >= n
                        ? ($(t).hide(), $("#mainpart").removeClass("menuside"))
                        : e + $(window).height() < $(document).height() &&
                          ($(t).show(), $("#mainpart").addClass("menuside"));
                    n = e;
                })(),
                (e = !1));
        }, 250));
}
function getParameterByName(t, e) {
    (e || (e = window.location.href), (t = t.replace(/[\[\]]/g, "\\$&")));
    var n = new RegExp("[?&]" + t + "(=([^&#]*)|&|#|$)").exec(e);
    return n
        ? n[2]
            ? decodeURIComponent(n[2].replace(/\+/g, " "))
            : ""
        : null;
}
function replaceCdnDomains(t) {
    return (
        [
            ["c1.hako.re", "i.hako.vip"],
            ["i.docln.net", "i.hako.vip"],
            ["i2.docln.net", "i2.hako.vip"],
            ["i.hako.vn", "i2.hako.vip"],
        ].forEach(function (e) {
            t = t.replace(e[0], e[1]);
        }),
        t
    );
}
if (
    ($(function () {
        ($("img").each(function () {
            var t = $(this).attr("src");
            t && ((t = replaceCdnDomains(t)), $(this).attr("src", t));
        }),
            $("div[data-bg]").each(function () {
                var t = $(this).data("bg");
                t && ((t = replaceCdnDomains(t)), $(this).attr("data-bg", t));
            }),
            $("div.content.img-in-ratio, div.content.img-contain-ratio").each(
                function () {
                    var t = $(this).attr("style");
                    t && ((t = replaceCdnDomains(t)), $(this).attr("style", t));
                },
            ));
    }),
    $(document).on("lazyloaded", function (t) {
        var e = t.target.getAttribute("data-bg");
        e &&
            (t.target.style.backgroundImage =
                "url(" + replaceCdnDomains(e) + ")");
    }),
    $(document).ajaxError(function (t, e, n, o) {
        var r = "",
            i = e.responseJSON;
        if (i) {
            if ("object" === _typeof(i.errors))
                for (var a in i.errors)
                    i.errors.hasOwnProperty(a) &&
                        i.errors[a].forEach(function (t) {
                            r += t + "\n";
                        });
            else r = i.message;
            alert(r);
        } else console.log(e.statusText);
    }),
    $("time.timeago").timeago(),
    (token = $('meta[name="csrf-token"]').attr("content")),
    $("#mainpart").css({
        "min-height": window.innerHeight - $("#footer").outerHeight(!0),
    }),
    $(window).on("resize", function () {
        $("#mainpart").css({
            "min-height": window.innerHeight - $("#footer").outerHeight(!0),
        });
    }),
    !$("main.reading-page").length)
) {
    var headroom = new Headroom(document.querySelector("#navbar"));
    headroom.init();
}
var sliderOptions = {
    controls: !1,
    mouseDrag: !0,
    navPosition: "bottom",
    slideBy: "page",
};
if (
    ($(".daily-recent_views .slider").length &&
        tns(
            Object.assign(
                {
                    container: ".daily-recent_views .slider",
                    items: 4,
                    loop: !1,
                    responsive: {
                        0: { items: 2 },
                        768: { items: 3 },
                        980: { items: 4 },
                        1200: { items: 4 },
                    },
                },
                sliderOptions,
            ),
        ),
    $(".js-finished-series .slider").length &&
        tns(
            Object.assign(
                {
                    container: ".js-finished-series .slider",
                    items: 8,
                    loop: !1,
                    responsive: {
                        0: { items: 2 },
                        768: { items: 4 },
                        980: { items: 6 },
                        1200: { items: 8 },
                    },
                },
                sliderOptions,
            ),
        ),
    $(".mobile-toggle header").click(function () {
        ($(this).parent().find(".summary.at-series").toggle(),
            $(this).parent().find(".listall_summary.at-volume").toggle(),
            $(this).parent().find("main").toggle());
    }),
    $(window).on("scroll", function () {
        $(window).scrollTop() > 50
            ? $(".backtoTop").show()
            : $(".backtoTop").hide();
    }),
    $(".backtoTop").on("click", function () {
        var t = $(this).data("scrollto");
        $("html, body").animate({ scrollTop: $(t).offset().top });
    }),
    $(
        "#sidenav-icon, .nav-user_icon, #noti-icon, .nav-has-submenu, #guest-menu",
    ).on("click", function (t) {
        t.stopPropagation();
        var e = $(this),
            n = e.find(".hidden-block");
        (e.parents(".hidden-block").first().is(":visible") ||
            ($(".active").not(e).removeClass("active"),
            $(".hidden-block").not(n).addClass("none")),
            e.toggleClass("active"),
            n.toggleClass("none"));
    }),
    $(document).on("click", function () {
        ($("#navbar .hidden-block").addClass("none"),
            $("#navbar .active").removeClass("active"));
    }),
    $("div.navbar-search").on("click", function (t) {
        t.stopPropagation();
    }),
    $(".nightmode-toggle").on("click", function (t) {
        (t.stopPropagation(),
            $(this)
                .find(".toggle-icon")
                .find("i")
                .toggleClass("fa-toggle-off fa-toggle-on"),
            Cookies.get("night_mode")
                ? (Cookies.remove("night_mode"),
                  $("#night-mode-css").remove(),
                  $("html").removeClass("dark"))
                : (Cookies.set("night_mode", !0, { expires: 365 }),
                  $("html").addClass("dark"),
                  window.location.reload()));
    }),
    $(document).ajaxComplete(function () {
        $("time.timeago").timeago();
    }),
    document.addEventListener("alpine:init", function () {
        Alpine.store("toast", {
            on: !1,
            message: null,
            timeout: null,
            resetTime: function () {
                this.timeout &&
                    (clearTimeout(this.timeout), (this.timeout = null));
            },
            show: function (t) {
                var e = this;
                ((this.on = !0),
                    (this.message = t),
                    this.resetTime(),
                    (this.timeout = setTimeout(function () {
                        return e.hide();
                    }, 3e3)));
            },
            hide: function () {
                ((this.on = !1), this.resetTime());
            },
            toggle: function () {
                this.on = !this.on;
            },
        });
    }),
    "undefined" != typeof chapter_id &&
        chapter_id > 0 &&
        ((bookmark_data = {
            _token: token,
            chapter_id: chapter_id,
            line_id: 0,
        }),
        $("#bookmark_top").on("click", function () {
            if (($(this).addClass("on"), !isLoggedIn))
                return (alert("Bạn phải đăng nhập để sử dụng bookmark"), !1);
            var t =
                $(".reading-content p#" + bookmark_data.line_id)
                    .text()
                    .trim()
                    .substring(0, 30) + "...";
            bookmark_data.line_id > 0 &&
                $.post(
                    "/action/chapter/bookmark",
                    bookmark_data,
                    function (e) {
                        "success" == e.status
                            ? ($("ul#bookmarks_list").append(
                                  '<li data-line="' +
                                      e.line_id +
                                      '"><span class="pos_bookmark">Đoạn thứ ' +
                                      e.line_id +
                                      '</span><small style="display: block">' +
                                      t +
                                      '</small><span data-item="' +
                                      e.bookmark_id +
                                      '" class="del_bookmark remove_bookmark"><i class="fas fa-times"></i></span></li>',
                              ),
                              alert(
                                  "Bạn đã lưu bookmark thành công đoạn thứ " +
                                      e.line_id,
                              ))
                            : alert(e.message);
                    },
                    "json",
                );
        }),
        $(window).on("scroll", function () {}),
        $(function () {
            $(".reading-content p").on("click", function () {
                var t = $(this);
                if ($(window).width() > 979) {
                    var e =
                            t.offset().top -
                            $("body").offset().top +
                            t.scrollTop(),
                        n =
                            t.offset().left -
                            $(".reading-content").offset().left -
                            $(".save_bookmark").outerWidth(!0);
                    $(".save_bookmark").css({
                        height: t.height() + 28 + "px",
                        right: n + "px",
                        top: e + "px",
                        display: "",
                    });
                } else
                    ($("#bookmark_top").toggleClass("on"),
                        $("#rd-side_icon").toggle());
                bookmark_data.line_id = t.attr("id");
            });
        }),
        $(".save_bookmark").on("click", function () {
            if (!isLoggedIn)
                return (alert("Bạn phải đăng nhập để sử dụng bookmark"), !1);
            $(window).width() > 979 &&
                bookmark_data.line_id > 0 &&
                $.post(
                    "/action/chapter/bookmark",
                    bookmark_data,
                    function (t) {
                        "success" == t.status
                            ? ($("ul#bookmarks_list").append(
                                  '<li data-line="' +
                                      t.line_id +
                                      '"><span class="pos_bookmark">Đoạn thứ ' +
                                      t.line_id +
                                      '</span><span data-item="' +
                                      t.bookmark_id +
                                      '" class="del_bookmark remove_bookmark"><i class="fas fa-times"></i></span></li>',
                              ),
                              alert(
                                  "Bạn đã lưu bookmark thành công đoạn thứ " +
                                      t.line_id,
                              ))
                            : alert(t.message);
                    },
                    "json",
                );
        }),
        $("ul#bookmarks_list").on("click", "span.pos_bookmark", function () {
            var t = $("#" + $(this).parent().data("line"));
            $("body,html").animate({
                scrollTop:
                    t.offset().top - $("body").offset().top + t.scrollTop(),
            });
        }),
        $("ul#bookmarks_list").on("click", "span.remove_bookmark", function () {
            ((_this = $(this)),
                (bookmark_id = _this.data("item")),
                $.post(
                    "/action/chapter/removebookmark",
                    { _token: token, bookmark_id: bookmark_id },
                    function (t) {
                        "success" == t.status &&
                            _this.parent().fadeOut("normal", function () {
                                $(this).parent("li").remove();
                            });
                    },
                    "json",
                ));
        }),
        $(document).keydown(function (t) {
            if (
                "INPUT" != t.target.nodeName &&
                "TEXTAREA" != t.target.nodeName &&
                1 != t.target.isContentEditable
            ) {
                var e = t.which || t.keyCode,
                    n = $(".fa-backward").parent().attr("href") || "",
                    o = $(".fa-forward").parent().attr("href") || "";
                switch (e) {
                    case 37:
                        "" != n && (window.location.href = n);
                        break;
                    case 39:
                        "" != o && (window.location.href = o);
                        break;
                    case 27:
                        $(".black-click").click();
                }
            }
        }),
        Object.keys(readingObject).length))
) {
    var readingSeries =
        JSON.parse(localStorage.getItem("reading_series")) || [];
    for (i = 0; i < readingSeries.length; i++)
        if (readingSeries[i].series_id == series_id) {
            readingSeries.splice(i, 1);
            break;
        }
    (readingSeries.unshift(readingObject),
        readingSeries.length > 100 && readingSeries.pop(),
        localStorage.setItem("reading_series", JSON.stringify(readingSeries)));
}
function seeMoreButton(t) {
    (t.find("img[alt]").length || t[0].scrollHeight >= 90) &&
        t.next(".comment_see_more").removeClass("none");
}
function seeMoreButtons() {
    $(".ln-comment-content").each(function () {
        seeMoreButton($(this));
    });
}
function clickSeeMore(t) {
    (t.prev().css("max-height", "initial"), t.remove());
}
function br2nl(t) {
    return t.replace(/\r|\n|\r\n/g, "").replace(/<br(\s?\/?)?>/g, "\n");
}
function nl2br(t) {
    return t.replace(/\n/g, "<br>");
}
function strip_tags(t) {
    return t.replace(/<[^>]+>/gi, "");
}
function getEditor(t) {
    return tinymce.activeEditor;
}
if (
    ($(".ln-comment-body").on("click", "span.span-pin", function () {
        $.post(
            "/action/comment/pin_comment",
            {
                _token: token,
                comment_id: $(this).closest(".ln-comment-item").data("comment"),
            },
            function (t) {
                "success" == t.status
                    ? window.location.replace(t.url)
                    : alert(t.message);
            },
        );
    }),
    $(".ln-comment-body").on("click", "a.do-like", function () {
        var t = $(this);
        $.post(
            "/action/comment/like-unlike",
            {
                _token: token,
                comment_id: $(this).closest(".ln-comment-item").data("comment"),
            },
            function (e) {
                "success" == e.status
                    ? (console.log(t),
                      e.liked
                          ? (t.addClass("liked"),
                            t.find("span.likecount").text(e.like_count))
                          : (t.removeClass("liked"),
                            t.find("span.likecount").text(e.like_count)))
                    : alert(e.message);
            },
        );
    }),
    seeMoreButtons(),
    $(".ln-comment-body").on("click", ".comment_see_more", function (t) {
        clickSeeMore($(this));
    }),
    $("form.comment_form input.button").on("click", function () {
        var t = tinymce.activeEditor.getContent();
        $.post(
            "/action/comment/new",
            {
                _token: token,
                type: comment_type,
                type_id: comment_typeid,
                content: t,
                parent_id: 0,
            },
            function (t) {
                if ("success" == t.status && "" != t.html) {
                    var e = $(".ln-comment-body");
                    ($("html,body").animate({
                        scrollTop:
                            e.offset().top -
                            $("body").offset().top +
                            e.scrollTop(),
                    }),
                        $("#ln-comment-submit").after(
                            $(
                                '<div class="ln-comment-group">' +
                                    t.html +
                                    "</div>",
                            ).fadeIn(700),
                        ),
                        tinymce.activeEditor.setContent(""),
                        seeMoreButton(
                            $("#ln-comment-" + t.comment_id).find(
                                ".ln-comment-content",
                            ),
                        ));
                } else alert(t.message);
            },
            "json",
        );
    }),
    $(".ln-comment-body").on(
        "click",
        ".do-reply",
        _asyncToGenerator(
            _regeneratorRuntime().mark(function t() {
                var e, n, o, r;
                return _regeneratorRuntime().wrap(
                    function (t) {
                        for (;;)
                            switch ((t.prev = t.next)) {
                                case 0:
                                    if (
                                        ((e = $(this)),
                                        (n = e
                                            .closest(".ln-comment-item")
                                            .data("comment")),
                                        (o = e
                                            .closest(".ln-comment-item")
                                            .data("parent")),
                                        !$("#ln-comment-" + n).find(
                                            "textarea.comment_reply",
                                        ).length)
                                    ) {
                                        t.next = 6;
                                        break;
                                    }
                                    return (
                                        $(".reply-form").remove(),
                                        t.abrupt("return")
                                    );
                                case 6:
                                    return (
                                        $(".reply-form").remove(),
                                        (r =
                                            n != o
                                                ? "@" +
                                                  $(
                                                      "#ln-comment-" +
                                                          n +
                                                          " a.ln-username",
                                                  )
                                                      .text()
                                                      .trim() +
                                                  ":&nbsp;"
                                                : ""),
                                        $("#ln-comment-" + n).append(
                                            $(
                                                '<div class="ln-comment-reply reply-form"><div class="ln-comment-form"><textarea class="comment_reply"></textarea><div class="comment_toolkit clear"><input type="button" class="button submit_reply" value="Trả lời" data-parent="' +
                                                    o +
                                                    '"></div></div></div>',
                                            ),
                                        ),
                                        (t.next = 11),
                                        tinymce.init(tinymceRootSettings)
                                    );
                                case 11:
                                    t.sent[0].setContent(r);
                                case 13:
                                case "end":
                                    return t.stop();
                            }
                    },
                    t,
                    this,
                );
            }),
        ),
    ),
    $(".ln-comment-body").on("click", "input.submit_reply", function () {
        var t = tinymce.activeEditor.getContent(),
            e = parseInt($(this).data("parent")) || 0,
            n = $(this).closest(".ln-comment-item").data("type"),
            o = $(this).closest(".ln-comment-item").data("typeid");
        (console.log(n, o),
            $.post(
                "/action/comment/new",
                {
                    _token: token,
                    type: n,
                    type_id: o,
                    content: t,
                    parent_id: e,
                },
                function (t) {
                    if ("success" == t.status && "" != t.html) {
                        $("#ln-comment-" + e)
                            .parent()
                            .append(
                                $(
                                    '<div class="ln-comment-reply">' +
                                        t.html +
                                        "</div>",
                                ),
                            );
                        var n = $("#ln-comment-" + t.comment_id);
                        ($("html,body").animate({
                            scrollTop:
                                n.offset().top -
                                $("body").offset().top +
                                n.scrollTop() -
                                270,
                        }),
                            seeMoreButton(n.find(".ln-comment-content")),
                            $(".reply-form").remove());
                    } else alert(t.message);
                },
                "json",
            ));
    }),
    $(".ln-comment-body").on(
        "click",
        ".span-edit",
        _asyncToGenerator(
            _regeneratorRuntime().mark(function t() {
                var e, n, o, r;
                return _regeneratorRuntime().wrap(
                    function (t) {
                        for (;;)
                            switch ((t.prev = t.next)) {
                                case 0:
                                    if (
                                        ((e = $(this)),
                                        (n = e
                                            .closest(".ln-comment-item")
                                            .data("comment")),
                                        (o = $("#ln-comment-" + n)),
                                        (r = o.find(".ln-comment-content")),
                                        o.find(
                                            ".ln-comment-content .comment_hidden",
                                        ).length &&
                                            r.html(
                                                o
                                                    .find(
                                                        ".ln-comment-content .comment_hidden",
                                                    )
                                                    .html(),
                                            ),
                                        !o.find(".ln-comment-form").length)
                                    ) {
                                        t.next = 9;
                                        break;
                                    }
                                    return (
                                        o.find(".ln-comment-form").remove(),
                                        r.show(),
                                        t.abrupt("return")
                                    );
                                case 9:
                                    return (
                                        $(".edit-form").remove(),
                                        r.css("max-height", "initial"),
                                        r.next(".comment_see_more").remove(),
                                        r.after(
                                            '<div class="ln-comment-form edit-form" style="padding-left: 10px"><textarea class="comment_edit"></textarea><div class="comment_toolkit clear"><input type="button" class="button submit_edit" value="Sửa" data-comment="' +
                                                n +
                                                '"></div></div>',
                                        ),
                                        r.hide(),
                                        (t.next = 16),
                                        tinymce.init(tinymceRootSettings)
                                    );
                                case 16:
                                    t.sent[0].setContent(r.html());
                                case 18:
                                case "end":
                                    return t.stop();
                            }
                    },
                    t,
                    this,
                );
            }),
        ),
    ),
    $(".ln-comment-body").on("click", "input.submit_edit", function () {
        var t = parseInt($(this).data("comment")) || 0,
            e = tinymce.activeEditor.getContent();
        $.post(
            "/action/comment/update",
            { _token: token, comment_id: t, content: e },
            function (e) {
                var n = $("#ln-comment-" + t);
                "success" == e.status && "" != e.html
                    ? ($("html,body").animate({
                          scrollTop:
                              n.offset().top -
                              $("body").offset().top +
                              n.scrollTop(),
                      }),
                      n.find(".ln-comment-content").html(e.html).show(),
                      $(".edit-form").remove())
                    : (n.find(".ln-comment-content").show(), alert(e.message));
            },
            "json",
        );
    }),
    $(".ln-comment-body").on("click", ".span-delete", function () {
        var t = $(this),
            e = parseInt(t.closest(".ln-comment-item").data("comment"));
        if (!confirm("Bạn có muốn xóa bình luận?")) return !1;
        $.post(
            "/action/comment/delete",
            { _token: token, comment_id: e },
            function (t) {
                if ("success" == t.status) {
                    var n = $("#ln-comment-" + e);
                    (n
                        .find(".ln-comment-content")
                        .html("(Bình luận đã bị xóa)"),
                        n.find("hr.ln-comment").remove(),
                        n.find(".ln-comment-toolkit").remove());
                } else alert(t.message);
            },
        );
    }),
    $(".ln-comment-body").on(
        "click",
        ".paging_item, #refresh_comment",
        function (t) {
            t.preventDefault();
            var e = $(this);
            "refresh_comment" == e.attr("id") && e.addClass("refresher");
            var n = getParameterByName("page", e.attr("href")) || 1;
            return (
                $.post(
                    "/comment/ajax_paging",
                    {
                        _token: token,
                        type: comment_type,
                        type_id: comment_typeid,
                        page: n,
                    },
                    function (t) {
                        if ("success" == t.status && "" != t.html) {
                            ($(".ln-comment-body")
                                .find(".ln-comment-group, .ln-comment-page")
                                .remove(),
                                $(".ln-comment-body").append(t.html));
                            var n = $(".ln-comment-body").parent();
                            (seeMoreButtons(),
                                $("html,body").animate({
                                    scrollTop:
                                        n.offset().top -
                                        $("body").offset().top +
                                        n.scrollTop(),
                                }));
                        } else alert(t.message);
                        e.removeClass("refresher");
                    },
                    "json",
                ),
                !1
            );
        },
    ),
    $(".ln-comment-body").on("click", ".fetch_reply", function (t) {
        var e = $(this);
        (e.next().show(),
            $.post(
                "/comment/fetch_reply",
                {
                    _token: token,
                    parent_id: e.data("parent"),
                    offset: e.parent().find(".ln-comment-item").length,
                    after: e
                        .parent()
                        .find(".ln-comment-item")
                        .last()
                        .data("comment"),
                },
                function (t) {
                    "success" == t.status && "" != t.html
                        ? (e.next().hide(),
                          t.remaining > 0 ? e.text(t.fetchReplyText) : e.hide(),
                          e.before(t.html),
                          seeMoreButtons())
                        : "error" == t.status && alert(t.message);
                },
                "json",
            ));
    }),
    "undefined" != typeof series_id &&
        series_id > 0 &&
        (-1 == (Cookies.getJSON("mature_confirm") || []).indexOf(series_id) &&
            $("#mature_modal").css("display", "block"),
        $("button#mature_confirm").on("click", function (t) {
            var e = Cookies.getJSON("mature_confirm") || [];
            (-1 == e.indexOf(series_id) &&
                (e.push(series_id),
                Cookies.set("mature_confirm", e, { expires: 3 })),
                $("#mature_modal").css("display", "none"));
        })),
    "1" == $('meta[name="logged-in"]').attr("content") &&
        !$("main.reading-page").length)
) {
    var handleNotiData = function (t) {
            (t.notification_count > 0
                ? ($("#noti-icon").find(".noti-unread").remove(),
                  $("#noti-icon .icon-wrapper").append(
                      '<span class="noti-unread">' +
                          t.notification_count +
                          "</span>",
                  ),
                  $("#noti-icon #noti-sidebar")
                      .find("#noti-content")
                      .prepend(t.html))
                : $("#noti-icon").find(".noti-unread").remove(),
                t.seriesunread_count > 0
                    ? ($("#series-unread-icon").find(".noti-unread").remove(),
                      $("#series-unread-icon .icon-wrapper").append(
                          '<span class="noti-unread">' +
                              t.seriesunread_count +
                              "</span>",
                      ))
                    : $("#series-unread-icon").find(".noti-unread").remove(),
                t.pmunread_count > 0
                    ? ($(".at-user_avatar").addClass("icon-notify"),
                      $(".at-user_list").addClass("icon-notify"))
                    : ($(".at-user_avatar").removeClass("icon-notify"),
                      $(".at-user_list").removeClass("icon-notify")),
                (unreadCount = parseInt(t.total)),
                setDocumentTitle(
                    unreadCount > 0
                        ? "(" + unreadCount + ") " + pageTitle
                        : pageTitle,
                ));
        },
        setDocumentTitle = function (t) {
            document.title = t;
        },
        pageTitle = document.title,
        unreadCount = 0,
        refreshTime = 180;
    ($("span.noti-unread").each(function () {
        unreadCount += parseInt($(this).text());
    }),
        unreadCount > 0 &&
            (document.title = "(" + unreadCount + ") " + document.title),
        $("#noti-icon").on("click", function (t) {
            t.stopPropagation();
            $(this).find(".noti-sidebar");
            var e = $(this).find("span.noti-unread");
            "" != e.text().trim() &&
                $.post(
                    "/action/notification/clearunread",
                    { _token: token },
                    function (t) {
                        "success" == t.status
                            ? (e.remove(),
                              (unreadCount = 0),
                              $("span.noti-unread").each(function () {
                                  unreadCount += parseInt($(this).text());
                              }),
                              (document.title =
                                  unreadCount > 0
                                      ? "(" + unreadCount + ") " + pageTitle
                                      : pageTitle))
                            : alert(t.message);
                    },
                    "json",
                );
        }),
        $(".noti-sidebar").on("click", function (t) {
            t.stopPropagation();
        }),
        $(document).on("click", function () {
            var t = $(".noti-sidebar");
            t.hasClass("block") && t.toggleClass("none block");
        }),
        $("#noti-icon #noti-sidebar").on(
            "mousedown",
            ".noti-item",
            function () {
                var t = $(this);
                t.hasClass("untouch") &&
                    $.post(
                        "/action/notification/touch",
                        {
                            _token: token,
                            notification_id: $(this).data("notification"),
                        },
                        function (e) {
                            "success" == e.status || "touched" == e.status
                                ? t.removeClass("untouch")
                                : alert(e.message);
                        },
                        "json",
                    );
            },
        ),
        (function t() {
            setTimeout(function () {
                var e =
                    $(".noti-item time.timeago").first().attr("title") || "";
                ((new Date().getTime() / 1e3) | 0) -
                    (localStorage.getItem("ln_refresh_time") || 0) <
                refreshTime
                    ? t()
                    : (localStorage.setItem(
                          "ln_refresh_time",
                          (new Date().getTime() / 1e3) | 0,
                      ),
                      $.post(
                          "/action/notification/fresh",
                          { last: e },
                          function (e) {
                              ("success" == e.status &&
                                  (handleNotiData(e),
                                  localStorage.setItem(
                                      "ln_crosstab",
                                      JSON.stringify(e),
                                  )),
                                  t());
                          },
                          "json",
                      ));
            }, 1e3 * refreshTime);
        })(),
        $(window).on("storage", function (t) {
            "ln_crosstab" == t.originalEvent.key &&
                handleNotiData(JSON.parse(localStorage.getItem("ln_crosstab")));
        }));
}
if (
    ($(".spoiler_toggle").on("click", function (t) {
        t.preventDefault();
        var e,
            n = $(this);
        return (
            (e = n.parent().next()).is(":visible")
                ? (e.hide(), n.text("Click vào để hiển thị nội dung"))
                : (e.show(), n.text("Click vào để ẩn nội dung")),
            !1
        );
    }),
    "undefined" != typeof series_id &&
        series_id > 0 &&
        $("span.star-evaluate-item").on("click", function () {
            if ("1" == $('meta[name="logged-in"]').attr("content")) {
                var t = $(this).data("value");
                $.post(
                    "/action/series/updaterating",
                    {
                        _token: $('meta[name="csrf-token"]').attr("content"),
                        series_id: series_id,
                        value: t,
                    },
                    function (t) {
                        "success" == t.status
                            ? alert("Cảm ơn bạn đã đánh giá truyện")
                            : t.message
                              ? alert(t.message)
                              : alert("Error");
                    },
                    "json",
                );
            } else alert("Bạn phải đăng nhập để đánh giá truyện");
        }),
    $("main.search-page div.search-advance").length)
) {
    var selectGenres = new Set(),
        rejectGenres = new Set();
    ($(".search-advance_toggle").on("click", function () {
        ($(".search-advance").toggle(), $(this).toggleClass("on"));
    }),
        $(".genre_label").on("click", function () {
            var t = $(this);
            t.data("genre-id");
            1 == t.find("i.fa-square").length
                ? t.find("i.far").toggleClass("far fas fa-square fa-check")
                : 1 == t.find("i.fa-check").length
                  ? t.find("i.fas").toggleClass("fa-check fa-times")
                  : t.find("i.fas").toggleClass("far fas fa-times fa-square");
        }),
        $("form").on("submit", function (t) {
            (t.preventDefault(),
                $(".gerne-icon i").each(function (t, e) {
                    var n = $(this),
                        o = n.parents("label").data("genre-id");
                    n.hasClass("fa-check")
                        ? selectGenres.add(o)
                        : n.hasClass("fa-times") && rejectGenres.add(o);
                }));
            var e =
                "?selectgenres=" +
                _toConsumableArray(selectGenres).join(",") +
                "&rejectgenres=" +
                _toConsumableArray(rejectGenres).join(",");
            ((e += "&" + $(this).serialize()),
                (window.location.href =
                    window.location.href.split("?")[0] + e));
        }));
}
($(".container").width() <= 768 && $(".gradual-mobile").find("main").hide(),
    $(".gradual-mobile header").on("click", function () {
        var t = $(this).parent();
        (t.find(".see_more").click(),
            t.find("main").toggle(),
            $(this)
                .find(".mobile-icon i")
                .toggleClass("fa-chevron-down fa-chevron-up"));
    }),
    $("#collect").on("click", function (t) {
        $.post(
            "/action/series/collect",
            { _token: token, series_id: series_id },
            function (t) {
                var e = $("#collect");
                if ("success" == t.status) {
                    var n = t.collected
                        ? "Bạn đã theo dõi truyện."
                        : "Bạn đã ngừng theo dõi truyện.";
                    (e.toggleClass("follow followed"),
                        e.find("i").toggleClass("far fas"),
                        Alpine ? Alpine.store("toast").show(n) : alert(n));
                } else
                    ($(".summary-content").css({
                        maxHeight: "150px",
                        overflow: "hidden",
                    }),
                        _this.html(
                            '<i class="fa fa-angle-double-down" aria-hidden="true"></i> Xem thêm',
                        ));
            },
            "json",
        );
    }),
    $(".feature-section .summary-content").length &&
        $(".feature-section .summary-content")[0].scrollHeight >= 100 &&
        $(".feature-section .summary-more").removeClass("none"),
    $(".mobile-more").click(function (t) {
        (t.preventDefault(),
            $(this).parent().find("li").removeClass("none"),
            $(this).remove());
    }),
    $(".summary-more").click(function (t) {
        t.preventDefault();
        var e = $(this),
            n = $(this).find(".see_more");
        return (
            e.hasClass("more-state")
                ? ($(".feature-section .summary-content").css({
                      maxHeight: "none",
                      overflow: "",
                  }),
                  n.html("Ẩn đi"))
                : ($(".feature-section .summary-content").css({
                      maxHeight: "100px",
                      overflow: "hidden",
                  }),
                  n.html("Xem thêm")),
            e.toggleClass("more-state less-state"),
            !1
        );
    }));
