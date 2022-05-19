// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

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

BITSMIST.v1.ClassUtil.inherit(SettingManager, BITSMIST.v1.Component);

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
