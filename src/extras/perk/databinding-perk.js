// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import BindableArrayStore from "../store/bindable-array-store.js";
import BindableStore from "../store/bindable-store.js";
import BM from "../bm";
import FormUtil from "../util/form-util.js";

// =============================================================================
//	Databinding Perk class
// =============================================================================

export default class DatabindingPerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":		"databinding",
		"order":			320,
	};
	static #__skills = {
	};


	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return DatabindingPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		if (unit.get("setting", "databinding.options.dataType", "single") === "single")
		{
			// Init unit vault
			DatabindingPerk.#__vault.set(unit, {"store": new BindableStore({
					"resources":	unit.get("inventory", "resource.resources"),
					"direction":	unit.get("setting", "databinding.options.direction", "two-way"),
				})
			});

			// Upgrade unit (single)
			DatabindingPerk.#__skills["bindData"] = DatabindingPerk.#_bindData;

			// Add event handlers
			unit.use("event.add", "beforeTransform", {"handler":DatabindingPerk.#DatabindingPerk_onBeforeTransform, "order":DatabindingPerk.info["order"]});
			unit.use("event.add", "doFill", {"handler":DatabindingPerk.#DatabindingPerk_onDoFill, "order":DatabindingPerk.info["order"]});
		}
		else
		{
			// Init unit vault
			DatabindingPerk.#__vault.set(unit, {"store": new BindableArrayStore({
					"resources":	unit.get("inventory", "resource.resources"),
					"direction":	unit.get("setting", "databinding.options.direction", "two-way"),
				})
			});

			// Upgrade unit (multiple)
			DatabindingPerk.#__skills["bindData"] = DatabindingPerk.#_bindDataArray;

			// Add event handlers
			unit.use("event.add", "doFillRow", {"handler":DatabindingPerk.#DatabindingPerk_onDoFillRow, "order":DatabindingPerk.info["order"]});
		}

		// Add event handlers
		unit.use("event.add", "doClear", {"handler":DatabindingPerk.#DatabindingPerk_onDoClear, "order":DatabindingPerk.info["order"]});
		unit.use("event.add", "doCollect", {"handler":DatabindingPerk.#DatabindingPerk_onDoCollect, "order":DatabindingPerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static #DatabindingPerk_onBeforeTransform(sender, e, ex)
	{

		DatabindingPerk.#_bindData(this);

	}

	// -------------------------------------------------------------------------

	static #DatabindingPerk_onDoClear(sender, e, ex)
	{

		DatabindingPerk.#__vault.get(this)["store"].clear();

	}

	// -------------------------------------------------------------------------

	static #DatabindingPerk_onDoFill(sender, e, ex)
	{

		if (e.detail.items)
		{
			DatabindingPerk.#__vault.get(this)["store"].replace(e.detail.items);
			FormUtil.showConditionalElements(this, e.detail.items);
		}

	}

	// -------------------------------------------------------------------------

	static #DatabindingPerk_onDoFillRow(sender, e, ex)
	{

		DatabindingPerk.#_bindDataArray(this, e.detail.no, e.detail.element, e.detail.callbacks);
		DatabindingPerk.#__vault.get(this)["store"].replace(e.detail.no, e.detail.item);

	}

	// -------------------------------------------------------------------------

	static #DatabindingPerk_onDoCollect(sender, e, ex)
	{

		if (this.get("setting", "databinding.options.autoCollect", true))
		{
			e.detail.items = DatabindingPerk.#__vault.get(this)["store"].items;
		}

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Bind data and elements.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{HTMLElement}	rootNode			Root node.
	 */
	static #_bindData(unit, rootNode)
	{

		rootNode = ( rootNode ? rootNode : unit );

		let nodes = BM.Util.scopedSelectorAll(rootNode, "[bm-bind]");
		nodes = Array.prototype.slice.call(nodes, 0);
		if (rootNode.matches("[bm-bind]"))
		{
			nodes.push(rootNode);
		}

		nodes.forEach(elem => {
			// Get the callback function from settings
			let key = elem.getAttribute("bm-bind");
			let callback = DatabindingPerk.#__getCallback(unit, key);

			// Bind
			DatabindingPerk.#__vault.get(unit)["store"].bindTo(key, elem, callback);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Bind array data and elements.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Integer}		index				Array index.
	 * @param	{HTMLElement}	rootNode			Root node.
	 */
	static #_bindDataArray(unit, index, rootNode)
	{

		rootNode = ( rootNode ? rootNode : unit );

		let nodes = BM.Util.scopedSelectorAll(rootNode, "[bm-bind]");
		nodes = Array.prototype.slice.call(nodes, 0);
		if (rootNode.matches("[bm-bind]"))
		{
			nodes.push(rootNode);
		}

		nodes.forEach(elem => {
			// Get the callback function from settings
			let key = elem.getAttribute("bm-bind");
			let callback = DatabindingPerk.#__getCallback(unit, key);

			// Bind
			DatabindingPerk.#__vault.get(unit)["store"].bindTo(index, key, elem, callback);
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Get the callback function from settings.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		key					Field name.
	 */
	static #__getCallback(unit, key)
	{

		let callback;

		Object.entries(unit.get("setting", "databinding", {})).forEach(([sectionName, sectionValue]) => {
			if (sectionValue["callback"])
			{
				const pattern = sectionValue["key"] || sectionName;
				const r = new RegExp(pattern);
				if (r.test(key))
				{
					callback = sectionValue["callback"];
				}
			}
		});

		return callback;

	}

}
