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
	//  Properties
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

		// Upgrade component
		this.upgrade(component, "skill", "resource.addHandler", function(...args) { return ResourcePerk._addHandler(...args); });
		this.upgrade(component, "inventory", "resource.resources", {});
		this.upgrade(component, "event", "doApplySettings", ResourcePerk.ResourcePerk_onDoApplySettings);
		this.upgrade(component, "event", "doFetch", ResourcePerk.ResourcePerk_onDoFetch);
		this.upgrade(component, "event", "doSubmit", ResourcePerk.ResourcePerk_onDoSubmit);

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	static ResourcePerk_onDoApplySettings(sender, e, ex)
	{

		let promises = [];

		Object.entries(BM.Util.safeGet(e.detail, "settings.resource.handlers", {})).forEach(([sectionName, sectionValue]) => {
			promises.push(ResourcePerk._addHandler(this, sectionName, sectionValue));
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static ResourcePerk_onDoFetch(sender, e, ex)
	{

		let promises = [];

		Object.keys(this.get("inventory", "resource.resources")).forEach((resourceName) => {
			let resource = this.get("inventory", `resource.resources.${resourceName}`);
			if (resource.options.get("autoFetch", true))
			{
				resource.target["id"] = BM.Util.safeGet(e.detail, "id", resource.target["id"]);
				resource.target["parameters"] = BM.Util.safeGet(e.detail, "parameters", resource.target["parameters"]);

				promises.push(resource.load(resource.target["id"], resource.target["parameters"]).then(() => {
					e.detail.items = resource.items;

					// Set the property automatically after resource is fetched
					let autoSet = this.get("settings", `resource.${resourceName}.autoSetProperty`);
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

		Object.keys(this.get("inventory", "resource.resources")).forEach((resourceName) => {
			let resource = this.get("inventory", `resource.resources.${resourceName}`);
			if (resource.options.get("autoSubmit", true)) {
				let method = BM.Util.safeGet(e.detail, "method", resource.target["method"] || "update"); // Default is "update"
				let id = BM.Util.safeGet(e.detail, "id", resource.target["id"]);
				let parameters = BM.Util.safeGet(e.detail, "parameters", resource.target["parameters"]);

				promises.push(this.get("inventory", `resource.resources.${resourceName}`)[method](id, submitItem, parameters));
			}
		});

		return Promise.all(promises);

	}

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
	static _addHandler(component, handlerName, options)
	{

		BM.Util.assert(options["handlerClassName"], `ResourcePerk._addHandler(): handler class name not specified. name=${component.tagName}, handlerName=${handlerName}`);

		let promise = Promise.resolve();
		let handler = component.get("inventory", `resource.resources.${handlerName}`);

		if (!handler)
		{
			handler = BM.ClassUtil.createObject(options["handlerClassName"], component, handlerName, options);
			component.set("inventory", `resource.resources.${handlerName}`, handler);

			promise = handler.init(options);
		}

		return promise;

	}

}
