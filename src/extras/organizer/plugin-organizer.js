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
//	Plugin organizer class
// =============================================================================

export default class PluginOrganizer
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

		component._plugins = {};

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

		let plugins = component.settings.get("plugins");
		if (plugins)
		{
			Object.keys(plugins).forEach((pluginName) => {
				PluginOrganizer._addPlugin(component, pluginName, plugins[pluginName]);
			});
		}

		return Promise.resolve();

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if event is target.
	 *
	 * @param	{String}		eventName			Event name.
	 *
	 * @return 	{Boolean}		True if it is target.
	 */
	static isTarget(eventName)
	{

		let ret = false;

		if (eventName == "*" || eventName == "beforeStart")
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Add a plugin to the component.
	 *
	 * @param	{String}		pluginName			Plugin name.
	 * @param	{Object}		options				Options for the plugin.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _addPlugin(component, pluginName, options)
	{

		options = Object.assign({}, options);
		let className = ( "className" in options ? options["className"] : pluginName );
		let plugin = null;

		// CreatePlugin
		plugin = BITSMIST.v1.ClassUtil.createObject(className, component, options);
		component._plugins[pluginName] = plugin;

		return plugin;

	}

}
