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
//	Resource organizer class
// =============================================================================

export default class ResourceOrganizer extends BITSMIST.v1.Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static attach(component, options)
	{

		// Add properties to component
		Object.defineProperty(component, 'resources', {
			get() { return this._resources; },
		});

		// Add methods to component
		component.addResource = function(resourceName, options) { return ResourceOrganizer._addResource(this, resourceName, options); }
		component.switchResource = function(resourceName) { return ResourceOrganizer._switchResource(this, resourceName); }

		// Init compnoent vars
		component._resources = {};

		// Add event handlers to component
		this._addOrganizerHandler(component, "beforeStart", ResourceOrganizer.onBeforeStart);
		this._addOrganizerHandler(component, "afterSpecLoad", ResourceOrganizer.onAfterSpecLoad);
		this._addOrganizerHandler(component, "doFetch", ResourceOrganizer.onDoFetch);
		this._addOrganizerHandler(component, "doSubmit", ResourceOrganizer.onDoSubmit);

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	 * Before start event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	static onBeforeStart(sender, e, ex)
	{

		let promises = [];
		let resources = this.settings.get("resources");
		if (resources)
		{
			Object.keys(resources).forEach((resourceName) => {
				// Add resource
				promises.push(ResourceOrganizer._addResource(this, resourceName, resources[resourceName]));
			});
		}

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	/**
	 * After spec load event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	static onAfterSpecLoad(sender, e, ex)
	{

		let promises = [];
		let resources = e.detail.spec["resources"];
		if (resources)
		{
			Object.keys(resources).forEach((resourceName) => {
				// Add resource
				promises.push(ResourceOrganizer._addResource(this, resourceName, resources[resourceName]));
			});
		}

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	/**
	 * Do fetch event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	static onDoFetch(sender, e, ex)
	{

		let promises = [];

		Object.keys(this._resources).forEach((resourceName) => {
			let resource = this._resources[resourceName];
			if (resource.options.get("autoFetch", true))
			{
				resource.target["id"] = BITSMIST.v1.Util.safeGet(e.detail, "id", resource.target["id"]);
				resource.target["parameters"] = BITSMIST.v1.Util.safeGet(e.detail, "parameters", resource.target["parameters"]);

				promises.push(resource.get(resource.target["id"], resource.target["parameters"]));
			}
		});

		return Promise.all(promises).then(() => {
			let resourceName = this.settings.get("settings.resourceName");
			if (resourceName && this._resources[resourceName])
			{
				this.items = this._resources[resourceName].items;
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
	static onDoSubmit(sender, e, ex)
	{

		let promises = [];
		let submitItem = BITSMIST.v1.Util.safeGet(e.detail, "items");

		Object.keys(this._resources).forEach((resourceName) => {
			let resource = this._resources[resourceName];
			if (resource.options.get("autoSubmit", true)) {
				let method = BITSMIST.v1.Util.safeGet(e.detail, "method", resource.target["method"] || "put"); // Default is "put"
				let id = BITSMIST.v1.Util.safeGet(e.detail, "id", resource.target["id"]);
				let parameters = BITSMIST.v1.Util.safeGet(e.detail, "parameters", resource.target["parameters"]);

				promises.push(this._resources[resourceName][method](id, submitItem, parameters));
			}
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
     * Add resource. Load data if "autoLoad" option is true using added resource.
     *
     * @param	{Component}		component			Component.
     * @param	{string}		resourceName		Resource name.
     * @param	{array}			options				Options.
	 *
	 * @return 	{Promise}		Promise.
     */
	static _addResource(component, resourceName, options)
	{

		BITSMIST.v1.Util.assert(options["handlerClassName"], `ResourceOrganizer._addResource(): handler class name not specified. name=${component.name}, resourceName=${resourceName}`);

		let resource = BITSMIST.v1.ClassUtil.createObject(options["handlerClassName"], component, resourceName, options["handlerOptions"]);
		component._resources[resourceName] = resource;

		if (resource.options.get("target"))
		{
			resource.target.id = resource.options.get("target.id");
			resource.target.parameters = resource.options.get("target.parameters");
		}

		if (resource.options.get("autoLoad"))
		{
			let id = resource.options.get("autoLoadOptions.id", resource.target.id);
			let parameters = resource.options.get("autoLoadOptions.parameters", resource.target.parameters);

			return resource.get(id, parameters);
		}

	}

	// -------------------------------------------------------------------------

	/**
     * Switch to another resource.
     *
     * @param	{string}		resourceName		Resource name.
     */
	static _switchResource(resourceName)
	{

		this._defaultResource = this._resources[resourceName];

	}

}
