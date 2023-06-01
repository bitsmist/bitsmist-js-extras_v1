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

	/*
	static ErrorPerk_onDoStart(sender, e, ex)
	{

		return this.use("skill", "rollcall.call", "ErrorServer", {"waitForAttendance":true}).then((server) => {
			BM.Util.assert(server, `ErrorPerk.ErrorPerk_onDoStart(): ErrorServer doesn't exist. name=${this.tagName}`);

			return this.use("skill", "state.wait", [{"object":server, "state":"started"}]).then(() => {
				server.subscribe(this, BM.Util.safeGet(e.detail, "settings.error"));
				this.set("vault", "error.server", server);
			});
		});

	}
	*/

	static ErrorPerk_onDoStart(sender, e, ex)
	{

		let rootNode = this.use("skill", "alias.resolve", "ErrorServer")["rootNode"] || "bm-error";

		return this.use("skill", "state.wait", [{"rootNode":rootNode, "state":"started"}]).then(() => {
			let server = document.querySelector(rootNode);
			server.subscribe(this, BM.Util.safeGet(e.detail, "settings.error"));
			this.set("vault", "error.server", server);
		});

	}

}
