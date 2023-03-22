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

	static PreferenceOrganizer_onBeforeStart(sender, e, ex)
	{

		if (this !==  document.querySelector("bm-preference"))
		{
			// Wait for PreferenceManager to be ready
			return this.waitFor([{"rootNode":"bm-preference"}]).then(() => {
				document.querySelector("bm-preference").subscribe(this, this.settings.get("preferences"));
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
		this._addOrganizerHandler(component, "beforeStart", PreferenceOrganizer.PreferenceOrganizer_onBeforeStart);

	}

}
