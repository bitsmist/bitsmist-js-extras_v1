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
//	Resource Perk class
// =============================================================================

export default class ResourcePerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
     * Add resource. Load data if "autoLoad" option is true using added resource.
     *
     * @param	{Component}		component			Component.
     * @param	{string}		handlerName			Resource handler name.
     * @param	{array}			options				Options.
	 *
	 * @return 	{Promise}		Promise.
     */
	static _addResource(component, handlerName, options)
	{

		BM.Util.assert(options["handlerClassName"], `ResourcePerk._addResource(): handler class name not specified. name=${component.tagName}, handlerName=${handlerName}`);

		let promise = Promise.resolve();
		let handler = component.inventory.get(`resource.resources.${handlerName}`);

		if (!handler)
		{
			handler = BM.ClassUtil.createObject(options["handlerClassName"], component, handlerName, options);
			component.inventory.set(`resource.resources.${handlerName}`, handler);

			promise = handler.init(options);
		}

		return promise;

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	static ResourcePerk_onDoOrganize(sender, e, ex)
	{

		let promises = [];

		Object.entries(BM.Util.safeGet(e.detail, "settings.resource.handlers", {})).forEach(([sectionName, sectionValue]) => {
			promises.push(ResourcePerk._addResource(this, sectionName, sectionValue));
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static ResourcePerk_onDoFetch(sender, e, ex)
	{

		let promises = [];

		Object.keys(this.inventory.get("resource.resources")).forEach((resourceName) => {
			let resource = this.inventory.get(`resource.resources.${resourceName}`);
			if (resource.options.get("autoFetch", true))
			{
				resource.target["id"] = BM.Util.safeGet(e.detail, "id", resource.target["id"]);
				resource.target["parameters"] = BM.Util.safeGet(e.detail, "parameters", resource.target["parameters"]);

				promises.push(resource.get(resource.target["id"], resource.target["parameters"]).then(() => {
					e.detail.items = resource.items;

					// Set the property automatically after resource is fetched
					let autoSet = this.settings.get(`resource.${resourceName}.autoSetProperty`);
					if (autoSet)
					{
						this[autoSet] = resource.items;
					}
				}));
			}
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static ResourcePerk_onDoSubmit(sender, e, ex)
	{

		let promises = [];
		let submitItem = BM.Util.safeGet(e.detail, "items");

		Object.keys(this.inventory.get("resource.resources")).forEach((resourceName) => {
			let resource = this.inventory.get(`resource.resources.${resourceName}`);
			if (resource.options.get("autoSubmit", true)) {
				let method = BM.Util.safeGet(e.detail, "method", resource.target["method"] || "put"); // Default is "put"
				let id = BM.Util.safeGet(e.detail, "id", resource.target["id"]);
				let parameters = BM.Util.safeGet(e.detail, "parameters", resource.target["parameters"]);

				promises.push(this.inventory.get(`resource.resources.${resourceName}`)[method](id, submitItem, parameters));
			}
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"resource",
			"order":		300,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add skills to component;
		component.skills.set("resource.addResource", function(...args) { return ResourcePerk._addResource(...args); });

		// Add inventory items to component
		component.inventory.set("resource.resources", {});

		// Add event handlers to component
		this._addPerkHandler(component, "doOrganize", ResourcePerk.ResourcePerk_onDoOrganize);
		this._addPerkHandler(component, "doFetch", ResourcePerk.ResourcePerk_onDoFetch);
		this._addPerkHandler(component, "doSubmit", ResourcePerk.ResourcePerk_onDoSubmit);

	}

}
