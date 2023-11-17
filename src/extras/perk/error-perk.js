// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import {Perk, Util} from "@bitsmist-js_v1/core";

// =============================================================================
//	Error Perk class
// =============================================================================

export default class ErrorPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":	"error",
		"order":		120,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return ErrorPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #ErrorPerk_onDoStart(sender, e, ex)
	{

		let serverNode = this.get("setting", "error.options.errorServer", this.get("setting", "system.error.options.errorServer"));
		serverNode = ( serverNode === true ? "bm-error" : serverNode );

		return this.cast("status.wait", [serverNode]).then(() => {
			let server = document.querySelector(serverNode);
			server.subscribe(this, Util.safeGet(e.detail, "settings.error"));
			DialogPerk.#__vault.get(unit)["server"] = server;
		});

	}

}
