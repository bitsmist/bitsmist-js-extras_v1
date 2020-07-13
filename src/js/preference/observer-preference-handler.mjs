// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Observer preference handler class
// =============================================================================

//export default class ObserverPreferenceHandler extends BITSMIST.v1.Plugin
export default class ObserverPreferenceHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		options				Options for the component.
     */
	constructor(component, options)
	{

//		super(component, options);

		this._component = component;
		this._options = options;
		this._targets = {};
		this._events = {
			"beforeSetup": {
				"handler": this.onBeforeSetup
			}
		}

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	 * Before setup event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	onBeforeSetup(sender, e)
	{

		this.setup(e.detail);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Register target component.
	 *
	 * @param	{Component}		component			Component to notify.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	register(component, options)
	{

		this._targets[component.uniqueId] = {"object":component, "options":options};

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply settings
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	setup(settings)
	{

		return new Promise((resolve, reject) => {
			let promises = [];

			Object.keys(this._targets).forEach((componentId) => {
				if (this.__isTarget(settings, this._targets[componentId].options["register"]))
				{
					promises.push(this._targets[componentId].object.setup(settings));
				}
			});

			Promise.all(promises).then(() => {
//				this._component.globalSettings["preferences"] = Object.assign(this._component.globalSettings["preferences"], settings["newSettings"]);
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------
	//	Private
	// -------------------------------------------------------------------------

	__isTarget(settings, target)
	{

		let result = false;

		/*
		if (target == "*")
		{
			return true;
		}
		*/

		for (let i = 0; i < target.length; i++)
		{
			if (settings["newPreferences"].hasOwnProperty(target[i]))
			{
				result = true;
				break;
			}
		}

		return result;

	}

}
