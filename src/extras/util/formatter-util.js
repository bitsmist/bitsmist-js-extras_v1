// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Formatter Util Class
// =============================================================================

export default class FormatterUtil
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
 	 * Format the value.
	 *
	 * @param	{string}		format				Format.
	 * @param	{string}		value				Value.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Formatted value.
	 */
	static format(format, value, options)
	{

		options = options || {};
		let ret = value;

		let tokens = FormatterUtil.#__bisect(format, "-");
		let type = tokens[0];
		let typeOption = (tokens.length > 1 ? tokens[1] : "");

		switch (type)
		{
		case "date":
		case "datetime":
		case "time":
			ret = this.formatDate(type, typeOption, value, options);
			break;
		case "price":
			ret = this.formatPrice(type, typeOption, value, options);
			break;
		case "number":
			ret = this.formatNumber(type, typeOption, value, options);
			break;
		default:
			// Interpolation
			if (format.charAt(0) === "`")
			{
				ret = this.interpolateResources(format, value, options);
				ret = this.interpolate(ret, options);
				ret = this.interpolateValue(ret, value, options);
				//ret = ret.replace("${value}", value);
			}
			break;
		}

		return String(ret);

	}

	// -------------------------------------------------------------------------

	/**
	 * Format price.
	 *
	 * @param	{String}		type				Type.
	 * @param	{String}		typeOption			Type specific option.
	 * @param	{String}		value				Value.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Formatted value.
	 */
	static formatPrice(type, typeOption, value, options)
	{

		let result = value;

		if (value)
		{
			result = parseInt(value).toLocaleString(navigator.language);
		}

		return result || "";

	}

	// -------------------------------------------------------------------------

	/**
	 * Format price.
	 *
	 * @param	{String}		type				Type.
	 * @param	{String}		typeOption			Type specific option.
	 * @param	{String}		value				Value.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {string}		Formatted value.
	 */
	static formatNumber(type, typeOption, value, options)
	{

		let result = value;

		if (value)
		{
			value = parseInt(value).toLocaleString(navigator.language);
		}

		return result || "";

	}

	// -------------------------------------------------------------------------

	/**
	 * Format date.
	 *
	 * @param	{String}		type				Type.
	 * @param	{String}		typeOption			Type specific option.
	 * @param	{String}		value				Value.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Formatted value.
	 */
	static formatDate(type, typeOption, value, options)
	{

		let result = value;
		let inFormat;
		let outFormat = typeOption;

		let dt;
		if (value.length === 8)
		{
			dt = new Date(`${value.substr(0, 4)}-${value.substr(4, 2)}-${value.substr(6, 2)}`);
		}
		else
		{
			dt = new Date(value);
		}

		switch (typeOption)
		{
		case "":
			result = dt.toString();
			break;
		default:
			let y = String(dt.getFullYear());
			let m = String(1 + dt.getMonth());
			let d = String(dt.getDate());
			let h = String(dt.getHours());
			let mi = String(dt.getMinutes());
			let s = String(dt.getSeconds());

			result = outFormat
			result = result.replace(/YYYY/g, y.padStart(4, "0"));
			result = result.replace(/YY/g, y.slice(-2).padStart(2, "0"));
			result = result.replace(/MM/g, m.padStart(2, "0"));
			result = result.replace(/M/g, m.padStart(1, "0"));
			result = result.replace(/DD/g, d.padStart(2, "0"));
			result = result.replace(/D/g, d.padStart(1, "0"));
			result = result.replace(/hh/g, h.padStart(2, "0"));
			result = result.replace(/h/g, h.padStart(1, "0"));
			result = result.replace(/mm/g, mi.padStart(2, "0"));
			result = result.replace(/m/g, mi.padStart(1, "0"));
			result = result.replace(/ss/g, s.padStart(2, "0"));
			result = result.replace(/s/g, s.padStart(1, "0"));
			break;
		}

		return result || "";

	}

	// -------------------------------------------------------------------------

	/**
	 * Deformat the value.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		value				Value.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Object}		Deformatted value.
	 */
	static deformat(format, value, options)
	{

		let ret = value;


		switch (format)
		{
		case "date-YYYY-MM-DD":
			ret = value.replace(/-/g, "");
			break;
		case "date-YYYY/MM/DD":
			ret = value.replace(/\//g, "");
			break;
		case "price":
			ret = this.deformatPrice(format, value);
			break;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Deformat price.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		value				Price.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Deformatted price.
	 */
	static deformatPrice(format, value, options)
	{

		var result = "";

		if (value)
		{
			result = value.replace(/,/g, "").replace(/\//g, "").replace(/\\/g, "").replace("¥", "");
		}

		return result;

	}

	// -------------------------------------------------------------------------

	/**
	 * Deformat date.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		value				Date.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Deformatted date.
	 */
	static deformatDate(format, value, options)
	{

		var result = "";

		if (value)
		{
			result = value.replace(/,/g, "").replace(/\//g, "").replace(/\\/g, "");
		}

		return result;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get current date time.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		dateDelimiter		Date delimiter.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Current date time.
	 */
	static getNow(format, dateDelimiter, options)
	{

		dateDelimiter = ( dateDelimiter ? dateDelimiter : "-" );
		var d = new Date();
		var now = d.getFullYear() + dateDelimiter + ("00" + (d.getMonth() + 1)).slice(-2) + dateDelimiter + ("00" + d.getDate()).slice(-2) + " " +
					("00" + d.getHours()).slice(-2) + ":" + ("00" + d.getMinutes()).slice(-2) + ":" + ("00" + d.getSeconds()).slice(-2);

		return now;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get current date.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		dateDelimiter		Date delimiter.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Current date.
	 */
	static getToday(format, dateDelimiter, options)
	{

		dateDelimiter = ( dateDelimiter === undefined ? "-" : dateDelimiter );
		var d = new Date();
		var today = d.getFullYear() + dateDelimiter + ("00" + (d.getMonth() + 1)).slice(-2) + dateDelimiter + ("00" + d.getDate()).slice(-2);

		return today;

	}

	// -------------------------------------------------------------------------

	/**
	 * Sanitize string.
	 *
	 * @param	{String}		value				Value to sanitize.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{String}		Sanitized string.
	 */
	static sanitize(value, options)
	{

		if (typeof value === "string")
		{
			return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
		}
		else
		{
			return value;
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Interpolate using parameters.
	 *
	 * @param	{String}		format				Format.
	 * @param	{Object}		options				Options
	 *
	 * @return  {Object}		Formatted value.
	 */
	static interpolate(format, options)
	{

		let ret = format;
		let parameters = options["interpolation"];

		if (parameters && format.indexOf("${") > -1)
		{
			ret = ret.replace(/\$\{(.+)\}/g, (_, name) => {
				let tokens = FormatterUtil.#__bisect(name, ":");
				let value = parameters[tokens[0]];

				if (!value)
				{
					value = "${" + name + "}";
				}
				else if (value && tokens.length > 1)
				{
					value = this.format(tokens[1], value, options);
				}

				return value || "";
			});
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Interpolate ${value} using parameters.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		value				Value.
	 * @param	{Object}		options				Options
	 *
	 * @return  {Object}		Formatted value.
	 */
	static interpolateValue(format, value, options)
	{

		let ret = format;

		if (format.indexOf("${value") > -1)
		{
			ret = ret.replace(/\$\{value(.*)\}/g, (_, name) => {
				let tokens = FormatterUtil.#__bisect(name, ":");
				let tmp = value;

				if (tokens.length > 1)
				{
					tmp = this.format(tokens[1], value, options);
				}

				return tmp || "";
			});
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Interpolate using ResourceHandlers.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		value				Value.
	 * @param	{Object}		resources			Resources.
	 *
	 * @return  {Object}		Formatted value.
	 */
	static interpolateResources(format, value, options)
	{

		let ret = format;
		let resources = options["resources"];

		if (resources && format.indexOf("#{") > -1)
		{
			ret = format.replace(/\#\{(.+)\}/g, (_, name) => {
				let arr = name.split(".");
				let resourceName = arr[0];
				let key = arr[1];
				return FormatterUtil.#__getResourceValue(resources, resourceName, value, key) || "";
			});
		}

		return ret;

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Get the resource value that matches given value.
	 *
	 * @param	{array}			resources			Resources.
	 * @param	{String}		resourceName		Resource name.
	 * @param	{String}		value				Code value.
	 * @param	{String}		key					Key.
	 *
	 * @return  {String}		Resource value.
	 */
	static #__getResourceValue(resources, resourceName, value, key)
	{

		let ret = value;

		if (resources && (resourceName in resources))
		{
			let item = resources[resourceName].getItem(value);
			if (item)
			{
				ret = item[key];
			}
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Split the target string into two with the delimiter.
	 *
	 * @param	{String}		target				Target string to divide.
	 * @param	{String}		delimiter			Delimiter char.
	 *
	 * @return  {Arry}			Splitted string.
	 */
	static #__bisect(target, delimiter)
	{

		let ret = [];

		let pos = target.indexOf(delimiter);
		if (pos > -1)
		{
			ret.push(target.substring(0, pos));
			ret.push(target.substring(pos + 1));
		}
		else
		{
			ret.push(target);
		}

		return ret;

	}

}
