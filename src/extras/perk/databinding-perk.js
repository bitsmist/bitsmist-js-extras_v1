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

	static init(component, options)
	{

		if (component.get("settings", "databinding.options.dataType", "single") === "single")
		{
			// Upgrade component (single)
			this.upgrade(component, "skill", "databinding.bindData", function(...args) { return DatabindingPerk._bindData(...args); });
			this.upgrade(component, "vault", "databinding.store", new BindableStore({
				"resources":	component.get("inventory", "resource.resources"),
				"direction":	component.get("settings", "databinding.options.direction", "two-way"),
			}));
			this.upgrade(component, "event", "afterTransform", DatabindingPerk.DatabindingPerk_onAfterTransform);
			this.upgrade(component, "event", "doFill", DatabindingPerk.DatabindingPerk_onDoFill);
		}
		else
		{
			// Upgrade component (multiple)
			this.upgrade(component, "skill", "databinding.bindData", function(...args) { return DatabindingPerk._bindDataArray(...args); });
			this.upgrade(component, "vault", "databinding.store", new BindableArrayStore({
				"resources":	component.resources,
				"direction":	component.get("settings", "databinding.options.direction", "two-way"),
			}));
			this.upgrade(component, "event", "doFillRow", DatabindingPerk.DatabindingPerk_onDoFillRow);
		}

		// Upgrade component
		this.upgrade(component, "event", "doClear", DatabindingPerk.DatabindingPerk_onDoClear);
		this.upgrade(component, "event", "doCollect", DatabindingPerk.DatabindingPerk_onDoCollect);

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
	 * @param	{Component}		component			Component.
	 * @param	{HTMLElement}	rootNode			Root node.
	 */
	static _bindData(component, rootNode)
	{

		rootNode = ( rootNode ? rootNode : component._root );

		let nodes = BM.Util.scopedSelectorAll(rootNode, "[bm-bind]");
		nodes = Array.prototype.slice.call(nodes, 0);
		if (rootNode.matches("[bm-bind]"))
		{
			nodes.push(rootNode);
		}

		nodes.forEach(elem => {
			// Get the callback function from settings
			let key = elem.getAttribute("bm-bind");
			let callback = DatabindingPerk.__getCallback(component, key);

			// Bind
			component.get("vault", "databinding.store").bindTo(key, elem, callback);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Bind array data and elements.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Integer}		index				Array index.
	 * @param	{HTMLElement}	rootNode			Root node.
	 */
	static _bindDataArray(component, index, rootNode)
	{

		rootNode = ( rootNode ? rootNode : component._root );

		let nodes = BM.Util.scopedSelectorAll(rootNode, "[bm-bind]");
		nodes = Array.prototype.slice.call(nodes, 0);
		if (rootNode.matches("[bm-bind]"))
		{
			nodes.push(rootNode);
		}

		nodes.forEach(elem => {
			// Get the callback function from settings
			let key = elem.getAttribute("bm-bind");
			let callback = DatabindingPerk.__getCallback(component, key);

			// Bind
			component.get("vault", "databinding.store").bindTo(index, key, elem, callback);
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Get the callback function from settings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		key					Field name.
	 */
	static __getCallback(component, key)
	{

		let callback;

		Object.entries(component.get("settings", "databinding", {})).forEach(([sectionName, sectionValue]) => {
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
