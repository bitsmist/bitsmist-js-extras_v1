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

// =============================================================================
//	Databinding organizer class
// =============================================================================

export default class DatabindingOrganizer extends BITSMIST.v1.Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"name":			"DatabindingOrganizer",
			"targetWords":	"binds",
			"order":		320,
		};

	}

	// -------------------------------------------------------------------------

	static attach(component, options)
	{

		// Add properties
		Object.defineProperty(component, 'binds', {
			get() { return this._binds; },
			set(newValue) {
				DatabindingOrganizer.update(this, newValue);
			},
		});

		// Add methods
		component.bindData = function(data) { return DatabindingOrganizer._bindData(this, data); }
		component.update = function(data) { return DatabindingOrganizer._update(this, data); }

		// Init vars
		component._binds = new BindableStore();

	}

	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(conditions, component, settings)
	{

		switch (conditions)
		{
			case "afterTransform":
				DatabindingOrganizer._bindData(component);
				break;
			case "afterFetch":
				let bindings = settings["bindings"];
				if (bindings)
				{

					DatabindingOrganizer.setResource(component, bindings);
				}
				break;
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Set resource to the component.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static setResource(component, settings)
	{

		let resourceName = settings["resourceName"];

		component._binds.replace(component.resources[resourceName].item);

	}

	// -------------------------------------------------------------------------

	/**
	 * Update bindings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{HTMLElement}	rootNode			Root node.
	 */
	static update(component, data)
	{

		component._binds.items = data;

		// Bind data to elements
		DatabindingOrganizer._bindData(component);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Bind data and elemnets.
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
			component._binds.bindTo(elem);
		});

	}

}
