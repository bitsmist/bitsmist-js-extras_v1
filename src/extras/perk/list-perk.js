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
	//  Properties
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

		// Upgrade component
		this.upgrade(component, "skill", "list.transformRow", function(...args) { return ListPerk._transformRow(...args); });
		this.upgrade(component, "vault", "list.lastItems", {});
		this.upgrade(component, "stat", "list.activeRowSkinName", "");
		this.upgrade(component, "event", "afterTransform", ListPerk.ListPerk_onAfterTransform);
		this.upgrade(component, "event", "beforeFill", ListPerk.ListPerk_onBeforeFill);
		this.upgrade(component, "event", "doFill", ListPerk.ListPerk_onDoFill);

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static ListPerk_onAfterTransform(sender, e, ex)
	{

		let rootNode = this.get("setting", "list.options.listRootNode");
		this._listRootNode = ( rootNode ? BM.Util.scopedSelectorAll(this._root, rootNode)[0] : this._root );
		BM.Util.assert(this._listRootNode, `List.ListPerk_onAfterTransform(): List root node not found. name=${this.tagName}, listRootNode=${this.get("setting", "setting.listRootNode")}`);

		return ListPerk._transformRow(this, this.get("setting", "list.options.rowSkinName", "row"));

	}

	// -------------------------------------------------------------------------

	static ListPerk_onBeforeFill(sender, e, ex)
	{

		e.detail.items = e.detail.items || this.get("vault", "list.lastItems");

	}

	// -------------------------------------------------------------------------

	static ListPerk_onDoFill(sender, e, ex)
	{

		let builder = ( BM.Util.safeGet(e.detail.options, "async", this.get("setting", "list.options.async", true)) ? ListPerk.__buildAsync : ListPerk.__buildSync );
		let fragment = document.createDocumentFragment();

		return Promise.resolve().then(() => {
			return this.use("skill", "event.trigger", "beforeBuildRows");
		}).then(() => {
			return builder(this, fragment, e.detail.items, e.detail);
		}).then(() => {
			this._listRootNode.replaceChildren(fragment);
			this.set("vault", "list.lastItems", e.detail.items);

			return this.use("skill", "event.trigger", "afterBuildRows");
		});

	}

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

		if (component.get("stat", "list.activeRowSkinName") === skinName)
		{
			return Promise.resolve();
		}

		return Promise.resolve().then(() => {
			console.debug(`ListPerk._transformRow(): Switching the row skin. name=${component.tagName}, rowSkinName=${skinName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.use("skill", "skin.summon", skinName);
		}).then(() => {
			component.set("stat", "list.activeRowSkinName", skinName);
		}).then(() => {
			return component.use("skill", "event.trigger", "afterTransformRow", options);
		}).then(() => {
			console.debug(`ListPerk._transformRow(): Switched the row skin. name=${component.tagName}, rowSkinName=${skinName}, id=${component.id}, uniqueId=${component.uniqueId}`);
		});

	}

	// -------------------------------------------------------------------------
	//  Private
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
	static __buildSync(component, fragment, items, options)
	{

		let skinInfo = component.get("inventory", "inventory", "skin.skins");
		let activeRowSkinName = component.get("stat", "list.activeRowSkinName");

		BM.Util.assert(skinInfo[activeRowSkinName], `List.__buildSync(): Row skin not loaded yet. name=${component.tagName}, rowSkinName=${activeRowSkinName}`);

		let rowEvents = component.get("setting", "list.rowevents");
		let skin = skinInfo[activeRowSkinName].HTML;

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
						component.use("skill", "event.init", elementName, rowEvents[elementName], element);
					});
				}

				return component.use("skill", "event.trigger", "beforeFillRow", options).then(() => {
					if (component.get("setting", "list.options.autoFill", true))
					{
						// Fill fields
						FormUtil.showConditionalElements(element, options["item"]);
						ValueUtil.setFields(element, options["item"], {"resources":component.get("inventory", "inventory", "resource.resources")});
					}
					return component.use("skill", "event.trigger", "doFillRow", options);
				}).then(() => {
					return component.use("skill", "event.trigger", "afterFillRow", options);
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
	static __buildAsync(component, fragment, items, options)
	{

		let skinInfo = component.get("inventory", "skin.skins");
		let activeRowSkinName = component.get("stat", "list.activeRowSkinName");

		BM.Util.assert(skinInfo[activeRowSkinName], `List.__buildAsync(): Row skin not loaded yet. name=${component.tagName}, rowSkinName=${activeRowSkinName}`);

		let rowEvents = component.get("setting", "list.rowevents");
		let skin = skinInfo[activeRowSkinName].HTML;

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
					component.use("skill", "event.init", elementName, rowEvents[elementName], element);
				});
			}

			// Call event handlers
			component.use("skill", "event.triggerAsync", "beforeFillRow", options);
			FormUtil.showConditionalElements(element, options["item"]);
			if (component.get("setting", "list.options.autoFill", true))
			{
				ValueUtil.setFields(element, options["item"], {"resources":component.get("inventory", "resource.resources")});
			}
			component.use("skill", "event.triggerAsync", "doFillRow", options);
			component.use("skill", "event.triggerAsync", "afterFillRow", options);
		}

		delete options["no"];
		delete options["item"];
		delete options["element"];

	}

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
