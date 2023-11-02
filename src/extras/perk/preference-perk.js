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

// =============================================================================
//	Preference Perk class
// =============================================================================

export default class PreferencePerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"section":		"preference",
		"order":		900,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return PreferencePerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Init unit vault
		PreferencePerk.#__vault.set(unit, {
			"server":	null,
		});

		// Upgrade unit
		unit.upgrade("skill", "preference.get", function(...args) { return PreferencePerk.#_getPreferences(...args); });
		unit.upgrade("spell", "preference.set", function(...args) { return PreferencePerk.#_setPreferences(...args); });
		unit.upgrade("spell", "preference.apply", function(...args) { return PreferencePerk.#_applyPreferences(...args); });
		unit.upgrade("event", "doApplySettings", PreferencePerk.#PreferencePerk_onDoApplySettings, {"order":PreferencePerk.info["order"]});
		unit.upgrade("event", "doSetup", PreferencePerk.#PreferencePerk_onDoSetup, {"order":PreferencePerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	static #PreferencePerk_onDoApplySettings(sender, e, ex)
	{

		let serverNode = this.get("setting", "preference.options.preferenceServer", this.get("setting", "system.preference.options.preferenceServer"));
		serverNode = ( serverNode === true ? "bm-preference" : serverNode );

		BM.Util.assert(serverNode, `Preference Server node not specified in settings. name=${this.tagName}`);

		return this.use("spell", "status.wait", [serverNode]).then(() => {
			let server = document.querySelector(serverNode);
			server.subscribe(this, BM.Util.safeGet(e.detail, "settings.preference"));
			PreferencePerk.#__vault.get(this)["server"] = server;
		});

	}

	// -------------------------------------------------------------------------

	static #PreferencePerk_onDoSetup(sender, e, ex)
	{

		return this.use("spell", "preference.apply", {"preferences":PreferencePerk.#__vault.get(this)["server"].items});

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Apply preferences.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #_applyPreferences(unit, options)
	{

		return Promise.resolve().then(() => {
			console.debug(`PreferencePerk.#_applyPreferences(): Applying preferences. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "event.trigger", "beforeApplyPreferences", options);
		}).then(() => {
			return unit.use("spell", "event.trigger", "doApplyPreferences", options);
		}).then(() => {
			console.debug(`PreferencePerk.#_applyPreferences(): Applied preferences. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "event.trigger", "afterApplyPreferences", options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get preferences.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{String}		target				Preference name to get.
	 * @param	{*}				defaultValue		Value returned when key is not found.
	 */
	static #_getPreferences(unit, key, defaultValue)
	{

		if (key)
		{
			return PreferencePerk.#__vault.get(unit)["server"].getPreference(key, defaultValue);
		}
		else
		{
			return PreferencePerk.#__vault.get(unit)["server"].items;
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply preferences.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		preferences 		Preferences to set.
	 * @param	{Object}		options				Options.
	 */
	static #_setPreferences(unit, preferences, options)
	{

		return PreferencePerk.#__vault.get(unit)["server"].setPreference(preferences, options, {"sender":unit});

	}

}
