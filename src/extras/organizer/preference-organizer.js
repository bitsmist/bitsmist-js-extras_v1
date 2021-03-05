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

		// Add properties
		Object.defineProperty(BITSMIST.v1.Component.prototype, 'globalPreferences', {
			get() { return BITSMIST.v1.Globals["preferences"]; }
		})
		Object.defineProperty(BITSMIST.v1.Component.prototype, 'preferences', {
			get() { return this._preferences; },
		});

		// Add methods
		BITSMIST.v1.Component.prototype.save = function() { return PreferenceOrganizer._save(this); }
		BITSMIST.v1.Component.prototype.setup = function(options) { return PreferenceOrganizer._setup(this, options); }

		PreferenceOrganizer._observers = new BITSMIST.v1.ObserverStore({"filter":PreferenceOrganizer.__filter});

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

		component._preferences = new BITSMIST.v1.Store({"items":settings});

		if (component.settings.items["preferences"]["load"])
		{
			BITSMIST.v1.Globals["preferences"].items = component.settings.items["preferences"]["defaults"];
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

		return new Promise((resolve, reject) => {
			let preferences = component.settings.items["preferences"];
			if (preferences["load"])
			{
				BITSMIST.v1.Globals["preferences"].items = component.settings.items["preferences"]["defaults"];

				// Load preferences
				return PreferenceOrganizer._load(component).then((preferences) => {;
					// Merge preferences
					BITSMIST.v1.Globals["preferences"].merge(preferences);
					resolve();
				});
			}
			else
			{
				resolve();
			}
		});

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	* Get a value.
	*
	* @param	{String}		key					Key.
	* @param	{Object}		defaultValue		Value returned when key is not found.
	*
	* @return  {*}				Value.
	*/
	static _get(key, defaultValue)
	{

		return BITSMIST.v1.Globals["preferences"].get(key, defaultValue);

	}

	// -------------------------------------------------------------------------

	/**
	* Set a valuee.
	*
	* @param	{String}		key					Key.
	* @param	{Object}		value				Value to store.
	*/
	static _set(key, value)
	{

		BITSMIST.v1.Globals["preferences"].set(key, value);

	}

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

		return PreferenceOrganizer._observers.notify("setup", options).then(() => {
			if (options["newPreferences"])
			{
				BITSMIST.v1.Globals["preferences"].merge(options["newPreferences"]);
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

		PreferenceOrganizer._observers.set(component.uniqueId, {"object":component, "targets":targets});

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

		PreferenceOrganizer._observers.remove(component.uniqueId);

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

		return component.trigger("doSaveStore", sender, {"data":BITSMIST.v1.Globals["preferences"].items});

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
