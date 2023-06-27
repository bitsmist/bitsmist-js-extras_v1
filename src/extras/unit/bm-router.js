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
					"autoFetch":				false,
					"autoFill":					false,
					"autoRefresh":				false,
					"autoTransform":			false,
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

			/*
			"rollcall": {
				"members": {
					"Router": {
						"rootNode":				this.tagName,
					},
				}
			}
			*/
		}

	}

}

customElements.define("bm-router", Router);
