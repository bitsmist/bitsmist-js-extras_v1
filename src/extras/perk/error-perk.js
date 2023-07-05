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
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"error",
			"order":		120,
			"depends":		"AliasPerk",
			//"depends":		"RollCallPerk",
		};

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	static ErrorPerk_onDoStart(sender, e, ex)
	{

		let serverNode = this.get("settings", "locale.options.errorServer", this.get("settings", "system.errorServer"));
		serverNode = ( serverNode === true ? "bm-error" : serverNode );

		return this.use("spell", "status.wait", [{"rootNode":serverNode, "status":"started"}]).then(() => {
			let server = document.querySelector(serverNode);
			server.subscribe(this, BM.Util.safeGet(e.detail, "settings.error"));
			this.set("vault", "error.server", server);
		});

	}

}
