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
import ObservableStore from "../store/observable-store.js";

// =============================================================================
//	Router Class
// =============================================================================

export default class Router extends BM.Unit
{

	// -------------------------------------------------------------------------
	//	Settings
	// -------------------------------------------------------------------------

	_getSettings()
	{

		return {
			"basic": {
				"options": {
					"autoRefresh":				false,
				}
			},
			"skin": {
				"options": {
					"skinRef":					false,
				}
			},
			"style": {
				"options": {
					"styleRef":					false,
				}
			},
			"routing": {
			},
		}

	}

}

customElements.define("bm-router", Router);