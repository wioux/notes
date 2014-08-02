
function getSearchString() {
    var x = location.search.replace(/^\?/, '');
    var params = x.split('&');
    for (var i=0; i < params.length; ++i)
        if (params[i].match(/=$/) || params[i] == '')
            params.splice(i, 1);
    return '?' + params.join('&');
}

function getQueryParam(name) {
    var q = location.search.replace(/^\?/, '');
    var params = q.split('&');
    for (var k, v, i=0; i < params.length; ++i) {
        k = params[i].split('=', 2)[0];
        v = params[i].split('=', 2)[1];
        if (decodeURIComponent(k) == name)
            return decodeURIComponent(v);
    }
    return null;
}

function putQueryParam(name, value) {
    var q = getSearchString();
    if (value && value != '') {
        if (q.length > 1)
            q += '&';
        q += encodeURIComponent(name)+'='+encodeURIComponent(value);
    }

    history.replaceState(null, null, location.pathname + q);
}

function replaceQueryParam(name, value) {
    if (getQueryParam(name) == null)
        return putQueryParam(name, value);

    var q = getSearchString().substr(1);

    var params = q.split('&');
    for (var k, v, i=0; i < params.length; ++i) {
        k = params[i].split('=', 2)[0];
        v = params[i].split('=', 2)[1];
        if (decodeURIComponent(k) == name) {
            if (!value || value == '')
                params.splice(i, 1);
            else
                params[i] = encodeURIComponent(name)+'='+encodeURIComponent(value);
        }
    }

    history.replaceState(null, null, location.pathname + '?' + params.join('&'));
}
