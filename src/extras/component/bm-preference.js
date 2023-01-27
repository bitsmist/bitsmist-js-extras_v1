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
import PreferenceOrganizer from "../organizer/preference-organizer.js";

// =============================================================================
//	Preference manager class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function PreferenceManager(settings)
{

	return Reflect.construct(BM.Component, [settings], this.constructor);

}

BM.ClassUtil.inherit(PreferenceManager, BM.Component);

// -----------------------------------------------------------------------------

/**
 * Get component settings.
 *
 * @return  {Object}		Options.
 */
PreferenceManager.prototype._getSettings = function()
{

	return {
		// Settings
		"settings": {
			"autoRefresh":				false,
			"autoSetup":				false,
			"hasTemplate":				false,
			"name":						"PreferenceManager",
		},

		// Organizers
		"organizers": {
			"FormOrganizer":			{"settings":{"attach":true}},
		}
	}

}

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Preference items.
 *
 * @type	{Object}
 */
Object.defineProperty(PreferenceManager.prototype, "items", {
	get()
	{
		return PreferenceOrganizer._store.items;
	},
})

// -----------------------------------------------------------------------------

/**
 * Get a value from store. Return default value when specified key is not available.
 *
 * @param	{String}		key					Key to get.
 * @param	{Object}		defaultValue		Value returned when key is not found.
 *
 * @return  {*}				Value.
 */
PreferenceManager.prototype.get = function(key, defaultValue)
{

	return PreferenceOrganizer._store.get(key, defaultValue);

}

// -------------------------------------------------------------------------

/**
 * Set a value to the store.
 *
 * @param	{Object}		values				Values to store.
 * @param	{Object}		options				Options.
 */
PreferenceManager.prototype.set = function(values, options)
{

	this._validationResult["result"] = true;

	Promise.resolve().then(() => {
		return this.trigger("doValidate", {"items":values, "options":options});
	}).then(() => {
		// Validation failed?
		if (!this.validationResult["result"])
		{
			throw new Error(`PreferenceManager.set(): Validation failed. values=${JSON.stringify(values)}, invalids=${JSON.stringify(this._validationResult["invalids"])}`);
		}

		// Store
		PreferenceOrganizer._store.set("", values, options);

		// Save preferences
		if (BM.Util.safeGet(options, "autoSave", this.settings.get("preferences.settings.autoSave")))
		{
			return this.resources["preferences"].put("", PreferenceOrganizer._store.localItems);
		}
	});

}

// -------------------------------------------------------------------------

customElements.define("bm-preference", PreferenceManager);
