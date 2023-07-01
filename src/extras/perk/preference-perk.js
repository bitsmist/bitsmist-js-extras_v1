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
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"preference",
			"order":		900,
			"depends":		"AliasPerk",
			//"depends":		"RollCallPerk",
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		this.upgrade(unit, "skill", "preference.get", function(...args) { return PreferencePerk._getPreferences(...args); });
		this.upgrade(unit, "spell", "preference.set", function(...args) { return PreferencePerk._setPreferences(...args); });
		this.upgrade(unit, "spell", "preference.apply", function(...args) { return PreferencePerk._applyPreferences(...args); });
		this.upgrade(unit, "vault", "preference.server");
		this.upgrade(unit, "event", "doApplySettings", PreferencePerk.PreferencePerk_onDoApplySettings);
		this.upgrade(unit, "event", "beforeSetup", PreferencePerk.PreferencePerk_onBeforeSetup);

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/*
	static PreferencePerk_onDoApplySettings(sender, e, ex)
	{

		return this.use("spell", "rollcall.call", "PreferenceServer", {"waitForAttendance":true}).then((server) => {
			BM.Util.assert(server, `PreferencePerk.PreferencePerk_onDoApplySettings(): PreferenceServer doesn't exist. name=${this.tagName}`);

			return this.use("spell", "status.wait", [{"object":server, "status":"started"}]).then(() => {
				server.subscribe(this, BM.Util.safeGet(e.detail, "settings.preference"));
				this.set("vault", "preference.server", server);
			});
		});

	}
	*/

	static PreferencePerk_onDoApplySettings(sender, e, ex)
	{

		let rootNode = this.use("skill", "alias.resolve", "PreferenceServer")["rootNode"] || "bm-preference";

		return this.use("spell", "status.wait", [{"rootNode":rootNode, "status":"started"}]).then(() => {
			let server = document.querySelector(rootNode);
			server.subscribe(this, BM.Util.safeGet(e.detail, "settings.preference"));
			this.set("vault", "preference.server", server);
		});

	}

/*
	static PreferencePerk_onDoApplySettings(sender, e, ex)
	{

		return this.get("inventory", "promise.documentReady").then(() => {
			let rootNode = this.use("skill", "alias.resolve", "PreferenceServer")["rootNode"] || "bm-preference";
			let server = document.querySelector(rootNode);
			if (server)
			{
				return this.use("spell", "status.wait", [{"rootNode":rootNode, "status":"started"}]).then(() => {
					let server = document.querySelector(rootNode);
					server.subscribe(this, BM.Util.safeGet(e.detail, "settings.preference"));
					this.set("vault", "preference.server", server);
				});
			}
		});

	}
	*/

	// -------------------------------------------------------------------------

	static PreferencePerk_onBeforeSetup(sender, e, ex)
	{

		e.detail.preferences = this.get("vault", "preference.server").items;

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
	static _applyPreferences(unit, options)
	{

		return Promise.resolve().then(() => {
			console.debug(`PreferencePerk._applyPreferences(): Applying preferences. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "event.trigger", "beforeApplyPreferences", options);
		}).then(() => {
			return unit.use("spell", "event.trigger", "doApplyPreferences", options);
		}).then(() => {
			console.debug(`PreferencePerk._applyPreferences(): Applied preferences. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
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
	static _getPreferences(unit, key, defaultValue)
	{

		if (key)
		{
			return unit.get("vault", "preference.server").getPreference(key, defaultValue);
		}
		else
		{
			return unit.get("vault", "preference.server").items;
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
	static _setPreferences(unit, preferences, options)
	{

		return unit.get("vault", "preference.server").setPreference(preferences, options, {"sender":unit});

	}

}
