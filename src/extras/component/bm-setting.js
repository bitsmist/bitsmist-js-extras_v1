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
//	SettingManager class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function SettingManager()
{

	// super()
	return Reflect.construct(HTMLElement, [], this.constructor);

}

BM.ClassUtil.inherit(SettingManager, BM.Component);

// -----------------------------------------------------------------------------

/**
 * Get component settings.
 *
 * @return  {Object}		Options.
 */
SettingManager.prototype._getSettings = function()
{

	return {
		"settings": {
			"name":					"SettingManager",
			"autoSetup":			false,
		}
	};

}

// -----------------------------------------------------------------------------

customElements.define("bm-setting", SettingManager);
