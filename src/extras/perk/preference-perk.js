// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AttendancePerk from "../perk/attendance-perk.js";
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
	//  Event handlers
	// -------------------------------------------------------------------------

	static PreferencePerk_onDoOrganize(sender, e, ex)
	{

		return AttendancePerk.call("PreferenceServer", {"waitForAttendance":true}).then((server) => {
			BM.Util.assert(server, `PreferencePerk.PreferencePerk_onDoOrganize(): PreferenceServer doesn't exist. name=${this.tagName}`);

			return this.skills.use("state.wait", [{"object":server, "state":"started"}]).then(() => {
				server.subscribe(this, BM.Util.safeGet(e.detail, "settings.preference"));
				this.vault.set("preference.server", server);
			});
		});

	}

	// -------------------------------------------------------------------------

	static PreferencePerk_onBeforeSetup(sender, e, ex)
	{

		return this.skills.use("preference.apply", {"items":this.vault.get("preference.server").items});

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"preference",
			"order":		900,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add skills to component;
		component.skills.set("preference.apply", function(...args) { return PreferencePerk._applyPreferences(...args); });

		// Add vault items to component
		component.vault.set("preference.server");

		// Add event handlers to component
		this._addPerkHandler(component, "doOrganize", PreferencePerk.PreferencePerk_onDoOrganize);
		this._addPerkHandler(component, "beforeSetup", PreferencePerk.PreferencePerk_onBeforeSetup);

	}

}
