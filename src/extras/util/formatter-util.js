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

		switch (format.toLowerCase())
		{
		case "date":
		case "yyyy/mm/dd":
			ret = this.formatDate(format, value, options);
			break;
		case "price":
			ret = this.formatPrice(format, value, options);
			break;
		case "number":
			ret = this.formatNumber(format, value, options);
			break;
		default:
			// Interpolate
			ret = this.interpolateResources(format, value, options);
			ret = this.interpolate(ret, options);
			ret = this.interpolateValue(format, value, options);
			//ret = ret.replace("${value}", value);
			break;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Format price.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		value				Value.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Formatted price.
	 */
	static formatPrice(format, value, options)
	{

		if (value)
		{
			return parseInt(value).toLocaleString(navigator.language);
		}
		else
		{
			return "";
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Format price.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		value				Value.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {string}		Formatted price.
	 */
	static formatNumber(format, value, options)
	{

		if (value)
		{
			return parseInt(value).toLocaleString(navigator.language);
		}
		else
		{
			return "";
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Format date.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		str					Date.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Formatted date.
	 */
	static formatDate(format, str, options)
	{

		let result = "";

		if (str && str.length === 8)
		{
			result = `${str.substr(0, 4)}/${str.substr(4, 2)}/${str.substr(6, 2)}`;
		}

		return result;

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
		case "yyyy/mm/dd":
			ret = this.deformatDate(format, value);
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
				let tokens = name.split(":");
				let value = parameters[tokens[0]];

				if (!value)
				{
					value = "${" + name + "}";
				}
				else if (value && tokens.length > 1)
				{
					value = this.format(tokens[1], value, options);
				}

				return value;
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
				let tokens = name.split(":");
				let tmp = value;

				if (tokens.length > 1)
				{
					tmp = this.format(tokens[1], value, options);
				}

				return tmp;
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
				return this.__getResourceValue(resources, resourceName, value, key);
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
	static __getResourceValue(resources, resourceName, value, key)
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

}
