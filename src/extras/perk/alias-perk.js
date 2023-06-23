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

	static init(component, options)
	{

		// Upgrade component
		this.upgrade(component, "skill", "alias.resolve", function(...args) { return AliasPerk._resolve(...args); });

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	static _resolve(component, target)
	{

		return component.get("settings", `alias.${target}`, {});

	}

}
