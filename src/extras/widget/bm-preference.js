// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

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

	return Reflect.construct(BITSMIST.v1.Component, [settings], this.constructor);

}

BITSMIST.v1.ClassUtil.inherit(PreferenceManager, BITSMIST.v1.Component);

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
			"hasTemplate":				false,
			"name":						"PreferenceManager",
		},

		// Organizers
		"organizers": {
			"ValidationOrganizer":		{"settings":{"attach":true}},
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
		// Validate
		return this.callOrganizers("doCheckValidity", {"item":values, "validationName":this._settings.get("settings.validationName")});
	}).then(() => {
		return this.trigger("doValidate");
	}).then(() => {
		// Validation failed?
		if (!this._validationResult["result"])
		{
			throw new Error(`PreferenceManager.set(): Validation failed. values=${JSON.stringify(values)}, invalids=${JSON.stringify(this._validationResult["invalids"])}`);
		}

		// Store
		PreferenceOrganizer._store.set("", values, options);

		// Save preferences
		if (BITSMIST.v1.Util.safeGet(options, "autoSave", this.settings.get("preferences.settings.autoSave")))
		{
			return this.resources["preferences"].put("", PreferenceOrganizer._store.localItems);
		}
	});

}

// -------------------------------------------------------------------------

customElements.define("bm-preference", PreferenceManager);
