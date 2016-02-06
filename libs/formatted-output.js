module.exports = function FormattedOutput() {
	this.print_r = function(array, return_val) {
		var output = "", pad_char = " ", pad_val = 4;

		var formatArray = function (obj, cur_depth, pad_val, pad_char) {
			if(cur_depth > 0)
				cur_depth++;

			var base_pad = repeat_char(pad_val*cur_depth, pad_char);
			var thick_pad = repeat_char(pad_val*(cur_depth+1), pad_char);
			var str = "";

			if(obj instanceof Array) {
				str += "Array\n" + base_pad + "(\n";
				for(var key in obj) {
					if(obj[key] instanceof Array) {
						str += thick_pad + "["+key+"] => "+formatArray(obj[key], cur_depth+1, pad_val, pad_char);
					} else {
						str += thick_pad + "["+key+"] => " + obj[key] + "\n";
					}
				}
				str += base_pad + ")\n";
			} else {
				str = obj.toString();
			};

			return str;
		};

		var repeat_char = function (len, char) {
			var str = "";
			for(var i=0; i < len; i++) { str += char; };
			return str;
		};

		output = formatArray(array, 0, pad_val, pad_char);

		if(return_val !== true) {
			document.write("<pre>" + output + "</pre>");
			return true;
		} else {
			return output;
		}
	}
	this.sprintf = function() {
		var regex = /%%|%(\d+\$)?([-+#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
		var a = arguments, i = 0, format = a[i++];

		var pad = function(str, len, chr, leftJustify) {
			var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
			return leftJustify ? str + padding : padding + str;
		};

		var justify = function(value, prefix, leftJustify, minWidth, zeroPad) {
			var diff = minWidth - value.length;
			if (diff > 0) {
				if (leftJustify || !zeroPad) {
				value = pad(value, minWidth, ' ', leftJustify);
				} else {
				value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
				}
			}
			return value;
		};

		var formatBaseX = function(value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
			var number = value >>> 0;
			prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
			value = prefix + pad(number.toString(base), precision || 0, '0', false);
			return justify(value, prefix, leftJustify, minWidth, zeroPad);
		};

		var formatString = function(value, leftJustify, minWidth, precision, zeroPad) {
			if (precision != null) {
				value = value.slice(0, precision);
			}
			return justify(value, '', leftJustify, minWidth, zeroPad);
		};

		var doFormat = function(substring, valueIndex, flags, minWidth, _, precision, type) {
			if (substring == '%%') return '%';

			var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false;
			for (var j = 0; flags && j < flags.length; j++) switch (flags.charAt(j)) {
				case ' ': positivePrefix = ' '; break;
				case '+': positivePrefix = '+'; break;
				case '-': leftJustify = true; break;
				case '0': zeroPad = true; break;
				case '#': prefixBaseX = true; break;
			}

			if (!minWidth) {
				minWidth = 0;
			} else if (minWidth == '*') {
				minWidth = +a[i++];
			} else if (minWidth.charAt(0) == '*') {
				minWidth = +a[minWidth.slice(1, -1)];
			} else {
				minWidth = +minWidth;
			}

			if (minWidth < 0) {
				minWidth = -minWidth;
				leftJustify = true;
			}

			if (!isFinite(minWidth)) {
				throw new Error('sprintf: (minimum-)width must be finite');
			}

			if (!precision) {
				precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : void(0);
			} else if (precision == '*') {
				precision = +a[i++];
			} else if (precision.charAt(0) == '*') {
				precision = +a[precision.slice(1, -1)];
			} else {
				precision = +precision;
			}

			var value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

			switch (type) {
				case 's': return formatString(String(value), leftJustify, minWidth, precision, zeroPad);
				case 'c': return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
				case 'b': return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
				case 'o': return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
				case 'x': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
				case 'X': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
				case 'u': return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
				case 'i':
				case 'd': 
						{
							var number = parseInt(+value);
							var prefix = number < 0 ? '-' : positivePrefix;
							value = prefix + pad(String(Math.abs(number)), precision, '0', false);
							return justify(value, prefix, leftJustify, minWidth, zeroPad);
						}
				case 'e':
				case 'E':
				case 'f':
				case 'F':
				case 'g':
				case 'G':
						{
							var number = +value;
							var prefix = number < 0 ? '-' : positivePrefix;
							var method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
							var textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
							value = prefix + Math.abs(number)[method](precision);
							return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
						}
				default: 
					return substring;
			}
		};

		return format.replace(regex, doFormat);
	}
	this.printf = function() {
		var ret = this.sprintf.apply(this, arguments);
		document.write(ret);
		return ret.length;
	}
}