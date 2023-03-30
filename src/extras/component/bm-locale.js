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
			"autoClear":				false,
			"autoFill":					false,
			"autoTransform":			false,
			"name":						"LocaleServer",
		},

		// Events
		"events": {
			"this": {
				"handlers": {
					"doFetch":			["LocaleServer_onDoFetch"],
					"beforeStart":		["LocaleServer_onBeforeStart"],
					"doChangeLocale":	["LocaleServer_onDoChangeLocale"],
				}
			}
		},

		// Locales
		"locales": {
			"default": {
				"handlerClassName":		"BITSMIST.v1.LocaleHandler",
			}
		}
	}

}

// -----------------------------------------------------------------------------
//  Event Handlers
// -----------------------------------------------------------------------------

LocaleServer.prototype.LocaleServer_onBeforeStart = function(sender, e, ex)
{

	this._localeName;
	this._store = new ObservableStore({"async":true});

}

// -----------------------------------------------------------------------------

LocaleServer.prototype.LocaleServer_onDoFetch = function(sender, e, ex)
{

	if ("items" in e.detail)
	{
		this._localeHandler.messages.items = e.detail.items;
	}

}

// -----------------------------------------------------------------------------

LocaleServer.prototype.LocaleServer_onDoChangeLocale = function(sender, e, ex)
{

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

	component.localeName = this.localeName;

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

	return this.trigger("doChangeLocale", options);

}

// ----------------------------------------------------------------------------

customElements.define("bm-locale", LocaleServer);
