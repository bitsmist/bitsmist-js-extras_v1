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
//	Locale Server Class
// =============================================================================

export default class LocaleServer extends BM.Unit
{

	// -------------------------------------------------------------------------
	//	Settings
	// -------------------------------------------------------------------------

	_getSettings()
	{

		return {
			"event": {
				"events": {
					"this": {
						"handlers": {
							"beforeStart":		["LocaleServer_onBeforeStart"],
							"doApplyLocale":	["LocaleServer_onDoApplyLocale"],
						}
					}
				}
			},
			"locale": {
				"handlers": {
					"default": {
						"handlerClassName":		"BITSMIST.v1.LocaleHandler",
					}
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

			targetElement.setAttribute(attribName, this.get("state", "locale.localeName"));
		}

		// Notify locale change to clients
		return this._store.notify("*", e.detail);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Subscribe to the Server. Get a notification when prefrence changed.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	subscribe(unit, options)
	{

		this._store.subscribe(
			`${unit.tagName}_${unit.uniqueId}`,
			this.__triggerEvent.bind(unit),
		);

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Trigger preference changed events.
	 *
	 * @param	{String}		conditions			Notify conditions.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	__triggerEvent(conditions, observerInfo, options)
	{

		return this.use("spell", "locale.apply", {"localeName":options.localeName});

	}

}

customElements.define("bm-locale", LocaleServer);
