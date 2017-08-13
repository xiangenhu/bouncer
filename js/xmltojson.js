
//this code is to take an url as input to parse xml in url.
// this is called in the xmltojson.html 
function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}
var value = parseURLParams("http://class.skoonline.org/retrieve?json={%22source%22:%22ScriptOnly%22,%22TagName%22:%22ID%22,%22guid%22:%22451522d2-e6fa-41b5-b9cd-1e43394705db%22,%22authorname%22:%22xiangenhu%22}");
console.log(value);

  