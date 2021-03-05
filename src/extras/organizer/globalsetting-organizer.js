// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Global setting organzier class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

export default class GlobalsettingOrganizer extends BITSMIST.v1.Organizer
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
	 */
	static init(conditions, component, settings)
	{

		component.addEventHandler(component, "afterStart", GlobalsettingOrganizer.onAfterStart, {"component": component});
		BITSMIST.v1.Globals["settings"].items = component.settings.items["settings"];

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	* After append event hadler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	* @param	{Object}		ex					Extra event info.
	*/
	static onAfterStart(sender, e, ex)
	{

		BITSMIST.v1.Globals["settings"].items = ex.options.component.settings.items["settings"];

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	* Get a value.
	*
	* @param	{String}		key					Key.
	* @param	{Object}		defaultValue		Value returned when key is not found.
	*
	* @return  {*}				Value.
	*/
	static _get(key, defaultValue)
	{

		return BITSMIST.v1.Globals["settings"].get(key, defaultValue);

	}

	// -------------------------------------------------------------------------

	/**
	* Set a valuee.
	*
	* @param	{String}		key					Key.
	* @param	{Object}		value				Value to store.
	*/
	static _set(key, value)
	{

		BITSMIST.v1.Globals["settings"].set(key, value);

	}

}
