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
//	File organizer class
// =============================================================================

export default class FileOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"name":			"FileOrganizer",
			"targetWords":	"files",
			"order":		110,
		};

	}

	// -------------------------------------------------------------------------

	static attach(component, options)
	{

		// Add event handlers to component
		this._addOrganizerHandler(component, "afterLoadSettings", FileOrganizer.onAfterLoadSettings);

	}

	// -----------------------------------------------------------------------------
	//	Event handlers
	// -----------------------------------------------------------------------------

	static onAfterLoadSettings(sender, e, ex)
	{

		let promises = [];

		let files = e.detail.settings["files"];
		if (files)
		{
			Object.keys(files).forEach((fileName) => {
				promises.push(BM.AjaxUtil.loadScript(files[fileName]["href"]));
			});
		}

		return Promise.all(promises);

	}

}
