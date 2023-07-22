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

	static init(unit, options)
	{

		// Upgrade unit
		this.upgrade(unit, "spell", "list.transformRow", function(...args) { return ListPerk._transformRow(...args); });
		this.upgrade(unit, "vault", "list.lastItems", {});
		this.upgrade(unit, "state", "list.active.skinName", "");
		this.upgrade(unit, "event", "afterTransform", ListPerk.ListPerk_onAfterTransform);
		this.upgrade(unit, "event", "beforeFill", ListPerk.ListPerk_onBeforeFill);
		this.upgrade(unit, "event", "doFill", ListPerk.ListPerk_onDoFill);

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static ListPerk_onAfterTransform(sender, e, ex)
	{

		let rootNode = this.get("setting", "list.options.listRootNode");
		this._listRootNode = ( rootNode ? BM.Util.scopedSelectorAll(this.unitRoot, rootNode)[0] : this.unitRoot );
		BM.Util.assert(this._listRootNode, `List.ListPerk_onAfterTransform(): List root node not found. name=${this.tagName}, listRootNode=${this.get("setting", "setting.listRootNode")}`);

		return ListPerk._transformRow(this, this.get("setting", "list.options.rowSkinName", "row"));

	}

	// -------------------------------------------------------------------------

	static ListPerk_onBeforeFill(sender, e, ex)
	{

		if (e.detail.refill)
		{
			e.detail.items = this.get("vault", "list.lastItems");
		}

	}

	// -------------------------------------------------------------------------

	static ListPerk_onDoFill(sender, e, ex)
	{

		let builder = ( BM.Util.safeGet(e.detail.options, "async", this.get("setting", "list.options.async", true)) ? ListPerk.__buildAsync : ListPerk.__buildSync );
		let fragment = document.createDocumentFragment();

		return Promise.resolve().then(() => {
			return this.use("spell", "event.trigger", "beforeBuildRows");
		}).then(() => {
			return builder(this, fragment, e.detail.items, e.detail);
		}).then(() => {
			this._listRootNode.replaceChildren(fragment);
			this.set("vault", "list.lastItems", e.detail.items);

			return this.use("spell", "event.trigger", "afterBuildRows");
		});

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Change the row skin.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{String}		skinName			Skin name.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _transformRow(unit, skinName, options)
	{

		options = options || {};

		if (unit.get("state", "list.active.skinName") === skinName)
		{
			return Promise.resolve();
		}

		return Promise.resolve().then(() => {
			console.debug(`ListPerk._transformRow(): Switching the row skin. name=${unit.tagName}, rowSkinName=${skinName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "skin.summon", skinName);
		}).then(() => {
			unit.set("state", "list.active.skinName", skinName);
		}).then(() => {
			return unit.use("spell", "event.trigger", "afterTransformRow", options);
		}).then(() => {
			console.debug(`ListPerk._transformRow(): Switched the row skin. name=${unit.tagName}, rowSkinName=${skinName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		});

	}

	// -------------------------------------------------------------------------
	//  Private
	// -------------------------------------------------------------------------

	/**
	 * Build rows synchronously.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{DocumentFragment}	fragment		Document fragment.
	 * @param	{Object}		items				Items.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __buildSync(unit, fragment, items, options)
	{

		let skinInfo = unit.get("inventory", "inventory", "skin.skins");
		let activeRowSkinName = unit.get("state", "list.active.skinName");

		BM.Util.assert(skinInfo[activeRowSkinName], `List.__buildSync(): Row skin not loaded yet. name=${unit.tagName}, rowSkinName=${activeRowSkinName}`);

		let rowEvents = unit.get("setting", "list.rowevents");
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
						unit.use("skill", "event.init", elementName, rowEvents[elementName], element);
					});
				}

				return unit.use("spell", "event.trigger", "beforeFillRow", options).then(() => {
					if (unit.get("setting", "list.options.autoFill", true))
					{
						// Fill fields
						FormUtil.showConditionalElements(element, options["item"]);
						ValueUtil.setFields(element, options["item"], {"resources":unit.get("inventory", "inventory", "resource.resources")});
					}
					return unit.use("spell", "event.trigger", "doFillRow", options);
				}).then(() => {
					return unit.use("spell", "event.trigger", "afterFillRow", options);
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
	static __buildAsync(unit, fragment, items, options)
	{

		let skinInfo = unit.get("inventory", "skin.skins");
		let activeRowSkinName = unit.get("state", "list.active.skinName");

		BM.Util.assert(skinInfo[activeRowSkinName], `List.__buildAsync(): Row skin not loaded yet. name=${unit.tagName}, rowSkinName=${activeRowSkinName}`);

		let rowEvents = unit.get("setting", "list.rowevents");
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
					unit.use("skill", "event.init", elementName, rowEvents[elementName], element);
				});
			}

			// Call event handlers
			unit.use("spell", "event.triggerAsync", "beforeFillRow", options);
			FormUtil.showConditionalElements(element, options["item"]);
			if (unit.get("setting", "list.options.autoFill", true))
			{
				ValueUtil.setFields(element, options["item"], {"resources":unit.get("inventory", "resource.resources")});
			}
			unit.use("spell", "event.triggerAsync", "doFillRow", options);
			unit.use("spell", "event.triggerAsync", "afterFillRow", options);
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
