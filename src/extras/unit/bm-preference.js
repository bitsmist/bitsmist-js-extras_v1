// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import {Store, Unit, Util} from "@bitsmist-js_v1/core";

// =============================================================================
//	Preference Server Class
// =============================================================================

export default class PreferenceServer extends Unit
{

	// -------------------------------------------------------------------------
	//	Settings
	// -------------------------------------------------------------------------

	_getSettings()
	{

		return {
			"basic": {
				"options": {
					"autoRefresh":					false,
				}
			},
			"event": {
				"events": {
					"this": {
						"handlers": {
							"beforeStart":			["PreferenceServer_onBeforeStart"],
							"beforeSubmit":			["PreferenceServer_onBeforeSubmit"],
							"afterSubmit":			["PreferenceServer_onAfterSubmit"],
							"doReportValidity":		["PreferenceServer_onDoReportValidity"]
						}
					}
				}
			},
			"form": {
				"options": {
					"autoCollect":					false,
					"autoCrop":						false,
				}
			},
			"notification": {
				"options": {
					"filter":						PreferenceServer.#__filter,
					"cast":							"preference.apply",
				}
			},
			"skin": {
				"options": {
					"hasSkin":						false,
				}
			},
			"style": {
				"options": {
					"hasStyle":						false,
				}
			},
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Preferences.
	 *
	 * @type	{Object}
	 */
	get items()
	{

		return this._store.items;

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	PreferenceServer_onBeforeStart = function(sender, e, ex)
	{

		// Create a store to hold preferences
		this._store = new Store({"items":this.get("setting", "options.defaults")});

		// Merge preferences from resources
		Object.keys(this.get("inventory", "resource.resources", {})).forEach((key) => {
			this._store.merge(this.get("inventory", `resource.resources.${key}`).items);
		});

	}

	// -------------------------------------------------------------------------

	PreferenceServer_onBeforeSubmit = async function(sender, e, ex)
	{

		// Merge changed preferences to the store
		this._store.merge(e.detail.changedItems);

		// Pass all items to the latter event handlers to save them
		e.detail.items = this._store.items;

	}

	// -------------------------------------------------------------------------

	PreferenceServer_onAfterSubmit = async function(sender, e, ex)
	{

		// Notify the preference changes to subscribers, passing only changed items
		await this.cast("notification.notify", {"sender":Util.safeGet(e.detail.options, "sender", this), "preferences":e.detail.changedItems});

	}

	// -------------------------------------------------------------------------

	PreferenceServer_onDoReportValidity = function(sender, e, ex)
	{

		let msg = `Invalid preference value. name=${this.tagName}`;
		Object.keys(this.get("inventory", "validation.validationResult.invalids")).forEach((key) => {
			msg += "\n\tkey=" + this.get("inventory", `validation.validationResult.invalids.${key}.key`) + ", value=" + this.get("inventory", `validation.validationResult.invalids.${key}.value`);
		});
		console.error(msg);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Get the value from store. Return default value when specified key is not available.
	 *
	 * @param	{String}		key					Key to get.
	 * @param	{Object}		defaultValue		Value returned when key is not found.
	 *
	 * @return  {*}				Value.
	 */
	getPreference(key, defaultValue)
	{

		return this._store.get(key, defaultValue);

	}

	// -------------------------------------------------------------------------

	/**
	 * Set the value to the store.
	 *
	 * @param	{Object}		preferences			New preferences.
	 * @param	{Object}		options				Options.
	 */
	async setPreference(preferences, options)
	{

		await this.cast("form.submit", {
			"items":			preferences,
			"changedItems":		preferences,
			"options":			options,
			"validatorName":	this.get("setting", "options.validatorName")
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Check if it is the target.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Object}		observerInfo		Observer info.
	 */
	static #__filter(conditions, observerInfo, ...args)
	{

		let result = false;
		let target = observerInfo["options"]["settings"]["targets"];
		target = ( Array.isArray(target) ? target : [target] );

		for (let i = 0; i < target.length; i++)
		{
			if (conditions["preferences"][target[i]])
			{
				result = true;
				break;
			}
		}

		return result;

	}

}

customElements.define("bm-preference", PreferenceServer);
