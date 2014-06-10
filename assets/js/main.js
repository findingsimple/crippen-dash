
if (!Array.prototype.remove) {
    Array.prototype.remove = function (key) {
       for (var i = 0; i < this.length; ++i) {
           if (this[i] == key) {
               this.splice(i, 1);
               return this;
           }
       }
       return this;
    }
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this === void 0 || this === null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n !== n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}

function defined(obj) {
	return typeof obj !== 'undefined' && obj !== null;
}

function is(obj, type) {
    if (type === 'array') {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    return typeof obj === type;
}

function each(ar, fn) {
	var i = 0, l = ar.length;
	for (; i < l; i++) {
		fn.call(ar[i], i);
	}
	return ar;
}

function attr(el, k, v) {
	var ret, n;
	if (typeof k === 'string') {
		if (defined(v)) {
			el.setAttribute(k, v);
		} else if (el && el.getAttribute) {
			ret = el.getAttribute(k, v);
		}
	} else if (defined(v) && typeof k === 'object') {
		for (n in k) {
			el.setAttribute(n, k[n]);
		}
	}
	return ret;
}

function extend(a, b) {
	var k;
	if (!a) {
		a = {};
	}
	for (k in b) {
		a[k] = b[k];
	}
	return a;
}

function extendClass(a, b) {
	var obj = function () {};
	obj.prototype = new a();
	extend(obj.prototype, b);
	return obj;
}

function pInt(s) {
	return parseInt(s, 10);
}

var AlertBox = function(container) {
    return {
        container: container,
        showBox: function(type, messages, args, callback) {
            var defaults = {header: false, replace: true, scroll: false}
            args = args || {};
            var args = $.extend(defaults, args);
            var type = type || 'info';
            var el = $(this.container+' div.alert-'+type);
            var message;

            var close = $('<a/>', {
                    'class': 'close',
                    'data-dismiss': 'alert',
                    'html': '&times;'
                });

            // single or many?
            if (messages instanceof Array) {
                message = $('<ul/>');
                $.each(messages, function(i, msg){
                    // console.log(msg);
                    $('<li/>', {html: msg}).appendTo(message);
                });
            } else {
                message = $('<span/>', {html: messages});
            }

            // Display heading?
            if (args.header) {
                args.header = $('<h4/>', {
                    'class': 'alert-heading',
                    'text': args.header
                });
            }

            // Overwrite or create new
            if (args.replace == true && el.length > 0) {
                el.html('');
                // el.fadeOut();
            } else {
                el = $('<div/>', {
                    'class': 'alert alert-'+type+' alert-block'// fade in'
                });

                el.appendTo(this.container);
            }

            // Attach everything
            if (args.header) {
                args.header.appendTo(el);
            }

            message.appendTo(el);

            close.prependTo(el);

            // $(this.container+' div.alert-'+type).fadeIn();
            if (typeof callback != 'function') {
                callback = null;
            }
            
            
            var result = el.fadeIn(400, callback);

            if (result.length == 0) {
                callback();
            }

            if (args.scroll) {
                var scrollTop = el.offset().top;
                $('html, body').animate({
                    scrollTop: scrollTop
                }, 400);
            }
        },
        hideBox: function(type, callback) {
            var selector = 'div.alert';
            if (type) {
                selector += '-'+type;
            }
            if (typeof callback != 'function') {
                callback = null;
            }
            
            var result = $(this.container+' '+selector).fadeOut(400, callback);
            if (result.length == 0) {
                callback();
            }
        },
        showError: function(messages, args, callback) {
            var args = $.extend({header: 'Please correct the following errors:'}, args);
            this.showBox('error', messages, args, callback);
        },
        showSuccess: function(messages, args, callback) {
            this.showBox('success', messages, args, callback);
        },
        hide: function(callback) {
            this.hideBox(null, callback);
        },
        hideError: function(callback) {
            this.hideBox('error', callback);
        },
        hideSuccess: function(callback) {
            this.hideBox('success', callback);
        }
    };
}