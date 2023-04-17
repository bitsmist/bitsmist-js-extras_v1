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
import FormUtil from "../util/form-util.js";
import ValueUtil from "../util/value-util.js";

// =============================================================================
//	List Perk Class
// =============================================================================

export default class ListPerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Change the row skin.
	 *
     * @param	{Component}		component			Component.
	 * @param	{String}		skinName			Skin name.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _transformRow(component, skinName, options)
	{

		options = options || {};

		if (component.inventory.get("list.activeRowSkinName") === skinName)
		{
			return Promise.resolve();
		}

		return Promise.resolve().then(() => {
			console.debug(`ListPerk._transformRow(): Switching the row skin. name=${component.name}, rowSkinName=${skinName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.skills.use("skin.load", skinName);
		}).then(() => {
			component.inventory.set("list.activeRowSkinName", skinName);
		}).then(() => {
			return component.skills.use("event.trigger", "afterTransformRow", options);
		}).then(() => {
			console.debug(`ListPerk._transformRow(): Switched the row skin. name=${component.name}, rowSkinName=${skinName}, id=${component.id}, uniqueId=${component.uniqueId}`);
		});

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static ListPerk_onAfterTransform(sender, e, ex)
	{

		this._listRootNode = this.querySelector(this.settings.get("list.settings.listRootNode"));
		BM.Util.assert(this._listRootNode, `List.ListPerk_onAfterTransform(): List root node not found. name=${this.name}, listRootNode=${this.settings.get("setting.listRootNode")}`);

		return ListPerk._transformRow(this, this.settings.get("list.settings.rowSkinName"));

	}

	// -------------------------------------------------------------------------

	static ListPerk_onBeforeFill(sender, e, ex)
	{

		e.detail.items = e.detail.items || this.inventory.get("list.lastItems");

	}

	// -------------------------------------------------------------------------

	static ListPerk_onDoFill(sender, e, ex)
	{

		let builder = ( BM.Util.safeGet(e.detail.options, "async", this.settings.get("list.settings.async", true)) ? ListPerk._buildAsync : ListPerk._buildSync );
		let fragment = document.createDocumentFragment();

		return Promise.resolve().then(() => {
			return this.skills.use("event.trigger", "beforeBuildRows");
		}).then(() => {
			return builder(this, fragment, e.detail.items, e.detail);
		}).then(() => {
			this._listRootNode.replaceChildren(fragment);
			this.inventory.set("list.lastItems", e.detail.items);

			return this.skills.use("event.trigger", "afterBuildRows");
		});

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "ListPerk";

	}

	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"list",
			"order":		310,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add skills to component;
		component.skills.set("list.transformRow", function(...args) { return ListPerk._transformRow(...args); });

		// Add inventory items to component
		component.inventory.set("list.activeRowName", "");
		component.inventory.set("list.lastItems", {});

		// Add event handlers to component
		this._addPerkHandler(component, "afterTransform", ListPerk.ListPerk_onAfterTransform);
		this._addPerkHandler(component, "beforeFill", ListPerk.ListPerk_onBeforeFill);
		this._addPerkHandler(component, "doFill", ListPerk.ListPerk_onDoFill);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Build rows synchronously.
	 *
     * @param	{Component}		component			Component.
	 * @param	{DocumentFragment}	fragment		Document fragment.
	 * @param	{Object}		items				Items.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _buildSync(component, fragment, items, options)
	{

		let skinInfo = component.inventory.get("skin.skins");
		let activeRowSkinName = component.inventory.get("list.activeRowSkinName");

		BM.Util.assert(skinInfo[activeRowSkinName], `List._buildSync(): Row skin not loaded yet. name=${component.name}, rowSkinName=${component._activeRowSkinName}`);

		let rowEvents = component.settings.get("list.rowevents");
		let skin = skinInfo[activeRowSkinName].html;

		let chain = Promise.resolve();
		for (let i = 0; i < items.length; i++)
		{
			chain = chain.then(() => {
				options["no"] = i;
				options["item"] = items[i];

				// Append a row
				let element = ListPerk.__createRow(skin);
				fragment.appendChild(element);
				options["element"] = element;

				// Install row element event handlers
				if (rowEvents)
				{
					Object.keys(rowEvents).forEach((elementName) => {
						component.skills.use("event.init", elementName, rowEvents[elementName], element);
					});
				}

				return component.skills.use("event.trigger", "beforeFillRow", options).then(() => {
					if (component.settings.get("list.settings.autoFill", true))
					{
						// Fill fields
						FormUtil.showConditionalElements(element, options["item"]);
						ValueUtil.setFields(element, options["item"], {"resources":component.inventory.get("resource.resources")});
					}
					return component.skills.use("event.trigger", "doFillRow", options);
				}).then(() => {
					return component.skills.use("event.trigger", "afterFillRow", options);
				});
			});
		}

		return chain.then(() => {
			delete options["no"];
			delete options["item"];
			delete options["element"];
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Build rows asynchronously.
	 *
	 * @param	{DocumentFragment}	fragment		Document fragment.
	 */
	static _buildAsync(component, fragment, items, options)
	{

		let skinInfo = component.inventory.get("skin.skins");
		let activeRowSkinName = component.inventory.get("list.activeRowSkinName");

		BM.Util.assert(skinInfo[activeRowSkinName], `List._buildAsync(): Row skin not loaded yet. name=${component.name}, rowSkinName=${component._activeRowSkinName}`);

		let rowEvents = component.settings.get("list.rowevents");
		let skin = skinInfo[activeRowSkinName].html;

		for (let i = 0; i < items.length; i++)
		{
			options["no"] = i;
			options["item"] = items[i];

			// Append a row
			let element = ListPerk.__createRow(skin);
			fragment.appendChild(element);
			options["element"] = element;

			// Install row element event handlers
			if (rowEvents)
			{
				Object.keys(rowEvents).forEach((elementName) => {
					component.skills.use("event.init", elementName, rowEvents[elementName], element);
				});
			}

			// Call event handlers
			component.skills.use("event.triggerAsync", "beforeFillRow", options);
			FormUtil.showConditionalElements(element, options["item"]);
			if (component.settings.get("list.settings.autoFill", true))
			{
				ValueUtil.setFields(element, options["item"], {"resources":component.inventory.get("resource.resources")});
			}
			component.skills.use("event.triggerAsync", "doFillRow", options);
			component.skills.use("event.triggerAsync", "afterFillRow", options);
		}

		delete options["no"];
		delete options["item"];
		delete options["element"];

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Create a row element.
	 *
	 * @param	{String}		skin					Skin.
	 *
	 * @return  {HTMLElement}	Row element.
	 */
	static __createRow(skin)
	{

		let ele = document.createElement("tbody");
		ele.innerHTML = skin;
		let element = ele.firstElementChild;
		element.setAttribute("bm-powered", "");

		return element;

	}

}
