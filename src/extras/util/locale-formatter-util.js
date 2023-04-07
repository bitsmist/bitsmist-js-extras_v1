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
	static formatPrice(format, price, options)
	{

		let locale = ( options && options["localeName"] ? options["localeName"] : "en-US" );
		let currency = ( options && options["currencyName"] ? options["currencyName"] : "USD" );

		return new Intl.NumberFormat(locale, {
			style:		"currency",
			currency:	currency
		}).format(price);

	}

}
