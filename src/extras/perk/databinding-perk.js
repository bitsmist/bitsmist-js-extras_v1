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
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"databinding",
			"order":		320,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		if (unit.get("settings", "databinding.options.dataType", "single") === "single")
		{
			// Upgrade unit (single)
			this.upgrade(unit, "skill", "databinding.bindData", function(...args) { return DatabindingPerk._bindData(...args); });
			this.upgrade(unit, "vault", "databinding.store", new BindableStore({
				"resources":	unit.get("inventory", "resource.resources"),
				"direction":	unit.get("settings", "databinding.options.direction", "two-way"),
			}));
			this.upgrade(unit, "event", "afterTransform", DatabindingPerk.DatabindingPerk_onAfterTransform);
			this.upgrade(unit, "event", "doFill", DatabindingPerk.DatabindingPerk_onDoFill);
		}
		else
		{
			// Upgrade unit (multiple)
			this.upgrade(unit, "skill", "databinding.bindData", function(...args) { return DatabindingPerk._bindDataArray(...args); });
			this.upgrade(unit, "vault", "databinding.store", new BindableArrayStore({
				"resources":	unit.resources,
				"direction":	unit.get("settings", "databinding.options.direction", "two-way"),
			}));
			this.upgrade(unit, "event", "doFillRow", DatabindingPerk.DatabindingPerk_onDoFillRow);
		}

		// Upgrade unit
		this.upgrade(unit, "event", "doClear", DatabindingPerk.DatabindingPerk_onDoClear);
		this.upgrade(unit, "event", "doCollect", DatabindingPerk.DatabindingPerk_onDoCollect);

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static DatabindingPerk_onAfterTransform(sender, e, ex)
	{

		DatabindingPerk._bindData(this);

	}

	// -------------------------------------------------------------------------

	static DatabindingPerk_onDoClear(sender, e, ex)
	{

		this.get("vault", "databinding.store").clear();

	}

	// -------------------------------------------------------------------------

	static DatabindingPerk_onDoFill(sender, e, ex)
	{

		if (e.detail.items)
		{
			this.get("vault", "databinding.store").replace(e.detail.items);
			FormUtil.showConditionalElements(this, e.detail.items);
		}

	}

	// -------------------------------------------------------------------------

	static DatabindingPerk_onDoFillRow(sender, e, ex)
	{

		console.log("%c@@@DatabindingPerk_onDoFillRow", "color:white;background-color:green", this.tagName, e.detail.no);

		DatabindingPerk._bindDataArray(this, e.detail.no, e.detail.element, e.detail.callbacks);
		this.get("vault", "databinding.store").replace(e.detail.no, e.detail.item);

	}

	// -------------------------------------------------------------------------

	static DatabindingPerk_onDoCollect(sender, e, ex)
	{

		if (this.get("settings", "databinding.options.autoCollect", true))
		{
			e.detail.items = this.get("vault", "databinding.store").items;
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
	static _bindData(unit, rootNode)
	{

		rootNode = ( rootNode ? rootNode : unit._root );

		let nodes = BM.Util.scopedSelectorAll(rootNode, "[bm-bind]");
		nodes = Array.prototype.slice.call(nodes, 0);
		if (rootNode.matches("[bm-bind]"))
		{
			nodes.push(rootNode);
		}

		nodes.forEach(elem => {
			// Get the callback function from settings
			let key = elem.getAttribute("bm-bind");
			let callback = DatabindingPerk.__getCallback(unit, key);

			// Bind
			unit.get("vault", "databinding.store").bindTo(key, elem, callback);
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
	static _bindDataArray(unit, index, rootNode)
	{

		rootNode = ( rootNode ? rootNode : unit._root );

		let nodes = BM.Util.scopedSelectorAll(rootNode, "[bm-bind]");
		nodes = Array.prototype.slice.call(nodes, 0);
		if (rootNode.matches("[bm-bind]"))
		{
			nodes.push(rootNode);
		}

		nodes.forEach(elem => {
			// Get the callback function from settings
			let key = elem.getAttribute("bm-bind");
			let callback = DatabindingPerk.__getCallback(unit, key);

			// Bind
			unit.get("vault", "databinding.store").bindTo(index, key, elem, callback);
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
	static __getCallback(unit, key)
	{

		let callback;

		Object.entries(unit.get("settings", "databinding", {})).forEach(([sectionName, sectionValue]) => {
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
