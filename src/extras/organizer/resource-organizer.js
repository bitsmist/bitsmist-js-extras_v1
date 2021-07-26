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
//		component.switchResource = function(resourceName, options, ajaxSettings) { return ResourceOrganizer._initResource(this, resourceName, options, ajaxSettings); }

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

			component.addEventHandler("doFetch", {"handler":ResourceOrganizer.onDoFetch, "options":{"settings":settings}});
			component.addEventHandler("doSubmit", {"handler":ResourceOrganizer.onDoSubmit, "options":{"settings":settings}});
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
     * Switch to a resource.
     *
     * @param	{string}		resourceName		Resource name.
     */
	/*
	static _switchResource(resourceName)
	{

		this._defaultResourceName = resourceName;

	}
	*/

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

		let resource = BITSMIST.v1.Util.safeGet(e.detail.target, "resource");
		let id = BITSMIST.v1.Util.safeGet(e.detail.target, "id");
		let parameters = BITSMIST.v1.Util.safeGet(e.detail.target, "parameters");
		let autoLoad = BITSMIST.v1.Util.safeGet(e.detail.options, "autoLoad");
		let component = ex.component;

		if (autoLoad)
		{
			return component.resources[resource].get(id, parameters);
		}

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

		let resource = BITSMIST.v1.Util.safeGet(e.detail.target, "resource");
		let id = BITSMIST.v1.Util.safeGet(e.detail.target, "id");
		let parameters = BITSMIST.v1.Util.safeGet(e.detail.target, "parameters");
		let items = BITSMIST.v1.Util.safeGet(e.detail, "items");
		let submitData = [];
		let targetKeys = {};
		let component = ex.component;

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
		return Promise.resolve().then(() => {
			if (id)
			{
				return this._resources[this._defaultResourceName].update(id, {items:submitData});
			}
			else
			{
				return this._resources[this._defaultResourceName].insert(id, {items:submitData});
			}
		});

	}

}
