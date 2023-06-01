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

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/*
	static PreferencePerk_onDoApplySettings(sender, e, ex)
	{

		return this.use("skill", "rollcall.call", "PreferenceServer", {"waitForAttendance":true}).then((server) => {
			BM.Util.assert(server, `PreferencePerk.PreferencePerk_onDoApplySettings(): PreferenceServer doesn't exist. name=${this.tagName}`);

			return this.use("skill", "state.wait", [{"object":server, "state":"started"}]).then(() => {
				server.subscribe(this, BM.Util.safeGet(e.detail, "settings.preference"));
				this.set("vault", "preference.server", server);
			});
		});

	}
	*/

	static PreferencePerk_onDoApplySettings(sender, e, ex)
	{

		let rootNode = this.use("skill", "alias.resolve", "PreferenceServer")["rootNode"] || "bm-preference";

		return this.use("skill", "state.wait", [{"rootNode":rootNode, "state":"started"}]).then(() => {
			let server = document.querySelector(rootNode);
			server.subscribe(this, BM.Util.safeGet(e.detail, "settings.preference"));
			this.set("vault", "preference.server", server);
		});

	}

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
     * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static _applyPreferences(component, options)
	{

		return Promise.resolve().then(() => {
			return component.use("skill", "event.trigger", "beforeApplyPreferences", options);
		}).then(() => {
			return component.use("skill", "event.trigger", "doApplyPreferences", options);
		}).then(() => {
			return component.use("skill", "event.trigger", "afterApplyPreferences", options);
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
			return component.get("vault", "preference.server").getPreference(key, defaultValue);
		}
		else
		{
			return component.get("vault", "preference.server").items;
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

		return component.get("vault", "preference.server").setPreference(preferences, options, {"sender":component});

	}

}
