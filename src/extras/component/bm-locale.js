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

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

export default function LocaleServer(settings)
{

	return Reflect.construct(BM.Component, [settings], this.constructor);

}

BM.ClassUtil.inherit(LocaleServer, BM.Component);

// -----------------------------------------------------------------------------
//	Settings
// -----------------------------------------------------------------------------

LocaleServer.prototype._getSettings = function()
{

	return {
		// Settings
		"settings": {
			"autoTransform":			false,
			"name":						"LocaleServer",
		},

		// Events
		"events": {
			"this": {
				"handlers": {
					"beforeStart":		["LocaleServer_onBeforeStart"],
					"doChangeLocale":	["LocaleServer_onDoChangeLocale"],
				}
			}
		},

		// Localizers
		"localizers": {
			"default": {
				"handlerClassName":		"BITSMIST.v1.LocaleHandler",
			}
		},

		// Attendances
		"attendances": {
			"locale": {
				"name": 				"LocaleServer",
			}
		}
	}

}

// -----------------------------------------------------------------------------
//  Event Handlers
// -----------------------------------------------------------------------------

LocaleServer.prototype.LocaleServer_onBeforeStart = function(sender, e, ex)
{

	this._store = new ObservableStore({"async":true});

}

// -----------------------------------------------------------------------------

LocaleServer.prototype.LocaleServer_onDoChangeLocale = function(sender, e, ex)
{

	// Set locale attribute
	if (this.settings.get("settings.autoAttribute"))
	{
		let rootNode = this.settings.get("settings.autoAttribute.rootNode");
		let targetElement = ( rootNode ? document.querySelector(rootNode) : document.body );
		let attribName = this.settings.get("settings.autoAttribute.attributeName", "data-locale");

		targetElement.setAttribute(attribName, this.localeSettings["localeName"]);
	}

	// Notify locale change to clients
	return this._store.notify("*", e.detail);

}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

LocaleServer.prototype.subscribe = function(component, options)
{

	this._store.subscribe(
		`${component.name}_${component.uniqueId}`,
		this._triggerEvent.bind(component),
	);

}

// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Trigger preference changed events.
 *
 * @param	{String}		conditions			Notify conditions.
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
LocaleServer.prototype._triggerEvent = function(conditions, options)
{

	return this.skills.use("locale.change", options.localeName);

}

// ----------------------------------------------------------------------------

customElements.define("bm-locale", LocaleServer);
