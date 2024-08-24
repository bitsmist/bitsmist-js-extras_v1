// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import {Unit} from "@bitsmist-js_v1/core";

// =============================================================================
//	Locale Server Class
// =============================================================================

export default class LocaleServer extends Unit
{

	// -------------------------------------------------------------------------
	//	Settings
	// -------------------------------------------------------------------------

	_getSettings()
	{

		return {
			"basic": {
				"options": {
					"autoRefresh":					false,
				}
			},
			"event": {
				"events": {
					"this": {
						"handlers": {
							"doApplyLocale":		["LocaleServer_onDoApplyLocale"],
						}
					}
				}
			},
			"locale": {
				"handlers": {
					"default": {
						"handlerClassName":			"LocaleHandler",
					}
				}
			},
			"notification": {
				"options": {
					"cast":							"locale.apply",
				}
			},
			"skin": {
				"options": {
					"hasSkin":						false,
				}
			},
			"style": {
				"options": {
					"hasStyle":						false,
				}
			},
		}

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	LocaleServer_onDoApplyLocale(sender, e, ex)
	{

		// Set locale attribute
		if (this.get("setting", "options.autoAttribute"))
		{
			let rootNode = this.get("setting", "options.autoAttribute.rootNode");
			let targetElement = ( rootNode ? document.querySelector(rootNode) : document.body );
			let attribName = this.get("setting", "options.autoAttribute.attributeName", "data-locale");

			targetElement.setAttribute(attribName, this.get("inventory", "locale.active.localeName"));
		}

		// Notify locale change to clients
		return this.cast("notification.notify", e.detail);

	}

}

customElements.define("bm-locale", LocaleServer);
