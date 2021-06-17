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
		Object.defineProperty(component, 'data', {
			get() { return this._data; },
			set(newValue) {
				DatabindingOrganizer.update(this, newValue);
			},
		});

		// Add methods
		component.bindData = function(data) { return DatabindingOrganizer._bindData(this, data); }

		// Init vars
		component._data = new BindableStore();
		//component._data = new BindableStore({"2way":false, "eventName":"keyup"});

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

		component.data.items = data;

		// Bind data to elements
		DatabindingOrganizer._bindData(component);

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

		let data = settings["data"];
		if (data)
		{
			// Bind data after the HTML is appended
			component.addEventHandler("afterAppend", {"handler":DatabindingOrganizer.onAfterAppend, "options":{"data":data}});
		}

		return settings;

	}

	// -----------------------------------------------------------------------------
	//	Event handlers
	// -----------------------------------------------------------------------------

	/**
	 * After append event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	static onAfterAppend(sender, e, ex)
	{

		let component = ex.component;
		let data = ex.options["data"];

		DatabindingOrganizer.update(component, data);

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

		rootNode.querySelectorAll("[data-bind]").forEach(elem => {
			component.data.bindTo(elem);
		});

	}

}
