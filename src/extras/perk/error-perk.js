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
	//  Event handlers
	// -------------------------------------------------------------------------

	static ErrorPerk_onDoStart(sender, e, ex)
	{

		return AttendancePerk.call("ErrorServer", {"waitForAttendance":true}).then((server) => {
			BM.Util.assert(server, `ErrorPerk.ErrorPerk_onDoStart(): ErrorServer doesn't exist. name=${this.tagName}`);

			return this.skills.use("state.wait", [{"object":server, "state":"started"}]).then(() => {
				server.subscribe(this, BM.Util.safeGet(e.detail, "settings.error"));
				this.vault.set("error.server", server);
			});
		});

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"error",
			"order":		120,
		};

	}

}
