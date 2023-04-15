// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AttendancePerk from "../perk/attendance-perk.js";
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

		return AttendancePerk.call("LocaleServer", {"waitForAttendance":true}).then((server) => {
			BM.Util.assert(server, `Locale server doesn't exist. name=${this._component.name}`);

			this._messages.chain(server.inventory.get("locale.messages"));
		});

	}

}
