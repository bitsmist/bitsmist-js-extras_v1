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

export default function PreferenceServer(settings)
{

	return Reflect.construct(BM.Component, [settings], this.constructor);

}

BM.ClassUtil.inherit(PreferenceServer, BM.Component);

// -----------------------------------------------------------------------------
//	Settings
// -----------------------------------------------------------------------------

PreferenceServer.prototype._getSettings = function()
{

	return {
		// Setting
		"setting": {
			"autoTransform":			false,
			"name":						"PreferenceServer",
		},

		// Event
		"event": {
			"this": {
				"handlers": {
					"beforeStart":		["PreferenceServer_onBeforeStart"],
					"doFetch":			["PreferenceServer_onDoFetch"],
					"beforeSubmit":		["PreferenceServer_onBeforeSubmit"],
					"doReportValidity":	["PreferenceServer_onDoReportValidity"]
				}
			}
		},

		// Form
		"form": {
			"settings": {
				"autoCollect":			false,
				"autoCrop":				false,
			}
		},

		// Attendance
		"attendance": {
			"locale": {
				"name": 				"PreferenceServer",
			}
		}
	}

}

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Preferences.
 *
 * @type	{Object}
 */
Object.defineProperty(PreferenceServer.prototype, 'items', {
	get()
	{
		return this._store.items;
	}
})

// -----------------------------------------------------------------------------
//  Event Handlers
// -----------------------------------------------------------------------------

PreferenceServer.prototype.PreferenceServer_onBeforeStart = function(sender, e, ex)
{

	this._defaults = new BM.ChainableStore({"items":this.settings.get("setting.defaults")});
	this._store = new ObservableStore({"chain":this._defaults, "filter":this._filter, "async":true});

}

// -----------------------------------------------------------------------------

PreferenceServer.prototype.PreferenceServer_onDoFetch = function(sender, e, ex)
{

	if ("items" in e.detail)
	{
		this._store.items = e.detail.items;
	}

}

// -----------------------------------------------------------------------------

PreferenceServer.prototype.PreferenceServer_onBeforeSubmit = function(sender, e, ex)
{

	this._store.set("", e.detail.items, e.detail.options, ...e.detail.args);

	// Pass items to the latter event handlers
	e.detail.items = this._store.items;

}

// -----------------------------------------------------------------------------

PreferenceServer.prototype.PreferenceServer_onDoReportValidity = function(sender, e, ex)
{

	let msg = `Invalid preference value. name=${this.name}`;
	Object.keys(this.stats.get("validation.validationResult.invalids")).forEach((key) => {
		msg += "\n\tkey=" + this.stats.get(`validation.validationResult.invalids.${key}.key`) + ", value=" + this.stats.get(`validation.validationResult.invalids.${key}.value}`);
	});
	console.error(msg);

}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

PreferenceServer.prototype.subscribe = function(component, options)
{

	this._store.subscribe(
		`${component.name}_${component.uniqueId}`,
		this._triggerEvent.bind(component),
		options,
	);

}

// -----------------------------------------------------------------------------

/**
 * Get the value from store. Return default value when specified key is not available.
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
 * Set the value to the store.
 *
 * @param	{Object}		values				Values to store.
 * @param	{Object}		options				Options.
 */
PreferenceServer.prototype.set = function(values, options, ...args)
{

	let validatorName = this.settings.get("setting.validatorName");

	return this.skills.use("form.submit", {"items":values, "options":options, "args":args, "validatorName":validatorName});

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
PreferenceServer.prototype._triggerEvent = function(changedItems, options)
{

	let eventName = this.settings.get("setting.eventName", "doSetup");
	let sender = BM.Util.safeGet(options, "sender");

	return this.skills.use("event.trigger", eventName, {"sender":sender, "items":changedItems});

}

// -----------------------------------------------------------------------------

/**
 * Check if it is the target.
 *
 * @param	{Object}		conditions			Conditions.
 * @param	{Object}		observerInfo		Observer info.
 */
PreferenceServer.prototype._filter = function(conditions, observerInfo, ...args)
{

	let result = false;
	let target = observerInfo["options"]["targets"];
	target = ( Array.isArray(target) ? target : [target] );

	for (let i = 0; i < target.length; i++)
	{
		if (conditions[target[i]])
		{
			result = true;
			break;
		}
	}

	return result;

}

// ----------------------------------------------------------------------------

customElements.define("bm-preference", PreferenceServer);
