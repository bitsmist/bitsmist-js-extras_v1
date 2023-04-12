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
import PreferenceServer from "../component/bm-preference.js";

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

		if (!(this instanceof PreferenceServer))
		{
			return AttendanceOrganizer.call("PreferenceServer").then((server) => {
				BM.Util.assert(server, `PreferenceOrganizer.PreferenceOrganizer_onDoOrganize(): PreferenceServer doesn't exist. name=${name}`);

				return BM.StateOrganizer.waitFor([{"object":server}]).then(() => {
					server.subscribe(this, this.settings.get("preferences"));
				});
			});
		}

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
