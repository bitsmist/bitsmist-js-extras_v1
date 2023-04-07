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
	* Interpolate using parameters.
	*
	* @param	{String}		format				Format.
	* @param	{Object}		parameters			Parameters.
	*
	* @return  {Object}		Formatted value.
	*/
	static interpolate(format, parameters)
	{

		let ret = format;

		if (parameters && format.indexOf("${") > -1)
		{
			ret = ret.replace(/\$\{(\w+)\}/g, (_, name) => {
				return parameters[name] || `${name}`;
			});
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	* Interpolate using resources.
	*
	* @param	{String}		format				Format.
	* @param	{String}		value				Value.
	* @param	{Object}		resources			Resources.
	*
	* @return  {Object}		Formatted value.
	*/
	static interpolateResources(format, value, resources)
	{

		let ret = format;

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

	/**
	* Format the value.
	*
	* @param	{string}		format				Format.
	* @param	{string}		value				Value.
	*
	* @return  {Object}		Formatted value.
	*/
	static format(format, value, options)
	{

		options = options || {};
		let ret = value;

		switch (format.toLowerCase())
		{
		case "yyyy/mm/dd":
			ret = this.formatDate(format, value);
			break;
		case "price":
			ret = this.formatPrice(format, value);
			break;
		default:
			// Interpolate
			ret = this.interpolateResources(format, value, options["resources"]);
			ret = this.interpolate(ret, options["parameters"]);
			ret = ret.replace("${value}", value);
			break;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	* Format price.
	*
	* @param	{integer}		price				Price.
	*
	* @return  {string}		Formatted price.
	*/
	static formatPrice(format, price)
	{

		if (price)
		{
			//let locale = "ja-JP";
			//return new Intl.NumberFormat(locale, {style:"currency", currency:"JPY"}).format(price);
			//return `¥${String(parseInt(price)).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}`;
			return `${String(parseInt(price)).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}`;
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
	* @param	{integer}		price				Price.
	*
	* @return  {string}		Formatted price.
	*/
	static formatNumber(number)
	{

		if (number)
		{
			return String(parseInt(number)).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
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
	* @param	{string}		str					Date.
	*
	* @return  {string}		Formatted date.
	*/
	static formatDate(format, str)
	{

		var result = "";
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
	* @param	{string}		format				Format.
	* @param	{string}		value				Value.
	*
	* @return  {Object}		Deformatted value.
	*/
	static deformat(format, value)
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
	* @param	{string}		value				Price.
	*
	* @return  {string}		Deformatted price.
	*/
	static deformatPrice(format, value)
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
	* @param	{string}		value				Date.
	*
	* @return  {string}		Deformatted date.
	*/
	static deformatDate(format, value)
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
	* @param	{string}		dateDelimiter		Date delimiter.
	*
	* @return  {string}		Current date time.
	*/
	static getNow(dateDelimiter)
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
	* @param	{string}		dateDelimiter		Date delimiter.
	*
	* @return  {string}		Current date.
	*/
	static getToday(dateDelimiter)
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
	*
	* @return  {String}		Sanitized string.
	*/
	static sanitize(value)
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
