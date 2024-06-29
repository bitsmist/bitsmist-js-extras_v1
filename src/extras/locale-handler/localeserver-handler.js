// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import LocaleHandler from "./locale-handler";
import {Util} from "@bitsmist-js_v1/core";

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

		super.init(options);

		let serverNode = this._unit.get("setting", "locale.options.localeServer", this._unit.get("setting", "system.locale.options.localeServer"));
		serverNode = ( serverNode === true ? "bm-locale" : serverNode );

		Util.assert(serverNode, () => `Locale Server node not specified in settings. name=${this._unit.tagName}`);

		return this._unit.cast("status.wait", [serverNode]).then(() => {
			let server = document.querySelector(serverNode);
			this._messages.chain(server.get("inventory", "locale.messages"));
		});

	}

	// -------------------------------------------------------------------------

	loadMessages(localeName, options)
	{
	}

}
