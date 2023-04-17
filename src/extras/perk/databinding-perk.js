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

		rootNode = ( rootNode ? rootNode : component );

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
			component.inventory.get("databinding.bindings").bindTo(key, elem, callback);
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

		rootNode = ( rootNode ? rootNode : component );

		let nodes = rootNode.querySelectorAll("[bm-bind]");
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
			component.inventory.get("databinding.bindings").bindTo(index, key, elem, callback);
		});

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static DatabindingPerk_onAfterTransform(sender, e, ex)
	{

		DatabindingPerk._bindData(this);

	}

	// -------------------------------------------------------------------------

	static DatabindingPerk_onBeforeFill(sender, e, ex)
	{

		this.inventory.get("databinding.bindings").clear();

	}

	// -------------------------------------------------------------------------

	static DatabindingPerk_onDoFill(sender, e, ex)
	{

		if (e.detail.items)
		{
			this.inventory.get("databinding.bindings").replace(e.detail.items);
			FormUtil.showConditionalElements(this, e.detail.items);
		}

	}

	// -------------------------------------------------------------------------

	static DatabindingPerk_onDoFillRow(sender, e, ex)
	{

		DatabindingPerk._bindDataArray(this, e.detail.no, e.detail.element, e.detail.callbacks);
		this.inventory.get("databinding.bindings").replace(e.detail.no, e.detail.item);

	}

	// -------------------------------------------------------------------------

	static DatabindingPerk_onDoCollect(sender, e, ex)
	{

		if (this.settings.get("binding.settings.autoCollect", true))
		{
			e.detail.items = this.inventory.get("databinding.bindings").items;
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "DatabindingPerk";

	}

	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"binding",
			"order":		320,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(component, options)
	{

		if (component.settings.get("binding.settings.dataType", "single") === "single")
		{
			// Add skills to component;
			component.skills.set("databinding.bindData", function(...args) { return DatabindingPerk._bindData(...args); });

			// Add inventory items to component
			component.inventory.set("databinding.bindings", new BindableStore({
				"resources":	component.inventory.get("resource.resources"),
				"direction":	component.settings.get("binding.settings.direction", "two-way"),
			}));

			// Add event handlers to component
			this._addPerkHandler(component, "afterTransform", DatabindingPerk.DatabindingPerk_onAfterTransform);
			this._addPerkHandler(component, "doFill", DatabindingPerk.DatabindingPerk_onDoFill);
		}
		else
		{
			// Add skills to component;
			component.skills.set("databinding.bindData", function(...args) { return DatabindingPerk._bindDataArray(...args); });

			// Add inventory items to Component
			component.inventory.set("databinding.bindings", new BindableArrayStore({
				"resources":	component.resources,
				"direction":	component.settings.get("binding.settings.direction", "two-way"),
			}));

			// Add event handlers to component
			this._addPerkHandler(component, "beforeFill", DatabindingPerk.DatabindingPerk_onBeforeFill);
			this._addPerkHandler(component, "doFillRow", DatabindingPerk.DatabindingPerk_onDoFillRow);
		}

		// Add event handlers to component
		this._addPerkHandler(component, "doCollect", DatabindingPerk.DatabindingPerk_onDoCollect);

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

		component.skills.use("setting.enum", component.settings.get("binding"), (sectionName, sectionValue) => {
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
