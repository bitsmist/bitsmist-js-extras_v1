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

// =============================================================================
//	Preference Perk class
// =============================================================================

export default class PreferencePerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	static PreferencePerk_onDoOrganize(sender, e, ex)
	{

		return AttendancePerk.call("PreferenceServer", {"waitForAttendance":true}).then((server) => {
			BM.Util.assert(server, `PreferencePerk.PreferencePerk_onDoOrganize(): PreferenceServer doesn't exist. name=${this.name}`);

			return this.skills.use("state.waitFor", [{"object":server}]).then(() => {
				server.subscribe(this, this.settings.get("preferences"));
			});
		});

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "PreferencePerk";

	}

	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"sections":		"preferences",
			"order":		900,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"preferences",
			"order":		900,
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add event handlers to component
		this._addPerkHandler(component, "doOrganize", PreferencePerk.PreferencePerk_onDoOrganize);

	}

}
