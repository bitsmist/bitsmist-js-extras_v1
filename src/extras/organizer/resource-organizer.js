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

	/**
	 * Init.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 */
	static init(component, settings)
	{

		// Add properties
		Object.defineProperty(component, 'resources', {
			get() { return this._resources; },
		});

		// Add methods
		component.addResource = function(resourceName, options) { return ResourceOrganizer._addResource(this, resourceName, options); }
		component.switchResource = function(resourceName) { return ResourceOrganizer._switchResource(this, resourceName); }

		// Init vars
		component._resources = {};

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

		let promises = [];

		switch (conditions)
		{
			case "beforeStart":
			case "afterSpecLoad":
				let resources = settings["resources"];
				if (resources)
				{
					Object.keys(resources).forEach((resourceName) => {
						// Add resource
						promises.push(ResourceOrganizer._addResource(component, resourceName, resources[resourceName]));
					});
				}
				break;
			case "doFetch":
				promises.push(ResourceOrganizer.doFetch(component, settings));
				break;
			case "doSubmit":
				promises.push(ResourceOrganizer.doSubmit(component, settings));
				break;
		}

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

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Do fetch event handler.
	 *
	 * @param	{Component}		component				Component.
	 * @param	{Object}		options					Options
	 */
	static doFetch(component, options)
	{

		let promises = [];

		Object.keys(component._resources).forEach((resourceName) => {
			let resource = component._resources[resourceName];
			if (resource.options.get("autoFetch", true))
			{
				resource.target["id"] = BITSMIST.v1.Util.safeGet(options, "id", resource.target["id"]);
				resource.target["parameters"] = BITSMIST.v1.Util.safeGet(options, "parameters", resource.target["parameters"]);

				promises.push(resource.get(resource.target["id"], resource.target["parameters"]));
			}
		});

		return Promise.all(promises).then(() => {
			let resourceName = component.settings.get("settings.resourceName");
			if (resourceName && component._resources[resourceName])
			{
				component.items = component._resources[resourceName].items;
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Do submit event handler.
	 *
	 * @param	{Component}		component				Component.
	 * @param	{Object}		options					Options
	 */
	static doSubmit(component, options)
	{

		let promises = [];
		let submitItem = BITSMIST.v1.Util.safeGet(options, "items");

		Object.keys(component._resources).forEach((resourceName) => {
			let resource = component._resources[resourceName];
			if (resource.options.get("autoSubmit", true)) {
				let method = BITSMIST.v1.Util.safeGet(options, "method", resource.target["method"] || "put"); // Default is "put"
				let id = BITSMIST.v1.Util.safeGet(options, "id", resource.target["id"]);
				let parameters = BITSMIST.v1.Util.safeGet(options, "parameters", resource.target["parameters"]);

				promises.push(component._resources[resourceName][method](id, submitItem, parameters));
			}
		});

		return Promise.all(promises);

	}

}
