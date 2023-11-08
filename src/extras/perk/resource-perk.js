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
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__info = {
		"sectionName":		"resource",
		"order":			300,
	};
	static #__spells = {
		"addHandler":		ResourcePerk.#_addHandler,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return ResourcePerk.#__info;

	}

	// -------------------------------------------------------------------------

	static get spells()
	{

		return ResourcePerk.#__spells;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		unit.upgrade("inventory", "resource.resources", {});

		// Add event handlers
		unit.use("event.add", "doApplySettings", {"handler":ResourcePerk.#ResourcePerk_onDoApplySettings, "order":ResourcePerk.info["order"]});
		unit.use("event.add", "doFetch", {"handler":ResourcePerk.#ResourcePerk_onDoFetch, "order":ResourcePerk.info["order"]});
		unit.use("event.add", "doSubmit", {"handler":ResourcePerk.#ResourcePerk_onDoSubmit, "order":ResourcePerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//  Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #ResourcePerk_onDoApplySettings(sender, e, ex)
	{

		let promises = [];

		Object.entries(BM.Util.safeGet(e.detail, "settings.resource.handlers", {})).forEach(([sectionName, sectionValue]) => {
			promises.push(ResourcePerk.#_addHandler(this, sectionName, sectionValue));
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static #ResourcePerk_onDoFetch(sender, e, ex)
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
				}));
			}
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static #ResourcePerk_onDoSubmit(sender, e, ex)
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
	//  Skills (Unit)
	// -------------------------------------------------------------------------

	/**
     * Add resource.
     *
     * @param	{Unit}			unit				Unit.
     * @param	{string}		handlerName			Resource handler name.
     * @param	{array}			options				Options.
	 *
	 * @return 	{Promise}		Promise.
     */
	static #_addHandler(unit, handlerName, options)
	{

		BM.Util.assert(options["handlerClassName"], () => `ResourcePerk.#_addHandler(): handler class name not specified. name=${unit.tagName}, handlerName=${handlerName}`);

		let promise = Promise.resolve();
		let handler = unit.get("inventory", `resource.resources.${handlerName}`);

		if (!handler)
		{
			handler = this.createHandler(options["handlerClassName"], unit, handlerName, options);
			unit.set("inventory", `resource.resources.${handlerName}`, handler);

			promise = handler.init(options);
		}

		return promise;

	}

}
