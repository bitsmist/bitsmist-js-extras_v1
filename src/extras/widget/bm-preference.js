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

	return Reflect.construct(BITSMIST.v1.Pad, [settings], this.constructor);

}

BITSMIST.v1.ClassUtil.inherit(PreferenceManager, BITSMIST.v1.Component);

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
 * @param	{String}		key					Key to store.
 * @param	{Object}		value				Value to store.
 * @param	{Object}		options				Options.
 */
PreferenceManager.prototype.set = function(key, value, options)
{

	PreferenceOrganizer._store.set(key, value);

	// Save preferences
	if (BITSMIST.v1.Util.safeGet(options, "autoSave", this.settings.get("preferences.settings.autoSave")))
	{
		return this.resources["preferences"].update("", PreferenceOrganizer._store.items);
	}

}

// -------------------------------------------------------------------------

customElements.define("bm-preference", PreferenceManager);
