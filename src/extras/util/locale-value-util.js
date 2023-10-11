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
import LocaleFormatterUtil from "../util/locale-formatter-util";
import ValueUtil from "./value-util";

// =============================================================================
//	Locale Value Util Class
// =============================================================================

export default class LocaleValueUtil extends ValueUtil
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Attribute name.
	 *
	 * @type	{String}
	 */
	static get attributeName()
	{

		return "bm-locale";

	}

	// -------------------------------------------------------------------------

	/**
	 * Formatter.
	 *
	 * @type	{Class}
	 */
	static get formatter()
	{

		return LocaleFormatterUtil;

	}

}
