// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

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
		PreferenceOrganizer.__preferences = new BITSMIST.v1.Store();
		PreferenceOrganizer.__observers = new BITSMIST.v1.ObserverStore({"filter":PreferenceOrganizer.__filter});
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

		// Add properties
		Object.defineProperty(component, 'preferences', {
			get() { return this._preferences; },
		});

		// Add methods
		component.loadPreferences = function() { return PreferenceOrganizer._load(this); }
		component.savePreferences = function() { return PreferenceOrganizer._save(this); }
		component.setupAll = function(options) { return PreferenceOrganizer._setup(this, options); }

		// Init vars
		component._preferences = PreferenceOrganizer.__preferences;

		// Load defaults from settings if any
		if (component.settings.items["preferences"]["load"])
		{
			PreferenceOrganizer.__preferences.items = component.settings.items["preferences"]["defaults"];
		}

		PreferenceOrganizer._register(component);

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

		let preferences = component.settings.items["preferences"];
		if (preferences["load"])
		{
			PreferenceOrganizer.__preferences.items = component.settings.items["preferences"]["defaults"];

			// Load preferences
			chain = PreferenceOrganizer._load(component).then((preferences) => {;
				// Merge preferences
				PreferenceOrganizer.__preferences.merge(preferences);
				PreferenceOrganizer.__loaded.resolve();
			});
		}

		return chain.then(() => {
			PreferenceOrganizer.__loaded.promise.then(() => {
				let options = {"newPreferences":PreferenceOrganizer.__preferences.items};

				return component.setup(options);
			}).then(() => {
				return settings;
			});
		});

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	* Apply settings.
	*
	* @param	{Object}		options				Options.
	*
	* @return  {Promise}		Promise.
	*/
	static _setup(component, options)
	{

		options = Object.assign({}, options);
		let sender = ( options["sender"] ? options["sender"] : this );

		return PreferenceOrganizer.__observers.notify("setup", options).then(() => {
			if (options["newPreferences"])
			{
				PreferenceOrganizer.__preferences.merge(options["newPreferences"]);
				PreferenceOrganizer._save(component);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	* Register target component.
	*
	* @param	{Component}		component			Component to notify.
	* @param	{Object}		targets				Targets.
	*
	* @return  {Promise}		Promise.
	*/
	static _register(component, targets)
	{

		PreferenceOrganizer.__observers.set(component.uniqueId, {"object":component, "targets":targets});

	}

	// -------------------------------------------------------------------------

	/**
	* Deregister target component.
	*
	* @param	{Component}		component			Component to notify.
	*
	* @return  {Promise}		Promise.
	*/
	static _deregister(component)
	{

		PreferenceOrganizer.__observers.remove(component.uniqueId);

	}

	// -------------------------------------------------------------------------

	/**
	* Load items.
	*
	* @param	{Object}		options				Options.
	*
	* @return  {Promise}		Promise.
	*/
	static _load(component, options)
	{

		let sender = ( options && options["sender"] ? options["sender"] : component );

		return component.trigger("doLoadStore", sender);

	}

	// -------------------------------------------------------------------------

	/**
	* Save items.
	*
	* @param	{Object}		options				Options.
	*
	* @return  {Promise}		Promise.
	*/
	static _save(component, options)
	{

		let sender = ( options && options["sender"] ? options["sender"] : component );

		return component.trigger("doSaveStore", sender, {"data":PreferenceOrganizer.__preferences.items});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	* Check if it is a target.
	*
	* @param	{Object}		conditions			Conditions.
	* @param	{Object}		target				Target to check.
	*/
	static __filter(conditions, info)
	{

		return true;

		/*
		let result = false;
		let target = info["targets"];

		// if (target == "*")
		// {
		// 	return true;
		// }

		for (let i = 0; i < target.length; i++)
		{
			if (conditions["newPreferences"].hasOwnProperty(target[i]))
			{
				result = true;
				break;
			}
		}

		return result;
		*/

	}

}
