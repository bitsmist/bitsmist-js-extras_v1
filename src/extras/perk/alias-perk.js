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
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"alias",
			"order":		330,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Init vars
		AliasPerk._records = {};

	}

	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		unit.upgrade("skill", "alias.resolve", function(...args) { return AliasPerk._resolve(...args); });

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	static _resolve(unit, target)
	{

		return unit.get("setting", `alias.${target}`, {});

	}

}
