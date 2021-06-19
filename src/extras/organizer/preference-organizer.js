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
		PreferenceOrganizer.__observers = new BITSMIST.v1.ObservableStore({"filter":PreferenceOrganizer.__filter});
		PreferenceOrganizer.__loaded =  {};
		PreferenceOrganizer.__loaded["promise"] = new Promise((resolve, reject) => {
			PreferenceOrganizer.__loaded["resolve"] = resolve;
			PreferenceOrganizer.__loaded["reject"] = reject;
			setTimeout(() => {
				reject(`Time out waiting for loading preferences.`);
			}, 10000);
		});
		Object.defineProperty(PreferenceOrganizer, 'preferences', {
			get() { return PreferenceOrganizer.__preferences; },
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

		// Init vars
		component._preferences = new PreferenceExporter(component);

		// Register a component as an observer
		PreferenceOrganizer.__observers.subscribe(component.uniqueId, component.setup.bind(component), {"targets":BITSMIST.v1.Util.safeGet(settings, "preferences.targets")});

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

		if (component.settings.get("preferences.load"))
		{
			// Set default preferences if any
			PreferenceOrganizer.__preferences.items = component.settings.get("preferences.defaults");

			// Load preferences
			chain = PreferenceOrganizer._load(component).then((preferences) => {
				// Merge preferences
				PreferenceOrganizer.__preferences.merge(preferences);
				PreferenceOrganizer.__loaded.resolve();
			});
		}

		return chain.then(() => {
			return PreferenceOrganizer.__loaded.promise;
		}).then(() => {
			settings["newPreferences"] = PreferenceOrganizer.__preferences.items;
			return settings;
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

		return PreferenceOrganizer.__observers.notify(options).then(() => {
			if (options["newPreferences"])
			{
				PreferenceOrganizer.__preferences.merge(options["newPreferences"]);
				PreferenceOrganizer._save(component);
			}
		});

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
	* @param	{Object}		options				Options.
	*/
	static __filter(conditions, options)
	{

		let result = false;
		let target = options["targets"];

		if (target == "*")
		{
			return true;
		}
		else if (target)
		{
			for (let i = 0; i < target.length; i++)
			{
				if (conditions["newPreferences"].hasOwnProperty(target[i]))
				{
					result = true;
					break;
				}
			}
		}

		return result;

	}

}

// =============================================================================
//	Preference exporter class
// =============================================================================

class PreferenceExporter
{

	constructor(component) { this._component = component; }
	get items() { return PreferenceOrganizer.__preferences.items; }
	set(key, value) { return PreferenceOrganizer.__preferences.set(key, value); }
	get(key) { return PreferenceOrganizer.__preferences.get(key); }
	load() { return PreferenceOrganizer._load(this._component); }
	save() { return PreferenceOrganizer._save(this._component); }
	setup(options) { return PreferenceOrganizer._setup(this._component, options); }

}
