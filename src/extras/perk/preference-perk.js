// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import {Perk, Util} from "@bitsmist-js_v1/core";

// =============================================================================
//	Preference Perk class
// =============================================================================

export default class PreferencePerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":		"preference",
		"order":			900,
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
		unit.upgrade("skill", "preference.get", PreferencePerk.#_getPreferences);
		unit.upgrade("spell", "preference.set", PreferencePerk.#_setPreferences);
		unit.upgrade("spell", "preference.apply", PreferencePerk.#_applyPreferences);

		// Add event handlers
		unit.use("event.add", "doApplySettings", {"handler":PreferencePerk.#PreferencePerk_onDoApplySettings, "order":PreferencePerk.info["order"]});
		unit.use("event.add", "afterTransform", {"handler":PreferencePerk.#PreferencePerk_onAfterTransform, "order":PreferencePerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//  Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #PreferencePerk_onDoApplySettings(sender, e, ex)
	{

		let serverNode = this.get("setting", "preference.options.preferenceServer", this.get("setting", "system.preference.options.preferenceServer"));
		serverNode = ( serverNode === true ? "bm-preference" : serverNode );

		Util.assert(serverNode, () => `Preference Server node not specified in settings. name=${this.tagName}`);

		return this.cast("status.wait", [serverNode]).then(() => {
			let server = document.querySelector(serverNode);
			server.use("notification.subscribe", this, {"settings": Util.safeGet(e.detail, "settings.preference")});
			PreferencePerk.#__vault.get(this)["server"] = server;
		});

	}

	// -------------------------------------------------------------------------

	static #PreferencePerk_onAfterTransform(sender, e, ex)
	{

		return this.cast("preference.apply", {"preferences":PreferencePerk.#__vault.get(this)["server"].items});

	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
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
	//  Spells (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Apply preferences.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static async #_applyPreferences(unit, options)
	{

		console.debug(`PreferencePerk.#_applyPreferences(): Applying preferences. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "beforeApplyPreferences", options);
		await unit.cast("event.trigger", "doApplyPreferences", options);
		console.debug(`PreferencePerk.#_applyPreferences(): Applied preferences. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "afterApplyPreferences", options);

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

		return PreferencePerk.#__vault.get(unit)["server"].setPreference(preferences, {"sender":unit});

	}

}
