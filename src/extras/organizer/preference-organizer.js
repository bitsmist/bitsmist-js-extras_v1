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
//	Preference organizer class
// =============================================================================

export default class PreferenceOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"name":			"PreferenceOrganizer",
			"targetWords":	"preferences",
			"order":		900,
		};

	}

	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Init vars
		PreferenceOrganizer._defaults = new BM.ChainableStore();
		PreferenceOrganizer._store = new ObservableStore({"chain":PreferenceOrganizer._defaults, "filter":PreferenceOrganizer._filter, "async":true});
		PreferenceOrganizer.__loaded =  {};
		PreferenceOrganizer.__loaded["promise"] = new Promise((resolve, reject) => {
			PreferenceOrganizer.__loaded["resolve"] = resolve;
			PreferenceOrganizer.__loaded["reject"] = reject;
		});

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Register component as an observer
		PreferenceOrganizer._store.subscribe(component.name + "_" + component.uniqueId, PreferenceOrganizer._triggerEvent.bind(component), {"targets":BM.Util.safeGet(options, "preferences.targets")});

		// Add event handlers to component
		this._addOrganizerHandler(component, "afterLoadSettings", PreferenceOrganizer.onAfterLoadSettings);

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	static onAfterLoadSettings(sender, e, ex)
	{

		let chain = Promise.resolve();

		// Set default preferences
		if (BM.Util.safeGet(e.detail.settings, "preferences.defaults"))
		{
			PreferenceOrganizer._defaults.items = this.settings.get("preferences.defaults");
		}

		// Load preferences
		if (BM.Util.safeGet(e.detail.settings, "preferences.settings.autoLoad"))
		{
			chain = this.resources["preferences"].get().then((preferences) => {
				PreferenceOrganizer._store.merge(preferences);
				PreferenceOrganizer.__loaded.resolve();
			});
		}

		// Wait for preference to be loaded
		let timer;
		return chain.then(() => {
			let timeout = this.settings.get("system.preferenceTimeout", 10000);
			timer = setTimeout(() => {
				throw new ReferenceError(`Time out waiting for loading preferences. name=${this.name}`);
			}, timeout);
			return PreferenceOrganizer.__loaded.promise;
		}).then(() => {
			clearTimeout(timer);
		});

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
 	 * Trigger preference changed events.
	 *
	 * @param	{Object}		item				Changed items.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _triggerEvent(item)
	{

		let eventName = this.settings.get("preferences.settings.eventName", "doSetup");

		return this.trigger(eventName, {"sender":PreferenceOrganizer, "item":item});

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if it is a target.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Object}		options				Options.
	 */
	static _filter(conditions, options)
	{

		let result = false;
		let target = options["targets"];

		if (target === "*")
		{
			result = true;
		}
		else
		{
			target = ( Array.isArray(target) ? target : [target] );

			for (let i = 0; i < target.length; i++)
			{
				if (conditions[target[i]])
				{
					result = true;
					break;
				}
			}
		}

		return result;

	}

}
