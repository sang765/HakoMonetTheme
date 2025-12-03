/*! For license information please see plugins.js.LICENSE.txt */
(() => {
    var e,
        t = {
            528: (e, t, n) => {
                "use strict";
                var r = n(631),
                    i = n.n(r),
                    o = n(755),
                    a = n.n(o),
                    s = (n(795), n(379)),
                    u = n.n(s),
                    l = n(151),
                    c = { insert: "head", singleton: !1 };
                u()(l.Z, c);
                l.Z.locals;
                var f = window,
                    d =
                        f.requestAnimationFrame ||
                        f.webkitRequestAnimationFrame ||
                        f.mozRequestAnimationFrame ||
                        f.msRequestAnimationFrame ||
                        function (e) {
                            return setTimeout(e, 16);
                        },
                    p = window,
                    h =
                        p.cancelAnimationFrame ||
                        p.mozCancelAnimationFrame ||
                        function (e) {
                            clearTimeout(e);
                        };
                function m() {
                    for (
                        var e,
                            t,
                            n,
                            r = arguments[0] || {},
                            i = 1,
                            o = arguments.length;
                        i < o;
                        i++
                    )
                        if (null !== (e = arguments[i]))
                            for (t in e)
                                r !== (n = e[t]) && void 0 !== n && (r[t] = n);
                    return r;
                }
                function v(e) {
                    return ["true", "false"].indexOf(e) >= 0
                        ? JSON.parse(e)
                        : e;
                }
                function g(e, t, n, r) {
                    if (r)
                        try {
                            e.setItem(t, n);
                        } catch (e) {}
                    return n;
                }
                function y() {
                    var e = document,
                        t = e.body;
                    return (t || ((t = e.createElement("body")).fake = !0), t);
                }
                var b = document.documentElement;
                function x(e) {
                    var t = "";
                    return (
                        e.fake &&
                            ((t = b.style.overflow),
                            (e.style.background = ""),
                            (e.style.overflow = b.style.overflow = "hidden"),
                            b.appendChild(e)),
                        t
                    );
                }
                function w(e, t) {
                    e.fake &&
                        (e.remove(), (b.style.overflow = t), b.offsetHeight);
                }
                function T(e, t, n, r) {
                    "insertRule" in e
                        ? e.insertRule(t + "{" + n + "}", r)
                        : e.addRule(t, n, r);
                }
                function C(e) {
                    return ("insertRule" in e ? e.cssRules : e.rules).length;
                }
                function E(e, t, n) {
                    for (var r = 0, i = e.length; r < i; r++)
                        t.call(n, e[r], r);
                }
                var A = "classList" in document.createElement("_"),
                    S = A
                        ? function (e, t) {
                              return e.classList.contains(t);
                          }
                        : function (e, t) {
                              return e.className.indexOf(t) >= 0;
                          },
                    k = A
                        ? function (e, t) {
                              S(e, t) || e.classList.add(t);
                          }
                        : function (e, t) {
                              S(e, t) || (e.className += " " + t);
                          },
                    D = A
                        ? function (e, t) {
                              S(e, t) && e.classList.remove(t);
                          }
                        : function (e, t) {
                              S(e, t) &&
                                  (e.className = e.className.replace(t, ""));
                          };
                function N(e, t) {
                    return e.hasAttribute(t);
                }
                function L(e, t) {
                    return e.getAttribute(t);
                }
                function M(e) {
                    return void 0 !== e.item;
                }
                function O(e, t) {
                    if (
                        ((e = M(e) || e instanceof Array ? e : [e]),
                        "[object Object]" === Object.prototype.toString.call(t))
                    )
                        for (var n = e.length; n--; )
                            for (var r in t) e[n].setAttribute(r, t[r]);
                }
                function j(e, t) {
                    e = M(e) || e instanceof Array ? e : [e];
                    for (
                        var n = (t = t instanceof Array ? t : [t]).length,
                            r = e.length;
                        r--;
                    )
                        for (var i = n; i--; ) e[r].removeAttribute(t[i]);
                }
                function H(e) {
                    for (var t = [], n = 0, r = e.length; n < r; n++)
                        t.push(e[n]);
                    return t;
                }
                function P(e, t) {
                    "none" !== e.style.display && (e.style.display = "none");
                }
                function B(e, t) {
                    "none" === e.style.display && (e.style.display = "");
                }
                function I(e) {
                    return "none" !== window.getComputedStyle(e).display;
                }
                function z(e) {
                    if ("string" == typeof e) {
                        var t = [e],
                            n = e.charAt(0).toUpperCase() + e.substr(1);
                        (["Webkit", "Moz", "ms", "O"].forEach(function (r) {
                            ("ms" === r && "transform" !== e) || t.push(r + n);
                        }),
                            (e = t));
                    }
                    for (
                        var r = document.createElement("fakeelement"),
                            i = (e.length, 0);
                        i < e.length;
                        i++
                    ) {
                        var o = e[i];
                        if (void 0 !== r.style[o]) return o;
                    }
                    return !1;
                }
                function q(e, t) {
                    var n = !1;
                    return (
                        /^Webkit/.test(e)
                            ? (n = "webkit" + t + "End")
                            : /^O/.test(e)
                              ? (n = "o" + t + "End")
                              : e && (n = t.toLowerCase() + "end"),
                        n
                    );
                }
                var R = !1;
                try {
                    var F = Object.defineProperty({}, "passive", {
                        get: function () {
                            R = !0;
                        },
                    });
                    window.addEventListener("test", null, F);
                } catch (e) {}
                var W = !!R && { passive: !0 };
                function _(e, t, n) {
                    for (var r in t) {
                        var i =
                            ["touchstart", "touchmove"].indexOf(r) >= 0 &&
                            !n &&
                            W;
                        e.addEventListener(r, t[r], i);
                    }
                }
                function U(e, t) {
                    for (var n in t) {
                        var r =
                            ["touchstart", "touchmove"].indexOf(n) >= 0 && W;
                        e.removeEventListener(n, t[n], r);
                    }
                }
                function $() {
                    return {
                        topics: {},
                        on: function (e, t) {
                            ((this.topics[e] = this.topics[e] || []),
                                this.topics[e].push(t));
                        },
                        off: function (e, t) {
                            if (this.topics[e])
                                for (var n = 0; n < this.topics[e].length; n++)
                                    if (this.topics[e][n] === t) {
                                        this.topics[e].splice(n, 1);
                                        break;
                                    }
                        },
                        emit: function (e, t) {
                            ((t.type = e),
                                this.topics[e] &&
                                    this.topics[e].forEach(function (n) {
                                        n(t, e);
                                    }));
                        },
                    };
                }
                (Object.keys ||
                    (Object.keys = function (e) {
                        var t = [];
                        for (var n in e)
                            Object.prototype.hasOwnProperty.call(e, n) &&
                                t.push(n);
                        return t;
                    }),
                    "remove" in Element.prototype ||
                        (Element.prototype.remove = function () {
                            this.parentNode &&
                                this.parentNode.removeChild(this);
                        }));
                var V = function (e) {
                        e = m(
                            {
                                container: ".slider",
                                mode: "carousel",
                                axis: "horizontal",
                                items: 1,
                                gutter: 0,
                                edgePadding: 0,
                                fixedWidth: !1,
                                autoWidth: !1,
                                viewportMax: !1,
                                slideBy: 1,
                                center: !1,
                                controls: !0,
                                controlsPosition: "top",
                                controlsText: ["prev", "next"],
                                controlsContainer: !1,
                                prevButton: !1,
                                nextButton: !1,
                                nav: !0,
                                navPosition: "top",
                                navContainer: !1,
                                navAsThumbnails: !1,
                                arrowKeys: !1,
                                speed: 300,
                                autoplay: !1,
                                autoplayPosition: "top",
                                autoplayTimeout: 5e3,
                                autoplayDirection: "forward",
                                autoplayText: ["start", "stop"],
                                autoplayHoverPause: !1,
                                autoplayButton: !1,
                                autoplayButtonOutput: !0,
                                autoplayResetOnVisibility: !0,
                                animateIn: "tns-fadeIn",
                                animateOut: "tns-fadeOut",
                                animateNormal: "tns-normal",
                                animateDelay: !1,
                                loop: !0,
                                rewind: !1,
                                autoHeight: !1,
                                responsive: !1,
                                lazyload: !1,
                                lazyloadSelector: ".tns-lazy-img",
                                touch: !0,
                                mouseDrag: !1,
                                swipeAngle: 15,
                                nested: !1,
                                preventActionWhenRunning: !1,
                                preventScrollOnTouch: !1,
                                freezable: !0,
                                onInit: !1,
                                useLocalStorage: !0,
                                nonce: !1,
                            },
                            e || {},
                        );
                        var t = document,
                            n = window,
                            r = { ENTER: 13, SPACE: 32, LEFT: 37, RIGHT: 39 },
                            i = {},
                            o = e.useLocalStorage;
                        if (o) {
                            var a = navigator.userAgent,
                                s = new Date();
                            try {
                                ((i = n.localStorage)
                                    ? (i.setItem(s, s),
                                      (o = i.getItem(s) == s),
                                      i.removeItem(s))
                                    : (o = !1),
                                    o || (i = {}));
                            } catch (e) {
                                o = !1;
                            }
                            o &&
                                (i.tnsApp &&
                                    i.tnsApp !== a &&
                                    [
                                        "tC",
                                        "tPL",
                                        "tMQ",
                                        "tTf",
                                        "t3D",
                                        "tTDu",
                                        "tTDe",
                                        "tADu",
                                        "tADe",
                                        "tTE",
                                        "tAE",
                                    ].forEach(function (e) {
                                        i.removeItem(e);
                                    }),
                                (localStorage.tnsApp = a));
                        }
                        var u = i.tC
                                ? v(i.tC)
                                : g(
                                      i,
                                      "tC",
                                      (function () {
                                          var e = document,
                                              t = y(),
                                              n = x(t),
                                              r = e.createElement("div"),
                                              i = !1;
                                          t.appendChild(r);
                                          try {
                                              for (
                                                  var o,
                                                      a = "(10px * 10)",
                                                      s = [
                                                          "calc" + a,
                                                          "-moz-calc" + a,
                                                          "-webkit-calc" + a,
                                                      ],
                                                      u = 0;
                                                  u < 3;
                                                  u++
                                              )
                                                  if (
                                                      ((o = s[u]),
                                                      (r.style.width = o),
                                                      100 === r.offsetWidth)
                                                  ) {
                                                      i = o.replace(a, "");
                                                      break;
                                                  }
                                          } catch (e) {}
                                          return (
                                              t.fake ? w(t, n) : r.remove(),
                                              i
                                          );
                                      })(),
                                      o,
                                  ),
                            l = i.tPL
                                ? v(i.tPL)
                                : g(
                                      i,
                                      "tPL",
                                      (function () {
                                          var e,
                                              t = document,
                                              n = y(),
                                              r = x(n),
                                              i = t.createElement("div"),
                                              o = t.createElement("div"),
                                              a = "";
                                          ((i.className = "tns-t-subp2"),
                                              (o.className = "tns-t-ct"));
                                          for (var s = 0; s < 70; s++)
                                              a += "<div></div>";
                                          return (
                                              (o.innerHTML = a),
                                              i.appendChild(o),
                                              n.appendChild(i),
                                              (e =
                                                  Math.abs(
                                                      i.getBoundingClientRect()
                                                          .left -
                                                          o.children[67].getBoundingClientRect()
                                                              .left,
                                                  ) < 2),
                                              n.fake ? w(n, r) : i.remove(),
                                              e
                                          );
                                      })(),
                                      o,
                                  ),
                            c = i.tMQ
                                ? v(i.tMQ)
                                : g(
                                      i,
                                      "tMQ",
                                      (function () {
                                          if (
                                              window.matchMedia ||
                                              window.msMatchMedia
                                          )
                                              return !0;
                                          var e,
                                              t = document,
                                              n = y(),
                                              r = x(n),
                                              i = t.createElement("div"),
                                              o = t.createElement("style"),
                                              a =
                                                  "@media all and (min-width:1px){.tns-mq-test{position:absolute}}";
                                          return (
                                              (o.type = "text/css"),
                                              (i.className = "tns-mq-test"),
                                              n.appendChild(o),
                                              n.appendChild(i),
                                              o.styleSheet
                                                  ? (o.styleSheet.cssText = a)
                                                  : o.appendChild(
                                                        t.createTextNode(a),
                                                    ),
                                              (e = window.getComputedStyle
                                                  ? window.getComputedStyle(i)
                                                        .position
                                                  : i.currentStyle.position),
                                              n.fake ? w(n, r) : i.remove(),
                                              "absolute" === e
                                          );
                                      })(),
                                      o,
                                  ),
                            f = i.tTf
                                ? v(i.tTf)
                                : g(i, "tTf", z("transform"), o),
                            p = i.t3D
                                ? v(i.t3D)
                                : g(
                                      i,
                                      "t3D",
                                      (function (e) {
                                          if (!e) return !1;
                                          if (!window.getComputedStyle)
                                              return !1;
                                          var t,
                                              n = document,
                                              r = y(),
                                              i = x(r),
                                              o = n.createElement("p"),
                                              a =
                                                  e.length > 9
                                                      ? "-" +
                                                        e
                                                            .slice(0, -9)
                                                            .toLowerCase() +
                                                        "-"
                                                      : "";
                                          return (
                                              (a += "transform"),
                                              r.insertBefore(o, null),
                                              (o.style[e] =
                                                  "translate3d(1px,1px,1px)"),
                                              (t = window
                                                  .getComputedStyle(o)
                                                  .getPropertyValue(a)),
                                              r.fake ? w(r, i) : o.remove(),
                                              void 0 !== t &&
                                                  t.length > 0 &&
                                                  "none" !== t
                                          );
                                      })(f),
                                      o,
                                  ),
                            b = i.tTDu
                                ? v(i.tTDu)
                                : g(i, "tTDu", z("transitionDuration"), o),
                            A = i.tTDe
                                ? v(i.tTDe)
                                : g(i, "tTDe", z("transitionDelay"), o),
                            M = i.tADu
                                ? v(i.tADu)
                                : g(i, "tADu", z("animationDuration"), o),
                            R = i.tADe
                                ? v(i.tADe)
                                : g(i, "tADe", z("animationDelay"), o),
                            F = i.tTE
                                ? v(i.tTE)
                                : g(i, "tTE", q(b, "Transition"), o),
                            W = i.tAE
                                ? v(i.tAE)
                                : g(i, "tAE", q(M, "Animation"), o),
                            Y =
                                n.console &&
                                "function" == typeof n.console.warn,
                            X = [
                                "container",
                                "controlsContainer",
                                "prevButton",
                                "nextButton",
                                "navContainer",
                                "autoplayButton",
                            ],
                            G = {};
                        if (
                            (X.forEach(function (n) {
                                if ("string" == typeof e[n]) {
                                    var r = e[n],
                                        i = t.querySelector(r);
                                    if (((G[n] = r), !i || !i.nodeName))
                                        return void (
                                            Y &&
                                            console.warn("Can't find", e[n])
                                        );
                                    e[n] = i;
                                }
                            }),
                            !(e.container.children.length < 1))
                        ) {
                            var J = e.responsive,
                                Q = e.nested,
                                Z = "carousel" === e.mode;
                            if (J) {
                                0 in J && ((e = m(e, J[0])), delete J[0]);
                                var K = {};
                                for (var ee in J) {
                                    var te = J[ee];
                                    ((te =
                                        "number" == typeof te
                                            ? { items: te }
                                            : te),
                                        (K[ee] = te));
                                }
                                ((J = K), (K = null));
                            }
                            if (
                                (Z ||
                                    (function e(t) {
                                        for (var n in t)
                                            (Z ||
                                                ("slideBy" === n &&
                                                    (t[n] = "page"),
                                                "edgePadding" === n &&
                                                    (t[n] = !1),
                                                "autoHeight" === n &&
                                                    (t[n] = !1)),
                                                "responsive" === n && e(t[n]));
                                    })(e),
                                !Z)
                            ) {
                                ((e.axis = "horizontal"),
                                    (e.slideBy = "page"),
                                    (e.edgePadding = !1));
                                var ne = e.animateIn,
                                    re = e.animateOut,
                                    ie = e.animateDelay,
                                    oe = e.animateNormal;
                            }
                            var ae,
                                se,
                                ue = "horizontal" === e.axis,
                                le = t.createElement("div"),
                                ce = t.createElement("div"),
                                fe = e.container,
                                de = fe.parentNode,
                                pe = fe.outerHTML,
                                he = fe.children,
                                me = he.length,
                                ve = jn(),
                                ge = !1;
                            (J && er(), Z && (fe.className += " tns-vpfix"));
                            var ye,
                                be,
                                xe,
                                we,
                                Te,
                                Ce,
                                Ee,
                                Ae,
                                Se,
                                ke = e.autoWidth,
                                De = zn("fixedWidth"),
                                Ne = zn("edgePadding"),
                                Le = zn("gutter"),
                                Me = Bn(),
                                Oe = zn("center"),
                                je = ke ? 1 : Math.floor(zn("items")),
                                He = zn("slideBy"),
                                Pe = e.viewportMax || e.fixedWidthViewportWidth,
                                Be = zn("arrowKeys"),
                                Ie = zn("speed"),
                                ze = e.rewind,
                                qe = !ze && e.loop,
                                Re = zn("autoHeight"),
                                Fe = zn("controls"),
                                We = zn("controlsText"),
                                _e = zn("nav"),
                                Ue = zn("touch"),
                                $e = zn("mouseDrag"),
                                Ve = zn("autoplay"),
                                Ye = zn("autoplayTimeout"),
                                Xe = zn("autoplayText"),
                                Ge = zn("autoplayHoverPause"),
                                Je = zn("autoplayResetOnVisibility"),
                                Qe =
                                    ((Ee = null),
                                    (Ae = zn("nonce")),
                                    (Se = document.createElement("style")),
                                    Ee && Se.setAttribute("media", Ee),
                                    Ae && Se.setAttribute("nonce", Ae),
                                    document
                                        .querySelector("head")
                                        .appendChild(Se),
                                    Se.sheet ? Se.sheet : Se.styleSheet),
                                Ze = e.lazyload,
                                Ke = e.lazyloadSelector,
                                et = [],
                                tt = qe
                                    ? ((Te = (function () {
                                          if (ke || (De && !Pe)) return me - 1;
                                          var t = De ? "fixedWidth" : "items",
                                              n = [];
                                          if (
                                              ((De || e[t] < me) &&
                                                  n.push(e[t]),
                                              J)
                                          )
                                              for (var r in J) {
                                                  var i = J[r][t];
                                                  i &&
                                                      (De || i < me) &&
                                                      n.push(i);
                                              }
                                          return (
                                              n.length || n.push(0),
                                              Math.ceil(
                                                  De
                                                      ? Pe /
                                                            Math.min.apply(
                                                                null,
                                                                n,
                                                            )
                                                      : Math.max.apply(null, n),
                                              )
                                          );
                                      })()),
                                      (Ce = Z
                                          ? Math.ceil((5 * Te - me) / 2)
                                          : 4 * Te - me),
                                      (Ce = Math.max(Te, Ce)),
                                      In("edgePadding") ? Ce + 1 : Ce)
                                    : 0,
                                nt = Z ? me + 2 * tt : me + tt,
                                rt = !((!De && !ke) || qe),
                                it = De ? Sr() : null,
                                ot = !Z || !qe,
                                at = ue ? "left" : "top",
                                st = "",
                                ut = "",
                                lt = De
                                    ? function () {
                                          return Oe && !qe
                                              ? me - 1
                                              : Math.ceil(-it / (De + Le));
                                      }
                                    : ke
                                      ? function () {
                                            for (var e = 0; e < nt; e++)
                                                if (ye[e] >= -it) return e;
                                        }
                                      : function () {
                                            return Oe && Z && !qe
                                                ? me - 1
                                                : qe || Z
                                                  ? Math.max(
                                                        0,
                                                        nt - Math.ceil(je),
                                                    )
                                                  : nt - 1;
                                        },
                                ct = Ln(zn("startIndex")),
                                ft = ct,
                                dt = (Nn(), 0),
                                pt = ke ? null : lt(),
                                ht = e.preventActionWhenRunning,
                                mt = e.swipeAngle,
                                vt = !mt || "?",
                                gt = !1,
                                yt = e.onInit,
                                bt = new $(),
                                xt = " tns-slider tns-" + e.mode,
                                wt =
                                    fe.id ||
                                    ((we = window.tnsId),
                                    (window.tnsId = we ? we + 1 : 1),
                                    "tns" + window.tnsId),
                                Tt = zn("disable"),
                                Ct = !1,
                                Et = e.freezable,
                                At = !(!Et || ke) && Kn(),
                                St = !1,
                                kt = {
                                    click: Pr,
                                    keydown: function (e) {
                                        e = _r(e);
                                        var t = [r.LEFT, r.RIGHT].indexOf(
                                            e.keyCode,
                                        );
                                        t >= 0 &&
                                            (0 === t
                                                ? Gt.disabled || Pr(e, -1)
                                                : Jt.disabled || Pr(e, 1));
                                    },
                                },
                                Dt = {
                                    click: function (e) {
                                        if (gt) {
                                            if (ht) return;
                                            jr();
                                        }
                                        var t = Ur((e = _r(e)));
                                        for (; t !== en && !N(t, "data-nav"); )
                                            t = t.parentNode;
                                        if (N(t, "data-nav")) {
                                            var n = (on = Number(
                                                    L(t, "data-nav"),
                                                )),
                                                r =
                                                    De || ke
                                                        ? (n * me) / nn
                                                        : n * je;
                                            (Hr(
                                                Bt
                                                    ? n
                                                    : Math.min(
                                                          Math.ceil(r),
                                                          me - 1,
                                                      ),
                                                e,
                                            ),
                                                an === n &&
                                                    (dn && Rr(), (on = -1)));
                                        }
                                    },
                                    keydown: function (e) {
                                        e = _r(e);
                                        var n = t.activeElement;
                                        if (!N(n, "data-nav")) return;
                                        var i = [
                                                r.LEFT,
                                                r.RIGHT,
                                                r.ENTER,
                                                r.SPACE,
                                            ].indexOf(e.keyCode),
                                            o = Number(L(n, "data-nav"));
                                        i >= 0 &&
                                            (0 === i
                                                ? o > 0 && Wr(Kt[o - 1])
                                                : 1 === i
                                                  ? o < nn - 1 && Wr(Kt[o + 1])
                                                  : ((on = o), Hr(o, e)));
                                    },
                                },
                                Nt = {
                                    mouseover: function () {
                                        dn && (Ir(), (pn = !0));
                                    },
                                    mouseout: function () {
                                        pn && (Br(), (pn = !1));
                                    },
                                },
                                Lt = {
                                    visibilitychange: function () {
                                        t.hidden
                                            ? dn && (Ir(), (mn = !0))
                                            : mn && (Br(), (mn = !1));
                                    },
                                },
                                Mt = {
                                    keydown: function (e) {
                                        e = _r(e);
                                        var t = [r.LEFT, r.RIGHT].indexOf(
                                            e.keyCode,
                                        );
                                        t >= 0 && Pr(e, 0 === t ? -1 : 1);
                                    },
                                },
                                Ot = {
                                    touchstart: Xr,
                                    touchmove: Gr,
                                    touchend: Qr,
                                    touchcancel: Qr,
                                },
                                jt = {
                                    mousedown: Xr,
                                    mousemove: Gr,
                                    mouseup: Qr,
                                    mouseleave: Qr,
                                },
                                Ht = In("controls"),
                                Pt = In("nav"),
                                Bt = !!ke || e.navAsThumbnails,
                                It = In("autoplay"),
                                zt = In("touch"),
                                qt = In("mouseDrag"),
                                Rt = "tns-slide-active",
                                Ft = "tns-slide-cloned",
                                Wt = "tns-complete",
                                _t = {
                                    load: function (e) {
                                        lr(Ur(e));
                                    },
                                    error: function (e) {
                                        ((t = Ur(e)), k(t, "failed"), cr(t));
                                        var t;
                                    },
                                },
                                Ut = "force" === e.preventScrollOnTouch;
                            if (Ht)
                                var $t,
                                    Vt,
                                    Yt = e.controlsContainer,
                                    Xt = e.controlsContainer
                                        ? e.controlsContainer.outerHTML
                                        : "",
                                    Gt = e.prevButton,
                                    Jt = e.nextButton,
                                    Qt = e.prevButton
                                        ? e.prevButton.outerHTML
                                        : "",
                                    Zt = e.nextButton
                                        ? e.nextButton.outerHTML
                                        : "";
                            if (Pt)
                                var Kt,
                                    en = e.navContainer,
                                    tn = e.navContainer
                                        ? e.navContainer.outerHTML
                                        : "",
                                    nn = ke ? me : Kr(),
                                    rn = 0,
                                    on = -1,
                                    an = On(),
                                    sn = an,
                                    un = "tns-nav-active",
                                    ln = "Carousel Page ",
                                    cn = " (Current Slide)";
                            if (It)
                                var fn,
                                    dn,
                                    pn,
                                    hn,
                                    mn,
                                    vn =
                                        "forward" === e.autoplayDirection
                                            ? 1
                                            : -1,
                                    gn = e.autoplayButton,
                                    yn = e.autoplayButton
                                        ? e.autoplayButton.outerHTML
                                        : "",
                                    bn = [
                                        "<span class='tns-visually-hidden'>",
                                        " animation</span>",
                                    ];
                            if (zt || qt)
                                var xn,
                                    wn,
                                    Tn = {},
                                    Cn = {},
                                    En = !1,
                                    An = ue
                                        ? function (e, t) {
                                              return e.x - t.x;
                                          }
                                        : function (e, t) {
                                              return e.y - t.y;
                                          };
                            (ke || Dn(Tt || At),
                                f &&
                                    ((at = f),
                                    (st = "translate"),
                                    p
                                        ? ((st += ue ? "3d(" : "3d(0px, "),
                                          (ut = ue ? ", 0px, 0px)" : ", 0px)"))
                                        : ((st += ue ? "X(" : "Y("),
                                          (ut = ")"))),
                                Z &&
                                    (fe.className = fe.className.replace(
                                        "tns-vpfix",
                                        "",
                                    )),
                                (function () {
                                    In("gutter");
                                    ((le.className = "tns-outer"),
                                        (ce.className = "tns-inner"),
                                        (le.id = wt + "-ow"),
                                        (ce.id = wt + "-iw"),
                                        "" === fe.id && (fe.id = wt));
                                    ((xt +=
                                        l || ke
                                            ? " tns-subpixel"
                                            : " tns-no-subpixel"),
                                        (xt += u
                                            ? " tns-calc"
                                            : " tns-no-calc"),
                                        ke && (xt += " tns-autowidth"));
                                    ((xt += " tns-" + e.axis),
                                        (fe.className += xt),
                                        Z
                                            ? (((ae =
                                                  t.createElement("div")).id =
                                                  wt + "-mw"),
                                              (ae.className = "tns-ovh"),
                                              le.appendChild(ae),
                                              ae.appendChild(ce))
                                            : le.appendChild(ce));
                                    if (Re) {
                                        (ae || ce).className += " tns-ah";
                                    }
                                    if (
                                        (de.insertBefore(le, fe),
                                        ce.appendChild(fe),
                                        E(he, function (e, t) {
                                            (k(e, "tns-item"),
                                                e.id ||
                                                    (e.id = wt + "-item" + t),
                                                !Z && oe && k(e, oe),
                                                O(e, {
                                                    "aria-hidden": "true",
                                                    tabindex: "-1",
                                                }));
                                        }),
                                        tt)
                                    ) {
                                        for (
                                            var n = t.createDocumentFragment(),
                                                r = t.createDocumentFragment(),
                                                i = tt;
                                            i--;
                                        ) {
                                            var o = i % me,
                                                a = he[o].cloneNode(!0);
                                            if (
                                                (k(a, Ft),
                                                j(a, "id"),
                                                r.insertBefore(a, r.firstChild),
                                                Z)
                                            ) {
                                                var s =
                                                    he[me - 1 - o].cloneNode(
                                                        !0,
                                                    );
                                                (k(s, Ft),
                                                    j(s, "id"),
                                                    n.appendChild(s));
                                            }
                                        }
                                        (fe.insertBefore(n, fe.firstChild),
                                            fe.appendChild(r),
                                            (he = fe.children));
                                    }
                                })(),
                                (function () {
                                    if (!Z)
                                        for (
                                            var t = ct,
                                                r = ct + Math.min(me, je);
                                            t < r;
                                            t++
                                        ) {
                                            var i = he[t];
                                            ((i.style.left =
                                                (100 * (t - ct)) / je + "%"),
                                                k(i, ne),
                                                D(i, oe));
                                        }
                                    ue &&
                                        (l || ke
                                            ? (T(
                                                  Qe,
                                                  "#" + wt + " > .tns-item",
                                                  "font-size:" +
                                                      n.getComputedStyle(he[0])
                                                          .fontSize +
                                                      ";",
                                                  C(Qe),
                                              ),
                                              T(
                                                  Qe,
                                                  "#" + wt,
                                                  "font-size:0;",
                                                  C(Qe),
                                              ))
                                            : Z &&
                                              E(he, function (e, t) {
                                                  e.style.marginLeft =
                                                      (function (e) {
                                                          return u
                                                              ? u +
                                                                    "(" +
                                                                    100 * e +
                                                                    "% / " +
                                                                    nt +
                                                                    ")"
                                                              : (100 * e) / nt +
                                                                    "%";
                                                      })(t);
                                              }));
                                    if (c) {
                                        if (b) {
                                            var o =
                                                ae && e.autoHeight
                                                    ? Un(e.speed)
                                                    : "";
                                            T(Qe, "#" + wt + "-mw", o, C(Qe));
                                        }
                                        ((o = qn(
                                            e.edgePadding,
                                            e.gutter,
                                            e.fixedWidth,
                                            e.speed,
                                            e.autoHeight,
                                        )),
                                            T(Qe, "#" + wt + "-iw", o, C(Qe)),
                                            Z &&
                                                ((o =
                                                    ue && !ke
                                                        ? "width:" +
                                                          Rn(
                                                              e.fixedWidth,
                                                              e.gutter,
                                                              e.items,
                                                          ) +
                                                          ";"
                                                        : ""),
                                                b && (o += Un(Ie)),
                                                T(Qe, "#" + wt, o, C(Qe))),
                                            (o =
                                                ue && !ke
                                                    ? Fn(
                                                          e.fixedWidth,
                                                          e.gutter,
                                                          e.items,
                                                      )
                                                    : ""),
                                            e.gutter && (o += Wn(e.gutter)),
                                            Z ||
                                                (b && (o += Un(Ie)),
                                                M && (o += $n(Ie))),
                                            o &&
                                                T(
                                                    Qe,
                                                    "#" + wt + " > .tns-item",
                                                    o,
                                                    C(Qe),
                                                ));
                                    } else {
                                        (Z &&
                                            Re &&
                                            (ae.style[b] = Ie / 1e3 + "s"),
                                            (ce.style.cssText = qn(
                                                Ne,
                                                Le,
                                                De,
                                                Re,
                                            )),
                                            Z &&
                                                ue &&
                                                !ke &&
                                                (fe.style.width = Rn(
                                                    De,
                                                    Le,
                                                    je,
                                                )));
                                        o = ue && !ke ? Fn(De, Le, je) : "";
                                        (Le && (o += Wn(Le)),
                                            o &&
                                                T(
                                                    Qe,
                                                    "#" + wt + " > .tns-item",
                                                    o,
                                                    C(Qe),
                                                ));
                                    }
                                    if (J && c)
                                        for (var a in J) {
                                            a = parseInt(a);
                                            var s = J[a],
                                                f = ((o = ""), ""),
                                                d = "",
                                                p = "",
                                                h = "",
                                                m = ke ? null : zn("items", a),
                                                v = zn("fixedWidth", a),
                                                g = zn("speed", a),
                                                y = zn("edgePadding", a),
                                                x = zn("autoHeight", a),
                                                w = zn("gutter", a);
                                            (b &&
                                                ae &&
                                                zn("autoHeight", a) &&
                                                "speed" in s &&
                                                (f =
                                                    "#" +
                                                    wt +
                                                    "-mw{" +
                                                    Un(g) +
                                                    "}"),
                                                ("edgePadding" in s ||
                                                    "gutter" in s) &&
                                                    (d =
                                                        "#" +
                                                        wt +
                                                        "-iw{" +
                                                        qn(y, w, v, g, x) +
                                                        "}"),
                                                Z &&
                                                    ue &&
                                                    !ke &&
                                                    ("fixedWidth" in s ||
                                                        "items" in s ||
                                                        (De &&
                                                            "gutter" in s)) &&
                                                    (p =
                                                        "width:" +
                                                        Rn(v, w, m) +
                                                        ";"),
                                                b &&
                                                    "speed" in s &&
                                                    (p += Un(g)),
                                                p &&
                                                    (p =
                                                        "#" +
                                                        wt +
                                                        "{" +
                                                        p +
                                                        "}"),
                                                ("fixedWidth" in s ||
                                                    (De && "gutter" in s) ||
                                                    (!Z && "items" in s)) &&
                                                    (h += Fn(v, w, m)),
                                                "gutter" in s && (h += Wn(w)),
                                                !Z &&
                                                    "speed" in s &&
                                                    (b && (h += Un(g)),
                                                    M && (h += $n(g))),
                                                h &&
                                                    (h =
                                                        "#" +
                                                        wt +
                                                        " > .tns-item{" +
                                                        h +
                                                        "}"),
                                                (o = f + d + p + h) &&
                                                    Qe.insertRule(
                                                        "@media (min-width: " +
                                                            a / 16 +
                                                            "em) {" +
                                                            o +
                                                            "}",
                                                        Qe.cssRules.length,
                                                    ));
                                        }
                                })(),
                                Vn());
                            var Sn = qe
                                    ? Z
                                        ? function () {
                                              var e = dt,
                                                  t = pt;
                                              ((e += He),
                                                  (t -= He),
                                                  Ne
                                                      ? ((e += 1), (t -= 1))
                                                      : De &&
                                                        (Me + Le) % (De + Le) &&
                                                        (t -= 1),
                                                  tt &&
                                                      (ct > t
                                                          ? (ct -= me)
                                                          : ct < e &&
                                                            (ct += me)));
                                          }
                                        : function () {
                                              if (ct > pt)
                                                  for (; ct >= dt + me; )
                                                      ct -= me;
                                              else if (ct < dt)
                                                  for (; ct <= pt - me; )
                                                      ct += me;
                                          }
                                    : function () {
                                          ct = Math.max(dt, Math.min(pt, ct));
                                      },
                                kn = Z
                                    ? function () {
                                          var e, t, n, r, i, o, a, s, u, l, c;
                                          (Er(fe, ""),
                                              b || !Ie
                                                  ? (Nr(),
                                                    (Ie && I(fe)) || jr())
                                                  : ((e = fe),
                                                    (t = at),
                                                    (n = st),
                                                    (r = ut),
                                                    (i = kr()),
                                                    (o = Ie),
                                                    (a = jr),
                                                    (s = Math.min(o, 10)),
                                                    (u =
                                                        i.indexOf("%") >= 0
                                                            ? "%"
                                                            : "px"),
                                                    (i = i.replace(u, "")),
                                                    (l = Number(
                                                        e.style[t]
                                                            .replace(n, "")
                                                            .replace(r, "")
                                                            .replace(u, ""),
                                                    )),
                                                    (c = ((i - l) / o) * s),
                                                    setTimeout(function i() {
                                                        ((o -= s),
                                                            (l += c),
                                                            (e.style[t] =
                                                                n + l + u + r),
                                                            o > 0
                                                                ? setTimeout(
                                                                      i,
                                                                      s,
                                                                  )
                                                                : a());
                                                    }, s)),
                                              ue || Zr());
                                      }
                                    : function () {
                                          et = [];
                                          var e = {};
                                          ((e[F] = e[W] = jr),
                                              U(he[ft], e),
                                              _(he[ct], e),
                                              Lr(ft, ne, re, !0),
                                              Lr(ct, oe, ne),
                                              (F && W && Ie && I(fe)) || jr());
                                      };
                            return {
                                version: "2.9.4",
                                getInfo: ti,
                                events: bt,
                                goTo: Hr,
                                play: function () {
                                    Ve && !dn && (qr(), (hn = !1));
                                },
                                pause: function () {
                                    dn && (Rr(), (hn = !0));
                                },
                                isOn: ge,
                                updateSliderHeight: vr,
                                refresh: Vn,
                                destroy: function () {
                                    if (
                                        ((Qe.disabled = !0),
                                        Qe.ownerNode && Qe.ownerNode.remove(),
                                        U(n, { resize: Qn }),
                                        Be && U(t, Mt),
                                        Yt && U(Yt, kt),
                                        en && U(en, Dt),
                                        U(fe, Nt),
                                        U(fe, Lt),
                                        gn && U(gn, { click: Fr }),
                                        Ve && clearInterval(fn),
                                        Z && F)
                                    ) {
                                        var r = {};
                                        ((r[F] = jr), U(fe, r));
                                    }
                                    (Ue && U(fe, Ot), $e && U(fe, jt));
                                    var i = [pe, Xt, Qt, Zt, tn, yn];
                                    for (var o in (X.forEach(function (t, n) {
                                        var r = "container" === t ? le : e[t];
                                        if ("object" == typeof r && r) {
                                            var o =
                                                    !!r.previousElementSibling &&
                                                    r.previousElementSibling,
                                                a = r.parentNode;
                                            ((r.outerHTML = i[n]),
                                                (e[t] = o
                                                    ? o.nextElementSibling
                                                    : a.firstElementChild));
                                        }
                                    }),
                                    (X =
                                        ne =
                                        re =
                                        ie =
                                        oe =
                                        ue =
                                        le =
                                        ce =
                                        fe =
                                        de =
                                        pe =
                                        he =
                                        me =
                                        se =
                                        ve =
                                        ke =
                                        De =
                                        Ne =
                                        Le =
                                        Me =
                                        je =
                                        He =
                                        Pe =
                                        Be =
                                        Ie =
                                        ze =
                                        qe =
                                        Re =
                                        Qe =
                                        Ze =
                                        ye =
                                        et =
                                        tt =
                                        nt =
                                        rt =
                                        it =
                                        ot =
                                        at =
                                        st =
                                        ut =
                                        lt =
                                        ct =
                                        ft =
                                        dt =
                                        pt =
                                        mt =
                                        vt =
                                        gt =
                                        yt =
                                        bt =
                                        xt =
                                        wt =
                                        Tt =
                                        Ct =
                                        Et =
                                        At =
                                        St =
                                        kt =
                                        Dt =
                                        Nt =
                                        Lt =
                                        Mt =
                                        Ot =
                                        jt =
                                        Ht =
                                        Pt =
                                        Bt =
                                        It =
                                        zt =
                                        qt =
                                        Rt =
                                        Wt =
                                        _t =
                                        be =
                                        Fe =
                                        We =
                                        Yt =
                                        Xt =
                                        Gt =
                                        Jt =
                                        $t =
                                        Vt =
                                        _e =
                                        en =
                                        tn =
                                        Kt =
                                        nn =
                                        rn =
                                        on =
                                        an =
                                        sn =
                                        un =
                                        ln =
                                        cn =
                                        Ve =
                                        Ye =
                                        vn =
                                        Xe =
                                        Ge =
                                        gn =
                                        yn =
                                        Je =
                                        bn =
                                        fn =
                                        dn =
                                        pn =
                                        hn =
                                        mn =
                                        Tn =
                                        Cn =
                                        xn =
                                        En =
                                        wn =
                                        An =
                                        Ue =
                                        $e =
                                            null),
                                    this))
                                        "rebuild" !== o && (this[o] = null);
                                    ge = !1;
                                },
                                rebuild: function () {
                                    return V(m(e, G));
                                },
                            };
                        }
                        function Dn(e) {
                            e && (Fe = _e = Ue = $e = Be = Ve = Ge = Je = !1);
                        }
                        function Nn() {
                            for (var e = Z ? ct - tt : ct; e < 0; ) e += me;
                            return (e % me) + 1;
                        }
                        function Ln(e) {
                            return (
                                (e = e
                                    ? Math.max(
                                          0,
                                          Math.min(qe ? me - 1 : me - je, e),
                                      )
                                    : 0),
                                Z ? e + tt : e
                            );
                        }
                        function Mn(e) {
                            for (null == e && (e = ct), Z && (e -= tt); e < 0; )
                                e += me;
                            return Math.floor(e % me);
                        }
                        function On() {
                            var e,
                                t = Mn();
                            return (
                                (e = Bt
                                    ? t
                                    : De || ke
                                      ? Math.ceil(((t + 1) * nn) / me - 1)
                                      : Math.floor(t / je)),
                                !qe && Z && ct === pt && (e = nn - 1),
                                e
                            );
                        }
                        function jn() {
                            return (
                                n.innerWidth ||
                                t.documentElement.clientWidth ||
                                t.body.clientWidth
                            );
                        }
                        function Hn(e) {
                            return "top" === e ? "afterbegin" : "beforeend";
                        }
                        function Pn(e) {
                            if (null != e) {
                                var n,
                                    r,
                                    i = t.createElement("div");
                                return (
                                    e.appendChild(i),
                                    (r =
                                        (n = i.getBoundingClientRect()).right -
                                        n.left),
                                    i.remove(),
                                    r || Pn(e.parentNode)
                                );
                            }
                        }
                        function Bn() {
                            var e = Ne ? 2 * Ne - Le : 0;
                            return Pn(de) - e;
                        }
                        function In(t) {
                            if (e[t]) return !0;
                            if (J) for (var n in J) if (J[n][t]) return !0;
                            return !1;
                        }
                        function zn(t, n) {
                            if ((null == n && (n = ve), "items" === t && De))
                                return Math.floor((Me + Le) / (De + Le)) || 1;
                            var r = e[t];
                            if (J)
                                for (var i in J)
                                    n >= parseInt(i) &&
                                        t in J[i] &&
                                        (r = J[i][t]);
                            return (
                                "slideBy" === t &&
                                    "page" === r &&
                                    (r = zn("items")),
                                Z ||
                                    ("slideBy" !== t && "items" !== t) ||
                                    (r = Math.floor(r)),
                                r
                            );
                        }
                        function qn(e, t, n, r, i) {
                            var o = "";
                            if (void 0 !== e) {
                                var a = e;
                                (t && (a -= t),
                                    (o = ue
                                        ? "margin: 0 " + a + "px 0 " + e + "px;"
                                        : "margin: " +
                                          e +
                                          "px 0 " +
                                          a +
                                          "px 0;"));
                            } else if (t && !n) {
                                var s = "-" + t + "px";
                                o =
                                    "margin: 0 " +
                                    (ue ? s + " 0 0" : "0 " + s + " 0") +
                                    ";";
                            }
                            return (!Z && i && b && r && (o += Un(r)), o);
                        }
                        function Rn(e, t, n) {
                            return e
                                ? (e + t) * nt + "px"
                                : u
                                  ? u + "(" + 100 * nt + "% / " + n + ")"
                                  : (100 * nt) / n + "%";
                        }
                        function Fn(e, t, n) {
                            var r;
                            if (e) r = e + t + "px";
                            else {
                                Z || (n = Math.floor(n));
                                var i = Z ? nt : n;
                                r = u
                                    ? u + "(100% / " + i + ")"
                                    : 100 / i + "%";
                            }
                            return (
                                (r = "width:" + r),
                                "inner" !== Q ? r + ";" : r + " !important;"
                            );
                        }
                        function Wn(e) {
                            var t = "";
                            !1 !== e &&
                                (t =
                                    (ue ? "padding-" : "margin-") +
                                    (ue ? "right" : "bottom") +
                                    ": " +
                                    e +
                                    "px;");
                            return t;
                        }
                        function _n(e, t) {
                            var n = e.substring(0, e.length - t).toLowerCase();
                            return (n && (n = "-" + n + "-"), n);
                        }
                        function Un(e) {
                            return (
                                _n(b, 18) +
                                "transition-duration:" +
                                e / 1e3 +
                                "s;"
                            );
                        }
                        function $n(e) {
                            return (
                                _n(M, 17) +
                                "animation-duration:" +
                                e / 1e3 +
                                "s;"
                            );
                        }
                        function Vn() {
                            if (In("autoHeight") || ke || !ue) {
                                var e = fe.querySelectorAll("img");
                                (E(e, function (e) {
                                    var t = e.src;
                                    Ze ||
                                        (t && t.indexOf("data:image") < 0
                                            ? ((e.src = ""),
                                              _(e, _t),
                                              k(e, "loading"),
                                              (e.src = t))
                                            : lr(e));
                                }),
                                    d(function () {
                                        pr(H(e), function () {
                                            be = !0;
                                        });
                                    }),
                                    In("autoHeight") &&
                                        (e = fr(
                                            ct,
                                            Math.min(ct + je - 1, nt - 1),
                                        )),
                                    Ze
                                        ? Yn()
                                        : d(function () {
                                              pr(H(e), Yn);
                                          }));
                            } else (Z && Dr(), Gn(), Jn());
                        }
                        function Yn() {
                            if (ke && me > 1) {
                                var e = qe ? ct : me - 1;
                                !(function t() {
                                    var n = he[e].getBoundingClientRect().left,
                                        r =
                                            he[e - 1].getBoundingClientRect()
                                                .right;
                                    Math.abs(n - r) <= 1
                                        ? Xn()
                                        : setTimeout(function () {
                                              t();
                                          }, 16);
                                })();
                            } else Xn();
                        }
                        function Xn() {
                            ((ue && !ke) ||
                                (gr(),
                                ke
                                    ? ((it = Sr()),
                                      Et && (At = Kn()),
                                      (pt = lt()),
                                      Dn(Tt || At))
                                    : Zr()),
                                Z && Dr(),
                                Gn(),
                                Jn());
                        }
                        function Gn() {
                            if (
                                (yr(),
                                le.insertAdjacentHTML(
                                    "afterbegin",
                                    '<div class="tns-liveregion tns-visually-hidden" aria-live="polite" aria-atomic="true">slide <span class="current">' +
                                        ar() +
                                        "</span>  of " +
                                        me +
                                        "</div>",
                                ),
                                (xe = le.querySelector(
                                    ".tns-liveregion .current",
                                )),
                                It)
                            ) {
                                var t = Ve ? "stop" : "start";
                                (gn
                                    ? O(gn, { "data-action": t })
                                    : e.autoplayButtonOutput &&
                                      (le.insertAdjacentHTML(
                                          Hn(e.autoplayPosition),
                                          '<button type="button" data-action="' +
                                              t +
                                              '">' +
                                              bn[0] +
                                              t +
                                              bn[1] +
                                              Xe[0] +
                                              "</button>",
                                      ),
                                      (gn = le.querySelector("[data-action]"))),
                                    gn && _(gn, { click: Fr }),
                                    Ve &&
                                        (qr(),
                                        Ge && _(fe, Nt),
                                        Je && _(fe, Lt)));
                            }
                            if (Pt) {
                                if (en)
                                    (O(en, {
                                        "aria-label": "Carousel Pagination",
                                    }),
                                        E((Kt = en.children), function (e, t) {
                                            O(e, {
                                                "data-nav": t,
                                                tabindex: "-1",
                                                "aria-label": ln + (t + 1),
                                                "aria-controls": wt,
                                            });
                                        }));
                                else {
                                    for (
                                        var n = "",
                                            r = Bt
                                                ? ""
                                                : 'style="display:none"',
                                            i = 0;
                                        i < me;
                                        i++
                                    )
                                        n +=
                                            '<button type="button" data-nav="' +
                                            i +
                                            '" tabindex="-1" aria-controls="' +
                                            wt +
                                            '" ' +
                                            r +
                                            ' aria-label="' +
                                            ln +
                                            (i + 1) +
                                            '"></button>';
                                    ((n =
                                        '<div class="tns-nav" aria-label="Carousel Pagination">' +
                                        n +
                                        "</div>"),
                                        le.insertAdjacentHTML(
                                            Hn(e.navPosition),
                                            n,
                                        ),
                                        (en = le.querySelector(".tns-nav")),
                                        (Kt = en.children));
                                }
                                if ((ei(), b)) {
                                    var o = b
                                            .substring(0, b.length - 18)
                                            .toLowerCase(),
                                        a = "transition: all " + Ie / 1e3 + "s";
                                    (o && (a = "-" + o + "-" + a),
                                        T(
                                            Qe,
                                            "[aria-controls^=" + wt + "-item]",
                                            a,
                                            C(Qe),
                                        ));
                                }
                                (O(Kt[an], {
                                    "aria-label": ln + (an + 1) + cn,
                                }),
                                    j(Kt[an], "tabindex"),
                                    k(Kt[an], un),
                                    _(en, Dt));
                            }
                            (Ht &&
                                (Yt ||
                                    (Gt && Jt) ||
                                    (le.insertAdjacentHTML(
                                        Hn(e.controlsPosition),
                                        '<div class="tns-controls" aria-label="Carousel Navigation" tabindex="0"><button type="button" data-controls="prev" tabindex="-1" aria-controls="' +
                                            wt +
                                            '">' +
                                            We[0] +
                                            '</button><button type="button" data-controls="next" tabindex="-1" aria-controls="' +
                                            wt +
                                            '">' +
                                            We[1] +
                                            "</button></div>",
                                    ),
                                    (Yt = le.querySelector(".tns-controls"))),
                                (Gt && Jt) ||
                                    ((Gt = Yt.children[0]),
                                    (Jt = Yt.children[1])),
                                e.controlsContainer &&
                                    O(Yt, {
                                        "aria-label": "Carousel Navigation",
                                        tabindex: "0",
                                    }),
                                (e.controlsContainer ||
                                    (e.prevButton && e.nextButton)) &&
                                    O([Gt, Jt], {
                                        "aria-controls": wt,
                                        tabindex: "-1",
                                    }),
                                (e.controlsContainer ||
                                    (e.prevButton && e.nextButton)) &&
                                    (O(Gt, { "data-controls": "prev" }),
                                    O(Jt, { "data-controls": "next" })),
                                ($t = xr(Gt)),
                                (Vt = xr(Jt)),
                                Cr(),
                                Yt ? _(Yt, kt) : (_(Gt, kt), _(Jt, kt))),
                                tr());
                        }
                        function Jn() {
                            if (Z && F) {
                                var r = {};
                                ((r[F] = jr), _(fe, r));
                            }
                            (Ue && _(fe, Ot, e.preventScrollOnTouch),
                                $e && _(fe, jt),
                                Be && _(t, Mt),
                                "inner" === Q
                                    ? bt.on("outerResized", function () {
                                          (Zn(), bt.emit("innerLoaded", ti()));
                                      })
                                    : (J || De || ke || Re || !ue) &&
                                      _(n, { resize: Qn }),
                                Re &&
                                    ("outer" === Q
                                        ? bt.on("innerLoaded", dr)
                                        : Tt || dr()),
                                ur(),
                                Tt ? ir() : At && rr(),
                                bt.on("indexChanged", hr),
                                "inner" === Q && bt.emit("innerLoaded", ti()),
                                "function" == typeof yt && yt(ti()),
                                (ge = !0));
                        }
                        function Qn(e) {
                            d(function () {
                                Zn(_r(e));
                            });
                        }
                        function Zn(n) {
                            if (ge) {
                                ("outer" === Q &&
                                    bt.emit("outerResized", ti(n)),
                                    (ve = jn()));
                                var r,
                                    i = se,
                                    o = !1;
                                J &&
                                    (er(),
                                    (r = i !== se) &&
                                        bt.emit("newBreakpointStart", ti(n)));
                                var a,
                                    s,
                                    u = je,
                                    l = Tt,
                                    f = At,
                                    d = Be,
                                    p = Fe,
                                    h = _e,
                                    m = Ue,
                                    v = $e,
                                    g = Ve,
                                    y = Ge,
                                    b = Je,
                                    x = ct;
                                if (r) {
                                    var w = De,
                                        A = Re,
                                        S = We,
                                        N = Oe,
                                        L = Xe;
                                    if (!c)
                                        var M = Le,
                                            O = Ne;
                                }
                                if (
                                    ((Be = zn("arrowKeys")),
                                    (Fe = zn("controls")),
                                    (_e = zn("nav")),
                                    (Ue = zn("touch")),
                                    (Oe = zn("center")),
                                    ($e = zn("mouseDrag")),
                                    (Ve = zn("autoplay")),
                                    (Ge = zn("autoplayHoverPause")),
                                    (Je = zn("autoplayResetOnVisibility")),
                                    r &&
                                        ((Tt = zn("disable")),
                                        (De = zn("fixedWidth")),
                                        (Ie = zn("speed")),
                                        (Re = zn("autoHeight")),
                                        (We = zn("controlsText")),
                                        (Xe = zn("autoplayText")),
                                        (Ye = zn("autoplayTimeout")),
                                        c ||
                                            ((Ne = zn("edgePadding")),
                                            (Le = zn("gutter")))),
                                    Dn(Tt),
                                    (Me = Bn()),
                                    (ue && !ke) ||
                                        Tt ||
                                        (gr(), ue || (Zr(), (o = !0))),
                                    (De || ke) && ((it = Sr()), (pt = lt())),
                                    (r || De) &&
                                        ((je = zn("items")),
                                        (He = zn("slideBy")),
                                        (s = je !== u) &&
                                            (De || ke || (pt = lt()), Sn())),
                                    r &&
                                        Tt !== l &&
                                        (Tt
                                            ? ir()
                                            : (function () {
                                                  if (!Ct) return;
                                                  if (
                                                      ((Qe.disabled = !1),
                                                      (fe.className += xt),
                                                      Dr(),
                                                      qe)
                                                  )
                                                      for (var e = tt; e--; )
                                                          (Z && B(he[e]),
                                                              B(
                                                                  he[
                                                                      nt - e - 1
                                                                  ],
                                                              ));
                                                  if (!Z)
                                                      for (
                                                          var t = ct,
                                                              n = ct + me;
                                                          t < n;
                                                          t++
                                                      ) {
                                                          var r = he[t],
                                                              i =
                                                                  t < ct + je
                                                                      ? ne
                                                                      : oe;
                                                          ((r.style.left =
                                                              (100 * (t - ct)) /
                                                                  je +
                                                              "%"),
                                                              k(r, i));
                                                      }
                                                  (nr(), (Ct = !1));
                                              })()),
                                    Et &&
                                        (r || De || ke) &&
                                        (At = Kn()) !== f &&
                                        (At
                                            ? (Nr(kr(Ln(0))), rr())
                                            : (!(function () {
                                                  if (!St) return;
                                                  Ne &&
                                                      c &&
                                                      (ce.style.margin = "");
                                                  if (tt)
                                                      for (
                                                          var e =
                                                                  "tns-transparent",
                                                              t = tt;
                                                          t--;
                                                      )
                                                          (Z && D(he[t], e),
                                                              D(
                                                                  he[
                                                                      nt - t - 1
                                                                  ],
                                                                  e,
                                                              ));
                                                  (nr(), (St = !1));
                                              })(),
                                              (o = !0))),
                                    Dn(Tt || At),
                                    Ve || (Ge = Je = !1),
                                    Be !== d && (Be ? _(t, Mt) : U(t, Mt)),
                                    Fe !== p &&
                                        (Fe
                                            ? Yt
                                                ? B(Yt)
                                                : (Gt && B(Gt), Jt && B(Jt))
                                            : Yt
                                              ? P(Yt)
                                              : (Gt && P(Gt), Jt && P(Jt))),
                                    _e !== h && (_e ? (B(en), ei()) : P(en)),
                                    Ue !== m &&
                                        (Ue
                                            ? _(fe, Ot, e.preventScrollOnTouch)
                                            : U(fe, Ot)),
                                    $e !== v && ($e ? _(fe, jt) : U(fe, jt)),
                                    Ve !== g &&
                                        (Ve
                                            ? (gn && B(gn), dn || hn || qr())
                                            : (gn && P(gn), dn && Rr())),
                                    Ge !== y && (Ge ? _(fe, Nt) : U(fe, Nt)),
                                    Je !== b && (Je ? _(t, Lt) : U(t, Lt)),
                                    r)
                                ) {
                                    if (
                                        ((De === w && Oe === N) || (o = !0),
                                        Re !== A &&
                                            (Re || (ce.style.height = "")),
                                        Fe &&
                                            We !== S &&
                                            ((Gt.innerHTML = We[0]),
                                            (Jt.innerHTML = We[1])),
                                        gn && Xe !== L)
                                    ) {
                                        var j = Ve ? 1 : 0,
                                            H = gn.innerHTML,
                                            I = H.length - L[j].length;
                                        H.substring(I) === L[j] &&
                                            (gn.innerHTML =
                                                H.substring(0, I) + Xe[j]);
                                    }
                                } else Oe && (De || ke) && (o = !0);
                                if (
                                    ((s || (De && !ke)) && ((nn = Kr()), ei()),
                                    (a = ct !== x)
                                        ? (bt.emit("indexChanged", ti()),
                                          (o = !0))
                                        : s
                                          ? a || hr()
                                          : (De || ke) && (ur(), yr(), or()),
                                    s &&
                                        !Z &&
                                        (function () {
                                            for (
                                                var e = ct + Math.min(me, je),
                                                    t = nt;
                                                t--;
                                            ) {
                                                var n = he[t];
                                                (t >= ct && t < e
                                                    ? (k(n, "tns-moving"),
                                                      (n.style.left =
                                                          (100 * (t - ct)) /
                                                              je +
                                                          "%"),
                                                      k(n, ne),
                                                      D(n, oe))
                                                    : n.style.left &&
                                                      ((n.style.left = ""),
                                                      k(n, oe),
                                                      D(n, ne)),
                                                    D(n, re));
                                            }
                                            setTimeout(function () {
                                                E(he, function (e) {
                                                    D(e, "tns-moving");
                                                });
                                            }, 300);
                                        })(),
                                    !Tt && !At)
                                ) {
                                    if (
                                        r &&
                                        !c &&
                                        ((Ne === O && Le === M) ||
                                            (ce.style.cssText = qn(
                                                Ne,
                                                Le,
                                                De,
                                                Ie,
                                                Re,
                                            )),
                                        ue)
                                    ) {
                                        Z && (fe.style.width = Rn(De, Le, je));
                                        var z = Fn(De, Le, je) + Wn(Le);
                                        (!(function (e, t) {
                                            "deleteRule" in e
                                                ? e.deleteRule(t)
                                                : e.removeRule(t);
                                        })(Qe, C(Qe) - 1),
                                            T(
                                                Qe,
                                                "#" + wt + " > .tns-item",
                                                z,
                                                C(Qe),
                                            ));
                                    }
                                    (Re && dr(), o && (Dr(), (ft = ct)));
                                }
                                r && bt.emit("newBreakpointEnd", ti(n));
                            }
                        }
                        function Kn() {
                            if (!De && !ke)
                                return me <= (Oe ? je - (je - 1) / 2 : je);
                            var e = De ? (De + Le) * me : ye[me],
                                t = Ne ? Me + 2 * Ne : Me + Le;
                            return (
                                Oe &&
                                    (t -= De
                                        ? (Me - De) / 2
                                        : (Me - (ye[ct + 1] - ye[ct] - Le)) /
                                          2),
                                e <= t
                            );
                        }
                        function er() {
                            for (var e in ((se = 0), J))
                                ((e = parseInt(e)), ve >= e && (se = e));
                        }
                        function tr() {
                            (!Ve && gn && P(gn),
                                !_e && en && P(en),
                                Fe ||
                                    (Yt ? P(Yt) : (Gt && P(Gt), Jt && P(Jt))));
                        }
                        function nr() {
                            (Ve && gn && B(gn),
                                _e && en && B(en),
                                Fe &&
                                    (Yt ? B(Yt) : (Gt && B(Gt), Jt && B(Jt))));
                        }
                        function rr() {
                            if (!St) {
                                if ((Ne && (ce.style.margin = "0px"), tt))
                                    for (
                                        var e = "tns-transparent", t = tt;
                                        t--;
                                    )
                                        (Z && k(he[t], e),
                                            k(he[nt - t - 1], e));
                                (tr(), (St = !0));
                            }
                        }
                        function ir() {
                            if (!Ct) {
                                if (
                                    ((Qe.disabled = !0),
                                    (fe.className = fe.className.replace(
                                        xt.substring(1),
                                        "",
                                    )),
                                    j(fe, ["style"]),
                                    qe)
                                )
                                    for (var e = tt; e--; )
                                        (Z && P(he[e]), P(he[nt - e - 1]));
                                if (((ue && Z) || j(ce, ["style"]), !Z))
                                    for (var t = ct, n = ct + me; t < n; t++) {
                                        var r = he[t];
                                        (j(r, ["style"]), D(r, ne), D(r, oe));
                                    }
                                (tr(), (Ct = !0));
                            }
                        }
                        function or() {
                            var e = ar();
                            xe.innerHTML !== e && (xe.innerHTML = e);
                        }
                        function ar() {
                            var e = sr(),
                                t = e[0] + 1,
                                n = e[1] + 1;
                            return t === n ? t + "" : t + " to " + n;
                        }
                        function sr(e) {
                            null == e && (e = kr());
                            var t,
                                n,
                                r,
                                i = ct;
                            if (
                                (Oe || Ne
                                    ? (ke || De) &&
                                      ((n = -(parseFloat(e) + Ne)),
                                      (r = n + Me + 2 * Ne))
                                    : ke && ((n = ye[ct]), (r = n + Me)),
                                ke)
                            )
                                ye.forEach(function (e, o) {
                                    o < nt &&
                                        ((Oe || Ne) && e <= n + 0.5 && (i = o),
                                        r - e >= 0.5 && (t = o));
                                });
                            else {
                                if (De) {
                                    var o = De + Le;
                                    Oe || Ne
                                        ? ((i = Math.floor(n / o)),
                                          (t = Math.ceil(r / o - 1)))
                                        : (t = i + Math.ceil(Me / o) - 1);
                                } else if (Oe || Ne) {
                                    var a = je - 1;
                                    if (
                                        (Oe
                                            ? ((i -= a / 2), (t = ct + a / 2))
                                            : (t = ct + a),
                                        Ne)
                                    ) {
                                        var s = (Ne * je) / Me;
                                        ((i -= s), (t += s));
                                    }
                                    ((i = Math.floor(i)), (t = Math.ceil(t)));
                                } else t = i + je - 1;
                                ((i = Math.max(i, 0)),
                                    (t = Math.min(t, nt - 1)));
                            }
                            return [i, t];
                        }
                        function ur() {
                            if (Ze && !Tt) {
                                var e = sr();
                                (e.push(Ke),
                                    fr.apply(null, e).forEach(function (e) {
                                        if (!S(e, Wt)) {
                                            var t = {};
                                            ((t[F] = function (e) {
                                                e.stopPropagation();
                                            }),
                                                _(e, t),
                                                _(e, _t),
                                                (e.src = L(e, "data-src")));
                                            var n = L(e, "data-srcset");
                                            (n && (e.srcset = n),
                                                k(e, "loading"));
                                        }
                                    }));
                            }
                        }
                        function lr(e) {
                            (k(e, "loaded"), cr(e));
                        }
                        function cr(e) {
                            (k(e, Wt), D(e, "loading"), U(e, _t));
                        }
                        function fr(e, t, n) {
                            var r = [];
                            for (n || (n = "img"); e <= t; )
                                (E(he[e].querySelectorAll(n), function (e) {
                                    r.push(e);
                                }),
                                    e++);
                            return r;
                        }
                        function dr() {
                            var e = fr.apply(null, sr());
                            d(function () {
                                pr(e, vr);
                            });
                        }
                        function pr(e, t) {
                            return be
                                ? t()
                                : (e.forEach(function (t, n) {
                                      (!Ze && t.complete && cr(t),
                                          S(t, Wt) && e.splice(n, 1));
                                  }),
                                  e.length
                                      ? void d(function () {
                                            pr(e, t);
                                        })
                                      : t());
                        }
                        function hr() {
                            (ur(),
                                yr(),
                                or(),
                                Cr(),
                                (function () {
                                    if (
                                        _e &&
                                        ((an = on >= 0 ? on : On()),
                                        (on = -1),
                                        an !== sn)
                                    ) {
                                        var e = Kt[sn],
                                            t = Kt[an];
                                        (O(e, {
                                            tabindex: "-1",
                                            "aria-label": ln + (sn + 1),
                                        }),
                                            D(e, un),
                                            O(t, {
                                                "aria-label":
                                                    ln + (an + 1) + cn,
                                            }),
                                            j(t, "tabindex"),
                                            k(t, un),
                                            (sn = an));
                                    }
                                })());
                        }
                        function mr(e, t) {
                            for (
                                var n = [], r = e, i = Math.min(e + t, nt);
                                r < i;
                                r++
                            )
                                n.push(he[r].offsetHeight);
                            return Math.max.apply(null, n);
                        }
                        function vr() {
                            var e = Re ? mr(ct, je) : mr(tt, me),
                                t = ae || ce;
                            t.style.height !== e && (t.style.height = e + "px");
                        }
                        function gr() {
                            ye = [0];
                            var e = ue ? "left" : "top",
                                t = ue ? "right" : "bottom",
                                n = he[0].getBoundingClientRect()[e];
                            E(he, function (r, i) {
                                (i && ye.push(r.getBoundingClientRect()[e] - n),
                                    i === nt - 1 &&
                                        ye.push(
                                            r.getBoundingClientRect()[t] - n,
                                        ));
                            });
                        }
                        function yr() {
                            var e = sr(),
                                t = e[0],
                                n = e[1];
                            E(he, function (e, r) {
                                r >= t && r <= n
                                    ? N(e, "aria-hidden") &&
                                      (j(e, ["aria-hidden", "tabindex"]),
                                      k(e, Rt))
                                    : N(e, "aria-hidden") ||
                                      (O(e, {
                                          "aria-hidden": "true",
                                          tabindex: "-1",
                                      }),
                                      D(e, Rt));
                            });
                        }
                        function br(e) {
                            return e.nodeName.toLowerCase();
                        }
                        function xr(e) {
                            return "button" === br(e);
                        }
                        function wr(e) {
                            return "true" === e.getAttribute("aria-disabled");
                        }
                        function Tr(e, t, n) {
                            e
                                ? (t.disabled = n)
                                : t.setAttribute("aria-disabled", n.toString());
                        }
                        function Cr() {
                            if (Fe && !ze && !qe) {
                                var e = $t ? Gt.disabled : wr(Gt),
                                    t = Vt ? Jt.disabled : wr(Jt),
                                    n = ct <= dt,
                                    r = !ze && ct >= pt;
                                (n && !e && Tr($t, Gt, !0),
                                    !n && e && Tr($t, Gt, !1),
                                    r && !t && Tr(Vt, Jt, !0),
                                    !r && t && Tr(Vt, Jt, !1));
                            }
                        }
                        function Er(e, t) {
                            b && (e.style[b] = t);
                        }
                        function Ar(e) {
                            return (
                                null == e && (e = ct),
                                ke
                                    ? (Me -
                                          (Ne ? Le : 0) -
                                          (ye[e + 1] - ye[e] - Le)) /
                                      2
                                    : De
                                      ? (Me - De) / 2
                                      : (je - 1) / 2
                            );
                        }
                        function Sr() {
                            var e =
                                Me +
                                (Ne ? Le : 0) -
                                (De ? (De + Le) * nt : ye[nt]);
                            return (
                                Oe &&
                                    !qe &&
                                    (e = De
                                        ? -(De + Le) * (nt - 1) - Ar()
                                        : Ar(nt - 1) - ye[nt - 1]),
                                e > 0 && (e = 0),
                                e
                            );
                        }
                        function kr(e) {
                            var t;
                            if ((null == e && (e = ct), ue && !ke))
                                if (De)
                                    ((t = -(De + Le) * e), Oe && (t += Ar()));
                                else {
                                    var n = f ? nt : je;
                                    (Oe && (e -= Ar()), (t = (100 * -e) / n));
                                }
                            else ((t = -ye[e]), Oe && ke && (t += Ar()));
                            return (
                                rt && (t = Math.max(t, it)),
                                (t += !ue || ke || De ? "px" : "%")
                            );
                        }
                        function Dr(e) {
                            (Er(fe, "0s"), Nr(e));
                        }
                        function Nr(e) {
                            (null == e && (e = kr()),
                                (fe.style[at] = st + e + ut));
                        }
                        function Lr(e, t, n, r) {
                            var i = e + je;
                            qe || (i = Math.min(i, nt));
                            for (var o = e; o < i; o++) {
                                var a = he[o];
                                (r ||
                                    (a.style.left =
                                        (100 * (o - ct)) / je + "%"),
                                    ie &&
                                        A &&
                                        (a.style[A] = a.style[R] =
                                            (ie * (o - e)) / 1e3 + "s"),
                                    D(a, t),
                                    k(a, n),
                                    r && et.push(a));
                            }
                        }
                        function Mr(e, t) {
                            (ot && Sn(),
                                (ct !== ft || t) &&
                                    (bt.emit("indexChanged", ti()),
                                    bt.emit("transitionStart", ti()),
                                    Re && dr(),
                                    dn &&
                                        e &&
                                        ["click", "keydown"].indexOf(e.type) >=
                                            0 &&
                                        Rr(),
                                    (gt = !0),
                                    kn()));
                        }
                        function Or(e) {
                            return e.toLowerCase().replace(/-/g, "");
                        }
                        function jr(e) {
                            if (Z || gt) {
                                if (
                                    (bt.emit("transitionEnd", ti(e)),
                                    !Z && et.length > 0)
                                )
                                    for (var t = 0; t < et.length; t++) {
                                        var n = et[t];
                                        ((n.style.left = ""),
                                            R &&
                                                A &&
                                                ((n.style[R] = ""),
                                                (n.style[A] = "")),
                                            D(n, re),
                                            k(n, oe));
                                    }
                                if (
                                    !e ||
                                    (!Z && e.target.parentNode === fe) ||
                                    (e.target === fe &&
                                        Or(e.propertyName) === Or(at))
                                ) {
                                    if (!ot) {
                                        var r = ct;
                                        (Sn(),
                                            ct !== r &&
                                                (bt.emit("indexChanged", ti()),
                                                Dr()));
                                    }
                                    ("inner" === Q &&
                                        bt.emit("innerLoaded", ti()),
                                        (gt = !1),
                                        (ft = ct));
                                }
                            }
                        }
                        function Hr(e, t) {
                            if (!At)
                                if ("prev" === e) Pr(t, -1);
                                else if ("next" === e) Pr(t, 1);
                                else {
                                    if (gt) {
                                        if (ht) return;
                                        jr();
                                    }
                                    var n = Mn(),
                                        r = 0;
                                    if (
                                        ("first" === e
                                            ? (r = -n)
                                            : "last" === e
                                              ? (r = Z
                                                    ? me - je - n
                                                    : me - 1 - n)
                                              : ("number" != typeof e &&
                                                    (e = parseInt(e)),
                                                isNaN(e) ||
                                                    (t ||
                                                        (e = Math.max(
                                                            0,
                                                            Math.min(me - 1, e),
                                                        )),
                                                    (r = e - n))),
                                        !Z && r && Math.abs(r) < je)
                                    ) {
                                        var i = r > 0 ? 1 : -1;
                                        r +=
                                            ct + r - me >= dt
                                                ? me * i
                                                : 2 * me * i * -1;
                                    }
                                    ((ct += r),
                                        Z &&
                                            qe &&
                                            (ct < dt && (ct += me),
                                            ct > pt && (ct -= me)),
                                        Mn(ct) !== Mn(ft) && Mr(t));
                                }
                        }
                        function Pr(e, t) {
                            if (gt) {
                                if (ht) return;
                                jr();
                            }
                            var n;
                            if (!t) {
                                for (
                                    var r = Ur((e = _r(e)));
                                    r !== Yt && [Gt, Jt].indexOf(r) < 0;
                                )
                                    r = r.parentNode;
                                var i = [Gt, Jt].indexOf(r);
                                i >= 0 && ((n = !0), (t = 0 === i ? -1 : 1));
                            }
                            if (ze) {
                                if (ct === dt && -1 === t)
                                    return void Hr("last", e);
                                if (ct === pt && 1 === t)
                                    return void Hr("first", e);
                            }
                            t &&
                                ((ct += He * t),
                                ke && (ct = Math.floor(ct)),
                                Mr(
                                    n || (e && "keydown" === e.type) ? e : null,
                                ));
                        }
                        function Br() {
                            ((fn = setInterval(function () {
                                Pr(null, vn);
                            }, Ye)),
                                (dn = !0));
                        }
                        function Ir() {
                            (clearInterval(fn), (dn = !1));
                        }
                        function zr(e, t) {
                            (O(gn, { "data-action": e }),
                                (gn.innerHTML = bn[0] + e + bn[1] + t));
                        }
                        function qr() {
                            (Br(), gn && zr("stop", Xe[1]));
                        }
                        function Rr() {
                            (Ir(), gn && zr("start", Xe[0]));
                        }
                        function Fr() {
                            dn ? (Rr(), (hn = !0)) : (qr(), (hn = !1));
                        }
                        function Wr(e) {
                            e.focus();
                        }
                        function _r(e) {
                            return $r((e = e || n.event))
                                ? e.changedTouches[0]
                                : e;
                        }
                        function Ur(e) {
                            return e.target || n.event.srcElement;
                        }
                        function $r(e) {
                            return e.type.indexOf("touch") >= 0;
                        }
                        function Vr(e) {
                            e.preventDefault
                                ? e.preventDefault()
                                : (e.returnValue = !1);
                        }
                        function Yr() {
                            return (
                                (o = Cn.y - Tn.y),
                                (a = Cn.x - Tn.x),
                                (t = Math.atan2(o, a) * (180 / Math.PI)),
                                (n = mt),
                                (r = !1),
                                (i = Math.abs(90 - Math.abs(t))) >= 90 - n
                                    ? (r = "horizontal")
                                    : i <= n && (r = "vertical"),
                                r === e.axis
                            );
                            var t, n, r, i, o, a;
                        }
                        function Xr(e) {
                            if (gt) {
                                if (ht) return;
                                jr();
                            }
                            (Ve && dn && Ir(),
                                (En = !0),
                                wn && (h(wn), (wn = null)));
                            var t = _r(e);
                            (bt.emit($r(e) ? "touchStart" : "dragStart", ti(e)),
                                !$r(e) &&
                                    ["img", "a"].indexOf(br(Ur(e))) >= 0 &&
                                    Vr(e),
                                (Cn.x = Tn.x = t.clientX),
                                (Cn.y = Tn.y = t.clientY),
                                Z &&
                                    ((xn = parseFloat(
                                        fe.style[at].replace(st, ""),
                                    )),
                                    Er(fe, "0s")));
                        }
                        function Gr(e) {
                            if (En) {
                                var t = _r(e);
                                ((Cn.x = t.clientX),
                                    (Cn.y = t.clientY),
                                    Z
                                        ? wn ||
                                          (wn = d(function () {
                                              Jr(e);
                                          }))
                                        : ("?" === vt && (vt = Yr()),
                                          vt && (Ut = !0)),
                                    ("boolean" != typeof e.cancelable ||
                                        e.cancelable) &&
                                        Ut &&
                                        e.preventDefault());
                            }
                        }
                        function Jr(e) {
                            if (vt) {
                                if (
                                    (h(wn),
                                    En &&
                                        (wn = d(function () {
                                            Jr(e);
                                        })),
                                    "?" === vt && (vt = Yr()),
                                    vt)
                                ) {
                                    !Ut && $r(e) && (Ut = !0);
                                    try {
                                        e.type &&
                                            bt.emit(
                                                $r(e)
                                                    ? "touchMove"
                                                    : "dragMove",
                                                ti(e),
                                            );
                                    } catch (e) {}
                                    var t = xn,
                                        n = An(Cn, Tn);
                                    if (!ue || De || ke)
                                        ((t += n), (t += "px"));
                                    else
                                        ((t += f
                                            ? (n * je * 100) / ((Me + Le) * nt)
                                            : (100 * n) / (Me + Le)),
                                            (t += "%"));
                                    fe.style[at] = st + t + ut;
                                }
                            } else En = !1;
                        }
                        function Qr(t) {
                            if (En) {
                                (wn && (h(wn), (wn = null)),
                                    Z && Er(fe, ""),
                                    (En = !1));
                                var n = _r(t);
                                ((Cn.x = n.clientX), (Cn.y = n.clientY));
                                var r = An(Cn, Tn);
                                if (Math.abs(r)) {
                                    if (!$r(t)) {
                                        var i = Ur(t);
                                        _(i, {
                                            click: function e(t) {
                                                (Vr(t), U(i, { click: e }));
                                            },
                                        });
                                    }
                                    Z
                                        ? (wn = d(function () {
                                              if (ue && !ke) {
                                                  var e = (-r * je) / (Me + Le);
                                                  ((e =
                                                      r > 0
                                                          ? Math.floor(e)
                                                          : Math.ceil(e)),
                                                      (ct += e));
                                              } else {
                                                  var n = -(xn + r);
                                                  if (n <= 0) ct = dt;
                                                  else if (n >= ye[nt - 1])
                                                      ct = pt;
                                                  else
                                                      for (
                                                          var i = 0;
                                                          i < nt && n >= ye[i];
                                                      )
                                                          ((ct = i),
                                                              n > ye[i] &&
                                                                  r < 0 &&
                                                                  (ct += 1),
                                                              i++);
                                              }
                                              (Mr(t, r),
                                                  bt.emit(
                                                      $r(t)
                                                          ? "touchEnd"
                                                          : "dragEnd",
                                                      ti(t),
                                                  ));
                                          }))
                                        : vt && Pr(t, r > 0 ? -1 : 1);
                                }
                            }
                            ("auto" === e.preventScrollOnTouch && (Ut = !1),
                                mt && (vt = "?"),
                                Ve && !dn && Br());
                        }
                        function Zr() {
                            (ae || ce).style.height =
                                ye[ct + je] - ye[ct] + "px";
                        }
                        function Kr() {
                            var e = De ? ((De + Le) * me) / Me : me / je;
                            return Math.min(Math.ceil(e), me);
                        }
                        function ei() {
                            if (_e && !Bt && nn !== rn) {
                                var e = rn,
                                    t = nn,
                                    n = B;
                                for (
                                    rn > nn && ((e = nn), (t = rn), (n = P));
                                    e < t;
                                )
                                    (n(Kt[e]), e++);
                                rn = nn;
                            }
                        }
                        function ti(e) {
                            return {
                                container: fe,
                                slideItems: he,
                                navContainer: en,
                                navItems: Kt,
                                controlsContainer: Yt,
                                hasControls: Ht,
                                prevButton: Gt,
                                nextButton: Jt,
                                items: je,
                                slideBy: He,
                                cloneCount: tt,
                                slideCount: me,
                                slideCountNew: nt,
                                index: ct,
                                indexCached: ft,
                                displayIndex: Nn(),
                                navCurrentIndex: an,
                                navCurrentIndexCached: sn,
                                pages: nn,
                                pagesCached: rn,
                                sheet: Qe,
                                isOn: ge,
                                event: e || {},
                            };
                        }
                        Y && console.warn("No slides found in", e.container);
                    },
                    Y = (n(90), n(82), n(808)),
                    X = n.n(Y),
                    G = n(600),
                    J = { insert: "head", singleton: !1 };
                u()(G.Z, J);
                G.Z.locals;
                var Q =
                        "undefined" != typeof window &&
                        "undefined" != typeof document &&
                        "undefined" != typeof navigator,
                    Z = (function () {
                        for (
                            var e = ["Edge", "Trident", "Firefox"], t = 0;
                            t < e.length;
                            t += 1
                        )
                            if (Q && navigator.userAgent.indexOf(e[t]) >= 0)
                                return 1;
                        return 0;
                    })();
                var K =
                    Q && window.Promise
                        ? function (e) {
                              var t = !1;
                              return function () {
                                  t ||
                                      ((t = !0),
                                      window.Promise.resolve().then(
                                          function () {
                                              ((t = !1), e());
                                          },
                                      ));
                              };
                          }
                        : function (e) {
                              var t = !1;
                              return function () {
                                  t ||
                                      ((t = !0),
                                      setTimeout(function () {
                                          ((t = !1), e());
                                      }, Z));
                              };
                          };
                function ee(e) {
                    return e && "[object Function]" === {}.toString.call(e);
                }
                function te(e, t) {
                    if (1 !== e.nodeType) return [];
                    var n = e.ownerDocument.defaultView.getComputedStyle(
                        e,
                        null,
                    );
                    return t ? n[t] : n;
                }
                function ne(e) {
                    return "HTML" === e.nodeName ? e : e.parentNode || e.host;
                }
                function re(e) {
                    if (!e) return document.body;
                    switch (e.nodeName) {
                        case "HTML":
                        case "BODY":
                            return e.ownerDocument.body;
                        case "#document":
                            return e.body;
                    }
                    var t = te(e),
                        n = t.overflow,
                        r = t.overflowX,
                        i = t.overflowY;
                    return /(auto|scroll|overlay)/.test(n + i + r)
                        ? e
                        : re(ne(e));
                }
                function ie(e) {
                    return e && e.referenceNode ? e.referenceNode : e;
                }
                var oe =
                        Q &&
                        !(
                            !window.MSInputMethodContext ||
                            !document.documentMode
                        ),
                    ae = Q && /MSIE 10/.test(navigator.userAgent);
                function se(e) {
                    return 11 === e ? oe : 10 === e ? ae : oe || ae;
                }
                function ue(e) {
                    if (!e) return document.documentElement;
                    for (
                        var t = se(10) ? document.body : null,
                            n = e.offsetParent || null;
                        n === t && e.nextElementSibling;
                    )
                        n = (e = e.nextElementSibling).offsetParent;
                    var r = n && n.nodeName;
                    return r && "BODY" !== r && "HTML" !== r
                        ? -1 !== ["TH", "TD", "TABLE"].indexOf(n.nodeName) &&
                          "static" === te(n, "position")
                            ? ue(n)
                            : n
                        : e
                          ? e.ownerDocument.documentElement
                          : document.documentElement;
                }
                function le(e) {
                    return null !== e.parentNode ? le(e.parentNode) : e;
                }
                function ce(e, t) {
                    if (!(e && e.nodeType && t && t.nodeType))
                        return document.documentElement;
                    var n =
                            e.compareDocumentPosition(t) &
                            Node.DOCUMENT_POSITION_FOLLOWING,
                        r = n ? e : t,
                        i = n ? t : e,
                        o = document.createRange();
                    (o.setStart(r, 0), o.setEnd(i, 0));
                    var a,
                        s,
                        u = o.commonAncestorContainer;
                    if ((e !== u && t !== u) || r.contains(i))
                        return "BODY" === (s = (a = u).nodeName) ||
                            ("HTML" !== s && ue(a.firstElementChild) !== a)
                            ? ue(u)
                            : u;
                    var l = le(e);
                    return l.host ? ce(l.host, t) : ce(e, le(t).host);
                }
                function fe(e) {
                    var t =
                            "top" ===
                            (arguments.length > 1 && void 0 !== arguments[1]
                                ? arguments[1]
                                : "top")
                                ? "scrollTop"
                                : "scrollLeft",
                        n = e.nodeName;
                    if ("BODY" === n || "HTML" === n) {
                        var r = e.ownerDocument.documentElement;
                        return (e.ownerDocument.scrollingElement || r)[t];
                    }
                    return e[t];
                }
                function de(e, t) {
                    var n = "x" === t ? "Left" : "Top",
                        r = "Left" === n ? "Right" : "Bottom";
                    return (
                        parseFloat(e["border" + n + "Width"]) +
                        parseFloat(e["border" + r + "Width"])
                    );
                }
                function pe(e, t, n, r) {
                    return Math.max(
                        t["offset" + e],
                        t["scroll" + e],
                        n["client" + e],
                        n["offset" + e],
                        n["scroll" + e],
                        se(10)
                            ? parseInt(n["offset" + e]) +
                                  parseInt(
                                      r[
                                          "margin" +
                                              ("Height" === e ? "Top" : "Left")
                                      ],
                                  ) +
                                  parseInt(
                                      r[
                                          "margin" +
                                              ("Height" === e
                                                  ? "Bottom"
                                                  : "Right")
                                      ],
                                  )
                            : 0,
                    );
                }
                function he(e) {
                    var t = e.body,
                        n = e.documentElement,
                        r = se(10) && getComputedStyle(n);
                    return {
                        height: pe("Height", t, n, r),
                        width: pe("Width", t, n, r),
                    };
                }
                var me = (function () {
                        function e(e, t) {
                            for (var n = 0; n < t.length; n++) {
                                var r = t[n];
                                ((r.enumerable = r.enumerable || !1),
                                    (r.configurable = !0),
                                    "value" in r && (r.writable = !0),
                                    Object.defineProperty(e, r.key, r));
                            }
                        }
                        return function (t, n, r) {
                            return (n && e(t.prototype, n), r && e(t, r), t);
                        };
                    })(),
                    ve = function (e, t, n) {
                        return (
                            t in e
                                ? Object.defineProperty(e, t, {
                                      value: n,
                                      enumerable: !0,
                                      configurable: !0,
                                      writable: !0,
                                  })
                                : (e[t] = n),
                            e
                        );
                    },
                    ge =
                        Object.assign ||
                        function (e) {
                            for (var t = 1; t < arguments.length; t++) {
                                var n = arguments[t];
                                for (var r in n)
                                    Object.prototype.hasOwnProperty.call(
                                        n,
                                        r,
                                    ) && (e[r] = n[r]);
                            }
                            return e;
                        };
                function ye(e) {
                    return ge({}, e, {
                        right: e.left + e.width,
                        bottom: e.top + e.height,
                    });
                }
                function be(e) {
                    var t = {};
                    try {
                        if (se(10)) {
                            t = e.getBoundingClientRect();
                            var n = fe(e, "top"),
                                r = fe(e, "left");
                            ((t.top += n),
                                (t.left += r),
                                (t.bottom += n),
                                (t.right += r));
                        } else t = e.getBoundingClientRect();
                    } catch (e) {}
                    var i = {
                            left: t.left,
                            top: t.top,
                            width: t.right - t.left,
                            height: t.bottom - t.top,
                        },
                        o = "HTML" === e.nodeName ? he(e.ownerDocument) : {},
                        a = o.width || e.clientWidth || i.width,
                        s = o.height || e.clientHeight || i.height,
                        u = e.offsetWidth - a,
                        l = e.offsetHeight - s;
                    if (u || l) {
                        var c = te(e);
                        ((u -= de(c, "x")),
                            (l -= de(c, "y")),
                            (i.width -= u),
                            (i.height -= l));
                    }
                    return ye(i);
                }
                function xe(e, t) {
                    var n =
                            arguments.length > 2 &&
                            void 0 !== arguments[2] &&
                            arguments[2],
                        r = se(10),
                        i = "HTML" === t.nodeName,
                        o = be(e),
                        a = be(t),
                        s = re(e),
                        u = te(t),
                        l = parseFloat(u.borderTopWidth),
                        c = parseFloat(u.borderLeftWidth);
                    n &&
                        i &&
                        ((a.top = Math.max(a.top, 0)),
                        (a.left = Math.max(a.left, 0)));
                    var f = ye({
                        top: o.top - a.top - l,
                        left: o.left - a.left - c,
                        width: o.width,
                        height: o.height,
                    });
                    if (((f.marginTop = 0), (f.marginLeft = 0), !r && i)) {
                        var d = parseFloat(u.marginTop),
                            p = parseFloat(u.marginLeft);
                        ((f.top -= l - d),
                            (f.bottom -= l - d),
                            (f.left -= c - p),
                            (f.right -= c - p),
                            (f.marginTop = d),
                            (f.marginLeft = p));
                    }
                    return (
                        (r && !n
                            ? t.contains(s)
                            : t === s && "BODY" !== s.nodeName) &&
                            (f = (function (e, t) {
                                var n =
                                        arguments.length > 2 &&
                                        void 0 !== arguments[2] &&
                                        arguments[2],
                                    r = fe(t, "top"),
                                    i = fe(t, "left"),
                                    o = n ? -1 : 1;
                                return (
                                    (e.top += r * o),
                                    (e.bottom += r * o),
                                    (e.left += i * o),
                                    (e.right += i * o),
                                    e
                                );
                            })(f, t)),
                        f
                    );
                }
                function we(e) {
                    var t = e.nodeName;
                    if ("BODY" === t || "HTML" === t) return !1;
                    if ("fixed" === te(e, "position")) return !0;
                    var n = ne(e);
                    return !!n && we(n);
                }
                function Te(e) {
                    if (!e || !e.parentElement || se())
                        return document.documentElement;
                    for (
                        var t = e.parentElement;
                        t && "none" === te(t, "transform");
                    )
                        t = t.parentElement;
                    return t || document.documentElement;
                }
                function Ce(e, t, n, r) {
                    var i =
                            arguments.length > 4 &&
                            void 0 !== arguments[4] &&
                            arguments[4],
                        o = { top: 0, left: 0 },
                        a = i ? Te(e) : ce(e, ie(t));
                    if ("viewport" === r)
                        o = (function (e) {
                            var t =
                                    arguments.length > 1 &&
                                    void 0 !== arguments[1] &&
                                    arguments[1],
                                n = e.ownerDocument.documentElement,
                                r = xe(e, n),
                                i = Math.max(
                                    n.clientWidth,
                                    window.innerWidth || 0,
                                ),
                                o = Math.max(
                                    n.clientHeight,
                                    window.innerHeight || 0,
                                ),
                                a = t ? 0 : fe(n),
                                s = t ? 0 : fe(n, "left");
                            return ye({
                                top: a - r.top + r.marginTop,
                                left: s - r.left + r.marginLeft,
                                width: i,
                                height: o,
                            });
                        })(a, i);
                    else {
                        var s = void 0;
                        "scrollParent" === r
                            ? "BODY" === (s = re(ne(t))).nodeName &&
                              (s = e.ownerDocument.documentElement)
                            : (s =
                                  "window" === r
                                      ? e.ownerDocument.documentElement
                                      : r);
                        var u = xe(s, a, i);
                        if ("HTML" !== s.nodeName || we(a)) o = u;
                        else {
                            var l = he(e.ownerDocument),
                                c = l.height,
                                f = l.width;
                            ((o.top += u.top - u.marginTop),
                                (o.bottom = c + u.top),
                                (o.left += u.left - u.marginLeft),
                                (o.right = f + u.left));
                        }
                    }
                    var d = "number" == typeof (n = n || 0);
                    return (
                        (o.left += d ? n : n.left || 0),
                        (o.top += d ? n : n.top || 0),
                        (o.right -= d ? n : n.right || 0),
                        (o.bottom -= d ? n : n.bottom || 0),
                        o
                    );
                }
                function Ee(e, t, n, r, i) {
                    var o =
                        arguments.length > 5 && void 0 !== arguments[5]
                            ? arguments[5]
                            : 0;
                    if (-1 === e.indexOf("auto")) return e;
                    var a = Ce(n, r, o, i),
                        s = {
                            top: { width: a.width, height: t.top - a.top },
                            right: {
                                width: a.right - t.right,
                                height: a.height,
                            },
                            bottom: {
                                width: a.width,
                                height: a.bottom - t.bottom,
                            },
                            left: { width: t.left - a.left, height: a.height },
                        },
                        u = Object.keys(s)
                            .map(function (e) {
                                return ge({ key: e }, s[e], {
                                    area: ((t = s[e]), t.width * t.height),
                                });
                                var t;
                            })
                            .sort(function (e, t) {
                                return t.area - e.area;
                            }),
                        l = u.filter(function (e) {
                            var t = e.width,
                                r = e.height;
                            return t >= n.clientWidth && r >= n.clientHeight;
                        }),
                        c = l.length > 0 ? l[0].key : u[0].key,
                        f = e.split("-")[1];
                    return c + (f ? "-" + f : "");
                }
                function Ae(e, t, n) {
                    var r =
                        arguments.length > 3 && void 0 !== arguments[3]
                            ? arguments[3]
                            : null;
                    return xe(n, r ? Te(t) : ce(t, ie(n)), r);
                }
                function Se(e) {
                    var t = e.ownerDocument.defaultView.getComputedStyle(e),
                        n =
                            parseFloat(t.marginTop || 0) +
                            parseFloat(t.marginBottom || 0),
                        r =
                            parseFloat(t.marginLeft || 0) +
                            parseFloat(t.marginRight || 0);
                    return {
                        width: e.offsetWidth + r,
                        height: e.offsetHeight + n,
                    };
                }
                function ke(e) {
                    var t = {
                        left: "right",
                        right: "left",
                        bottom: "top",
                        top: "bottom",
                    };
                    return e.replace(/left|right|bottom|top/g, function (e) {
                        return t[e];
                    });
                }
                function De(e, t, n) {
                    n = n.split("-")[0];
                    var r = Se(e),
                        i = { width: r.width, height: r.height },
                        o = -1 !== ["right", "left"].indexOf(n),
                        a = o ? "top" : "left",
                        s = o ? "left" : "top",
                        u = o ? "height" : "width",
                        l = o ? "width" : "height";
                    return (
                        (i[a] = t[a] + t[u] / 2 - r[u] / 2),
                        (i[s] = n === s ? t[s] - r[l] : t[ke(s)]),
                        i
                    );
                }
                function Ne(e, t) {
                    return Array.prototype.find ? e.find(t) : e.filter(t)[0];
                }
                function Le(e, t, n) {
                    return (
                        (void 0 === n
                            ? e
                            : e.slice(
                                  0,
                                  (function (e, t, n) {
                                      if (Array.prototype.findIndex)
                                          return e.findIndex(function (e) {
                                              return e[t] === n;
                                          });
                                      var r = Ne(e, function (e) {
                                          return e[t] === n;
                                      });
                                      return e.indexOf(r);
                                  })(e, "name", n),
                              )
                        ).forEach(function (e) {
                            e.function &&
                                console.warn(
                                    "`modifier.function` is deprecated, use `modifier.fn`!",
                                );
                            var n = e.function || e.fn;
                            e.enabled &&
                                ee(n) &&
                                ((t.offsets.popper = ye(t.offsets.popper)),
                                (t.offsets.reference = ye(t.offsets.reference)),
                                (t = n(t, e)));
                        }),
                        t
                    );
                }
                function Me() {
                    if (!this.state.isDestroyed) {
                        var e = {
                            instance: this,
                            styles: {},
                            arrowStyles: {},
                            attributes: {},
                            flipped: !1,
                            offsets: {},
                        };
                        ((e.offsets.reference = Ae(
                            this.state,
                            this.popper,
                            this.reference,
                            this.options.positionFixed,
                        )),
                            (e.placement = Ee(
                                this.options.placement,
                                e.offsets.reference,
                                this.popper,
                                this.reference,
                                this.options.modifiers.flip.boundariesElement,
                                this.options.modifiers.flip.padding,
                            )),
                            (e.originalPlacement = e.placement),
                            (e.positionFixed = this.options.positionFixed),
                            (e.offsets.popper = De(
                                this.popper,
                                e.offsets.reference,
                                e.placement,
                            )),
                            (e.offsets.popper.position = this.options
                                .positionFixed
                                ? "fixed"
                                : "absolute"),
                            (e = Le(this.modifiers, e)),
                            this.state.isCreated
                                ? this.options.onUpdate(e)
                                : ((this.state.isCreated = !0),
                                  this.options.onCreate(e)));
                    }
                }
                function Oe(e, t) {
                    return e.some(function (e) {
                        var n = e.name;
                        return e.enabled && n === t;
                    });
                }
                function je(e) {
                    for (
                        var t = [!1, "ms", "Webkit", "Moz", "O"],
                            n = e.charAt(0).toUpperCase() + e.slice(1),
                            r = 0;
                        r < t.length;
                        r++
                    ) {
                        var i = t[r],
                            o = i ? "" + i + n : e;
                        if (void 0 !== document.body.style[o]) return o;
                    }
                    return null;
                }
                function He() {
                    return (
                        (this.state.isDestroyed = !0),
                        Oe(this.modifiers, "applyStyle") &&
                            (this.popper.removeAttribute("x-placement"),
                            (this.popper.style.position = ""),
                            (this.popper.style.top = ""),
                            (this.popper.style.left = ""),
                            (this.popper.style.right = ""),
                            (this.popper.style.bottom = ""),
                            (this.popper.style.willChange = ""),
                            (this.popper.style[je("transform")] = "")),
                        this.disableEventListeners(),
                        this.options.removeOnDestroy &&
                            this.popper.parentNode.removeChild(this.popper),
                        this
                    );
                }
                function Pe(e) {
                    var t = e.ownerDocument;
                    return t ? t.defaultView : window;
                }
                function Be(e, t, n, r) {
                    var i = "BODY" === e.nodeName,
                        o = i ? e.ownerDocument.defaultView : e;
                    (o.addEventListener(t, n, { passive: !0 }),
                        i || Be(re(o.parentNode), t, n, r),
                        r.push(o));
                }
                function Ie(e, t, n, r) {
                    ((n.updateBound = r),
                        Pe(e).addEventListener("resize", n.updateBound, {
                            passive: !0,
                        }));
                    var i = re(e);
                    return (
                        Be(i, "scroll", n.updateBound, n.scrollParents),
                        (n.scrollElement = i),
                        (n.eventsEnabled = !0),
                        n
                    );
                }
                function ze() {
                    this.state.eventsEnabled ||
                        (this.state = Ie(
                            this.reference,
                            this.options,
                            this.state,
                            this.scheduleUpdate,
                        ));
                }
                function qe() {
                    var e, t;
                    this.state.eventsEnabled &&
                        (cancelAnimationFrame(this.scheduleUpdate),
                        (this.state =
                            ((e = this.reference),
                            (t = this.state),
                            Pe(e).removeEventListener("resize", t.updateBound),
                            t.scrollParents.forEach(function (e) {
                                e.removeEventListener("scroll", t.updateBound);
                            }),
                            (t.updateBound = null),
                            (t.scrollParents = []),
                            (t.scrollElement = null),
                            (t.eventsEnabled = !1),
                            t)));
                }
                function Re(e) {
                    return "" !== e && !isNaN(parseFloat(e)) && isFinite(e);
                }
                function Fe(e, t) {
                    Object.keys(t).forEach(function (n) {
                        var r = "";
                        (-1 !==
                            [
                                "width",
                                "height",
                                "top",
                                "right",
                                "bottom",
                                "left",
                            ].indexOf(n) &&
                            Re(t[n]) &&
                            (r = "px"),
                            (e.style[n] = t[n] + r));
                    });
                }
                var We = Q && /Firefox/i.test(navigator.userAgent);
                function _e(e, t, n) {
                    var r = Ne(e, function (e) {
                            return e.name === t;
                        }),
                        i =
                            !!r &&
                            e.some(function (e) {
                                return (
                                    e.name === n &&
                                    e.enabled &&
                                    e.order < r.order
                                );
                            });
                    if (!i) {
                        var o = "`" + t + "`",
                            a = "`" + n + "`";
                        console.warn(
                            a +
                                " modifier is required by " +
                                o +
                                " modifier in order to work, be sure to include it before " +
                                o +
                                "!",
                        );
                    }
                    return i;
                }
                var Ue = [
                        "auto-start",
                        "auto",
                        "auto-end",
                        "top-start",
                        "top",
                        "top-end",
                        "right-start",
                        "right",
                        "right-end",
                        "bottom-end",
                        "bottom",
                        "bottom-start",
                        "left-end",
                        "left",
                        "left-start",
                    ],
                    $e = Ue.slice(3);
                function Ve(e) {
                    var t =
                            arguments.length > 1 &&
                            void 0 !== arguments[1] &&
                            arguments[1],
                        n = $e.indexOf(e),
                        r = $e.slice(n + 1).concat($e.slice(0, n));
                    return t ? r.reverse() : r;
                }
                var Ye = "flip",
                    Xe = "clockwise",
                    Ge = "counterclockwise";
                function Je(e, t, n, r) {
                    var i = [0, 0],
                        o = -1 !== ["right", "left"].indexOf(r),
                        a = e.split(/(\+|\-)/).map(function (e) {
                            return e.trim();
                        }),
                        s = a.indexOf(
                            Ne(a, function (e) {
                                return -1 !== e.search(/,|\s/);
                            }),
                        );
                    a[s] &&
                        -1 === a[s].indexOf(",") &&
                        console.warn(
                            "Offsets separated by white space(s) are deprecated, use a comma (,) instead.",
                        );
                    var u = /\s*,\s*|\s+/,
                        l =
                            -1 !== s
                                ? [
                                      a.slice(0, s).concat([a[s].split(u)[0]]),
                                      [a[s].split(u)[1]].concat(a.slice(s + 1)),
                                  ]
                                : [a];
                    return (
                        (l = l.map(function (e, r) {
                            var i = (1 === r ? !o : o) ? "height" : "width",
                                a = !1;
                            return e
                                .reduce(function (e, t) {
                                    return "" === e[e.length - 1] &&
                                        -1 !== ["+", "-"].indexOf(t)
                                        ? ((e[e.length - 1] = t), (a = !0), e)
                                        : a
                                          ? ((e[e.length - 1] += t),
                                            (a = !1),
                                            e)
                                          : e.concat(t);
                                }, [])
                                .map(function (e) {
                                    return (function (e, t, n, r) {
                                        var i = e.match(
                                                /((?:\-|\+)?\d*\.?\d*)(.*)/,
                                            ),
                                            o = +i[1],
                                            a = i[2];
                                        if (!o) return e;
                                        if (0 === a.indexOf("%")) {
                                            return (
                                                (ye("%p" === a ? n : r)[t] /
                                                    100) *
                                                o
                                            );
                                        }
                                        if ("vh" === a || "vw" === a)
                                            return (
                                                (("vh" === a
                                                    ? Math.max(
                                                          document
                                                              .documentElement
                                                              .clientHeight,
                                                          window.innerHeight ||
                                                              0,
                                                      )
                                                    : Math.max(
                                                          document
                                                              .documentElement
                                                              .clientWidth,
                                                          window.innerWidth ||
                                                              0,
                                                      )) /
                                                    100) *
                                                o
                                            );
                                        return o;
                                    })(e, i, t, n);
                                });
                        })),
                        l.forEach(function (e, t) {
                            e.forEach(function (n, r) {
                                Re(n) &&
                                    (i[t] += n * ("-" === e[r - 1] ? -1 : 1));
                            });
                        }),
                        i
                    );
                }
                var Qe = {
                        shift: {
                            order: 100,
                            enabled: !0,
                            fn: function (e) {
                                var t = e.placement,
                                    n = t.split("-")[0],
                                    r = t.split("-")[1];
                                if (r) {
                                    var i = e.offsets,
                                        o = i.reference,
                                        a = i.popper,
                                        s = -1 !== ["bottom", "top"].indexOf(n),
                                        u = s ? "left" : "top",
                                        l = s ? "width" : "height",
                                        c = {
                                            start: ve({}, u, o[u]),
                                            end: ve({}, u, o[u] + o[l] - a[l]),
                                        };
                                    e.offsets.popper = ge({}, a, c[r]);
                                }
                                return e;
                            },
                        },
                        offset: {
                            order: 200,
                            enabled: !0,
                            fn: function (e, t) {
                                var n = t.offset,
                                    r = e.placement,
                                    i = e.offsets,
                                    o = i.popper,
                                    a = i.reference,
                                    s = r.split("-")[0],
                                    u = void 0;
                                return (
                                    (u = Re(+n) ? [+n, 0] : Je(n, o, a, s)),
                                    "left" === s
                                        ? ((o.top += u[0]), (o.left -= u[1]))
                                        : "right" === s
                                          ? ((o.top += u[0]), (o.left += u[1]))
                                          : "top" === s
                                            ? ((o.left += u[0]),
                                              (o.top -= u[1]))
                                            : "bottom" === s &&
                                              ((o.left += u[0]),
                                              (o.top += u[1])),
                                    (e.popper = o),
                                    e
                                );
                            },
                            offset: 0,
                        },
                        preventOverflow: {
                            order: 300,
                            enabled: !0,
                            fn: function (e, t) {
                                var n =
                                    t.boundariesElement ||
                                    ue(e.instance.popper);
                                e.instance.reference === n && (n = ue(n));
                                var r = je("transform"),
                                    i = e.instance.popper.style,
                                    o = i.top,
                                    a = i.left,
                                    s = i[r];
                                ((i.top = ""), (i.left = ""), (i[r] = ""));
                                var u = Ce(
                                    e.instance.popper,
                                    e.instance.reference,
                                    t.padding,
                                    n,
                                    e.positionFixed,
                                );
                                ((i.top = o),
                                    (i.left = a),
                                    (i[r] = s),
                                    (t.boundaries = u));
                                var l = t.priority,
                                    c = e.offsets.popper,
                                    f = {
                                        primary: function (e) {
                                            var n = c[e];
                                            return (
                                                c[e] < u[e] &&
                                                    !t.escapeWithReference &&
                                                    (n = Math.max(c[e], u[e])),
                                                ve({}, e, n)
                                            );
                                        },
                                        secondary: function (e) {
                                            var n =
                                                    "right" === e
                                                        ? "left"
                                                        : "top",
                                                r = c[n];
                                            return (
                                                c[e] > u[e] &&
                                                    !t.escapeWithReference &&
                                                    (r = Math.min(
                                                        c[n],
                                                        u[e] -
                                                            ("right" === e
                                                                ? c.width
                                                                : c.height),
                                                    )),
                                                ve({}, n, r)
                                            );
                                        },
                                    };
                                return (
                                    l.forEach(function (e) {
                                        var t =
                                            -1 !== ["left", "top"].indexOf(e)
                                                ? "primary"
                                                : "secondary";
                                        c = ge({}, c, f[t](e));
                                    }),
                                    (e.offsets.popper = c),
                                    e
                                );
                            },
                            priority: ["left", "right", "top", "bottom"],
                            padding: 5,
                            boundariesElement: "scrollParent",
                        },
                        keepTogether: {
                            order: 400,
                            enabled: !0,
                            fn: function (e) {
                                var t = e.offsets,
                                    n = t.popper,
                                    r = t.reference,
                                    i = e.placement.split("-")[0],
                                    o = Math.floor,
                                    a = -1 !== ["top", "bottom"].indexOf(i),
                                    s = a ? "right" : "bottom",
                                    u = a ? "left" : "top",
                                    l = a ? "width" : "height";
                                return (
                                    n[s] < o(r[u]) &&
                                        (e.offsets.popper[u] = o(r[u]) - n[l]),
                                    n[u] > o(r[s]) &&
                                        (e.offsets.popper[u] = o(r[s])),
                                    e
                                );
                            },
                        },
                        arrow: {
                            order: 500,
                            enabled: !0,
                            fn: function (e, t) {
                                var n;
                                if (
                                    !_e(
                                        e.instance.modifiers,
                                        "arrow",
                                        "keepTogether",
                                    )
                                )
                                    return e;
                                var r = t.element;
                                if ("string" == typeof r) {
                                    if (
                                        !(r =
                                            e.instance.popper.querySelector(r))
                                    )
                                        return e;
                                } else if (!e.instance.popper.contains(r))
                                    return (
                                        console.warn(
                                            "WARNING: `arrow.element` must be child of its popper element!",
                                        ),
                                        e
                                    );
                                var i = e.placement.split("-")[0],
                                    o = e.offsets,
                                    a = o.popper,
                                    s = o.reference,
                                    u = -1 !== ["left", "right"].indexOf(i),
                                    l = u ? "height" : "width",
                                    c = u ? "Top" : "Left",
                                    f = c.toLowerCase(),
                                    d = u ? "left" : "top",
                                    p = u ? "bottom" : "right",
                                    h = Se(r)[l];
                                (s[p] - h < a[f] &&
                                    (e.offsets.popper[f] -= a[f] - (s[p] - h)),
                                    s[f] + h > a[p] &&
                                        (e.offsets.popper[f] +=
                                            s[f] + h - a[p]),
                                    (e.offsets.popper = ye(e.offsets.popper)));
                                var m = s[f] + s[l] / 2 - h / 2,
                                    v = te(e.instance.popper),
                                    g = parseFloat(v["margin" + c]),
                                    y = parseFloat(v["border" + c + "Width"]),
                                    b = m - e.offsets.popper[f] - g - y;
                                return (
                                    (b = Math.max(Math.min(a[l] - h, b), 0)),
                                    (e.arrowElement = r),
                                    (e.offsets.arrow =
                                        (ve((n = {}), f, Math.round(b)),
                                        ve(n, d, ""),
                                        n)),
                                    e
                                );
                            },
                            element: "[x-arrow]",
                        },
                        flip: {
                            order: 600,
                            enabled: !0,
                            fn: function (e, t) {
                                if (Oe(e.instance.modifiers, "inner")) return e;
                                if (
                                    e.flipped &&
                                    e.placement === e.originalPlacement
                                )
                                    return e;
                                var n = Ce(
                                        e.instance.popper,
                                        e.instance.reference,
                                        t.padding,
                                        t.boundariesElement,
                                        e.positionFixed,
                                    ),
                                    r = e.placement.split("-")[0],
                                    i = ke(r),
                                    o = e.placement.split("-")[1] || "",
                                    a = [];
                                switch (t.behavior) {
                                    case Ye:
                                        a = [r, i];
                                        break;
                                    case Xe:
                                        a = Ve(r);
                                        break;
                                    case Ge:
                                        a = Ve(r, !0);
                                        break;
                                    default:
                                        a = t.behavior;
                                }
                                return (
                                    a.forEach(function (s, u) {
                                        if (r !== s || a.length === u + 1)
                                            return e;
                                        ((r = e.placement.split("-")[0]),
                                            (i = ke(r)));
                                        var l = e.offsets.popper,
                                            c = e.offsets.reference,
                                            f = Math.floor,
                                            d =
                                                ("left" === r &&
                                                    f(l.right) > f(c.left)) ||
                                                ("right" === r &&
                                                    f(l.left) < f(c.right)) ||
                                                ("top" === r &&
                                                    f(l.bottom) > f(c.top)) ||
                                                ("bottom" === r &&
                                                    f(l.top) < f(c.bottom)),
                                            p = f(l.left) < f(n.left),
                                            h = f(l.right) > f(n.right),
                                            m = f(l.top) < f(n.top),
                                            v = f(l.bottom) > f(n.bottom),
                                            g =
                                                ("left" === r && p) ||
                                                ("right" === r && h) ||
                                                ("top" === r && m) ||
                                                ("bottom" === r && v),
                                            y =
                                                -1 !==
                                                ["top", "bottom"].indexOf(r),
                                            b =
                                                !!t.flipVariations &&
                                                ((y && "start" === o && p) ||
                                                    (y && "end" === o && h) ||
                                                    (!y &&
                                                        "start" === o &&
                                                        m) ||
                                                    (!y && "end" === o && v)),
                                            x =
                                                !!t.flipVariationsByContent &&
                                                ((y && "start" === o && h) ||
                                                    (y && "end" === o && p) ||
                                                    (!y &&
                                                        "start" === o &&
                                                        v) ||
                                                    (!y && "end" === o && m)),
                                            w = b || x;
                                        (d || g || w) &&
                                            ((e.flipped = !0),
                                            (d || g) && (r = a[u + 1]),
                                            w &&
                                                (o = (function (e) {
                                                    return "end" === e
                                                        ? "start"
                                                        : "start" === e
                                                          ? "end"
                                                          : e;
                                                })(o)),
                                            (e.placement =
                                                r + (o ? "-" + o : "")),
                                            (e.offsets.popper = ge(
                                                {},
                                                e.offsets.popper,
                                                De(
                                                    e.instance.popper,
                                                    e.offsets.reference,
                                                    e.placement,
                                                ),
                                            )),
                                            (e = Le(
                                                e.instance.modifiers,
                                                e,
                                                "flip",
                                            )));
                                    }),
                                    e
                                );
                            },
                            behavior: "flip",
                            padding: 5,
                            boundariesElement: "viewport",
                            flipVariations: !1,
                            flipVariationsByContent: !1,
                        },
                        inner: {
                            order: 700,
                            enabled: !1,
                            fn: function (e) {
                                var t = e.placement,
                                    n = t.split("-")[0],
                                    r = e.offsets,
                                    i = r.popper,
                                    o = r.reference,
                                    a = -1 !== ["left", "right"].indexOf(n),
                                    s = -1 === ["top", "left"].indexOf(n);
                                return (
                                    (i[a ? "left" : "top"] =
                                        o[n] -
                                        (s ? i[a ? "width" : "height"] : 0)),
                                    (e.placement = ke(t)),
                                    (e.offsets.popper = ye(i)),
                                    e
                                );
                            },
                        },
                        hide: {
                            order: 800,
                            enabled: !0,
                            fn: function (e) {
                                if (
                                    !_e(
                                        e.instance.modifiers,
                                        "hide",
                                        "preventOverflow",
                                    )
                                )
                                    return e;
                                var t = e.offsets.reference,
                                    n = Ne(e.instance.modifiers, function (e) {
                                        return "preventOverflow" === e.name;
                                    }).boundaries;
                                if (
                                    t.bottom < n.top ||
                                    t.left > n.right ||
                                    t.top > n.bottom ||
                                    t.right < n.left
                                ) {
                                    if (!0 === e.hide) return e;
                                    ((e.hide = !0),
                                        (e.attributes["x-out-of-boundaries"] =
                                            ""));
                                } else {
                                    if (!1 === e.hide) return e;
                                    ((e.hide = !1),
                                        (e.attributes["x-out-of-boundaries"] =
                                            !1));
                                }
                                return e;
                            },
                        },
                        computeStyle: {
                            order: 850,
                            enabled: !0,
                            fn: function (e, t) {
                                var n = t.x,
                                    r = t.y,
                                    i = e.offsets.popper,
                                    o = Ne(e.instance.modifiers, function (e) {
                                        return "applyStyle" === e.name;
                                    }).gpuAcceleration;
                                void 0 !== o &&
                                    console.warn(
                                        "WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!",
                                    );
                                var a = void 0 !== o ? o : t.gpuAcceleration,
                                    s = ue(e.instance.popper),
                                    u = be(s),
                                    l = { position: i.position },
                                    c = (function (e, t) {
                                        var n = e.offsets,
                                            r = n.popper,
                                            i = n.reference,
                                            o = Math.round,
                                            a = Math.floor,
                                            s = function (e) {
                                                return e;
                                            },
                                            u = o(i.width),
                                            l = o(r.width),
                                            c =
                                                -1 !==
                                                ["left", "right"].indexOf(
                                                    e.placement,
                                                ),
                                            f = -1 !== e.placement.indexOf("-"),
                                            d = t
                                                ? c || f || u % 2 == l % 2
                                                    ? o
                                                    : a
                                                : s,
                                            p = t ? o : s;
                                        return {
                                            left: d(
                                                u % 2 == 1 &&
                                                    l % 2 == 1 &&
                                                    !f &&
                                                    t
                                                    ? r.left - 1
                                                    : r.left,
                                            ),
                                            top: p(r.top),
                                            bottom: p(r.bottom),
                                            right: d(r.right),
                                        };
                                    })(e, window.devicePixelRatio < 2 || !We),
                                    f = "bottom" === n ? "top" : "bottom",
                                    d = "right" === r ? "left" : "right",
                                    p = je("transform"),
                                    h = void 0,
                                    m = void 0;
                                if (
                                    ((m =
                                        "bottom" === f
                                            ? "HTML" === s.nodeName
                                                ? -s.clientHeight + c.bottom
                                                : -u.height + c.bottom
                                            : c.top),
                                    (h =
                                        "right" === d
                                            ? "HTML" === s.nodeName
                                                ? -s.clientWidth + c.right
                                                : -u.width + c.right
                                            : c.left),
                                    a && p)
                                )
                                    ((l[p] =
                                        "translate3d(" +
                                        h +
                                        "px, " +
                                        m +
                                        "px, 0)"),
                                        (l[f] = 0),
                                        (l[d] = 0),
                                        (l.willChange = "transform"));
                                else {
                                    var v = "bottom" === f ? -1 : 1,
                                        g = "right" === d ? -1 : 1;
                                    ((l[f] = m * v),
                                        (l[d] = h * g),
                                        (l.willChange = f + ", " + d));
                                }
                                var y = { "x-placement": e.placement };
                                return (
                                    (e.attributes = ge({}, y, e.attributes)),
                                    (e.styles = ge({}, l, e.styles)),
                                    (e.arrowStyles = ge(
                                        {},
                                        e.offsets.arrow,
                                        e.arrowStyles,
                                    )),
                                    e
                                );
                            },
                            gpuAcceleration: !0,
                            x: "bottom",
                            y: "right",
                        },
                        applyStyle: {
                            order: 900,
                            enabled: !0,
                            fn: function (e) {
                                var t, n;
                                return (
                                    Fe(e.instance.popper, e.styles),
                                    (t = e.instance.popper),
                                    (n = e.attributes),
                                    Object.keys(n).forEach(function (e) {
                                        !1 !== n[e]
                                            ? t.setAttribute(e, n[e])
                                            : t.removeAttribute(e);
                                    }),
                                    e.arrowElement &&
                                        Object.keys(e.arrowStyles).length &&
                                        Fe(e.arrowElement, e.arrowStyles),
                                    e
                                );
                            },
                            onLoad: function (e, t, n, r, i) {
                                var o = Ae(i, t, e, n.positionFixed),
                                    a = Ee(
                                        n.placement,
                                        o,
                                        t,
                                        e,
                                        n.modifiers.flip.boundariesElement,
                                        n.modifiers.flip.padding,
                                    );
                                return (
                                    t.setAttribute("x-placement", a),
                                    Fe(t, {
                                        position: n.positionFixed
                                            ? "fixed"
                                            : "absolute",
                                    }),
                                    n
                                );
                            },
                            gpuAcceleration: void 0,
                        },
                    },
                    Ze = {
                        placement: "bottom",
                        positionFixed: !1,
                        eventsEnabled: !0,
                        removeOnDestroy: !1,
                        onCreate: function () {},
                        onUpdate: function () {},
                        modifiers: Qe,
                    },
                    Ke = (function () {
                        function e(t, n) {
                            var r = this,
                                i =
                                    arguments.length > 2 &&
                                    void 0 !== arguments[2]
                                        ? arguments[2]
                                        : {};
                            (!(function (e, t) {
                                if (!(e instanceof t))
                                    throw new TypeError(
                                        "Cannot call a class as a function",
                                    );
                            })(this, e),
                                (this.scheduleUpdate = function () {
                                    return requestAnimationFrame(r.update);
                                }),
                                (this.update = K(this.update.bind(this))),
                                (this.options = ge({}, e.Defaults, i)),
                                (this.state = {
                                    isDestroyed: !1,
                                    isCreated: !1,
                                    scrollParents: [],
                                }),
                                (this.reference = t && t.jquery ? t[0] : t),
                                (this.popper = n && n.jquery ? n[0] : n),
                                (this.options.modifiers = {}),
                                Object.keys(
                                    ge({}, e.Defaults.modifiers, i.modifiers),
                                ).forEach(function (t) {
                                    r.options.modifiers[t] = ge(
                                        {},
                                        e.Defaults.modifiers[t] || {},
                                        i.modifiers ? i.modifiers[t] : {},
                                    );
                                }),
                                (this.modifiers = Object.keys(
                                    this.options.modifiers,
                                )
                                    .map(function (e) {
                                        return ge(
                                            { name: e },
                                            r.options.modifiers[e],
                                        );
                                    })
                                    .sort(function (e, t) {
                                        return e.order - t.order;
                                    })),
                                this.modifiers.forEach(function (e) {
                                    e.enabled &&
                                        ee(e.onLoad) &&
                                        e.onLoad(
                                            r.reference,
                                            r.popper,
                                            r.options,
                                            e,
                                            r.state,
                                        );
                                }),
                                this.update());
                            var o = this.options.eventsEnabled;
                            (o && this.enableEventListeners(),
                                (this.state.eventsEnabled = o));
                        }
                        return (
                            me(e, [
                                {
                                    key: "update",
                                    value: function () {
                                        return Me.call(this);
                                    },
                                },
                                {
                                    key: "destroy",
                                    value: function () {
                                        return He.call(this);
                                    },
                                },
                                {
                                    key: "enableEventListeners",
                                    value: function () {
                                        return ze.call(this);
                                    },
                                },
                                {
                                    key: "disableEventListeners",
                                    value: function () {
                                        return qe.call(this);
                                    },
                                },
                            ]),
                            e
                        );
                    })();
                ((Ke.Utils = (
                    "undefined" != typeof window ? window : n.g
                ).PopperUtils),
                    (Ke.placements = Ue),
                    (Ke.Defaults = Ze));
                const et = Ke;
                function tt() {
                    return (
                        (tt =
                            Object.assign ||
                            function (e) {
                                for (var t = 1; t < arguments.length; t++) {
                                    var n = arguments[t];
                                    for (var r in n)
                                        Object.prototype.hasOwnProperty.call(
                                            n,
                                            r,
                                        ) && (e[r] = n[r]);
                                }
                                return e;
                            }),
                        tt.apply(this, arguments)
                    );
                }
                var nt = "5.2.1";
                function rt(e, t) {
                    e.innerHTML = t;
                }
                function it(e) {
                    return !(!e || !e._tippy || e._tippy.reference !== e);
                }
                function ot(e, t) {
                    return {}.hasOwnProperty.call(e, t);
                }
                function at(e) {
                    return ct(e)
                        ? [e]
                        : (function (e) {
                                return lt(e, "NodeList");
                            })(e)
                          ? yt(e)
                          : Array.isArray(e)
                            ? e
                            : yt(document.querySelectorAll(e));
                }
                function st(e, t, n) {
                    if (Array.isArray(e)) {
                        var r = e[t];
                        return null == r ? (Array.isArray(n) ? n[t] : n) : r;
                    }
                    return e;
                }
                function ut(e, t) {
                    return e && e.modifiers && e.modifiers[t];
                }
                function lt(e, t) {
                    var n = {}.toString.call(e);
                    return (
                        0 === n.indexOf("[object") && n.indexOf(t + "]") > -1
                    );
                }
                function ct(e) {
                    return lt(e, "Element");
                }
                function ft(e, t) {
                    return "function" == typeof e ? e.apply(void 0, t) : e;
                }
                function dt(e, t, n, r) {
                    e.filter(function (e) {
                        return e.name === t;
                    })[0][n] = r;
                }
                function pt() {
                    return document.createElement("div");
                }
                function ht(e, t) {
                    e.forEach(function (e) {
                        e && (e.style.transitionDuration = t + "ms");
                    });
                }
                function mt(e, t) {
                    e.forEach(function (e) {
                        e && e.setAttribute("data-state", t);
                    });
                }
                function vt(e, t) {
                    return 0 === t
                        ? e
                        : function (r) {
                              (clearTimeout(n),
                                  (n = setTimeout(function () {
                                      e(r);
                                  }, t)));
                          };
                    var n;
                }
                function gt(e, t, n) {
                    e && e !== t && e.apply(void 0, n);
                }
                function yt(e) {
                    return [].slice.call(e);
                }
                function bt(e, t) {
                    return e.indexOf(t) > -1;
                }
                function xt(e) {
                    return e.split(/\s+/).filter(Boolean);
                }
                function wt(e, t) {
                    return void 0 !== e ? e : t;
                }
                function Tt(e) {
                    return [].concat(e);
                }
                function Ct(e, t) {
                    -1 === e.indexOf(t) && e.push(t);
                }
                function Et(e) {
                    return "number" == typeof e ? e : parseFloat(e);
                }
                function At(e, t, n) {
                    void 0 === t && (t = 5);
                    var r = { top: 0, right: 0, bottom: 0, left: 0 };
                    return Object.keys(r).reduce(function (r, i) {
                        return (
                            (r[i] = "number" == typeof t ? t : t[i]),
                            e === i &&
                                (r[i] =
                                    "number" == typeof t ? t + n : t[e] + n),
                            r
                        );
                    }, r);
                }
                var St = tt(
                        {
                            allowHTML: !0,
                            animation: "fade",
                            appendTo: function () {
                                return document.body;
                            },
                            aria: "describedby",
                            arrow: !0,
                            boundary: "scrollParent",
                            content: "",
                            delay: 0,
                            distance: 10,
                            duration: [300, 250],
                            flip: !0,
                            flipBehavior: "flip",
                            flipOnUpdate: !1,
                            hideOnClick: !0,
                            ignoreAttributes: !1,
                            inertia: !1,
                            interactive: !1,
                            interactiveBorder: 2,
                            interactiveDebounce: 0,
                            lazy: !0,
                            maxWidth: 350,
                            multiple: !1,
                            offset: 0,
                            onAfterUpdate: function () {},
                            onBeforeUpdate: function () {},
                            onCreate: function () {},
                            onDestroy: function () {},
                            onHidden: function () {},
                            onHide: function () {},
                            onMount: function () {},
                            onShow: function () {},
                            onShown: function () {},
                            onTrigger: function () {},
                            onUntrigger: function () {},
                            placement: "top",
                            plugins: [],
                            popperOptions: {},
                            role: "tooltip",
                            showOnCreate: !1,
                            theme: "",
                            touch: !0,
                            trigger: "mouseenter focus",
                            triggerTarget: null,
                            updateDuration: 0,
                            zIndex: 9999,
                        },
                        {
                            animateFill: !1,
                            followCursor: !1,
                            inlinePositioning: !1,
                            sticky: !1,
                        },
                    ),
                    kt = Object.keys(St),
                    Dt = [
                        "arrow",
                        "boundary",
                        "distance",
                        "flip",
                        "flipBehavior",
                        "flipOnUpdate",
                        "offset",
                        "placement",
                        "popperOptions",
                    ],
                    Nt = function (e) {
                        Object.keys(e).forEach(function (t) {
                            St[t] = e[t];
                        });
                    };
                function Lt(e) {
                    var t = (e.plugins || []).reduce(function (t, n) {
                        var r = n.name,
                            i = n.defaultValue;
                        return (r && (t[r] = void 0 !== e[r] ? e[r] : i), t);
                    }, {});
                    return tt({}, e, {}, t);
                }
                function Mt(e, t) {
                    var n = tt(
                        {},
                        t,
                        { content: ft(t.content, [e]) },
                        t.ignoreAttributes
                            ? {}
                            : (function (e, t) {
                                  return (
                                      t
                                          ? Object.keys(
                                                Lt(tt({}, St, { plugins: t })),
                                            )
                                          : kt
                                  ).reduce(function (t, n) {
                                      var r = (
                                          e.getAttribute("data-tippy-" + n) ||
                                          ""
                                      ).trim();
                                      if (!r) return t;
                                      if ("content" === n) t[n] = r;
                                      else
                                          try {
                                              t[n] = JSON.parse(r);
                                          } catch (e) {
                                              t[n] = r;
                                          }
                                      return t;
                                  }, {});
                              })(e, t.plugins),
                    );
                    return (n.interactive && (n.aria = null), n);
                }
                var Ot = { passive: !0 },
                    jt = "tippy-iOS",
                    Ht = "tippy-popper",
                    Pt = "tippy-tooltip",
                    Bt = "tippy-content",
                    It = "tippy-arrow",
                    zt = "tippy-svg-arrow",
                    qt = "." + Ht,
                    Rt = "." + Pt,
                    Ft = "." + Bt,
                    Wt = "." + It,
                    _t = "." + zt,
                    Ut = { isTouch: !1 },
                    $t = 0;
                function Vt() {
                    Ut.isTouch ||
                        ((Ut.isTouch = !0),
                        window.performance &&
                            document.addEventListener("mousemove", Yt));
                }
                function Yt() {
                    var e = performance.now();
                    (e - $t < 20 &&
                        ((Ut.isTouch = !1),
                        document.removeEventListener("mousemove", Yt)),
                        ($t = e));
                }
                function Xt() {
                    var e = document.activeElement;
                    if (it(e)) {
                        var t = e._tippy;
                        e.blur && !t.state.isVisible && e.blur();
                    }
                }
                var Gt =
                        "undefined" != typeof window &&
                        "undefined" != typeof document,
                    Jt = Gt ? navigator.userAgent : "",
                    Qt = /MSIE |Trident\//.test(Jt),
                    Zt = Gt && /iPhone|iPad|iPod/.test(navigator.platform);
                function Kt(e) {
                    var t = e && Zt && Ut.isTouch;
                    document.body.classList[t ? "add" : "remove"](jt);
                }
                function en(e) {
                    return e.split("-")[0];
                }
                function tn(e) {
                    e.setAttribute("data-inertia", "");
                }
                function nn(e) {
                    e.setAttribute("data-interactive", "");
                }
                function rn(e, t) {
                    if (ct(t.content)) (rt(e, ""), e.appendChild(t.content));
                    else if ("function" != typeof t.content) {
                        e[t.allowHTML ? "innerHTML" : "textContent"] =
                            t.content;
                    }
                }
                function on(e) {
                    return {
                        tooltip: e.querySelector(Rt),
                        content: e.querySelector(Ft),
                        arrow: e.querySelector(Wt) || e.querySelector(_t),
                    };
                }
                function an(e) {
                    var t = pt();
                    return (
                        !0 === e
                            ? (t.className = It)
                            : ((t.className = zt),
                              ct(e) ? t.appendChild(e) : rt(t, e)),
                        t
                    );
                }
                function sn(e, t) {
                    var n = pt();
                    ((n.className = Ht),
                        (n.style.position = "absolute"),
                        (n.style.top = "0"),
                        (n.style.left = "0"));
                    var r = pt();
                    ((r.className = Pt),
                        (r.id = "tippy-" + e),
                        r.setAttribute("data-state", "hidden"),
                        r.setAttribute("tabindex", "-1"),
                        cn(r, "add", t.theme));
                    var i = pt();
                    return (
                        (i.className = Bt),
                        i.setAttribute("data-state", "hidden"),
                        t.interactive && nn(r),
                        t.arrow &&
                            (r.setAttribute("data-arrow", ""),
                            r.appendChild(an(t.arrow))),
                        t.inertia && tn(r),
                        rn(i, t),
                        r.appendChild(i),
                        n.appendChild(r),
                        un(n, t, t),
                        n
                    );
                }
                function un(e, t, n) {
                    var r,
                        i = on(e),
                        o = i.tooltip,
                        a = i.content,
                        s = i.arrow;
                    ((e.style.zIndex = "" + n.zIndex),
                        o.setAttribute("data-animation", n.animation),
                        (o.style.maxWidth =
                            "number" == typeof (r = n.maxWidth) ? r + "px" : r),
                        n.role
                            ? o.setAttribute("role", n.role)
                            : o.removeAttribute("role"),
                        t.content !== n.content && rn(a, n),
                        !t.arrow && n.arrow
                            ? (o.appendChild(an(n.arrow)),
                              o.setAttribute("data-arrow", ""))
                            : t.arrow && !n.arrow
                              ? (o.removeChild(s),
                                o.removeAttribute("data-arrow"))
                              : t.arrow !== n.arrow &&
                                (o.removeChild(s), o.appendChild(an(n.arrow))),
                        !t.interactive && n.interactive
                            ? nn(o)
                            : t.interactive &&
                              !n.interactive &&
                              (function (e) {
                                  e.removeAttribute("data-interactive");
                              })(o),
                        !t.inertia && n.inertia
                            ? tn(o)
                            : t.inertia &&
                              !n.inertia &&
                              (function (e) {
                                  e.removeAttribute("data-inertia");
                              })(o),
                        t.theme !== n.theme &&
                            (cn(o, "remove", t.theme), cn(o, "add", n.theme)));
                }
                function ln(e, t, n) {
                    ["transitionend", "webkitTransitionEnd"].forEach(
                        function (r) {
                            e[t + "EventListener"](r, n);
                        },
                    );
                }
                function cn(e, t, n) {
                    xt(n).forEach(function (n) {
                        e.classList[t](n + "-theme");
                    });
                }
                var fn = 1,
                    dn = [],
                    pn = [];
                function hn(e, t) {
                    var n,
                        r,
                        i,
                        o = Mt(e, tt({}, St, {}, Lt(t)));
                    if (!o.multiple && e._tippy) return null;
                    var a,
                        s,
                        u,
                        l,
                        c,
                        f,
                        d,
                        p = !1,
                        h = !1,
                        m = !1,
                        v = 0,
                        g = [],
                        y = vt(V, o.interactiveDebounce),
                        b =
                            ((c = o.triggerTarget || e),
                            ((f = Tt(c)[0]) && f.ownerDocument) || document),
                        x = fn++,
                        w = sn(x, o),
                        T = on(w),
                        C = (d = o.plugins).filter(function (e, t) {
                            return d.indexOf(e) === t;
                        }),
                        E = T.tooltip,
                        A = T.content,
                        S = [E, A],
                        k = {
                            id: x,
                            reference: e,
                            popper: w,
                            popperChildren: T,
                            popperInstance: null,
                            props: o,
                            state: {
                                currentPlacement: null,
                                isEnabled: !0,
                                isVisible: !1,
                                isDestroyed: !1,
                                isMounted: !1,
                                isShown: !1,
                            },
                            plugins: C,
                            clearDelayTimeouts: function () {
                                (clearTimeout(n),
                                    clearTimeout(r),
                                    cancelAnimationFrame(i));
                            },
                            setProps: function (t) {
                                0;
                                if (k.state.isDestroyed) return;
                                0;
                                (H("onBeforeUpdate", [k, t]), U());
                                var n = k.props,
                                    r = Mt(
                                        e,
                                        tt({}, k.props, {}, t, {
                                            ignoreAttributes: !0,
                                        }),
                                    );
                                ((r.ignoreAttributes = wt(
                                    t.ignoreAttributes,
                                    n.ignoreAttributes,
                                )),
                                    (k.props = r),
                                    _(),
                                    n.interactiveDebounce !==
                                        r.interactiveDebounce &&
                                        (I(),
                                        (y = vt(V, r.interactiveDebounce))));
                                (un(w, n, r),
                                    (k.popperChildren = on(w)),
                                    n.triggerTarget && !r.triggerTarget
                                        ? Tt(n.triggerTarget).forEach(
                                              function (e) {
                                                  e.removeAttribute(
                                                      "aria-expanded",
                                                  );
                                              },
                                          )
                                        : r.triggerTarget &&
                                          e.removeAttribute("aria-expanded"));
                                if ((B(), k.popperInstance))
                                    if (
                                        Dt.some(function (e) {
                                            return ot(t, e) && t[e] !== n[e];
                                        })
                                    ) {
                                        var i = k.popperInstance.reference;
                                        (k.popperInstance.destroy(),
                                            J(),
                                            (k.popperInstance.reference = i),
                                            k.state.isVisible &&
                                                k.popperInstance.enableEventListeners());
                                    } else k.popperInstance.update();
                                H("onAfterUpdate", [k, t]);
                            },
                            setContent: function (e) {
                                k.setProps({ content: e });
                            },
                            show: function (e) {
                                void 0 === e &&
                                    (e = st(k.props.duration, 0, St.duration));
                                0;
                                var t = k.state.isVisible,
                                    n = k.state.isDestroyed,
                                    r = !k.state.isEnabled,
                                    i = Ut.isTouch && !k.props.touch;
                                if (t || n || r || i) return;
                                if (O().hasAttribute("disabled")) return;
                                k.popperInstance || J();
                                if (
                                    (H("onShow", [k], !1),
                                    !1 === k.props.onShow(k))
                                )
                                    return;
                                (q(),
                                    (w.style.visibility = "visible"),
                                    (k.state.isVisible = !0),
                                    k.state.isMounted || ht(S.concat(w), 0));
                                ((s = function () {
                                    k.state.isVisible &&
                                        (ht([w], k.props.updateDuration),
                                        ht(S, e),
                                        mt(S, "visible"),
                                        P(),
                                        B(),
                                        Ct(pn, k),
                                        Kt(!0),
                                        (k.state.isMounted = !0),
                                        H("onMount", [k]),
                                        (function (e, t) {
                                            F(e, t);
                                        })(e, function () {
                                            ((k.state.isShown = !0),
                                                H("onShown", [k]));
                                        }));
                                }),
                                    (function () {
                                        v = 0;
                                        var e,
                                            t = k.props.appendTo,
                                            n = O();
                                        e =
                                            (k.props.interactive &&
                                                t === St.appendTo) ||
                                            "parent" === t
                                                ? n.parentNode
                                                : ft(t, [n]);
                                        e.contains(w) || e.appendChild(w);
                                        0;
                                        (dt(
                                            k.popperInstance.modifiers,
                                            "flip",
                                            "enabled",
                                            k.props.flip,
                                        ),
                                            k.popperInstance.enableEventListeners(),
                                            k.popperInstance.update());
                                    })());
                            },
                            hide: function (e) {
                                void 0 === e &&
                                    (e = st(k.props.duration, 1, St.duration));
                                0;
                                var t = !k.state.isVisible && !p,
                                    n = k.state.isDestroyed,
                                    r = !k.state.isEnabled && !p;
                                if (t || n || r) return;
                                if (
                                    (H("onHide", [k], !1),
                                    !1 === k.props.onHide(k) && !p)
                                )
                                    return;
                                (R(),
                                    (w.style.visibility = "hidden"),
                                    (k.state.isVisible = !1),
                                    (k.state.isShown = !1),
                                    ht(S, e),
                                    mt(S, "hidden"),
                                    P(),
                                    B(),
                                    (function (e, t) {
                                        F(e, function () {
                                            !k.state.isVisible &&
                                                w.parentNode &&
                                                w.parentNode.contains(w) &&
                                                t();
                                        });
                                    })(e, function () {
                                        (k.popperInstance.disableEventListeners(),
                                            (k.popperInstance.options.placement =
                                                k.props.placement),
                                            w.parentNode.removeChild(w),
                                            0 ===
                                                (pn = pn.filter(function (e) {
                                                    return e !== k;
                                                })).length && Kt(!1),
                                            (k.state.isMounted = !1),
                                            H("onHidden", [k]));
                                    }));
                            },
                            enable: function () {
                                k.state.isEnabled = !0;
                            },
                            disable: function () {
                                (k.hide(), (k.state.isEnabled = !1));
                            },
                            destroy: function () {
                                0;
                                if (k.state.isDestroyed) return;
                                ((p = !0),
                                    k.clearDelayTimeouts(),
                                    k.hide(0),
                                    U(),
                                    delete e._tippy,
                                    k.popperInstance &&
                                        k.popperInstance.destroy());
                                ((p = !1),
                                    (k.state.isDestroyed = !0),
                                    H("onDestroy", [k]));
                            },
                        };
                    ((e._tippy = k), (w._tippy = k));
                    var D = C.map(function (e) {
                            return e.fn(k);
                        }),
                        N = e.hasAttribute("aria-expanded");
                    return (
                        _(),
                        B(),
                        o.lazy || J(),
                        H("onCreate", [k]),
                        o.showOnCreate && Z(),
                        w.addEventListener("mouseenter", function () {
                            k.props.interactive &&
                                k.state.isVisible &&
                                k.clearDelayTimeouts();
                        }),
                        w.addEventListener("mouseleave", function (e) {
                            k.props.interactive &&
                                bt(k.props.trigger, "mouseenter") &&
                                (y(e), b.addEventListener("mousemove", y));
                        }),
                        k
                    );
                    function L() {
                        var e = k.props.touch;
                        return Array.isArray(e) ? e : [e, 0];
                    }
                    function M() {
                        return "hold" === L()[0];
                    }
                    function O() {
                        return l || e;
                    }
                    function j(e) {
                        return (k.state.isMounted && !k.state.isVisible) ||
                            Ut.isTouch ||
                            (a && "focus" === a.type)
                            ? 0
                            : st(k.props.delay, e ? 0 : 1, St.delay);
                    }
                    function H(e, t, n) {
                        var r;
                        (void 0 === n && (n = !0),
                        D.forEach(function (n) {
                            ot(n, e) && n[e].apply(n, t);
                        }),
                        n) && (r = k.props)[e].apply(r, t);
                    }
                    function P() {
                        var t = k.props.aria;
                        if (t) {
                            var n = "aria-" + t,
                                r = E.id;
                            Tt(k.props.triggerTarget || e).forEach(
                                function (e) {
                                    var t = e.getAttribute(n);
                                    if (k.state.isVisible)
                                        e.setAttribute(n, t ? t + " " + r : r);
                                    else {
                                        var i = t && t.replace(r, "").trim();
                                        i
                                            ? e.setAttribute(n, i)
                                            : e.removeAttribute(n);
                                    }
                                },
                            );
                        }
                    }
                    function B() {
                        N ||
                            Tt(k.props.triggerTarget || e).forEach(
                                function (e) {
                                    k.props.interactive
                                        ? e.setAttribute(
                                              "aria-expanded",
                                              k.state.isVisible && e === O()
                                                  ? "true"
                                                  : "false",
                                          )
                                        : e.removeAttribute("aria-expanded");
                                },
                            );
                    }
                    function I() {
                        (b.body.removeEventListener("mouseleave", K),
                            b.removeEventListener("mousemove", y),
                            (dn = dn.filter(function (e) {
                                return e !== y;
                            })));
                    }
                    function z(e) {
                        if (!k.props.interactive || !w.contains(e.target)) {
                            if (O().contains(e.target)) {
                                if (Ut.isTouch) return;
                                if (
                                    k.state.isVisible &&
                                    bt(k.props.trigger, "click")
                                )
                                    return;
                            }
                            !0 === k.props.hideOnClick &&
                                ((h = !1),
                                k.clearDelayTimeouts(),
                                k.hide(),
                                (m = !0),
                                setTimeout(function () {
                                    m = !1;
                                }),
                                k.state.isMounted || R());
                        }
                    }
                    function q() {
                        b.addEventListener("mousedown", z, !0);
                    }
                    function R() {
                        b.removeEventListener("mousedown", z, !0);
                    }
                    function F(e, t) {
                        function n(e) {
                            e.target === E && (ln(E, "remove", n), t());
                        }
                        if (0 === e) return t();
                        (ln(E, "remove", u), ln(E, "add", n), (u = n));
                    }
                    function W(t, n, r) {
                        (void 0 === r && (r = !1),
                            Tt(k.props.triggerTarget || e).forEach(
                                function (e) {
                                    (e.addEventListener(t, n, r),
                                        g.push({
                                            node: e,
                                            eventType: t,
                                            handler: n,
                                            options: r,
                                        }));
                                },
                            ));
                    }
                    function _() {
                        (M() && (W("touchstart", $, Ot), W("touchend", Y, Ot)),
                            xt(k.props.trigger).forEach(function (e) {
                                if ("manual" !== e)
                                    switch ((W(e, $), e)) {
                                        case "mouseenter":
                                            W("mouseleave", Y);
                                            break;
                                        case "focus":
                                            W(Qt ? "focusout" : "blur", X);
                                            break;
                                        case "focusin":
                                            W("focusout", X);
                                    }
                            }));
                    }
                    function U() {
                        (g.forEach(function (e) {
                            var t = e.node,
                                n = e.eventType,
                                r = e.handler,
                                i = e.options;
                            t.removeEventListener(n, r, i);
                        }),
                            (g = []));
                    }
                    function $(e) {
                        var t = !1;
                        if (k.state.isEnabled && !G(e) && !m) {
                            if (
                                ((a = e),
                                (l = e.currentTarget),
                                B(),
                                !k.state.isVisible &&
                                    (function (e) {
                                        return lt(e, "MouseEvent");
                                    })(e) &&
                                    dn.forEach(function (t) {
                                        return t(e);
                                    }),
                                "click" !== e.type ||
                                    (bt(k.props.trigger, "mouseenter") && !h) ||
                                    !1 === k.props.hideOnClick ||
                                    !k.state.isVisible)
                            ) {
                                var r = L(),
                                    i = r[0],
                                    o = r[1];
                                Ut.isTouch && "hold" === i && o
                                    ? (n = setTimeout(function () {
                                          Z(e);
                                      }, o))
                                    : Z(e);
                            } else t = !0;
                            ("click" === e.type && (h = !t), t && K(e));
                        }
                    }
                    function V(t) {
                        var n = (function (e, t) {
                            for (; e; ) {
                                if (t(e)) return e;
                                e = e.parentElement;
                            }
                            return null;
                        })(t.target, function (t) {
                            return t === e || t === w;
                        });
                        if ("mousemove" !== t.type || !n) {
                            var r = yt(w.querySelectorAll(qt))
                                .concat(w)
                                .map(function (e) {
                                    var t = e._tippy,
                                        n = t.popperChildren.tooltip,
                                        r = t.props.interactiveBorder;
                                    return {
                                        popperRect: e.getBoundingClientRect(),
                                        tooltipRect: n.getBoundingClientRect(),
                                        interactiveBorder: r,
                                    };
                                });
                            (function (e, t) {
                                var n = t.clientX,
                                    r = t.clientY;
                                return e.every(function (e) {
                                    var t = e.popperRect,
                                        i = e.tooltipRect,
                                        o = e.interactiveBorder,
                                        a = Math.min(t.top, i.top),
                                        s = Math.max(t.right, i.right),
                                        u = Math.max(t.bottom, i.bottom),
                                        l = Math.min(t.left, i.left);
                                    return (
                                        a - r > o ||
                                        r - u > o ||
                                        l - n > o ||
                                        n - s > o
                                    );
                                });
                            })(r, t) && (I(), K(t));
                        }
                    }
                    function Y(e) {
                        if (!(G(e) || (bt(k.props.trigger, "click") && h)))
                            return k.props.interactive
                                ? (b.body.addEventListener("mouseleave", K),
                                  b.addEventListener("mousemove", y),
                                  Ct(dn, y),
                                  void y(e))
                                : void K(e);
                    }
                    function X(e) {
                        (bt(k.props.trigger, "focusin") || e.target === O()) &&
                            ((k.props.interactive &&
                                e.relatedTarget &&
                                w.contains(e.relatedTarget)) ||
                                K(e));
                    }
                    function G(e) {
                        var t = "ontouchstart" in window,
                            n = bt(e.type, "touch"),
                            r = M();
                        return (
                            (t && Ut.isTouch && r && !n) ||
                            (Ut.isTouch && !r && n)
                        );
                    }
                    function J() {
                        var t,
                            n = k.props.popperOptions,
                            r = k.popperChildren.arrow,
                            i = ut(n, "flip"),
                            o = ut(n, "preventOverflow");
                        function a(e) {
                            var n = k.state.currentPlacement;
                            ((k.state.currentPlacement = e.placement),
                                k.props.flip &&
                                    !k.props.flipOnUpdate &&
                                    (e.flipped &&
                                        (k.popperInstance.options.placement =
                                            e.placement),
                                    dt(
                                        k.popperInstance.modifiers,
                                        "flip",
                                        "enabled",
                                        !1,
                                    )),
                                E.setAttribute("data-placement", e.placement),
                                !1 !== e.attributes["x-out-of-boundaries"]
                                    ? E.setAttribute(
                                          "data-out-of-boundaries",
                                          "",
                                      )
                                    : E.removeAttribute(
                                          "data-out-of-boundaries",
                                      ));
                            var r = en(e.placement),
                                i = bt(["top", "bottom"], r),
                                o = bt(["bottom", "right"], r);
                            ((E.style.top = "0"),
                                (E.style.left = "0"),
                                (E.style[i ? "top" : "left"] =
                                    (o ? 1 : -1) * t + "px"),
                                n &&
                                    n !== e.placement &&
                                    k.popperInstance.update());
                        }
                        var s = tt(
                            { eventsEnabled: !1, placement: k.props.placement },
                            n,
                            {
                                modifiers: tt({}, n && n.modifiers, {
                                    tippyDistance: {
                                        enabled: !0,
                                        order: 0,
                                        fn: function (e) {
                                            t = (function (e, t) {
                                                var n =
                                                        "string" == typeof t &&
                                                        bt(t, "rem"),
                                                    r = e.documentElement;
                                                return r && n
                                                    ? parseFloat(
                                                          getComputedStyle(r)
                                                              .fontSize ||
                                                              String(16),
                                                      ) * Et(t)
                                                    : Et(t);
                                            })(b, k.props.distance);
                                            var n = en(e.placement),
                                                r = At(n, o && o.padding, t),
                                                a = At(n, i && i.padding, t),
                                                s = k.popperInstance.modifiers;
                                            return (
                                                dt(
                                                    s,
                                                    "preventOverflow",
                                                    "padding",
                                                    r,
                                                ),
                                                dt(s, "flip", "padding", a),
                                                e
                                            );
                                        },
                                    },
                                    preventOverflow: tt(
                                        { boundariesElement: k.props.boundary },
                                        o,
                                    ),
                                    flip: tt(
                                        {
                                            enabled: k.props.flip,
                                            behavior: k.props.flipBehavior,
                                        },
                                        i,
                                    ),
                                    arrow: tt(
                                        { element: r, enabled: !!r },
                                        ut(n, "arrow"),
                                    ),
                                    offset: tt(
                                        { offset: k.props.offset },
                                        ut(n, "offset"),
                                    ),
                                }),
                                onCreate: function (e) {
                                    (a(e),
                                        gt(n && n.onCreate, s.onCreate, [e]),
                                        Q());
                                },
                                onUpdate: function (e) {
                                    (a(e),
                                        gt(n && n.onUpdate, s.onUpdate, [e]),
                                        Q());
                                },
                            },
                        );
                        k.popperInstance = new et(e, w, s);
                    }
                    function Q() {
                        0 === v
                            ? (v++, k.popperInstance.update())
                            : s &&
                              1 === v &&
                              (v++,
                              (function (e) {
                                  e.offsetHeight;
                              })(w),
                              s());
                    }
                    function Z(e) {
                        (k.clearDelayTimeouts(),
                            k.popperInstance || J(),
                            e && H("onTrigger", [k, e]),
                            q());
                        var t = j(!0);
                        t
                            ? (n = setTimeout(function () {
                                  k.show();
                              }, t))
                            : k.show();
                    }
                    function K(e) {
                        if (
                            (k.clearDelayTimeouts(),
                            H("onUntrigger", [k, e]),
                            k.state.isVisible)
                        ) {
                            if (
                                !(
                                    bt(k.props.trigger, "mouseenter") &&
                                    bt(k.props.trigger, "click") &&
                                    bt(["mouseleave", "mousemove"], e.type) &&
                                    h
                                )
                            ) {
                                var t = j(!1);
                                t
                                    ? (r = setTimeout(function () {
                                          k.state.isVisible && k.hide();
                                      }, t))
                                    : (i = requestAnimationFrame(function () {
                                          k.hide();
                                      }));
                            }
                        } else R();
                    }
                }
                function mn(e, t, n) {
                    (void 0 === t && (t = {}),
                        void 0 === n && (n = []),
                        (n = St.plugins.concat(t.plugins || n)),
                        document.addEventListener(
                            "touchstart",
                            Vt,
                            tt({}, Ot, { capture: !0 }),
                        ),
                        window.addEventListener("blur", Xt));
                    var r = tt({}, t, { plugins: n }),
                        i = at(e).reduce(function (e, t) {
                            var n = t && hn(t, r);
                            return (n && e.push(n), e);
                        }, []);
                    return ct(e) ? i[0] : i;
                }
                ((mn.version = nt),
                    (mn.defaultProps = St),
                    (mn.setDefaultProps = Nt),
                    (mn.currentInput = Ut));
                ((window.Headroom = i()),
                    (window.$ = window.jQuery = a()),
                    (a().timeago.settings.strings = {
                        prefixAgo: null,
                        prefixFromNow: null,
                        suffixAgo: null,
                        suffixFromNow: "nữa",
                        seconds: "%d giây",
                        minute: "1 phút",
                        minutes: "%d phút",
                        hour: "1 giờ",
                        hours: "%d giờ",
                        day: "1 ngày",
                        days: "%d ngày",
                        month: "1 tháng",
                        months: "%d tháng",
                        year: "1 năm",
                        years: "%d năm",
                        wordSeparator: " ",
                        numbers: [],
                    }),
                    (window.tns = V),
                    (window.Cookies = X()),
                    (window.tippy = mn),
                    (window.tippyHideAll = function (e) {
                        var t = void 0 === e ? {} : e,
                            n = t.exclude,
                            r = t.duration;
                        pn.forEach(function (e) {
                            var t = !1;
                            (n &&
                                (t = it(n)
                                    ? e.reference === n
                                    : e.popper === n.popper),
                                t || e.hide(r));
                        });
                    }));
            },
            151: (e, t, n) => {
                "use strict";
                n.d(t, { Z: () => o });
                var r = n(645),
                    i = n.n(r)()(function (e) {
                        return e[1];
                    });
                i.push([
                    e.id,
                    '.tns-outer{padding:0!important}.tns-outer [hidden]{display:none!important}.tns-outer [aria-controls],.tns-outer [data-action]{cursor:pointer}.tns-slider{transition:all 0s}.tns-slider>.tns-item{box-sizing:border-box}.tns-horizontal.tns-subpixel{white-space:nowrap}.tns-horizontal.tns-subpixel>.tns-item{display:inline-block;vertical-align:top;white-space:normal}.tns-horizontal.tns-no-subpixel:after{clear:both;content:"";display:table}.tns-horizontal.tns-no-subpixel>.tns-item{float:left}.tns-horizontal.tns-carousel.tns-no-subpixel>.tns-item{margin-right:-100%}.tns-gallery,.tns-no-calc{left:0;position:relative}.tns-gallery{min-height:1px}.tns-gallery>.tns-item{left:-100%;position:absolute;transition:transform 0s,opacity 0s}.tns-gallery>.tns-slide-active{left:auto!important;position:relative}.tns-gallery>.tns-moving{transition:all .25s}.tns-autowidth{display:inline-block}.tns-lazy-img{opacity:.6;transition:opacity .6s}.tns-lazy-img.tns-complete{opacity:1}.tns-ah{transition:height 0s}.tns-ovh{overflow:hidden}.tns-visually-hidden{left:-10000em;position:absolute}.tns-transparent{opacity:0;visibility:hidden}.tns-fadeIn{filter:alpha(opacity=100);opacity:1;z-index:0}.tns-fadeOut,.tns-normal{filter:alpha(opacity=0);opacity:0;z-index:-1}.tns-vpfix{white-space:nowrap}.tns-vpfix>div,.tns-vpfix>li{display:inline-block}.tns-t-subp2{height:10px;margin:0 auto;overflow:hidden;position:relative;width:310px}.tns-t-ct{position:absolute;right:0;width:2333.3333333%;width:2333.33333%}.tns-t-ct:after{clear:both;content:"";display:table}.tns-t-ct>div{float:left;height:10px;width:1.4285714%;width:1.42857%}',
                    "",
                ]);
                const o = i;
            },
            600: (e, t, n) => {
                "use strict";
                n.d(t, { Z: () => o });
                var r = n(645),
                    i = n.n(r)()(function (e) {
                        return e[1];
                    });
                i.push([
                    e.id,
                    ".tippy-tooltip[data-animation=fade][data-state=hidden]{opacity:0}.tippy-iOS{-webkit-tap-highlight-color:transparent;cursor:pointer!important}.tippy-popper{max-width:calc(100vw - 10px);pointer-events:none;transition-property:transform;transition-timing-function:cubic-bezier(.165,.84,.44,1)}.tippy-tooltip{background-color:#333;border-radius:4px;color:#fff;font-size:14px;line-height:1.4;outline:0;position:relative;transition-property:visibility,opacity,transform}.tippy-tooltip[data-placement^=top]>.tippy-arrow{border-top-color:#333;border-width:8px 8px 0;bottom:-7px;margin:0 3px;transform-origin:50% 0}.tippy-tooltip[data-placement^=bottom]>.tippy-arrow{border-bottom-color:#333;border-width:0 8px 8px;margin:0 3px;top:-7px;transform-origin:50% 7px}.tippy-tooltip[data-placement^=left]>.tippy-arrow{border-left-color:#333;border-width:8px 0 8px 8px;margin:3px 0;right:-7px;transform-origin:0 50%}.tippy-tooltip[data-placement^=right]>.tippy-arrow{border-right-color:#333;border-width:8px 8px 8px 0;left:-7px;margin:3px 0;transform-origin:7px 50%}.tippy-tooltip[data-interactive][data-state=visible]{pointer-events:auto}.tippy-tooltip[data-inertia][data-state=visible]{transition-timing-function:cubic-bezier(.54,1.5,.38,1.11)}.tippy-arrow{border-color:transparent;border-style:solid;position:absolute}.tippy-content{padding:5px 9px}",
                    "",
                ]);
                const o = i;
            },
            645: (e) => {
                "use strict";
                e.exports = function (e) {
                    var t = [];
                    return (
                        (t.toString = function () {
                            return this.map(function (t) {
                                var n = e(t);
                                return t[2]
                                    ? "@media "
                                          .concat(t[2], " {")
                                          .concat(n, "}")
                                    : n;
                            }).join("");
                        }),
                        (t.i = function (e, n, r) {
                            "string" == typeof e && (e = [[null, e, ""]]);
                            var i = {};
                            if (r)
                                for (var o = 0; o < this.length; o++) {
                                    var a = this[o][0];
                                    null != a && (i[a] = !0);
                                }
                            for (var s = 0; s < e.length; s++) {
                                var u = [].concat(e[s]);
                                (r && i[u[0]]) ||
                                    (n &&
                                        (u[2]
                                            ? (u[2] = ""
                                                  .concat(n, " and ")
                                                  .concat(u[2]))
                                            : (u[2] = n)),
                                    t.push(u));
                            }
                        }),
                        t
                    );
                };
            },
            631: function (e) {
                e.exports = (function () {
                    "use strict";
                    function e() {
                        return "undefined" != typeof window;
                    }
                    function t() {
                        var e = !1;
                        try {
                            var t = {
                                get passive() {
                                    e = !0;
                                },
                            };
                            (window.addEventListener("test", t, t),
                                window.removeEventListener("test", t, t));
                        } catch (t) {
                            e = !1;
                        }
                        return e;
                    }
                    function n() {
                        return !!(
                            e() &&
                            function () {}.bind &&
                            "classList" in document.documentElement &&
                            Object.assign &&
                            Object.keys &&
                            requestAnimationFrame
                        );
                    }
                    function r(e) {
                        return 9 === e.nodeType;
                    }
                    function i(e) {
                        return e && e.document && r(e.document);
                    }
                    function o(e) {
                        var t = e.document,
                            n = t.body,
                            r = t.documentElement;
                        return {
                            scrollHeight: function () {
                                return Math.max(
                                    n.scrollHeight,
                                    r.scrollHeight,
                                    n.offsetHeight,
                                    r.offsetHeight,
                                    n.clientHeight,
                                    r.clientHeight,
                                );
                            },
                            height: function () {
                                return (
                                    e.innerHeight ||
                                    r.clientHeight ||
                                    n.clientHeight
                                );
                            },
                            scrollY: function () {
                                return void 0 !== e.pageYOffset
                                    ? e.pageYOffset
                                    : (r || n.parentNode || n).scrollTop;
                            },
                        };
                    }
                    function a(e) {
                        return {
                            scrollHeight: function () {
                                return Math.max(
                                    e.scrollHeight,
                                    e.offsetHeight,
                                    e.clientHeight,
                                );
                            },
                            height: function () {
                                return Math.max(e.offsetHeight, e.clientHeight);
                            },
                            scrollY: function () {
                                return e.scrollTop;
                            },
                        };
                    }
                    function s(e) {
                        return i(e) ? o(e) : a(e);
                    }
                    function u(e, n, r) {
                        var i,
                            o = t(),
                            a = !1,
                            u = s(e),
                            l = u.scrollY(),
                            c = {};
                        function f() {
                            var e = Math.round(u.scrollY()),
                                t = u.height(),
                                i = u.scrollHeight();
                            ((c.scrollY = e),
                                (c.lastScrollY = l),
                                (c.direction = e > l ? "down" : "up"),
                                (c.distance = Math.abs(e - l)),
                                (c.isOutOfBounds = e < 0 || e + t > i),
                                (c.top = e <= n.offset),
                                (c.bottom = e + t >= i),
                                (c.toleranceExceeded =
                                    c.distance > n.tolerance[c.direction]),
                                r(c),
                                (l = e),
                                (a = !1));
                        }
                        function d() {
                            a || ((a = !0), (i = requestAnimationFrame(f)));
                        }
                        var p = !!o && { passive: !0, capture: !1 };
                        return (
                            e.addEventListener("scroll", d, p),
                            f(),
                            {
                                destroy: function () {
                                    (cancelAnimationFrame(i),
                                        e.removeEventListener("scroll", d, p));
                                },
                            }
                        );
                    }
                    function l(e) {
                        return e === Object(e) ? e : { down: e, up: e };
                    }
                    function c(e, t) {
                        ((t = t || {}),
                            Object.assign(this, c.options, t),
                            (this.classes = Object.assign(
                                {},
                                c.options.classes,
                                t.classes,
                            )),
                            (this.elem = e),
                            (this.tolerance = l(this.tolerance)),
                            (this.initialised = !1),
                            (this.frozen = !1));
                    }
                    return (
                        (c.prototype = {
                            constructor: c,
                            init: function () {
                                return (
                                    c.cutsTheMustard &&
                                        !this.initialised &&
                                        (this.addClass("initial"),
                                        (this.initialised = !0),
                                        setTimeout(
                                            function (e) {
                                                e.scrollTracker = u(
                                                    e.scroller,
                                                    {
                                                        offset: e.offset,
                                                        tolerance: e.tolerance,
                                                    },
                                                    e.update.bind(e),
                                                );
                                            },
                                            100,
                                            this,
                                        )),
                                    this
                                );
                            },
                            destroy: function () {
                                ((this.initialised = !1),
                                    Object.keys(this.classes).forEach(
                                        this.removeClass,
                                        this,
                                    ),
                                    this.scrollTracker.destroy());
                            },
                            unpin: function () {
                                (!this.hasClass("pinned") &&
                                    this.hasClass("unpinned")) ||
                                    (this.addClass("unpinned"),
                                    this.removeClass("pinned"),
                                    this.onUnpin && this.onUnpin.call(this));
                            },
                            pin: function () {
                                this.hasClass("unpinned") &&
                                    (this.addClass("pinned"),
                                    this.removeClass("unpinned"),
                                    this.onPin && this.onPin.call(this));
                            },
                            freeze: function () {
                                ((this.frozen = !0), this.addClass("frozen"));
                            },
                            unfreeze: function () {
                                ((this.frozen = !1),
                                    this.removeClass("frozen"));
                            },
                            top: function () {
                                this.hasClass("top") ||
                                    (this.addClass("top"),
                                    this.removeClass("notTop"),
                                    this.onTop && this.onTop.call(this));
                            },
                            notTop: function () {
                                this.hasClass("notTop") ||
                                    (this.addClass("notTop"),
                                    this.removeClass("top"),
                                    this.onNotTop && this.onNotTop.call(this));
                            },
                            bottom: function () {
                                this.hasClass("bottom") ||
                                    (this.addClass("bottom"),
                                    this.removeClass("notBottom"),
                                    this.onBottom && this.onBottom.call(this));
                            },
                            notBottom: function () {
                                this.hasClass("notBottom") ||
                                    (this.addClass("notBottom"),
                                    this.removeClass("bottom"),
                                    this.onNotBottom &&
                                        this.onNotBottom.call(this));
                            },
                            shouldUnpin: function (e) {
                                return (
                                    "down" === e.direction &&
                                    !e.top &&
                                    e.toleranceExceeded
                                );
                            },
                            shouldPin: function (e) {
                                return (
                                    ("up" === e.direction &&
                                        e.toleranceExceeded) ||
                                    e.top
                                );
                            },
                            addClass: function (e) {
                                this.elem.classList.add.apply(
                                    this.elem.classList,
                                    this.classes[e].split(" "),
                                );
                            },
                            removeClass: function (e) {
                                this.elem.classList.remove.apply(
                                    this.elem.classList,
                                    this.classes[e].split(" "),
                                );
                            },
                            hasClass: function (e) {
                                return this.classes[e]
                                    .split(" ")
                                    .every(function (e) {
                                        return this.classList.contains(e);
                                    }, this.elem);
                            },
                            update: function (e) {
                                e.isOutOfBounds ||
                                    (!0 !== this.frozen &&
                                        (e.top ? this.top() : this.notTop(),
                                        e.bottom
                                            ? this.bottom()
                                            : this.notBottom(),
                                        this.shouldUnpin(e)
                                            ? this.unpin()
                                            : this.shouldPin(e) && this.pin()));
                            },
                        }),
                        (c.options = {
                            tolerance: { up: 0, down: 0 },
                            offset: 0,
                            scroller: e() ? window : null,
                            classes: {
                                frozen: "headroom--frozen",
                                pinned: "headroom--pinned",
                                unpinned: "headroom--unpinned",
                                top: "headroom--top",
                                notTop: "headroom--not-top",
                                bottom: "headroom--bottom",
                                notBottom: "headroom--not-bottom",
                                initial: "headroom",
                            },
                        }),
                        (c.cutsTheMustard = n()),
                        c
                    );
                })();
            },
            755: function (e, t) {
                var n;
                !(function (t, n) {
                    "use strict";
                    "object" == typeof e.exports
                        ? (e.exports = t.document
                              ? n(t, !0)
                              : function (e) {
                                    if (!e.document)
                                        throw new Error(
                                            "jQuery requires a window with a document",
                                        );
                                    return n(e);
                                })
                        : n(t);
                })(
                    "undefined" != typeof window ? window : this,
                    function (r, i) {
                        "use strict";
                        var o = [],
                            a = Object.getPrototypeOf,
                            s = o.slice,
                            u = o.flat
                                ? function (e) {
                                      return o.flat.call(e);
                                  }
                                : function (e) {
                                      return o.concat.apply([], e);
                                  },
                            l = o.push,
                            c = o.indexOf,
                            f = {},
                            d = f.toString,
                            p = f.hasOwnProperty,
                            h = p.toString,
                            m = h.call(Object),
                            v = {},
                            g = function (e) {
                                return (
                                    "function" == typeof e &&
                                    "number" != typeof e.nodeType &&
                                    "function" != typeof e.item
                                );
                            },
                            y = function (e) {
                                return null != e && e === e.window;
                            },
                            b = r.document,
                            x = { type: !0, src: !0, nonce: !0, noModule: !0 };
                        function w(e, t, n) {
                            var r,
                                i,
                                o = (n = n || b).createElement("script");
                            if (((o.text = e), t))
                                for (r in x)
                                    (i =
                                        t[r] ||
                                        (t.getAttribute &&
                                            t.getAttribute(r))) &&
                                        o.setAttribute(r, i);
                            n.head.appendChild(o).parentNode.removeChild(o);
                        }
                        function T(e) {
                            return null == e
                                ? e + ""
                                : "object" == typeof e || "function" == typeof e
                                  ? f[d.call(e)] || "object"
                                  : typeof e;
                        }
                        var C = "3.7.1",
                            E = /HTML$/i,
                            A = function (e, t) {
                                return new A.fn.init(e, t);
                            };
                        function S(e) {
                            var t = !!e && "length" in e && e.length,
                                n = T(e);
                            return (
                                !g(e) &&
                                !y(e) &&
                                ("array" === n ||
                                    0 === t ||
                                    ("number" == typeof t &&
                                        t > 0 &&
                                        t - 1 in e))
                            );
                        }
                        function k(e, t) {
                            return (
                                e.nodeName &&
                                e.nodeName.toLowerCase() === t.toLowerCase()
                            );
                        }
                        ((A.fn = A.prototype =
                            {
                                jquery: C,
                                constructor: A,
                                length: 0,
                                toArray: function () {
                                    return s.call(this);
                                },
                                get: function (e) {
                                    return null == e
                                        ? s.call(this)
                                        : e < 0
                                          ? this[e + this.length]
                                          : this[e];
                                },
                                pushStack: function (e) {
                                    var t = A.merge(this.constructor(), e);
                                    return ((t.prevObject = this), t);
                                },
                                each: function (e) {
                                    return A.each(this, e);
                                },
                                map: function (e) {
                                    return this.pushStack(
                                        A.map(this, function (t, n) {
                                            return e.call(t, n, t);
                                        }),
                                    );
                                },
                                slice: function () {
                                    return this.pushStack(
                                        s.apply(this, arguments),
                                    );
                                },
                                first: function () {
                                    return this.eq(0);
                                },
                                last: function () {
                                    return this.eq(-1);
                                },
                                even: function () {
                                    return this.pushStack(
                                        A.grep(this, function (e, t) {
                                            return (t + 1) % 2;
                                        }),
                                    );
                                },
                                odd: function () {
                                    return this.pushStack(
                                        A.grep(this, function (e, t) {
                                            return t % 2;
                                        }),
                                    );
                                },
                                eq: function (e) {
                                    var t = this.length,
                                        n = +e + (e < 0 ? t : 0);
                                    return this.pushStack(
                                        n >= 0 && n < t ? [this[n]] : [],
                                    );
                                },
                                end: function () {
                                    return (
                                        this.prevObject || this.constructor()
                                    );
                                },
                                push: l,
                                sort: o.sort,
                                splice: o.splice,
                            }),
                            (A.extend = A.fn.extend =
                                function () {
                                    var e,
                                        t,
                                        n,
                                        r,
                                        i,
                                        o,
                                        a = arguments[0] || {},
                                        s = 1,
                                        u = arguments.length,
                                        l = !1;
                                    for (
                                        "boolean" == typeof a &&
                                            ((l = a),
                                            (a = arguments[s] || {}),
                                            s++),
                                            "object" == typeof a ||
                                                g(a) ||
                                                (a = {}),
                                            s === u && ((a = this), s--);
                                        s < u;
                                        s++
                                    )
                                        if (null != (e = arguments[s]))
                                            for (t in e)
                                                ((r = e[t]),
                                                    "__proto__" !== t &&
                                                        a !== r &&
                                                        (l &&
                                                        r &&
                                                        (A.isPlainObject(r) ||
                                                            (i =
                                                                Array.isArray(
                                                                    r,
                                                                )))
                                                            ? ((n = a[t]),
                                                              (o =
                                                                  i &&
                                                                  !Array.isArray(
                                                                      n,
                                                                  )
                                                                      ? []
                                                                      : i ||
                                                                          A.isPlainObject(
                                                                              n,
                                                                          )
                                                                        ? n
                                                                        : {}),
                                                              (i = !1),
                                                              (a[t] = A.extend(
                                                                  l,
                                                                  o,
                                                                  r,
                                                              )))
                                                            : void 0 !== r &&
                                                              (a[t] = r)));
                                    return a;
                                }),
                            A.extend({
                                expando:
                                    "jQuery" +
                                    (C + Math.random()).replace(/\D/g, ""),
                                isReady: !0,
                                error: function (e) {
                                    throw new Error(e);
                                },
                                noop: function () {},
                                isPlainObject: function (e) {
                                    var t, n;
                                    return (
                                        !(
                                            !e ||
                                            "[object Object]" !== d.call(e)
                                        ) &&
                                        (!(t = a(e)) ||
                                            ("function" ==
                                                typeof (n =
                                                    p.call(t, "constructor") &&
                                                    t.constructor) &&
                                                h.call(n) === m))
                                    );
                                },
                                isEmptyObject: function (e) {
                                    var t;
                                    for (t in e) return !1;
                                    return !0;
                                },
                                globalEval: function (e, t, n) {
                                    w(e, { nonce: t && t.nonce }, n);
                                },
                                each: function (e, t) {
                                    var n,
                                        r = 0;
                                    if (S(e))
                                        for (
                                            n = e.length;
                                            r < n &&
                                            !1 !== t.call(e[r], r, e[r]);
                                            r++
                                        );
                                    else
                                        for (r in e)
                                            if (!1 === t.call(e[r], r, e[r]))
                                                break;
                                    return e;
                                },
                                text: function (e) {
                                    var t,
                                        n = "",
                                        r = 0,
                                        i = e.nodeType;
                                    if (!i)
                                        for (; (t = e[r++]); ) n += A.text(t);
                                    return 1 === i || 11 === i
                                        ? e.textContent
                                        : 9 === i
                                          ? e.documentElement.textContent
                                          : 3 === i || 4 === i
                                            ? e.nodeValue
                                            : n;
                                },
                                makeArray: function (e, t) {
                                    var n = t || [];
                                    return (
                                        null != e &&
                                            (S(Object(e))
                                                ? A.merge(
                                                      n,
                                                      "string" == typeof e
                                                          ? [e]
                                                          : e,
                                                  )
                                                : l.call(n, e)),
                                        n
                                    );
                                },
                                inArray: function (e, t, n) {
                                    return null == t ? -1 : c.call(t, e, n);
                                },
                                isXMLDoc: function (e) {
                                    var t = e && e.namespaceURI,
                                        n =
                                            e &&
                                            (e.ownerDocument || e)
                                                .documentElement;
                                    return !E.test(
                                        t || (n && n.nodeName) || "HTML",
                                    );
                                },
                                merge: function (e, t) {
                                    for (
                                        var n = +t.length, r = 0, i = e.length;
                                        r < n;
                                        r++
                                    )
                                        e[i++] = t[r];
                                    return ((e.length = i), e);
                                },
                                grep: function (e, t, n) {
                                    for (
                                        var r = [], i = 0, o = e.length, a = !n;
                                        i < o;
                                        i++
                                    )
                                        !t(e[i], i) !== a && r.push(e[i]);
                                    return r;
                                },
                                map: function (e, t, n) {
                                    var r,
                                        i,
                                        o = 0,
                                        a = [];
                                    if (S(e))
                                        for (r = e.length; o < r; o++)
                                            null != (i = t(e[o], o, n)) &&
                                                a.push(i);
                                    else
                                        for (o in e)
                                            null != (i = t(e[o], o, n)) &&
                                                a.push(i);
                                    return u(a);
                                },
                                guid: 1,
                                support: v,
                            }),
                            "function" == typeof Symbol &&
                                (A.fn[Symbol.iterator] = o[Symbol.iterator]),
                            A.each(
                                "Boolean Number String Function Array Date RegExp Object Error Symbol".split(
                                    " ",
                                ),
                                function (e, t) {
                                    f["[object " + t + "]"] = t.toLowerCase();
                                },
                            ));
                        var D = o.pop,
                            N = o.sort,
                            L = o.splice,
                            M = "[\\x20\\t\\r\\n\\f]",
                            O = new RegExp(
                                "^" +
                                    M +
                                    "+|((?:^|[^\\\\])(?:\\\\.)*)" +
                                    M +
                                    "+$",
                                "g",
                            );
                        A.contains = function (e, t) {
                            var n = t && t.parentNode;
                            return (
                                e === n ||
                                !(
                                    !n ||
                                    1 !== n.nodeType ||
                                    !(e.contains
                                        ? e.contains(n)
                                        : e.compareDocumentPosition &&
                                          16 & e.compareDocumentPosition(n))
                                )
                            );
                        };
                        var j = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;
                        function H(e, t) {
                            return t
                                ? "\0" === e
                                    ? "�"
                                    : e.slice(0, -1) +
                                      "\\" +
                                      e.charCodeAt(e.length - 1).toString(16) +
                                      " "
                                : "\\" + e;
                        }
                        A.escapeSelector = function (e) {
                            return (e + "").replace(j, H);
                        };
                        var P = b,
                            B = l;
                        !(function () {
                            var e,
                                t,
                                n,
                                i,
                                a,
                                u,
                                l,
                                f,
                                d,
                                h,
                                m = B,
                                g = A.expando,
                                y = 0,
                                b = 0,
                                x = ee(),
                                w = ee(),
                                T = ee(),
                                C = ee(),
                                E = function (e, t) {
                                    return (e === t && (a = !0), 0);
                                },
                                S =
                                    "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
                                j =
                                    "(?:\\\\[\\da-fA-F]{1,6}" +
                                    M +
                                    "?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",
                                H =
                                    "\\[" +
                                    M +
                                    "*(" +
                                    j +
                                    ")(?:" +
                                    M +
                                    "*([*^$|!~]?=)" +
                                    M +
                                    "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" +
                                    j +
                                    "))|)" +
                                    M +
                                    "*\\]",
                                I =
                                    ":(" +
                                    j +
                                    ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" +
                                    H +
                                    ")*)|.*)\\)|)",
                                z = new RegExp(M + "+", "g"),
                                q = new RegExp("^" + M + "*," + M + "*"),
                                R = new RegExp(
                                    "^" + M + "*([>+~]|" + M + ")" + M + "*",
                                ),
                                F = new RegExp(M + "|>"),
                                W = new RegExp(I),
                                _ = new RegExp("^" + j + "$"),
                                U = {
                                    ID: new RegExp("^#(" + j + ")"),
                                    CLASS: new RegExp("^\\.(" + j + ")"),
                                    TAG: new RegExp("^(" + j + "|[*])"),
                                    ATTR: new RegExp("^" + H),
                                    PSEUDO: new RegExp("^" + I),
                                    CHILD: new RegExp(
                                        "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
                                            M +
                                            "*(even|odd|(([+-]|)(\\d*)n|)" +
                                            M +
                                            "*(?:([+-]|)" +
                                            M +
                                            "*(\\d+)|))" +
                                            M +
                                            "*\\)|)",
                                        "i",
                                    ),
                                    bool: new RegExp("^(?:" + S + ")$", "i"),
                                    needsContext: new RegExp(
                                        "^" +
                                            M +
                                            "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
                                            M +
                                            "*((?:-\\d)?\\d*)" +
                                            M +
                                            "*\\)|)(?=[^-]|$)",
                                        "i",
                                    ),
                                },
                                $ = /^(?:input|select|textarea|button)$/i,
                                V = /^h\d$/i,
                                Y = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
                                X = /[+~]/,
                                G = new RegExp(
                                    "\\\\[\\da-fA-F]{1,6}" +
                                        M +
                                        "?|\\\\([^\\r\\n\\f])",
                                    "g",
                                ),
                                J = function (e, t) {
                                    var n = "0x" + e.slice(1) - 65536;
                                    return (
                                        t ||
                                        (n < 0
                                            ? String.fromCharCode(n + 65536)
                                            : String.fromCharCode(
                                                  (n >> 10) | 55296,
                                                  (1023 & n) | 56320,
                                              ))
                                    );
                                },
                                Q = function () {
                                    ue();
                                },
                                Z = de(
                                    function (e) {
                                        return (
                                            !0 === e.disabled &&
                                            k(e, "fieldset")
                                        );
                                    },
                                    { dir: "parentNode", next: "legend" },
                                );
                            try {
                                (m.apply(
                                    (o = s.call(P.childNodes)),
                                    P.childNodes,
                                ),
                                    o[P.childNodes.length].nodeType);
                            } catch (e) {
                                m = {
                                    apply: function (e, t) {
                                        B.apply(e, s.call(t));
                                    },
                                    call: function (e) {
                                        B.apply(e, s.call(arguments, 1));
                                    },
                                };
                            }
                            function K(e, t, n, r) {
                                var i,
                                    o,
                                    a,
                                    s,
                                    l,
                                    c,
                                    p,
                                    h = t && t.ownerDocument,
                                    y = t ? t.nodeType : 9;
                                if (
                                    ((n = n || []),
                                    "string" != typeof e ||
                                        !e ||
                                        (1 !== y && 9 !== y && 11 !== y))
                                )
                                    return n;
                                if (!r && (ue(t), (t = t || u), f)) {
                                    if (11 !== y && (l = Y.exec(e)))
                                        if ((i = l[1])) {
                                            if (9 === y) {
                                                if (!(a = t.getElementById(i)))
                                                    return n;
                                                if (a.id === i)
                                                    return (m.call(n, a), n);
                                            } else if (
                                                h &&
                                                (a = h.getElementById(i)) &&
                                                K.contains(t, a) &&
                                                a.id === i
                                            )
                                                return (m.call(n, a), n);
                                        } else {
                                            if (l[2])
                                                return (
                                                    m.apply(
                                                        n,
                                                        t.getElementsByTagName(
                                                            e,
                                                        ),
                                                    ),
                                                    n
                                                );
                                            if (
                                                (i = l[3]) &&
                                                t.getElementsByClassName
                                            )
                                                return (
                                                    m.apply(
                                                        n,
                                                        t.getElementsByClassName(
                                                            i,
                                                        ),
                                                    ),
                                                    n
                                                );
                                        }
                                    if (!(C[e + " "] || (d && d.test(e)))) {
                                        if (
                                            ((p = e),
                                            (h = t),
                                            1 === y && (F.test(e) || R.test(e)))
                                        ) {
                                            for (
                                                ((h =
                                                    (X.test(e) &&
                                                        se(t.parentNode)) ||
                                                    t) == t &&
                                                    v.scope) ||
                                                    ((s = t.getAttribute("id"))
                                                        ? (s =
                                                              A.escapeSelector(
                                                                  s,
                                                              ))
                                                        : t.setAttribute(
                                                              "id",
                                                              (s = g),
                                                          )),
                                                    o = (c = ce(e)).length;
                                                o--;
                                            )
                                                c[o] =
                                                    (s ? "#" + s : ":scope") +
                                                    " " +
                                                    fe(c[o]);
                                            p = c.join(",");
                                        }
                                        try {
                                            return (
                                                m.apply(
                                                    n,
                                                    h.querySelectorAll(p),
                                                ),
                                                n
                                            );
                                        } catch (t) {
                                            C(e, !0);
                                        } finally {
                                            s === g && t.removeAttribute("id");
                                        }
                                    }
                                }
                                return ye(e.replace(O, "$1"), t, n, r);
                            }
                            function ee() {
                                var e = [];
                                return function n(r, i) {
                                    return (
                                        e.push(r + " ") > t.cacheLength &&
                                            delete n[e.shift()],
                                        (n[r + " "] = i)
                                    );
                                };
                            }
                            function te(e) {
                                return ((e[g] = !0), e);
                            }
                            function ne(e) {
                                var t = u.createElement("fieldset");
                                try {
                                    return !!e(t);
                                } catch (e) {
                                    return !1;
                                } finally {
                                    (t.parentNode &&
                                        t.parentNode.removeChild(t),
                                        (t = null));
                                }
                            }
                            function re(e) {
                                return function (t) {
                                    return k(t, "input") && t.type === e;
                                };
                            }
                            function ie(e) {
                                return function (t) {
                                    return (
                                        (k(t, "input") || k(t, "button")) &&
                                        t.type === e
                                    );
                                };
                            }
                            function oe(e) {
                                return function (t) {
                                    return "form" in t
                                        ? t.parentNode && !1 === t.disabled
                                            ? "label" in t
                                                ? "label" in t.parentNode
                                                    ? t.parentNode.disabled ===
                                                      e
                                                    : t.disabled === e
                                                : t.isDisabled === e ||
                                                  (t.isDisabled !== !e &&
                                                      Z(t) === e)
                                            : t.disabled === e
                                        : "label" in t && t.disabled === e;
                                };
                            }
                            function ae(e) {
                                return te(function (t) {
                                    return (
                                        (t = +t),
                                        te(function (n, r) {
                                            for (
                                                var i,
                                                    o = e([], n.length, t),
                                                    a = o.length;
                                                a--;
                                            )
                                                n[(i = o[a])] &&
                                                    (n[i] = !(r[i] = n[i]));
                                        })
                                    );
                                });
                            }
                            function se(e) {
                                return (
                                    e && void 0 !== e.getElementsByTagName && e
                                );
                            }
                            function ue(e) {
                                var n,
                                    r = e ? e.ownerDocument || e : P;
                                return r != u &&
                                    9 === r.nodeType &&
                                    r.documentElement
                                    ? ((l = (u = r).documentElement),
                                      (f = !A.isXMLDoc(u)),
                                      (h =
                                          l.matches ||
                                          l.webkitMatchesSelector ||
                                          l.msMatchesSelector),
                                      l.msMatchesSelector &&
                                          P != u &&
                                          (n = u.defaultView) &&
                                          n.top !== n &&
                                          n.addEventListener("unload", Q),
                                      (v.getById = ne(function (e) {
                                          return (
                                              (l.appendChild(e).id = A.expando),
                                              !u.getElementsByName ||
                                                  !u.getElementsByName(
                                                      A.expando,
                                                  ).length
                                          );
                                      })),
                                      (v.disconnectedMatch = ne(function (e) {
                                          return h.call(e, "*");
                                      })),
                                      (v.scope = ne(function () {
                                          return u.querySelectorAll(":scope");
                                      })),
                                      (v.cssHas = ne(function () {
                                          try {
                                              return (
                                                  u.querySelector(
                                                      ":has(*,:jqfake)",
                                                  ),
                                                  !1
                                              );
                                          } catch (e) {
                                              return !0;
                                          }
                                      })),
                                      v.getById
                                          ? ((t.filter.ID = function (e) {
                                                var t = e.replace(G, J);
                                                return function (e) {
                                                    return (
                                                        e.getAttribute("id") ===
                                                        t
                                                    );
                                                };
                                            }),
                                            (t.find.ID = function (e, t) {
                                                if (
                                                    void 0 !==
                                                        t.getElementById &&
                                                    f
                                                ) {
                                                    var n = t.getElementById(e);
                                                    return n ? [n] : [];
                                                }
                                            }))
                                          : ((t.filter.ID = function (e) {
                                                var t = e.replace(G, J);
                                                return function (e) {
                                                    var n =
                                                        void 0 !==
                                                            e.getAttributeNode &&
                                                        e.getAttributeNode(
                                                            "id",
                                                        );
                                                    return n && n.value === t;
                                                };
                                            }),
                                            (t.find.ID = function (e, t) {
                                                if (
                                                    void 0 !==
                                                        t.getElementById &&
                                                    f
                                                ) {
                                                    var n,
                                                        r,
                                                        i,
                                                        o = t.getElementById(e);
                                                    if (o) {
                                                        if (
                                                            (n =
                                                                o.getAttributeNode(
                                                                    "id",
                                                                )) &&
                                                            n.value === e
                                                        )
                                                            return [o];
                                                        for (
                                                            i =
                                                                t.getElementsByName(
                                                                    e,
                                                                ),
                                                                r = 0;
                                                            (o = i[r++]);
                                                        )
                                                            if (
                                                                (n =
                                                                    o.getAttributeNode(
                                                                        "id",
                                                                    )) &&
                                                                n.value === e
                                                            )
                                                                return [o];
                                                    }
                                                    return [];
                                                }
                                            })),
                                      (t.find.TAG = function (e, t) {
                                          return void 0 !==
                                              t.getElementsByTagName
                                              ? t.getElementsByTagName(e)
                                              : t.querySelectorAll(e);
                                      }),
                                      (t.find.CLASS = function (e, t) {
                                          if (
                                              void 0 !==
                                                  t.getElementsByClassName &&
                                              f
                                          )
                                              return t.getElementsByClassName(
                                                  e,
                                              );
                                      }),
                                      (d = []),
                                      ne(function (e) {
                                          var t;
                                          ((l.appendChild(e).innerHTML =
                                              "<a id='" +
                                              g +
                                              "' href='' disabled='disabled'></a><select id='" +
                                              g +
                                              "-\r\\' disabled='disabled'><option selected=''></option></select>"),
                                              e.querySelectorAll("[selected]")
                                                  .length ||
                                                  d.push(
                                                      "\\[" +
                                                          M +
                                                          "*(?:value|" +
                                                          S +
                                                          ")",
                                                  ),
                                              e.querySelectorAll(
                                                  "[id~=" + g + "-]",
                                              ).length || d.push("~="),
                                              e.querySelectorAll(
                                                  "a#" + g + "+*",
                                              ).length || d.push(".#.+[+~]"),
                                              e.querySelectorAll(":checked")
                                                  .length || d.push(":checked"),
                                              (t =
                                                  u.createElement(
                                                      "input",
                                                  )).setAttribute(
                                                  "type",
                                                  "hidden",
                                              ),
                                              e
                                                  .appendChild(t)
                                                  .setAttribute("name", "D"),
                                              (l.appendChild(e).disabled = !0),
                                              2 !==
                                                  e.querySelectorAll(
                                                      ":disabled",
                                                  ).length &&
                                                  d.push(
                                                      ":enabled",
                                                      ":disabled",
                                                  ),
                                              (t =
                                                  u.createElement(
                                                      "input",
                                                  )).setAttribute("name", ""),
                                              e.appendChild(t),
                                              e.querySelectorAll("[name='']")
                                                  .length ||
                                                  d.push(
                                                      "\\[" +
                                                          M +
                                                          "*name" +
                                                          M +
                                                          "*=" +
                                                          M +
                                                          "*(?:''|\"\")",
                                                  ));
                                      }),
                                      v.cssHas || d.push(":has"),
                                      (d = d.length && new RegExp(d.join("|"))),
                                      (E = function (e, t) {
                                          if (e === t) return ((a = !0), 0);
                                          var n =
                                              !e.compareDocumentPosition -
                                              !t.compareDocumentPosition;
                                          return (
                                              n ||
                                              (1 &
                                                  (n =
                                                      (e.ownerDocument || e) ==
                                                      (t.ownerDocument || t)
                                                          ? e.compareDocumentPosition(
                                                                t,
                                                            )
                                                          : 1) ||
                                              (!v.sortDetached &&
                                                  t.compareDocumentPosition(
                                                      e,
                                                  ) === n)
                                                  ? e === u ||
                                                    (e.ownerDocument == P &&
                                                        K.contains(P, e))
                                                      ? -1
                                                      : t === u ||
                                                          (t.ownerDocument ==
                                                              P &&
                                                              K.contains(P, t))
                                                        ? 1
                                                        : i
                                                          ? c.call(i, e) -
                                                            c.call(i, t)
                                                          : 0
                                                  : 4 & n
                                                    ? -1
                                                    : 1)
                                          );
                                      }),
                                      u)
                                    : u;
                            }
                            for (e in ((K.matches = function (e, t) {
                                return K(e, null, null, t);
                            }),
                            (K.matchesSelector = function (e, t) {
                                if (
                                    (ue(e),
                                    f && !C[t + " "] && (!d || !d.test(t)))
                                )
                                    try {
                                        var n = h.call(e, t);
                                        if (
                                            n ||
                                            v.disconnectedMatch ||
                                            (e.document &&
                                                11 !== e.document.nodeType)
                                        )
                                            return n;
                                    } catch (e) {
                                        C(t, !0);
                                    }
                                return K(t, u, null, [e]).length > 0;
                            }),
                            (K.contains = function (e, t) {
                                return (
                                    (e.ownerDocument || e) != u && ue(e),
                                    A.contains(e, t)
                                );
                            }),
                            (K.attr = function (e, n) {
                                (e.ownerDocument || e) != u && ue(e);
                                var r = t.attrHandle[n.toLowerCase()],
                                    i =
                                        r &&
                                        p.call(t.attrHandle, n.toLowerCase())
                                            ? r(e, n, !f)
                                            : void 0;
                                return void 0 !== i ? i : e.getAttribute(n);
                            }),
                            (K.error = function (e) {
                                throw new Error(
                                    "Syntax error, unrecognized expression: " +
                                        e,
                                );
                            }),
                            (A.uniqueSort = function (e) {
                                var t,
                                    n = [],
                                    r = 0,
                                    o = 0;
                                if (
                                    ((a = !v.sortStable),
                                    (i = !v.sortStable && s.call(e, 0)),
                                    N.call(e, E),
                                    a)
                                ) {
                                    for (; (t = e[o++]); )
                                        t === e[o] && (r = n.push(o));
                                    for (; r--; ) L.call(e, n[r], 1);
                                }
                                return ((i = null), e);
                            }),
                            (A.fn.uniqueSort = function () {
                                return this.pushStack(
                                    A.uniqueSort(s.apply(this)),
                                );
                            }),
                            (t = A.expr =
                                {
                                    cacheLength: 50,
                                    createPseudo: te,
                                    match: U,
                                    attrHandle: {},
                                    find: {},
                                    relative: {
                                        ">": { dir: "parentNode", first: !0 },
                                        " ": { dir: "parentNode" },
                                        "+": {
                                            dir: "previousSibling",
                                            first: !0,
                                        },
                                        "~": { dir: "previousSibling" },
                                    },
                                    preFilter: {
                                        ATTR: function (e) {
                                            return (
                                                (e[1] = e[1].replace(G, J)),
                                                (e[3] = (
                                                    e[3] ||
                                                    e[4] ||
                                                    e[5] ||
                                                    ""
                                                ).replace(G, J)),
                                                "~=" === e[2] &&
                                                    (e[3] = " " + e[3] + " "),
                                                e.slice(0, 4)
                                            );
                                        },
                                        CHILD: function (e) {
                                            return (
                                                (e[1] = e[1].toLowerCase()),
                                                "nth" === e[1].slice(0, 3)
                                                    ? (e[3] || K.error(e[0]),
                                                      (e[4] = +(e[4]
                                                          ? e[5] + (e[6] || 1)
                                                          : 2 *
                                                            ("even" === e[3] ||
                                                                "odd" ===
                                                                    e[3]))),
                                                      (e[5] = +(
                                                          e[7] + e[8] ||
                                                          "odd" === e[3]
                                                      )))
                                                    : e[3] && K.error(e[0]),
                                                e
                                            );
                                        },
                                        PSEUDO: function (e) {
                                            var t,
                                                n = !e[6] && e[2];
                                            return U.CHILD.test(e[0])
                                                ? null
                                                : (e[3]
                                                      ? (e[2] =
                                                            e[4] || e[5] || "")
                                                      : n &&
                                                        W.test(n) &&
                                                        (t = ce(n, !0)) &&
                                                        (t =
                                                            n.indexOf(
                                                                ")",
                                                                n.length - t,
                                                            ) - n.length) &&
                                                        ((e[0] = e[0].slice(
                                                            0,
                                                            t,
                                                        )),
                                                        (e[2] = n.slice(0, t))),
                                                  e.slice(0, 3));
                                        },
                                    },
                                    filter: {
                                        TAG: function (e) {
                                            var t = e
                                                .replace(G, J)
                                                .toLowerCase();
                                            return "*" === e
                                                ? function () {
                                                      return !0;
                                                  }
                                                : function (e) {
                                                      return k(e, t);
                                                  };
                                        },
                                        CLASS: function (e) {
                                            var t = x[e + " "];
                                            return (
                                                t ||
                                                ((t = new RegExp(
                                                    "(^|" +
                                                        M +
                                                        ")" +
                                                        e +
                                                        "(" +
                                                        M +
                                                        "|$)",
                                                )) &&
                                                    x(e, function (e) {
                                                        return t.test(
                                                            ("string" ==
                                                                typeof e.className &&
                                                                e.className) ||
                                                                (void 0 !==
                                                                    e.getAttribute &&
                                                                    e.getAttribute(
                                                                        "class",
                                                                    )) ||
                                                                "",
                                                        );
                                                    }))
                                            );
                                        },
                                        ATTR: function (e, t, n) {
                                            return function (r) {
                                                var i = K.attr(r, e);
                                                return null == i
                                                    ? "!=" === t
                                                    : !t ||
                                                          ((i += ""),
                                                          "=" === t
                                                              ? i === n
                                                              : "!=" === t
                                                                ? i !== n
                                                                : "^=" === t
                                                                  ? n &&
                                                                    0 ===
                                                                        i.indexOf(
                                                                            n,
                                                                        )
                                                                  : "*=" === t
                                                                    ? n &&
                                                                      i.indexOf(
                                                                          n,
                                                                      ) > -1
                                                                    : "$=" === t
                                                                      ? n &&
                                                                        i.slice(
                                                                            -n.length,
                                                                        ) === n
                                                                      : "~=" ===
                                                                          t
                                                                        ? (
                                                                              " " +
                                                                              i.replace(
                                                                                  z,
                                                                                  " ",
                                                                              ) +
                                                                              " "
                                                                          ).indexOf(
                                                                              n,
                                                                          ) > -1
                                                                        : "|=" ===
                                                                              t &&
                                                                          (i ===
                                                                              n ||
                                                                              i.slice(
                                                                                  0,
                                                                                  n.length +
                                                                                      1,
                                                                              ) ===
                                                                                  n +
                                                                                      "-"));
                                            };
                                        },
                                        CHILD: function (e, t, n, r, i) {
                                            var o = "nth" !== e.slice(0, 3),
                                                a = "last" !== e.slice(-4),
                                                s = "of-type" === t;
                                            return 1 === r && 0 === i
                                                ? function (e) {
                                                      return !!e.parentNode;
                                                  }
                                                : function (t, n, u) {
                                                      var l,
                                                          c,
                                                          f,
                                                          d,
                                                          p,
                                                          h =
                                                              o !== a
                                                                  ? "nextSibling"
                                                                  : "previousSibling",
                                                          m = t.parentNode,
                                                          v =
                                                              s &&
                                                              t.nodeName.toLowerCase(),
                                                          b = !u && !s,
                                                          x = !1;
                                                      if (m) {
                                                          if (o) {
                                                              for (; h; ) {
                                                                  for (
                                                                      f = t;
                                                                      (f =
                                                                          f[h]);
                                                                  )
                                                                      if (
                                                                          s
                                                                              ? k(
                                                                                    f,
                                                                                    v,
                                                                                )
                                                                              : 1 ===
                                                                                f.nodeType
                                                                      )
                                                                          return !1;
                                                                  p = h =
                                                                      "only" ===
                                                                          e &&
                                                                      !p &&
                                                                      "nextSibling";
                                                              }
                                                              return !0;
                                                          }
                                                          if (
                                                              ((p = [
                                                                  a
                                                                      ? m.firstChild
                                                                      : m.lastChild,
                                                              ]),
                                                              a && b)
                                                          ) {
                                                              for (
                                                                  x =
                                                                      (d =
                                                                          (l =
                                                                              (c =
                                                                                  m[
                                                                                      g
                                                                                  ] ||
                                                                                  (m[
                                                                                      g
                                                                                  ] =
                                                                                      {}))[
                                                                                  e
                                                                              ] ||
                                                                              [])[0] ===
                                                                              y &&
                                                                          l[1]) &&
                                                                      l[2],
                                                                      f =
                                                                          d &&
                                                                          m
                                                                              .childNodes[
                                                                              d
                                                                          ];
                                                                  (f =
                                                                      (++d &&
                                                                          f &&
                                                                          f[
                                                                              h
                                                                          ]) ||
                                                                      (x = d =
                                                                          0) ||
                                                                      p.pop());
                                                              )
                                                                  if (
                                                                      1 ===
                                                                          f.nodeType &&
                                                                      ++x &&
                                                                      f === t
                                                                  ) {
                                                                      c[e] = [
                                                                          y,
                                                                          d,
                                                                          x,
                                                                      ];
                                                                      break;
                                                                  }
                                                          } else if (
                                                              (b &&
                                                                  (x = d =
                                                                      (l =
                                                                          (c =
                                                                              t[
                                                                                  g
                                                                              ] ||
                                                                              (t[
                                                                                  g
                                                                              ] =
                                                                                  {}))[
                                                                              e
                                                                          ] ||
                                                                          [])[0] ===
                                                                          y &&
                                                                      l[1]),
                                                              !1 === x)
                                                          )
                                                              for (
                                                                  ;
                                                                  (f =
                                                                      (++d &&
                                                                          f &&
                                                                          f[
                                                                              h
                                                                          ]) ||
                                                                      (x = d =
                                                                          0) ||
                                                                      p.pop()) &&
                                                                  (!(s
                                                                      ? k(f, v)
                                                                      : 1 ===
                                                                        f.nodeType) ||
                                                                      !++x ||
                                                                      (b &&
                                                                          ((c =
                                                                              f[
                                                                                  g
                                                                              ] ||
                                                                              (f[
                                                                                  g
                                                                              ] =
                                                                                  {}))[
                                                                              e
                                                                          ] = [
                                                                              y,
                                                                              x,
                                                                          ]),
                                                                      f !== t));
                                                              );
                                                          return (
                                                              (x -= i) === r ||
                                                              (x % r == 0 &&
                                                                  x / r >= 0)
                                                          );
                                                      }
                                                  };
                                        },
                                        PSEUDO: function (e, n) {
                                            var r,
                                                i =
                                                    t.pseudos[e] ||
                                                    t.setFilters[
                                                        e.toLowerCase()
                                                    ] ||
                                                    K.error(
                                                        "unsupported pseudo: " +
                                                            e,
                                                    );
                                            return i[g]
                                                ? i(n)
                                                : i.length > 1
                                                  ? ((r = [e, e, "", n]),
                                                    t.setFilters.hasOwnProperty(
                                                        e.toLowerCase(),
                                                    )
                                                        ? te(function (e, t) {
                                                              for (
                                                                  var r,
                                                                      o = i(
                                                                          e,
                                                                          n,
                                                                      ),
                                                                      a =
                                                                          o.length;
                                                                  a--;
                                                              )
                                                                  e[
                                                                      (r =
                                                                          c.call(
                                                                              e,
                                                                              o[
                                                                                  a
                                                                              ],
                                                                          ))
                                                                  ] = !(t[r] =
                                                                      o[a]);
                                                          })
                                                        : function (e) {
                                                              return i(e, 0, r);
                                                          })
                                                  : i;
                                        },
                                    },
                                    pseudos: {
                                        not: te(function (e) {
                                            var t = [],
                                                n = [],
                                                r = ge(e.replace(O, "$1"));
                                            return r[g]
                                                ? te(function (e, t, n, i) {
                                                      for (
                                                          var o,
                                                              a = r(
                                                                  e,
                                                                  null,
                                                                  i,
                                                                  [],
                                                              ),
                                                              s = e.length;
                                                          s--;
                                                      )
                                                          (o = a[s]) &&
                                                              (e[s] = !(t[s] =
                                                                  o));
                                                  })
                                                : function (e, i, o) {
                                                      return (
                                                          (t[0] = e),
                                                          r(t, null, o, n),
                                                          (t[0] = null),
                                                          !n.pop()
                                                      );
                                                  };
                                        }),
                                        has: te(function (e) {
                                            return function (t) {
                                                return K(e, t).length > 0;
                                            };
                                        }),
                                        contains: te(function (e) {
                                            return (
                                                (e = e.replace(G, J)),
                                                function (t) {
                                                    return (
                                                        (
                                                            t.textContent ||
                                                            A.text(t)
                                                        ).indexOf(e) > -1
                                                    );
                                                }
                                            );
                                        }),
                                        lang: te(function (e) {
                                            return (
                                                _.test(e || "") ||
                                                    K.error(
                                                        "unsupported lang: " +
                                                            e,
                                                    ),
                                                (e = e
                                                    .replace(G, J)
                                                    .toLowerCase()),
                                                function (t) {
                                                    var n;
                                                    do {
                                                        if (
                                                            (n = f
                                                                ? t.lang
                                                                : t.getAttribute(
                                                                      "xml:lang",
                                                                  ) ||
                                                                  t.getAttribute(
                                                                      "lang",
                                                                  ))
                                                        )
                                                            return (
                                                                (n =
                                                                    n.toLowerCase()) ===
                                                                    e ||
                                                                0 ===
                                                                    n.indexOf(
                                                                        e + "-",
                                                                    )
                                                            );
                                                    } while (
                                                        (t = t.parentNode) &&
                                                        1 === t.nodeType
                                                    );
                                                    return !1;
                                                }
                                            );
                                        }),
                                        target: function (e) {
                                            var t =
                                                r.location && r.location.hash;
                                            return t && t.slice(1) === e.id;
                                        },
                                        root: function (e) {
                                            return e === l;
                                        },
                                        focus: function (e) {
                                            return (
                                                e ===
                                                    (function () {
                                                        try {
                                                            return u.activeElement;
                                                        } catch (e) {}
                                                    })() &&
                                                u.hasFocus() &&
                                                !!(
                                                    e.type ||
                                                    e.href ||
                                                    ~e.tabIndex
                                                )
                                            );
                                        },
                                        enabled: oe(!1),
                                        disabled: oe(!0),
                                        checked: function (e) {
                                            return (
                                                (k(e, "input") &&
                                                    !!e.checked) ||
                                                (k(e, "option") && !!e.selected)
                                            );
                                        },
                                        selected: function (e) {
                                            return (
                                                e.parentNode &&
                                                    e.parentNode.selectedIndex,
                                                !0 === e.selected
                                            );
                                        },
                                        empty: function (e) {
                                            for (
                                                e = e.firstChild;
                                                e;
                                                e = e.nextSibling
                                            )
                                                if (e.nodeType < 6) return !1;
                                            return !0;
                                        },
                                        parent: function (e) {
                                            return !t.pseudos.empty(e);
                                        },
                                        header: function (e) {
                                            return V.test(e.nodeName);
                                        },
                                        input: function (e) {
                                            return $.test(e.nodeName);
                                        },
                                        button: function (e) {
                                            return (
                                                (k(e, "input") &&
                                                    "button" === e.type) ||
                                                k(e, "button")
                                            );
                                        },
                                        text: function (e) {
                                            var t;
                                            return (
                                                k(e, "input") &&
                                                "text" === e.type &&
                                                (null ==
                                                    (t =
                                                        e.getAttribute(
                                                            "type",
                                                        )) ||
                                                    "text" === t.toLowerCase())
                                            );
                                        },
                                        first: ae(function () {
                                            return [0];
                                        }),
                                        last: ae(function (e, t) {
                                            return [t - 1];
                                        }),
                                        eq: ae(function (e, t, n) {
                                            return [n < 0 ? n + t : n];
                                        }),
                                        even: ae(function (e, t) {
                                            for (var n = 0; n < t; n += 2)
                                                e.push(n);
                                            return e;
                                        }),
                                        odd: ae(function (e, t) {
                                            for (var n = 1; n < t; n += 2)
                                                e.push(n);
                                            return e;
                                        }),
                                        lt: ae(function (e, t, n) {
                                            var r;
                                            for (
                                                r =
                                                    n < 0
                                                        ? n + t
                                                        : n > t
                                                          ? t
                                                          : n;
                                                --r >= 0;
                                            )
                                                e.push(r);
                                            return e;
                                        }),
                                        gt: ae(function (e, t, n) {
                                            for (
                                                var r = n < 0 ? n + t : n;
                                                ++r < t;
                                            )
                                                e.push(r);
                                            return e;
                                        }),
                                    },
                                }),
                            (t.pseudos.nth = t.pseudos.eq),
                            {
                                radio: !0,
                                checkbox: !0,
                                file: !0,
                                password: !0,
                                image: !0,
                            }))
                                t.pseudos[e] = re(e);
                            for (e in { submit: !0, reset: !0 })
                                t.pseudos[e] = ie(e);
                            function le() {}
                            function ce(e, n) {
                                var r,
                                    i,
                                    o,
                                    a,
                                    s,
                                    u,
                                    l,
                                    c = w[e + " "];
                                if (c) return n ? 0 : c.slice(0);
                                for (s = e, u = [], l = t.preFilter; s; ) {
                                    for (a in ((r && !(i = q.exec(s))) ||
                                        (i && (s = s.slice(i[0].length) || s),
                                        u.push((o = []))),
                                    (r = !1),
                                    (i = R.exec(s)) &&
                                        ((r = i.shift()),
                                        o.push({
                                            value: r,
                                            type: i[0].replace(O, " "),
                                        }),
                                        (s = s.slice(r.length))),
                                    t.filter))
                                        !(i = U[a].exec(s)) ||
                                            (l[a] && !(i = l[a](i))) ||
                                            ((r = i.shift()),
                                            o.push({
                                                value: r,
                                                type: a,
                                                matches: i,
                                            }),
                                            (s = s.slice(r.length)));
                                    if (!r) break;
                                }
                                return n
                                    ? s.length
                                    : s
                                      ? K.error(e)
                                      : w(e, u).slice(0);
                            }
                            function fe(e) {
                                for (
                                    var t = 0, n = e.length, r = "";
                                    t < n;
                                    t++
                                )
                                    r += e[t].value;
                                return r;
                            }
                            function de(e, t, n) {
                                var r = t.dir,
                                    i = t.next,
                                    o = i || r,
                                    a = n && "parentNode" === o,
                                    s = b++;
                                return t.first
                                    ? function (t, n, i) {
                                          for (; (t = t[r]); )
                                              if (1 === t.nodeType || a)
                                                  return e(t, n, i);
                                          return !1;
                                      }
                                    : function (t, n, u) {
                                          var l,
                                              c,
                                              f = [y, s];
                                          if (u) {
                                              for (; (t = t[r]); )
                                                  if (
                                                      (1 === t.nodeType || a) &&
                                                      e(t, n, u)
                                                  )
                                                      return !0;
                                          } else
                                              for (; (t = t[r]); )
                                                  if (1 === t.nodeType || a)
                                                      if (
                                                          ((c =
                                                              t[g] ||
                                                              (t[g] = {})),
                                                          i && k(t, i))
                                                      )
                                                          t = t[r] || t;
                                                      else {
                                                          if (
                                                              (l = c[o]) &&
                                                              l[0] === y &&
                                                              l[1] === s
                                                          )
                                                              return (f[2] =
                                                                  l[2]);
                                                          if (
                                                              ((c[o] = f),
                                                              (f[2] = e(
                                                                  t,
                                                                  n,
                                                                  u,
                                                              )))
                                                          )
                                                              return !0;
                                                      }
                                          return !1;
                                      };
                            }
                            function pe(e) {
                                return e.length > 1
                                    ? function (t, n, r) {
                                          for (var i = e.length; i--; )
                                              if (!e[i](t, n, r)) return !1;
                                          return !0;
                                      }
                                    : e[0];
                            }
                            function he(e, t, n, r, i) {
                                for (
                                    var o,
                                        a = [],
                                        s = 0,
                                        u = e.length,
                                        l = null != t;
                                    s < u;
                                    s++
                                )
                                    (o = e[s]) &&
                                        ((n && !n(o, r, i)) ||
                                            (a.push(o), l && t.push(s)));
                                return a;
                            }
                            function me(e, t, n, r, i, o) {
                                return (
                                    r && !r[g] && (r = me(r)),
                                    i && !i[g] && (i = me(i, o)),
                                    te(function (o, a, s, u) {
                                        var l,
                                            f,
                                            d,
                                            p,
                                            h = [],
                                            v = [],
                                            g = a.length,
                                            y =
                                                o ||
                                                (function (e, t, n) {
                                                    for (
                                                        var r = 0, i = t.length;
                                                        r < i;
                                                        r++
                                                    )
                                                        K(e, t[r], n);
                                                    return n;
                                                })(
                                                    t || "*",
                                                    s.nodeType ? [s] : s,
                                                    [],
                                                ),
                                            b =
                                                !e || (!o && t)
                                                    ? y
                                                    : he(y, h, e, s, u);
                                        if (
                                            (n
                                                ? n(
                                                      b,
                                                      (p =
                                                          i || (o ? e : g || r)
                                                              ? []
                                                              : a),
                                                      s,
                                                      u,
                                                  )
                                                : (p = b),
                                            r)
                                        )
                                            for (
                                                l = he(p, v),
                                                    r(l, [], s, u),
                                                    f = l.length;
                                                f--;
                                            )
                                                (d = l[f]) &&
                                                    (p[v[f]] = !(b[v[f]] = d));
                                        if (o) {
                                            if (i || e) {
                                                if (i) {
                                                    for (
                                                        l = [], f = p.length;
                                                        f--;
                                                    )
                                                        (d = p[f]) &&
                                                            l.push((b[f] = d));
                                                    i(null, (p = []), l, u);
                                                }
                                                for (f = p.length; f--; )
                                                    (d = p[f]) &&
                                                        (l = i
                                                            ? c.call(o, d)
                                                            : h[f]) > -1 &&
                                                        (o[l] = !(a[l] = d));
                                            }
                                        } else
                                            ((p = he(
                                                p === a
                                                    ? p.splice(g, p.length)
                                                    : p,
                                            )),
                                                i
                                                    ? i(null, a, p, u)
                                                    : m.apply(a, p));
                                    })
                                );
                            }
                            function ve(e) {
                                for (
                                    var r,
                                        i,
                                        o,
                                        a = e.length,
                                        s = t.relative[e[0].type],
                                        u = s || t.relative[" "],
                                        l = s ? 1 : 0,
                                        f = de(
                                            function (e) {
                                                return e === r;
                                            },
                                            u,
                                            !0,
                                        ),
                                        d = de(
                                            function (e) {
                                                return c.call(r, e) > -1;
                                            },
                                            u,
                                            !0,
                                        ),
                                        p = [
                                            function (e, t, i) {
                                                var o =
                                                    (!s && (i || t != n)) ||
                                                    ((r = t).nodeType
                                                        ? f(e, t, i)
                                                        : d(e, t, i));
                                                return ((r = null), o);
                                            },
                                        ];
                                    l < a;
                                    l++
                                )
                                    if ((i = t.relative[e[l].type]))
                                        p = [de(pe(p), i)];
                                    else {
                                        if (
                                            (i = t.filter[e[l].type].apply(
                                                null,
                                                e[l].matches,
                                            ))[g]
                                        ) {
                                            for (
                                                o = ++l;
                                                o < a && !t.relative[e[o].type];
                                                o++
                                            );
                                            return me(
                                                l > 1 && pe(p),
                                                l > 1 &&
                                                    fe(
                                                        e
                                                            .slice(0, l - 1)
                                                            .concat({
                                                                value:
                                                                    " " ===
                                                                    e[l - 2]
                                                                        .type
                                                                        ? "*"
                                                                        : "",
                                                            }),
                                                    ).replace(O, "$1"),
                                                i,
                                                l < o && ve(e.slice(l, o)),
                                                o < a && ve((e = e.slice(o))),
                                                o < a && fe(e),
                                            );
                                        }
                                        p.push(i);
                                    }
                                return pe(p);
                            }
                            function ge(e, r) {
                                var i,
                                    o = [],
                                    a = [],
                                    s = T[e + " "];
                                if (!s) {
                                    for (r || (r = ce(e)), i = r.length; i--; )
                                        (s = ve(r[i]))[g]
                                            ? o.push(s)
                                            : a.push(s);
                                    ((s = T(
                                        e,
                                        (function (e, r) {
                                            var i = r.length > 0,
                                                o = e.length > 0,
                                                a = function (a, s, l, c, d) {
                                                    var p,
                                                        h,
                                                        v,
                                                        g = 0,
                                                        b = "0",
                                                        x = a && [],
                                                        w = [],
                                                        T = n,
                                                        C =
                                                            a ||
                                                            (o &&
                                                                t.find.TAG(
                                                                    "*",
                                                                    d,
                                                                )),
                                                        E = (y +=
                                                            null == T
                                                                ? 1
                                                                : Math.random() ||
                                                                  0.1),
                                                        S = C.length;
                                                    for (
                                                        d &&
                                                        (n = s == u || s || d);
                                                        b !== S &&
                                                        null != (p = C[b]);
                                                        b++
                                                    ) {
                                                        if (o && p) {
                                                            for (
                                                                h = 0,
                                                                    s ||
                                                                        p.ownerDocument ==
                                                                            u ||
                                                                        (ue(p),
                                                                        (l =
                                                                            !f));
                                                                (v = e[h++]);
                                                            )
                                                                if (
                                                                    v(
                                                                        p,
                                                                        s || u,
                                                                        l,
                                                                    )
                                                                ) {
                                                                    m.call(
                                                                        c,
                                                                        p,
                                                                    );
                                                                    break;
                                                                }
                                                            d && (y = E);
                                                        }
                                                        i &&
                                                            ((p = !v && p) &&
                                                                g--,
                                                            a && x.push(p));
                                                    }
                                                    if (
                                                        ((g += b), i && b !== g)
                                                    ) {
                                                        for (
                                                            h = 0;
                                                            (v = r[h++]);
                                                        )
                                                            v(x, w, s, l);
                                                        if (a) {
                                                            if (g > 0)
                                                                for (; b--; )
                                                                    x[b] ||
                                                                        w[b] ||
                                                                        (w[b] =
                                                                            D.call(
                                                                                c,
                                                                            ));
                                                            w = he(w);
                                                        }
                                                        (m.apply(c, w),
                                                            d &&
                                                                !a &&
                                                                w.length > 0 &&
                                                                g + r.length >
                                                                    1 &&
                                                                A.uniqueSort(
                                                                    c,
                                                                ));
                                                    }
                                                    return (
                                                        d && ((y = E), (n = T)),
                                                        x
                                                    );
                                                };
                                            return i ? te(a) : a;
                                        })(a, o),
                                    )),
                                        (s.selector = e));
                                }
                                return s;
                            }
                            function ye(e, n, r, i) {
                                var o,
                                    a,
                                    s,
                                    u,
                                    l,
                                    c = "function" == typeof e && e,
                                    d = !i && ce((e = c.selector || e));
                                if (((r = r || []), 1 === d.length)) {
                                    if (
                                        (a = d[0] = d[0].slice(0)).length > 2 &&
                                        "ID" === (s = a[0]).type &&
                                        9 === n.nodeType &&
                                        f &&
                                        t.relative[a[1].type]
                                    ) {
                                        if (
                                            !(n = (t.find.ID(
                                                s.matches[0].replace(G, J),
                                                n,
                                            ) || [])[0])
                                        )
                                            return r;
                                        (c && (n = n.parentNode),
                                            (e = e.slice(
                                                a.shift().value.length,
                                            )));
                                    }
                                    for (
                                        o = U.needsContext.test(e)
                                            ? 0
                                            : a.length;
                                        o-- &&
                                        ((s = a[o]), !t.relative[(u = s.type)]);
                                    )
                                        if (
                                            (l = t.find[u]) &&
                                            (i = l(
                                                s.matches[0].replace(G, J),
                                                (X.test(a[0].type) &&
                                                    se(n.parentNode)) ||
                                                    n,
                                            ))
                                        ) {
                                            if (
                                                (a.splice(o, 1),
                                                !(e = i.length && fe(a)))
                                            )
                                                return (m.apply(r, i), r);
                                            break;
                                        }
                                }
                                return (
                                    (c || ge(e, d))(
                                        i,
                                        n,
                                        !f,
                                        r,
                                        !n ||
                                            (X.test(e) && se(n.parentNode)) ||
                                            n,
                                    ),
                                    r
                                );
                            }
                            ((le.prototype = t.filters = t.pseudos),
                                (t.setFilters = new le()),
                                (v.sortStable =
                                    g.split("").sort(E).join("") === g),
                                ue(),
                                (v.sortDetached = ne(function (e) {
                                    return (
                                        1 &
                                        e.compareDocumentPosition(
                                            u.createElement("fieldset"),
                                        )
                                    );
                                })),
                                (A.find = K),
                                (A.expr[":"] = A.expr.pseudos),
                                (A.unique = A.uniqueSort),
                                (K.compile = ge),
                                (K.select = ye),
                                (K.setDocument = ue),
                                (K.tokenize = ce),
                                (K.escape = A.escapeSelector),
                                (K.getText = A.text),
                                (K.isXML = A.isXMLDoc),
                                (K.selectors = A.expr),
                                (K.support = A.support),
                                (K.uniqueSort = A.uniqueSort));
                        })();
                        var I = function (e, t, n) {
                                for (
                                    var r = [], i = void 0 !== n;
                                    (e = e[t]) && 9 !== e.nodeType;
                                )
                                    if (1 === e.nodeType) {
                                        if (i && A(e).is(n)) break;
                                        r.push(e);
                                    }
                                return r;
                            },
                            z = function (e, t) {
                                for (var n = []; e; e = e.nextSibling)
                                    1 === e.nodeType && e !== t && n.push(e);
                                return n;
                            },
                            q = A.expr.match.needsContext,
                            R =
                                /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;
                        function F(e, t, n) {
                            return g(t)
                                ? A.grep(e, function (e, r) {
                                      return !!t.call(e, r, e) !== n;
                                  })
                                : t.nodeType
                                  ? A.grep(e, function (e) {
                                        return (e === t) !== n;
                                    })
                                  : "string" != typeof t
                                    ? A.grep(e, function (e) {
                                          return c.call(t, e) > -1 !== n;
                                      })
                                    : A.filter(t, e, n);
                        }
                        ((A.filter = function (e, t, n) {
                            var r = t[0];
                            return (
                                n && (e = ":not(" + e + ")"),
                                1 === t.length && 1 === r.nodeType
                                    ? A.find.matchesSelector(r, e)
                                        ? [r]
                                        : []
                                    : A.find.matches(
                                          e,
                                          A.grep(t, function (e) {
                                              return 1 === e.nodeType;
                                          }),
                                      )
                            );
                        }),
                            A.fn.extend({
                                find: function (e) {
                                    var t,
                                        n,
                                        r = this.length,
                                        i = this;
                                    if ("string" != typeof e)
                                        return this.pushStack(
                                            A(e).filter(function () {
                                                for (t = 0; t < r; t++)
                                                    if (A.contains(i[t], this))
                                                        return !0;
                                            }),
                                        );
                                    for (
                                        n = this.pushStack([]), t = 0;
                                        t < r;
                                        t++
                                    )
                                        A.find(e, i[t], n);
                                    return r > 1 ? A.uniqueSort(n) : n;
                                },
                                filter: function (e) {
                                    return this.pushStack(F(this, e || [], !1));
                                },
                                not: function (e) {
                                    return this.pushStack(F(this, e || [], !0));
                                },
                                is: function (e) {
                                    return !!F(
                                        this,
                                        "string" == typeof e && q.test(e)
                                            ? A(e)
                                            : e || [],
                                        !1,
                                    ).length;
                                },
                            }));
                        var W,
                            _ = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;
                        (((A.fn.init = function (e, t, n) {
                            var r, i;
                            if (!e) return this;
                            if (((n = n || W), "string" == typeof e)) {
                                if (
                                    !(r =
                                        "<" === e[0] &&
                                        ">" === e[e.length - 1] &&
                                        e.length >= 3
                                            ? [null, e, null]
                                            : _.exec(e)) ||
                                    (!r[1] && t)
                                )
                                    return !t || t.jquery
                                        ? (t || n).find(e)
                                        : this.constructor(t).find(e);
                                if (r[1]) {
                                    if (
                                        ((t = t instanceof A ? t[0] : t),
                                        A.merge(
                                            this,
                                            A.parseHTML(
                                                r[1],
                                                t && t.nodeType
                                                    ? t.ownerDocument || t
                                                    : b,
                                                !0,
                                            ),
                                        ),
                                        R.test(r[1]) && A.isPlainObject(t))
                                    )
                                        for (r in t)
                                            g(this[r])
                                                ? this[r](t[r])
                                                : this.attr(r, t[r]);
                                    return this;
                                }
                                return (
                                    (i = b.getElementById(r[2])) &&
                                        ((this[0] = i), (this.length = 1)),
                                    this
                                );
                            }
                            return e.nodeType
                                ? ((this[0] = e), (this.length = 1), this)
                                : g(e)
                                  ? void 0 !== n.ready
                                      ? n.ready(e)
                                      : e(A)
                                  : A.makeArray(e, this);
                        }).prototype = A.fn),
                            (W = A(b)));
                        var U = /^(?:parents|prev(?:Until|All))/,
                            $ = {
                                children: !0,
                                contents: !0,
                                next: !0,
                                prev: !0,
                            };
                        function V(e, t) {
                            for (; (e = e[t]) && 1 !== e.nodeType; );
                            return e;
                        }
                        (A.fn.extend({
                            has: function (e) {
                                var t = A(e, this),
                                    n = t.length;
                                return this.filter(function () {
                                    for (var e = 0; e < n; e++)
                                        if (A.contains(this, t[e])) return !0;
                                });
                            },
                            closest: function (e, t) {
                                var n,
                                    r = 0,
                                    i = this.length,
                                    o = [],
                                    a = "string" != typeof e && A(e);
                                if (!q.test(e))
                                    for (; r < i; r++)
                                        for (
                                            n = this[r];
                                            n && n !== t;
                                            n = n.parentNode
                                        )
                                            if (
                                                n.nodeType < 11 &&
                                                (a
                                                    ? a.index(n) > -1
                                                    : 1 === n.nodeType &&
                                                      A.find.matchesSelector(
                                                          n,
                                                          e,
                                                      ))
                                            ) {
                                                o.push(n);
                                                break;
                                            }
                                return this.pushStack(
                                    o.length > 1 ? A.uniqueSort(o) : o,
                                );
                            },
                            index: function (e) {
                                return e
                                    ? "string" == typeof e
                                        ? c.call(A(e), this[0])
                                        : c.call(this, e.jquery ? e[0] : e)
                                    : this[0] && this[0].parentNode
                                      ? this.first().prevAll().length
                                      : -1;
                            },
                            add: function (e, t) {
                                return this.pushStack(
                                    A.uniqueSort(A.merge(this.get(), A(e, t))),
                                );
                            },
                            addBack: function (e) {
                                return this.add(
                                    null == e
                                        ? this.prevObject
                                        : this.prevObject.filter(e),
                                );
                            },
                        }),
                            A.each(
                                {
                                    parent: function (e) {
                                        var t = e.parentNode;
                                        return t && 11 !== t.nodeType
                                            ? t
                                            : null;
                                    },
                                    parents: function (e) {
                                        return I(e, "parentNode");
                                    },
                                    parentsUntil: function (e, t, n) {
                                        return I(e, "parentNode", n);
                                    },
                                    next: function (e) {
                                        return V(e, "nextSibling");
                                    },
                                    prev: function (e) {
                                        return V(e, "previousSibling");
                                    },
                                    nextAll: function (e) {
                                        return I(e, "nextSibling");
                                    },
                                    prevAll: function (e) {
                                        return I(e, "previousSibling");
                                    },
                                    nextUntil: function (e, t, n) {
                                        return I(e, "nextSibling", n);
                                    },
                                    prevUntil: function (e, t, n) {
                                        return I(e, "previousSibling", n);
                                    },
                                    siblings: function (e) {
                                        return z(
                                            (e.parentNode || {}).firstChild,
                                            e,
                                        );
                                    },
                                    children: function (e) {
                                        return z(e.firstChild);
                                    },
                                    contents: function (e) {
                                        return null != e.contentDocument &&
                                            a(e.contentDocument)
                                            ? e.contentDocument
                                            : (k(e, "template") &&
                                                  (e = e.content || e),
                                              A.merge([], e.childNodes));
                                    },
                                },
                                function (e, t) {
                                    A.fn[e] = function (n, r) {
                                        var i = A.map(this, t, n);
                                        return (
                                            "Until" !== e.slice(-5) && (r = n),
                                            r &&
                                                "string" == typeof r &&
                                                (i = A.filter(r, i)),
                                            this.length > 1 &&
                                                ($[e] || A.uniqueSort(i),
                                                U.test(e) && i.reverse()),
                                            this.pushStack(i)
                                        );
                                    };
                                },
                            ));
                        var Y = /[^\x20\t\r\n\f]+/g;
                        function X(e) {
                            return e;
                        }
                        function G(e) {
                            throw e;
                        }
                        function J(e, t, n, r) {
                            var i;
                            try {
                                e && g((i = e.promise))
                                    ? i.call(e).done(t).fail(n)
                                    : e && g((i = e.then))
                                      ? i.call(e, t, n)
                                      : t.apply(void 0, [e].slice(r));
                            } catch (e) {
                                n.apply(void 0, [e]);
                            }
                        }
                        ((A.Callbacks = function (e) {
                            e =
                                "string" == typeof e
                                    ? (function (e) {
                                          var t = {};
                                          return (
                                              A.each(
                                                  e.match(Y) || [],
                                                  function (e, n) {
                                                      t[n] = !0;
                                                  },
                                              ),
                                              t
                                          );
                                      })(e)
                                    : A.extend({}, e);
                            var t,
                                n,
                                r,
                                i,
                                o = [],
                                a = [],
                                s = -1,
                                u = function () {
                                    for (
                                        i = i || e.once, r = t = !0;
                                        a.length;
                                        s = -1
                                    )
                                        for (n = a.shift(); ++s < o.length; )
                                            !1 === o[s].apply(n[0], n[1]) &&
                                                e.stopOnFalse &&
                                                ((s = o.length), (n = !1));
                                    (e.memory || (n = !1),
                                        (t = !1),
                                        i && (o = n ? [] : ""));
                                },
                                l = {
                                    add: function () {
                                        return (
                                            o &&
                                                (n &&
                                                    !t &&
                                                    ((s = o.length - 1),
                                                    a.push(n)),
                                                (function t(n) {
                                                    A.each(n, function (n, r) {
                                                        g(r)
                                                            ? (e.unique &&
                                                                  l.has(r)) ||
                                                              o.push(r)
                                                            : r &&
                                                              r.length &&
                                                              "string" !==
                                                                  T(r) &&
                                                              t(r);
                                                    });
                                                })(arguments),
                                                n && !t && u()),
                                            this
                                        );
                                    },
                                    remove: function () {
                                        return (
                                            A.each(arguments, function (e, t) {
                                                for (
                                                    var n;
                                                    (n = A.inArray(t, o, n)) >
                                                    -1;
                                                )
                                                    (o.splice(n, 1),
                                                        n <= s && s--);
                                            }),
                                            this
                                        );
                                    },
                                    has: function (e) {
                                        return e
                                            ? A.inArray(e, o) > -1
                                            : o.length > 0;
                                    },
                                    empty: function () {
                                        return (o && (o = []), this);
                                    },
                                    disable: function () {
                                        return (
                                            (i = a = []),
                                            (o = n = ""),
                                            this
                                        );
                                    },
                                    disabled: function () {
                                        return !o;
                                    },
                                    lock: function () {
                                        return (
                                            (i = a = []),
                                            n || t || (o = n = ""),
                                            this
                                        );
                                    },
                                    locked: function () {
                                        return !!i;
                                    },
                                    fireWith: function (e, n) {
                                        return (
                                            i ||
                                                ((n = [
                                                    e,
                                                    (n = n || []).slice
                                                        ? n.slice()
                                                        : n,
                                                ]),
                                                a.push(n),
                                                t || u()),
                                            this
                                        );
                                    },
                                    fire: function () {
                                        return (
                                            l.fireWith(this, arguments),
                                            this
                                        );
                                    },
                                    fired: function () {
                                        return !!r;
                                    },
                                };
                            return l;
                        }),
                            A.extend({
                                Deferred: function (e) {
                                    var t = [
                                            [
                                                "notify",
                                                "progress",
                                                A.Callbacks("memory"),
                                                A.Callbacks("memory"),
                                                2,
                                            ],
                                            [
                                                "resolve",
                                                "done",
                                                A.Callbacks("once memory"),
                                                A.Callbacks("once memory"),
                                                0,
                                                "resolved",
                                            ],
                                            [
                                                "reject",
                                                "fail",
                                                A.Callbacks("once memory"),
                                                A.Callbacks("once memory"),
                                                1,
                                                "rejected",
                                            ],
                                        ],
                                        n = "pending",
                                        i = {
                                            state: function () {
                                                return n;
                                            },
                                            always: function () {
                                                return (
                                                    o
                                                        .done(arguments)
                                                        .fail(arguments),
                                                    this
                                                );
                                            },
                                            catch: function (e) {
                                                return i.then(null, e);
                                            },
                                            pipe: function () {
                                                var e = arguments;
                                                return A.Deferred(function (n) {
                                                    (A.each(t, function (t, r) {
                                                        var i =
                                                            g(e[r[4]]) &&
                                                            e[r[4]];
                                                        o[r[1]](function () {
                                                            var e =
                                                                i &&
                                                                i.apply(
                                                                    this,
                                                                    arguments,
                                                                );
                                                            e && g(e.promise)
                                                                ? e
                                                                      .promise()
                                                                      .progress(
                                                                          n.notify,
                                                                      )
                                                                      .done(
                                                                          n.resolve,
                                                                      )
                                                                      .fail(
                                                                          n.reject,
                                                                      )
                                                                : n[
                                                                      r[0] +
                                                                          "With"
                                                                  ](
                                                                      this,
                                                                      i
                                                                          ? [e]
                                                                          : arguments,
                                                                  );
                                                        });
                                                    }),
                                                        (e = null));
                                                }).promise();
                                            },
                                            then: function (e, n, i) {
                                                var o = 0;
                                                function a(e, t, n, i) {
                                                    return function () {
                                                        var s = this,
                                                            u = arguments,
                                                            l = function () {
                                                                var r, l;
                                                                if (!(e < o)) {
                                                                    if (
                                                                        (r =
                                                                            n.apply(
                                                                                s,
                                                                                u,
                                                                            )) ===
                                                                        t.promise()
                                                                    )
                                                                        throw new TypeError(
                                                                            "Thenable self-resolution",
                                                                        );
                                                                    ((l =
                                                                        r &&
                                                                        ("object" ==
                                                                            typeof r ||
                                                                            "function" ==
                                                                                typeof r) &&
                                                                        r.then),
                                                                        g(l)
                                                                            ? i
                                                                                ? l.call(
                                                                                      r,
                                                                                      a(
                                                                                          o,
                                                                                          t,
                                                                                          X,
                                                                                          i,
                                                                                      ),
                                                                                      a(
                                                                                          o,
                                                                                          t,
                                                                                          G,
                                                                                          i,
                                                                                      ),
                                                                                  )
                                                                                : (o++,
                                                                                  l.call(
                                                                                      r,
                                                                                      a(
                                                                                          o,
                                                                                          t,
                                                                                          X,
                                                                                          i,
                                                                                      ),
                                                                                      a(
                                                                                          o,
                                                                                          t,
                                                                                          G,
                                                                                          i,
                                                                                      ),
                                                                                      a(
                                                                                          o,
                                                                                          t,
                                                                                          X,
                                                                                          t.notifyWith,
                                                                                      ),
                                                                                  ))
                                                                            : (n !==
                                                                                  X &&
                                                                                  ((s =
                                                                                      void 0),
                                                                                  (u =
                                                                                      [
                                                                                          r,
                                                                                      ])),
                                                                              (
                                                                                  i ||
                                                                                  t.resolveWith
                                                                              )(
                                                                                  s,
                                                                                  u,
                                                                              )));
                                                                }
                                                            },
                                                            c = i
                                                                ? l
                                                                : function () {
                                                                      try {
                                                                          l();
                                                                      } catch (r) {
                                                                          (A
                                                                              .Deferred
                                                                              .exceptionHook &&
                                                                              A.Deferred.exceptionHook(
                                                                                  r,
                                                                                  c.error,
                                                                              ),
                                                                              e +
                                                                                  1 >=
                                                                                  o &&
                                                                                  (n !==
                                                                                      G &&
                                                                                      ((s =
                                                                                          void 0),
                                                                                      (u =
                                                                                          [
                                                                                              r,
                                                                                          ])),
                                                                                  t.rejectWith(
                                                                                      s,
                                                                                      u,
                                                                                  )));
                                                                      }
                                                                  };
                                                        e
                                                            ? c()
                                                            : (A.Deferred
                                                                  .getErrorHook
                                                                  ? (c.error =
                                                                        A.Deferred.getErrorHook())
                                                                  : A.Deferred
                                                                        .getStackHook &&
                                                                    (c.error =
                                                                        A.Deferred.getStackHook()),
                                                              r.setTimeout(c));
                                                    };
                                                }
                                                return A.Deferred(function (r) {
                                                    (t[0][3].add(
                                                        a(
                                                            0,
                                                            r,
                                                            g(i) ? i : X,
                                                            r.notifyWith,
                                                        ),
                                                    ),
                                                        t[1][3].add(
                                                            a(
                                                                0,
                                                                r,
                                                                g(e) ? e : X,
                                                            ),
                                                        ),
                                                        t[2][3].add(
                                                            a(
                                                                0,
                                                                r,
                                                                g(n) ? n : G,
                                                            ),
                                                        ));
                                                }).promise();
                                            },
                                            promise: function (e) {
                                                return null != e
                                                    ? A.extend(e, i)
                                                    : i;
                                            },
                                        },
                                        o = {};
                                    return (
                                        A.each(t, function (e, r) {
                                            var a = r[2],
                                                s = r[5];
                                            ((i[r[1]] = a.add),
                                                s &&
                                                    a.add(
                                                        function () {
                                                            n = s;
                                                        },
                                                        t[3 - e][2].disable,
                                                        t[3 - e][3].disable,
                                                        t[0][2].lock,
                                                        t[0][3].lock,
                                                    ),
                                                a.add(r[3].fire),
                                                (o[r[0]] = function () {
                                                    return (
                                                        o[r[0] + "With"](
                                                            this === o
                                                                ? void 0
                                                                : this,
                                                            arguments,
                                                        ),
                                                        this
                                                    );
                                                }),
                                                (o[r[0] + "With"] =
                                                    a.fireWith));
                                        }),
                                        i.promise(o),
                                        e && e.call(o, o),
                                        o
                                    );
                                },
                                when: function (e) {
                                    var t = arguments.length,
                                        n = t,
                                        r = Array(n),
                                        i = s.call(arguments),
                                        o = A.Deferred(),
                                        a = function (e) {
                                            return function (n) {
                                                ((r[e] = this),
                                                    (i[e] =
                                                        arguments.length > 1
                                                            ? s.call(arguments)
                                                            : n),
                                                    --t || o.resolveWith(r, i));
                                            };
                                        };
                                    if (
                                        t <= 1 &&
                                        (J(
                                            e,
                                            o.done(a(n)).resolve,
                                            o.reject,
                                            !t,
                                        ),
                                        "pending" === o.state() ||
                                            g(i[n] && i[n].then))
                                    )
                                        return o.then();
                                    for (; n--; ) J(i[n], a(n), o.reject);
                                    return o.promise();
                                },
                            }));
                        var Q =
                            /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
                        ((A.Deferred.exceptionHook = function (e, t) {
                            r.console &&
                                r.console.warn &&
                                e &&
                                Q.test(e.name) &&
                                r.console.warn(
                                    "jQuery.Deferred exception: " + e.message,
                                    e.stack,
                                    t,
                                );
                        }),
                            (A.readyException = function (e) {
                                r.setTimeout(function () {
                                    throw e;
                                });
                            }));
                        var Z = A.Deferred();
                        function K() {
                            (b.removeEventListener("DOMContentLoaded", K),
                                r.removeEventListener("load", K),
                                A.ready());
                        }
                        ((A.fn.ready = function (e) {
                            return (
                                Z.then(e).catch(function (e) {
                                    A.readyException(e);
                                }),
                                this
                            );
                        }),
                            A.extend({
                                isReady: !1,
                                readyWait: 1,
                                ready: function (e) {
                                    (!0 === e ? --A.readyWait : A.isReady) ||
                                        ((A.isReady = !0),
                                        (!0 !== e && --A.readyWait > 0) ||
                                            Z.resolveWith(b, [A]));
                                },
                            }),
                            (A.ready.then = Z.then),
                            "complete" === b.readyState ||
                            ("loading" !== b.readyState &&
                                !b.documentElement.doScroll)
                                ? r.setTimeout(A.ready)
                                : (b.addEventListener("DOMContentLoaded", K),
                                  r.addEventListener("load", K)));
                        var ee = function (e, t, n, r, i, o, a) {
                                var s = 0,
                                    u = e.length,
                                    l = null == n;
                                if ("object" === T(n))
                                    for (s in ((i = !0), n))
                                        ee(e, t, s, n[s], !0, o, a);
                                else if (
                                    void 0 !== r &&
                                    ((i = !0),
                                    g(r) || (a = !0),
                                    l &&
                                        (a
                                            ? (t.call(e, r), (t = null))
                                            : ((l = t),
                                              (t = function (e, t, n) {
                                                  return l.call(A(e), n);
                                              }))),
                                    t)
                                )
                                    for (; s < u; s++)
                                        t(
                                            e[s],
                                            n,
                                            a ? r : r.call(e[s], s, t(e[s], n)),
                                        );
                                return i
                                    ? e
                                    : l
                                      ? t.call(e)
                                      : u
                                        ? t(e[0], n)
                                        : o;
                            },
                            te = /^-ms-/,
                            ne = /-([a-z])/g;
                        function re(e, t) {
                            return t.toUpperCase();
                        }
                        function ie(e) {
                            return e.replace(te, "ms-").replace(ne, re);
                        }
                        var oe = function (e) {
                            return (
                                1 === e.nodeType ||
                                9 === e.nodeType ||
                                !+e.nodeType
                            );
                        };
                        function ae() {
                            this.expando = A.expando + ae.uid++;
                        }
                        ((ae.uid = 1),
                            (ae.prototype = {
                                cache: function (e) {
                                    var t = e[this.expando];
                                    return (
                                        t ||
                                            ((t = {}),
                                            oe(e) &&
                                                (e.nodeType
                                                    ? (e[this.expando] = t)
                                                    : Object.defineProperty(
                                                          e,
                                                          this.expando,
                                                          {
                                                              value: t,
                                                              configurable: !0,
                                                          },
                                                      ))),
                                        t
                                    );
                                },
                                set: function (e, t, n) {
                                    var r,
                                        i = this.cache(e);
                                    if ("string" == typeof t) i[ie(t)] = n;
                                    else for (r in t) i[ie(r)] = t[r];
                                    return i;
                                },
                                get: function (e, t) {
                                    return void 0 === t
                                        ? this.cache(e)
                                        : e[this.expando] &&
                                              e[this.expando][ie(t)];
                                },
                                access: function (e, t, n) {
                                    return void 0 === t ||
                                        (t &&
                                            "string" == typeof t &&
                                            void 0 === n)
                                        ? this.get(e, t)
                                        : (this.set(e, t, n),
                                          void 0 !== n ? n : t);
                                },
                                remove: function (e, t) {
                                    var n,
                                        r = e[this.expando];
                                    if (void 0 !== r) {
                                        if (void 0 !== t) {
                                            n = (t = Array.isArray(t)
                                                ? t.map(ie)
                                                : (t = ie(t)) in r
                                                  ? [t]
                                                  : t.match(Y) || []).length;
                                            for (; n--; ) delete r[t[n]];
                                        }
                                        (void 0 === t || A.isEmptyObject(r)) &&
                                            (e.nodeType
                                                ? (e[this.expando] = void 0)
                                                : delete e[this.expando]);
                                    }
                                },
                                hasData: function (e) {
                                    var t = e[this.expando];
                                    return void 0 !== t && !A.isEmptyObject(t);
                                },
                            }));
                        var se = new ae(),
                            ue = new ae(),
                            le = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
                            ce = /[A-Z]/g;
                        function fe(e, t, n) {
                            var r;
                            if (void 0 === n && 1 === e.nodeType)
                                if (
                                    ((r =
                                        "data-" +
                                        t.replace(ce, "-$&").toLowerCase()),
                                    "string" == typeof (n = e.getAttribute(r)))
                                ) {
                                    try {
                                        n = (function (e) {
                                            return (
                                                "true" === e ||
                                                ("false" !== e &&
                                                    ("null" === e
                                                        ? null
                                                        : e === +e + ""
                                                          ? +e
                                                          : le.test(e)
                                                            ? JSON.parse(e)
                                                            : e))
                                            );
                                        })(n);
                                    } catch (e) {}
                                    ue.set(e, t, n);
                                } else n = void 0;
                            return n;
                        }
                        (A.extend({
                            hasData: function (e) {
                                return ue.hasData(e) || se.hasData(e);
                            },
                            data: function (e, t, n) {
                                return ue.access(e, t, n);
                            },
                            removeData: function (e, t) {
                                ue.remove(e, t);
                            },
                            _data: function (e, t, n) {
                                return se.access(e, t, n);
                            },
                            _removeData: function (e, t) {
                                se.remove(e, t);
                            },
                        }),
                            A.fn.extend({
                                data: function (e, t) {
                                    var n,
                                        r,
                                        i,
                                        o = this[0],
                                        a = o && o.attributes;
                                    if (void 0 === e) {
                                        if (
                                            this.length &&
                                            ((i = ue.get(o)),
                                            1 === o.nodeType &&
                                                !se.get(o, "hasDataAttrs"))
                                        ) {
                                            for (n = a.length; n--; )
                                                a[n] &&
                                                    0 ===
                                                        (r = a[n].name).indexOf(
                                                            "data-",
                                                        ) &&
                                                    ((r = ie(r.slice(5))),
                                                    fe(o, r, i[r]));
                                            se.set(o, "hasDataAttrs", !0);
                                        }
                                        return i;
                                    }
                                    return "object" == typeof e
                                        ? this.each(function () {
                                              ue.set(this, e);
                                          })
                                        : ee(
                                              this,
                                              function (t) {
                                                  var n;
                                                  if (o && void 0 === t)
                                                      return void 0 !==
                                                          (n = ue.get(o, e)) ||
                                                          void 0 !==
                                                              (n = fe(o, e))
                                                          ? n
                                                          : void 0;
                                                  this.each(function () {
                                                      ue.set(this, e, t);
                                                  });
                                              },
                                              null,
                                              t,
                                              arguments.length > 1,
                                              null,
                                              !0,
                                          );
                                },
                                removeData: function (e) {
                                    return this.each(function () {
                                        ue.remove(this, e);
                                    });
                                },
                            }),
                            A.extend({
                                queue: function (e, t, n) {
                                    var r;
                                    if (e)
                                        return (
                                            (t = (t || "fx") + "queue"),
                                            (r = se.get(e, t)),
                                            n &&
                                                (!r || Array.isArray(n)
                                                    ? (r = se.access(
                                                          e,
                                                          t,
                                                          A.makeArray(n),
                                                      ))
                                                    : r.push(n)),
                                            r || []
                                        );
                                },
                                dequeue: function (e, t) {
                                    t = t || "fx";
                                    var n = A.queue(e, t),
                                        r = n.length,
                                        i = n.shift(),
                                        o = A._queueHooks(e, t);
                                    ("inprogress" === i &&
                                        ((i = n.shift()), r--),
                                        i &&
                                            ("fx" === t &&
                                                n.unshift("inprogress"),
                                            delete o.stop,
                                            i.call(
                                                e,
                                                function () {
                                                    A.dequeue(e, t);
                                                },
                                                o,
                                            )),
                                        !r && o && o.empty.fire());
                                },
                                _queueHooks: function (e, t) {
                                    var n = t + "queueHooks";
                                    return (
                                        se.get(e, n) ||
                                        se.access(e, n, {
                                            empty: A.Callbacks(
                                                "once memory",
                                            ).add(function () {
                                                se.remove(e, [t + "queue", n]);
                                            }),
                                        })
                                    );
                                },
                            }),
                            A.fn.extend({
                                queue: function (e, t) {
                                    var n = 2;
                                    return (
                                        "string" != typeof e &&
                                            ((t = e), (e = "fx"), n--),
                                        arguments.length < n
                                            ? A.queue(this[0], e)
                                            : void 0 === t
                                              ? this
                                              : this.each(function () {
                                                    var n = A.queue(this, e, t);
                                                    (A._queueHooks(this, e),
                                                        "fx" === e &&
                                                            "inprogress" !==
                                                                n[0] &&
                                                            A.dequeue(this, e));
                                                })
                                    );
                                },
                                dequeue: function (e) {
                                    return this.each(function () {
                                        A.dequeue(this, e);
                                    });
                                },
                                clearQueue: function (e) {
                                    return this.queue(e || "fx", []);
                                },
                                promise: function (e, t) {
                                    var n,
                                        r = 1,
                                        i = A.Deferred(),
                                        o = this,
                                        a = this.length,
                                        s = function () {
                                            --r || i.resolveWith(o, [o]);
                                        };
                                    for (
                                        "string" != typeof e &&
                                            ((t = e), (e = void 0)),
                                            e = e || "fx";
                                        a--;
                                    )
                                        (n = se.get(o[a], e + "queueHooks")) &&
                                            n.empty &&
                                            (r++, n.empty.add(s));
                                    return (s(), i.promise(t));
                                },
                            }));
                        var de = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
                            pe = new RegExp(
                                "^(?:([+-])=|)(" + de + ")([a-z%]*)$",
                                "i",
                            ),
                            he = ["Top", "Right", "Bottom", "Left"],
                            me = b.documentElement,
                            ve = function (e) {
                                return A.contains(e.ownerDocument, e);
                            },
                            ge = { composed: !0 };
                        me.getRootNode &&
                            (ve = function (e) {
                                return (
                                    A.contains(e.ownerDocument, e) ||
                                    e.getRootNode(ge) === e.ownerDocument
                                );
                            });
                        var ye = function (e, t) {
                            return (
                                "none" === (e = t || e).style.display ||
                                ("" === e.style.display &&
                                    ve(e) &&
                                    "none" === A.css(e, "display"))
                            );
                        };
                        function be(e, t, n, r) {
                            var i,
                                o,
                                a = 20,
                                s = r
                                    ? function () {
                                          return r.cur();
                                      }
                                    : function () {
                                          return A.css(e, t, "");
                                      },
                                u = s(),
                                l = (n && n[3]) || (A.cssNumber[t] ? "" : "px"),
                                c =
                                    e.nodeType &&
                                    (A.cssNumber[t] || ("px" !== l && +u)) &&
                                    pe.exec(A.css(e, t));
                            if (c && c[3] !== l) {
                                for (u /= 2, l = l || c[3], c = +u || 1; a--; )
                                    (A.style(e, t, c + l),
                                        (1 - o) * (1 - (o = s() / u || 0.5)) <=
                                            0 && (a = 0),
                                        (c /= o));
                                ((c *= 2), A.style(e, t, c + l), (n = n || []));
                            }
                            return (
                                n &&
                                    ((c = +c || +u || 0),
                                    (i = n[1] ? c + (n[1] + 1) * n[2] : +n[2]),
                                    r &&
                                        ((r.unit = l),
                                        (r.start = c),
                                        (r.end = i))),
                                i
                            );
                        }
                        var xe = {};
                        function we(e) {
                            var t,
                                n = e.ownerDocument,
                                r = e.nodeName,
                                i = xe[r];
                            return (
                                i ||
                                ((t = n.body.appendChild(n.createElement(r))),
                                (i = A.css(t, "display")),
                                t.parentNode.removeChild(t),
                                "none" === i && (i = "block"),
                                (xe[r] = i),
                                i)
                            );
                        }
                        function Te(e, t) {
                            for (
                                var n, r, i = [], o = 0, a = e.length;
                                o < a;
                                o++
                            )
                                (r = e[o]).style &&
                                    ((n = r.style.display),
                                    t
                                        ? ("none" === n &&
                                              ((i[o] =
                                                  se.get(r, "display") || null),
                                              i[o] || (r.style.display = "")),
                                          "" === r.style.display &&
                                              ye(r) &&
                                              (i[o] = we(r)))
                                        : "none" !== n &&
                                          ((i[o] = "none"),
                                          se.set(r, "display", n)));
                            for (o = 0; o < a; o++)
                                null != i[o] && (e[o].style.display = i[o]);
                            return e;
                        }
                        A.fn.extend({
                            show: function () {
                                return Te(this, !0);
                            },
                            hide: function () {
                                return Te(this);
                            },
                            toggle: function (e) {
                                return "boolean" == typeof e
                                    ? e
                                        ? this.show()
                                        : this.hide()
                                    : this.each(function () {
                                          ye(this)
                                              ? A(this).show()
                                              : A(this).hide();
                                      });
                            },
                        });
                        var Ce,
                            Ee,
                            Ae = /^(?:checkbox|radio)$/i,
                            Se = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i,
                            ke = /^$|^module$|\/(?:java|ecma)script/i;
                        ((Ce = b
                            .createDocumentFragment()
                            .appendChild(b.createElement("div"))),
                            (Ee = b.createElement("input")).setAttribute(
                                "type",
                                "radio",
                            ),
                            Ee.setAttribute("checked", "checked"),
                            Ee.setAttribute("name", "t"),
                            Ce.appendChild(Ee),
                            (v.checkClone =
                                Ce.cloneNode(!0).cloneNode(
                                    !0,
                                ).lastChild.checked),
                            (Ce.innerHTML = "<textarea>x</textarea>"),
                            (v.noCloneChecked =
                                !!Ce.cloneNode(!0).lastChild.defaultValue),
                            (Ce.innerHTML = "<option></option>"),
                            (v.option = !!Ce.lastChild));
                        var De = {
                            thead: [1, "<table>", "</table>"],
                            col: [
                                2,
                                "<table><colgroup>",
                                "</colgroup></table>",
                            ],
                            tr: [2, "<table><tbody>", "</tbody></table>"],
                            td: [
                                3,
                                "<table><tbody><tr>",
                                "</tr></tbody></table>",
                            ],
                            _default: [0, "", ""],
                        };
                        function Ne(e, t) {
                            var n;
                            return (
                                (n =
                                    void 0 !== e.getElementsByTagName
                                        ? e.getElementsByTagName(t || "*")
                                        : void 0 !== e.querySelectorAll
                                          ? e.querySelectorAll(t || "*")
                                          : []),
                                void 0 === t || (t && k(e, t))
                                    ? A.merge([e], n)
                                    : n
                            );
                        }
                        function Le(e, t) {
                            for (var n = 0, r = e.length; n < r; n++)
                                se.set(
                                    e[n],
                                    "globalEval",
                                    !t || se.get(t[n], "globalEval"),
                                );
                        }
                        ((De.tbody =
                            De.tfoot =
                            De.colgroup =
                            De.caption =
                                De.thead),
                            (De.th = De.td),
                            v.option ||
                                (De.optgroup = De.option =
                                    [
                                        1,
                                        "<select multiple='multiple'>",
                                        "</select>",
                                    ]));
                        var Me = /<|&#?\w+;/;
                        function Oe(e, t, n, r, i) {
                            for (
                                var o,
                                    a,
                                    s,
                                    u,
                                    l,
                                    c,
                                    f = t.createDocumentFragment(),
                                    d = [],
                                    p = 0,
                                    h = e.length;
                                p < h;
                                p++
                            )
                                if ((o = e[p]) || 0 === o)
                                    if ("object" === T(o))
                                        A.merge(d, o.nodeType ? [o] : o);
                                    else if (Me.test(o)) {
                                        for (
                                            a =
                                                a ||
                                                f.appendChild(
                                                    t.createElement("div"),
                                                ),
                                                s = (Se.exec(o) || [
                                                    "",
                                                    "",
                                                ])[1].toLowerCase(),
                                                u = De[s] || De._default,
                                                a.innerHTML =
                                                    u[1] +
                                                    A.htmlPrefilter(o) +
                                                    u[2],
                                                c = u[0];
                                            c--;
                                        )
                                            a = a.lastChild;
                                        (A.merge(d, a.childNodes),
                                            ((a = f.firstChild).textContent =
                                                ""));
                                    } else d.push(t.createTextNode(o));
                            for (f.textContent = "", p = 0; (o = d[p++]); )
                                if (r && A.inArray(o, r) > -1) i && i.push(o);
                                else if (
                                    ((l = ve(o)),
                                    (a = Ne(f.appendChild(o), "script")),
                                    l && Le(a),
                                    n)
                                )
                                    for (c = 0; (o = a[c++]); )
                                        ke.test(o.type || "") && n.push(o);
                            return f;
                        }
                        var je = /^([^.]*)(?:\.(.+)|)/;
                        function He() {
                            return !0;
                        }
                        function Pe() {
                            return !1;
                        }
                        function Be(e, t, n, r, i, o) {
                            var a, s;
                            if ("object" == typeof t) {
                                for (s in ("string" != typeof n &&
                                    ((r = r || n), (n = void 0)),
                                t))
                                    Be(e, s, n, r, t[s], o);
                                return e;
                            }
                            if (
                                (null == r && null == i
                                    ? ((i = n), (r = n = void 0))
                                    : null == i &&
                                      ("string" == typeof n
                                          ? ((i = r), (r = void 0))
                                          : ((i = r), (r = n), (n = void 0))),
                                !1 === i)
                            )
                                i = Pe;
                            else if (!i) return e;
                            return (
                                1 === o &&
                                    ((a = i),
                                    (i = function (e) {
                                        return (
                                            A().off(e),
                                            a.apply(this, arguments)
                                        );
                                    }),
                                    (i.guid = a.guid || (a.guid = A.guid++))),
                                e.each(function () {
                                    A.event.add(this, t, i, r, n);
                                })
                            );
                        }
                        function Ie(e, t, n) {
                            n
                                ? (se.set(e, t, !1),
                                  A.event.add(e, t, {
                                      namespace: !1,
                                      handler: function (e) {
                                          var n,
                                              r = se.get(this, t);
                                          if (1 & e.isTrigger && this[t]) {
                                              if (r)
                                                  (A.event.special[t] || {})
                                                      .delegateType &&
                                                      e.stopPropagation();
                                              else if (
                                                  ((r = s.call(arguments)),
                                                  se.set(this, t, r),
                                                  this[t](),
                                                  (n = se.get(this, t)),
                                                  se.set(this, t, !1),
                                                  r !== n)
                                              )
                                                  return (
                                                      e.stopImmediatePropagation(),
                                                      e.preventDefault(),
                                                      n
                                                  );
                                          } else
                                              r &&
                                                  (se.set(
                                                      this,
                                                      t,
                                                      A.event.trigger(
                                                          r[0],
                                                          r.slice(1),
                                                          this,
                                                      ),
                                                  ),
                                                  e.stopPropagation(),
                                                  (e.isImmediatePropagationStopped =
                                                      He));
                                      },
                                  }))
                                : void 0 === se.get(e, t) &&
                                  A.event.add(e, t, He);
                        }
                        ((A.event = {
                            global: {},
                            add: function (e, t, n, r, i) {
                                var o,
                                    a,
                                    s,
                                    u,
                                    l,
                                    c,
                                    f,
                                    d,
                                    p,
                                    h,
                                    m,
                                    v = se.get(e);
                                if (oe(e))
                                    for (
                                        n.handler &&
                                            ((n = (o = n).handler),
                                            (i = o.selector)),
                                            i && A.find.matchesSelector(me, i),
                                            n.guid || (n.guid = A.guid++),
                                            (u = v.events) ||
                                                (u = v.events =
                                                    Object.create(null)),
                                            (a = v.handle) ||
                                                (a = v.handle =
                                                    function (t) {
                                                        return void 0 !== A &&
                                                            A.event
                                                                .triggered !==
                                                                t.type
                                                            ? A.event.dispatch.apply(
                                                                  e,
                                                                  arguments,
                                                              )
                                                            : void 0;
                                                    }),
                                            l = (t = (t || "").match(Y) || [""])
                                                .length;
                                        l--;
                                    )
                                        ((p = m = (s = je.exec(t[l]) || [])[1]),
                                            (h = (s[2] || "")
                                                .split(".")
                                                .sort()),
                                            p &&
                                                ((f = A.event.special[p] || {}),
                                                (p =
                                                    (i
                                                        ? f.delegateType
                                                        : f.bindType) || p),
                                                (f = A.event.special[p] || {}),
                                                (c = A.extend(
                                                    {
                                                        type: p,
                                                        origType: m,
                                                        data: r,
                                                        handler: n,
                                                        guid: n.guid,
                                                        selector: i,
                                                        needsContext:
                                                            i &&
                                                            A.expr.match.needsContext.test(
                                                                i,
                                                            ),
                                                        namespace: h.join("."),
                                                    },
                                                    o,
                                                )),
                                                (d = u[p]) ||
                                                    (((d = u[p] =
                                                        []).delegateCount = 0),
                                                    (f.setup &&
                                                        !1 !==
                                                            f.setup.call(
                                                                e,
                                                                r,
                                                                h,
                                                                a,
                                                            )) ||
                                                        (e.addEventListener &&
                                                            e.addEventListener(
                                                                p,
                                                                a,
                                                            ))),
                                                f.add &&
                                                    (f.add.call(e, c),
                                                    c.handler.guid ||
                                                        (c.handler.guid =
                                                            n.guid)),
                                                i
                                                    ? d.splice(
                                                          d.delegateCount++,
                                                          0,
                                                          c,
                                                      )
                                                    : d.push(c),
                                                (A.event.global[p] = !0)));
                            },
                            remove: function (e, t, n, r, i) {
                                var o,
                                    a,
                                    s,
                                    u,
                                    l,
                                    c,
                                    f,
                                    d,
                                    p,
                                    h,
                                    m,
                                    v = se.hasData(e) && se.get(e);
                                if (v && (u = v.events)) {
                                    for (
                                        l = (t = (t || "").match(Y) || [""])
                                            .length;
                                        l--;
                                    )
                                        if (
                                            ((p = m =
                                                (s = je.exec(t[l]) || [])[1]),
                                            (h = (s[2] || "")
                                                .split(".")
                                                .sort()),
                                            p)
                                        ) {
                                            for (
                                                f = A.event.special[p] || {},
                                                    d =
                                                        u[
                                                            (p =
                                                                (r
                                                                    ? f.delegateType
                                                                    : f.bindType) ||
                                                                p)
                                                        ] || [],
                                                    s =
                                                        s[2] &&
                                                        new RegExp(
                                                            "(^|\\.)" +
                                                                h.join(
                                                                    "\\.(?:.*\\.|)",
                                                                ) +
                                                                "(\\.|$)",
                                                        ),
                                                    a = o = d.length;
                                                o--;
                                            )
                                                ((c = d[o]),
                                                    (!i && m !== c.origType) ||
                                                        (n &&
                                                            n.guid !==
                                                                c.guid) ||
                                                        (s &&
                                                            !s.test(
                                                                c.namespace,
                                                            )) ||
                                                        (r &&
                                                            r !== c.selector &&
                                                            ("**" !== r ||
                                                                !c.selector)) ||
                                                        (d.splice(o, 1),
                                                        c.selector &&
                                                            d.delegateCount--,
                                                        f.remove &&
                                                            f.remove.call(
                                                                e,
                                                                c,
                                                            )));
                                            a &&
                                                !d.length &&
                                                ((f.teardown &&
                                                    !1 !==
                                                        f.teardown.call(
                                                            e,
                                                            h,
                                                            v.handle,
                                                        )) ||
                                                    A.removeEvent(
                                                        e,
                                                        p,
                                                        v.handle,
                                                    ),
                                                delete u[p]);
                                        } else
                                            for (p in u)
                                                A.event.remove(
                                                    e,
                                                    p + t[l],
                                                    n,
                                                    r,
                                                    !0,
                                                );
                                    A.isEmptyObject(u) &&
                                        se.remove(e, "handle events");
                                }
                            },
                            dispatch: function (e) {
                                var t,
                                    n,
                                    r,
                                    i,
                                    o,
                                    a,
                                    s = new Array(arguments.length),
                                    u = A.event.fix(e),
                                    l =
                                        (se.get(this, "events") ||
                                            Object.create(null))[u.type] || [],
                                    c = A.event.special[u.type] || {};
                                for (s[0] = u, t = 1; t < arguments.length; t++)
                                    s[t] = arguments[t];
                                if (
                                    ((u.delegateTarget = this),
                                    !c.preDispatch ||
                                        !1 !== c.preDispatch.call(this, u))
                                ) {
                                    for (
                                        a = A.event.handlers.call(this, u, l),
                                            t = 0;
                                        (i = a[t++]) &&
                                        !u.isPropagationStopped();
                                    )
                                        for (
                                            u.currentTarget = i.elem, n = 0;
                                            (o = i.handlers[n++]) &&
                                            !u.isImmediatePropagationStopped();
                                        )
                                            (u.rnamespace &&
                                                !1 !== o.namespace &&
                                                !u.rnamespace.test(
                                                    o.namespace,
                                                )) ||
                                                ((u.handleObj = o),
                                                (u.data = o.data),
                                                void 0 !==
                                                    (r = (
                                                        (
                                                            A.event.special[
                                                                o.origType
                                                            ] || {}
                                                        ).handle || o.handler
                                                    ).apply(i.elem, s)) &&
                                                    !1 === (u.result = r) &&
                                                    (u.preventDefault(),
                                                    u.stopPropagation()));
                                    return (
                                        c.postDispatch &&
                                            c.postDispatch.call(this, u),
                                        u.result
                                    );
                                }
                            },
                            handlers: function (e, t) {
                                var n,
                                    r,
                                    i,
                                    o,
                                    a,
                                    s = [],
                                    u = t.delegateCount,
                                    l = e.target;
                                if (
                                    u &&
                                    l.nodeType &&
                                    !("click" === e.type && e.button >= 1)
                                )
                                    for (; l !== this; l = l.parentNode || this)
                                        if (
                                            1 === l.nodeType &&
                                            ("click" !== e.type ||
                                                !0 !== l.disabled)
                                        ) {
                                            for (
                                                o = [], a = {}, n = 0;
                                                n < u;
                                                n++
                                            )
                                                (void 0 ===
                                                    a[
                                                        (i =
                                                            (r = t[n])
                                                                .selector + " ")
                                                    ] &&
                                                    (a[i] = r.needsContext
                                                        ? A(i, this).index(l) >
                                                          -1
                                                        : A.find(
                                                              i,
                                                              this,
                                                              null,
                                                              [l],
                                                          ).length),
                                                    a[i] && o.push(r));
                                            o.length &&
                                                s.push({
                                                    elem: l,
                                                    handlers: o,
                                                });
                                        }
                                return (
                                    (l = this),
                                    u < t.length &&
                                        s.push({
                                            elem: l,
                                            handlers: t.slice(u),
                                        }),
                                    s
                                );
                            },
                            addProp: function (e, t) {
                                Object.defineProperty(A.Event.prototype, e, {
                                    enumerable: !0,
                                    configurable: !0,
                                    get: g(t)
                                        ? function () {
                                              if (this.originalEvent)
                                                  return t(this.originalEvent);
                                          }
                                        : function () {
                                              if (this.originalEvent)
                                                  return this.originalEvent[e];
                                          },
                                    set: function (t) {
                                        Object.defineProperty(this, e, {
                                            enumerable: !0,
                                            configurable: !0,
                                            writable: !0,
                                            value: t,
                                        });
                                    },
                                });
                            },
                            fix: function (e) {
                                return e[A.expando] ? e : new A.Event(e);
                            },
                            special: {
                                load: { noBubble: !0 },
                                click: {
                                    setup: function (e) {
                                        var t = this || e;
                                        return (
                                            Ae.test(t.type) &&
                                                t.click &&
                                                k(t, "input") &&
                                                Ie(t, "click", !0),
                                            !1
                                        );
                                    },
                                    trigger: function (e) {
                                        var t = this || e;
                                        return (
                                            Ae.test(t.type) &&
                                                t.click &&
                                                k(t, "input") &&
                                                Ie(t, "click"),
                                            !0
                                        );
                                    },
                                    _default: function (e) {
                                        var t = e.target;
                                        return (
                                            (Ae.test(t.type) &&
                                                t.click &&
                                                k(t, "input") &&
                                                se.get(t, "click")) ||
                                            k(t, "a")
                                        );
                                    },
                                },
                                beforeunload: {
                                    postDispatch: function (e) {
                                        void 0 !== e.result &&
                                            e.originalEvent &&
                                            (e.originalEvent.returnValue =
                                                e.result);
                                    },
                                },
                            },
                        }),
                            (A.removeEvent = function (e, t, n) {
                                e.removeEventListener &&
                                    e.removeEventListener(t, n);
                            }),
                            (A.Event = function (e, t) {
                                if (!(this instanceof A.Event))
                                    return new A.Event(e, t);
                                (e && e.type
                                    ? ((this.originalEvent = e),
                                      (this.type = e.type),
                                      (this.isDefaultPrevented =
                                          e.defaultPrevented ||
                                          (void 0 === e.defaultPrevented &&
                                              !1 === e.returnValue)
                                              ? He
                                              : Pe),
                                      (this.target =
                                          e.target && 3 === e.target.nodeType
                                              ? e.target.parentNode
                                              : e.target),
                                      (this.currentTarget = e.currentTarget),
                                      (this.relatedTarget = e.relatedTarget))
                                    : (this.type = e),
                                    t && A.extend(this, t),
                                    (this.timeStamp =
                                        (e && e.timeStamp) || Date.now()),
                                    (this[A.expando] = !0));
                            }),
                            (A.Event.prototype = {
                                constructor: A.Event,
                                isDefaultPrevented: Pe,
                                isPropagationStopped: Pe,
                                isImmediatePropagationStopped: Pe,
                                isSimulated: !1,
                                preventDefault: function () {
                                    var e = this.originalEvent;
                                    ((this.isDefaultPrevented = He),
                                        e &&
                                            !this.isSimulated &&
                                            e.preventDefault());
                                },
                                stopPropagation: function () {
                                    var e = this.originalEvent;
                                    ((this.isPropagationStopped = He),
                                        e &&
                                            !this.isSimulated &&
                                            e.stopPropagation());
                                },
                                stopImmediatePropagation: function () {
                                    var e = this.originalEvent;
                                    ((this.isImmediatePropagationStopped = He),
                                        e &&
                                            !this.isSimulated &&
                                            e.stopImmediatePropagation(),
                                        this.stopPropagation());
                                },
                            }),
                            A.each(
                                {
                                    altKey: !0,
                                    bubbles: !0,
                                    cancelable: !0,
                                    changedTouches: !0,
                                    ctrlKey: !0,
                                    detail: !0,
                                    eventPhase: !0,
                                    metaKey: !0,
                                    pageX: !0,
                                    pageY: !0,
                                    shiftKey: !0,
                                    view: !0,
                                    char: !0,
                                    code: !0,
                                    charCode: !0,
                                    key: !0,
                                    keyCode: !0,
                                    button: !0,
                                    buttons: !0,
                                    clientX: !0,
                                    clientY: !0,
                                    offsetX: !0,
                                    offsetY: !0,
                                    pointerId: !0,
                                    pointerType: !0,
                                    screenX: !0,
                                    screenY: !0,
                                    targetTouches: !0,
                                    toElement: !0,
                                    touches: !0,
                                    which: !0,
                                },
                                A.event.addProp,
                            ),
                            A.each(
                                { focus: "focusin", blur: "focusout" },
                                function (e, t) {
                                    function n(e) {
                                        if (b.documentMode) {
                                            var n = se.get(this, "handle"),
                                                r = A.event.fix(e);
                                            ((r.type =
                                                "focusin" === e.type
                                                    ? "focus"
                                                    : "blur"),
                                                (r.isSimulated = !0),
                                                n(e),
                                                r.target === r.currentTarget &&
                                                    n(r));
                                        } else
                                            A.event.simulate(
                                                t,
                                                e.target,
                                                A.event.fix(e),
                                            );
                                    }
                                    ((A.event.special[e] = {
                                        setup: function () {
                                            var r;
                                            if (
                                                (Ie(this, e, !0),
                                                !b.documentMode)
                                            )
                                                return !1;
                                            ((r = se.get(this, t)) ||
                                                this.addEventListener(t, n),
                                                se.set(this, t, (r || 0) + 1));
                                        },
                                        trigger: function () {
                                            return (Ie(this, e), !0);
                                        },
                                        teardown: function () {
                                            var e;
                                            if (!b.documentMode) return !1;
                                            (e = se.get(this, t) - 1)
                                                ? se.set(this, t, e)
                                                : (this.removeEventListener(
                                                      t,
                                                      n,
                                                  ),
                                                  se.remove(this, t));
                                        },
                                        _default: function (t) {
                                            return se.get(t.target, e);
                                        },
                                        delegateType: t,
                                    }),
                                        (A.event.special[t] = {
                                            setup: function () {
                                                var r =
                                                        this.ownerDocument ||
                                                        this.document ||
                                                        this,
                                                    i = b.documentMode
                                                        ? this
                                                        : r,
                                                    o = se.get(i, t);
                                                (o ||
                                                    (b.documentMode
                                                        ? this.addEventListener(
                                                              t,
                                                              n,
                                                          )
                                                        : r.addEventListener(
                                                              e,
                                                              n,
                                                              !0,
                                                          )),
                                                    se.set(i, t, (o || 0) + 1));
                                            },
                                            teardown: function () {
                                                var r =
                                                        this.ownerDocument ||
                                                        this.document ||
                                                        this,
                                                    i = b.documentMode
                                                        ? this
                                                        : r,
                                                    o = se.get(i, t) - 1;
                                                o
                                                    ? se.set(i, t, o)
                                                    : (b.documentMode
                                                          ? this.removeEventListener(
                                                                t,
                                                                n,
                                                            )
                                                          : r.removeEventListener(
                                                                e,
                                                                n,
                                                                !0,
                                                            ),
                                                      se.remove(i, t));
                                            },
                                        }));
                                },
                            ),
                            A.each(
                                {
                                    mouseenter: "mouseover",
                                    mouseleave: "mouseout",
                                    pointerenter: "pointerover",
                                    pointerleave: "pointerout",
                                },
                                function (e, t) {
                                    A.event.special[e] = {
                                        delegateType: t,
                                        bindType: t,
                                        handle: function (e) {
                                            var n,
                                                r = e.relatedTarget,
                                                i = e.handleObj;
                                            return (
                                                (r &&
                                                    (r === this ||
                                                        A.contains(this, r))) ||
                                                    ((e.type = i.origType),
                                                    (n = i.handler.apply(
                                                        this,
                                                        arguments,
                                                    )),
                                                    (e.type = t)),
                                                n
                                            );
                                        },
                                    };
                                },
                            ),
                            A.fn.extend({
                                on: function (e, t, n, r) {
                                    return Be(this, e, t, n, r);
                                },
                                one: function (e, t, n, r) {
                                    return Be(this, e, t, n, r, 1);
                                },
                                off: function (e, t, n) {
                                    var r, i;
                                    if (e && e.preventDefault && e.handleObj)
                                        return (
                                            (r = e.handleObj),
                                            A(e.delegateTarget).off(
                                                r.namespace
                                                    ? r.origType +
                                                          "." +
                                                          r.namespace
                                                    : r.origType,
                                                r.selector,
                                                r.handler,
                                            ),
                                            this
                                        );
                                    if ("object" == typeof e) {
                                        for (i in e) this.off(i, t, e[i]);
                                        return this;
                                    }
                                    return (
                                        (!1 !== t && "function" != typeof t) ||
                                            ((n = t), (t = void 0)),
                                        !1 === n && (n = Pe),
                                        this.each(function () {
                                            A.event.remove(this, e, n, t);
                                        })
                                    );
                                },
                            }));
                        var ze = /<script|<style|<link/i,
                            qe = /checked\s*(?:[^=]|=\s*.checked.)/i,
                            Re = /^\s*<!\[CDATA\[|\]\]>\s*$/g;
                        function Fe(e, t) {
                            return (
                                (k(e, "table") &&
                                    k(
                                        11 !== t.nodeType ? t : t.firstChild,
                                        "tr",
                                    ) &&
                                    A(e).children("tbody")[0]) ||
                                e
                            );
                        }
                        function We(e) {
                            return (
                                (e.type =
                                    (null !== e.getAttribute("type")) +
                                    "/" +
                                    e.type),
                                e
                            );
                        }
                        function _e(e) {
                            return (
                                "true/" === (e.type || "").slice(0, 5)
                                    ? (e.type = e.type.slice(5))
                                    : e.removeAttribute("type"),
                                e
                            );
                        }
                        function Ue(e, t) {
                            var n, r, i, o, a, s;
                            if (1 === t.nodeType) {
                                if (se.hasData(e) && (s = se.get(e).events))
                                    for (i in (se.remove(t, "handle events"),
                                    s))
                                        for (n = 0, r = s[i].length; n < r; n++)
                                            A.event.add(t, i, s[i][n]);
                                ue.hasData(e) &&
                                    ((o = ue.access(e)),
                                    (a = A.extend({}, o)),
                                    ue.set(t, a));
                            }
                        }
                        function $e(e, t) {
                            var n = t.nodeName.toLowerCase();
                            "input" === n && Ae.test(e.type)
                                ? (t.checked = e.checked)
                                : ("input" !== n && "textarea" !== n) ||
                                  (t.defaultValue = e.defaultValue);
                        }
                        function Ve(e, t, n, r) {
                            t = u(t);
                            var i,
                                o,
                                a,
                                s,
                                l,
                                c,
                                f = 0,
                                d = e.length,
                                p = d - 1,
                                h = t[0],
                                m = g(h);
                            if (
                                m ||
                                (d > 1 &&
                                    "string" == typeof h &&
                                    !v.checkClone &&
                                    qe.test(h))
                            )
                                return e.each(function (i) {
                                    var o = e.eq(i);
                                    (m && (t[0] = h.call(this, i, o.html())),
                                        Ve(o, t, n, r));
                                });
                            if (
                                d &&
                                ((o = (i = Oe(t, e[0].ownerDocument, !1, e, r))
                                    .firstChild),
                                1 === i.childNodes.length && (i = o),
                                o || r)
                            ) {
                                for (
                                    s = (a = A.map(Ne(i, "script"), We)).length;
                                    f < d;
                                    f++
                                )
                                    ((l = i),
                                        f !== p &&
                                            ((l = A.clone(l, !0, !0)),
                                            s && A.merge(a, Ne(l, "script"))),
                                        n.call(e[f], l, f));
                                if (s)
                                    for (
                                        c = a[a.length - 1].ownerDocument,
                                            A.map(a, _e),
                                            f = 0;
                                        f < s;
                                        f++
                                    )
                                        ((l = a[f]),
                                            ke.test(l.type || "") &&
                                                !se.access(l, "globalEval") &&
                                                A.contains(c, l) &&
                                                (l.src &&
                                                "module" !==
                                                    (l.type || "").toLowerCase()
                                                    ? A._evalUrl &&
                                                      !l.noModule &&
                                                      A._evalUrl(
                                                          l.src,
                                                          {
                                                              nonce:
                                                                  l.nonce ||
                                                                  l.getAttribute(
                                                                      "nonce",
                                                                  ),
                                                          },
                                                          c,
                                                      )
                                                    : w(
                                                          l.textContent.replace(
                                                              Re,
                                                              "",
                                                          ),
                                                          l,
                                                          c,
                                                      )));
                            }
                            return e;
                        }
                        function Ye(e, t, n) {
                            for (
                                var r, i = t ? A.filter(t, e) : e, o = 0;
                                null != (r = i[o]);
                                o++
                            )
                                (n || 1 !== r.nodeType || A.cleanData(Ne(r)),
                                    r.parentNode &&
                                        (n && ve(r) && Le(Ne(r, "script")),
                                        r.parentNode.removeChild(r)));
                            return e;
                        }
                        (A.extend({
                            htmlPrefilter: function (e) {
                                return e;
                            },
                            clone: function (e, t, n) {
                                var r,
                                    i,
                                    o,
                                    a,
                                    s = e.cloneNode(!0),
                                    u = ve(e);
                                if (
                                    !(
                                        v.noCloneChecked ||
                                        (1 !== e.nodeType &&
                                            11 !== e.nodeType) ||
                                        A.isXMLDoc(e)
                                    )
                                )
                                    for (
                                        a = Ne(s),
                                            r = 0,
                                            i = (o = Ne(e)).length;
                                        r < i;
                                        r++
                                    )
                                        $e(o[r], a[r]);
                                if (t)
                                    if (n)
                                        for (
                                            o = o || Ne(e),
                                                a = a || Ne(s),
                                                r = 0,
                                                i = o.length;
                                            r < i;
                                            r++
                                        )
                                            Ue(o[r], a[r]);
                                    else Ue(e, s);
                                return (
                                    (a = Ne(s, "script")).length > 0 &&
                                        Le(a, !u && Ne(e, "script")),
                                    s
                                );
                            },
                            cleanData: function (e) {
                                for (
                                    var t, n, r, i = A.event.special, o = 0;
                                    void 0 !== (n = e[o]);
                                    o++
                                )
                                    if (oe(n)) {
                                        if ((t = n[se.expando])) {
                                            if (t.events)
                                                for (r in t.events)
                                                    i[r]
                                                        ? A.event.remove(n, r)
                                                        : A.removeEvent(
                                                              n,
                                                              r,
                                                              t.handle,
                                                          );
                                            n[se.expando] = void 0;
                                        }
                                        n[ue.expando] &&
                                            (n[ue.expando] = void 0);
                                    }
                            },
                        }),
                            A.fn.extend({
                                detach: function (e) {
                                    return Ye(this, e, !0);
                                },
                                remove: function (e) {
                                    return Ye(this, e);
                                },
                                text: function (e) {
                                    return ee(
                                        this,
                                        function (e) {
                                            return void 0 === e
                                                ? A.text(this)
                                                : this.empty().each(
                                                      function () {
                                                          (1 !==
                                                              this.nodeType &&
                                                              11 !==
                                                                  this
                                                                      .nodeType &&
                                                              9 !==
                                                                  this
                                                                      .nodeType) ||
                                                              (this.textContent =
                                                                  e);
                                                      },
                                                  );
                                        },
                                        null,
                                        e,
                                        arguments.length,
                                    );
                                },
                                append: function () {
                                    return Ve(this, arguments, function (e) {
                                        (1 !== this.nodeType &&
                                            11 !== this.nodeType &&
                                            9 !== this.nodeType) ||
                                            Fe(this, e).appendChild(e);
                                    });
                                },
                                prepend: function () {
                                    return Ve(this, arguments, function (e) {
                                        if (
                                            1 === this.nodeType ||
                                            11 === this.nodeType ||
                                            9 === this.nodeType
                                        ) {
                                            var t = Fe(this, e);
                                            t.insertBefore(e, t.firstChild);
                                        }
                                    });
                                },
                                before: function () {
                                    return Ve(this, arguments, function (e) {
                                        this.parentNode &&
                                            this.parentNode.insertBefore(
                                                e,
                                                this,
                                            );
                                    });
                                },
                                after: function () {
                                    return Ve(this, arguments, function (e) {
                                        this.parentNode &&
                                            this.parentNode.insertBefore(
                                                e,
                                                this.nextSibling,
                                            );
                                    });
                                },
                                empty: function () {
                                    for (
                                        var e, t = 0;
                                        null != (e = this[t]);
                                        t++
                                    )
                                        1 === e.nodeType &&
                                            (A.cleanData(Ne(e, !1)),
                                            (e.textContent = ""));
                                    return this;
                                },
                                clone: function (e, t) {
                                    return (
                                        (e = null != e && e),
                                        (t = null == t ? e : t),
                                        this.map(function () {
                                            return A.clone(this, e, t);
                                        })
                                    );
                                },
                                html: function (e) {
                                    return ee(
                                        this,
                                        function (e) {
                                            var t = this[0] || {},
                                                n = 0,
                                                r = this.length;
                                            if (
                                                void 0 === e &&
                                                1 === t.nodeType
                                            )
                                                return t.innerHTML;
                                            if (
                                                "string" == typeof e &&
                                                !ze.test(e) &&
                                                !De[
                                                    (Se.exec(e) || [
                                                        "",
                                                        "",
                                                    ])[1].toLowerCase()
                                                ]
                                            ) {
                                                e = A.htmlPrefilter(e);
                                                try {
                                                    for (; n < r; n++)
                                                        1 ===
                                                            (t = this[n] || {})
                                                                .nodeType &&
                                                            (A.cleanData(
                                                                Ne(t, !1),
                                                            ),
                                                            (t.innerHTML = e));
                                                    t = 0;
                                                } catch (e) {}
                                            }
                                            t && this.empty().append(e);
                                        },
                                        null,
                                        e,
                                        arguments.length,
                                    );
                                },
                                replaceWith: function () {
                                    var e = [];
                                    return Ve(
                                        this,
                                        arguments,
                                        function (t) {
                                            var n = this.parentNode;
                                            A.inArray(this, e) < 0 &&
                                                (A.cleanData(Ne(this)),
                                                n && n.replaceChild(t, this));
                                        },
                                        e,
                                    );
                                },
                            }),
                            A.each(
                                {
                                    appendTo: "append",
                                    prependTo: "prepend",
                                    insertBefore: "before",
                                    insertAfter: "after",
                                    replaceAll: "replaceWith",
                                },
                                function (e, t) {
                                    A.fn[e] = function (e) {
                                        for (
                                            var n,
                                                r = [],
                                                i = A(e),
                                                o = i.length - 1,
                                                a = 0;
                                            a <= o;
                                            a++
                                        )
                                            ((n =
                                                a === o
                                                    ? this
                                                    : this.clone(!0)),
                                                A(i[a])[t](n),
                                                l.apply(r, n.get()));
                                        return this.pushStack(r);
                                    };
                                },
                            ));
                        var Xe = new RegExp("^(" + de + ")(?!px)[a-z%]+$", "i"),
                            Ge = /^--/,
                            Je = function (e) {
                                var t = e.ownerDocument.defaultView;
                                return (
                                    (t && t.opener) || (t = r),
                                    t.getComputedStyle(e)
                                );
                            },
                            Qe = function (e, t, n) {
                                var r,
                                    i,
                                    o = {};
                                for (i in t)
                                    ((o[i] = e.style[i]), (e.style[i] = t[i]));
                                for (i in ((r = n.call(e)), t))
                                    e.style[i] = o[i];
                                return r;
                            },
                            Ze = new RegExp(he.join("|"), "i");
                        function Ke(e, t, n) {
                            var r,
                                i,
                                o,
                                a,
                                s = Ge.test(t),
                                u = e.style;
                            return (
                                (n = n || Je(e)) &&
                                    ((a = n.getPropertyValue(t) || n[t]),
                                    s &&
                                        a &&
                                        (a = a.replace(O, "$1") || void 0),
                                    "" !== a || ve(e) || (a = A.style(e, t)),
                                    !v.pixelBoxStyles() &&
                                        Xe.test(a) &&
                                        Ze.test(t) &&
                                        ((r = u.width),
                                        (i = u.minWidth),
                                        (o = u.maxWidth),
                                        (u.minWidth = u.maxWidth = u.width = a),
                                        (a = n.width),
                                        (u.width = r),
                                        (u.minWidth = i),
                                        (u.maxWidth = o))),
                                void 0 !== a ? a + "" : a
                            );
                        }
                        function et(e, t) {
                            return {
                                get: function () {
                                    if (!e())
                                        return (this.get = t).apply(
                                            this,
                                            arguments,
                                        );
                                    delete this.get;
                                },
                            };
                        }
                        !(function () {
                            function e() {
                                if (c) {
                                    ((l.style.cssText =
                                        "position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0"),
                                        (c.style.cssText =
                                            "position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%"),
                                        me.appendChild(l).appendChild(c));
                                    var e = r.getComputedStyle(c);
                                    ((n = "1%" !== e.top),
                                        (u = 12 === t(e.marginLeft)),
                                        (c.style.right = "60%"),
                                        (a = 36 === t(e.right)),
                                        (i = 36 === t(e.width)),
                                        (c.style.position = "absolute"),
                                        (o = 12 === t(c.offsetWidth / 3)),
                                        me.removeChild(l),
                                        (c = null));
                                }
                            }
                            function t(e) {
                                return Math.round(parseFloat(e));
                            }
                            var n,
                                i,
                                o,
                                a,
                                s,
                                u,
                                l = b.createElement("div"),
                                c = b.createElement("div");
                            c.style &&
                                ((c.style.backgroundClip = "content-box"),
                                (c.cloneNode(!0).style.backgroundClip = ""),
                                (v.clearCloneStyle =
                                    "content-box" === c.style.backgroundClip),
                                A.extend(v, {
                                    boxSizingReliable: function () {
                                        return (e(), i);
                                    },
                                    pixelBoxStyles: function () {
                                        return (e(), a);
                                    },
                                    pixelPosition: function () {
                                        return (e(), n);
                                    },
                                    reliableMarginLeft: function () {
                                        return (e(), u);
                                    },
                                    scrollboxSize: function () {
                                        return (e(), o);
                                    },
                                    reliableTrDimensions: function () {
                                        var e, t, n, i;
                                        return (
                                            null == s &&
                                                ((e = b.createElement("table")),
                                                (t = b.createElement("tr")),
                                                (n = b.createElement("div")),
                                                (e.style.cssText =
                                                    "position:absolute;left:-11111px;border-collapse:separate"),
                                                (t.style.cssText =
                                                    "box-sizing:content-box;border:1px solid"),
                                                (t.style.height = "1px"),
                                                (n.style.height = "9px"),
                                                (n.style.display = "block"),
                                                me
                                                    .appendChild(e)
                                                    .appendChild(t)
                                                    .appendChild(n),
                                                (i = r.getComputedStyle(t)),
                                                (s =
                                                    parseInt(i.height, 10) +
                                                        parseInt(
                                                            i.borderTopWidth,
                                                            10,
                                                        ) +
                                                        parseInt(
                                                            i.borderBottomWidth,
                                                            10,
                                                        ) ===
                                                    t.offsetHeight),
                                                me.removeChild(e)),
                                            s
                                        );
                                    },
                                }));
                        })();
                        var tt = ["Webkit", "Moz", "ms"],
                            nt = b.createElement("div").style,
                            rt = {};
                        function it(e) {
                            var t = A.cssProps[e] || rt[e];
                            return (
                                t ||
                                (e in nt
                                    ? e
                                    : (rt[e] =
                                          (function (e) {
                                              for (
                                                  var t =
                                                          e[0].toUpperCase() +
                                                          e.slice(1),
                                                      n = tt.length;
                                                  n--;
                                              )
                                                  if ((e = tt[n] + t) in nt)
                                                      return e;
                                          })(e) || e))
                            );
                        }
                        var ot = /^(none|table(?!-c[ea]).+)/,
                            at = {
                                position: "absolute",
                                visibility: "hidden",
                                display: "block",
                            },
                            st = { letterSpacing: "0", fontWeight: "400" };
                        function ut(e, t, n) {
                            var r = pe.exec(t);
                            return r
                                ? Math.max(0, r[2] - (n || 0)) + (r[3] || "px")
                                : t;
                        }
                        function lt(e, t, n, r, i, o) {
                            var a = "width" === t ? 1 : 0,
                                s = 0,
                                u = 0,
                                l = 0;
                            if (n === (r ? "border" : "content")) return 0;
                            for (; a < 4; a += 2)
                                ("margin" === n &&
                                    (l += A.css(e, n + he[a], !0, i)),
                                    r
                                        ? ("content" === n &&
                                              (u -= A.css(
                                                  e,
                                                  "padding" + he[a],
                                                  !0,
                                                  i,
                                              )),
                                          "margin" !== n &&
                                              (u -= A.css(
                                                  e,
                                                  "border" + he[a] + "Width",
                                                  !0,
                                                  i,
                                              )))
                                        : ((u += A.css(
                                              e,
                                              "padding" + he[a],
                                              !0,
                                              i,
                                          )),
                                          "padding" !== n
                                              ? (u += A.css(
                                                    e,
                                                    "border" + he[a] + "Width",
                                                    !0,
                                                    i,
                                                ))
                                              : (s += A.css(
                                                    e,
                                                    "border" + he[a] + "Width",
                                                    !0,
                                                    i,
                                                ))));
                            return (
                                !r &&
                                    o >= 0 &&
                                    (u +=
                                        Math.max(
                                            0,
                                            Math.ceil(
                                                e[
                                                    "offset" +
                                                        t[0].toUpperCase() +
                                                        t.slice(1)
                                                ] -
                                                    o -
                                                    u -
                                                    s -
                                                    0.5,
                                            ),
                                        ) || 0),
                                u + l
                            );
                        }
                        function ct(e, t, n) {
                            var r = Je(e),
                                i =
                                    (!v.boxSizingReliable() || n) &&
                                    "border-box" ===
                                        A.css(e, "boxSizing", !1, r),
                                o = i,
                                a = Ke(e, t, r),
                                s = "offset" + t[0].toUpperCase() + t.slice(1);
                            if (Xe.test(a)) {
                                if (!n) return a;
                                a = "auto";
                            }
                            return (
                                ((!v.boxSizingReliable() && i) ||
                                    (!v.reliableTrDimensions() && k(e, "tr")) ||
                                    "auto" === a ||
                                    (!parseFloat(a) &&
                                        "inline" ===
                                            A.css(e, "display", !1, r))) &&
                                    e.getClientRects().length &&
                                    ((i =
                                        "border-box" ===
                                        A.css(e, "boxSizing", !1, r)),
                                    (o = s in e) && (a = e[s])),
                                (a = parseFloat(a) || 0) +
                                    lt(
                                        e,
                                        t,
                                        n || (i ? "border" : "content"),
                                        o,
                                        r,
                                        a,
                                    ) +
                                    "px"
                            );
                        }
                        function ft(e, t, n, r, i) {
                            return new ft.prototype.init(e, t, n, r, i);
                        }
                        (A.extend({
                            cssHooks: {
                                opacity: {
                                    get: function (e, t) {
                                        if (t) {
                                            var n = Ke(e, "opacity");
                                            return "" === n ? "1" : n;
                                        }
                                    },
                                },
                            },
                            cssNumber: {
                                animationIterationCount: !0,
                                aspectRatio: !0,
                                borderImageSlice: !0,
                                columnCount: !0,
                                flexGrow: !0,
                                flexShrink: !0,
                                fontWeight: !0,
                                gridArea: !0,
                                gridColumn: !0,
                                gridColumnEnd: !0,
                                gridColumnStart: !0,
                                gridRow: !0,
                                gridRowEnd: !0,
                                gridRowStart: !0,
                                lineHeight: !0,
                                opacity: !0,
                                order: !0,
                                orphans: !0,
                                scale: !0,
                                widows: !0,
                                zIndex: !0,
                                zoom: !0,
                                fillOpacity: !0,
                                floodOpacity: !0,
                                stopOpacity: !0,
                                strokeMiterlimit: !0,
                                strokeOpacity: !0,
                            },
                            cssProps: {},
                            style: function (e, t, n, r) {
                                if (
                                    e &&
                                    3 !== e.nodeType &&
                                    8 !== e.nodeType &&
                                    e.style
                                ) {
                                    var i,
                                        o,
                                        a,
                                        s = ie(t),
                                        u = Ge.test(t),
                                        l = e.style;
                                    if (
                                        (u || (t = it(s)),
                                        (a = A.cssHooks[t] || A.cssHooks[s]),
                                        void 0 === n)
                                    )
                                        return a &&
                                            "get" in a &&
                                            void 0 !== (i = a.get(e, !1, r))
                                            ? i
                                            : l[t];
                                    ("string" === (o = typeof n) &&
                                        (i = pe.exec(n)) &&
                                        i[1] &&
                                        ((n = be(e, t, i)), (o = "number")),
                                        null != n &&
                                            n == n &&
                                            ("number" !== o ||
                                                u ||
                                                (n +=
                                                    (i && i[3]) ||
                                                    (A.cssNumber[s]
                                                        ? ""
                                                        : "px")),
                                            v.clearCloneStyle ||
                                                "" !== n ||
                                                0 !== t.indexOf("background") ||
                                                (l[t] = "inherit"),
                                            (a &&
                                                "set" in a &&
                                                void 0 ===
                                                    (n = a.set(e, n, r))) ||
                                                (u
                                                    ? l.setProperty(t, n)
                                                    : (l[t] = n))));
                                }
                            },
                            css: function (e, t, n, r) {
                                var i,
                                    o,
                                    a,
                                    s = ie(t);
                                return (
                                    Ge.test(t) || (t = it(s)),
                                    (a = A.cssHooks[t] || A.cssHooks[s]) &&
                                        "get" in a &&
                                        (i = a.get(e, !0, n)),
                                    void 0 === i && (i = Ke(e, t, r)),
                                    "normal" === i && t in st && (i = st[t]),
                                    "" === n || n
                                        ? ((o = parseFloat(i)),
                                          !0 === n || isFinite(o) ? o || 0 : i)
                                        : i
                                );
                            },
                        }),
                            A.each(["height", "width"], function (e, t) {
                                A.cssHooks[t] = {
                                    get: function (e, n, r) {
                                        if (n)
                                            return !ot.test(
                                                A.css(e, "display"),
                                            ) ||
                                                (e.getClientRects().length &&
                                                    e.getBoundingClientRect()
                                                        .width)
                                                ? ct(e, t, r)
                                                : Qe(e, at, function () {
                                                      return ct(e, t, r);
                                                  });
                                    },
                                    set: function (e, n, r) {
                                        var i,
                                            o = Je(e),
                                            a =
                                                !v.scrollboxSize() &&
                                                "absolute" === o.position,
                                            s =
                                                (a || r) &&
                                                "border-box" ===
                                                    A.css(
                                                        e,
                                                        "boxSizing",
                                                        !1,
                                                        o,
                                                    ),
                                            u = r ? lt(e, t, r, s, o) : 0;
                                        return (
                                            s &&
                                                a &&
                                                (u -= Math.ceil(
                                                    e[
                                                        "offset" +
                                                            t[0].toUpperCase() +
                                                            t.slice(1)
                                                    ] -
                                                        parseFloat(o[t]) -
                                                        lt(
                                                            e,
                                                            t,
                                                            "border",
                                                            !1,
                                                            o,
                                                        ) -
                                                        0.5,
                                                )),
                                            u &&
                                                (i = pe.exec(n)) &&
                                                "px" !== (i[3] || "px") &&
                                                ((e.style[t] = n),
                                                (n = A.css(e, t))),
                                            ut(0, n, u)
                                        );
                                    },
                                };
                            }),
                            (A.cssHooks.marginLeft = et(
                                v.reliableMarginLeft,
                                function (e, t) {
                                    if (t)
                                        return (
                                            (parseFloat(Ke(e, "marginLeft")) ||
                                                e.getBoundingClientRect().left -
                                                    Qe(
                                                        e,
                                                        { marginLeft: 0 },
                                                        function () {
                                                            return e.getBoundingClientRect()
                                                                .left;
                                                        },
                                                    )) + "px"
                                        );
                                },
                            )),
                            A.each(
                                { margin: "", padding: "", border: "Width" },
                                function (e, t) {
                                    ((A.cssHooks[e + t] = {
                                        expand: function (n) {
                                            for (
                                                var r = 0,
                                                    i = {},
                                                    o =
                                                        "string" == typeof n
                                                            ? n.split(" ")
                                                            : [n];
                                                r < 4;
                                                r++
                                            )
                                                i[e + he[r] + t] =
                                                    o[r] || o[r - 2] || o[0];
                                            return i;
                                        },
                                    }),
                                        "margin" !== e &&
                                            (A.cssHooks[e + t].set = ut));
                                },
                            ),
                            A.fn.extend({
                                css: function (e, t) {
                                    return ee(
                                        this,
                                        function (e, t, n) {
                                            var r,
                                                i,
                                                o = {},
                                                a = 0;
                                            if (Array.isArray(t)) {
                                                for (
                                                    r = Je(e), i = t.length;
                                                    a < i;
                                                    a++
                                                )
                                                    o[t[a]] = A.css(
                                                        e,
                                                        t[a],
                                                        !1,
                                                        r,
                                                    );
                                                return o;
                                            }
                                            return void 0 !== n
                                                ? A.style(e, t, n)
                                                : A.css(e, t);
                                        },
                                        e,
                                        t,
                                        arguments.length > 1,
                                    );
                                },
                            }),
                            (A.Tween = ft),
                            (ft.prototype = {
                                constructor: ft,
                                init: function (e, t, n, r, i, o) {
                                    ((this.elem = e),
                                        (this.prop = n),
                                        (this.easing = i || A.easing._default),
                                        (this.options = t),
                                        (this.start = this.now = this.cur()),
                                        (this.end = r),
                                        (this.unit =
                                            o || (A.cssNumber[n] ? "" : "px")));
                                },
                                cur: function () {
                                    var e = ft.propHooks[this.prop];
                                    return e && e.get
                                        ? e.get(this)
                                        : ft.propHooks._default.get(this);
                                },
                                run: function (e) {
                                    var t,
                                        n = ft.propHooks[this.prop];
                                    return (
                                        this.options.duration
                                            ? (this.pos = t =
                                                  A.easing[this.easing](
                                                      e,
                                                      this.options.duration * e,
                                                      0,
                                                      1,
                                                      this.options.duration,
                                                  ))
                                            : (this.pos = t = e),
                                        (this.now =
                                            (this.end - this.start) * t +
                                            this.start),
                                        this.options.step &&
                                            this.options.step.call(
                                                this.elem,
                                                this.now,
                                                this,
                                            ),
                                        n && n.set
                                            ? n.set(this)
                                            : ft.propHooks._default.set(this),
                                        this
                                    );
                                },
                            }),
                            (ft.prototype.init.prototype = ft.prototype),
                            (ft.propHooks = {
                                _default: {
                                    get: function (e) {
                                        var t;
                                        return 1 !== e.elem.nodeType ||
                                            (null != e.elem[e.prop] &&
                                                null == e.elem.style[e.prop])
                                            ? e.elem[e.prop]
                                            : (t = A.css(e.elem, e.prop, "")) &&
                                                "auto" !== t
                                              ? t
                                              : 0;
                                    },
                                    set: function (e) {
                                        A.fx.step[e.prop]
                                            ? A.fx.step[e.prop](e)
                                            : 1 !== e.elem.nodeType ||
                                                (!A.cssHooks[e.prop] &&
                                                    null ==
                                                        e.elem.style[
                                                            it(e.prop)
                                                        ])
                                              ? (e.elem[e.prop] = e.now)
                                              : A.style(
                                                    e.elem,
                                                    e.prop,
                                                    e.now + e.unit,
                                                );
                                    },
                                },
                            }),
                            (ft.propHooks.scrollTop = ft.propHooks.scrollLeft =
                                {
                                    set: function (e) {
                                        e.elem.nodeType &&
                                            e.elem.parentNode &&
                                            (e.elem[e.prop] = e.now);
                                    },
                                }),
                            (A.easing = {
                                linear: function (e) {
                                    return e;
                                },
                                swing: function (e) {
                                    return 0.5 - Math.cos(e * Math.PI) / 2;
                                },
                                _default: "swing",
                            }),
                            (A.fx = ft.prototype.init),
                            (A.fx.step = {}));
                        var dt,
                            pt,
                            ht = /^(?:toggle|show|hide)$/,
                            mt = /queueHooks$/;
                        function vt() {
                            pt &&
                                (!1 === b.hidden && r.requestAnimationFrame
                                    ? r.requestAnimationFrame(vt)
                                    : r.setTimeout(vt, A.fx.interval),
                                A.fx.tick());
                        }
                        function gt() {
                            return (
                                r.setTimeout(function () {
                                    dt = void 0;
                                }),
                                (dt = Date.now())
                            );
                        }
                        function yt(e, t) {
                            var n,
                                r = 0,
                                i = { height: e };
                            for (t = t ? 1 : 0; r < 4; r += 2 - t)
                                i["margin" + (n = he[r])] = i["padding" + n] =
                                    e;
                            return (t && (i.opacity = i.width = e), i);
                        }
                        function bt(e, t, n) {
                            for (
                                var r,
                                    i = (xt.tweeners[t] || []).concat(
                                        xt.tweeners["*"],
                                    ),
                                    o = 0,
                                    a = i.length;
                                o < a;
                                o++
                            )
                                if ((r = i[o].call(n, t, e))) return r;
                        }
                        function xt(e, t, n) {
                            var r,
                                i,
                                o = 0,
                                a = xt.prefilters.length,
                                s = A.Deferred().always(function () {
                                    delete u.elem;
                                }),
                                u = function () {
                                    if (i) return !1;
                                    for (
                                        var t = dt || gt(),
                                            n = Math.max(
                                                0,
                                                l.startTime + l.duration - t,
                                            ),
                                            r = 1 - (n / l.duration || 0),
                                            o = 0,
                                            a = l.tweens.length;
                                        o < a;
                                        o++
                                    )
                                        l.tweens[o].run(r);
                                    return (
                                        s.notifyWith(e, [l, r, n]),
                                        r < 1 && a
                                            ? n
                                            : (a || s.notifyWith(e, [l, 1, 0]),
                                              s.resolveWith(e, [l]),
                                              !1)
                                    );
                                },
                                l = s.promise({
                                    elem: e,
                                    props: A.extend({}, t),
                                    opts: A.extend(
                                        !0,
                                        {
                                            specialEasing: {},
                                            easing: A.easing._default,
                                        },
                                        n,
                                    ),
                                    originalProperties: t,
                                    originalOptions: n,
                                    startTime: dt || gt(),
                                    duration: n.duration,
                                    tweens: [],
                                    createTween: function (t, n) {
                                        var r = A.Tween(
                                            e,
                                            l.opts,
                                            t,
                                            n,
                                            l.opts.specialEasing[t] ||
                                                l.opts.easing,
                                        );
                                        return (l.tweens.push(r), r);
                                    },
                                    stop: function (t) {
                                        var n = 0,
                                            r = t ? l.tweens.length : 0;
                                        if (i) return this;
                                        for (i = !0; n < r; n++)
                                            l.tweens[n].run(1);
                                        return (
                                            t
                                                ? (s.notifyWith(e, [l, 1, 0]),
                                                  s.resolveWith(e, [l, t]))
                                                : s.rejectWith(e, [l, t]),
                                            this
                                        );
                                    },
                                }),
                                c = l.props;
                            for (
                                !(function (e, t) {
                                    var n, r, i, o, a;
                                    for (n in e)
                                        if (
                                            ((i = t[(r = ie(n))]),
                                            (o = e[n]),
                                            Array.isArray(o) &&
                                                ((i = o[1]), (o = e[n] = o[0])),
                                            n !== r &&
                                                ((e[r] = o), delete e[n]),
                                            (a = A.cssHooks[r]) &&
                                                ("expand" in a))
                                        )
                                            for (n in ((o = a.expand(o)),
                                            delete e[r],
                                            o))
                                                (n in e) ||
                                                    ((e[n] = o[n]), (t[n] = i));
                                        else t[r] = i;
                                })(c, l.opts.specialEasing);
                                o < a;
                                o++
                            )
                                if (
                                    (r = xt.prefilters[o].call(l, e, c, l.opts))
                                )
                                    return (
                                        g(r.stop) &&
                                            (A._queueHooks(
                                                l.elem,
                                                l.opts.queue,
                                            ).stop = r.stop.bind(r)),
                                        r
                                    );
                            return (
                                A.map(c, bt, l),
                                g(l.opts.start) && l.opts.start.call(e, l),
                                l
                                    .progress(l.opts.progress)
                                    .done(l.opts.done, l.opts.complete)
                                    .fail(l.opts.fail)
                                    .always(l.opts.always),
                                A.fx.timer(
                                    A.extend(u, {
                                        elem: e,
                                        anim: l,
                                        queue: l.opts.queue,
                                    }),
                                ),
                                l
                            );
                        }
                        ((A.Animation = A.extend(xt, {
                            tweeners: {
                                "*": [
                                    function (e, t) {
                                        var n = this.createTween(e, t);
                                        return (
                                            be(n.elem, e, pe.exec(t), n),
                                            n
                                        );
                                    },
                                ],
                            },
                            tweener: function (e, t) {
                                g(e)
                                    ? ((t = e), (e = ["*"]))
                                    : (e = e.match(Y));
                                for (var n, r = 0, i = e.length; r < i; r++)
                                    ((n = e[r]),
                                        (xt.tweeners[n] = xt.tweeners[n] || []),
                                        xt.tweeners[n].unshift(t));
                            },
                            prefilters: [
                                function (e, t, n) {
                                    var r,
                                        i,
                                        o,
                                        a,
                                        s,
                                        u,
                                        l,
                                        c,
                                        f = "width" in t || "height" in t,
                                        d = this,
                                        p = {},
                                        h = e.style,
                                        m = e.nodeType && ye(e),
                                        v = se.get(e, "fxshow");
                                    for (r in (n.queue ||
                                        (null ==
                                            (a = A._queueHooks(e, "fx"))
                                                .unqueued &&
                                            ((a.unqueued = 0),
                                            (s = a.empty.fire),
                                            (a.empty.fire = function () {
                                                a.unqueued || s();
                                            })),
                                        a.unqueued++,
                                        d.always(function () {
                                            d.always(function () {
                                                (a.unqueued--,
                                                    A.queue(e, "fx").length ||
                                                        a.empty.fire());
                                            });
                                        })),
                                    t))
                                        if (((i = t[r]), ht.test(i))) {
                                            if (
                                                (delete t[r],
                                                (o = o || "toggle" === i),
                                                i === (m ? "hide" : "show"))
                                            ) {
                                                if (
                                                    "show" !== i ||
                                                    !v ||
                                                    void 0 === v[r]
                                                )
                                                    continue;
                                                m = !0;
                                            }
                                            p[r] = (v && v[r]) || A.style(e, r);
                                        }
                                    if (
                                        (u = !A.isEmptyObject(t)) ||
                                        !A.isEmptyObject(p)
                                    )
                                        for (r in (f &&
                                            1 === e.nodeType &&
                                            ((n.overflow = [
                                                h.overflow,
                                                h.overflowX,
                                                h.overflowY,
                                            ]),
                                            null == (l = v && v.display) &&
                                                (l = se.get(e, "display")),
                                            "none" ===
                                                (c = A.css(e, "display")) &&
                                                (l
                                                    ? (c = l)
                                                    : (Te([e], !0),
                                                      (l =
                                                          e.style.display || l),
                                                      (c = A.css(e, "display")),
                                                      Te([e]))),
                                            ("inline" === c ||
                                                ("inline-block" === c &&
                                                    null != l)) &&
                                                "none" === A.css(e, "float") &&
                                                (u ||
                                                    (d.done(function () {
                                                        h.display = l;
                                                    }),
                                                    null == l &&
                                                        ((c = h.display),
                                                        (l =
                                                            "none" === c
                                                                ? ""
                                                                : c))),
                                                (h.display = "inline-block"))),
                                        n.overflow &&
                                            ((h.overflow = "hidden"),
                                            d.always(function () {
                                                ((h.overflow = n.overflow[0]),
                                                    (h.overflowX =
                                                        n.overflow[1]),
                                                    (h.overflowY =
                                                        n.overflow[2]));
                                            })),
                                        (u = !1),
                                        p))
                                            (u ||
                                                (v
                                                    ? "hidden" in v &&
                                                      (m = v.hidden)
                                                    : (v = se.access(
                                                          e,
                                                          "fxshow",
                                                          { display: l },
                                                      )),
                                                o && (v.hidden = !m),
                                                m && Te([e], !0),
                                                d.done(function () {
                                                    for (r in (m || Te([e]),
                                                    se.remove(e, "fxshow"),
                                                    p))
                                                        A.style(e, r, p[r]);
                                                })),
                                                (u = bt(m ? v[r] : 0, r, d)),
                                                r in v ||
                                                    ((v[r] = u.start),
                                                    m &&
                                                        ((u.end = u.start),
                                                        (u.start = 0))));
                                },
                            ],
                            prefilter: function (e, t) {
                                t
                                    ? xt.prefilters.unshift(e)
                                    : xt.prefilters.push(e);
                            },
                        })),
                            (A.speed = function (e, t, n) {
                                var r =
                                    e && "object" == typeof e
                                        ? A.extend({}, e)
                                        : {
                                              complete:
                                                  n || (!n && t) || (g(e) && e),
                                              duration: e,
                                              easing:
                                                  (n && t) || (t && !g(t) && t),
                                          };
                                return (
                                    A.fx.off
                                        ? (r.duration = 0)
                                        : "number" != typeof r.duration &&
                                          (r.duration in A.fx.speeds
                                              ? (r.duration =
                                                    A.fx.speeds[r.duration])
                                              : (r.duration =
                                                    A.fx.speeds._default)),
                                    (null != r.queue && !0 !== r.queue) ||
                                        (r.queue = "fx"),
                                    (r.old = r.complete),
                                    (r.complete = function () {
                                        (g(r.old) && r.old.call(this),
                                            r.queue &&
                                                A.dequeue(this, r.queue));
                                    }),
                                    r
                                );
                            }),
                            A.fn.extend({
                                fadeTo: function (e, t, n, r) {
                                    return this.filter(ye)
                                        .css("opacity", 0)
                                        .show()
                                        .end()
                                        .animate({ opacity: t }, e, n, r);
                                },
                                animate: function (e, t, n, r) {
                                    var i = A.isEmptyObject(e),
                                        o = A.speed(t, n, r),
                                        a = function () {
                                            var t = xt(
                                                this,
                                                A.extend({}, e),
                                                o,
                                            );
                                            (i || se.get(this, "finish")) &&
                                                t.stop(!0);
                                        };
                                    return (
                                        (a.finish = a),
                                        i || !1 === o.queue
                                            ? this.each(a)
                                            : this.queue(o.queue, a)
                                    );
                                },
                                stop: function (e, t, n) {
                                    var r = function (e) {
                                        var t = e.stop;
                                        (delete e.stop, t(n));
                                    };
                                    return (
                                        "string" != typeof e &&
                                            ((n = t), (t = e), (e = void 0)),
                                        t && this.queue(e || "fx", []),
                                        this.each(function () {
                                            var t = !0,
                                                i =
                                                    null != e &&
                                                    e + "queueHooks",
                                                o = A.timers,
                                                a = se.get(this);
                                            if (i) a[i] && a[i].stop && r(a[i]);
                                            else
                                                for (i in a)
                                                    a[i] &&
                                                        a[i].stop &&
                                                        mt.test(i) &&
                                                        r(a[i]);
                                            for (i = o.length; i--; )
                                                o[i].elem !== this ||
                                                    (null != e &&
                                                        o[i].queue !== e) ||
                                                    (o[i].anim.stop(n),
                                                    (t = !1),
                                                    o.splice(i, 1));
                                            (!t && n) || A.dequeue(this, e);
                                        })
                                    );
                                },
                                finish: function (e) {
                                    return (
                                        !1 !== e && (e = e || "fx"),
                                        this.each(function () {
                                            var t,
                                                n = se.get(this),
                                                r = n[e + "queue"],
                                                i = n[e + "queueHooks"],
                                                o = A.timers,
                                                a = r ? r.length : 0;
                                            for (
                                                n.finish = !0,
                                                    A.queue(this, e, []),
                                                    i &&
                                                        i.stop &&
                                                        i.stop.call(this, !0),
                                                    t = o.length;
                                                t--;
                                            )
                                                o[t].elem === this &&
                                                    o[t].queue === e &&
                                                    (o[t].anim.stop(!0),
                                                    o.splice(t, 1));
                                            for (t = 0; t < a; t++)
                                                r[t] &&
                                                    r[t].finish &&
                                                    r[t].finish.call(this);
                                            delete n.finish;
                                        })
                                    );
                                },
                            }),
                            A.each(["toggle", "show", "hide"], function (e, t) {
                                var n = A.fn[t];
                                A.fn[t] = function (e, r, i) {
                                    return null == e || "boolean" == typeof e
                                        ? n.apply(this, arguments)
                                        : this.animate(yt(t, !0), e, r, i);
                                };
                            }),
                            A.each(
                                {
                                    slideDown: yt("show"),
                                    slideUp: yt("hide"),
                                    slideToggle: yt("toggle"),
                                    fadeIn: { opacity: "show" },
                                    fadeOut: { opacity: "hide" },
                                    fadeToggle: { opacity: "toggle" },
                                },
                                function (e, t) {
                                    A.fn[e] = function (e, n, r) {
                                        return this.animate(t, e, n, r);
                                    };
                                },
                            ),
                            (A.timers = []),
                            (A.fx.tick = function () {
                                var e,
                                    t = 0,
                                    n = A.timers;
                                for (dt = Date.now(); t < n.length; t++)
                                    (e = n[t])() ||
                                        n[t] !== e ||
                                        n.splice(t--, 1);
                                (n.length || A.fx.stop(), (dt = void 0));
                            }),
                            (A.fx.timer = function (e) {
                                (A.timers.push(e), A.fx.start());
                            }),
                            (A.fx.interval = 13),
                            (A.fx.start = function () {
                                pt || ((pt = !0), vt());
                            }),
                            (A.fx.stop = function () {
                                pt = null;
                            }),
                            (A.fx.speeds = {
                                slow: 600,
                                fast: 200,
                                _default: 400,
                            }),
                            (A.fn.delay = function (e, t) {
                                return (
                                    (e = (A.fx && A.fx.speeds[e]) || e),
                                    (t = t || "fx"),
                                    this.queue(t, function (t, n) {
                                        var i = r.setTimeout(t, e);
                                        n.stop = function () {
                                            r.clearTimeout(i);
                                        };
                                    })
                                );
                            }),
                            (function () {
                                var e = b.createElement("input"),
                                    t = b
                                        .createElement("select")
                                        .appendChild(b.createElement("option"));
                                ((e.type = "checkbox"),
                                    (v.checkOn = "" !== e.value),
                                    (v.optSelected = t.selected),
                                    ((e = b.createElement("input")).value =
                                        "t"),
                                    (e.type = "radio"),
                                    (v.radioValue = "t" === e.value));
                            })());
                        var wt,
                            Tt = A.expr.attrHandle;
                        (A.fn.extend({
                            attr: function (e, t) {
                                return ee(
                                    this,
                                    A.attr,
                                    e,
                                    t,
                                    arguments.length > 1,
                                );
                            },
                            removeAttr: function (e) {
                                return this.each(function () {
                                    A.removeAttr(this, e);
                                });
                            },
                        }),
                            A.extend({
                                attr: function (e, t, n) {
                                    var r,
                                        i,
                                        o = e.nodeType;
                                    if (3 !== o && 8 !== o && 2 !== o)
                                        return void 0 === e.getAttribute
                                            ? A.prop(e, t, n)
                                            : ((1 === o && A.isXMLDoc(e)) ||
                                                  (i =
                                                      A.attrHooks[
                                                          t.toLowerCase()
                                                      ] ||
                                                      (A.expr.match.bool.test(t)
                                                          ? wt
                                                          : void 0)),
                                              void 0 !== n
                                                  ? null === n
                                                      ? void A.removeAttr(e, t)
                                                      : i &&
                                                          "set" in i &&
                                                          void 0 !==
                                                              (r = i.set(
                                                                  e,
                                                                  n,
                                                                  t,
                                                              ))
                                                        ? r
                                                        : (e.setAttribute(
                                                              t,
                                                              n + "",
                                                          ),
                                                          n)
                                                  : i &&
                                                      "get" in i &&
                                                      null !== (r = i.get(e, t))
                                                    ? r
                                                    : null ==
                                                        (r = A.find.attr(e, t))
                                                      ? void 0
                                                      : r);
                                },
                                attrHooks: {
                                    type: {
                                        set: function (e, t) {
                                            if (
                                                !v.radioValue &&
                                                "radio" === t &&
                                                k(e, "input")
                                            ) {
                                                var n = e.value;
                                                return (
                                                    e.setAttribute("type", t),
                                                    n && (e.value = n),
                                                    t
                                                );
                                            }
                                        },
                                    },
                                },
                                removeAttr: function (e, t) {
                                    var n,
                                        r = 0,
                                        i = t && t.match(Y);
                                    if (i && 1 === e.nodeType)
                                        for (; (n = i[r++]); )
                                            e.removeAttribute(n);
                                },
                            }),
                            (wt = {
                                set: function (e, t, n) {
                                    return (
                                        !1 === t
                                            ? A.removeAttr(e, n)
                                            : e.setAttribute(n, n),
                                        n
                                    );
                                },
                            }),
                            A.each(
                                A.expr.match.bool.source.match(/\w+/g),
                                function (e, t) {
                                    var n = Tt[t] || A.find.attr;
                                    Tt[t] = function (e, t, r) {
                                        var i,
                                            o,
                                            a = t.toLowerCase();
                                        return (
                                            r ||
                                                ((o = Tt[a]),
                                                (Tt[a] = i),
                                                (i =
                                                    null != n(e, t, r)
                                                        ? a
                                                        : null),
                                                (Tt[a] = o)),
                                            i
                                        );
                                    };
                                },
                            ));
                        var Ct = /^(?:input|select|textarea|button)$/i,
                            Et = /^(?:a|area)$/i;
                        function At(e) {
                            return (e.match(Y) || []).join(" ");
                        }
                        function St(e) {
                            return (
                                (e.getAttribute && e.getAttribute("class")) ||
                                ""
                            );
                        }
                        function kt(e) {
                            return Array.isArray(e)
                                ? e
                                : ("string" == typeof e && e.match(Y)) || [];
                        }
                        (A.fn.extend({
                            prop: function (e, t) {
                                return ee(
                                    this,
                                    A.prop,
                                    e,
                                    t,
                                    arguments.length > 1,
                                );
                            },
                            removeProp: function (e) {
                                return this.each(function () {
                                    delete this[A.propFix[e] || e];
                                });
                            },
                        }),
                            A.extend({
                                prop: function (e, t, n) {
                                    var r,
                                        i,
                                        o = e.nodeType;
                                    if (3 !== o && 8 !== o && 2 !== o)
                                        return (
                                            (1 === o && A.isXMLDoc(e)) ||
                                                ((t = A.propFix[t] || t),
                                                (i = A.propHooks[t])),
                                            void 0 !== n
                                                ? i &&
                                                  "set" in i &&
                                                  void 0 !==
                                                      (r = i.set(e, n, t))
                                                    ? r
                                                    : (e[t] = n)
                                                : i &&
                                                    "get" in i &&
                                                    null !== (r = i.get(e, t))
                                                  ? r
                                                  : e[t]
                                        );
                                },
                                propHooks: {
                                    tabIndex: {
                                        get: function (e) {
                                            var t = A.find.attr(e, "tabindex");
                                            return t
                                                ? parseInt(t, 10)
                                                : Ct.test(e.nodeName) ||
                                                    (Et.test(e.nodeName) &&
                                                        e.href)
                                                  ? 0
                                                  : -1;
                                        },
                                    },
                                },
                                propFix: { for: "htmlFor", class: "className" },
                            }),
                            v.optSelected ||
                                (A.propHooks.selected = {
                                    get: function (e) {
                                        var t = e.parentNode;
                                        return (
                                            t &&
                                                t.parentNode &&
                                                t.parentNode.selectedIndex,
                                            null
                                        );
                                    },
                                    set: function (e) {
                                        var t = e.parentNode;
                                        t &&
                                            (t.selectedIndex,
                                            t.parentNode &&
                                                t.parentNode.selectedIndex);
                                    },
                                }),
                            A.each(
                                [
                                    "tabIndex",
                                    "readOnly",
                                    "maxLength",
                                    "cellSpacing",
                                    "cellPadding",
                                    "rowSpan",
                                    "colSpan",
                                    "useMap",
                                    "frameBorder",
                                    "contentEditable",
                                ],
                                function () {
                                    A.propFix[this.toLowerCase()] = this;
                                },
                            ),
                            A.fn.extend({
                                addClass: function (e) {
                                    var t, n, r, i, o, a;
                                    return g(e)
                                        ? this.each(function (t) {
                                              A(this).addClass(
                                                  e.call(this, t, St(this)),
                                              );
                                          })
                                        : (t = kt(e)).length
                                          ? this.each(function () {
                                                if (
                                                    ((r = St(this)),
                                                    (n =
                                                        1 === this.nodeType &&
                                                        " " + At(r) + " "))
                                                ) {
                                                    for (
                                                        o = 0;
                                                        o < t.length;
                                                        o++
                                                    )
                                                        ((i = t[o]),
                                                            n.indexOf(
                                                                " " + i + " ",
                                                            ) < 0 &&
                                                                (n += i + " "));
                                                    ((a = At(n)),
                                                        r !== a &&
                                                            this.setAttribute(
                                                                "class",
                                                                a,
                                                            ));
                                                }
                                            })
                                          : this;
                                },
                                removeClass: function (e) {
                                    var t, n, r, i, o, a;
                                    return g(e)
                                        ? this.each(function (t) {
                                              A(this).removeClass(
                                                  e.call(this, t, St(this)),
                                              );
                                          })
                                        : arguments.length
                                          ? (t = kt(e)).length
                                              ? this.each(function () {
                                                    if (
                                                        ((r = St(this)),
                                                        (n =
                                                            1 ===
                                                                this.nodeType &&
                                                            " " + At(r) + " "))
                                                    ) {
                                                        for (
                                                            o = 0;
                                                            o < t.length;
                                                            o++
                                                        )
                                                            for (
                                                                i = t[o];
                                                                n.indexOf(
                                                                    " " +
                                                                        i +
                                                                        " ",
                                                                ) > -1;
                                                            )
                                                                n = n.replace(
                                                                    " " +
                                                                        i +
                                                                        " ",
                                                                    " ",
                                                                );
                                                        ((a = At(n)),
                                                            r !== a &&
                                                                this.setAttribute(
                                                                    "class",
                                                                    a,
                                                                ));
                                                    }
                                                })
                                              : this
                                          : this.attr("class", "");
                                },
                                toggleClass: function (e, t) {
                                    var n,
                                        r,
                                        i,
                                        o,
                                        a = typeof e,
                                        s = "string" === a || Array.isArray(e);
                                    return g(e)
                                        ? this.each(function (n) {
                                              A(this).toggleClass(
                                                  e.call(this, n, St(this), t),
                                                  t,
                                              );
                                          })
                                        : "boolean" == typeof t && s
                                          ? t
                                              ? this.addClass(e)
                                              : this.removeClass(e)
                                          : ((n = kt(e)),
                                            this.each(function () {
                                                if (s)
                                                    for (
                                                        o = A(this), i = 0;
                                                        i < n.length;
                                                        i++
                                                    )
                                                        ((r = n[i]),
                                                            o.hasClass(r)
                                                                ? o.removeClass(
                                                                      r,
                                                                  )
                                                                : o.addClass(
                                                                      r,
                                                                  ));
                                                else
                                                    (void 0 !== e &&
                                                        "boolean" !== a) ||
                                                        ((r = St(this)) &&
                                                            se.set(
                                                                this,
                                                                "__className__",
                                                                r,
                                                            ),
                                                        this.setAttribute &&
                                                            this.setAttribute(
                                                                "class",
                                                                r || !1 === e
                                                                    ? ""
                                                                    : se.get(
                                                                          this,
                                                                          "__className__",
                                                                      ) || "",
                                                            ));
                                            }));
                                },
                                hasClass: function (e) {
                                    var t,
                                        n,
                                        r = 0;
                                    for (t = " " + e + " "; (n = this[r++]); )
                                        if (
                                            1 === n.nodeType &&
                                            (" " + At(St(n)) + " ").indexOf(t) >
                                                -1
                                        )
                                            return !0;
                                    return !1;
                                },
                            }));
                        var Dt = /\r/g;
                        (A.fn.extend({
                            val: function (e) {
                                var t,
                                    n,
                                    r,
                                    i = this[0];
                                return arguments.length
                                    ? ((r = g(e)),
                                      this.each(function (n) {
                                          var i;
                                          1 === this.nodeType &&
                                              (null ==
                                              (i = r
                                                  ? e.call(
                                                        this,
                                                        n,
                                                        A(this).val(),
                                                    )
                                                  : e)
                                                  ? (i = "")
                                                  : "number" == typeof i
                                                    ? (i += "")
                                                    : Array.isArray(i) &&
                                                      (i = A.map(
                                                          i,
                                                          function (e) {
                                                              return null == e
                                                                  ? ""
                                                                  : e + "";
                                                          },
                                                      )),
                                              ((t =
                                                  A.valHooks[this.type] ||
                                                  A.valHooks[
                                                      this.nodeName.toLowerCase()
                                                  ]) &&
                                                  "set" in t &&
                                                  void 0 !==
                                                      t.set(
                                                          this,
                                                          i,
                                                          "value",
                                                      )) ||
                                                  (this.value = i));
                                      }))
                                    : i
                                      ? (t =
                                            A.valHooks[i.type] ||
                                            A.valHooks[
                                                i.nodeName.toLowerCase()
                                            ]) &&
                                        "get" in t &&
                                        void 0 !== (n = t.get(i, "value"))
                                          ? n
                                          : "string" == typeof (n = i.value)
                                            ? n.replace(Dt, "")
                                            : null == n
                                              ? ""
                                              : n
                                      : void 0;
                            },
                        }),
                            A.extend({
                                valHooks: {
                                    option: {
                                        get: function (e) {
                                            var t = A.find.attr(e, "value");
                                            return null != t
                                                ? t
                                                : At(A.text(e));
                                        },
                                    },
                                    select: {
                                        get: function (e) {
                                            var t,
                                                n,
                                                r,
                                                i = e.options,
                                                o = e.selectedIndex,
                                                a = "select-one" === e.type,
                                                s = a ? null : [],
                                                u = a ? o + 1 : i.length;
                                            for (
                                                r = o < 0 ? u : a ? o : 0;
                                                r < u;
                                                r++
                                            )
                                                if (
                                                    ((n = i[r]).selected ||
                                                        r === o) &&
                                                    !n.disabled &&
                                                    (!n.parentNode.disabled ||
                                                        !k(
                                                            n.parentNode,
                                                            "optgroup",
                                                        ))
                                                ) {
                                                    if (((t = A(n).val()), a))
                                                        return t;
                                                    s.push(t);
                                                }
                                            return s;
                                        },
                                        set: function (e, t) {
                                            for (
                                                var n,
                                                    r,
                                                    i = e.options,
                                                    o = A.makeArray(t),
                                                    a = i.length;
                                                a--;
                                            )
                                                ((r = i[a]).selected =
                                                    A.inArray(
                                                        A.valHooks.option.get(
                                                            r,
                                                        ),
                                                        o,
                                                    ) > -1) && (n = !0);
                                            return (
                                                n || (e.selectedIndex = -1),
                                                o
                                            );
                                        },
                                    },
                                },
                            }),
                            A.each(["radio", "checkbox"], function () {
                                ((A.valHooks[this] = {
                                    set: function (e, t) {
                                        if (Array.isArray(t))
                                            return (e.checked =
                                                A.inArray(A(e).val(), t) > -1);
                                    },
                                }),
                                    v.checkOn ||
                                        (A.valHooks[this].get = function (e) {
                                            return null ===
                                                e.getAttribute("value")
                                                ? "on"
                                                : e.value;
                                        }));
                            }));
                        var Nt = r.location,
                            Lt = { guid: Date.now() },
                            Mt = /\?/;
                        A.parseXML = function (e) {
                            var t, n;
                            if (!e || "string" != typeof e) return null;
                            try {
                                t = new r.DOMParser().parseFromString(
                                    e,
                                    "text/xml",
                                );
                            } catch (e) {}
                            return (
                                (n =
                                    t &&
                                    t.getElementsByTagName("parsererror")[0]),
                                (t && !n) ||
                                    A.error(
                                        "Invalid XML: " +
                                            (n
                                                ? A.map(
                                                      n.childNodes,
                                                      function (e) {
                                                          return e.textContent;
                                                      },
                                                  ).join("\n")
                                                : e),
                                    ),
                                t
                            );
                        };
                        var Ot = /^(?:focusinfocus|focusoutblur)$/,
                            jt = function (e) {
                                e.stopPropagation();
                            };
                        (A.extend(A.event, {
                            trigger: function (e, t, n, i) {
                                var o,
                                    a,
                                    s,
                                    u,
                                    l,
                                    c,
                                    f,
                                    d,
                                    h = [n || b],
                                    m = p.call(e, "type") ? e.type : e,
                                    v = p.call(e, "namespace")
                                        ? e.namespace.split(".")
                                        : [];
                                if (
                                    ((a = d = s = n = n || b),
                                    3 !== n.nodeType &&
                                        8 !== n.nodeType &&
                                        !Ot.test(m + A.event.triggered) &&
                                        (m.indexOf(".") > -1 &&
                                            ((v = m.split(".")),
                                            (m = v.shift()),
                                            v.sort()),
                                        (l = m.indexOf(":") < 0 && "on" + m),
                                        ((e = e[A.expando]
                                            ? e
                                            : new A.Event(
                                                  m,
                                                  "object" == typeof e && e,
                                              )).isTrigger = i ? 2 : 3),
                                        (e.namespace = v.join(".")),
                                        (e.rnamespace = e.namespace
                                            ? new RegExp(
                                                  "(^|\\.)" +
                                                      v.join("\\.(?:.*\\.|)") +
                                                      "(\\.|$)",
                                              )
                                            : null),
                                        (e.result = void 0),
                                        e.target || (e.target = n),
                                        (t =
                                            null == t
                                                ? [e]
                                                : A.makeArray(t, [e])),
                                        (f = A.event.special[m] || {}),
                                        i ||
                                            !f.trigger ||
                                            !1 !== f.trigger.apply(n, t)))
                                ) {
                                    if (!i && !f.noBubble && !y(n)) {
                                        for (
                                            u = f.delegateType || m,
                                                Ot.test(u + m) ||
                                                    (a = a.parentNode);
                                            a;
                                            a = a.parentNode
                                        )
                                            (h.push(a), (s = a));
                                        s === (n.ownerDocument || b) &&
                                            h.push(
                                                s.defaultView ||
                                                    s.parentWindow ||
                                                    r,
                                            );
                                    }
                                    for (
                                        o = 0;
                                        (a = h[o++]) &&
                                        !e.isPropagationStopped();
                                    )
                                        ((d = a),
                                            (e.type =
                                                o > 1 ? u : f.bindType || m),
                                            (c =
                                                (se.get(a, "events") ||
                                                    Object.create(null))[
                                                    e.type
                                                ] && se.get(a, "handle")) &&
                                                c.apply(a, t),
                                            (c = l && a[l]) &&
                                                c.apply &&
                                                oe(a) &&
                                                ((e.result = c.apply(a, t)),
                                                !1 === e.result &&
                                                    e.preventDefault()));
                                    return (
                                        (e.type = m),
                                        i ||
                                            e.isDefaultPrevented() ||
                                            (f._default &&
                                                !1 !==
                                                    f._default.apply(
                                                        h.pop(),
                                                        t,
                                                    )) ||
                                            !oe(n) ||
                                            (l &&
                                                g(n[m]) &&
                                                !y(n) &&
                                                ((s = n[l]) && (n[l] = null),
                                                (A.event.triggered = m),
                                                e.isPropagationStopped() &&
                                                    d.addEventListener(m, jt),
                                                n[m](),
                                                e.isPropagationStopped() &&
                                                    d.removeEventListener(
                                                        m,
                                                        jt,
                                                    ),
                                                (A.event.triggered = void 0),
                                                s && (n[l] = s))),
                                        e.result
                                    );
                                }
                            },
                            simulate: function (e, t, n) {
                                var r = A.extend(new A.Event(), n, {
                                    type: e,
                                    isSimulated: !0,
                                });
                                A.event.trigger(r, null, t);
                            },
                        }),
                            A.fn.extend({
                                trigger: function (e, t) {
                                    return this.each(function () {
                                        A.event.trigger(e, t, this);
                                    });
                                },
                                triggerHandler: function (e, t) {
                                    var n = this[0];
                                    if (n) return A.event.trigger(e, t, n, !0);
                                },
                            }));
                        var Ht = /\[\]$/,
                            Pt = /\r?\n/g,
                            Bt = /^(?:submit|button|image|reset|file)$/i,
                            It = /^(?:input|select|textarea|keygen)/i;
                        function zt(e, t, n, r) {
                            var i;
                            if (Array.isArray(t))
                                A.each(t, function (t, i) {
                                    n || Ht.test(e)
                                        ? r(e, i)
                                        : zt(
                                              e +
                                                  "[" +
                                                  ("object" == typeof i &&
                                                  null != i
                                                      ? t
                                                      : "") +
                                                  "]",
                                              i,
                                              n,
                                              r,
                                          );
                                });
                            else if (n || "object" !== T(t)) r(e, t);
                            else for (i in t) zt(e + "[" + i + "]", t[i], n, r);
                        }
                        ((A.param = function (e, t) {
                            var n,
                                r = [],
                                i = function (e, t) {
                                    var n = g(t) ? t() : t;
                                    r[r.length] =
                                        encodeURIComponent(e) +
                                        "=" +
                                        encodeURIComponent(null == n ? "" : n);
                                };
                            if (null == e) return "";
                            if (
                                Array.isArray(e) ||
                                (e.jquery && !A.isPlainObject(e))
                            )
                                A.each(e, function () {
                                    i(this.name, this.value);
                                });
                            else for (n in e) zt(n, e[n], t, i);
                            return r.join("&");
                        }),
                            A.fn.extend({
                                serialize: function () {
                                    return A.param(this.serializeArray());
                                },
                                serializeArray: function () {
                                    return this.map(function () {
                                        var e = A.prop(this, "elements");
                                        return e ? A.makeArray(e) : this;
                                    })
                                        .filter(function () {
                                            var e = this.type;
                                            return (
                                                this.name &&
                                                !A(this).is(":disabled") &&
                                                It.test(this.nodeName) &&
                                                !Bt.test(e) &&
                                                (this.checked || !Ae.test(e))
                                            );
                                        })
                                        .map(function (e, t) {
                                            var n = A(this).val();
                                            return null == n
                                                ? null
                                                : Array.isArray(n)
                                                  ? A.map(n, function (e) {
                                                        return {
                                                            name: t.name,
                                                            value: e.replace(
                                                                Pt,
                                                                "\r\n",
                                                            ),
                                                        };
                                                    })
                                                  : {
                                                        name: t.name,
                                                        value: n.replace(
                                                            Pt,
                                                            "\r\n",
                                                        ),
                                                    };
                                        })
                                        .get();
                                },
                            }));
                        var qt = /%20/g,
                            Rt = /#.*$/,
                            Ft = /([?&])_=[^&]*/,
                            Wt = /^(.*?):[ \t]*([^\r\n]*)$/gm,
                            _t = /^(?:GET|HEAD)$/,
                            Ut = /^\/\//,
                            $t = {},
                            Vt = {},
                            Yt = "*/".concat("*"),
                            Xt = b.createElement("a");
                        function Gt(e) {
                            return function (t, n) {
                                "string" != typeof t && ((n = t), (t = "*"));
                                var r,
                                    i = 0,
                                    o = t.toLowerCase().match(Y) || [];
                                if (g(n))
                                    for (; (r = o[i++]); )
                                        "+" === r[0]
                                            ? ((r = r.slice(1) || "*"),
                                              (e[r] = e[r] || []).unshift(n))
                                            : (e[r] = e[r] || []).push(n);
                            };
                        }
                        function Jt(e, t, n, r) {
                            var i = {},
                                o = e === Vt;
                            function a(s) {
                                var u;
                                return (
                                    (i[s] = !0),
                                    A.each(e[s] || [], function (e, s) {
                                        var l = s(t, n, r);
                                        return "string" != typeof l || o || i[l]
                                            ? o
                                                ? !(u = l)
                                                : void 0
                                            : (t.dataTypes.unshift(l),
                                              a(l),
                                              !1);
                                    }),
                                    u
                                );
                            }
                            return a(t.dataTypes[0]) || (!i["*"] && a("*"));
                        }
                        function Qt(e, t) {
                            var n,
                                r,
                                i = A.ajaxSettings.flatOptions || {};
                            for (n in t)
                                void 0 !== t[n] &&
                                    ((i[n] ? e : r || (r = {}))[n] = t[n]);
                            return (r && A.extend(!0, e, r), e);
                        }
                        ((Xt.href = Nt.href),
                            A.extend({
                                active: 0,
                                lastModified: {},
                                etag: {},
                                ajaxSettings: {
                                    url: Nt.href,
                                    type: "GET",
                                    isLocal:
                                        /^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(
                                            Nt.protocol,
                                        ),
                                    global: !0,
                                    processData: !0,
                                    async: !0,
                                    contentType:
                                        "application/x-www-form-urlencoded; charset=UTF-8",
                                    accepts: {
                                        "*": Yt,
                                        text: "text/plain",
                                        html: "text/html",
                                        xml: "application/xml, text/xml",
                                        json: "application/json, text/javascript",
                                    },
                                    contents: {
                                        xml: /\bxml\b/,
                                        html: /\bhtml/,
                                        json: /\bjson\b/,
                                    },
                                    responseFields: {
                                        xml: "responseXML",
                                        text: "responseText",
                                        json: "responseJSON",
                                    },
                                    converters: {
                                        "* text": String,
                                        "text html": !0,
                                        "text json": JSON.parse,
                                        "text xml": A.parseXML,
                                    },
                                    flatOptions: { url: !0, context: !0 },
                                },
                                ajaxSetup: function (e, t) {
                                    return t
                                        ? Qt(Qt(e, A.ajaxSettings), t)
                                        : Qt(A.ajaxSettings, e);
                                },
                                ajaxPrefilter: Gt($t),
                                ajaxTransport: Gt(Vt),
                                ajax: function (e, t) {
                                    ("object" == typeof e &&
                                        ((t = e), (e = void 0)),
                                        (t = t || {}));
                                    var n,
                                        i,
                                        o,
                                        a,
                                        s,
                                        u,
                                        l,
                                        c,
                                        f,
                                        d,
                                        p = A.ajaxSetup({}, t),
                                        h = p.context || p,
                                        m =
                                            p.context &&
                                            (h.nodeType || h.jquery)
                                                ? A(h)
                                                : A.event,
                                        v = A.Deferred(),
                                        g = A.Callbacks("once memory"),
                                        y = p.statusCode || {},
                                        x = {},
                                        w = {},
                                        T = "canceled",
                                        C = {
                                            readyState: 0,
                                            getResponseHeader: function (e) {
                                                var t;
                                                if (l) {
                                                    if (!a)
                                                        for (
                                                            a = {};
                                                            (t = Wt.exec(o));
                                                        )
                                                            a[
                                                                t[1].toLowerCase() +
                                                                    " "
                                                            ] = (
                                                                a[
                                                                    t[1].toLowerCase() +
                                                                        " "
                                                                ] || []
                                                            ).concat(t[2]);
                                                    t =
                                                        a[
                                                            e.toLowerCase() +
                                                                " "
                                                        ];
                                                }
                                                return null == t
                                                    ? null
                                                    : t.join(", ");
                                            },
                                            getAllResponseHeaders: function () {
                                                return l ? o : null;
                                            },
                                            setRequestHeader: function (e, t) {
                                                return (
                                                    null == l &&
                                                        ((e = w[
                                                            e.toLowerCase()
                                                        ] =
                                                            w[
                                                                e.toLowerCase()
                                                            ] || e),
                                                        (x[e] = t)),
                                                    this
                                                );
                                            },
                                            overrideMimeType: function (e) {
                                                return (
                                                    null == l &&
                                                        (p.mimeType = e),
                                                    this
                                                );
                                            },
                                            statusCode: function (e) {
                                                var t;
                                                if (e)
                                                    if (l)
                                                        C.always(e[C.status]);
                                                    else
                                                        for (t in e)
                                                            y[t] = [y[t], e[t]];
                                                return this;
                                            },
                                            abort: function (e) {
                                                var t = e || T;
                                                return (
                                                    n && n.abort(t),
                                                    E(0, t),
                                                    this
                                                );
                                            },
                                        };
                                    if (
                                        (v.promise(C),
                                        (p.url = (
                                            (e || p.url || Nt.href) + ""
                                        ).replace(Ut, Nt.protocol + "//")),
                                        (p.type =
                                            t.method ||
                                            t.type ||
                                            p.method ||
                                            p.type),
                                        (p.dataTypes = (p.dataType || "*")
                                            .toLowerCase()
                                            .match(Y) || [""]),
                                        null == p.crossDomain)
                                    ) {
                                        u = b.createElement("a");
                                        try {
                                            ((u.href = p.url),
                                                (u.href = u.href),
                                                (p.crossDomain =
                                                    Xt.protocol +
                                                        "//" +
                                                        Xt.host !=
                                                    u.protocol +
                                                        "//" +
                                                        u.host));
                                        } catch (e) {
                                            p.crossDomain = !0;
                                        }
                                    }
                                    if (
                                        (p.data &&
                                            p.processData &&
                                            "string" != typeof p.data &&
                                            (p.data = A.param(
                                                p.data,
                                                p.traditional,
                                            )),
                                        Jt($t, p, t, C),
                                        l)
                                    )
                                        return C;
                                    for (f in ((c = A.event && p.global) &&
                                        0 == A.active++ &&
                                        A.event.trigger("ajaxStart"),
                                    (p.type = p.type.toUpperCase()),
                                    (p.hasContent = !_t.test(p.type)),
                                    (i = p.url.replace(Rt, "")),
                                    p.hasContent
                                        ? p.data &&
                                          p.processData &&
                                          0 ===
                                              (p.contentType || "").indexOf(
                                                  "application/x-www-form-urlencoded",
                                              ) &&
                                          (p.data = p.data.replace(qt, "+"))
                                        : ((d = p.url.slice(i.length)),
                                          p.data &&
                                              (p.processData ||
                                                  "string" == typeof p.data) &&
                                              ((i +=
                                                  (Mt.test(i) ? "&" : "?") +
                                                  p.data),
                                              delete p.data),
                                          !1 === p.cache &&
                                              ((i = i.replace(Ft, "$1")),
                                              (d =
                                                  (Mt.test(i) ? "&" : "?") +
                                                  "_=" +
                                                  Lt.guid++ +
                                                  d)),
                                          (p.url = i + d)),
                                    p.ifModified &&
                                        (A.lastModified[i] &&
                                            C.setRequestHeader(
                                                "If-Modified-Since",
                                                A.lastModified[i],
                                            ),
                                        A.etag[i] &&
                                            C.setRequestHeader(
                                                "If-None-Match",
                                                A.etag[i],
                                            )),
                                    ((p.data &&
                                        p.hasContent &&
                                        !1 !== p.contentType) ||
                                        t.contentType) &&
                                        C.setRequestHeader(
                                            "Content-Type",
                                            p.contentType,
                                        ),
                                    C.setRequestHeader(
                                        "Accept",
                                        p.dataTypes[0] &&
                                            p.accepts[p.dataTypes[0]]
                                            ? p.accepts[p.dataTypes[0]] +
                                                  ("*" !== p.dataTypes[0]
                                                      ? ", " + Yt + "; q=0.01"
                                                      : "")
                                            : p.accepts["*"],
                                    ),
                                    p.headers))
                                        C.setRequestHeader(f, p.headers[f]);
                                    if (
                                        p.beforeSend &&
                                        (!1 === p.beforeSend.call(h, C, p) || l)
                                    )
                                        return C.abort();
                                    if (
                                        ((T = "abort"),
                                        g.add(p.complete),
                                        C.done(p.success),
                                        C.fail(p.error),
                                        (n = Jt(Vt, p, t, C)))
                                    ) {
                                        if (
                                            ((C.readyState = 1),
                                            c && m.trigger("ajaxSend", [C, p]),
                                            l)
                                        )
                                            return C;
                                        p.async &&
                                            p.timeout > 0 &&
                                            (s = r.setTimeout(function () {
                                                C.abort("timeout");
                                            }, p.timeout));
                                        try {
                                            ((l = !1), n.send(x, E));
                                        } catch (e) {
                                            if (l) throw e;
                                            E(-1, e);
                                        }
                                    } else E(-1, "No Transport");
                                    function E(e, t, a, u) {
                                        var f,
                                            d,
                                            b,
                                            x,
                                            w,
                                            T = t;
                                        l ||
                                            ((l = !0),
                                            s && r.clearTimeout(s),
                                            (n = void 0),
                                            (o = u || ""),
                                            (C.readyState = e > 0 ? 4 : 0),
                                            (f =
                                                (e >= 200 && e < 300) ||
                                                304 === e),
                                            a &&
                                                (x = (function (e, t, n) {
                                                    for (
                                                        var r,
                                                            i,
                                                            o,
                                                            a,
                                                            s = e.contents,
                                                            u = e.dataTypes;
                                                        "*" === u[0];
                                                    )
                                                        (u.shift(),
                                                            void 0 === r &&
                                                                (r =
                                                                    e.mimeType ||
                                                                    t.getResponseHeader(
                                                                        "Content-Type",
                                                                    )));
                                                    if (r)
                                                        for (i in s)
                                                            if (
                                                                s[i] &&
                                                                s[i].test(r)
                                                            ) {
                                                                u.unshift(i);
                                                                break;
                                                            }
                                                    if (u[0] in n) o = u[0];
                                                    else {
                                                        for (i in n) {
                                                            if (
                                                                !u[0] ||
                                                                e.converters[
                                                                    i +
                                                                        " " +
                                                                        u[0]
                                                                ]
                                                            ) {
                                                                o = i;
                                                                break;
                                                            }
                                                            a || (a = i);
                                                        }
                                                        o = o || a;
                                                    }
                                                    if (o)
                                                        return (
                                                            o !== u[0] &&
                                                                u.unshift(o),
                                                            n[o]
                                                        );
                                                })(p, C, a)),
                                            !f &&
                                                A.inArray(
                                                    "script",
                                                    p.dataTypes,
                                                ) > -1 &&
                                                A.inArray("json", p.dataTypes) <
                                                    0 &&
                                                (p.converters["text script"] =
                                                    function () {}),
                                            (x = (function (e, t, n, r) {
                                                var i,
                                                    o,
                                                    a,
                                                    s,
                                                    u,
                                                    l = {},
                                                    c = e.dataTypes.slice();
                                                if (c[1])
                                                    for (a in e.converters)
                                                        l[a.toLowerCase()] =
                                                            e.converters[a];
                                                for (o = c.shift(); o; )
                                                    if (
                                                        (e.responseFields[o] &&
                                                            (n[
                                                                e.responseFields[
                                                                    o
                                                                ]
                                                            ] = t),
                                                        !u &&
                                                            r &&
                                                            e.dataFilter &&
                                                            (t = e.dataFilter(
                                                                t,
                                                                e.dataType,
                                                            )),
                                                        (u = o),
                                                        (o = c.shift()))
                                                    )
                                                        if ("*" === o) o = u;
                                                        else if (
                                                            "*" !== u &&
                                                            u !== o
                                                        ) {
                                                            if (
                                                                !(a =
                                                                    l[
                                                                        u +
                                                                            " " +
                                                                            o
                                                                    ] ||
                                                                    l["* " + o])
                                                            )
                                                                for (i in l)
                                                                    if (
                                                                        (s =
                                                                            i.split(
                                                                                " ",
                                                                            ))[1] ===
                                                                            o &&
                                                                        (a =
                                                                            l[
                                                                                u +
                                                                                    " " +
                                                                                    s[0]
                                                                            ] ||
                                                                            l[
                                                                                "* " +
                                                                                    s[0]
                                                                            ])
                                                                    ) {
                                                                        !0 === a
                                                                            ? (a =
                                                                                  l[
                                                                                      i
                                                                                  ])
                                                                            : !0 !==
                                                                                  l[
                                                                                      i
                                                                                  ] &&
                                                                              ((o =
                                                                                  s[0]),
                                                                              c.unshift(
                                                                                  s[1],
                                                                              ));
                                                                        break;
                                                                    }
                                                            if (!0 !== a)
                                                                if (
                                                                    a &&
                                                                    e.throws
                                                                )
                                                                    t = a(t);
                                                                else
                                                                    try {
                                                                        t =
                                                                            a(
                                                                                t,
                                                                            );
                                                                    } catch (e) {
                                                                        return {
                                                                            state: "parsererror",
                                                                            error: a
                                                                                ? e
                                                                                : "No conversion from " +
                                                                                  u +
                                                                                  " to " +
                                                                                  o,
                                                                        };
                                                                    }
                                                        }
                                                return {
                                                    state: "success",
                                                    data: t,
                                                };
                                            })(p, x, C, f)),
                                            f
                                                ? (p.ifModified &&
                                                      ((w =
                                                          C.getResponseHeader(
                                                              "Last-Modified",
                                                          )) &&
                                                          (A.lastModified[i] =
                                                              w),
                                                      (w =
                                                          C.getResponseHeader(
                                                              "etag",
                                                          )) &&
                                                          (A.etag[i] = w)),
                                                  204 === e || "HEAD" === p.type
                                                      ? (T = "nocontent")
                                                      : 304 === e
                                                        ? (T = "notmodified")
                                                        : ((T = x.state),
                                                          (d = x.data),
                                                          (f = !(b = x.error))))
                                                : ((b = T),
                                                  (!e && T) ||
                                                      ((T = "error"),
                                                      e < 0 && (e = 0))),
                                            (C.status = e),
                                            (C.statusText = (t || T) + ""),
                                            f
                                                ? v.resolveWith(h, [d, T, C])
                                                : v.rejectWith(h, [C, T, b]),
                                            C.statusCode(y),
                                            (y = void 0),
                                            c &&
                                                m.trigger(
                                                    f
                                                        ? "ajaxSuccess"
                                                        : "ajaxError",
                                                    [C, p, f ? d : b],
                                                ),
                                            g.fireWith(h, [C, T]),
                                            c &&
                                                (m.trigger("ajaxComplete", [
                                                    C,
                                                    p,
                                                ]),
                                                --A.active ||
                                                    A.event.trigger(
                                                        "ajaxStop",
                                                    )));
                                    }
                                    return C;
                                },
                                getJSON: function (e, t, n) {
                                    return A.get(e, t, n, "json");
                                },
                                getScript: function (e, t) {
                                    return A.get(e, void 0, t, "script");
                                },
                            }),
                            A.each(["get", "post"], function (e, t) {
                                A[t] = function (e, n, r, i) {
                                    return (
                                        g(n) &&
                                            ((i = i || r),
                                            (r = n),
                                            (n = void 0)),
                                        A.ajax(
                                            A.extend(
                                                {
                                                    url: e,
                                                    type: t,
                                                    dataType: i,
                                                    data: n,
                                                    success: r,
                                                },
                                                A.isPlainObject(e) && e,
                                            ),
                                        )
                                    );
                                };
                            }),
                            A.ajaxPrefilter(function (e) {
                                var t;
                                for (t in e.headers)
                                    "content-type" === t.toLowerCase() &&
                                        (e.contentType = e.headers[t] || "");
                            }),
                            (A._evalUrl = function (e, t, n) {
                                return A.ajax({
                                    url: e,
                                    type: "GET",
                                    dataType: "script",
                                    cache: !0,
                                    async: !1,
                                    global: !1,
                                    converters: {
                                        "text script": function () {},
                                    },
                                    dataFilter: function (e) {
                                        A.globalEval(e, t, n);
                                    },
                                });
                            }),
                            A.fn.extend({
                                wrapAll: function (e) {
                                    var t;
                                    return (
                                        this[0] &&
                                            (g(e) && (e = e.call(this[0])),
                                            (t = A(e, this[0].ownerDocument)
                                                .eq(0)
                                                .clone(!0)),
                                            this[0].parentNode &&
                                                t.insertBefore(this[0]),
                                            t
                                                .map(function () {
                                                    for (
                                                        var e = this;
                                                        e.firstElementChild;
                                                    )
                                                        e = e.firstElementChild;
                                                    return e;
                                                })
                                                .append(this)),
                                        this
                                    );
                                },
                                wrapInner: function (e) {
                                    return g(e)
                                        ? this.each(function (t) {
                                              A(this).wrapInner(
                                                  e.call(this, t),
                                              );
                                          })
                                        : this.each(function () {
                                              var t = A(this),
                                                  n = t.contents();
                                              n.length
                                                  ? n.wrapAll(e)
                                                  : t.append(e);
                                          });
                                },
                                wrap: function (e) {
                                    var t = g(e);
                                    return this.each(function (n) {
                                        A(this).wrapAll(
                                            t ? e.call(this, n) : e,
                                        );
                                    });
                                },
                                unwrap: function (e) {
                                    return (
                                        this.parent(e)
                                            .not("body")
                                            .each(function () {
                                                A(this).replaceWith(
                                                    this.childNodes,
                                                );
                                            }),
                                        this
                                    );
                                },
                            }),
                            (A.expr.pseudos.hidden = function (e) {
                                return !A.expr.pseudos.visible(e);
                            }),
                            (A.expr.pseudos.visible = function (e) {
                                return !!(
                                    e.offsetWidth ||
                                    e.offsetHeight ||
                                    e.getClientRects().length
                                );
                            }),
                            (A.ajaxSettings.xhr = function () {
                                try {
                                    return new r.XMLHttpRequest();
                                } catch (e) {}
                            }));
                        var Zt = { 0: 200, 1223: 204 },
                            Kt = A.ajaxSettings.xhr();
                        ((v.cors = !!Kt && "withCredentials" in Kt),
                            (v.ajax = Kt = !!Kt),
                            A.ajaxTransport(function (e) {
                                var t, n;
                                if (v.cors || (Kt && !e.crossDomain))
                                    return {
                                        send: function (i, o) {
                                            var a,
                                                s = e.xhr();
                                            if (
                                                (s.open(
                                                    e.type,
                                                    e.url,
                                                    e.async,
                                                    e.username,
                                                    e.password,
                                                ),
                                                e.xhrFields)
                                            )
                                                for (a in e.xhrFields)
                                                    s[a] = e.xhrFields[a];
                                            for (a in (e.mimeType &&
                                                s.overrideMimeType &&
                                                s.overrideMimeType(e.mimeType),
                                            e.crossDomain ||
                                                i["X-Requested-With"] ||
                                                (i["X-Requested-With"] =
                                                    "XMLHttpRequest"),
                                            i))
                                                s.setRequestHeader(a, i[a]);
                                            ((t = function (e) {
                                                return function () {
                                                    t &&
                                                        ((t =
                                                            n =
                                                            s.onload =
                                                            s.onerror =
                                                            s.onabort =
                                                            s.ontimeout =
                                                            s.onreadystatechange =
                                                                null),
                                                        "abort" === e
                                                            ? s.abort()
                                                            : "error" === e
                                                              ? "number" !=
                                                                typeof s.status
                                                                  ? o(
                                                                        0,
                                                                        "error",
                                                                    )
                                                                  : o(
                                                                        s.status,
                                                                        s.statusText,
                                                                    )
                                                              : o(
                                                                    Zt[
                                                                        s.status
                                                                    ] ||
                                                                        s.status,
                                                                    s.statusText,
                                                                    "text" !==
                                                                        (s.responseType ||
                                                                            "text") ||
                                                                        "string" !=
                                                                            typeof s.responseText
                                                                        ? {
                                                                              binary: s.response,
                                                                          }
                                                                        : {
                                                                              text: s.responseText,
                                                                          },
                                                                    s.getAllResponseHeaders(),
                                                                ));
                                                };
                                            }),
                                                (s.onload = t()),
                                                (n =
                                                    s.onerror =
                                                    s.ontimeout =
                                                        t("error")),
                                                void 0 !== s.onabort
                                                    ? (s.onabort = n)
                                                    : (s.onreadystatechange =
                                                          function () {
                                                              4 ===
                                                                  s.readyState &&
                                                                  r.setTimeout(
                                                                      function () {
                                                                          t &&
                                                                              n();
                                                                      },
                                                                  );
                                                          }),
                                                (t = t("abort")));
                                            try {
                                                s.send(
                                                    (e.hasContent && e.data) ||
                                                        null,
                                                );
                                            } catch (e) {
                                                if (t) throw e;
                                            }
                                        },
                                        abort: function () {
                                            t && t();
                                        },
                                    };
                            }),
                            A.ajaxPrefilter(function (e) {
                                e.crossDomain && (e.contents.script = !1);
                            }),
                            A.ajaxSetup({
                                accepts: {
                                    script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript",
                                },
                                contents: { script: /\b(?:java|ecma)script\b/ },
                                converters: {
                                    "text script": function (e) {
                                        return (A.globalEval(e), e);
                                    },
                                },
                            }),
                            A.ajaxPrefilter("script", function (e) {
                                (void 0 === e.cache && (e.cache = !1),
                                    e.crossDomain && (e.type = "GET"));
                            }),
                            A.ajaxTransport("script", function (e) {
                                var t, n;
                                if (e.crossDomain || e.scriptAttrs)
                                    return {
                                        send: function (r, i) {
                                            ((t = A("<script>")
                                                .attr(e.scriptAttrs || {})
                                                .prop({
                                                    charset: e.scriptCharset,
                                                    src: e.url,
                                                })
                                                .on(
                                                    "load error",
                                                    (n = function (e) {
                                                        (t.remove(),
                                                            (n = null),
                                                            e &&
                                                                i(
                                                                    "error" ===
                                                                        e.type
                                                                        ? 404
                                                                        : 200,
                                                                    e.type,
                                                                ));
                                                    }),
                                                )),
                                                b.head.appendChild(t[0]));
                                        },
                                        abort: function () {
                                            n && n();
                                        },
                                    };
                            }));
                        var en,
                            tn = [],
                            nn = /(=)\?(?=&|$)|\?\?/;
                        (A.ajaxSetup({
                            jsonp: "callback",
                            jsonpCallback: function () {
                                var e = tn.pop() || A.expando + "_" + Lt.guid++;
                                return ((this[e] = !0), e);
                            },
                        }),
                            A.ajaxPrefilter("json jsonp", function (e, t, n) {
                                var i,
                                    o,
                                    a,
                                    s =
                                        !1 !== e.jsonp &&
                                        (nn.test(e.url)
                                            ? "url"
                                            : "string" == typeof e.data &&
                                              0 ===
                                                  (e.contentType || "").indexOf(
                                                      "application/x-www-form-urlencoded",
                                                  ) &&
                                              nn.test(e.data) &&
                                              "data");
                                if (s || "jsonp" === e.dataTypes[0])
                                    return (
                                        (i = e.jsonpCallback =
                                            g(e.jsonpCallback)
                                                ? e.jsonpCallback()
                                                : e.jsonpCallback),
                                        s
                                            ? (e[s] = e[s].replace(
                                                  nn,
                                                  "$1" + i,
                                              ))
                                            : !1 !== e.jsonp &&
                                              (e.url +=
                                                  (Mt.test(e.url) ? "&" : "?") +
                                                  e.jsonp +
                                                  "=" +
                                                  i),
                                        (e.converters["script json"] =
                                            function () {
                                                return (
                                                    a ||
                                                        A.error(
                                                            i +
                                                                " was not called",
                                                        ),
                                                    a[0]
                                                );
                                            }),
                                        (e.dataTypes[0] = "json"),
                                        (o = r[i]),
                                        (r[i] = function () {
                                            a = arguments;
                                        }),
                                        n.always(function () {
                                            (void 0 === o
                                                ? A(r).removeProp(i)
                                                : (r[i] = o),
                                                e[i] &&
                                                    ((e.jsonpCallback =
                                                        t.jsonpCallback),
                                                    tn.push(i)),
                                                a && g(o) && o(a[0]),
                                                (a = o = void 0));
                                        }),
                                        "script"
                                    );
                            }),
                            (v.createHTMLDocument =
                                (((en =
                                    b.implementation.createHTMLDocument(
                                        "",
                                    ).body).innerHTML =
                                    "<form></form><form></form>"),
                                2 === en.childNodes.length)),
                            (A.parseHTML = function (e, t, n) {
                                return "string" != typeof e
                                    ? []
                                    : ("boolean" == typeof t &&
                                          ((n = t), (t = !1)),
                                      t ||
                                          (v.createHTMLDocument
                                              ? (((r = (t =
                                                    b.implementation.createHTMLDocument(
                                                        "",
                                                    )).createElement(
                                                    "base",
                                                )).href = b.location.href),
                                                t.head.appendChild(r))
                                              : (t = b)),
                                      (o = !n && []),
                                      (i = R.exec(e))
                                          ? [t.createElement(i[1])]
                                          : ((i = Oe([e], t, o)),
                                            o && o.length && A(o).remove(),
                                            A.merge([], i.childNodes)));
                                var r, i, o;
                            }),
                            (A.fn.load = function (e, t, n) {
                                var r,
                                    i,
                                    o,
                                    a = this,
                                    s = e.indexOf(" ");
                                return (
                                    s > -1 &&
                                        ((r = At(e.slice(s))),
                                        (e = e.slice(0, s))),
                                    g(t)
                                        ? ((n = t), (t = void 0))
                                        : t &&
                                          "object" == typeof t &&
                                          (i = "POST"),
                                    a.length > 0 &&
                                        A.ajax({
                                            url: e,
                                            type: i || "GET",
                                            dataType: "html",
                                            data: t,
                                        })
                                            .done(function (e) {
                                                ((o = arguments),
                                                    a.html(
                                                        r
                                                            ? A("<div>")
                                                                  .append(
                                                                      A.parseHTML(
                                                                          e,
                                                                      ),
                                                                  )
                                                                  .find(r)
                                                            : e,
                                                    ));
                                            })
                                            .always(
                                                n &&
                                                    function (e, t) {
                                                        a.each(function () {
                                                            n.apply(
                                                                this,
                                                                o || [
                                                                    e.responseText,
                                                                    t,
                                                                    e,
                                                                ],
                                                            );
                                                        });
                                                    },
                                            ),
                                    this
                                );
                            }),
                            (A.expr.pseudos.animated = function (e) {
                                return A.grep(A.timers, function (t) {
                                    return e === t.elem;
                                }).length;
                            }),
                            (A.offset = {
                                setOffset: function (e, t, n) {
                                    var r,
                                        i,
                                        o,
                                        a,
                                        s,
                                        u,
                                        l = A.css(e, "position"),
                                        c = A(e),
                                        f = {};
                                    ("static" === l &&
                                        (e.style.position = "relative"),
                                        (s = c.offset()),
                                        (o = A.css(e, "top")),
                                        (u = A.css(e, "left")),
                                        ("absolute" === l || "fixed" === l) &&
                                        (o + u).indexOf("auto") > -1
                                            ? ((a = (r = c.position()).top),
                                              (i = r.left))
                                            : ((a = parseFloat(o) || 0),
                                              (i = parseFloat(u) || 0)),
                                        g(t) &&
                                            (t = t.call(e, n, A.extend({}, s))),
                                        null != t.top &&
                                            (f.top = t.top - s.top + a),
                                        null != t.left &&
                                            (f.left = t.left - s.left + i),
                                        "using" in t
                                            ? t.using.call(e, f)
                                            : c.css(f));
                                },
                            }),
                            A.fn.extend({
                                offset: function (e) {
                                    if (arguments.length)
                                        return void 0 === e
                                            ? this
                                            : this.each(function (t) {
                                                  A.offset.setOffset(
                                                      this,
                                                      e,
                                                      t,
                                                  );
                                              });
                                    var t,
                                        n,
                                        r = this[0];
                                    return r
                                        ? r.getClientRects().length
                                            ? ((t = r.getBoundingClientRect()),
                                              (n = r.ownerDocument.defaultView),
                                              {
                                                  top: t.top + n.pageYOffset,
                                                  left: t.left + n.pageXOffset,
                                              })
                                            : { top: 0, left: 0 }
                                        : void 0;
                                },
                                position: function () {
                                    if (this[0]) {
                                        var e,
                                            t,
                                            n,
                                            r = this[0],
                                            i = { top: 0, left: 0 };
                                        if ("fixed" === A.css(r, "position"))
                                            t = r.getBoundingClientRect();
                                        else {
                                            for (
                                                t = this.offset(),
                                                    n = r.ownerDocument,
                                                    e =
                                                        r.offsetParent ||
                                                        n.documentElement;
                                                e &&
                                                (e === n.body ||
                                                    e === n.documentElement) &&
                                                "static" ===
                                                    A.css(e, "position");
                                            )
                                                e = e.parentNode;
                                            e &&
                                                e !== r &&
                                                1 === e.nodeType &&
                                                (((i = A(e).offset()).top +=
                                                    A.css(
                                                        e,
                                                        "borderTopWidth",
                                                        !0,
                                                    )),
                                                (i.left += A.css(
                                                    e,
                                                    "borderLeftWidth",
                                                    !0,
                                                )));
                                        }
                                        return {
                                            top:
                                                t.top -
                                                i.top -
                                                A.css(r, "marginTop", !0),
                                            left:
                                                t.left -
                                                i.left -
                                                A.css(r, "marginLeft", !0),
                                        };
                                    }
                                },
                                offsetParent: function () {
                                    return this.map(function () {
                                        for (
                                            var e = this.offsetParent;
                                            e &&
                                            "static" === A.css(e, "position");
                                        )
                                            e = e.offsetParent;
                                        return e || me;
                                    });
                                },
                            }),
                            A.each(
                                {
                                    scrollLeft: "pageXOffset",
                                    scrollTop: "pageYOffset",
                                },
                                function (e, t) {
                                    var n = "pageYOffset" === t;
                                    A.fn[e] = function (r) {
                                        return ee(
                                            this,
                                            function (e, r, i) {
                                                var o;
                                                if (
                                                    (y(e)
                                                        ? (o = e)
                                                        : 9 === e.nodeType &&
                                                          (o = e.defaultView),
                                                    void 0 === i)
                                                )
                                                    return o ? o[t] : e[r];
                                                o
                                                    ? o.scrollTo(
                                                          n ? o.pageXOffset : i,
                                                          n ? i : o.pageYOffset,
                                                      )
                                                    : (e[r] = i);
                                            },
                                            e,
                                            r,
                                            arguments.length,
                                        );
                                    };
                                },
                            ),
                            A.each(["top", "left"], function (e, t) {
                                A.cssHooks[t] = et(
                                    v.pixelPosition,
                                    function (e, n) {
                                        if (n)
                                            return (
                                                (n = Ke(e, t)),
                                                Xe.test(n)
                                                    ? A(e).position()[t] + "px"
                                                    : n
                                            );
                                    },
                                );
                            }),
                            A.each(
                                { Height: "height", Width: "width" },
                                function (e, t) {
                                    A.each(
                                        {
                                            padding: "inner" + e,
                                            content: t,
                                            "": "outer" + e,
                                        },
                                        function (n, r) {
                                            A.fn[r] = function (i, o) {
                                                var a =
                                                        arguments.length &&
                                                        (n ||
                                                            "boolean" !=
                                                                typeof i),
                                                    s =
                                                        n ||
                                                        (!0 === i || !0 === o
                                                            ? "margin"
                                                            : "border");
                                                return ee(
                                                    this,
                                                    function (t, n, i) {
                                                        var o;
                                                        return y(t)
                                                            ? 0 ===
                                                              r.indexOf("outer")
                                                                ? t["inner" + e]
                                                                : t.document
                                                                      .documentElement[
                                                                      "client" +
                                                                          e
                                                                  ]
                                                            : 9 === t.nodeType
                                                              ? ((o =
                                                                    t.documentElement),
                                                                Math.max(
                                                                    t.body[
                                                                        "scroll" +
                                                                            e
                                                                    ],
                                                                    o[
                                                                        "scroll" +
                                                                            e
                                                                    ],
                                                                    t.body[
                                                                        "offset" +
                                                                            e
                                                                    ],
                                                                    o[
                                                                        "offset" +
                                                                            e
                                                                    ],
                                                                    o[
                                                                        "client" +
                                                                            e
                                                                    ],
                                                                ))
                                                              : void 0 === i
                                                                ? A.css(t, n, s)
                                                                : A.style(
                                                                      t,
                                                                      n,
                                                                      i,
                                                                      s,
                                                                  );
                                                    },
                                                    t,
                                                    a ? i : void 0,
                                                    a,
                                                );
                                            };
                                        },
                                    );
                                },
                            ),
                            A.each(
                                [
                                    "ajaxStart",
                                    "ajaxStop",
                                    "ajaxComplete",
                                    "ajaxError",
                                    "ajaxSuccess",
                                    "ajaxSend",
                                ],
                                function (e, t) {
                                    A.fn[t] = function (e) {
                                        return this.on(t, e);
                                    };
                                },
                            ),
                            A.fn.extend({
                                bind: function (e, t, n) {
                                    return this.on(e, null, t, n);
                                },
                                unbind: function (e, t) {
                                    return this.off(e, null, t);
                                },
                                delegate: function (e, t, n, r) {
                                    return this.on(t, e, n, r);
                                },
                                undelegate: function (e, t, n) {
                                    return 1 === arguments.length
                                        ? this.off(e, "**")
                                        : this.off(t, e || "**", n);
                                },
                                hover: function (e, t) {
                                    return this.on("mouseenter", e).on(
                                        "mouseleave",
                                        t || e,
                                    );
                                },
                            }),
                            A.each(
                                "blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(
                                    " ",
                                ),
                                function (e, t) {
                                    A.fn[t] = function (e, n) {
                                        return arguments.length > 0
                                            ? this.on(t, null, e, n)
                                            : this.trigger(t);
                                    };
                                },
                            ));
                        var rn =
                            /^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;
                        ((A.proxy = function (e, t) {
                            var n, r, i;
                            if (
                                ("string" == typeof t &&
                                    ((n = e[t]), (t = e), (e = n)),
                                g(e))
                            )
                                return (
                                    (r = s.call(arguments, 2)),
                                    (i = function () {
                                        return e.apply(
                                            t || this,
                                            r.concat(s.call(arguments)),
                                        );
                                    }),
                                    (i.guid = e.guid = e.guid || A.guid++),
                                    i
                                );
                        }),
                            (A.holdReady = function (e) {
                                e ? A.readyWait++ : A.ready(!0);
                            }),
                            (A.isArray = Array.isArray),
                            (A.parseJSON = JSON.parse),
                            (A.nodeName = k),
                            (A.isFunction = g),
                            (A.isWindow = y),
                            (A.camelCase = ie),
                            (A.type = T),
                            (A.now = Date.now),
                            (A.isNumeric = function (e) {
                                var t = A.type(e);
                                return (
                                    ("number" === t || "string" === t) &&
                                    !isNaN(e - parseFloat(e))
                                );
                            }),
                            (A.trim = function (e) {
                                return null == e
                                    ? ""
                                    : (e + "").replace(rn, "$1");
                            }),
                            void 0 ===
                                (n = function () {
                                    return A;
                                }.apply(t, [])) || (e.exports = n));
                        var on = r.jQuery,
                            an = r.$;
                        return (
                            (A.noConflict = function (e) {
                                return (
                                    r.$ === A && (r.$ = an),
                                    e && r.jQuery === A && (r.jQuery = on),
                                    A
                                );
                            }),
                            void 0 === i && (r.jQuery = r.$ = A),
                            A
                        );
                    },
                );
            },
            808: (e, t, n) => {
                var r, i;
                !(function (o) {
                    if (
                        (void 0 ===
                            (i =
                                "function" == typeof (r = o)
                                    ? r.call(t, n, t, e)
                                    : r) || (e.exports = i),
                        !0,
                        (e.exports = o()),
                        !!0)
                    ) {
                        var a = window.Cookies,
                            s = (window.Cookies = o());
                        s.noConflict = function () {
                            return ((window.Cookies = a), s);
                        };
                    }
                })(function () {
                    function e() {
                        for (var e = 0, t = {}; e < arguments.length; e++) {
                            var n = arguments[e];
                            for (var r in n) t[r] = n[r];
                        }
                        return t;
                    }
                    function t(e) {
                        return e.replace(
                            /(%[0-9A-Z]{2})+/g,
                            decodeURIComponent,
                        );
                    }
                    return (function n(r) {
                        function i() {}
                        function o(t, n, o) {
                            if ("undefined" != typeof document) {
                                ("number" ==
                                    typeof (o = e({ path: "/" }, i.defaults, o))
                                        .expires &&
                                    (o.expires = new Date(
                                        1 * new Date() + 864e5 * o.expires,
                                    )),
                                    (o.expires = o.expires
                                        ? o.expires.toUTCString()
                                        : ""));
                                try {
                                    var a = JSON.stringify(n);
                                    /^[\{\[]/.test(a) && (n = a);
                                } catch (e) {}
                                ((n = r.write
                                    ? r.write(n, t)
                                    : encodeURIComponent(String(n)).replace(
                                          /%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,
                                          decodeURIComponent,
                                      )),
                                    (t = encodeURIComponent(String(t))
                                        .replace(
                                            /%(23|24|26|2B|5E|60|7C)/g,
                                            decodeURIComponent,
                                        )
                                        .replace(/[\(\)]/g, escape)));
                                var s = "";
                                for (var u in o)
                                    o[u] &&
                                        ((s += "; " + u),
                                        !0 !== o[u] &&
                                            (s += "=" + o[u].split(";")[0]));
                                return (document.cookie = t + "=" + n + s);
                            }
                        }
                        function a(e, n) {
                            if ("undefined" != typeof document) {
                                for (
                                    var i = {},
                                        o = document.cookie
                                            ? document.cookie.split("; ")
                                            : [],
                                        a = 0;
                                    a < o.length;
                                    a++
                                ) {
                                    var s = o[a].split("="),
                                        u = s.slice(1).join("=");
                                    n ||
                                        '"' !== u.charAt(0) ||
                                        (u = u.slice(1, -1));
                                    try {
                                        var l = t(s[0]);
                                        if (
                                            ((u = (r.read || r)(u, l) || t(u)),
                                            n)
                                        )
                                            try {
                                                u = JSON.parse(u);
                                            } catch (e) {}
                                        if (((i[l] = u), e === l)) break;
                                    } catch (e) {}
                                }
                                return e ? i[e] : i;
                            }
                        }
                        return (
                            (i.set = o),
                            (i.get = function (e) {
                                return a(e, !1);
                            }),
                            (i.getJSON = function (e) {
                                return a(e, !0);
                            }),
                            (i.remove = function (t, n) {
                                o(t, "", e(n, { expires: -1 }));
                            }),
                            (i.defaults = {}),
                            (i.withConverter = n),
                            i
                        );
                    })(function () {});
                });
            },
            90: (e) => {
                !(function (t, n) {
                    var r = (function (e, t, n) {
                        "use strict";
                        var r, i;
                        if (
                            ((function () {
                                var t,
                                    n = {
                                        lazyClass: "lazyload",
                                        loadedClass: "lazyloaded",
                                        loadingClass: "lazyloading",
                                        preloadClass: "lazypreload",
                                        errorClass: "lazyerror",
                                        autosizesClass: "lazyautosizes",
                                        fastLoadedClass: "ls-is-cached",
                                        iframeLoadMode: 0,
                                        srcAttr: "data-src",
                                        srcsetAttr: "data-srcset",
                                        sizesAttr: "data-sizes",
                                        minSize: 40,
                                        customMedia: {},
                                        init: !0,
                                        expFactor: 1.5,
                                        hFac: 0.8,
                                        loadMode: 2,
                                        loadHidden: !0,
                                        ricTimeout: 0,
                                        throttleDelay: 125,
                                    };
                                for (t in ((i =
                                    e.lazySizesConfig ||
                                    e.lazysizesConfig ||
                                    {}),
                                n))
                                    t in i || (i[t] = n[t]);
                            })(),
                            !t || !t.getElementsByClassName)
                        )
                            return {
                                init: function () {},
                                cfg: i,
                                noSupport: !0,
                            };
                        var o = t.documentElement,
                            a = e.HTMLPictureElement,
                            s = "addEventListener",
                            u = "getAttribute",
                            l = e[s].bind(e),
                            c = e.setTimeout,
                            f = e.requestAnimationFrame || c,
                            d = e.requestIdleCallback,
                            p = /^picture$/i,
                            h = [
                                "load",
                                "error",
                                "lazyincluded",
                                "_lazyloaded",
                            ],
                            m = {},
                            v = Array.prototype.forEach,
                            g = function (e, t) {
                                return (
                                    m[t] ||
                                        (m[t] = new RegExp(
                                            "(\\s|^)" + t + "(\\s|$)",
                                        )),
                                    m[t].test(e[u]("class") || "") && m[t]
                                );
                            },
                            y = function (e, t) {
                                g(e, t) ||
                                    e.setAttribute(
                                        "class",
                                        (e[u]("class") || "").trim() + " " + t,
                                    );
                            },
                            b = function (e, t) {
                                var n;
                                (n = g(e, t)) &&
                                    e.setAttribute(
                                        "class",
                                        (e[u]("class") || "").replace(n, " "),
                                    );
                            },
                            x = function (e, t, n) {
                                var r = n ? s : "removeEventListener";
                                (n && x(e, t),
                                    h.forEach(function (n) {
                                        e[r](n, t);
                                    }));
                            },
                            w = function (e, n, i, o, a) {
                                var s = t.createEvent("Event");
                                return (
                                    i || (i = {}),
                                    (i.instance = r),
                                    s.initEvent(n, !o, !a),
                                    (s.detail = i),
                                    e.dispatchEvent(s),
                                    s
                                );
                            },
                            T = function (t, n) {
                                var r;
                                !a && (r = e.picturefill || i.pf)
                                    ? (n &&
                                          n.src &&
                                          !t[u]("srcset") &&
                                          t.setAttribute("srcset", n.src),
                                      r({ reevaluate: !0, elements: [t] }))
                                    : n && n.src && (t.src = n.src);
                            },
                            C = function (e, t) {
                                return (getComputedStyle(e, null) || {})[t];
                            },
                            E = function (e, t, n) {
                                for (
                                    n = n || e.offsetWidth;
                                    n < i.minSize && t && !e._lazysizesWidth;
                                )
                                    ((n = t.offsetWidth), (t = t.parentNode));
                                return n;
                            },
                            A =
                                ((ye = []),
                                (be = []),
                                (xe = ye),
                                (we = function () {
                                    var e = xe;
                                    for (
                                        xe = ye.length ? be : ye,
                                            ve = !0,
                                            ge = !1;
                                        e.length;
                                    )
                                        e.shift()();
                                    ve = !1;
                                }),
                                (Te = function (e, n) {
                                    ve && !n
                                        ? e.apply(this, arguments)
                                        : (xe.push(e),
                                          ge ||
                                              ((ge = !0),
                                              (t.hidden ? c : f)(we)));
                                }),
                                (Te._lsFlush = we),
                                Te),
                            S = function (e, t) {
                                return t
                                    ? function () {
                                          A(e);
                                      }
                                    : function () {
                                          var t = this,
                                              n = arguments;
                                          A(function () {
                                              e.apply(t, n);
                                          });
                                      };
                            },
                            k = function (e) {
                                var t,
                                    r = 0,
                                    o = i.throttleDelay,
                                    a = i.ricTimeout,
                                    s = function () {
                                        ((t = !1), (r = n.now()), e());
                                    },
                                    u =
                                        d && a > 49
                                            ? function () {
                                                  (d(s, { timeout: a }),
                                                      a !== i.ricTimeout &&
                                                          (a = i.ricTimeout));
                                              }
                                            : S(function () {
                                                  c(s);
                                              }, !0);
                                return function (e) {
                                    var i;
                                    ((e = !0 === e) && (a = 33),
                                        t ||
                                            ((t = !0),
                                            (i = o - (n.now() - r)) < 0 &&
                                                (i = 0),
                                            e || i < 9 ? u() : c(u, i)));
                                };
                            },
                            D = function (e) {
                                var t,
                                    r,
                                    i = 99,
                                    o = function () {
                                        ((t = null), e());
                                    },
                                    a = function () {
                                        var e = n.now() - r;
                                        e < i ? c(a, i - e) : (d || o)(o);
                                    };
                                return function () {
                                    ((r = n.now()), t || (t = c(a, i)));
                                };
                            },
                            N =
                                ((X = /^img$/i),
                                (G = /^iframe$/i),
                                (J =
                                    "onscroll" in e &&
                                    !/(gle|ing)bot/.test(navigator.userAgent)),
                                (Q = 0),
                                (Z = 0),
                                (K = 0),
                                (ee = -1),
                                (te = function (e) {
                                    (K--,
                                        (!e || K < 0 || !e.target) && (K = 0));
                                }),
                                (ne = function (e) {
                                    return (
                                        null == Y &&
                                            (Y =
                                                "hidden" ==
                                                C(t.body, "visibility")),
                                        Y ||
                                            !(
                                                "hidden" ==
                                                    C(
                                                        e.parentNode,
                                                        "visibility",
                                                    ) &&
                                                "hidden" == C(e, "visibility")
                                            )
                                    );
                                }),
                                (re = function (e, n) {
                                    var r,
                                        i = e,
                                        a = ne(e);
                                    for (
                                        _ -= n, V += n, U -= n, $ += n;
                                        a &&
                                        (i = i.offsetParent) &&
                                        i != t.body &&
                                        i != o;
                                    )
                                        (a = (C(i, "opacity") || 1) > 0) &&
                                            "visible" != C(i, "overflow") &&
                                            ((r = i.getBoundingClientRect()),
                                            (a =
                                                $ > r.left &&
                                                U < r.right &&
                                                V > r.top - 1 &&
                                                _ < r.bottom + 1));
                                    return a;
                                }),
                                (ie = function () {
                                    var e,
                                        n,
                                        a,
                                        s,
                                        l,
                                        c,
                                        f,
                                        d,
                                        p,
                                        h,
                                        m,
                                        v,
                                        g = r.elements;
                                    if (
                                        (q = i.loadMode) &&
                                        K < 8 &&
                                        (e = g.length)
                                    ) {
                                        for (n = 0, ee++; n < e; n++)
                                            if (g[n] && !g[n]._lazyRace)
                                                if (
                                                    !J ||
                                                    (r.prematureUnveil &&
                                                        r.prematureUnveil(g[n]))
                                                )
                                                    de(g[n]);
                                                else if (
                                                    (((d =
                                                        g[n][u](
                                                            "data-expand",
                                                        )) &&
                                                        (c = 1 * d)) ||
                                                        (c = Z),
                                                    h ||
                                                        ((h =
                                                            !i.expand ||
                                                            i.expand < 1
                                                                ? o.clientHeight >
                                                                      500 &&
                                                                  o.clientWidth >
                                                                      500
                                                                    ? 500
                                                                    : 370
                                                                : i.expand),
                                                        (r._defEx = h),
                                                        (m = h * i.expFactor),
                                                        (v = i.hFac),
                                                        (Y = null),
                                                        Z < m &&
                                                        K < 1 &&
                                                        ee > 2 &&
                                                        q > 2 &&
                                                        !t.hidden
                                                            ? ((Z = m),
                                                              (ee = 0))
                                                            : (Z =
                                                                  q > 1 &&
                                                                  ee > 1 &&
                                                                  K < 6
                                                                      ? h
                                                                      : Q)),
                                                    p !== c &&
                                                        ((F =
                                                            innerWidth + c * v),
                                                        (W = innerHeight + c),
                                                        (f = -1 * c),
                                                        (p = c)),
                                                    (a =
                                                        g[
                                                            n
                                                        ].getBoundingClientRect()),
                                                    (V = a.bottom) >= f &&
                                                        (_ = a.top) <= W &&
                                                        ($ = a.right) >=
                                                            f * v &&
                                                        (U = a.left) <= F &&
                                                        (V || $ || U || _) &&
                                                        (i.loadHidden ||
                                                            ne(g[n])) &&
                                                        ((I &&
                                                            K < 3 &&
                                                            !d &&
                                                            (q < 3 ||
                                                                ee < 4)) ||
                                                            re(g[n], c)))
                                                ) {
                                                    if (
                                                        (de(g[n]),
                                                        (l = !0),
                                                        K > 9)
                                                    )
                                                        break;
                                                } else
                                                    !l &&
                                                        I &&
                                                        !s &&
                                                        K < 4 &&
                                                        ee < 4 &&
                                                        q > 2 &&
                                                        (B[0] ||
                                                            i.preloadAfterLoad) &&
                                                        (B[0] ||
                                                            (!d &&
                                                                (V ||
                                                                    $ ||
                                                                    U ||
                                                                    _ ||
                                                                    "auto" !=
                                                                        g[n][u](
                                                                            i.sizesAttr,
                                                                        )))) &&
                                                        (s = B[0] || g[n]);
                                        s && !l && de(s);
                                    }
                                }),
                                (oe = k(ie)),
                                (ae = function (e) {
                                    var t = e.target;
                                    t._lazyCache
                                        ? delete t._lazyCache
                                        : (te(e),
                                          y(t, i.loadedClass),
                                          b(t, i.loadingClass),
                                          x(t, ue),
                                          w(t, "lazyloaded"));
                                }),
                                (se = S(ae)),
                                (ue = function (e) {
                                    se({ target: e.target });
                                }),
                                (le = function (e, t) {
                                    var n =
                                        e.getAttribute("data-load-mode") ||
                                        i.iframeLoadMode;
                                    0 == n
                                        ? e.contentWindow.location.replace(t)
                                        : 1 == n && (e.src = t);
                                }),
                                (ce = function (e) {
                                    var t,
                                        n = e[u](i.srcsetAttr);
                                    ((t =
                                        i.customMedia[
                                            e[u]("data-media") || e[u]("media")
                                        ]) && e.setAttribute("media", t),
                                        n && e.setAttribute("srcset", n));
                                }),
                                (fe = S(function (e, t, n, r, o) {
                                    var a, s, l, f, d, h;
                                    ((d = w(e, "lazybeforeunveil", t))
                                        .defaultPrevented ||
                                        (r &&
                                            (n
                                                ? y(e, i.autosizesClass)
                                                : e.setAttribute("sizes", r)),
                                        (s = e[u](i.srcsetAttr)),
                                        (a = e[u](i.srcAttr)),
                                        o &&
                                            (f =
                                                (l = e.parentNode) &&
                                                p.test(l.nodeName || "")),
                                        (h =
                                            t.firesLoad ||
                                            ("src" in e && (s || a || f))),
                                        (d = { target: e }),
                                        y(e, i.loadingClass),
                                        h &&
                                            (clearTimeout(z),
                                            (z = c(te, 2500)),
                                            x(e, ue, !0)),
                                        f &&
                                            v.call(
                                                l.getElementsByTagName(
                                                    "source",
                                                ),
                                                ce,
                                            ),
                                        s
                                            ? e.setAttribute("srcset", s)
                                            : a &&
                                              !f &&
                                              (G.test(e.nodeName)
                                                  ? le(e, a)
                                                  : (e.src = a)),
                                        o && (s || f) && T(e, { src: a })),
                                        e._lazyRace && delete e._lazyRace,
                                        b(e, i.lazyClass),
                                        A(function () {
                                            var t =
                                                e.complete &&
                                                e.naturalWidth > 1;
                                            ((h && !t) ||
                                                (t && y(e, i.fastLoadedClass),
                                                ae(d),
                                                (e._lazyCache = !0),
                                                c(function () {
                                                    "_lazyCache" in e &&
                                                        delete e._lazyCache;
                                                }, 9)),
                                                "lazy" == e.loading && K--);
                                        }, !0));
                                })),
                                (de = function (e) {
                                    if (!e._lazyRace) {
                                        var t,
                                            n = X.test(e.nodeName),
                                            r =
                                                n &&
                                                (e[u](i.sizesAttr) ||
                                                    e[u]("sizes")),
                                            o = "auto" == r;
                                        ((!o && I) ||
                                            !n ||
                                            (!e[u]("src") && !e.srcset) ||
                                            e.complete ||
                                            g(e, i.errorClass) ||
                                            !g(e, i.lazyClass)) &&
                                            ((t = w(
                                                e,
                                                "lazyunveilread",
                                            ).detail),
                                            o &&
                                                L.updateElem(
                                                    e,
                                                    !0,
                                                    e.offsetWidth,
                                                ),
                                            (e._lazyRace = !0),
                                            K++,
                                            fe(e, t, o, r, n));
                                    }
                                }),
                                (pe = D(function () {
                                    ((i.loadMode = 3), oe());
                                })),
                                (he = function () {
                                    (3 == i.loadMode && (i.loadMode = 2), pe());
                                }),
                                (me = function () {
                                    I ||
                                        (n.now() - R < 999
                                            ? c(me, 999)
                                            : ((I = !0),
                                              (i.loadMode = 3),
                                              oe(),
                                              l("scroll", he, !0)));
                                }),
                                {
                                    _: function () {
                                        ((R = n.now()),
                                            (r.elements =
                                                t.getElementsByClassName(
                                                    i.lazyClass,
                                                )),
                                            (B = t.getElementsByClassName(
                                                i.lazyClass +
                                                    " " +
                                                    i.preloadClass,
                                            )),
                                            l("scroll", oe, !0),
                                            l("resize", oe, !0),
                                            l("pageshow", function (e) {
                                                if (e.persisted) {
                                                    var n = t.querySelectorAll(
                                                        "." + i.loadingClass,
                                                    );
                                                    n.length &&
                                                        n.forEach &&
                                                        f(function () {
                                                            n.forEach(
                                                                function (e) {
                                                                    e.complete &&
                                                                        de(e);
                                                                },
                                                            );
                                                        });
                                                }
                                            }),
                                            e.MutationObserver
                                                ? new MutationObserver(
                                                      oe,
                                                  ).observe(o, {
                                                      childList: !0,
                                                      subtree: !0,
                                                      attributes: !0,
                                                  })
                                                : (o[s](
                                                      "DOMNodeInserted",
                                                      oe,
                                                      !0,
                                                  ),
                                                  o[s](
                                                      "DOMAttrModified",
                                                      oe,
                                                      !0,
                                                  ),
                                                  setInterval(oe, 999)),
                                            l("hashchange", oe, !0),
                                            [
                                                "focus",
                                                "mouseover",
                                                "click",
                                                "load",
                                                "transitionend",
                                                "animationend",
                                            ].forEach(function (e) {
                                                t[s](e, oe, !0);
                                            }),
                                            /d$|^c/.test(t.readyState)
                                                ? me()
                                                : (l("load", me),
                                                  t[s]("DOMContentLoaded", oe),
                                                  c(me, 2e4)),
                                            r.elements.length
                                                ? (ie(), A._lsFlush())
                                                : oe());
                                    },
                                    checkElems: oe,
                                    unveil: de,
                                    _aLSL: he,
                                }),
                            L =
                                ((j = S(function (e, t, n, r) {
                                    var i, o, a;
                                    if (
                                        ((e._lazysizesWidth = r),
                                        (r += "px"),
                                        e.setAttribute("sizes", r),
                                        p.test(t.nodeName || ""))
                                    )
                                        for (
                                            o = 0,
                                                a = (i =
                                                    t.getElementsByTagName(
                                                        "source",
                                                    )).length;
                                            o < a;
                                            o++
                                        )
                                            i[o].setAttribute("sizes", r);
                                    n.detail.dataAttr || T(e, n.detail);
                                })),
                                (H = function (e, t, n) {
                                    var r,
                                        i = e.parentNode;
                                    i &&
                                        ((n = E(e, i, n)),
                                        (r = w(e, "lazybeforesizes", {
                                            width: n,
                                            dataAttr: !!t,
                                        })).defaultPrevented ||
                                            ((n = r.detail.width) &&
                                                n !== e._lazysizesWidth &&
                                                j(e, i, r, n)));
                                }),
                                (P = D(function () {
                                    var e,
                                        t = O.length;
                                    if (t) for (e = 0; e < t; e++) H(O[e]);
                                })),
                                {
                                    _: function () {
                                        ((O = t.getElementsByClassName(
                                            i.autosizesClass,
                                        )),
                                            l("resize", P));
                                    },
                                    checkElems: P,
                                    updateElem: H,
                                }),
                            M = function () {
                                !M.i &&
                                    t.getElementsByClassName &&
                                    ((M.i = !0), L._(), N._());
                            };
                        var O, j, H, P;
                        var B,
                            I,
                            z,
                            q,
                            R,
                            F,
                            W,
                            _,
                            U,
                            $,
                            V,
                            Y,
                            X,
                            G,
                            J,
                            Q,
                            Z,
                            K,
                            ee,
                            te,
                            ne,
                            re,
                            ie,
                            oe,
                            ae,
                            se,
                            ue,
                            le,
                            ce,
                            fe,
                            de,
                            pe,
                            he,
                            me;
                        var ve, ge, ye, be, xe, we, Te;
                        return (
                            c(function () {
                                i.init && M();
                            }),
                            (r = {
                                cfg: i,
                                autoSizer: L,
                                loader: N,
                                init: M,
                                uP: T,
                                aC: y,
                                rC: b,
                                hC: g,
                                fire: w,
                                gW: E,
                                rAF: A,
                            })
                        );
                    })(t, t.document, Date);
                    ((t.lazySizes = r), e.exports && (e.exports = r));
                })("undefined" != typeof window ? window : {});
            },
            82: (e, t, n) => {
                var r, i, o;
                !(function (a, s) {
                    ((s = s.bind(null, a, a.document)),
                        e.exports
                            ? s(n(90))
                            : ((i = [n(90)]),
                              void 0 ===
                                  (o =
                                      "function" == typeof (r = s)
                                          ? r.apply(t, i)
                                          : r) || (e.exports = o)));
                })(window, function (e, t, n) {
                    "use strict";
                    var r,
                        i,
                        o = {};
                    function a(e, n, r) {
                        if (!o[e]) {
                            var i = t.createElement(n ? "link" : "script"),
                                a = t.getElementsByTagName("script")[0];
                            (n
                                ? ((i.rel = "stylesheet"), (i.href = e))
                                : ((i.onload = function () {
                                      ((i.onerror = null),
                                          (i.onload = null),
                                          r());
                                  }),
                                  (i.onerror = i.onload),
                                  (i.src = e)),
                                (o[e] = !0),
                                (o[i.src || i.href] = !0),
                                a.parentNode.insertBefore(i, a));
                        }
                    }
                    t.addEventListener &&
                        ((i = /\(|\)|\s|'/),
                        (r = function (e, n) {
                            var r = t.createElement("img");
                            ((r.onload = function () {
                                ((r.onload = null),
                                    (r.onerror = null),
                                    (r = null),
                                    n());
                            }),
                                (r.onerror = r.onload),
                                (r.src = e),
                                r && r.complete && r.onload && r.onload());
                        }),
                        addEventListener(
                            "lazybeforeunveil",
                            function (e) {
                                var t, o, s;
                                if (
                                    e.detail.instance == n &&
                                    !e.defaultPrevented
                                ) {
                                    var u = e.target;
                                    if (
                                        ("none" == u.preload &&
                                            (u.preload =
                                                u.getAttribute(
                                                    "data-preload",
                                                ) || "auto"),
                                        null != u.getAttribute("data-autoplay"))
                                    )
                                        if (
                                            u.getAttribute("data-expand") &&
                                            !u.autoplay
                                        )
                                            try {
                                                u.play();
                                            } catch (e) {}
                                        else
                                            requestAnimationFrame(function () {
                                                (u.setAttribute(
                                                    "data-expand",
                                                    "-10",
                                                ),
                                                    n.aC(u, n.cfg.lazyClass));
                                            });
                                    ((t = u.getAttribute("data-link")) &&
                                        a(t, !0),
                                        (t = u.getAttribute("data-script")) &&
                                            ((e.detail.firesLoad = !0),
                                            a(t, null, function () {
                                                ((e.detail.firesLoad = !1),
                                                    n.fire(
                                                        u,
                                                        "_lazyloaded",
                                                        {},
                                                        !0,
                                                        !0,
                                                    ));
                                            })),
                                        (t = u.getAttribute("data-require")) &&
                                            (n.cfg.requireJs
                                                ? n.cfg.requireJs([t])
                                                : a(t)),
                                        (o = u.getAttribute("data-bg")) &&
                                            ((e.detail.firesLoad = !0),
                                            r(o, function () {
                                                ((u.style.backgroundImage =
                                                    "url(" +
                                                    (i.test(o)
                                                        ? JSON.stringify(o)
                                                        : o) +
                                                    ")"),
                                                    (e.detail.firesLoad = !1),
                                                    n.fire(
                                                        u,
                                                        "_lazyloaded",
                                                        {},
                                                        !0,
                                                        !0,
                                                    ));
                                            })),
                                        (s = u.getAttribute("data-poster")) &&
                                            ((e.detail.firesLoad = !0),
                                            r(s, function () {
                                                ((u.poster = s),
                                                    (e.detail.firesLoad = !1),
                                                    n.fire(
                                                        u,
                                                        "_lazyloaded",
                                                        {},
                                                        !0,
                                                        !0,
                                                    ));
                                            })));
                                }
                            },
                            !1,
                        ));
                });
            },
            632: () => {},
            621: () => {},
            143: () => {},
            379: (e, t, n) => {
                "use strict";
                var r,
                    i = function () {
                        return (
                            void 0 === r &&
                                (r = Boolean(
                                    window &&
                                    document &&
                                    document.all &&
                                    !window.atob,
                                )),
                            r
                        );
                    },
                    o = (function () {
                        var e = {};
                        return function (t) {
                            if (void 0 === e[t]) {
                                var n = document.querySelector(t);
                                if (
                                    window.HTMLIFrameElement &&
                                    n instanceof window.HTMLIFrameElement
                                )
                                    try {
                                        n = n.contentDocument.head;
                                    } catch (e) {
                                        n = null;
                                    }
                                e[t] = n;
                            }
                            return e[t];
                        };
                    })(),
                    a = [];
                function s(e) {
                    for (var t = -1, n = 0; n < a.length; n++)
                        if (a[n].identifier === e) {
                            t = n;
                            break;
                        }
                    return t;
                }
                function u(e, t) {
                    for (var n = {}, r = [], i = 0; i < e.length; i++) {
                        var o = e[i],
                            u = t.base ? o[0] + t.base : o[0],
                            l = n[u] || 0,
                            c = "".concat(u, " ").concat(l);
                        n[u] = l + 1;
                        var f = s(c),
                            d = { css: o[1], media: o[2], sourceMap: o[3] };
                        (-1 !== f
                            ? (a[f].references++, a[f].updater(d))
                            : a.push({
                                  identifier: c,
                                  updater: v(d, t),
                                  references: 1,
                              }),
                            r.push(c));
                    }
                    return r;
                }
                function l(e) {
                    var t = document.createElement("style"),
                        r = e.attributes || {};
                    if (void 0 === r.nonce) {
                        var i = n.nc;
                        i && (r.nonce = i);
                    }
                    if (
                        (Object.keys(r).forEach(function (e) {
                            t.setAttribute(e, r[e]);
                        }),
                        "function" == typeof e.insert)
                    )
                        e.insert(t);
                    else {
                        var a = o(e.insert || "head");
                        if (!a)
                            throw new Error(
                                "Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.",
                            );
                        a.appendChild(t);
                    }
                    return t;
                }
                var c,
                    f =
                        ((c = []),
                        function (e, t) {
                            return ((c[e] = t), c.filter(Boolean).join("\n"));
                        });
                function d(e, t, n, r) {
                    var i = n
                        ? ""
                        : r.media
                          ? "@media ".concat(r.media, " {").concat(r.css, "}")
                          : r.css;
                    if (e.styleSheet) e.styleSheet.cssText = f(t, i);
                    else {
                        var o = document.createTextNode(i),
                            a = e.childNodes;
                        (a[t] && e.removeChild(a[t]),
                            a.length
                                ? e.insertBefore(o, a[t])
                                : e.appendChild(o));
                    }
                }
                function p(e, t, n) {
                    var r = n.css,
                        i = n.media,
                        o = n.sourceMap;
                    if (
                        (i
                            ? e.setAttribute("media", i)
                            : e.removeAttribute("media"),
                        o &&
                            "undefined" != typeof btoa &&
                            (r +=
                                "\n/*# sourceMappingURL=data:application/json;base64,".concat(
                                    btoa(
                                        unescape(
                                            encodeURIComponent(
                                                JSON.stringify(o),
                                            ),
                                        ),
                                    ),
                                    " */",
                                )),
                        e.styleSheet)
                    )
                        e.styleSheet.cssText = r;
                    else {
                        for (; e.firstChild; ) e.removeChild(e.firstChild);
                        e.appendChild(document.createTextNode(r));
                    }
                }
                var h = null,
                    m = 0;
                function v(e, t) {
                    var n, r, i;
                    if (t.singleton) {
                        var o = m++;
                        ((n = h || (h = l(t))),
                            (r = d.bind(null, n, o, !1)),
                            (i = d.bind(null, n, o, !0)));
                    } else
                        ((n = l(t)),
                            (r = p.bind(null, n, t)),
                            (i = function () {
                                !(function (e) {
                                    if (null === e.parentNode) return !1;
                                    e.parentNode.removeChild(e);
                                })(n);
                            }));
                    return (
                        r(e),
                        function (t) {
                            if (t) {
                                if (
                                    t.css === e.css &&
                                    t.media === e.media &&
                                    t.sourceMap === e.sourceMap
                                )
                                    return;
                                r((e = t));
                            } else i();
                        }
                    );
                }
                e.exports = function (e, t) {
                    (t = t || {}).singleton ||
                        "boolean" == typeof t.singleton ||
                        (t.singleton = i());
                    var n = u((e = e || []), t);
                    return function (e) {
                        if (
                            ((e = e || []),
                            "[object Array]" ===
                                Object.prototype.toString.call(e))
                        ) {
                            for (var r = 0; r < n.length; r++) {
                                var i = s(n[r]);
                                a[i].references--;
                            }
                            for (var o = u(e, t), l = 0; l < n.length; l++) {
                                var c = s(n[l]);
                                0 === a[c].references &&
                                    (a[c].updater(), a.splice(c, 1));
                            }
                            n = o;
                        }
                    };
                };
            },
            795: (e, t, n) => {
                var r, i, o;
                ((i = [n(755)]),
                    void 0 ===
                        (o =
                            "function" ==
                            typeof (r = function (e) {
                                e.timeago = function (t) {
                                    return t instanceof Date
                                        ? o(t)
                                        : o(
                                              "string" == typeof t
                                                  ? e.timeago.parse(t)
                                                  : "number" == typeof t
                                                    ? new Date(t)
                                                    : e.timeago.datetime(t),
                                          );
                                };
                                var t = e.timeago;
                                e.extend(e.timeago, {
                                    settings: {
                                        refreshMillis: 6e4,
                                        allowPast: !0,
                                        allowFuture: !1,
                                        localeTitle: !1,
                                        cutoff: 0,
                                        autoDispose: !0,
                                        strings: {
                                            prefixAgo: null,
                                            prefixFromNow: null,
                                            suffixAgo: "ago",
                                            suffixFromNow: "from now",
                                            inPast: "any moment now",
                                            seconds: "less than a minute",
                                            minute: "about a minute",
                                            minutes: "%d minutes",
                                            hour: "about an hour",
                                            hours: "about %d hours",
                                            day: "a day",
                                            days: "%d days",
                                            month: "about a month",
                                            months: "%d months",
                                            year: "about a year",
                                            years: "%d years",
                                            wordSeparator: " ",
                                            numbers: [],
                                        },
                                    },
                                    inWords: function (t) {
                                        if (
                                            !this.settings.allowPast &&
                                            !this.settings.allowFuture
                                        )
                                            throw "timeago allowPast and allowFuture settings can not both be set to false.";
                                        var n = this.settings.strings,
                                            r = n.prefixAgo,
                                            i = n.suffixAgo;
                                        if (
                                            (this.settings.allowFuture &&
                                                t < 0 &&
                                                ((r = n.prefixFromNow),
                                                (i = n.suffixFromNow)),
                                            !this.settings.allowPast && t >= 0)
                                        )
                                            return this.settings.strings.inPast;
                                        var o = Math.abs(t) / 1e3,
                                            a = o / 60,
                                            s = a / 60,
                                            u = s / 24,
                                            l = u / 365;
                                        function c(r, i) {
                                            var o = e.isFunction(r)
                                                    ? r(i, t)
                                                    : r,
                                                a =
                                                    (n.numbers &&
                                                        n.numbers[i]) ||
                                                    i;
                                            return o.replace(/%d/i, a);
                                        }
                                        var f =
                                                (o < 45 &&
                                                    c(
                                                        n.seconds,
                                                        Math.round(o),
                                                    )) ||
                                                (o < 90 && c(n.minute, 1)) ||
                                                (a < 45 &&
                                                    c(
                                                        n.minutes,
                                                        Math.round(a),
                                                    )) ||
                                                (a < 90 && c(n.hour, 1)) ||
                                                (s < 24 &&
                                                    c(
                                                        n.hours,
                                                        Math.round(s),
                                                    )) ||
                                                (s < 42 && c(n.day, 1)) ||
                                                (u < 30 &&
                                                    c(n.days, Math.round(u))) ||
                                                (u < 45 && c(n.month, 1)) ||
                                                (u < 365 &&
                                                    c(
                                                        n.months,
                                                        Math.round(u / 30),
                                                    )) ||
                                                (l < 1.5 && c(n.year, 1)) ||
                                                c(n.years, Math.round(l)),
                                            d = n.wordSeparator || "";
                                        return (
                                            void 0 === n.wordSeparator &&
                                                (d = " "),
                                            e.trim([r, f, i].join(d))
                                        );
                                    },
                                    parse: function (t) {
                                        var n = e.trim(t);
                                        return (
                                            (n = (n = (n = (n = (n = n.replace(
                                                /\.\d+/,
                                                "",
                                            ))
                                                .replace(/-/, "/")
                                                .replace(/-/, "/"))
                                                .replace(/T/, " ")
                                                .replace(/Z/, " UTC")).replace(
                                                /([\+\-]\d\d)\:?(\d\d)/,
                                                " $1$2",
                                            )).replace(
                                                /([\+\-]\d\d)$/,
                                                " $100",
                                            )),
                                            new Date(n)
                                        );
                                    },
                                    datetime: function (n) {
                                        var r = t.isTime(n)
                                            ? e(n).attr("datetime")
                                            : e(n).attr("title");
                                        return t.parse(r);
                                    },
                                    isTime: function (t) {
                                        return (
                                            "time" ===
                                            e(t).get(0).tagName.toLowerCase()
                                        );
                                    },
                                });
                                var n = {
                                    init: function () {
                                        n.dispose.call(this);
                                        var i = e.proxy(r, this);
                                        i();
                                        var o = t.settings;
                                        o.refreshMillis > 0 &&
                                            (this._timeagoInterval =
                                                setInterval(
                                                    i,
                                                    o.refreshMillis,
                                                ));
                                    },
                                    update: function (n) {
                                        var i =
                                            n instanceof Date ? n : t.parse(n);
                                        (e(this).data("timeago", {
                                            datetime: i,
                                        }),
                                            t.settings.localeTitle &&
                                                e(this).attr(
                                                    "title",
                                                    i.toLocaleString(),
                                                ),
                                            r.apply(this));
                                    },
                                    updateFromDOM: function () {
                                        (e(this).data("timeago", {
                                            datetime: t.parse(
                                                t.isTime(this)
                                                    ? e(this).attr("datetime")
                                                    : e(this).attr("title"),
                                            ),
                                        }),
                                            r.apply(this));
                                    },
                                    dispose: function () {
                                        this._timeagoInterval &&
                                            (window.clearInterval(
                                                this._timeagoInterval,
                                            ),
                                            (this._timeagoInterval = null));
                                    },
                                };
                                function r() {
                                    var n = t.settings;
                                    if (
                                        n.autoDispose &&
                                        !e.contains(
                                            document.documentElement,
                                            this,
                                        )
                                    )
                                        return (
                                            e(this).timeago("dispose"),
                                            this
                                        );
                                    var r = i(this);
                                    return (
                                        isNaN(r.datetime) ||
                                            (0 === n.cutoff ||
                                            Math.abs(a(r.datetime)) < n.cutoff
                                                ? e(this).text(o(r.datetime))
                                                : e(this).attr("title").length >
                                                      0 &&
                                                  e(this).text(
                                                      e(this).attr("title"),
                                                  )),
                                        this
                                    );
                                }
                                function i(n) {
                                    if (!(n = e(n)).data("timeago")) {
                                        n.data("timeago", {
                                            datetime: t.datetime(n),
                                        });
                                        var r = e.trim(n.text());
                                        t.settings.localeTitle
                                            ? n.attr(
                                                  "title",
                                                  n
                                                      .data("timeago")
                                                      .datetime.toLocaleString(),
                                              )
                                            : !(r.length > 0) ||
                                              (t.isTime(n) &&
                                                  n.attr("title")) ||
                                              n.attr("title", r);
                                    }
                                    return n.data("timeago");
                                }
                                function o(e) {
                                    return t.inWords(a(e));
                                }
                                function a(e) {
                                    return new Date().getTime() - e.getTime();
                                }
                                ((e.fn.timeago = function (e, t) {
                                    var r = e ? n[e] : n.init;
                                    if (!r)
                                        throw new Error(
                                            "Unknown function name '" +
                                                e +
                                                "' for timeago",
                                        );
                                    return (
                                        this.each(function () {
                                            r.call(this, t);
                                        }),
                                        this
                                    );
                                }),
                                    document.createElement("abbr"),
                                    document.createElement("time"));
                            })
                                ? r.apply(t, i)
                                : r) || (e.exports = o));
            },
        },
        n = {};
    function r(e) {
        var i = n[e];
        if (void 0 !== i) return i.exports;
        var o = (n[e] = { id: e, exports: {} });
        return (t[e].call(o.exports, o, o.exports, r), o.exports);
    }
    ((r.m = t),
        (e = []),
        (r.O = (t, n, i, o) => {
            if (!n) {
                var a = 1 / 0;
                for (c = 0; c < e.length; c++) {
                    for (var [n, i, o] = e[c], s = !0, u = 0; u < n.length; u++)
                        (!1 & o || a >= o) &&
                        Object.keys(r.O).every((e) => r.O[e](n[u]))
                            ? n.splice(u--, 1)
                            : ((s = !1), o < a && (a = o));
                    if (s) {
                        e.splice(c--, 1);
                        var l = i();
                        void 0 !== l && (t = l);
                    }
                }
                return t;
            }
            o = o || 0;
            for (var c = e.length; c > 0 && e[c - 1][2] > o; c--)
                e[c] = e[c - 1];
            e[c] = [n, i, o];
        }),
        (r.n = (e) => {
            var t = e && e.__esModule ? () => e.default : () => e;
            return (r.d(t, { a: t }), t);
        }),
        (r.d = (e, t) => {
            for (var n in t)
                r.o(t, n) &&
                    !r.o(e, n) &&
                    Object.defineProperty(e, n, { enumerable: !0, get: t[n] });
        }),
        (r.g = (function () {
            if ("object" == typeof globalThis) return globalThis;
            try {
                return this || new Function("return this")();
            } catch (e) {
                if ("object" == typeof window) return window;
            }
        })()),
        (r.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
        (() => {
            var e = { 525: 0, 146: 0, 734: 0, 258: 0 };
            r.O.j = (t) => 0 === e[t];
            var t = (t, n) => {
                    var i,
                        o,
                        [a, s, u] = n,
                        l = 0;
                    if (a.some((t) => 0 !== e[t])) {
                        for (i in s) r.o(s, i) && (r.m[i] = s[i]);
                        if (u) var c = u(r);
                    }
                    for (t && t(n); l < a.length; l++)
                        ((o = a[l]),
                            r.o(e, o) && e[o] && e[o][0](),
                            (e[o] = 0));
                    return r.O(c);
                },
                n = (self.webpackChunk = self.webpackChunk || []);
            (n.forEach(t.bind(null, 0)),
                (n.push = t.bind(null, n.push.bind(n))));
        })(),
        (r.nc = void 0),
        r.O(void 0, [146, 734, 258], () => r(528)),
        r.O(void 0, [146, 734, 258], () => r(632)),
        r.O(void 0, [146, 734, 258], () => r(621)));
    var i = r.O(void 0, [146, 734, 258], () => r(143));
    i = r.O(i);
})();
