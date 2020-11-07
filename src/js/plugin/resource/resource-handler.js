// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
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
			"doFetch": this.onDoFetch,
			"doSubmit": this.onDoSubmit,
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
	 * Do fetch event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	onDoFetch(sender, e)
	{

		let autoLoad = BITSMIST.v1.Util.safeGet(e.detail.options, "autoLoad", this.getOption("autoLoad"));

		return new Promise((resolve, reject) => {
			let id = e.detail.target["id"];
			let parameters = e.detail.target["parameters"];

			if (!autoLoad || !id)
			{
				resolve();
			}
			else
			{
				this._resources[this._defaultResourceName].get(id, parameters).then((data) => {
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
	* Do submit event handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	*/
	onDoSubmit(sender, e)
	{

		let id = e.detail.target["id"];
		let parameters = e.detail.target["parameters"];

		if (id)
		{
			return this._resources[this._defaultResourceName].update(id, {items:e.detail.items});
		}
		else
		{
			return this._resources[this._defaultResourceName].insert(id, {items:e.detail.items});
		}

	}

}
