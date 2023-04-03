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

	get name()
	{

		return "LocaleServerHandler";

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	init(options)
	{

		let rootNode = this._options.get("rootNode", "bm-locale");
		this._messages.chain(document.querySelector(rootNode).localeMessages);

	}

}
