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
//	File Perk class
// =============================================================================

export default class FilePerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "FilePerk";

	}

	// -----------------------------------------------------------------------------
	//	Event handlers
	// -----------------------------------------------------------------------------

	static FilePerk_onDoOrganize(sender, e, ex)
	{

		let promises = [];

		this.skills.use("setting.enumSettings", e.detail.settings["files"], (sectionName, sectionValue) => {
			promises.push(BM.AjaxUtil.loadScript(sectionValue["href"]));
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"files",
			"order":		110,
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add event handlers to component
		this._addPerkHandler(component, "doOrganize", FilePerk.FilePerk_onDoOrganize);

	}

}
