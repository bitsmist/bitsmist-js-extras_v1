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
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Apply preferences.
	 *
     * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static _applyPreferences(component, options)
	{

		return Promise.resolve().then(() => {
			return component.skills.use("event.trigger", "beforeApplyPreferences", options);
		}).then(() => {
			return component.skills.use("event.trigger", "doApplyPreferences", options);
		}).then(() => {
			return component.skills.use("event.trigger", "afterApplyPreferences", options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get preferences.
	 *
     * @param	{Component}		component			Component.
	 * @param	{String}		target				Preference name to get.
	 * @param	{*}				defaultValue		Value returned when key is not found.
	 */
	static _getPreferences(component, key, defaultValue)
	{

		if (key)
		{
			return component.vault.get("preference.server").get(key, defaultValue);
		}
		else
		{
			return component.vault.get("preference.server").items;
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply preferences.
	 *
     * @param	{Component}		component			Component.
	 * @param	{Object}		preferences 		Preferences to set.
	 * @param	{Object}		options				Options.
	 */
	static _setPreferences(component, preferences, options)
	{

		return component.vault.get("preference.server").set(preferences, options, {"sender":component});

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/*
	static PreferencePerk_onDoApplySettings(sender, e, ex)
	{

		return this.skills.use("rollcall.call", "PreferenceServer", {"waitForAttendance":true}).then((server) => {
			BM.Util.assert(server, `PreferencePerk.PreferencePerk_onDoApplySettings(): PreferenceServer doesn't exist. name=${this.tagName}`);

			return this.skills.use("state.wait", [{"object":server, "state":"started"}]).then(() => {
				server.subscribe(this, BM.Util.safeGet(e.detail, "settings.preference"));
				this.vault.set("preference.server", server);
			});
		});

	}
	*/

	static PreferencePerk_onDoApplySettings(sender, e, ex)
	{

		let rootNode = this.skills.use("alias.resolve", "PreferenceServer")["rootNode"] || "bm-preference";

		return this.skills.use("state.wait", [{"rootNode":rootNode, "state":"started"}]).then(() => {
			let server = document.querySelector(rootNode);
			server.subscribe(this, BM.Util.safeGet(e.detail, "settings.preference"));
			this.vault.set("preference.server", server);
		});

	}

	// -------------------------------------------------------------------------

	static PreferencePerk_onBeforeSetup(sender, e, ex)
	{

		e.detail.preferences = this.vault.get("preference.server").items;

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
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

	static init(component, options)
	{

		// Upgrade component
		this.upgrade(component, "skill", "preference.apply", function(...args) { return PreferencePerk._applyPreferences(...args); });
		this.upgrade(component, "skill", "preference.set", function(...args) { return PreferencePerk._setPreferences(...args); });
		this.upgrade(component, "skill", "preference.get", function(...args) { return PreferencePerk._getPreferences(...args); });
		this.upgrade(component, "vault", "preference.server");
		this.upgrade(component, "event", "doApplySettings", PreferencePerk.PreferencePerk_onDoApplySettings);
		this.upgrade(component, "event", "beforeSetup", PreferencePerk.PreferencePerk_onBeforeSetup);

	}

}
