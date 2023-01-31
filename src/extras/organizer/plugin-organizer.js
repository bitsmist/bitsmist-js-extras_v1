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
//	Plugin organizer class
// =============================================================================

export default class PluginOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"name":			"PluginOrganizer",
			"targetWords":	"plugins",
			"order":		800,
		};

	}

	// -------------------------------------------------------------------------

	static attach(component, options)
	{

		// Init component vars
		component._plugins = {};

		// Add event handlers to component
		this._addOrganizerHandler(component, "afterLoadSettings", PluginOrganizer.onAfterLoadSettings);

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	static onAfterLoadSettings(sender, e, ex)
	{

		let plugins = e.detail.settings["plugins"];
		if (plugins)
		{
			Object.keys(plugins).forEach((pluginName) => {
				PluginOrganizer._addPlugin(this, pluginName, plugins[pluginName]);
			});
		}

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
	 * @return  {Object}		Added plugin.
	 */
	static _addPlugin(component, pluginName, options)
	{

		console.debug(`PluginOrganizer._addPlugin(): Adding a plugin. name=${component.name}, pluginName=${pluginName}`);

		options = options || {};
		let className = ( "className" in options ? options["className"] : pluginName );
		let plugin = null;

		// CreatePlugin
		plugin = BM.ClassUtil.createObject(className, component, options);
		component._plugins[pluginName] = plugin;

		return plugin;

	}

}
