// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ObservableStore from "../store/observable-store.js";
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
							"beforeStart":			["LocaleServer_onBeforeStart"],
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
			"skin": {
				"options": {
					"hasSkin":						false,
				}
			},
			"style": {
				"options": {
					"hasStyle":					false,
					"styleRef":					false,
				}
			},
		}

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	LocaleServer_onBeforeStart(sender, e, ex)
	{

		this._store = new ObservableStore({"async":true});

	}

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
		return this._store.notify("*", e.detail);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Subscribe to the Server. Get a notification when locale changed.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	subscribe(unit, options)
	{

		this._store.subscribe(
			`${unit.tagName}_${unit.uniqueId}`,
			this.#__triggerEvent.bind(unit),
		);

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Trigger locale changed events.
	 *
	 * @param	{String}		conditions			Notify conditions.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	#__triggerEvent(conditions, observerInfo, options)
	{

		return this.cast("locale.apply", {"localeName":options.localeName});

	}

}

customElements.define("bm-locale", LocaleServer);
