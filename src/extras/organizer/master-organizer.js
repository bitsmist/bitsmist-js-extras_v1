// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import MasterUtil from '../util/master-util';

// =============================================================================
//	Master organizer class
// =============================================================================

export default class MasterOrganizer extends BITSMIST.v1.Organizer
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

		// Add properties
		Object.defineProperty(component, 'masters', {
			get() { return this._masters; },
		});

		// Add methods
//		component.addMaster = function(masterName, options, ajaxSettings) { return MasterOrganizer._initMaster(this, masterName, options, ajaxSettings); }

		// Init vars
		component._masters = {};

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

		let promises = [];

		let masters = settings["masters"];
		if (masters)
		{
			// Get ajax settings
			let settings = component.settings.get("ajaxUtil", {});
			settings["url"]["COMMON"]["baseUrl"] = component.settings.get("system.apiBaseUrl", "");

			// Process each master
			Object.keys(masters).forEach((masterName) => {
				promises.push(this._initMaster(component, masterName, masters[masterName], settings));
			});
		}

		return Promise.all(promises).then(() => {
			return settings;
		});

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Init masters.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		masterName			Master name.
	 * @param	{Object}		options				Masters settings.
	 * @param	{Object}		settings			Ajax settings.
	 */
	static _initMaster(component, masterName, options, settings)
	{

		component._masters[masterName] = new MasterUtil(masterName, Object.assign({"settings": settings}, options));

		if (options["autoLoad"])
		{
			return component._masters[masterName].load();
		}

	}

}
