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

// =============================================================================
//	Error Perk class
// =============================================================================

export default class ErrorPerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__info = {
		"section":		"error",
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
	//  Event handlers
	// -------------------------------------------------------------------------

	static #ErrorPerk_onDoStart(sender, e, ex)
	{

		let serverNode = this.get("setting", "error.options.errorServer", this.get("setting", "system.error.options.errorServer"));
		serverNode = ( serverNode === true ? "bm-error" : serverNode );

		return this.use("spell", "status.wait", [serverNode]).then(() => {
			let server = document.querySelector(serverNode);
			server.subscribe(this, BM.Util.safeGet(e.detail, "settings.error"));
			this.set("vault", "error.server", server);
		});

	}

}
