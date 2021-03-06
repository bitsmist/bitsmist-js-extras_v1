// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ObservableStoreMixin from "../store/observable-store-mixin";
class ObservableChainableStore extends ObservableStoreMixin(BITSMIST.v1.ChainableStore) {};

// =============================================================================
//	Preference organizer class
// =============================================================================

export default class PreferenceOrganizer extends BITSMIST.v1.Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Global init.
	 */
	static globalInit()
	{

		// Init vars
		PreferenceOrganizer._defaults = new BITSMIST.v1.ChainableStore();
		PreferenceOrganizer._store = new ObservableChainableStore({"chain":PreferenceOrganizer._defaults, "filter":PreferenceOrganizer._filter, "async":true});
		PreferenceOrganizer.__loaded =  {};
		PreferenceOrganizer.__loaded["promise"] = new Promise((resolve, reject) => {
			PreferenceOrganizer.__loaded["resolve"] = resolve;
			PreferenceOrganizer.__loaded["reject"] = reject;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Init.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 */
	static init(conditions, component, settings)
	{

		// Register a component as an observer
		PreferenceOrganizer._store.subscribe(component.name + "_" + component.uniqueId, PreferenceOrganizer._triggerEvent.bind(component), {"targets":BITSMIST.v1.Util.safeGet(settings, "preferences.targets")});

	}

	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(conditions, component, settings)
	{

		let chain = Promise.resolve();

		// Set default preferences
		if (component.settings.get("preferences.defaults"))
		{
			PreferenceOrganizer._defaults.items = component.settings.get("preferences.defaults");
		}

		// Load preferences
		if (component.settings.get("preferences.settings.load"))
		{
			chain = PreferenceOrganizer.load(component).then((preferences) => {
				PreferenceOrganizer._store.merge(preferences);
				PreferenceOrganizer.__loaded.resolve();
			});
		}

		// Wait for preference to be loaded
		let timer;
		return chain.then(() => {
			let timeout = component.settings.get("system.preferenceTimeout", 10000);
			timer = setTimeout(() => {
				throw new ReferenceError(`Time out waiting for loading preferences. name=${component.name}`);
			}, timeout);
			return PreferenceOrganizer.__loaded.promise;
		}).then(() => {
			clearTimeout(timer);
			return settings;
		});

	}

	// -------------------------------------------------------------------------

	/**
 	 * Load preferences.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static load(component, options)
	{

		let sender = ( options && options["sender"] ? options["sender"] : component );

		return component.trigger("doLoadStore", sender);

	}

	// -------------------------------------------------------------------------

	/**
 	 * Save preferences.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static save(component, options)
	{

		let sender = ( options && options["sender"] ? options["sender"] : component );

		return component.trigger("doSaveStore", sender, {"data":PreferenceOrganizer._store.items});

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
 	 * Load preferences.
	 *
	 * @param	{Array}			keys				Changed keys.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _triggerEvent(keys)
	{

		let eventName = this.settings.get("preferences.settings.eventName", "doSetup");

		return this.trigger(eventName, PreferenceOrganizer, {"keys":keys});

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

		if (target == "*")
		{
			result = true;
		}
		else
		{
			target = ( Array.isArray(target) ? target : [target] );
			conditions = ( Array.isArray(conditions) ? conditions : [conditions] );

			for (let i = 0; i < target.length; i++)
			{
				if (conditions.indexOf(target[i]) > -1)
				{
					result = true;
					break;
				}
			}
		}

		return result;

	}

}
