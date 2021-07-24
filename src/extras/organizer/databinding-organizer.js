// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import BindableStore from '../store/bindable-store';

// =============================================================================
//	Databinding organizer class
// =============================================================================

export default class DatabindingOrganizer extends BITSMIST.v1.Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Init.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static init(conditions, component, settings)
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

		 let data = settings["binds"];

		// Bind data after the HTML is appended
		DatabindingOrganizer.update(component, data);

		return settings;

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

		component.binds.items = data;

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

		rootNode.querySelectorAll("[bm-bind]").forEach(elem => {
			component.binds.bindTo(elem);
		});

	}

}
