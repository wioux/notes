$(document).ready(function() {
    (function() {
	var orig = document.createElement;
	document.createElement = function() {
	    if (arguments[0] == 'embed') {
		var span = orig.call(this, 'span');
		span.classList.add('hide-me');
		return span;
	    }
	    return orig.apply(this, arguments);
	};
    })();
});
