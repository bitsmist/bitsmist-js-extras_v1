// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import BM from "../bm";

// =============================================================================
//	Resource organizer class
// =============================================================================

export default class ResourceOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "ResourceOrganizer";

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"targetWords":	"resources",
			"order":		300,
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
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
		this._addOrganizerHandler(component, "doOrganize", ResourceOrganizer.onDoOrganize);
		this._addOrganizerHandler(component, "doFetch", ResourceOrganizer.onDoFetch);
		this._addOrganizerHandler(component, "doSubmit", ResourceOrganizer.onDoSubmit);

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	static onDoOrganize(sender, e, ex)
	{

		let promises = [];

		this._enumSettings(e.detail.settings["resources"], (sectionName, sectionValue) => {
			promises.push(ResourceOrganizer._addResource(this, sectionName, sectionValue));
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static onDoFetch(sender, e, ex)
	{

		let promises = [];

		Object.keys(this._resources).forEach((resourceName) => {
			let resource = this._resources[resourceName];
			if (resource.options.get("autoFetch", true))
			{
				resource.target["id"] = BM.Util.safeGet(e.detail, "id", resource.target["id"]);
				resource.target["parameters"] = BM.Util.safeGet(e.detail, "parameters", resource.target["parameters"]);

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

	static onDoSubmit(sender, e, ex)
	{

		let promises = [];
		let submitItem = BM.Util.safeGet(e.detail, "items");

		Object.keys(this._resources).forEach((resourceName) => {
			let resource = this._resources[resourceName];
			if (resource.options.get("autoSubmit", true)) {
				let method = BM.Util.safeGet(e.detail, "method", resource.target["method"] || "put"); // Default is "put"
				let id = BM.Util.safeGet(e.detail, "id", resource.target["id"]);
				let parameters = BM.Util.safeGet(e.detail, "parameters", resource.target["parameters"]);

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

		BM.Util.assert(options["handlerClassName"], `ResourceOrganizer._addResource(): handler class name not specified. name=${component.name}, resourceName=${resourceName}`);

		let resource = BM.ClassUtil.createObject(options["handlerClassName"], component, resourceName, options["handlerOptions"]);
		component._resources[resourceName] = resource;

		if (resource.options.get("autoLoad"))
		{
			let id = resource.options.get("autoLoadOptions.id");
			let parameters = resource.options.get("autoLoadOptions.parameters");

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
