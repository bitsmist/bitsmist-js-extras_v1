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
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "FileOrganizer";

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"targetWords":	"files",
			"order":		110,
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add event handlers to component
		this._addOrganizerHandler(component, "doOrganize", FileOrganizer.onDoOrganize);

	}

	// -----------------------------------------------------------------------------
	//	Event handlers
	// -----------------------------------------------------------------------------

	static onDoOrganize(sender, e, ex)
	{

		let promises = [];

		this._enumSettings(e.detail.settings["files"], (sectionName, sectionValue) => {
			promises.push(BM.AjaxUtil.loadScript(sectionValue["href"]));
		});

		return Promise.all(promises);

	}

}
