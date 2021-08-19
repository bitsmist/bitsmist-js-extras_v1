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
		component.addResource = function(resourceName, options, ajaxSettings) { return ResourceOrganizer._addResource(this, resourceName, options); }
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
						ResourceOrganizer._addResource(component, resourceName, resources[resourceName]);

						// Load data
						if (resources[resourceName]["autoLoad"])
						{
							let id = resources[resourceName]["autoLoad"]["id"];
							let paramters = resources[resourceName]["autoLoad"]["paramters"];

							promises.push(component.resources[resourceName].get(id, paramters));
						}
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

		return Promise.all(promises).then(() => {
			return settings;
		});

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
     * Add a resource.
     *
     * @param	{Component}		component			Component.
     * @param	{string}		resourceName		Resource name.
     * @param	{array}			options				Options.
     */
	static _addResource(component, resourceName, options)
	{

		if (options["handlerClassName"])
		{
			component._resources[resourceName] = BITSMIST.v1.ClassUtil.createObject(options["handlerClassName"], component, resourceName, options);
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
		let resources = ResourceOrganizer.__getTargetResources(component, options, "autoFetch");

		for (let i = 0; i < resources.length; i++)
		{
			let resourceName = resources[i];
			let id = BITSMIST.v1.Util.safeGet(options, "id", component.resources[resourceName].target["id"]);
			let parameters = BITSMIST.v1.Util.safeGet(options, "parameters", component.resources[resourceName].target["parameters"]);

			promises.push(component.resources[resourceName].get(id, parameters));
		}

		return Promise.all(promises);

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
		let resources = ResourceOrganizer.__getTargetResources(component, options, "autoSubmit");

		for (let i = 0; i < resources.length; i++)
		{
			let resourceName = resources[i];
			let method = BITSMIST.v1.Util.safeGet(options, "method", component.resources[resourceName].target["method"] || "put"); // Default is "put"
			let id = BITSMIST.v1.Util.safeGet(options, "id", component.resources[resourceName].target["id"]);
			let parameters = BITSMIST.v1.Util.safeGet(options, "parameters", component.resources[resourceName].target["parameters"]);

			promises.push(component.resources[resourceName][method](id, component.item, parameters));
		}

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Get target resource names.
	 *
	 * @param	{Component}		component				Component.
	 * @param	{Object}		options					Options
	 * @param	{String}		target					Target event
 	 *
	 * @return  {Array}			Array of target resource names.
	 */
	static __getTargetResources(component, options, target)
	{

		let resources = BITSMIST.v1.Util.safeGet(options, target, component._settings.get("settings." + target, []));

		if (Array.isArray(resources))
		{
		}
		else if (typeof resources === "string")
		{
			resources = [component.settings.get("settings." + target)];
		}
		else if (resources === true)
		{
			if (component.settings.get("settings.resourceName"))
			{
				resources = [component.settings.get("settings.resourceName")];
			}
		}

		return resources;

	}

}
