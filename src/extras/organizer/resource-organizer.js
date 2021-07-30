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
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 */
	static init(conditions, component, settings)
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
		component._defaultResource;

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

		// Install auto fetch/submit handlers
		component.addEventHandler("doFetch", {"handler":ResourceOrganizer.onDoFetch});
		component.addEventHandler("doSubmit", {"handler":ResourceOrganizer.onDoSubmit});

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

			if (!component._defaultResource)
			{
				component._defaultResource = component._resources[resourceName];
			}
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
	//  Event handlers
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

		let component = ex.component;
		let promises = [];

		Object.keys(component.resources).forEach((resourceName) => {
			let autoFetch = BITSMIST.v1.Util.safeGet(e.detail.options, "autoFetch", component.resources[resourceName].options.get("autoFetch", true));
			if (autoFetch)
			{
				let id = BITSMIST.v1.Util.safeGet(e.detail.options, "id", component.resources[resourceName].target["id"]);
				let parameters = BITSMIST.v1.Util.safeGet(e.detail.options, "parameters", component.resources[resourceName].target["parameters"]);

				promises.push(component.resources[resourceName].get(id, parameters));
			}
		});

		return Promise.all(promises);

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

		let component = ex.component;
		let items = BITSMIST.v1.Util.safeGet(e.detail, "items");
		let submitData = [];
		let targetKeys = {};
		let promises = [];

		// Get target keys to submit
		component.querySelectorAll("[bm-bind]").forEach((elem) => {
			if (elem.hasAttribute("bm-submit"))
			{
				targetKeys[elem.getAttribute("bm-bind")] = true;
			}
		});

		// Remove unnecessary items
		for (let i = 0; i < items.length; i++)
		{
			let item = {};
			Object.keys(items[i]).forEach((key) => {
				if (targetKeys[key])
				{
					item[key] = items[i][key];
				}
			});
			submitData.push(item);
		}

		// Submit
		Object.keys(component.resources).forEach((resourceName) => {
			let autoSubmit = BITSMIST.v1.Util.safeGet(e.detail.options, "autoSubmit", component.resources[resourceName].options.get("autoSubmit", true));
			if (autoSubmit)
			{
				let id = BITSMIST.v1.Util.safeGet(e.detail.options, "id", component.resources[resourceName].target["id"]);
				let parameters = BITSMIST.v1.Util.safeGet(e.detail.options, "parameters", component.resources[resourceName].target["parameters"]);

				promises.push(component.resources[resourceName].put(id, submitData));
			}
		});

		return Promise.all(promises);

	}

}
