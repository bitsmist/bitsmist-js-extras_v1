// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import BM from "../bm";

// =============================================================================
//	Plugin base class
// =============================================================================

export default class Plugin
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		component			Component to attach.
	 * @param	{Object}		options				Options.
     */
	constructor(component, options)
	{

		this._component = component
		this._options = new BM.Store({"items":Object.assign({}, options)});
		this._options.merge(this._getOptions());
		this._options.set("name", this._options.get("name", this.constructor.name));

		// Add event handlers
		let events = this._options.get("events", {});
		Object.keys(events).forEach((eventName) => {
			component.addEventHandler(eventName, events[eventName], null, this);
		});

		// Expose plugin
		if (this._options.get("expose"))
		{
			let plugin = this;
			Object.defineProperty(component.__proto__, this._options.get("expose"), {
				get()
				{
					return plugin;
				}
			});
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	* Component name.
	*
	* @type	{String}
	*/
	get name()
	{

		return this._options.get("name");

	}

	// -------------------------------------------------------------------------

	/**
	* Component.
	*
	* @type	{String}
	*/
	get component()
	{

		return this._component;

	}

	set component(value)
	{

		this._component = value;

	}

	// -----------------------------------------------------------------------------
	//  Protected
	// -----------------------------------------------------------------------------

	/**
	 * Get plugin options.  Need to override.
	 *
	 * @return  {Object}		Options.
	 */
	_getOptions()
	{

		return {};

	}

}
