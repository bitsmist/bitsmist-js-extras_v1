// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ResourceUtil from '../../util/resource-util';

// =============================================================================
//	Cookie preference handler class
// =============================================================================

//export default class CookiePreferenceHandler extends BITSMIST.v1.Plugin
export default class ResourceHandler
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

//		super(component, options);

		this._component = component;
		this._options = options;
		this._events = {
			"specLoad": this.onSpecLoad,
		}
		this._resources = {};

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	 * Spec Load event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	onSpecLoad(sender, e)
	{

		if (e.detail.spec && e.detail.spec.resources)
		{
			Object.keys(e.detail.spec.resources).forEach((resourceName) => {
				this._resources[resourceName] = new ResourceUtil(resourceName, Object.assign({
					"router":	this._component.app.router,
					"baseUrl":	this._component.app.settings["system"]["apiBaseUrl"],
					"version":	this._component.app.settings["system"]["apiVersion"] + "-" + this._component.app.settings["system"]["appVersion"],
					"settings":	this._component.app.settings["ajaxUtil"]
				}, e.detail.spec.resources[resourceName]));

				this[resourceName] = this._resources[resourceName];
			});
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Fetch event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	onFetch(sender, e)
	{

		console.log("@@@onFetch");

	}

}
