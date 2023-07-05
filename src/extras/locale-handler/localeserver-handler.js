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
	//  Methods
	// -------------------------------------------------------------------------

	init(options)
	{

		let serverNode = this._unit.get("settings", "locale.options.localeServer", this._unit.get("settings", "system.localeServer"));
		serverNode = ( serverNode === true ? "bm-locale" : serverNode );

		return this._unit.use("spell", "status.wait", [{"rootNode":serverNode, "status":"starting"}]).then(() => {
			let server = document.querySelector(serverNode);
			this._messages.chain(server.get("inventory", "locale.messages"));
		});

	}

}
