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
//	Alias Perk Class
// =============================================================================

export default class AliasPerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__records = {};
	static #__info = {
		"section":		"alias",
		"order":		330,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return AliasPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		unit.upgrade("skill", "alias.resolve", function(...args) { return AliasPerk.#_resolve(...args); });

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	static #_resolve(unit, target)
	{

		return unit.get("setting", `alias.${target}`, {});

	}

}
