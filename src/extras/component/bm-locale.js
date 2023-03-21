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
				}
			}
		},

		// Locales
		"locales": {
			"settings": {
				"handlerClassName":		"BITSMIST.v1.LocaleHandler",
			}
		}
	}

}

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Locale.
 *
 * @type	{Object}
 */
Object.defineProperty(LocaleServer.prototype, 'localeName', {
	get()
	{
		return this._localeName;
	},
	set(value)
	{
		return this._triggerEvent("*", {"localeName":value}).then(() => {
			return this._store.notify("*", {"localeName":value});
		}).then(() => {
			this._localeName = value;
		});
	}
})

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

	this._localeHandler.messages.items = e.detail.items;

}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

LocaleServer.prototype.subscribe = function(component, options)
{

	this._store.subscribe(
		component.name + "_" + component.uniqueId,
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

	return Promise.resolve().then(() => {
		return this.trigger("beforeLocale", options);
	}).then(() => {
		return this.trigger("doLocale", options);
	}).then(() => {
		return this.trigger("afterLocale", options);
	});

}

// ----------------------------------------------------------------------------

customElements.define("bm-locale", LocaleServer);
