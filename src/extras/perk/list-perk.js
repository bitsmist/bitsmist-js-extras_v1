// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import FormUtil from "../util/form-util.js";
import ValueUtil from "../util/value-util.js";
import {Perk, Util} from "@bitsmist-js_v1/core";

// =============================================================================
//	List Perk Class
// =============================================================================

export default class ListPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":		"list",
		"order":			310,
	};
	static #__skills = {
		"get":				ListPerk.#_getItems,
		"update":			ListPerk.#_updateRow,
		"add":				ListPerk.#_addRow,
//		"remove":			ListPerk.#_removeRow,
	};
	static #__spells = {
		"transformRow":		ListPerk.#_transformRow,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return ListPerk.#__info;

	}

	// -------------------------------------------------------------------------

	static get skills()
	{

		return ListPerk.#__skills;

	}

	// -------------------------------------------------------------------------

	static get spells()
	{

		return ListPerk.#__spells;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Init unit vault
		ListPerk.#__vault.set(unit, {
			"lastItems":	{},
			"listRootNode":	null,
		});

		// Upgrade unit
		unit.upgrade("inventory", "list.active.skinName", "");

		// Add event handlers
		unit.use("event.add", "afterTransform", {"handler":ListPerk.#ListPerk_onAfterTransform, "order":ListPerk.info["order"]});
		unit.use("event.add", "doClear", {"handler":ListPerk.#ListPerk_onDoClear, "order":ListPerk.info["order"]});
		unit.use("event.add", "beforeFill", {"handler":ListPerk.#ListPerk_onBeforeFill, "order":ListPerk.info["order"]});
		unit.use("event.add", "doFill", {"handler":ListPerk.#ListPerk_onDoFill, "order":ListPerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//	Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #ListPerk_onAfterTransform(sender, e, ex)
	{

		let rootNode = this.get("setting", "list.options.listRootNode");
		let unitRoot = this.get("inventory", "basic.unitRoot");
		ListPerk.#__vault.get(this)["listRootNode"] = ( rootNode ? Util.scopedSelectorAll(unitRoot, rootNode)[0] : unitRoot );
		Util.assert(ListPerk.#__vault.get(this)["listRootNode"], () => `List.ListPerk_onAfterTransform(): List root node not found. name=${this.tagName}, listRootNode=${this.get("setting", "setting.listRootNode")}`);

		return ListPerk.#_transformRow(this, this.get("setting", "list.options.rowSkinName", "row"));

	}

	// -------------------------------------------------------------------------

	static #ListPerk_onDoClear(sender, e, ex)
	{

		ListPerk.#__vault.get(this)["listRootNode"].innerHTML = "";
		this.set("inventory", "list.rows", []);

	}

	// -------------------------------------------------------------------------

	static #ListPerk_onBeforeFill(sender, e, ex)
	{

		if (e.detail.refill)
		{
			e.detail.items = ListPerk.#__vault.get(this)["lastItems"];
		}

	}

	// -------------------------------------------------------------------------

	static async #ListPerk_onDoFill(sender, e, ex)
	{

		let builder = ( Util.safeGet(e.detail.options, "async", this.get("setting", "list.options.async", true)) ? ListPerk.#__buildAsync : ListPerk.#__buildSync );
		let fragment = document.createDocumentFragment();
		this.set("inventory", "list.rows", []);

		await this.cast("event.trigger", "beforeBuildRows");

		await builder(this, fragment, e.detail.items, e.detail);
		ListPerk.#__vault.get(this)["listRootNode"].replaceChildren(fragment);
		ListPerk.#__vault.get(this)["lastItems"] = e.detail.items;

		await this.cast("event.trigger", "afterBuildRows");

	}

	// -------------------------------------------------------------------------
	//  Skills (Units)
	// -------------------------------------------------------------------------

	static #_addRow(unit, items, options)
	{

		let builder = (unit.get("setting", "list.options.async", true) ? ListPerk.#__buildAsync : ListPerk.#__buildSync);
		builder(unit, ListPerk.#__vault.get(unit)["listRootNode"], items, options);
		/*
		let activeRowSkinName = unit.get("inventory", "list.active.skinName");
		let skinInfo = unit.get("inventory", "skin.skins");
		let skin = skinInfo[activeRowSkinName].HTML;
		let rowEvents = unit.get("setting", "list.rowevents");

		// Install row element event handlers
		if (rowEvents)
		{
			Object.keys(rowEvents).forEach((elementName) => {
				unit.use("event.init", elementName, rowEvents[elementName], element);
			});
		}

		// Call event handlers
		unit.use("event.triggerSync", "beforeFillRow", options);
		FormUtil.showConditionalElements(element, options["item"]);
		if (unit.get("setting", "list.options.autoFill", true))
		{
			ValueUtil.setFields(element, options["item"], {"resources":unit.get("inventory", "resource.resources")});
		}
		unit.use("event.triggerSync", "doFillRow", options);
		unit.use("event.triggerSync", "afterFillRow", options);

		let element = ListPerk.#__createRow(skin);
//		this._listRootNode.appendChild(element);
		ListPerk.#__vault.get(unit)["listRootNode"].appendChild(element);
		*/

	}

	// -------------------------------------------------------------------------

	static async #_updateRow(unit, index, item)
	{

		let options = {
			"no":		index,
			"item":		item,
		};
		let rows = unit.get("inventory", "list.rows");
		let element = rows[index];

		if (unit.get("setting", "list.options.async", true))
		{
			// Async
			await unit.cast("event.trigger", "beforeFillRow", options);
			FormUtil.showConditionalElements(element, item);
			if (unit.get("setting", "list.options.autoFill", true))
			{
				ValueUtil.setFields(element, item, {"resources":unit.get("inventory", "inventory", "resource.resources")});
			}
			await unit.cast("event.trigger", "doFillRow", options);
			await unit.cast("event.trigger", "afterFillRow", options);
		} else {
			// Sync
			unit.use("event.triggerSync", "beforeFillRow", options);
			FormUtil.showConditionalElements(element, item);
			if (unit.get("setting", "list.options.autoFill", true))
			{
				ValueUtil.setFields(element, item, {"resources":unit.get("inventory", "resource.resources")});
			}
			unit.use("event.triggerSync", "doFillRow", options);
			unit.use("event.triggerSync", "afterFillRow", options);
		}

	}

	// -------------------------------------------------------------------------

	static #_getItems(unit, options)
	{

		let items = [];
		let rows = unit.get("inventory", "list.rows");
		let shaper = (options && options["shaper"]) || ((item) => {return item});

		for (let i = 0; i < rows.length; i++)
		{
			let item = ValueUtil.getFields(rows[i]);
			shaper(item);
			items.push(item);
		}

		return items;

	}

	// -------------------------------------------------------------------------
	//  Spells (Units)
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
	static async #_transformRow(unit, skinName, options)
	{

		options = options || {};

		if (unit.get("inventory", "list.active.skinName") === skinName)
		{
			return Promise.resolve();
		}

		console.debug(`ListPerk.#_transformRow(): Switching the row skin. name=${unit.tagName}, rowSkinName=${skinName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("skin.summon", skinName);
		unit.set("inventory", "list.active.skinName", skinName);
		await unit.cast("event.trigger", "afterTransformRow", options);
		console.debug(`ListPerk.#_transformRow(): Switched the row skin. name=${unit.tagName}, rowSkinName=${skinName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);

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
	static #__buildSync(unit, fragment, items, options)
	{

		let skinInfo = unit.get("inventory", "skin.skins");
		let activeRowSkinName = unit.get("inventory", "list.active.skinName");
		let rows = unit.get("inventory", "list.rows", []);

		Util.assert(skinInfo[activeRowSkinName], () => `List.#__buildSync(): Row skin not loaded yet. name=${unit.tagName}, rowSkinName=${activeRowSkinName}`);

		let rowEvents = unit.get("setting", "list.rowevents");
		let skin = skinInfo[activeRowSkinName].HTML;

		let chain = Promise.resolve();
		for (let i = 0; i < items.length; i++)
		{
			chain = chain.then(async () => {
				options["no"] = i;
				options["item"] = items[i];

				// Append a row
				let element = ListPerk.#__createRow(skin);
				fragment.appendChild(element);
				options["element"] = element;
				rows.push(element);

				// Install row element event handlers
				if (rowEvents)
				{
					Object.keys(rowEvents).forEach((elementName) => {
						unit.use("event.init", elementName, rowEvents[elementName], element);
					});
				}

				await unit.cast("event.trigger", "beforeFillRow", options);
				if (unit.get("setting", "list.options.autoFill", true))
				{
					// Fill fields
					FormUtil.showConditionalElements(element, options["item"]);
					ValueUtil.setFields(element, options["item"], {"resources":unit.get("inventory", "inventory", "resource.resources")});
				}
				await unit.cast("event.trigger", "doFillRow", options);
				await unit.cast("event.trigger", "afterFillRow", options);
			});
		}


		return chain.then(() => {
			unit.set("inventory", "list.rows", rows);

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
	static #__buildAsync(unit, fragment, items, options)
	{

		options = options || {};
		items = items || [];
		let skinInfo = unit.get("inventory", "skin.skins");
		let activeRowSkinName = unit.get("inventory", "list.active.skinName");
		let rows = unit.get("inventory", "list.rows", []);

		Util.assert(skinInfo[activeRowSkinName], () => `List.#__buildAsync(): Row skin not loaded yet. name=${unit.tagName}, rowSkinName=${activeRowSkinName}`);

		let rowEvents = unit.get("setting", "list.rowevents");
		let skin = skinInfo[activeRowSkinName].HTML;

		for (let i = 0; i < items.length; i++)
		{
			options["no"] = i;
			options["item"] = items[i];

			// Append a row
			let element = ListPerk.#__createRow(skin);
			fragment.appendChild(element);
			options["element"] = element;
			rows.push(element);

			// Install row element event handlers
			if (rowEvents)
			{
				Object.keys(rowEvents).forEach((elementName) => {
					unit.use("event.init", elementName, rowEvents[elementName], element);
				});
			}

			// Call event handlers
			unit.use("event.triggerSync", "beforeFillRow", options);
			FormUtil.showConditionalElements(element, options["item"]);
			if (unit.get("setting", "list.options.autoFill", true))
			{
				ValueUtil.setFields(element, options["item"], {"resources":unit.get("inventory", "resource.resources")});
			}
			unit.use("event.triggerSync", "doFillRow", options);
			unit.use("event.triggerSync", "afterFillRow", options);
		}

		unit.set("inventory", "list.rows", rows);

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
	static #__createRow(skin)
	{

		let ele = document.createElement("tbody");
		ele.innerHTML = skin;
		let element = ele.firstElementChild;
		element.setAttribute("bm-powered", "");

		return element;

	}

	// -------------------------------------------------------------------------

	/**
	 * Collect submittable data.
	 *
     * @param	{Unit}			unit				Unit.
	 *
	 * @return  {Object}		Collected data.
	 */
	static #__collectData(unit)
	{

		let item = {};

		let nodes = Util.scopedSelectorAll(unit, "[bm-bind]");
		nodes = Array.prototype.slice.call(nodes, 0);
		nodes.forEach((elem) => {
			let key = elem.getAttribute("bm-bind");
			item[key] = items[key];
		});

		return submitItem;

	}

}
