/*
 Copyright (c) 2012-2016 Media Semantics, Inc.
 Loading spinner is copyright (c) 2011 Felix Gnass.
*/
function msEmbed(g, m, k, B, E) {
    var N = new MSHTML5Control(g, m, k, B, E);
    "undefined" == typeof msEmbeddings && (msEmbeddings = []);
    msEmbeddings.push(N);
    for (var U = 5; U < arguments.length; U += 2) {
        var ka = arguments[U],
            eb = arguments[U + 1];
        if ("Presenting" == ka || "Focus" == ka) ka = "Override" + ka;
        N[ka] = eb
    }
    msEventHelper(N);
    N.realizeTopLevel(!0).ctl = N
}

function msAttach(g, m, k, B, E) {
    var N = new MSHTML5Control(g, m, k, B, E);
    "undefined" == typeof msEmbeddings && (msEmbeddings = []);
    msEmbeddings.push(N);
    for (var U = 5; U < arguments.length; U += 2) N[arguments[U]] = arguments[U + 1];
    msEventHelper(N);
    N.realizeTopLevel(!1).ctl = N
}

function msEventHelper(g) {
    if (/WebKit/i.test(navigator.userAgent)) var m = setInterval(function() {
        /loaded|complete/.test(document.readyState) && (clearInterval(m), g.onPageLoad())
    }, 10);
    else {
        var k = onload;
        onload = "function" != typeof onload ? function() {
            g.onPageLoad()
        } : function() {
            k && k();
            g.onPageLoad()
        }
    }
    var B = onscroll;
    onscroll = "function" != typeof onscroll ? function() {
        g.onScroll()
    } : function() {
        B && B();
        g.onScroll()
    };
    var E;
    "function" != typeof onmousemove ? onmousemove = function(k) {
        g.onMouseMove(k)
    } : (E = onmousemove, onmousemove =
        function(k) {
            E && E();
            g.onMouseMove(k)
        })
}

function MSHTML5Control(g, m, k, B, E) {
    function N() {
        fb && (Lb.stop(), fb = !1)
    }

    function U() {
        if (n.variables) {
            c = f;
            bsthis = n;
            try {
                eval(n.variables)
            } catch (a) {
                if (2 <= Q) debugger
            }
            bsthis = c = null
        }
    }

    function ka() {
        f.Presenting = 1 == n.presenting && !da;
        void 0 != f.OverridePresenting && (f.Presenting = f.OverridePresenting);
        for (var a in n.items) {
            f.Focus = a;
            break
        }
        void 0 != f.OverrideFocus && (f.Focus = f.OverrideFocus);
        null == f.Focus && f.Presenting && (f.Presenting = !1);
        if (n.onload) {
            c = f;
            bsthis = n;
            try {
                eval(n.onload)
            } catch (d) {
                if (2 <= Q) debugger
            }
            bsthis =
                c = null
        }
        r("Firing onSceneLoaded(" + g + ")");
        "function" == typeof onSceneLoaded && onSceneLoaded(g);
        gb();
        Mb();
        za || G();
        requestAnimationFrame(qc)
    }

    function eb() {
        U();
        s = "";
        for (var a in n.items) s += '<div id="' + g + a + 'Div" style="display:none; left:0px; top:0px; position:absolute" width="' + B + '" height="' + E + '">', s += '<div id="' + g + a + 'Inner" style="left:0px; top:0px; position:relative" width="' + B + '" height="' + E + '">', s += Nb(n.items[a]), rc && (s += '<canvas id="BubbleLayer" style="position:absolute; left:0px; top:0px;" width="' +
            B + '" height="' + E + '"/></canvas>'), "always" != n.allowautoplay && ("never" == n.allowautoplay || (Ma || hb || ea) && 1 == n.presenting && !n.noaudio) && (r("allowautoplay - initially presenting, have audio: putting up StartShield, Presenting now false"), s += '<canvas id="' + g + 'StartShield" style="position:absolute; left:0px; top:0px;" width="' + B + 'px" height="' + E + 'px" onclick="msEvent(' + ("'" + g + "',null,'shieldclick'") + ')"/></canvas>', da = !0, f.Presenting = !1), s += "</div>", s += "</div>", s += '<div id="' + g + 'Measure" style="position:absolute; visibility:hidden; width:auto; height:auto"></div>';
        "true" == f.Preview && (s += '<div id="' + g + 'PreviewDiv" style="display:none; position:absolute; left:' + (B - 120) / 2 + "px; top:" + (E - 120) / 2 + 'px; width:120px; height:120px;"/><img src="http://www.characterhosting.com/images/MSPreview.png" border="0"></div>');
        document.getElementById(g + "Stage").innerHTML = s;
        for (var d in n.items) sc(n.items[d]);
        if (a = document.getElementById("BubbleLayer")) {
            a = a.getContext("2d");
            var b;
            for (d = 0; d < 10 * B; d += 875)
                for (b = 0; b < 10 * E; b += 875) Ob || (Ob = {
                    msvector: !0,
                    data: {
                        cx: "6120",
                        cy: "7920",
                        xView: "990",
                        yView: "820",
                        cxView: "1750",
                        cyView: "1750",
                        frames: [
                            [
                                ["fs", 35, 31, 32, 25],
                                ["bp"],
                                ["m", 1391, 978],
                                ["l", 1478, 1065],
                                ["l", 1438, 1105],
                                ["l", 1403, 1070],
                                ["l", 1365, 1108],
                                ["l", 1398, 1141],
                                ["l", 1360, 1179],
                                ["l", 1327, 1146],
                                ["l", 1283, 1190],
                                ["l", 1321, 1228],
                                ["l", 1281, 1268],
                                ["l", 1190, 1177],
                                ["l", 1391, 978],
                                ["c"],
                                ["f"],
                                ["bp"],
                                ["m", 1621, 1208],
                                ["l", 1393, 1383],
                                ["l", 1314, 1304],
                                ["l", 1485, 1073],
                                ["l", 1540, 1128],
                                ["b", 1491, 1190, 1449, 1241, 1413, 1282],
                                ["b", 1454, 1246, 1492, 1214, 1525, 1187],
                                ["l", 1566, 1153],
                                ["l", 1621, 1208],
                                ["c"],
                                ["f"],
                                ["bp"],
                                ["m", 1717, 1304],
                                ["l", 1546, 1535],
                                ["l", 1493, 1482],
                                ["l", 1526, 1443],
                                ["l", 1507, 1424],
                                ["l", 1468, 1457],
                                ["l", 1414, 1403],
                                ["l", 1642, 1228],
                                ["l", 1717, 1304],
                                ["c"],
                                ["m", 1560, 1406],
                                ["b", 1580, 1381, 1606, 1350, 1637, 1314],
                                ["b", 1593, 1347, 1562, 1372, 1542, 1388],
                                ["l", 1560, 1406],
                                ["c"],
                                ["f"],
                                ["bp"],
                                ["m", 1808, 1395],
                                ["l", 1647, 1556],
                                ["l", 1679, 1588],
                                ["l", 1639, 1628],
                                ["l", 1555, 1544],
                                ["l", 1756, 1343],
                                ["l", 1808, 1395],
                                ["c"],
                                ["f"],
                                ["bp"],
                                ["m", 1971, 1559],
                                ["l", 1837, 1693],
                                ["b", 1822, 1708, 1811, 1718, 1803, 1724],
                                ["b", 1796, 1729, 1787, 1733, 1775,
                                    1734
                                ],
                                ["b", 1764, 1736, 1752, 1734, 1741, 1729],
                                ["b", 1719, 1717, 1708, 1706],
                                ["b", 1696, 1694, 1687, 1681, 1682, 1668],
                                ["b", 1677, 1655, 1675, 1643, 1677, 1632],
                                ["b", 1679, 1621, 1683, 1612, 1689, 1604],
                                ["b", 1710, 1581, 1732, 1558],
                                ["l", 1851, 1439],
                                ["l", 1903, 1491],
                                ["l", 1753, 1642],
                                ["b", 1744, 1651, 1739, 1657, 1738, 1660],
                                ["b", 1737, 1663, 1737, 1667, 1740, 1669],
                                ["b", 1743, 1672, 1747, 1673, 1750, 1671],
                                ["b", 1754, 1669, 1760, 1663, 1771, 1653],
                                ["l", 1919, 1505],
                                ["l", 1971, 1559],
                                ["c"],
                                ["f"],
                                ["bp"],
                                ["m", 2082, 1670],
                                ["l", 1911, 1901],
                                ["l", 1858, 1848],
                                ["l", 1891,
                                    1809
                                ],
                                ["l", 1872, 1790],
                                ["l", 1833, 1823],
                                ["l", 1779, 1769],
                                ["l", 2007, 1594],
                                ["l", 2082, 1670],
                                ["c"],
                                ["m", 1925, 1771],
                                ["b", 1945, 1746, 1971, 1715, 2002, 1679],
                                ["b", 1958, 1712, 1927, 1737, 1907, 1753],
                                ["l", 1925, 1771],
                                ["c"],
                                ["f"],
                                ["bp"],
                                ["m", 2212, 1800],
                                ["l", 2172, 1840],
                                ["l", 2141, 1809],
                                ["l", 1980, 1970],
                                ["l", 1928, 1918],
                                ["l", 2089, 1757],
                                ["l", 2058, 1726],
                                ["l", 2098, 1686],
                                ["l", 2212, 1800],
                                ["c"],
                                ["f"],
                                ["bp"],
                                ["m", 2276, 1864],
                                ["l", 2075, 2065],
                                ["l", 2023, 2013],
                                ["l", 2224, 1812],
                                ["l", 2276, 1864],
                                ["c"],
                                ["f"],
                                ["bp"],
                                ["m", 2299, 2122],
                                ["b", 2279,
                                    2142, 2264, 2156, 2255, 2164
                                ],
                                ["b", 2235, 2176, 2223, 2178],
                                ["b", 2211, 2180, 2199, 2179, 2187, 2174],
                                ["b", 2175, 2169, 2163, 2161, 2152, 2150],
                                ["b", 2141, 2139, 2133, 2128, 2128, 2116],
                                ["b", 2121, 2092, 2123, 2079],
                                ["b", 2125, 2067, 2129, 2056, 2137, 2047],
                                ["b", 2144, 2038, 2158, 2023, 2179, 2002],
                                ["l", 2213, 1968],
                                ["b", 2233, 1948, 2248, 1934, 2257, 1926],
                                ["b", 2266, 1919, 2277, 1914, 2289, 1912],
                                ["b", 2301, 1910, 2313, 1911, 2325, 1916],
                                ["b", 2337, 1921, 2349, 1929, 2360, 1940],
                                ["b", 2371, 1951, 2379, 1962, 2384, 1974],
                                ["b", 2389, 1986, 2391, 1998, 2389, 2011],
                                ["b", 2387, 2023,
                                    2383, 2034, 2375, 2043
                                ],
                                ["b", 2368, 2052, 2354, 2067, 2333, 2088],
                                ["l", 2299, 2122],
                                ["c"],
                                ["m", 2313, 2004],
                                ["b", 2322, 1995, 2328, 1988, 2329, 1984],
                                ["b", 2331, 1980, 2330, 1977, 2327, 1974],
                                ["b", 2324, 1971, 2321, 1970, 2318, 1971],
                                ["b", 2307, 1977, 2297, 1988],
                                ["l", 2203, 2082],
                                ["b", 2191, 2094, 2185, 2101, 2183, 2105],
                                ["b", 2181, 2109, 2182, 2112, 2186, 2116],
                                ["b", 2190, 2120, 2193, 2120, 2198, 2118],
                                ["b", 2202, 2116, 2210, 2109, 2222, 2097],
                                ["l", 2313, 2004],
                                ["c"],
                                ["f"],
                                ["bp"],
                                ["m", 2553, 2141],
                                ["l", 2352, 2342],
                                ["l", 2306, 2296],
                                ["l", 2370, 2177],
                                ["l", 2279, 2268],
                                ["l", 2235, 2224],
                                ["l", 2436, 2023],
                                ["l", 2480, 2067],
                                ["l", 2419, 2187],
                                ["l", 2510, 2096],
                                ["l", 2553, 2141],
                                ["c"],
                                ["f"]
                            ]
                        ]
                    }
                }), tc(a, "", Ob.data, 0, d, b, .5, [])
        }
        if (a = document.getElementById(g + "StartShield")) a = a.getContext("2d"), a.fillStyle = "#000000", a.globalAlpha = .5, a.fillRect(0, 0, B, E), d = B / 2, b = E / 2, a.beginPath(), a.arc(d, b, 25, 0, 2 * Math.PI, !1), a.fillStyle = "#999999", a.globalAlpha = .5, a.fill(), a.beginPath(), a.arc(d, b, 27, 0, 2 * Math.PI, !1), a.strokeStyle = "#cccccc", a.lineWidth = 5, a.globalAlpha = 1, a.stroke(), a.beginPath(), d -= 12, b -=
            15, a.moveTo(d, b), b += 30, a.lineTo(d, b), b -= 15, d += 30, a.lineTo(d, b), a.lineTo(d - 30, b - 15), a.fillStyle = "#cccccc", a.globalAlpha = 1, a.fill();
        uc = !0;
        vc && !ib && (ib = !0, ka())
    }

    function Nb(a) {
        var d = "",
            b;
        for (b in a.items) {
            var e = a.items[b];
            if ("character" == e.type) d += wc(b, e);
            else if ("image" == e.type) var l = b,
                z = Pb(e),
                d = d + ('<div id="' + g + l + 'Div" style="position:absolute; display:' + (e.hidden ? "none" : "block") + "; left:" + z.x + "px; top:" + z.y + "px; width:" + z.cx + "px; height:" + z.cy + 'px;"/></div>');
            else if ("movie" == e.type) l = '<div id="' +
                g + b + 'Div" style="position:absolute; left:' + e.left + "px; top:" + e.top + 'px;">', l += '<video id="' + g + b + 'Video" width="' + e.width + '" height="' + e.height + '" onloadedmetadata="msEvent(' + ("'" + g + "','" + b + "','videoonloadedmetadata'") + ')"' + (e.controls ? " controls " : "") + ">", l += '<source src="' + R(e.file) + '" type="video/mp4">', e.altfile && (l += '<source src="' + R(e.altfile) + '" type="video/ogg">'), d += l + "</video></div>";
            else if ("sound" == e.type) l = '<audio id="' + g + b + 'Audio">', l += '<source src="' + R(e.file) + '" type="audio/mp3">',
                d += l + "</audio>";
            else if ("text" == e.type) l = b, t = "", e.face && (t += "; font-family:" + e.face), e.size && (t += "; font-size:" + e.size + "px"), e.color && (t += "; color:" + e.color), e.align && (t += "; text-align:" + e.align), e.bold && (t += "; font-weight:bold"), e.italic && (t += "; font-style:italic"), z = "", -1 != e.text.indexOf("<p") && (z += "<style>p {line-height:50%;}</style>"), z += '<div id="' + g + l + 'Div" style="position:absolute; display:' + (e.hidden ? "none" : "block") + "; white-space:" + (e.multiline ? "wrap" : "nowrap") + "; left:" + e.left + "px; top:" +
                e.top + "px; width:" + e.width + "px; height:" + e.height + "px" + t + '">', z += e.text, d += z + "</div>";
            else if ("editcontrol" == e.type) var l = "" + ('<div id="' + g + b + 'Div" style="display:' + (e.hidden ? "none" : "block") + "; position:absolute; left:" + e.left + "px; top:" + e.top + 'px;" width="' + e.width + '" height="' + e.height + '">'),
                z = "'" + g + "','" + b + "',",
                h = z + "'editchange'",
                l = l + ('<input id="' + g + b + 'Edit" type="text" style="width:' + e.width + "px; height:" + e.height + "px; border:" + (1 == e.border ? "solid 1px #000000" : "none") + "; padding-top:0px; padding-bottom:0px; padding-left:0px; padding-right:0px; " +
                    ((e.fontname ? "font-family:" + e.fontname + ";" : "") + (e.fontheight ? "font-size:" + e.fontheight + "px;" : "") + (e.fontcolor ? "color:" + e.fontcolor + ";" : "")) + '" onkeyup="msEvent(' + h + ')" onmouseup="msEvent(' + h + ')" oninput="msEvent(' + h + ')" onfocus="msEvent(' + (z + "'editfocus'") + ')" ' + (e.disabled ? "disabled" : "") + "/>"),
                d = d + (l + "</div>");
            else if ("rectangle" == e.type) l = "", e.wash ? l += '<canvas id="' + g + b + 'Div" style="position:absolute; display:' + (e.hidden ? "none" : "block") + "; left:" + e.left + "px; top:" + e.top + 'px;" width="' + e.width + '" height="' +
                e.height + '"/></canvas>' : (l += '<div id="' + g + b + 'Div" style="position:absolute; display:' + (e.hidden ? "none" : "block") + "; left:" + e.left + "px; top:" + e.top + "px; width:" + e.width + "px; height:" + e.height + "px;", e.fillcolor && (l += " background-color:" + e.fillcolor + ";"), 0 < e.strokewidth && (l += " border:" + e.strokewidth + "px solid " + e.strokecolor + ";"), l += '"></div>'), d += l;
            else if ("line" == e.type || "arrow" == e.type) d += '<canvas id="' + g + b + 'Div" style="position:absolute; display:' + (e.hidden ? "none" : "block") + "; left:" + (Math.min(e.x1,
                e.x2) - 5) + "px; top:" + (Math.min(e.y1, e.y2) - 5) + 'px;" width="' + (Math.abs(e.x2 - e.x1) + 10) + '" height="' + (Math.abs(e.y2 - e.y1) + 10) + '"/></canvas>';
            else if ("button" == e.type) l = b, z = "'" + g + "','" + l + "',", t = '<span onclick="msEvent(' + (z + "'buttonclick'") + ')" onmouseover="msEvent(' + (z + "'mouseover'") + ')" onmouseout="msEvent(' + (z + "'mouseout'") + ')" onmousedown="msEvent(' + (z + "'mousedown'") + ')" onmouseup="msEvent(' + (z + "'mouseup'") + ')"', e.backfile || e.backclass ? (t += ' style="cursor:pointer;">', z = "" + ('<div id="' + g + l + 'Div" style="position:absolute; left:' +
                    e.left + "px; top:" + e.top + "px; width:" + e.width + "px; height:" + e.height + 'px">'), z += t, z += '<div id="' + g + l + 'Inner" style="position:relative; left:0px; top:0px; width:' + e.width + "px; height:" + e.height + 'px">', z = e.backclass ? z + ('<div id="' + g + l + 'Back" style="position:absolute; left:0; top:0;"></div>') : z + ('<img id="' + g + l + 'Back" style="position:absolute; left:0; top:0;" border="0"/>'), e.font || (e.font = "Arial"), e.text && (z += '<span id="' + g + l + 'Lbl" style="position:absolute; left:' + e.xfore + "px; top:" + (parseInt(e.yfore) -
                    2) + 'px; -moz-user-select:-moz-none;-khtml-user-select:none;-webkit-user-select:none;"/><font face="' + e.font + '" style="font-size:' + e.fontheight + 'px" color="' + e.fontcolor + '">' + e.text + "</font></span>"), e.foreclass ? z += '<div id="' + g + l + 'Fore" style="position:absolute; left:' + e.xfore + "px; top:" + e.yfore + 'px;"></div>' : e.forefile && (z += '<img id="' + g + l + 'Fore" style="position:absolute; left:' + e.xfore + "px; top:" + e.yfore + 'px;" border="0"/>'), e.over = !1, e.down = !1, e = z + "</div></span></div>") : e = t += ' style="cursor:pointer; display:block; position:absolute; left:' +
                e.left + "px; top:" + e.top + "px; width:" + e.width + "px; height:" + e.height + 'px"></span>', d += e;
            else if ("grid" == e.type) l = b, s = "", s += '<div id="' + g + l + 'Div" style="position:absolute; display:' + (e.hidden ? "none" : "block") + "; left:" + e.left + "px; top:" + e.top + "px; width:" + e.width + "px; height:" + e.height + 'px">', s += '<div id="' + g + l + 'Inner" style="position:relative; left:0px; top:0px; width:' + e.width + "px; height:" + e.height + 'px">', s += Nb(e), s += "</div>", s += "</div>", d += s;
            else if ("slideshow" == e.type) {
                l = void 0;
                z = "" + ('<div id="' +
                    g + b + 'Div" style="position:absolute; left:' + e.left + "px; top:" + e.top + "px; width:" + e.width + "px; height:" + e.height + 'px">');
                z += '<div id="' + g + b + 'Inner" style="position:relative; left:0px; top:0px; width:' + e.width + "px; height:" + e.height + 'px">';
                for (l in e.items) var q = e.items[l],
                    h = "" + ('<div id="' + g + l + 'Div" style="display:none; position:absolute; left:0px; top:0px; width:' + e.width + "px; height:" + e.height + 'px;">'),
                    h = h + ('<div id="' + g + l + 'Inner" style="position:relative; left:0px; top:0px; width:' + e.width + "px; height:" +
                        e.height + 'px;">'),
                    h = h + Nb(q),
                    z = z + (h + "</div></div>");
                d += z + "</div></div>"
            } else if ("message" != e.type && "dialog" != e.type) {
                var l = "component" == e.type ? e["class"] : e.type,
                    x;
                for (x in J)
                    if (l == x && (z = J[x].render(f, e))) {
                        d += z;
                        break
                    }
            }
        }
        return d
    }

    function wc(a, d) {
        var b = "",
            e = "'" + g + "','" + a + "',",
            l = e + "'audioonloadstart'",
            f = e + "'audioonprogress'",
            Na = e + "'audiooncanplaythrough'",
            q = e + "'audioonerror'",
            x = e + "'audioonstalled'",
            u = e + "'audioonloadedmetadata'",
            k = e + "'audioonplaying'",
            p = e + "'audioonended'",
            e = e + "'audioontimeupdate'";
        d.narrator &&
            (d.left = d.top = d.width = d.height = 0);
        var m = Pb(d),
            b = b + ('<div id="' + g + a + 'Div" style="pointer-events:none; position:absolute; left:' + m.x + "px; top:" + m.y + "px; width:" + m.cx + "px; height:" + m.cy + 'px">'),
            b = b + ('<canvas style="pointer-events:none;" id="' + g + a + 'Canvas" width="' + m.cx + '" height="' + m.cy + '"></canvas>'),
            b = b + ('<audio id="' + g + a + 'Audio" onloadstart="msEvent(' + l + ')" onprogress="msEvent(' + f + ')" oncanplaythrough="msEvent(' + Na + ')" onerror="msEvent(' + q + ')" onstalled="msEvent(' + x + ')" onloadedmetadata="msEvent(' +
                u + ')" onplaying="msEvent(' + k + ')" onended="msEvent(' + p + ')" ontimeupdate="msEvent(' + e + ')"/>');
        h[a] = {
            idScene: d.parent.id,
            aImg: null,
            aImgShow: null,
            cxCharLeft: m.cxLeft,
            cyCharTop: m.cyTop,
            charCanvas: null,
            loadingAudio: !1,
            audioLoaded: !1,
            idMsg: null,
            idMsgNext: null,
            complete: !1,
            fFirstFrameAfterRec: !1,
            frame: 0
        };
        return b + "</div>"
    }

    function Pb(a) {
        var d = 0,
            b = parseInt(a.left),
            e = parseInt(a.width);
        0 > b && (d = -b, e += b, b = 0);
        b + e > B && (e = B - b);
        var l = 0,
            f = parseInt(a.top);
        a = parseInt(a.height);
        0 > f && (l = -f, a += f, f = 0);
        f + a > E && (a = E - f);
        return {
            cxLeft: d,
            cyTop: l,
            x: b,
            y: f,
            cx: e,
            cy: a
        }
    }

    function xc(a, d) {
        for (var b in a.items) {
            var e = a.items[b];
            p[b] = e;
            e.id = b;
            e.parent = a;
            e.hasOwnProperty("items") && xc(e, b)
        }
    }

    function C(a) {
        var d;
        return p[a] ? a : w && (d = jb(p[w], a)) || y && (d = jb(p[y], a)) ? d : jb(n, a)
    }

    function jb(a, d) {
        for (var b in a.items) {
            var e = a.items[b];
            if (e.name == d) return b;
            if (e = jb(e, d)) return e
        }
        return null
    }

    function O(a) {
        try {
            console.log(g + ": " + ((new Date).getTime() - kb) / 1E3 + "s: " + a)
        } catch (d) {}
    }

    function r(a) {
        if (0 < Q) try {
            console.log(g + ": " + ((new Date).getTime() - kb) / 1E3 + "s: " +
                a)
        } catch (d) {}
    }

    function Qb(a) {
        a || O("Internal Error")
    }

    function X(a, d) {
        for (var b in d.items)
            if (d.items[b].type == a) return b;
        return null
    }

    function Oa(a, d) {
        if (!d) return null;
        for (var b = d.parent; b;) {
            if (b && b.type == a) return b;
            b = b.parent
        }
        return null
    }

    function Aa(a, d) {
        var b = Oa(a, p[d]);
        return b ? b.id : null
    }

    function Rb(a, d) {
        if (null == d) return null;
        var b = X(a, d);
        if (b) {
            var e, b = p[b],
                l = null;
            for (e in b.items) l = b.items[e];
            if (e = l) return e
        }
        return null
    }

    function Sb(a) {
        var d = !1,
            b;
        for (b in a.parent.items) {
            if (d) return a.parent.items[b];
            a.parent.items[b] == a && (d = !0)
        }
        return null
    }

    function Tb(a) {
        var d = null,
            b;
        for (b in a.parent.items) {
            if (a.parent.items[b] == a) return d;
            d = a.parent.items[b]
        }
    }

    function lb() {
        var a = !0,
            d = !1;
        if (!Y) {
            if (!mb())
                for (var b in h) h[b].idScene == y && (h[b].started || (d = !0), h[b].started && !h[b].complete && (a = !1));
            ra && (a = !1);
            if (a)
                if (mb()) za = !1;
                else {
                    a = !1;
                    for (b in h) h[b].idScene == y && (d && null != h[b].idMsg && null == h[b].idMsgNext || (h[b].idMsg = h[b].idMsgNext, h[b].idMsgNext = null, null == h[b].idMsg && (a = !0)), h[b].started = !1, h[b].complete = !1);
                    a ? (d = f.Presenting, f.Presenting = !1, n.startshieldonidle && (document.getElementById(g + "StartShield").style.display = "block", da = !0, f.Focus = yc()), 0 == f.Presenting && 0 < S.length ? (b = S.shift(), Ub(), "play" == b.type ? (f.Focus = b.data, f.Presenting = "true", r("Playing from queue with: " + f.Focus), G()) : "speak" == b.type && (f.Text = b.data, f.Focus = C("Speak"), f.Presenting = "true", r("Speaking from queue with: " + f.Text), G()), b = !0) : b = !1, b || (d != f.Presenting && Mb(), d = p[f.Focus], d = d.parent, "dialog" == d.type && (d = d.parent), f.Focus = d.id, gb(),
                        Z(n), Pa(), Qa())) : Qa()
                }
        }
    }

    function mb() {
        for (var a in h)
            if (h[a].idMsgNext != h[a].idMsg || !h[a].idMsg || -1 == h[a].idMsg.indexOf("Idle")) return !1;
        return !0
    }

    function nb(a) {
        var d = n;
        for (pass = 1; 2 >= pass; pass++) {
            var b = [],
                e;
            for (e in d.items)
                for (var l in d.items[e].items) {
                    var f = d.items[e].items[l];
                    if ("message" == f.type && (1 == pass && f.idle && f.customidle && f.character == a && b.push(l), 2 == pass && f.idle && !f.customidle && f.character == a)) return l
                }
            if (0 < b.length) return b[Math.floor(Math.random() * b.length)]
        }
        return null
    }

    function R(a) {
        return k &&
            a ? k + "/" + a : a
    }

    function Vb(a) {
        var d = a.url;
        if (void 0 != a.addvariables) {
            if (-1 != a.addvariables.indexOf("AIMLUser")) {
                var b = new Date;
                b.setTime(b.getTime() + 31536E6);
                b.toGMTString();
                if (!f.AIMLUser)
                    if (b = zc("AIMLUser")) f.AIMLUser = b, r("Returning with aimluser " + b);
                    else {
                        b = "User";
                        for (i = 0; 10 > i; i++) b += Math.floor(9 * Math.random()) + 1;
                        r("Creating aimluser " + b);
                        f.AIMLUser = b;
                        Ac("AIMLUser", b, 365)
                    }
                if (!f.AIMLSession) {
                    b = "Session";
                    for (i = 0; 10 > i; i++) b += Math.floor(9 * Math.random()) + 1;
                    r("Creating aimlsession " + b);
                    f.AIMLSession = b
                }!f.AIMLSequence &&
                    f.AIMLSession && (f.AIMLSequence = 1);
                f.AIMLTimezone || (f.AIMLTimezone = (new Date).getTimezoneOffset())
            }
            n.userid && (d += "&userid=" + encodeURIComponent(n.userid));
            var b = !1,
                e;
            for (e in h)
                if (h[e].idScene == y) {
                    e = document.getElementById(g + e + "Audio");
                    !e.canPlayType("audio/mp3") && e.canPlayType("audio/ogg") && (b = !0);
                    break
                }
            d += "&genogv=" + (b ? "true" : "false");
            a = a.addvariables.split(",");
            for (e = 0; e < a.length; e++) b = f[a[e]], b = void 0 == b ? "" : b.toString(), 0 < b.length && (d += "&" + a[e] + "=" + encodeURIComponent(b))
        }
        return d
    }

    function Ac(a,
        d, b) {
        if ("function" == typeof onWriteCookie) return onWriteCookie(a, d, b);
        if (b) {
            var e = new Date;
            e.setTime(e.getTime() + 864E5 * b);
            b = "; expires=" + e.toGMTString()
        } else b = "";
        document.cookie = a + "=" + d + b + "; path=/"
    }

    function zc(a) {
        if ("function" == typeof onReadCookie) return onReadCookie(a);
        a += "=";
        for (var d = document.cookie.split(";"), b = 0; b < d.length; b++) {
            for (var e = d[b];
                " " == e.charAt(0);) e = e.substring(1, e.length);
            if (0 == e.indexOf(a)) return e.substring(a.length, e.length)
        }
        return null
    }

    function Ra(a) {
        var d = "",
            b = Bc(k),
            e = !1;
        "https://" == b.substr(0, 8) ? (b = b.substr(8), d = b.substr(0, b.indexOf("/")), e = !0) : "http://" == b.substr(0, 7) && (b = b.substr(7), d = b.substr(0, b.indexOf("/")));
        b = "";
        "https://" == a.substr(0, 8) ? (b = a.substr(8), b = b.substr(0, b.indexOf("/")), e = !0) : "http://" == a.substr(0, 7) && (b = a.substr(7), b = b.substr(0, b.indexOf("/")));
        "" != b && "" != d && b != d && (temparray = a.split(b), a = salt = temparray.join(d));
        e && "http://" == a.substr(0, 7) && (a = "https://" + a.substr(7));
        return a
    }

    function Bc(a) {
        null == ob && (ob = document.createElement("a"));
        ob.href = a;
        return ob.href
    }

    function Qa() {
        Sa = !0;
        0 < la.length && O("code 4");
        la = [];
        for (var a in h) h[a].idScene == y && la.push(a);
        0 < la.length ? (a = la.pop(), Cc(a)) : Wb()
    }

    function Cc(a) {
        var d = h[a].idMsg,
            b = p[d];
        b ? b.datafile && !b.onframe ? window["MSData_" + n.project + d] ? (b.onframe = window["MSData_" + n.project + d], pb(a, d)) : (Ba = d, a = document.createElement("script"), d = document.getElementById(g), d.appendChild(a), b = R(b.datafile), a.src = b) : b.external ? Ca || (Ca = a, qb = d, b = Ra(Vb(b)), f.AIMLSequence && (b += "&AIMLSequence=" + f.AIMLSequence, f.AIMLSequence++), b += "&callback=msExternalLoaded",
            Da && Xb == b ? Dc(externalData) : sa && Xb == b ? sa = !1 : (a = document.createElement("script"), d = document.getElementById(g), d.appendChild(a), a.onerror = function() {
                qb = Ca = M = null;
                f.Presenting = !1
            }, a.src = b, r("Calling " + b))) : (Ea = null, pb(a, d)) : (M = a, rb())
    }

    function Dc(a) {
        for (var d in a) {
            Ea = a[d];
            Ea.id = d;
            break
        }
        Yb++;
        pb(Ca, qb);
        qb = Ca = null;
        sa = Da = !1;
        preloadedURL = preloadedData = null
    }

    function dd() {
        sa = !0;
        Da = !1;
        var a = C("Speak"),
            d = p[a];
        if (d) {
            a = f.Text;
            f.Text = S[0].data;
            d = Ra(Vb(d));
            f.Text = a;
            var a = d + "&MP3Prefetch=true",
                d = d + "&callback=msExternalLoaded",
                b = document.getElementById(g);
            Ta || (Ta = document.createElement("audio"), b.appendChild(Ta));
            Ta.src = a;
            Ta.pause();
            var e = document.createElement("script");
            b.appendChild(e);
            Xb = d;
            e.src = d;
            r("Preloading " + a);
            r("Preloading " + d)
        }
    }

    function pb(a, d) {
        var b = p[d],
            e;
        e = 1 == b.idle ? b : b.external ? Ea : b;
        f.Presenting && J.buttonset && J.buttonset.layoutButtonSet(f, e, Ec(a));
        var l = p[b.character];
        M = a;
        h[a].charCanvas || "replace" != l.mode || l.width == l.artwidth || (h[a].charCanvas = document.createElement("canvas"), h[a].charCanvas.height = l.artheight,
            h[a].charCanvas.width = l.artwidth, h[a].cyCharTop = 0, h[a].cxCharLeft = 0);
        K = 1;
        Zb(h[a].aImg);
        h[a].aImg = null;
        A = {};
        if (e && e.onframe && e.onframe["0"]) {
            sb = b.external ? Ra(b.url) : null;
            H = d;
            v = a;
            T = b.external ? "Inst" + Yb.toString() : "";
            c = f;
            try {
                eval(e.onframe["0"])
            } catch (z) {
                if (2 <= Q) debugger
            }
            v = H = c = null;
            T = "";
            sb = null
        }
        for (i in A);
        K--;
        0 == K && setTimeout(function() {
            M = a;
            rb()
        }, 1)
    }

    function ed(a, d) {
        var b = a.indexOf("cs.exe");
        return -1 != b ? a.substr(0, b - 1) + "html/" + d : null
    }

    function $b() {
        K--;
        0 > K ? (O("code 3"), K = 0) : Y && 0 == K ? ac() : ra && 0 == K ? bc() :
            M && 0 == K && rb()
    }

    function ma(a) {
        return "object" == typeof a && a.hasOwnProperty("msvector")
    }

    function Fc() {
        nAudio = 0;
        for (idChar in h) h[idChar].idScene == y && h[idChar].loadingAudio && nAudio++;
        return nAudio
    }

    function cc(a) {
        h[a].loadingAudio = !1;
        var d = Fc(),
            b = !1;
        for (a in h) h[a].idMsgNext && (b = !0);
        null != Y || null != Ca || null != Ba || 0 != la.length || null != M || 0 != d || b || Wb()
    }

    function rb() {
        var a = M;
        M = null;
        h[a].aImg = A;
        A = {};
        h[a].aImgShow = [];
        h[a].started = !1;
        h[a].complete = !1;
        h[a].fRecovering = !1;
        h[a].action = "";
        h[a].fStopReached = !1;
        0 < la.length ?
            (a = la.pop(), Cc(a)) : 0 == Fc() && Wb()
    }

    function Wb() {
        Fa = -1;
        M = null;
        N();
        za = !1;
        if (dc) dc = !1, G();
        else {
            for (idChar in h)
                if (h[idChar].idScene == y) {
                    var a = document.getElementById(g + idChar + "Audio");
                    0 < a.src.length ? (Gc(a), Ua = 0, aa = Va = (new Date).getTime(), Wa = 0) : h[idChar].frame = 1
                }
            Sa = !1;
            f.Presenting || (ba = ec("autostartoninactivity"))
        }
    }

    function ec(a) {
        for (var d = p[f.Focus]; d;) {
            if (d[a]) return d[a];
            d = d.parent
        }
        return 0
    }

    function Gc(a) {
        "function" == typeof onAudioPlay ? onAudioPlay() : a.play()
    }

    function tb(a) {
        "function" == typeof onAudioPause ?
            onAudioPause() : a.pause()
    }

    function fd(a) {
        var d;
        if (a)
            for (d = 0; d < ta.length; d++)
                if (ta[d].src == a) return a = ta[d], ta.splice(d, 1), a;
        return 0 < ta.length ? (a = ta.shift(), a.src = "", a.data = null, a) : new Image
    }

    function Zb(a) {
        for (var d in a)
            if (a[d].src) {
                var b = a[d];
                b.onload = null;
                ta.push(b)
            }
    }

    function ub(a) {
        for (var d in a.items) {
            var b = a.items[d];
            if ("image" == b.type) b = R(b.file), A[d] = new Image, A[d].onload = function() {
                $b()
            }, K++, A[d].src = b;
            else if ("button" == b.type)
                for (var e = "backfile backoverfile backdownfile backdisabledfile backchosenfile forefile foreoverfile foredisabledfile forechosenfile".split(" "),
                        l = 0; l < e.length; l++) b[e[l]] && (A[d + e[l]] = new Image, A[d + e[l]].onload = function() {
                    $b()
                }, K++, A[d + e[l]].src = R(b[e[l]]));
            else if ("character" != b.type || b.narrator) "grid" == b.type ? ub(b) : "slideshow" == b.type && (b = b.items[w]) && ub(b);
            else {
                b = nb(d);
                e = p[b];
                vb = 1;
                v = d;
                H = b;
                c = f;
                try {
                    eval(e.onframe["0"])
                } catch (z) {
                    if (2 <= Q) debugger
                }
                H = v = c = null;
                vb = 0
            }
        }
    }

    function ac() {
        Qb(y == Y);
        Y = null;
        N();
        Z(n);
        fa = void 0;
        Ga(y);
        Hc(y);
        w && Ga(w);
        na(n);
        wb(n.items[y]);
        fc(y);
        w && fc(w);
        var a;
        Xa && (a = document.getElementById(g + Xa + "Div"), a.style.display = "none");
        a = document.getElementById(g + y + "Div");
        a.style.display = "block";
        f.Preview && (document.getElementById(g + "PreviewDiv").style.display = "block");
        fa && (fa.focus(), fa = void 0);
        A = {};
        w && (a = document.getElementById(g + w + "Div"), a.style.display = "block");
        L && Ga(L);
        Ha = Xa = null;
        da ? za = !1 : Qa()
    }

    function Hc(a) {
        a = p[a];
        for (var d in a.items) {
            var b = a.items[d];
            "grid" == b.type && Ga(b.id)
        }
    }

    function fc(a) {
        a = p[a];
        for (var d in a.items) {
            var b = a.items[d];
            if (b.snaptoparent) {
                var e = 0,
                    l = 0,
                    g = a.parent == n ? n.width : f.getWidth(a.parent.id),
                    h = a.parent ==
                    n ? n.height : f.getHeight(a.parent.id);
                if (b.crop) {
                    var e = Math.max(g / b.widthOriginal, h / b.heightOriginal),
                        q = b.widthOriginal * e,
                        b = b.heightOriginal * e,
                        e = (g - q) / 2,
                        l = (h - b) / 2,
                        x = V(d);
                    x.style.x = 0;
                    x.style.y = 0;
                    x.style.width = g + "px";
                    x.style.height = h + "px";
                    x.style.backgroundSize = q + "px " + b + "px";
                    x.style.backgroundPosition = e + "px " + l + "px"
                } else f.setPosition(b.id, e, l), f.setSize(b.id, g, h)
            }
        }
    }

    function Ga(a) {
        a = p[a];
        var d = a.onshow;
        if (d) {
            c = f;
            bsthis = a;
            try {
                eval(d)
            } catch (b) {
                if (2 <= Q) debugger
            }
            bsthis = c = null
        }
        Ic(a);
        gc(n)
    }

    function gc(a) {
        for (id in a.items)
            if (obj =
                a.items[id], "scene" == obj.type && y != id) gc(obj);
            else if ("slide" == obj.type && w != id) gc(obj);
        else if ("sound" == obj.type) {
            var d = Jc(obj.id);
            d.pause();
            d.currentTime = 0
        } else "movie" == obj.type && (d = W(obj.id), d.pause(), d.currentTime = 0)
    }

    function Ic(a) {
        for (id in a.items) obj = a.items[id], "sound" == obj.type ? obj.autoplay && Jc(obj.id).play() : "movie" == obj.type ? obj.autoplay && W(obj.id).play() : obj.hasOwnProperty("items") && Ic(obj)
    }

    function wb(a) {
        for (var d in a.items) {
            var b = a.items[d];
            if ("image" == b.type) {
                var e = document.getElementById(g +
                        d + "Div"),
                    l = Pb(b);
                e.style.background = "url(" + R(b.file) + ") -" + l.cxLeft + "px -" + l.cyTop + "px";
                b.tile ? e.style.backgroundRepeat = "repeat" : e.style.backgroundSize = b.width + "px " + b.height + "px"
            } else if ("button" == b.type) P(d);
            else if ("character" == b.type && !b.narrator) {
                e = nb(d);
                l = p[e];
                xb(d);
                h[d].aImg = {};
                h[d].aImgShow = [];
                for (var z in A) e == z.substr(0, e.length) && (h[d].aImg[z] = A[z]);
                v = d;
                H = e;
                c = f;
                try {
                    eval(l.onframe["1"])
                } catch (x) {
                    if (2 <= Q) debugger
                }
                H = v = c = null;
                ca && hc(d, e, "");
                "replace" == b.mode && b.width != b.artwidth && (h[d].charCanvas =
                    document.createElement("canvas"), h[d].charCanvas.height = b.artheight, h[d].charCanvas.width = b.artwidth, h[d].cyCharTop = 0, h[d].cxCharLeft = 0);
                h[d].charCanvas && Kc(d);
                Zb(h[d].aImg);
                h[d].aImg = null;
                h[d].aImgShow = null
            } else if ("grid" == b.type) wb(b);
            else if ("slideshow" == b.type) {
                var Na, q;
                for (q in b.items) {
                    Na = b.items[q];
                    break
                }
                Na && wb(Na)
            }
        }
    }

    function bc() {
        Qb(ra == w);
        ra = null;
        var a = p[w];
        wb(a);
        var d = Ha ? document.getElementById(g + Ha + "Div") : null,
            b = document.getElementById(g + w + "Div");
        fc(w);
        fa = void 0;
        Ga(w);
        Hc(w);
        na(n);
        a = a.transition;
        "cross" != a || Ha || (a = "simple");
        "cross" == a ? (fade = {
            from: d,
            to: b,
            cms: 500,
            tStart: (new Date).getTime()
        }, ga.push(fade), yb || zb()) : "simple" == a ? (d && (d.style.display = "none"), Lc(b, 500)) : (d && (d.style.display = "none"), b.style.display = "block");
        fa && (fa.focus(), fa = void 0);
        A = {};
        Ha = Xa = null;
        lb()
    }

    function Lc(a, d) {
        fade = {
            from: null,
            to: a,
            cms: d,
            tStart: (new Date).getTime()
        };
        ga.push(fade);
        yb || zb()
    }

    function zb() {
        for (var a = (new Date).getTime(), d = !1, b = 0; b < ga.length; b++) {
            var e = ga[b].from,
                l = ga[b].to,
                f = (a - ga[b].tStart) / ga[b].cms;
            1 > f ?
                (e && (e.style.display = "block"), l && (l.style.display = "block"), e && (e.style.opacity = 1 - f), l && (l.style.opacity = f), d = !0) : (e && (e.style.display = "none"), l && (l.style.display = "block"), ga.splice(b, 1), b--)
        }
        d ? requestAnimationFrame(zb) : yb = !1
    }

    function P(a) {
        var d = p[a];
        if (d.backfile || d.backclass)
            for (var b = 1; 2 >= b; b++) {
                var e = 1 == b ? "file" : "class",
                    l = "back" + e,
                    f = "fore" + e,
                    h = d.xfore,
                    q = d.yfore,
                    x = !1,
                    u, k;
                d.disabled ? d.hideondisabled ? x = !0 : (u = "backdisabled" + e, d[u] && (l = u), u = "foredisabled" + e, d[u] && (f = u)) : d.chosen ? (u = "backchosen" + e, k =
                    "backover" + e, d[u] ? l = u : d[k] && (l = k), u = "forechosen" + e, k = "foredown" + e, d[u] ? f = u : d[k] && (f = k)) : d.over && !d.down ? (u = "backover" + e, d[u] && (l = u), u = "foreover" + e, d[u] && (f = u)) : d.over && d.down && (u = "backdown" + e, d[u] && (l = u), u = "foreover" + e, d[u] && (f = u), h = parseInt(d.xfore) + parseInt(d.xdown), q = parseInt(d.yfore) + parseInt(d.ydown));
                document.getElementById(g + a + "Div").style.display = x || d.hidden ? "none" : "block";
                e = document.getElementById(g + a + "Back");
                d[l] && (-1 != l.indexOf("file") ? e.src = R(d[l]) : (e.className = d[l], x = d.applysizetobackstyle ?
                    "width:" + d.width + "px;height:" + d.height + "px" : "", l = l.replace("class", "style"), d[l] && (x += (0 < x.length ? ";" : "") + d[l]), e.style.cssText = x));
                if (l = document.getElementById(g + a + "Fore")) d[f] && (-1 != f.indexOf("file") ? l.src = R(d[f]) : (l.className = d[f], f = f.replace("class", "style"), d[f] && (l.style.cssText = d[f]))), l.style.left = h + "px", l.style.top = q + "px";
                if (f = document.getElementById(g + a + "Lbl")) f.style.left = h + "px", f.style.top = q - 2 + "px"
            }
    }

    function ua() {
        var a = p[f.Focus];
        if (null == a) O("Invalid Focus value " + f.Focus + " - ignoring!"),
            f.Presenting = !1;
        else if (a = a.type, "scene" == a) {
            y = f.Focus;
            if (w = (Ia = X("slideshow", p[y])) ? Ya ? Ya : X("slide", p[Ia]) : null) f.Focus = w, Ya = null;
            L = (oa = X("sequence", p[w ? w : y])) ? ha ? ha : X("step", p[oa]) : null;
            null != L && (f.Focus = L, ha = null);
            Pa();
            I && (f.Focus = I, I = null)
        } else if ("slide" == a) {
            if ((a = Aa("scene", f.Focus)) && a != y) return Ya = f.Focus, f.Focus = a, ua();
            w = f.Focus;
            if (L = (oa = X("sequence", p[w])) ? ha ? ha : X("step", p[oa]) : null) f.Focus = L, ha = null;
            Pa();
            I && (f.Focus = I, I = null)
        } else if ("step" == a) {
            if ((a = Aa("slide", f.Focus)) && a != w || (a = Aa("scene",
                    f.Focus)) && a != y) return ha = f.Focus, f.Focus = a, ua();
            L = f.Focus;
            Pa();
            I && (f.Focus = I, I = null)
        } else if ("message" == a || "dialog" == a) {
            if ((a = Aa("step", f.Focus)) && a != L || (a = Aa("slide", f.Focus)) && a != w || (a = Aa("scene", f.Focus)) && a != y) return I = f.Focus, f.Focus = a, ua();
            I = f.Focus;
            Pa()
        }
    }

    function Pa() {
        var a = !0;
        for (idChar in h)
            if (h[idChar].idScene == y) {
                var d = null;
                f.Presenting ? (L ? d = ic(L, idChar) : w ? d = ic(w, idChar) : y && (d = ic(y, idChar)), null == d ? d = nb(idChar) : a = !1) : d = nb(idChar);
                h[idChar].idMsg ? h[idChar].idMsgNext = d : h[idChar].idMsg = d
            }
        a &&
            (f.Presenting = !1)
    }

    function ic(a, d) {
        var b = p[a],
            e = null,
            l;
        for (l in b.items) {
            var g = b.items[l];
            if ("message" == g.type && I == l) return l;
            if ("dialog" == g.type && I == l) {
                for (var h in g.items)
                    if (b = g.items[h], b.character == d) return h;
                return l
            }
        }
        for (l in b.items)
            if (g = b.items[l], "message" == g.type && g.character == d && !g.idle) {
                var q = !0;
                if (g.condition) {
                    c = f;
                    bsthis = g;
                    try {
                        q = eval(g.condition)
                    } catch (x) {
                        if (q = !1, 2 <= Q) debugger
                    }
                    bsthis = c = null
                }
                if (q) {
                    g = f.Focus;
                    f.Focus = l;
                    g != f.Focus && gb();
                    e = l;
                    break
                }
            } else if ("dialog" == g.type) {
            for (h in g.items)
                if (b =
                    g.items[h], b.character == d) return h;
            return l
        }
        return e
    }

    function Mc() {
        var a;
        return L && (a = Sb(p[L])) || w && (a = Sb(p[w])) || y && !n.focusisland && (a = Sb(p[y])) ? a.id : null
    }

    function Nc() {
        var a;
        if (L && (a = Tb(p[L]))) return a.id;
        if (w) {
            a = Tb(p[w]);
            var d = Rb("sequence", a);
            d && (a = d);
            if (a) return a.id
        }
        return y && !n.focusisland && (a = Tb(p[y]), (d = Rb("slideshow", a)) && (a = d), (d = Rb("sequence", a)) && (a = d), a) ? a.id : null
    }

    function yc() {
        var a = null;
        n.focusisland ? null != Ia ? a = X("slide", p[Ia]) : null != oa && (a = X("step", p[oa])) : a = X("scene", n);
        return a
    }

    function G() {
        if (Ab) jc = !0;
        else if (za) dc = !0;
        else {
            za = !0;
            ia = ba = 0;
            var a = y,
                d = w,
                b = L;
            for (idChar in h)
                if (h[idChar].idScene == y) {
                    var e = document.getElementById(g + idChar + "Audio");
                    e && tb(e)
                }
            Xa = y;
            Ha = w;
            ha = Ya = I = null;
            ua();
            for (idChar in h)
                if (h[idChar].idScene == y && (e = h[idChar].idMsgNext, null == e && (e = h[idChar].idMsg), e)) {
                    var e = p[e],
                        l, z;
                    e.external ? (e = Vb(e), f.AIMLSequence && (e += "&AIMLSequence=" + f.AIMLSequence), l = Ra(e + "&MP3Prefetch=true"), z = Ra(e + "&OGVPrefetch=true")) : (l = R(e.file), z = R(e.altfile));
                    var e = idChar,
                        k = document.getElementById(g +
                            e + "Audio");
                    ea || Ma || hb || k.canPlayType("audio/mp3") || !k.canPlayType("audio/ogg") || (l = z);
                    l ? h[e].loadingAudio || (k.autoplay = !0, "function" == typeof onAudioLoad ? onAudioLoad(l) : (k.src = l, k.load()), tb(k), h[e].loadingAudio = !0) : (k.removeAttribute("src"), h[e].loadingAudio = !1)
                }
            if (-1 != Fa)
                for (idChar in h)
                    if (h[idChar].started && 0 == h[idChar].frame) {
                        var e = p[h[idChar].idMsg],
                            q;
                        for (q in e.onframe)
                            if (Math.floor(1E3 * (q - 1) / n.fps) > Fa) {
                                h[idChar].frame = q;
                                break
                            }
                    }
            Z(n);
            if (y != a) {
                for (var x in h) h[x].idScene == a && (Zb(h[x].aImg), h[x].aImg =
                    null, h[x].aImgShow = null, h[x].idMsg = null, h[x].idMsgNext = null, h[x].fRecovering = !1, h[x].fFirstFrameAfterRec = !1, h[x].fStopReached = !0), h[x].frame = 0;
                fb || (a = document.getElementById(g), Lb.spin(a), fb = !0);
                Y = y;
                K = 1;
                A = {};
                ub(p[Y]);
                for (var u in A);
                K--;
                0 == K && ac()
            } else if (w != d) {
                Qb(!Y && !ra && !M);
                ra = w;
                K = 1;
                A = {};
                ub(p[w]);
                for (var m in A);
                K--;
                0 == K && bc();
                Z(n)
            } else L != b && Z(n);
            L && (Ga(L), na(n));
            lb()
        }
    }

    function Z(a) {
        for (id in a.items)
            if (obj = a.items[id], "button" == obj.type) {
                var d = obj.behavior;
                if (d) {
                    switch (d) {
                        case "start":
                            obj.disabled =
                                f.Presenting;
                            break;
                        case "stop":
                            obj.disabled = !f.Presenting;
                            break;
                        case "next":
                            f.NextEnabled = null != Mc();
                            obj.disabled = !f.NextEnabled;
                            break;
                        case "previous":
                        case "first":
                            f.PrevEnabled = null != Nc();
                            obj.disabled = !f.PrevEnabled;
                            break;
                        case "pause":
                            obj.disabled = !(f.Presenting && !f.Paused);
                            break;
                        case "resume":
                            obj.disabled = !(f.Presenting && f.Paused);
                            break;
                        case "mute":
                            obj.disabled = f.Muted;
                            break;
                        case "unmute":
                            obj.disabled = !f.Muted
                    }
                    P(id)
                }
            } else obj.hasOwnProperty("items") && Z(obj)
    }

    function sc(a) {
        for (var d in a.items) {
            var b =
                a.items[d];
            if ("rectangle" == b.type) {
                if (b.wash) {
                    var e = document.getElementById(g + b.id + "Div"),
                        e = e.getContext("2d"),
                        l = e.createLinearGradient(0, 0, "horizontal" == b.wash ? b.width : 0, "vertical" == b.wash ? b.height : 0);
                    l.addColorStop(0, b.fillcolor1);
                    l.addColorStop(1, b.fillcolor2);
                    e.fillStyle = l;
                    e.fillRect(0, 0, b.width, b.height)
                }
            } else if ("line" == b.type || "arrow" == b.type) {
                var e = document.getElementById(g + b.id + "Div"),
                    l = Math.min(b.x1, b.x2) - 5,
                    h = Math.min(b.y1, b.y2) - 5,
                    e = e.getContext("2d");
                e.lineWidth = b.width ? b.width : 1;
                e.strokeStyle =
                    b.color ? b.color : "#000";
                e.fillStyle = b.color ? b.color : "#000";
                e.beginPath();
                e.moveTo(b.x1 - l, b.y1 - h);
                if ("line" == b.type) e.lineTo(b.x2 - l, b.y2 - h), e.stroke();
                else {
                    var k, q, x;
                    x = b.x2;
                    q = b.y2;
                    var u = b.x1,
                        m = b.y1,
                        p = b.arrowlength ? b.arrowlength : 10;
                    k = b.arrowradius ? b.arrowradius : 3;
                    var n = Math.sqrt((u - x) * (u - x) + (m - q) * (m - q)),
                        v = p * (u - x) / n + x,
                        p = p * (m - q) / n + q;
                    u == x ? (x = v - 1, q = p) : m == q ? (x = v, q = p - 1) : (n = -1 / ((m - q) / (u - x)), b2 = p - n * v, q = n * x + b2);
                    n = Math.sqrt((x - v) * (x - v) + (q - p) * (q - p));
                    k = [v, p, k * (x - v) / n + v, k * (q - p) / n + p, -k * (x - v) / n + v, -k * (q - p) / n + p];
                    e.lineTo(k[0] -
                        l, k[1] - h);
                    e.stroke();
                    e.moveTo(k[2] - l, k[3] - h);
                    e.lineTo(k[4] - l, k[5] - h);
                    e.lineTo(b.x2 - l, b.y2 - h);
                    e.fill()
                }
            } else "component" == b.type ? J[b["class"]].init(f, b) : "slideshow" != b.type && "slide" != b.type && "grid" != b.type || sc(b)
        }
    }

    function pa(a, d) {
        r("goto" + d + " " + a);
        a = C(a);
        S = [];
        b = f.Focus;
        f.Focus = a;
        b != f.Focus && gb();
        var b = f.Presenting;
        "AndStart" == d || "AndRestart" == d ? f.Presenting = !0 : "AndStop" == d && (f.Presenting = !1);
        b != f.Presenting && Mb();
        "AndRestart" == d && (f.Restart = !0);
        f.Paused = !1;
        p[f.Focus] ? G() : O("unknown focus " + a);
        da &&
            (r("external api caused us to remove StartShield"), document.getElementById(g + "StartShield").style.display = "none", da = !1, Qa())
    }

    function gb() {
        r("Firing onFocusChange(" + g + "," + f.Focus + ")");
        na(n);
        "function" == typeof onFocusChange && onFocusChange(g, f.Focus)
    }

    function Mb() {
        r("Firing onPresentingChange(" + g + "," + f.Presenting + ")");
        na(n);
        "function" == typeof onPresentingChange && onPresentingChange(g, f.Presenting)
    }

    function Ec(a) {
        a = Oa("scene", p[a]);
        for (var d in a.items) {
            var b = a.items[d];
            if ("buttonset" == b.type) return b
        }
        return null
    }

    function kc(a) {
        r("nextFocus" + a);
        var d = Mc();
        d ? (f.Focus = d, "andStart" == a ? f.Presenting = !0 : "andStop" == a && (f.Presenting = !1)) : f.Presenting = !1;
        "always" != n.allowautoplay && ("never" == n.allowautoplay || (Ma || hb || ea) && 1 == n.presenting && !n.noaudio) && (r("allowautoplay - presenting, encountered next: going Presenting false"), f.Presenting = !1);
        G();
        f.Paused = !1
    }

    function lc(a) {
        r("previousFocus" + a);
        var d = Nc();
        d && (f.Focus = d, "andStart" == a ? f.Presenting = !0 : "andStop" == a && (f.Presenting = !1), G());
        f.Paused = !1
    }

    function Oc() {
        var a =
            f.Muted ? 0 : 1;
        for (charid in h)
            if (h[idChar].idScene == y) {
                var d = document.getElementById(g + idChar + "Audio");
                d && (d.volume = a)
            }
    }

    function Bb(a) {
        if (1 == a || 2 == a) {
            var d = 0,
                b = 0;
            if (Ia) {
                var e = p[Ia];
                for (id in e.items) id == w && (b = d), d++
            }
            return 1 == a ? b + 1 : d
        }
        b = d = 0;
        if (oa)
            for (id in e = p[oa], e.items) id == L && (b = d), d++;
        return 3 == a ? b + 1 : 4 == a ? d : 0
    }

    function Cb(a) {
        for (var d = 1; 2 >= d; d++) {
            var b = p[y],
                e = 1,
                l;
            for (l in b.items) {
                var f = b.items[l];
                if ("message" == f.type && f.text) {
                    if (1 == a) return ja = 1, f.text;
                    if (2 == a && ja + 1 == e || 3 == a && ja - 1 == e) return ja = e,
                        f.text;
                    if (4 == a && ja == e) return f.id;
                    e++
                }
            }
            if (1 == a || 4 == a) return "";
            2 == a ? ja = 0 : 3 == a && (ja = e)
        }
        ja = 1;
        return ""
    }

    function Za(a) {
        var d = Oa("slideshow", bsthis),
            b = 0,
            e = 0,
            l = 0;
        if (d)
            for (var f in d.items) {
                var g = d.items[f];
                g.hasscore && (b++, 1 == g.score || 0 == g.score) && (e++, l += g.score)
            }
        return 1 == a ? b : 2 == a ? e : 3 == a ? l : 4 == a ? Math.round(100 * e / b) : 5 == a ? Math.round(100 * l / b) : 0
    }

    function Pc(a, d) {
        a = C(a);
        var b = p[a];
        b && ("button" == b.type ? (b.hidden = !d, P(a)) : V(a).style.display = d ? "block" : "none")
    }

    function Qc(a, d) {
        a = C(a);
        var b = p[a];
        if ("editcontrol" ==
            b.type) {
            if (b = document.getElementById(g + a + "Edit")) b.disabled = d
        } else "button" == b.type && (b.disabled = d, P(a))
    }

    function W(a) {
        a = C(a);
        return document.getElementById(g + a + "Video")
    }

    function Jc(a) {
        a = C(a);
        return document.getElementById(g + a + "Audio")
    }

    function V(a) {
        return document.getElementById(g + a + "Div")
    }

    function xb(a) {
        ca = !1;
        Ja = Ka = 0;
        a = p[a];
        Db = a.width;
        Eb = a.height
    }

    function Rc(a, d) {
        for (var b = h[a].aImgShow, e = 0; e < b.length; e++)
            if (b[e] == d) return;
        b.push(d)
    }

    function La(a) {
        a.style.display = "none";
        a.offsetHeight;
        a.style.display =
            "inherit"
    }

    function Kc(a) {
        var d = p[a];
        if (h[a].charCanvas) {
            var b = document.getElementById(g + a + "Canvas");
            if (b.getContext) {
                var e = b.getContext("2d");
                e.imageSmoothingEnabled = !0;
                e.clearRect(0, 0, parseInt(d.width), parseInt(d.height));
                ea && La(b);
                e.drawImage(h[a].charCanvas, 0, 0, d.artwidth, d.artheight, 0, 0, parseInt(d.width), parseInt(d.height))
            }
        }
    }

    function hc(a, d, b) {
        var e = h[a].charCanvas ? h[a].charCanvas : document.getElementById(g + a + "Canvas");
        if (e.getContext) {
            var f = e.getContext("2d");
            f.clearRect(0, 0, e.width, e.height);
            ea && La(e);
            for (var k = 0; k < h[a].aImgShow.length; k++) {
                var m = h[a].aImgShow[k],
                    q = h[a].aImg[m];
                if (q && (ma(q) || q.src))
                    if (ma(q)) {
                        var x = q.n,
                            u = q.x,
                            n = q.y,
                            v, r = p[a];
                        v = r.width / r.artwidth;
                        var y = q.arot;
                        if (q.morph) a: {
                            var w, D, r = f;w = q.data;
                            var B = q.morph,
                                A = h[a].aImg[d + b + q.morph].data,
                                q = x;D = u - 10 * h[a].cxCharLeft;
                            var C = n - 10 * h[a].cyCharTop,
                                n = v,
                                E = y;r.fillStyle = "rgba(0,0,0,100)";r.strokeStyle = "rgba(0,0,0,100)";r.lineWidth = 1;
                            var x = v = u = y = 0,
                                H, K, J = 0,
                                L = 0,
                                G = 0,
                                I = 0,
                                N = w.frames[0],
                                A = A.frames[0];
                            if (N.length != A.length) O("Tween fail - " +
                                m + " -> " + B + " - lengths differ");
                            else
                                for (var F = Sc(n, D / 10 - w.xView / 10 * n, C / 10 - w.yView / 10 * n, E), M = 0; M < N.length; M++) {
                                    D = N[M];
                                    w = A[M];
                                    if (D[0] != w[0]) {
                                        O("Tween fail - " + m + " -> " + B + " - " + D + " vs " + w);
                                        break a
                                    }
                                    switch (D[0]) {
                                        case "lw":
                                            r.lineWidth = D[1] / 10 * n;
                                            break;
                                        case "fs":
                                            r.fillStyle = "rgba(" + D[1] + "," + D[2] + "," + D[3] + "," + D[4] / 100 + ")";
                                            break;
                                        case "ss":
                                            r.strokeStyle = "rgba(" + D[1] + "," + D[2] + "," + D[3] + "," + D[4] / 100 + ")";
                                            break;
                                        case "bp":
                                            r.beginPath();
                                            L = J = I = xN = u = y = x = v = 0;
                                            break;
                                        case "m":
                                            v = D[1];
                                            x = D[2];
                                            G = w[1];
                                            I = w[2];
                                            xA = v + (G - v) * q / 100;
                                            yA = x + (I - x) * q / 100;
                                            r.moveTo(F.a * xA + F.c * yA + F.e, F.b * xA + F.d * yA + F.f);
                                            break;
                                        case "l":
                                            v = D[1];
                                            x = D[2];
                                            G = w[1];
                                            I = w[2];
                                            xA = v + (G - v) * q / 100;
                                            yA = x + (I - x) * q / 100;
                                            r.lineTo(F.a * xA + F.c * yA + F.e, F.b * xA + F.d * yA + F.f);
                                            break;
                                        case "b":
                                            7 == D.length ? (C = D[1], E = D[2], y = D[3], u = D[4], v = D[5], x = D[6]) : (C = v - (y - v), E = x - (u - x), y = D[1], u = D[2], v = D[3], x = D[4]);
                                            7 == w.length ? (H = w[1], K = w[2], J = w[3], L = w[4], G = w[5], I = w[6]) : (H = G - (J - G), K = I - (L - I), J = w[1], L = w[2], G = w[3], I = w[4]);
                                            5 == D.length && 7 == w.length ? (H = G - (J - G), K = I - (L - I)) : 7 == D.length && 5 == w.length && (C = v - (y - v), E = x -
                                                (u - x));
                                            x1A = C + (H - C) * q / 100;
                                            y1A = E + (K - E) * q / 100;
                                            x2A = y + (J - y) * q / 100;
                                            y2A = u + (L - u) * q / 100;
                                            xA = v + (G - v) * q / 100;
                                            yA = x + (I - x) * q / 100;
                                            r.bezierCurveTo(F.a * x1A + F.c * y1A + F.e, F.b * x1A + F.d * y1A + F.f, F.a * x2A + F.c * y2A + F.e, F.b * x2A + F.d * y2A + F.f, F.a * xA + F.c * yA + F.e, F.b * xA + F.d * yA + F.f);
                                            break;
                                        case "c":
                                            r.closePath();
                                            break;
                                        case "s":
                                            r.stroke();
                                            break;
                                        case "f":
                                            r.fill()
                                    }
                                }
                        }
                        else tc(f, m, q.data, x - 1, u - 10 * h[a].cxCharLeft, n - 10 * h[a].cyCharTop, v, y)
                    } else {
                        r = q.getAttribute("data-cyframe");
                        x = q.getAttribute("data-n");
                        u = q.getAttribute("data-x");
                        n = q.getAttribute("data-y");
                        f.drawImage(q, 0, (x - 1) * r, q.width, r, u - h[a].cxCharLeft, n - h[a].cyCharTop, q.width, r);
                        for (r = 1; 3 >= r; r++) m = q.getAttribute("data-exclude" + r), "" != m && (m = m.split(","), f.clearRect(m[0] - h[a].cxCharLeft, m[1] - h[a].cyCharTop, m[2], m[3]));
                        ea && La(e)
                    }
                else O("code 5")
            }
            xb(a)
        }
    }

    function tc(a, d, b, e, f, g, h, q) {
        if (e >= b.frames.length) O("Frame out of bounds " + d + " " + e);
        else {
            a.fillStyle = "rgba(0,0,0,100)";
            a.strokeStyle = "rgba(0,0,0,100)";
            a.lineWidth = 1.2;
            var l = d = 0,
                k = 0,
                m = 0;
            e = b.frames[e];
            q = Sc(h, f / 10 - b.xView / 10 * h, g / 10 - b.yView / 10 * h, q);
            for (var p =
                    0; p < e.length; p++) switch (g = e[p], g[0]) {
                case "lw":
                    a.lineWidth = 1.2 * g[1] / 10 * h;
                    break;
                case "fs":
                    a.fillStyle = "rgba(" + g[1] + "," + g[2] + "," + g[3] + "," + g[4] / 100 + ")";
                    break;
                case "ss":
                    a.strokeStyle = "rgba(" + g[1] + "," + g[2] + "," + g[3] + "," + g[4] / 100 + ")";
                    break;
                case "bp":
                    a.beginPath();
                    l = d = m = k = 0;
                    break;
                case "m":
                    k = g[1];
                    m = g[2];
                    a.moveTo(q.a * k + q.c * m + q.e, q.b * k + q.d * m + q.f);
                    break;
                case "l":
                    k = g[1];
                    m = g[2];
                    a.lineTo(q.a * k + q.c * m + q.e, q.b * k + q.d * m + q.f);
                    break;
                case "b":
                    7 == g.length ? (b = g[1], f = g[2], d = g[3], l = g[4], k = g[5], m = g[6]) : (b = k - (d - k), f = m - (l - m),
                        d = g[1], l = g[2], k = g[3], m = g[4]);
                    a.bezierCurveTo(q.a * b + q.c * f + q.e, q.b * b + q.d * f + q.f, q.a * d + q.c * l + q.e, q.b * d + q.d * l + q.f, q.a * k + q.c * m + q.e, q.b * k + q.d * m + q.f);
                    break;
                case "c":
                    a.closePath();
                    break;
                case "s":
                    a.stroke();
                    break;
                case "f":
                    a.fill()
            }
        }
    }

    function Sc(a, d, b, e) {
        var f = {
            a: 1,
            b: 0,
            c: 0,
            d: 1
        };
        f.e = d;
        f.f = b;
        f.a = f.a / 10 * a;
        f.d = f.d / 10 * a;
        for (a = 0; a < e.length; a++) {
            var g = e[a][0],
                h = e[a][1],
                k = e[a][2],
                m = -(h / 10 + b);
            f.e += -(g / 10 + d);
            f.f += m;
            var m = Math.cos(-k / 10 * 3.1415926535 / 180),
                p = Math.sin(-k / 10 * 3.1415926535 / 180),
                n = -Math.sin(-k / 10 * 3.1415926535 /
                    180),
                k = Math.cos(-k / 10 * 3.1415926535 / 180);
            f.a = m * f.a + n * f.b;
            f.c = m * f.c + n * f.d;
            f.e = m * f.e + n * f.f;
            f.b = p * f.a + k * f.b;
            f.d = p * f.c + k * f.d;
            f.f = p * f.e + k * f.f;
            h = h / 10 + b;
            f.e += g / 10 + d;
            f.f += h
        }
        return f
    }

    function hd() {
        var a = J.rasterctl;
        a && a.ctlTrack(f, h[v], v, H, mc, nc)
    }

    function qc() {
        $a && f.movieReached($a, Tc) && (f.movieStop($a), $a = void 0);
        if (!(f.Paused || da || Y || Sa)) {
            var a = (new Date).getTime();
            if (a > aa + 1E3 / n.fps) {
                va = 0;
                0 < qa && aa && (qa -= a - aa, 0 == qa && (qa = -1));
                0 < ia && aa && (ia -= a - aa, 0 == ia && (ia = -1));
                0 < ba && aa && (ba -= a - aa, 0 == ba && (ba = -1));
                if (0 > ba ||
                    0 > ia || 0 > qa) 0 > qa ? (va = 3, ab = 0) : 0 > ia ? (va = 2, ab = 0) : 0 > ba && (va = 1, ab++), ba = ia = qa = 0, wa(), f.Presenting || Fb || f.startPresenting();
                aa = a;
                jd(a - Va + Ua)
            }
        }
        f.vh && (a = f.vh.cp.variablesManager.getVariableValue("msPlay")) && (f.msPlay(a), f.vh.cp.variablesManager.setVariableValue("msPlay", ""));
        try {
            if (parent.GetPlayer) {
                var d = parent.GetPlayer().GetVar("msPlay");
                d && (f.msPlay(d), parent.GetPlayer().SetVar("msPlay", ""))
            }
        } catch (b) {}
        requestAnimationFrame(qc)
    }

    function jd(a) {
        if (!Ab) {
            Ab = !0;
            var d = 80 < a - Wa;
            d && (Wa = a);
            var b = !0,
                e;
            for (e in h)
                if (h[e].idScene ==
                    y) {
                    if (!h[e].started || h[e].complete || h[e].idMsgNext || h[e].fRecovering) b = !1;
                    if (!M || M == e) {
                        var g = p[h[e].idMsg];
                        if (g && !h[e].fStopReached && (g.external && Ea && (g = Ea), g.onframe)) {
                            xa = !1;
                            for (var k in g.onframe)
                                if (k = parseInt(k), 0 != k) {
                                    var m;
                                    0 < h[e].frame ? m = k == h[e].frame : (m = Math.floor(1E3 * (k - 1) / n.fps), m = m > Fa && m <= a);
                                    if (m) {
                                        k > g.frames / 3 && Uc(g);
                                        h[e].fFirstFrameAfterRec && (h[e].aImgShow = [], h[e].fFirstFrameAfterRec = !1);
                                        h[e].started = !0;
                                        xb(e);
                                        v = e;
                                        H = h[e].idMsg;
                                        T = p[H].external ? "Inst" + Yb.toString() : "";
                                        c = f;
                                        bsthis = g;
                                        try {
                                            eval(g.onframe[k])
                                        } catch (q) {
                                            if (2 ==
                                                Q) debugger
                                        }
                                        H = v = bsthis = c = null;
                                        ca && !M && hc(e, g.id, T);
                                        T = ""
                                    }
                                    if (xa) break;
                                    if (bb) {
                                        Uc(g);
                                        break
                                    }
                                }
                            0 < h[e].frame && (xa || h[e].frame++)
                        }
                        if (Sa) break;
                        "" != h[e].action && d && (Wa = a, xb(e), v = e, H = h[e].idMsg, c = f, hd(), H = v = c = null, ca && hc(e, g.id, ""));
                        h[e].charCanvas && !M && Kc(e)
                    }
                }
            0 < S.length && "speak" == S[0].type && !sa && !Da && !Sa && b && dd();
            Fa = Math.max(Fa, a);
            Ab = !1;
            jc && (jc = !1, G());
            bb && (bb = !1, lb())
        }
    }

    function Uc(a) {
        if (!f["Seen" + a.id] && f.Presenting) {
            var d;
            "message" == a.type && (f["Seen" + a.id] = !0, d = a);
            for (; a;) "dialog" == a.type && (f["Seen" + a.id] = !0, d = a), "slide" == a.type && (f["Seen" + a.id] = !0), a = a.parent;
            Vc = d ? d.name : "";
            wa()
        }
    }

    function Wc(a) {
        if ((a = p[a]) && !a.disabled) {
            a.toggleschosen ? (a.chosen = !a.chosen, P(a.id), a.variable && (f[a.variable] = a.chosen ? 1 : 0, wa())) : a.variable && a.value && (f[a.variable] = a.value, wa());
            a.stayschosen && (a.chosen = !0, P(a.id));
            if (a.resetspeers)
                for (var d in a.parent.items) {
                    var b = a.parent.items[d];
                    "button" == b.type && b != a && (b.chosen = !1, P(b.id))
                }
            if (a.scorecorrect || a.scoreincorrect) Oa("slide", a).score = a.scorecorrect ? 1 : 0;
            d = !1;
            if (b = a.onclick) {
                c =
                    f;
                bsthis = a;
                var e = f.Focus,
                    g = f.Presenting;
                try {
                    eval(b)
                } catch (z) {
                    if (2 == Q) debugger
                }
                if (e != f.Focus || g != f.Presenting) d = !0;
                bsthis = c = null
            }
            d ? qa = ec("autostartonnavigation") : ia = ec("autostartoninteraction");
            for (ab = ba = 0;
                "grid" == a.parent.type;) a = a.parent;
            Xc = a ? a.name : "";
            f["Touched" + a.id] = !0;
            wa()
        }
    }

    function Yc(a) {
        for (var d in a.items) {
            var b = a.items[d];
            "button" == b.type ? "enter" == b.key && Wc(b.id) : "slideshow" != b.type && "slide" != b.type && "grid" != b.type || Yc(b)
        }
    }

    function wa() {
        na(n);
        "function" == typeof onVariableChange && onVariableChange(g)
    }

    function na(a) {
        for (id in a.items)
            if (obj = a.items[id], "text" == obj.type && obj.expression) {
                bsthis = obj;
                var d = window.c ? c : void 0;
                c = f;
                try {
                    var b = eval(obj.expression)
                } catch (l) {
                    if (b = void 0, 2 == Q) debugger
                }
                c = d;
                bsthis = null;
                V(obj.id).innerHTML = b
            } else if ("editcontrol" == obj.type && obj.variable) d = document.getElementById(g + id + "Edit"), d.value != f[obj.variable] && (d.value = f[obj.variable]);
        else if ("button" == obj.type && obj.stayschosen && obj.variable && obj.value) obj.chosen = f[obj.variable] == obj.value, P(id);
        else if ("button" == obj.type &&
            obj.toggleschosen && obj.variable) obj.chosen = 1 == f[obj.variable], P(id);
        else if ("component" == obj.type)
            for (var e in J) {
                if (e == obj["class"]) J[e].onVariableChange(f, obj)
            } else obj.hasOwnProperty("items") && na(obj)
    }

    function Ub() {
        r("Firing onQueueLengthChange(" + g + "," + S.length + ")");
        "function" == typeof onQueueLengthChange && onQueueLengthChange(g, S.length)
    }

    function Gb(a, d) {
        var b = document.createElement(a || "div"),
            e;
        for (e in d) b[e] = d[e];
        return b
    }

    function Hb(a) {
        for (var d = 1, b = arguments.length; d < b; d++) a.appendChild(arguments[d]);
        return a
    }

    function kd(a, d, b, e) {
        var f = ["opacity", d, ~~(100 * a), b, e].join("-");
        b = .01 + b / e * 100;
        e = Math.max(1 - (1 - a) / d * (100 - b), a);
        var g = Ib.substring(0, Ib.indexOf("Animation")).toLowerCase();
        Zc[f] || (ld.insertRule("@" + (g && "-" + g + "-" || "") + "keyframes " + f + "{0%{opacity:" + e + "}" + b + "%{opacity:" + a + "}" + (b + .01) + "%{opacity:1}" + (b + d) % 100 + "%{opacity:" + a + "}100%{opacity:" + e + "}}", 0), Zc[f] = 1);
        return f
    }

    function cb(a, d) {
        for (var b in d) {
            var e = a.style,
                f;
            a: {
                var g, h = b,
                    k = a.style;
                if (void 0 !== k[h]) f = h;
                else {
                    h = h.charAt(0).toUpperCase() +
                        h.slice(1);
                    for (f = 0; f < $c.length; f++)
                        if (g = $c[f] + h, void 0 !== k[g]) {
                            f = g;
                            break a
                        }
                    f = void 0
                }
            }
            e[f || b] = d[b]
        }
        return a
    }

    function ad(a) {
        for (var d = 1; d < arguments.length; d++) {
            var b = arguments[d],
                e;
            for (e in b) void 0 === a[e] && (a[e] = b[e])
        }
        return a
    }

    function bd(a) {
        for (var d = {
                x: a.offsetLeft,
                y: a.offsetTop
            }; a = a.offsetParent;) d.x += a.offsetLeft, d.y += a.offsetTop;
        return d
    }
    var f = this;
    this.bsthis = this.c = null;
    this.idDiv = g;
    this.base = k;
    this.widthEmbed = B;
    this.heightEmbed = E;
    var n = void 0,
        p = null;
    this.Presenting = !1;
    this.Text = this.Focus =
        "";
    this.Muted = this.Paused = !1;
    var Q = 2,
        da = !1,
        uc = !1,
        vc = "complete" === document.readyState,
        ib = !1,
        y = null,
        Ia = null,
        w = null,
        oa = null,
        L = null,
        Xa = null,
        Ha = null,
        I = null,
        Ya = null,
        ha = null,
        Sa = !0,
        bb = !1,
        jc = !1,
        Y = null,
        ra = null,
        M = null,
        Ba = null,
        za = !1,
        dc = !1,
        db = 0,
        J = {},
        K = 0,
        A = {},
        ta = [],
        h = {},
        la = [],
        v, H, T = "",
        Yb = 0,
        vb = 0,
        ca, Ka, Ja, Db, Eb, Fa = -1,
        Ua = 0,
        Va = 0,
        aa = 0,
        Wa = 0,
        xa = !1,
        Ca = null,
        qb = null,
        Ea = null,
        sb = null,
        S = [],
        sa = !1,
        Da = !1,
        Xb = null,
        Ta = null,
        rc = !1,
        Ob = null,
        ob = null,
        kb = (new Date).getTime(),
        cd = 0,
        ga = [],
        yb = !1,
        ja = 1,
        oc = 0,
        pc = 0,
        ya = [],
        mc = 0,
        nc = 0,
        $a, Tc, Jb, ba = 0,
        ia = 0,
        qa = 0,
        va = 0,
        Fb = !1,
        ab = 0,
        Vc, Xc, Ma = navigator.userAgent.match(/iPhone/i),
        hb = navigator.userAgent.match(/iPad/i),
        ea = navigator.userAgent.match(/android/i);
    navigator.userAgent.match(/AppleWebKit/i);
    var fa;
    this.realizeTopLevel = function(a) {
        a && document.write('<div id="' + g + '" style="top:0px; left:0px; width:' + B + "px; height:" + E + 'px"></div>');
        a = document.getElementById(g);
        s = "";
        s += '<div id="' + g + 'Stage" style="position:relative" width="' + B + '" height="' + E + '" onkeydown="msEvent(' + ("'" + g + "','" + g + "Stage','keydown'") +
            ')">';
        s += "&nbsp;";
        s += "</div>";
        a.innerHTML = s;
        if (!DetectHTML5()) return a;
        Lb = (new Kb({
            lines: 11,
            length: 7,
            width: 4,
            radius: 10,
            rotate: 0,
            color: "#eeeeee",
            speed: 1,
            trail: 60,
            shadow: !1,
            hwaccel: !1,
            className: "spinner",
            zIndex: 1,
            top: E / 2 - 17,
            left: B / 2 - 17
        })).spin(a);
        var d = document.createElement("script");
        a.appendChild(d);
        var b = R(m + ".js");
        "true" == f.Preview && (b += "?Preview=true");
        d.src = b;
        return a
    };
    var Lb = null,
        fb = !0;
    this.aDocLoaded = function() {
        if (void 0 == n && (n = window[m + "_Dir"], void 0 != n))
            if ("true" == n.exceeded || "true" == n.trial &&
                n.hostingresources && "" != n.hostingresources) document.getElementById(g + "Stage").innerHTML = '<div style="position:absolute; left:' + (B - 112) / 2 + "px; top:" + (E - 112) / 2 + 'px; width:112px; height:87px;"/><a href="http://www.mediasemantics.com"><img src="http://www.characterhosting.com/images/MSLogo.gif" border="0"></a></div>', N();
            else {
                p = {};
                n.type = "project";
                n.parent = null;
                xc(n, "");
                parseInt(n.version.split(".")[3]) & 1 && (rc = !0);
                for (var a = n.modules ? n.modules.split(",") : [], d = db = 0; d < a.length; d++) {
                    var b = a[d];
                    if (window["MSModule_" +
                            b]) J[b] = window["MSModule_" + b];
                    else {
                        J[b] = {
                            loading: !0
                        };
                        var e = document.createElement("script");
                        document.getElementById(g).appendChild(e);
                        b = R("MSHTML5_" + b + ".min.js");
                        db++;
                        e.src = b
                    }
                }
                0 == db && eb()
            }
    };
    (function() {
        for (var a = 0, d = ["ms", "moz", "webkit", "o"], b = 0; b < d.length && !window.requestAnimationFrame; ++b) window.requestAnimationFrame = window[d[b] + "RequestAnimationFrame"], window.cancelAnimationFrame = window[d[b] + "CancelAnimationFrame"] || window[d[b] + "CancelRequestAnimationFrame"];
        window.requestAnimationFrame || (window.requestAnimationFrame =
            function(b, d) {
                var e = (new Date).getTime(),
                    f = Math.max(0, 16 - (e - a)),
                    g = window.setTimeout(function() {
                        b(e + f)
                    }, f);
                a = e + f;
                return g
            });
        window.cancelAnimationFrame || (window.cancelAnimationFrame = function(a) {
            clearTimeout(a)
        })
    })();
    this.getDirObjectFromId = function(a) {
        return p[a]
    };
    this.debugTrace = function(a) {
        if (1 < Q) try {
            console.log(g + ": " + ((new Date).getTime() - kb) / 1E3 + "s: " + a)
        } catch (d) {}
    };
    this.frameTrace = function(a) {
        if (2 < Q) try {
            console.log(g + ": " + ((new Date).getTime() - kb) / 1E3 + "s: " + a)
        } catch (d) {}
    };
    this.checkAllComplete =
        lb;
    this.idleToIdle = mb;
    this.aModuleLoaded = function() {
        for (var a in J)
            if (J[a].loading) {
                var d = window["MSModule_" + a];
                d && (J[a] = d, db--)
            }
        0 == db && eb()
    };
    this.aExternalLoaded = function(a) {
        sa && !Da ? (externalData = a, Da = !0, sa = !1) : Dc(a)
    };
    this.someDataLoaded = function() {
        if (Ba && window["MSData_" + n.project + Ba]) {
            var a = Ba;
            Ba = null;
            var d = p[a];
            d.onframe = window["MSData_" + n.project + a];
            pb(d.character, a)
        }
    };
    this.aVectorLoaded = function() {
        for (var a in A) {
            var d = A[a];
            ma(d) && null == d.data && (d.data = window["MS" + d.digest], d.data && K--)
        }
        Y &&
            0 == K ? ac() : ra && 0 == K ? bc() : M && 0 == K && rb()
    };
    this.onAudioLoadCompleteExt = function() {
        for (charid in h)
            if (h[idChar].loadingAudio) {
                cc(idChar);
                break
            }
    };
    this.startPresenting = function() {
        r("startPresenting");
        f.Presenting || (p[f.Focus] ? (f.Presenting = !0, Fb = f.Paused = !1, G()) : O("startPresenting() - no valid messages available"))
    };
    this.restartPresenting = function() {
        r("restartPresenting");
        p[f.Focus] ? (f.Presenting = !0, Fb = f.Paused = !1, G()) : O("restartPresenting() - no valid messages available")
    };
    this.stopPresenting = function() {
        r("stopPresenting");
        f.Presenting && (f.Presenting = !1, f.Paused = !1, Fb = !0, G())
    };
    this.pausePresenting = function() {
        r("pausePresenting");
        if (!f.Paused) {
            cd = (new Date).getTime() - Va + Ua;
            for (idChar in h)
                if (h[idChar].idScene == y) {
                    var a = document.getElementById(g + idChar + "Audio");
                    a && tb(a)
                }
            f.Paused = !0;
            Z(n)
        }
    };
    this.getURL = function(a, d) {
        d ? window.open(a, d) : window.location = a
    };
    this.resumePresenting = function() {
        r("resumePresenting");
        if (f.Paused) {
            for (idChar in h)
                if (h[idChar].idScene == y) {
                    var a = document.getElementById(g + idChar + "Audio");
                    a && Gc(a)
                }
            f.Paused = !1;
            Z(n);
            Ua = cd;
            aa = Va = (new Date).getTime();
            Wa = 0
        }
    };
    this.msgoto = function(a) {
        pa(a, "")
    };
    this.gotoAndStart = function(a) {
        pa(a, "AndStart")
    };
    this.gotoAndStop = function(a) {
        pa(a, "AndStop")
    };
    this.gotoAndRestart = function(a) {
        pa(a, "AndRestart")
    };
    this.externalCommand = function(a, d) {
        r("Firing onExternalCommand(" + a + "," + d + ")");
        "function" == typeof onExternalCommand && onExternalCommand(g, a, d);
        f.vh && f.vh.cp.variablesManager.setVariableValue(a, d)
    };
    this.bubble = function(a, d) {
        r("bubble " + a + " " + d);
        var b;
        a: {
            if (b = Oa("scene", p[a]))
                for (var e in b.items) {
                    var g =
                        b.items[e];
                    if ("bubble" == g.type && (!g.target || g.target == a)) {
                        b = g;
                        break a
                    }
                }
            b = null
        }
        b && J.bubble.updateBubble(f, b, d)
    };
    this.nextFocus = function() {
        return kc("")
    };
    this.nextFocusAndStart = function() {
        return kc("andStart")
    };
    this.nextFocusAndStop = function() {
        return kc("andStop")
    };
    this.previousFocus = function() {
        return lc("")
    };
    this.previousFocusAndStart = function() {
        return lc("andStart")
    };
    this.previousFocusAndStop = function() {
        return lc("andStop")
    };
    this.firstFocus = function() {
        return firstFocusHelper("")
    };
    this.firstFocusAndStart =
        function() {
            return firstFocusHelper("andStart")
        };
    this.firstFocusAndStop = function() {
        return firstFocusHelper("andStop")
    };
    this.firstFocus = function() {
        r("firstFocus" + s);
        var a = yc();
        a && (f.Focus = a, "andStart" == s ? f.Presenting = !0 : "andStop" == s && (f.Presenting = !1), G());
        f.Paused = !1
    };
    this.mute = function() {
        r("mute");
        f.Muted = !0;
        Z(n);
        Oc()
    };
    this.unmute = function() {
        r("unmute");
        f.Muted = !1;
        Z(n);
        Oc()
    };
    this.trace = function(a) {
        console.log(a)
    };
    this.isChosen = function(a) {
        a = C(a);
        return !!p[a].chosen
    };
    this.getText = function(a) {
        return (a =
            document.getElementById(g + a + "Edit")) ? a.value : ""
    };
    this.setText = function(a, d) {
        var b = document.getElementById(g + a + "Edit");
        b && (b.value = d)
    };
    this.slideIndex = function() {
        return Bb(1)
    };
    this.slideCount = function() {
        return Bb(2)
    };
    this.stepIndex = function() {
        return Bb(3)
    };
    this.stepCount = function() {
        return Bb(4)
    };
    this.daysSinceLastVisit = function() {
        var a = (new Date).getTime(),
            d = parseInt(zc("lastvisit"));
        Ac("lastvisit", a.toString(), 365);
        return ret = d ? Math.floor((a - d) / 864E5) : a + 31536E6
    };
    this.android = function() {
        return ea
    };
    this.iOS = function() {
        return Ma || hb
    };
    this.firstFAQ = function() {
        return Cb(1)
    };
    this.nextFAQ = function() {
        return Cb(2)
    };
    this.previousFAQ = function() {
        return Cb(3)
    };
    this.targetFAQ = function() {
        return Cb(4)
    };
    this.getTotalQuestions = function() {
        return Za(1)
    };
    this.getTotalCompleted = function() {
        return Za(2)
    };
    this.getTotalScore = function() {
        return Za(3)
    };
    this.getPercentCompleted = function() {
        return Za(4)
    };
    this.getPercentCorrect = function() {
        return Za(5)
    };
    this.show = function(a) {
        return Pc(a, !0)
    };
    this.hide = function(a) {
        return Pc(a, !1)
    };
    this.fadein = function(a) {
        a = C(a);
        (a = V(a)) && Lc(a, 500)
    };
    this.fadeout = function(a) {
        a = C(a);
        if (a = V(a)) fade = {
            from: a,
            to: null,
            cms: 500,
            tStart: (new Date).getTime()
        }, ga.push(fade), yb || zb()
    };
    this.setPosition = function(a, d, b) {
        d = Math.round(d);
        b = Math.round(b);
        a = C(a);
        var e = p[a];
        e && (e.left = d, e.top = b);
        if (a = V(a)) a.style.left = d + "px", a.style.top = b + "px"
    };
    this.setSize = function(a, d, b) {
        d = Math.round(d);
        b = Math.round(b);
        a = C(a);
        var e = p[a];
        e && (e.width = d, e.height = b);
        var f = V(a);
        f && e && ("character" == e.type ? (d = h[e.id].idMsg, b = wc(e.id,
            e), f.outerHTML = b, h[e.id].idMsg = d) : "image" == e.type ? (f.style.width = d + "px", f.style.height = b + "px", f.style.backgroundSize = d + "px " + b + "px") : "bubble" == e.type ? (b = J[e.type].render(e.id, e.type, e), f.outerHTML = b) : "movie" == e.type ? (f.style.width = d + "px", f.style.height = b + "px", e = W(a), e.width = d, e.height = b) : (f.style.width = d + "px", f.style.height = b + "px"))
    };
    this.enable = function(a) {
        Qc(a, !1)
    };
    this.disable = function(a) {
        Qc(a, !0)
    };
    this.setChosen = function(a) {
        a = C(a);
        p[a].chosen = !0;
        P(a)
    };
    this.clearChosen = function(a) {
        a = C(a);
        p[a].chosen = !1;
        P(a)
    };
    this.getX = function(a) {
        return (a = V(C(a))) ? parseInt(a.style.left.replace("px", "")) : 0
    };
    this.getY = function(a) {
        return (a = V(C(a))) ? parseInt(a.style.top.replace("px", "")) : 0
    };
    this.getWidth = function(a) {
        return (a = V(C(a))) ? parseInt(a.style.width.replace("px", "")) : 0
    };
    this.getHeight = function(a) {
        return (a = V(C(a))) ? parseInt(a.style.height.replace("px", "")) : 0
    };
    this.stageWidth = function() {
        return B
    };
    this.stageHeight = function() {
        return E
    };
    this.max = function(a, d) {
        return a >= d ? a : d
    };
    this.min = function(a, d) {
        return a >= d ?
            d : a
    };
    this.round = function(a) {
        return Math.round(a)
    };
    this.seen = function(a) {
        "string" != typeof a && (a = a.id);
        a = C(a);
        return !!f["Seen" + a]
    };
    this.touched = function(a) {
        "string" != typeof a && (a = a.id);
        a = C(a);
        return !!f["Touched" + a]
    };
    this.lastTouched = function() {
        return Xc
    };
    this.lastSeen = function() {
        return Vc
    };
    this.inactive = function() {
        return 1 == va
    };
    this.interacted = function() {
        return 2 == va
    };
    this.navigated = function() {
        return 3 == va
    };
    this.inactiveCount = function() {
        return ab
    };
    this.moviePlay = function(a) {
        (a = W(a)) && a.play()
    };
    this.moviePlayUntilEnd =
        function(a) {
            var d = W(a);
            d && this.moviePlayUntil(a, d.duration)
        };
    this.moviePlayUntil = function(a, d) {
        var b = W(a);
        b && b.currentTime < d && ($a = a, Tc = d, b.play())
    };
    this.movieStop = function(a) {
        (a = W(a)) && a.pause()
    };
    this.movieGotoAndStop = function(a, d) {
        var b = W(a);
        b && (b.pause(), 4 == b.readyState ? b.currentTime = d : Jb = d)
    };
    this.movieReached = function(a, d) {
        var b = W(a);
        return b ? b.currentTime >= d : !1
    };
    this.movieReachedEnd = function(a) {
        return (a = W(a)) ? a.currentTime >= a.duration : !1
    };
    this.setFocus = function(a) {
        a = C(a);
        (a = document.getElementById(g +
            a + "Edit")) && a.focus();
        fa = a
    };
    this.random = function() {
        ya.push(Math.random() * ya.pop())
    };
    this.push = function(a) {
        ya.push(a)
    };
    this.lessthan = function() {
        var a = ya.pop(),
            d = ya.pop();
        ya.push(d < a)
    };
    this.ifnot = function(a) {
        ya.pop() || (h[v].frame = a, xa = !0)
    };
    this.branch = function(a) {
        h[v].frame = a;
        xa = !0
    };
    this.button = function(a) {
        J.buttonset && J.buttonset.button(f, Ec(v), a)
    };
    this.load = function(a, d, b, e, f, h) {
        0 != vb && h > vb || (a = H + T + a, b = sb ? ed(sb, d) : R(d), "js" == d.substr(d.length - 2) ? (A[a] = {}, A[a].msvector = !0, A[a].digest = d.substr(0, d.length -
            3), window["MS" + A[a].digest] ? A[a].data = window["MS" + A[a].digest] : (A[a].data = null, a = document.createElement("script"), document.getElementById(g).appendChild(a), K++, a.src = b)) : (d = Bc(b), A[a] = fd(d), A[a].src != d && (A[a].onload = function() {
            $b()
        }, A[a].setAttribute("data-cyframe", f), K++, A[a].src = b)))
    };
    this.update = this.add = function(a, d, b, e) {
        var f = 0,
            k = 0,
            m = 1,
            q = [],
            n = [],
            u = h[v].aImg[H + T + a];
        if (null != u) {
            h[v].lastCmdAddId = a;
            Rc(v, H + T + a);
            if (2 == arguments.length) m = d, f = ma(u) ? u.x : parseInt(u.getAttribute("data-x")), k = ma(u) ? u.y :
                parseInt(u.getAttribute("data-y")), q = ma(u) && u.arot ? u.arot : [];
            else if (4 == arguments.length) f = d, k = b, m = e, q = ma(u) && u.arot ? u.arot : [];
            else if (4 < arguments.length)
                if (f = d, k = b, m = e, 0 == (arguments.length - 4) % 4)
                    for (var r = 4; arguments.length > r;) n.push([arguments[r], arguments[r + 1], arguments[r + 2], arguments[r + 3]]), r += 4;
                else if (0 == (arguments.length - 4) % 3)
                for (r = 4; arguments.length > r;) q.push([arguments[r], arguments[r + 1], arguments[r + 2]]), r += 3;
            "infront" == p[v].mode && (ca = !0);
            var w;
            ca || (w = parseInt(u.getAttribute("data-cyframe")),
                f >= Ka && f <= Ka + Db && f + u.width >= Ka && f + u.width <= Ka + Db && k >= Ja && k <= Ja + Eb && k + w >= Ja && k + w <= Ja + Eb || (ca = !0));
            if (!ca) {
                var y = h[v].charCanvas ? h[v].charCanvas : document.getElementById(g + v + "Canvas");
                if (y.getContext) {
                    var A = y.getContext("2d");
                    A.clearRect(f - h[v].cxCharLeft, k - h[v].cyCharTop, u.width, w);
                    ea && La(y);
                    A.drawImage(u, 0, (m - 1) * w, u.width, w, f - h[v].cxCharLeft, k - h[v].cyCharTop, u.width, w);
                    for (r = 0; r < n.length; r++) A.clearRect(n[r][0] - h[v].cxCharLeft, n[r][1] - h[v].cyCharTop, n[r][2], n[r][3]);
                    ea && La(y)
                } else O("No canvas support.");
                Ka = f;
                Ja = k;
                Db = u.width;
                Eb = w
            }
            if (ma(u)) u.x = f, u.y = k, u.n = m, u.arot = q, u.morph = null;
            else
                for (u.setAttribute("data-x", f), u.setAttribute("data-y", k), u.setAttribute("data-n", m), r = 0; 3 > r; r++) f = "", r < n.length && (f = n[r][0] + "," + n[r][1] + "," + n[r][2] + "," + n[r][3]), u.setAttribute("data-exclude" + (r + 1), f)
        }
    };
    this.bug_workaround = La;
    this.updatetween = this.addtween = function(a, d, b, e, f) {
        var g = 0,
            k = 0,
            l = 0,
            m = [],
            n = h[v].aImg[H + T + a],
            p = h[v].aImg[H + T + d];
        if (n && p) {
            Rc(v, H + T + a);
            if (3 == arguments.length) l = b, g = n.x, k = n.y;
            else if (5 <= arguments.length)
                for (g =
                    b, k = e, l = f, p = 5; arguments.length > p;) m.push([arguments[p], arguments[p + 1], arguments[p + 2]]), p += 3;
            n.x = g;
            n.y = k;
            n.n = l;
            n.arot = m;
            n.morph = d;
            ca = !0
        }
    };
    this.rem = function(a) {
        var d = h[v].aImg[H + T + a];
        d && (d.arot = [], d.morph = null);
        a: {
            a = H + T + a;
            for (var d = h[v].aImgShow, b = 0; b < d.length; b++)
                if (d[b] == a) {
                    d.splice(b, 1);
                    break a
                }
        }
        ca = !0
    };
    this.stop = function() {
        var a = !1;
        p[H].idle && null == h[v].idMsgNext && (a = !0);
        if (a) p[H].customidle ? G() : (h[v].frame = 1, xa = !0);
        else if (a = h[v], !a.fStopReached) {
            a.fRecovering = !1;
            a.fFirstFrameAfterRec = !1;
            a.fStopReached = !0;
            a.frame = 0;
            var d = document.getElementById(g + v + "Audio");
            tb(d);
            a.action || (bb = a.complete = !0)
        }
    };
    this.controllerStopped = function() {
        bb = !0
    };
    this.rec = function(a) {
        h[v].idMsgNext && !mb() && (h[v].frame = a, xa = !0, h[v].fRecovering = !0, h[v].fFirstFrameAfterRec = !0)
    };
    this.addctl = function(a, d, b, e) {
        var g = J.rasterctl;
        g && g.addctl(f, h[v], v, H, a, d, b, e)
    };
    this.addtweenctl = function() {};
    this.ctlaction = function(a) {
        var d = J.rasterctl;
        d && d.ctlaction(f, h[v], v, H, a, mc, nc)
    };
    this.onPageLoad = function() {
        vc = !0;
        uc && !ib && (ib = !0, ka())
    };
    this.onMouseMove =
        function(a) {
            a = a || window.event;
            var d = document.getElementById(g).getBoundingClientRect();
            mc = a.clientX + pc - d.left;
            nc = a.clientY + oc - d.top
        };
    this.onScroll = function() {
        oc = document.body.scrollTop;
        pc = document.body.scrollLeft
    };
    var Ab = !1;
    this.msEvent = function(a, d, b) {
        switch (d) {
            case "audioonloadstart":
                break;
            case "audioonprogress":
                break;
            case "audiooncanplaythrough":
                h[a].loadingAudio && cc(a);
                break;
            case "audioonerror":
                d = document.getElementById(g + a + "Audio");
                h[a].loadingAudio && (O("Embedded character unable to play audio - will still move lips" +
                    ("object" == typeof d.error ? " - code " + d.error.code : "")), cc(a));
                break;
            case "audioonstalled":
                break;
            case "audioonloadedmetadata":
                break;
            case "audioonplaying":
                break;
            case "audioonended":
                break;
            case "audioontimeupdate":
                d = document.getElementById(g + a + "Audio");
                !d.paused && 0 < d.currentTime && !h[a].fRecovering && (Ua = Math.floor(1E3 * d.currentTime), Va = (new Date).getTime());
                break;
            case "videoonloadedmetadata":
                Jb && (W(id).currentTime = Jb, Jb = void 0);
                break;
            case "onload":
                onload(a);
                break;
            case "buttonclick":
                Wc(a);
                break;
            case "mouseover":
                p[a].over = !0;
                P(a);
                break;
            case "mouseout":
                p[a].over = !1;
                P(a);
                break;
            case "mousedown":
                p[a].down = !0;
                P(a);
                break;
            case "mouseup":
                p[a].down = !1;
                P(a);
                break;
            case "editchange":
                d = p[a];
                d.variable && (a = document.getElementById(g + a + "Edit")) && f[d.variable] != a.value && (f[d.variable] = a.value, wa());
                na(n);
                break;
            case "editfocus":
                Ma && window.scrollTo(pc, oc);
                break;
            case "keydown":
                13 == event.keyCode && Yc(p[y]);
                break;
            case "shieldclick":
                r("user clicked StartShield");
                document.getElementById(g + "StartShield").style.display = "none";
                da = !1;
                f.startPresenting();
                Qa();
                break;
            default:
                var e = !1;
                if (a = p[a])
                    for (var k in J)
                        if (J[k].event(f, d, a, b)) {
                            e = !0;
                            break
                        }
                e || O("unhandled event " + d)
        }
    };
    this.msSetTraceLevel = function(a) {
        Q = a
    };
    this.msGoto = function(a) {
        r("msGoto('" + a + "')");
        pa(a, "")
    };
    this.msGotoAndStart = function(a) {
        r("msGotoAndStart('" + a + "')");
        pa(a, "AndStart")
    };
    this.msGotoAndStop = function(a) {
        r("msGotoAndStop('" + a + "')");
        pa(a, "AndStop")
    };
    this.msPlay = function(a) {
        r("msPlay('" + a + "')");
        pa(a, "AndStart")
    };
    this.msPlayQueued = function(a) {
        r("msPlayQueued('" + a + "')");
        f.Presenting || f.Restart ?
            (S.push({
                type: "play",
                data: a
            }), Ub()) : (f.Focus = C(a), f.Presenting = !0, p[f.Focus] ? G() : O("msPlayQueued() - no message " + a))
    };
    this.msSpeak = function(a) {
        r("msSpeak('" + a + "')");
        S = [];
        f.Presenting = !0;
        f.Focus = C("Speak");
        f.Text = a;
        p[f.Focus] ? G() : O("msSpeak() - no external message named Speak")
    };
    this.msSpeakQueued = function(a) {
        r("msSpeakQueued('" + a + "')");
        f.Presenting || f.Restart ? (S.push({
            type: "speak",
            data: a
        }), Ub()) : (f.Text = a, f.Focus = C("Speak"), f.Presenting = !0, p[f.Focus] ? G() : O("msSpeakQueued() - no message named Speak"))
    };
    this.msRespond = function(a) {
        r("msRespond('" + a + "')");
        S = [];
        f.Presenting = !0;
        f.Focus = C("Respond");
        f.Text = a;
        p[f.Focus] ? G() : O("msRespond() - no external message named Respond")
    };
    this.msStart = function() {
        r("msStart()");
        S = [];
        this.startPresenting()
    };
    this.msStop = function() {
        r("msStop()");
        S = [];
        this.stopPresenting()
    };
    this.msNextFocusAndStop = function() {
        r("msNextFocusAndStop()");
        this.nextFocusAndStop()
    };
    this.msPreviousFocusAndStop = function() {
        r("msPreviousFocusAndStop()");
        this.previousFocusAndStop()
    };
    this.msGetVariable =
        function(a) {
            return this[a]
        };
    this.msSetVariable = function(a, d) {
        this[a] = d
    };
    this.vc = function() {
        wa()
    };
    this.msGetVariables = function() {
        var a = {};
        for (key in this) key.substr(0, 1).toUpperCase() == key.substr(0, 1) && "Presenting" != key && "Focus" != key && "Paused" != key && "Muted" != key && (a[key] = this[key]);
        return a
    };
    this.msSetVariables = function(a) {
        for (key in a) this[key] = a[key]
    };
    this.msGetMessages = function() {
        var a = [];
        for (key in p) "message" == p[key].type && a.push(p[key].name);
        return a
    };
    this.msStartShieldUp = function() {
        return da
    };
    this.onLoad = function() {
        this.captivate && (f.vh = this.captivate.CPMovieHandle.getMovieProps().variablesHandle)
    };
    var $c = ["webkit", "Moz", "ms", "O"],
        Zc = {},
        Ib, ld = function() {
            var a = Gb("style");
            Hb(document.getElementsByTagName("head")[0], a);
            return a.sheet || a.styleSheet
        }(),
        md = {
            lines: 12,
            length: 7,
            width: 5,
            radius: 10,
            rotate: 0,
            color: "#000",
            speed: 1,
            trail: 100,
            opacity: .25,
            fps: 20,
            zIndex: 2E9,
            className: "spinner",
            top: "auto",
            left: "auto"
        },
        Kb = function d(b) {
            if (!this.spin) return new d(b);
            this.opts = ad(b || {}, d.defaults, md)
        };
    Kb.defaults = {};
    ad(Kb.prototype, {
        spin: function(d) {
            this.stop();
            var b = this,
                e = b.opts,
                f = b.el = cb(Gb(0, {
                    className: e.className
                }), {
                    position: "relative",
                    zIndex: e.zIndex
                }),
                g = e.radius + e.length + e.width,
                h, k;
            d && (d.appendChild(f), k = bd(d), h = bd(f), cb(f, {
                left: ("auto" == e.left ? k.x - h.x + (d.offsetWidth >> 1) : e.left + g) + "px",
                top: ("auto" == e.top ? k.y - h.y + (d.offsetHeight >> 1) : e.top + g) + "px"
            }));
            f.setAttribute("aria-role", "progressbar");
            b.lines(f, b.opts);
            if (!Ib) {
                var m = 0,
                    n = e.fps,
                    p = n / e.speed,
                    r = (1 - e.opacity) / (p * e.trail / 100),
                    v = p / e.lines;
                ! function gd() {
                    m++;
                    for (var d = e.lines; d; d--) b.opacity(f, e.lines - d, Math.max(1 - (m + d * v) % p * r, e.opacity), e);
                    b.timeout = b.el && setTimeout(gd, ~~(1E3 / n))
                }()
            }
            return b
        },
        stop: function() {
            var d = this.el;
            d && (clearTimeout(this.timeout), d.parentNode && d.parentNode.removeChild(d), this.el = void 0);
            return this
        },
        lines: function(d, b) {
            function e(d, e) {
                return cb(Gb(), {
                    position: "absolute",
                    width: b.length + b.width + "px",
                    height: b.width + "px",
                    background: d,
                    boxShadow: e,
                    transformOrigin: "left",
                    transform: "rotate(" + ~~(360 / b.lines * f + b.rotate) + "deg) translate(" +
                        b.radius + "px,0)",
                    borderRadius: (b.width >> 1) + "px"
                })
            }
            for (var f = 0, g; f < b.lines; f++) g = cb(Gb(), {
                position: "absolute",
                top: 1 + ~(b.width / 2) + "px",
                transform: b.hwaccel ? "translate3d(0,0,0)" : "",
                opacity: b.opacity,
                animation: Ib && kd(b.opacity, b.trail, f, b.lines) + " " + 1 / b.speed + "s linear infinite"
            }), b.shadow && Hb(g, cb(e("#000", "0 0 4px #000"), {
                top: "2px"
            })), Hb(d, Hb(g, e(b.color, "0 0 1px rgba(0,0,0,.1)")));
            return d
        },
        opacity: function(d, b, e) {
            b < d.childNodes.length && (d.childNodes[b].style.opacity = e)
        }
    });
    window.Spinner = Kb
}

function DetectHTML5() {
    var g = document.createElement("audio") || !1,
        g = g && "undefined" !== typeof g.canPlayType,
        m = document.createElement("canvas"),
        m = !(!m.getContext || !m.getContext("2d"));
    return g && m
}

function msGetFlash(g) {
    return -1 != navigator.appName.indexOf("Microsoft") ? window[g] : document[g]
}

function msIsFlash(g) {
    return "[object HTMLEmbedElement]" == g.toString() || "[object HTMLObjectElement]" == g.toString()
}

function msIsHTML5(g) {
    return "[object HTMLDivElement]" == g.toString() && g.hasOwnProperty("ctl")
}

function msDocLoaded() {
    for (var g = 0; g < msEmbeddings.length; g++) msEmbeddings[g].aDocLoaded()
}

function msDataLoaded() {
    for (var g = 0; g < msEmbeddings.length; g++) msEmbeddings[g].someDataLoaded()
}

function msVectorLoaded() {
    for (var g = 0; g < msEmbeddings.length; g++) msEmbeddings[g].aVectorLoaded()
}

function msModuleLoaded() {
    for (var g = 0; g < msEmbeddings.length; g++) msEmbeddings[g].aModuleLoaded()
}

function msExternalLoaded(g) {
    for (var m = 0; m < msEmbeddings.length; m++) msEmbeddings[m].aExternalLoaded(g)
}

function msEvent(g, m, k, B) {
    document.getElementById(g).ctl.msEvent(m, k, B)
}

function msPlay(g, m) {
    var k = document.getElementById(g);
    null == k && (k = msGetFlash(g));
    msIsFlash(k) ? k.msPlay(m) : msIsHTML5(k) && k.ctl.msPlay(m)
}

function msPlayQueued(g, m) {
    var k = document.getElementById(g);
    null == k && (k = msGetFlash(g));
    msIsFlash(k) ? k.msPlayQueued(m) : msIsHTML5(k) && k.ctl.msPlayQueued(m)
}

function msSpeak(g, m) {
    var k = document.getElementById(g);
    null == k && (k = msGetFlash(g));
    msIsFlash(k) ? k.msSpeak(m) : msIsHTML5(k) && k.ctl.msSpeak(m)
}

function msSpeakQueued(g, m) {
    var k = document.getElementById(g);
    null == k && (k = msGetFlash(g));
    msIsFlash(k) ? msGetFlash(g).msSpeakQueued(m) : msIsHTML5(k) && k.ctl.msSpeakQueued(m)
}

function msRespond(g, m) {
    var k = document.getElementById(g);
    null == k && (k = msGetFlash(g));
    msIsFlash(k) ? k.msRespond(m) : msIsHTML5(k) && k.ctl.msRespond(m)
}

function msStart(g) {
    var m = document.getElementById(g);
    null == m && (m = msGetFlash(g));
    msIsFlash(m) ? m.msStart() : msIsHTML5(m) && m.ctl.msStart()
}

function msStop(g) {
    var m = document.getElementById(g);
    null == m && (m = msGetFlash(g));
    msIsFlash(m) ? m.msStop() : msIsHTML5(m) && m.ctl.msStop()
}

function msGetVariable(g, m) {
    var k = document.getElementById(g);
    null == k && (k = msGetFlash(g));
    if (msIsFlash(k)) return k.msGetVariable(m);
    if (msIsHTML5(k)) return k.ctl.msGetVariable(m)
}

function msSetVariable(g, m, k) {
    var B = document.getElementById(g);
    null == B && (B = msGetFlash(g));
    msIsFlash(B) ? B.msSetVariable(m, k) : msIsHTML5(B) && B.ctl.msSetVariable(m, k)
}

function msGetVariables(g) {
    g = document.getElementById(g);
    return msIsHTML5(g) ? g.ctl.msGetVariables() : {}
}

function msSetVariables(g, m) {
    var k = document.getElementById(g);
    msIsHTML5(k) && k.ctl.msSetVariables(m)
}

function msGetMessages(g) {
    g = document.getElementById(g);
    return msIsHTML5(g) ? g.ctl.msGetMessages() : []
}

function msSetTraceLevel(g, m) {
    var k = document.getElementById(g);
    msIsHTML5(k) && k.msSetTraceLevel(m)
}

function msPause(g, m) {
    var k = document.getElementById(g);
    null == k && (k = msGetFlash(g));
    msIsFlash(k) ? k.msPause(m) : msIsHTML5(k) && k.ctl.pausePresenting(m)
}

function msResume(g, m) {
    var k = document.getElementById(g);
    null == k && (k = msGetFlash(g));
    msIsFlash(k) ? k.msResume(m) : msIsHTML5(k) && k.ctl.resumePresenting(m)
}

function msStartShieldUp(g) {
    g = document.getElementById(g);
    return msIsHTML5(g) ? g.ctl.msStartShieldUp() : !1
}

function msAudioLoadComplete(g) {
    g = document.getElementById(g);
    if (msIsHTML5(g)) g.ctl.onAudioLoadCompleteExt()
}

function msGoto(g, m) {
    var k = document.getElementById(g);
    msIsHTML5(k) && k.ctl.msStart(m)
}

function msGotoAndStart(g, m) {
    var k = document.getElementById(g);
    msIsHTML5(k) && k.ctl.msGotoAndStart(m)
}

function msGotoAndStop(g, m) {
    var k = document.getElementById(g);
    msIsHTML5(k) && k.ctl.msGotoAndStop(m)
}

function msNextFocusAndStop(g, m) {
    var k = document.getElementById(g);
    msIsHTML5(k) && k.ctl.msNextFocusAndStop(m)
}

function msPreviousFocusAndStop(g, m) {
    var k = document.getElementById(g);
    msIsHTML5(k) && k.ctl.msPreviousFocusAndStop(m)
};