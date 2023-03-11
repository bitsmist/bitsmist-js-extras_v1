// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

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

		// Add methods
		component.bindData = function(data) { return DatabindingOrganizer._bindData(this, data); }

		// Init vars
		component._bindings = new BindableStore({
			"callback": component.settings.get("bindings.settings.callback"),
			"type":		component.settings.get("bindings.settings.type", "two-way"),
		});

		// Add event handlers to component
		this._addOrganizerHandler(component, "afterTransform", DatabindingOrganizer.DatabindingOrganizer_onAfterTransform);
		this._addOrganizerHandler(component, "afterFetch", DatabindingOrganizer.DatabindingOrganizer_onAfterFetch);
		this._addOrganizerHandler(component, "doCollect", DatabindingOrganizer.DatabindingOrganizer_onDoCollect);

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static DatabindingOrganizer_onDoCollect(sender, e, ex)
	{

		if (this.settings.get("bindings.settings.autoCollect", true))
		{
			e.detail["items"] = this._bindings.items;
		}

	}

	// -------------------------------------------------------------------------

	static DatabindingOrganizer_onAfterTransform(sender, e, ex)
	{

		DatabindingOrganizer._bindData(this);

	}

	// -------------------------------------------------------------------------

	static DatabindingOrganizer_onAfterFetch(sender, e, ex)
	{

		if (e.detail.items)
		{
			this._bindings.items = e.detail.items;
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
		nodes.forEach(elem => {
			// Get a callback function from settings
			let key = elem.getAttribute("bm-bind");
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

			// Bind
			component._bindings.bindTo(key, elem, callback);
		});

	}

}
