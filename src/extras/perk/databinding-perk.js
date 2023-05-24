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
			component.vault.get("databinding.store").bindTo(key, elem, callback);
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
			component.vault.get("databinding.store").bindTo(index, key, elem, callback);
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

		this.vault.get("databinding.store").clear();

	}

	// -------------------------------------------------------------------------

	static DatabindingPerk_onDoFill(sender, e, ex)
	{

		if (e.detail.items)
		{
			this.vault.get("databinding.store").replace(e.detail.items);
			FormUtil.showConditionalElements(this, e.detail.items);
		}

	}

	// -------------------------------------------------------------------------

	static DatabindingPerk_onDoFillRow(sender, e, ex)
	{

		DatabindingPerk._bindDataArray(this, e.detail.no, e.detail.element, e.detail.callbacks);
		this.vault.get("databinding.store").replace(e.detail.no, e.detail.item);

	}

	// -------------------------------------------------------------------------

	static DatabindingPerk_onDoCollect(sender, e, ex)
	{

		if (this.settings.get("databinding.options.autoCollect", true))
		{
			e.detail.items = this.vault.get("databinding.store").items;
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
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

		if (component.settings.get("databinding.options.dataType", "single") === "single")
		{
			// Upgrade component
			this.upgrade(component, "skill", "databinding.bindData", function(...args) { return DatabindingPerk._bindData(...args); });
			this.upgrade(component, "vault", "databinding.store", new BindableStore({
				"resources":	component.inventory.get("resource.resources"),
				"direction":	component.settings.get("databinding.options.direction", "two-way"),
			}));
			this.upgrade(component, "event", "afterTransform", DatabindingPerk.DatabindingPerk_onAfterTransform);
			this.upgrade(component, "event", "doFill", DatabindingPerk.DatabindingPerk_onDoFill);
		}
		else
		{
			// Upgrade component
			this.upgrade(component, "skill", "databinding.bindData", function(...args) { return DatabindingPerk._bindDataArray(...args); });
			this.upgrade(component, "vault", "databinding.store", new BindableArrayStore({
				"resources":	component.resources,
				"direction":	component.settings.get("databinding.options.direction", "two-way"),
			}));
			this.upgrade(component, "event", "beforeFill", DatabindingPerk.DatabindingPerk_onBeforeFill);
			this.upgrade(component, "event", "doFillRow", DatabindingPerk.DatabindingPerk_onDoFillRow);
		}

		// Upgrade component
		this.upgrade(component, "event", "doCollect", DatabindingPerk.DatabindingPerk_onDoCollect);

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

		Object.entries(component.settings.get("databinding", {})).forEach(([sectionName, sectionValue]) => {
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
