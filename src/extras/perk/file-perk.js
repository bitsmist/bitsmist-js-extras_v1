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

	// -----------------------------------------------------------------------------
	//	Event handlers
	// -----------------------------------------------------------------------------

	static FilePerk_onDoOrganize(sender, e, ex)
	{

		let promises = [];

		Object.entries(BM.Util.safeGet(e.detail, "settings.file.targets", {})).forEach(([sectionName, sectionValue]) => {
			promises.push(BM.AjaxUtil.loadScript(sectionValue["href"]));
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"file",
			"order":		110,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add event handlers to component
		this._addPerkHandler(component, "doOrganize", FilePerk.FilePerk_onDoOrganize);

	}

}
