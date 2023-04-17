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
//	Setting Server Class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

export default function SettingServer()
{

	// super()
	return Reflect.construct(HTMLElement, [], this.constructor);

}

BM.ClassUtil.inherit(SettingServer, BM.Component);

// -----------------------------------------------------------------------------

/**
 * Get component settings.
 *
 * @return  {Object}		Options.
 */
SettingServer.prototype._getSettings = function()
{

	return {
		"setting": {
			"name":					"SettingServer",
			"autoSetup":			false,
		}
	};

}

// -----------------------------------------------------------------------------

customElements.define("bm-setting", SettingServer);
