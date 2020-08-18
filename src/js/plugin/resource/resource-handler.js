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
//	Resource handler class
// =============================================================================

export default class ResourceHandler extends BITSMIST.v1.Plugin
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
			"beforeFetchList": this.onBeforeFetchList,
			"beforeFetchItem": this.onBeforeFetchItem,
			"submit": this.onSubmit,
		}
		this._resources = {};

		let resources = this.getOption("resources", []);
		Object.keys(resources).forEach((index) => {
			let resourceName = resources[index];
			this.addResource(resourceName, {
				"baseUrl":	this._component.app.settings.get("system.apiBaseUrl") +
							"/v" +
							this._component.app.settings.get("system.apiVersion") +
							"-" +
							this._component.app.settings.get("system.appVersion"),
				"settings":	this._component.app.settings.get("ajaxUtil")
			});
		});

		this.switchResource(resources[0]);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
     * Add a resource.
     *
     * @param	{string}		resourceName		Resource name.
     * @param	{array}			options				Options.
     */
	addResource(resourceName, options)
	{

		// Create a resource object
		this._resources[resourceName] = new ResourceUtil(resourceName, Object.assign({
			"baseUrl":	options["baseUrl"],
			"settings":	options["settings"],
		}));

		// Expose
		this[resourceName] = this._resources[resourceName];

	}

	// -------------------------------------------------------------------------

	/**
     * Switch to a resource.
     *
     * @param	{string}		resourceName		Resource name.
     */
	switchResource(resourceName)
	{

		this._defaultResourceName = resourceName;

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	 * Before fetch list event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	onBeforeFetchList(sender, e)
	{

		return new Promise((resolve, reject) => {
			this._resources[this._defaultResourceName].getList(e.detail.target).then((data) => {
				this._component.data = data;
				this._component.items = data["data"];
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Before fetch item event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	onBeforeFetchItem(sender, e)
	{

		return new Promise((resolve, reject) => {
			if (e.detail.target != "new")
			{
				this._resources[this._defaultResourceName].getItem(e.detail.target).then((data) => {
					this._component.data = data;
					this._component.item = data["data"][0];
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

	/**
	* Submit event handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	*/
	onSubmit(sender, e)
	{

		this._resources[this._defaultResourceName].upsertItem(e.detail.target, {items:e.detail.items});

	}

}
