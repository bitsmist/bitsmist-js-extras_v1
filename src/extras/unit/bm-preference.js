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
import ObservableStore from "../store/observable-store.js";

// =============================================================================
//	Preference Server Class
// =============================================================================

export default class PreferenceServer extends BM.Unit
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

		this._store = new ObservableStore({"items":this.get("setting", "options.defaults"), "filter":this._filter, "async":true});

		Object.keys(this.get("inventory", "resource.resources", {})).forEach((key) => {
			this._store.merge(this.get("inventory", `resource.resources.${key}`).items);
		});

	}

	// -------------------------------------------------------------------------

	PreferenceServer_onBeforeSubmit = function(sender, e, ex)
	{

		this._store.set("", e.detail.items, e.detail.options, ...e.detail.args);

		// Pass items to the latter event handlers
		e.detail.items = this._store.items;

	}

	// -------------------------------------------------------------------------

	PreferenceServer_onDoReportValidity = function(sender, e, ex)
	{

		let msg = `Invalid preference value. name=${this.tagName}`;
		Object.keys(this.get("state", "validation.validationResult.invalids")).forEach((key) => {
			msg += "\n\tkey=" + this.get("state", `validation.validationResult.invalids.${key}.key`) + ", value=" + this.get("state", `validation.validationResult.invalids.${key}.value`);
		});
		console.error(msg);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Subscribe to the Server. Get a notification when prefrence changed.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	subscribe(unit, options)
	{

		this._store.subscribe(
			`${unit.tagName}_${unit.uniqueId}`,
			this._triggerEvent.bind(unit),
			options,
		);

	}

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
	 * @param	{Object}		values				Values to store.
	 * @param	{Object}		options				Options.
	 */
	setPreference(values, options, ...args)
	{

		let validatorName = this.get("setting", "options.validatorName");

		return this.use("spell", "form.submit", {"items":values, "options":options, "args":args, "validatorName":validatorName});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Trigger preference changed events.
	 *
	 * @param	{Object}		items				Changed items.
	 *
	 * @return  {Promise}		Promise.
	 */
	_triggerEvent(changedItems, observerInfo, options)
	{

		let sender = BM.Util.safeGet(options, "sender", this);

		return this.use("spell", "preference.apply", {"sender":sender, "preferences":changedItems});

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if it is the target.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Object}		observerInfo		Observer info.
	 */
	_filter(conditions, observerInfo, ...args)
	{

		let result = false;
		let target = observerInfo["options"]["targets"];
		target = ( Array.isArray(target) ? target : [target] );

		for (let i = 0; i < target.length; i++)
		{
			if (conditions[target[i]])
			{
				result = true;
				break;
			}
		}

		return result;

	}

}

customElements.define("bm-preference", PreferenceServer);
