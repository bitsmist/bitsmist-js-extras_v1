// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import {Unit, Perk, Util, AjaxUtil} from "@bitsmist-js_v1/core";

// =============================================================================
//	File Perk class
// =============================================================================

export default class FilePerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__info = {
		"sectionName":	"file",
		"order":		110,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return FilePerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Add event handlers
		unit.use("event.add", "doApplySettings", {"handler":FilePerk.#FilePerk_onDoApplySettings, "order":FilePerk.info["order"]});

	}

	// -----------------------------------------------------------------------------
	//	Event Handlers (Unit)
	// -----------------------------------------------------------------------------

	static #FilePerk_onDoApplySettings(sender, e, ex)
	{

		let promises = [];

		Object.entries(Util.safeGet(e.detail, "settings.file.targets", {})).forEach(([sectionName, sectionValue]) => {
			let options = {};
			options["type"] = Unit.get("setting", "system.options.type", "text/javascript");
			promises.push(AjaxUtil.loadScript(sectionValue["href"], options));
		});

		return Promise.all(promises);

	}

}
