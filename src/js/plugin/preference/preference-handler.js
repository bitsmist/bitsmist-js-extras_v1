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
//	Preference handler class
// =============================================================================

export default class PreferenceHandler extends BITSMIST.v1.Plugin
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		component			Component which the plugin
	 * 												is attached to.
	 * @param	{Object}		options				Options for the component.
     */
	constructor(component, options)
	{

		super(component, options);

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

		return this.setup(e.detail);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Register target component.
	 *
	 * @param	{Component}		component			Component to notify.
	 * @param	{Object}		targets				Targets.
	 *
	 * @return  {Promise}		Promise.
	 */
	register(component, targets)
	{

		this._targets[component.uniqueId] = {"object":component, "targets":targets};

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
				if (this.__isTarget(settings, this._targets[componentId].targets))
				{
					promises.push(this._targets[componentId].object.setup(settings));
				}
			});

			Promise.all(promises).then(() => {
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
