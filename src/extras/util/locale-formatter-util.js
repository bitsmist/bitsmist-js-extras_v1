// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import BM from "../bm";
import FormatterUtil from "./formatter-util.js";

// =============================================================================
//	Locale Formatter util class
// =============================================================================

export default class LocaleFormatterUtil extends FormatterUtil
{

	// -------------------------------------------------------------------------
	//  Methods
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
			let locale = "ja-JP";
			return new Intl.NumberFormat(locale, {style:"currency", currency:"JPY"}).format(price);
			//return `¥${String(parseInt(price)).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}`;
			//return `${String(parseInt(price)).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}`;
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

}
