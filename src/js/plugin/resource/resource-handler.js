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

		this._options.set("settings", this._component.settings.get("ajaxUtil", ""));
		this._options.set("settings.url.COMMON.baseUrl", this._component.settings.get("system.apiBaseUrl", ""));
		this._resources = {};
		this._defaultResourceName;

		let resources = this._options.get("resources", []);
		Object.keys(resources).forEach((index) => {
			let resourceName = resources[index];
			this.addResource(resourceName, {
				"settings":	this._options.get("settings", {})
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
 	 * @param	{Object}		ex					Extra event info.
	 */
	onDoFetch(sender, e, ex)
	{

		return new Promise((resolve, reject) => {
			let id = BITSMIST.v1.Util.safeGet(e.detail.target, "id");
			let parameters = BITSMIST.v1.Util.safeGet(e.detail.target, "parameters");
			let autoLoad = BITSMIST.v1.Util.safeGet(e.detail.options, "autoLoad", this._options.get("autoLoad"));

			if (!autoLoad)
			{
				resolve();
			}
			else
			{
				this._resources[this._defaultResourceName].get(id, parameters).then((data) => {
					this._component.data = data;
					if ("items" in this._component)
					{
						this._component.items = this._options.get("itemsGetter", function(data){return data["data"]})(data);
					}
					else if ("item" in this._component)
					{
						this._component.item = this._options.get("itemGetter", function(data){return data["data"][0]})(data);
					}
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
 	* @param	{Object}		ex					Extra event info.
	*/
	onDoSubmit(sender, e, ex)
	{

		return new Promise((resolve, reject) => {
			let id = BITSMIST.v1.Util.safeGet(e.detail.target, "id");
			let parameters = BITSMIST.v1.Util.safeGet(e.detail.target, "parameters");
			let items = BITSMIST.v1.Util.safeGet(e.detail, "items");

			Promise.resolve().then(() => {
				if (id)
				{
					return this._resources[this._defaultResourceName].update(id, {items:items});
				}
				else
				{
					return this._resources[this._defaultResourceName].insert(id, {items:items});
				}
			}).then(() => {
				resolve();
			});
		});

	}

	// -----------------------------------------------------------------------------
	//  Protected
	// -----------------------------------------------------------------------------

	/**
	 * Get plugin options.
	 *
	 * @return  {Object}		Options.
	 */
	_getOptions()
	{

		return {
			"events": {
				"doFetch": this.onDoFetch,
				"doSubmit": this.onDoSubmit,
			}
		};

	}

}
