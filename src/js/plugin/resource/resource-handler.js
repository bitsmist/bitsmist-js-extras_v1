// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Plugin from '../plugin';
import ResourceUtil from '../../util/resource-util';

// =============================================================================
//	Resource handler class
// =============================================================================

export default class ResourceHandler extends Plugin
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
			"beforeFetch": this.onBeforeFetch,
			"submit": this.onSubmit,
		}
		this._options["settings"] = this._component.settings.get("ajaxUtil", "");
		this._options["settings"]["url"]["COMMON"]["baseUrl"] = this._component.settings.get("system.apiBaseUrl", "");
		this._resources = {};

		let resources = this.getOption("resources", []);
		Object.keys(resources).forEach((index) => {
			let resourceName = resources[index];
			this.addResource(resourceName, {
				"settings":	this.getOption("settings", {})
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
	 * Before fetch event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	onBeforeFetch(sender, e)
	{

		return new Promise((resolve, reject) => {
			if (e.detail.autoLoad == false || !e.detail.id)
			{
				resolve();
			}
			else
			{
				this._resources[this._defaultResourceName].get(e.detail.id, e.detail.parameters).then((data) => {
					this._component.data = data;
					this._component.items = this.getOption("itemsGetter", function(data){return data["data"]})(data);
					this._component.item = this.getOption("itemGetter", function(data){return data["data"][0]})(data);
					resolve();
				});
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

		if (e.detail.id)
		{
			return this._resources[this._defaultResourceName].update(e.detail.id, {items:e.detail.items});
		}
		else
		{
			return this._resources[this._defaultResourceName].insert(e.detail.id, {items:e.detail.items});
		}

	}

}
