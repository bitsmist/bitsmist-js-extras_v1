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
//	Preference Server Class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function PreferenceServer(settings)
{

	return Reflect.construct(BM.Component, [settings], this.constructor);

}

BM.ClassUtil.inherit(PreferenceServer, BM.Component);

// -----------------------------------------------------------------------------
//	Settings
// -----------------------------------------------------------------------------

/**
 * Get component settings.
 *
 * @return  {Object}		Options.
 */
PreferenceServer.prototype._getSettings = function()
{

	return {
		// Settings
		"settings": {
			"autoClear":				false,
			"autoFill":					false,
			"autoTransform":			false,
			"name":						"PreferenceServer",
		},

		// Events
		"events": {
			"this": {
				"handlers": {
					"beforeStart":		["PreferenceServer_onBeforeStart"],
					"doFetch":			["PreferenceServer_onDoFetch"],
					"beforeSubmit":		["PreferenceServer_onBeforeSubmit"]
				}
			}
		},

		// Form
		"form": {
			"settings": {
				"autoValidate":			false,
				"autoCollect":			false,
			}
		}
	}

}

// -----------------------------------------------------------------------------
//  Event Handlers
// -----------------------------------------------------------------------------

PreferenceServer.prototype.PreferenceServer_onBeforeStart = function(sender, e, ex)
{

	this._defaults = new BM.ChainableStore();
	this._store = new ObservableStore({"chain":this._defaults, "filter":this._filter, "async":true});

}

// -----------------------------------------------------------------------------

PreferenceServer.prototype.PreferenceServer_onDoFetch = function(sender, e, ex)
{

	// Set default preferences
	if (this.settings.get("defaults.preferences"))
	{
		this._defaults.items = this.settings.get("defaults.preferences");
	}

	// Load preferences
	return this.resources["preferences"].get().then((preferences) => {
		this._store.merge(preferences);
		this.items = this._store.items;
	});

}

// -----------------------------------------------------------------------------

PreferenceServer.prototype.PreferenceServer_onBeforeSubmit = function(sender, e, ex)
{

	this._store.set("", e.detail.items, e.detail.options, ...e.detail.args);

	// Pass items to the latter event handlers
	e.detail.items = this._store.items;

}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

PreferenceServer.prototype.subscribe = function(component, options)
{

	this._store.subscribe(
		component.name + "_" + component.uniqueId,
		this._triggerEvent.bind(component),
		options,
	);

}

// -----------------------------------------------------------------------------

/**
 * Get a value from store. Return default value when specified key is not available.
 *
 * @param	{String}		key					Key to get.
 * @param	{Object}		defaultValue		Value returned when key is not found.
 *
 * @return  {*}				Value.
 */
PreferenceServer.prototype.get = function(key, defaultValue)
{

	return this._store.get(key, defaultValue);

}

// -------------------------------------------------------------------------

/**
 * Set a value to the store.
 *
 * @param	{Object}		values				Values to store.
 * @param	{Object}		options				Options.
 */
PreferenceServer.prototype.set = function(values, options, ...args)
{

	return this.submit({"items":values, "options":options, "args":args});

}

// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Trigger preference changed events.
 *
 * @param	{Object}		items				Changed items.
 *
 * @return  {Promise}		Promise.
 */
PreferenceServer.prototype._triggerEvent = function(items, options)
{

	let eventName = this.settings.get("preferences.settings.eventName", "doSetup");
	let sender = BM.Util.safeGet(options, "sender");

	return this.trigger(eventName, {"sender":sender, "items":items});

}

// -----------------------------------------------------------------------------

/**
 * Check if it is a target.
 *
 * @param	{Object}		conditions			Conditions.
 * @param	{Object}		observerInfo		Observer info.
 */
PreferenceServer.prototype._filter = function(conditions, observerInfo, ...args)
{

	let result = false;
	let target = observerInfo["options"]["targets"];

	if (target === "*")
	{
		result = true;
	}
	else
	{
		target = ( Array.isArray(target) ? target : [target] );

		for (let i = 0; i < target.length; i++)
		{
			if (conditions[target[i]])
			{
				result = true;
				break;
			}
		}
	}

	return result;

}

// ----------------------------------------------------------------------------

customElements.define("bm-preference", PreferenceServer);
