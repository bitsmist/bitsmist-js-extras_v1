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

	/*
	init(options)
	{

		return this._component.use("spell", "rollcall.call", "LocaleServer", {"waitForAttendance":true}).then((server) => {
			BM.Util.assert(server, `Locale server doesn't exist. name=${this._component.tagName}`);

			this._messages.chain(server.get("inventory", "locale.messages"));
		});

	}
	*/

	init(options)
	{

		let rootNode = this._component.use("skill", "alias.resolve", "LocaleServer")["rootNode"] || "bm-locale";

		return this._component.use("spell", "state.wait", [{"rootNode":rootNode, "state":"starting"}]).then(() => {
			let server = document.querySelector(rootNode);
			this._messages.chain(server.get("inventory", "locale.messages"));
		});

	}

}
