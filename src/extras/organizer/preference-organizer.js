// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AttendanceOrganizer from "../organizer/attendance-organizer.js";
import BM from "../bm";

// =============================================================================
//	Preference organizer class
// =============================================================================

export default class PreferenceOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "PreferenceOrganizer";

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	static PreferenceOrganizer_onDoOrganize(sender, e, ex)
	{

		return AttendanceOrganizer.call("PreferenceServer", {"waitForAttendance":true}).then((server) => {
			BM.Util.assert(server, `PreferenceOrganizer.PreferenceOrganizer_onDoOrganize(): PreferenceServer doesn't exist. name=${this.name}`);

			return this.waitFor([{"object":server}]).then(() => {
				server.subscribe(this, this.settings.get("preferences"));
			});
		});

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
		this._addOrganizerHandler(component, "doOrganize", PreferenceOrganizer.PreferenceOrganizer_onDoOrganize);

	}

}
