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

// =============================================================================
//	Databinding organizer class
// =============================================================================

export default class DatabindingOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "DatabindingOrganizer";

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"bindings",
			"order":		320,
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add properties
		Object.defineProperty(component, 'bindings', {
			get() { return this._bindings; },
		});

		if (component.settings.get("bindings.settings.type", "single") === "single")
		{
			// Add methods
			component.bindData = function(...args) { return DatabindingOrganizer._bindData(this, ...args); }

			// Init vars
			component._bindings = new BindableStore({
				"direction":	component.settings.get("bindings.settings.direction", "two-way"),
			});

			// Add event handlers to component
			this._addOrganizerHandler(component, "afterTransform", DatabindingOrganizer.DatabindingOrganizer_onAfterTransform);
			this._addOrganizerHandler(component, "doFill", DatabindingOrganizer.DatabindingOrganizer_onDoFill);
		}
		else
		{
			// Add methods
			component.bindData = function(...args) { return DatabindingOrganizer._bindDataArray(this, ...args); }

			// Init vars
			component._bindings = new BindableArrayStore({
				"direction":	component.settings.get("bindings.settings.direction", "two-way"),
			});

			// Add event handlers to component
			this._addOrganizerHandler(component, "doFillRow", DatabindingOrganizer.DatabindingOrganizer_onDoFillRow);
		}

		// Add event handlers to component
		this._addOrganizerHandler(component, "doCollect", DatabindingOrganizer.DatabindingOrganizer_onDoCollect);

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static DatabindingOrganizer_onAfterTransform(sender, e, ex)
	{

		DatabindingOrganizer._bindData(this);

	}

	// -------------------------------------------------------------------------

	static DatabindingOrganizer_onDoFill(sender, e, ex)
	{

		if (e.detail.items)
		{
			this._bindings.replace(e.detail.items);
		}

	}

	// -------------------------------------------------------------------------

	static DatabindingOrganizer_onDoFillRow(sender, e, ex)
	{

		DatabindingOrganizer._bindDataArray(this, e.detail.no, e.detail.element, e.detail.callbacks);
		this._bindings.replace(e.detail.no, e.detail.item);

	}

	// -------------------------------------------------------------------------

	static DatabindingOrganizer_onDoCollect(sender, e, ex)
	{

		if (this.settings.get("bindings.settings.autoCollect", true))
		{
			e.detail.items = this._bindings.items;
		}

	}

	// -------------------------------------------------------------------------
	//  Protected
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

		let nodes = rootNode.querySelectorAll("[bm-bind]");
		nodes = Array.prototype.slice.call(nodes, 0);
		if (rootNode.matches("[bm-bind]"))
		{
			nodes.push(rootNode);
		}
		nodes.forEach(elem => {
			// Get a callback function from settings
			let key = elem.getAttribute("bm-bind");
			let callback = DatabindingOrganizer.__getCallback(component, key);

			// Bind
			component._bindings.bindTo(key, elem, callback);
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
			// Get a callback function from settings
			let key = elem.getAttribute("bm-bind");
			let callback = DatabindingOrganizer.__getCallback(component, key);

			// Bind
			component._bindings.bindTo(index, key, elem, callback);
		});

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Get a callback function from settings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		key					Field name.
	 */
	static __getCallback(component, key)
	{

		let callback;

		component._enumSettings(component.settings.get("bindings"), (sectionName, sectionValue) => {
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
