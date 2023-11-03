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
		"sectionName":		"alias",
		"order":			330,
	};
	static #__skills = {
		"resolve":			AliasPerk.#_resolve(...args),
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return AliasPerk.#__info;

	}

	// -------------------------------------------------------------------------

	static get skills()
	{

		return AliasPerk.#__skills;

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	static #_resolve(unit, target)
	{

		return unit.get("setting", `alias.${target}`, {});

	}

}
