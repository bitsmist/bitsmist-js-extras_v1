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
//	Plugin organize class
// =============================================================================

export default class PluginOrganizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(component, settings)
	{

		if (!component._plugins)
		{
			component._plugins = {};
		}

		let plugins = settings["plugins"];
		if (plugins)
		{
			Object.keys(plugins).forEach((pluginName) => {
				PluginOrganizer.addPlugin(component, pluginName, plugins[pluginName]);
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

		if (eventName == "afterInitComponent" || eventName == "afterStart")
		{
			ret = true;
		}

		return ret;

	}

	// -----------------------------------------------------------------------------

	/**
	 * Add a plugin to the component.
	 *
	 * @param	{String}		pluginName			Plugin name.
	 * @param	{Object}		options				Options for the plugin.
	 *
	 * @return  {Promise}		Promise.
	 */
	static addPlugin(component, pluginName, options)
	{

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			let className = ( "className" in options ? options["className"] : pluginName );
			let plugin = null;

			// CreatePlugin
			plugin = BITSMIST.v1.ClassUtil.createObject(className, component, options);
			component._plugins[pluginName] = plugin;

			resolve(plugin);
		});

	}

}
