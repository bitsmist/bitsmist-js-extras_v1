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
import LocaleHandler from "./locale-handler";

// =============================================================================
//	LocaleServer Handler class
// =============================================================================

export default class LocaleServerHandler extends LocaleHandler
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Name.
	 *
	 * @type	{String}
	 */
	get name()
	{

		return "LocaleServerHandler";

	}

	get messages()
	{

		return document.querySelector("bm-locale").localeHandler.messages;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	get(key, locale)
	{

		return document.querySelector("bm-locale").localeHandler.get(key, locale);

	}

	t(key, locale)
	{

		return document.querySelector("bm-locale").localeHandler.t(key, locale);

	}

}
