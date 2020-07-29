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

export default class CookiePreferenceHandler extends BITSMIST.v1.Plugin
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

		this._options["events"] = {
			"initComponent": this.onInitComponent,
			"beforeFetchList": this.onBeforeFetchList,
			"beforeFetchItem": this.onBeforeFetchItem,
			"submit": this.onSubmit,
		}
		this._resources = {};

		this._resource = new ResourceUtil(this._component.settings.get("resource"), Object.assign({
			"router":	this._component.app.router,
			"baseUrl":	this._component.app.settings.get("system.apiBaseUrl"),
			"version":	this._component.app.settings.get("system.apiVersion") + "-" + this._component.app.settings.get("system.appVersion"),
			"settings":	this._component.app.settings.get("ajaxUtil"),
		}));

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
	onInitComponent(sender, e)
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

	onBeforeFetchList(sender, e)
	{

		return new Promise((resolve, reject) => {
			this._resource.getList(e.detail.target).then((data) => {
				this._component.data = data;
				this._component.items = data["data"];
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	onBeforeFetchItem(sender, e)
	{

		return new Promise((resolve, reject) => {
			this._resource.getItem(e.detail.target).then((data) => {
				this._component.data = data;
				this._component.item = data["data"][0];
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	* Submit event handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	*/
	onSubmit(sender, e)
	{

		this._resource.upsertItem(e.detail.target, {items:e.detail.items});

	}

}
