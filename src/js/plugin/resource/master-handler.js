// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import MasterUtil from '../../util/master-util';
import Plugin from '../plugin';

// =============================================================================
//	Master handler class
// =============================================================================

export default class MasterHandler extends Plugin
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		component			Component which the plugin
	 * 												is attached to.
	 * @param	{Object}		options				Options for the component.
     */
	constructor(component, options)
	{

		super(component, options);

		this._masters = {};

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	 * After spec load event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	 */
	onAfterConnect(sender, e, ex)
	{

		return this.__initMasters(this._component.settings.get("masters"));

	}

	// -------------------------------------------------------------------------

	/**
	 * After spec load event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	 */
	onAfterSpecLoad(sender, e, ex)
	{

		return this.__initMasters(BITSMIST.v1.Util.safeGet(this._component, "_spec.masters"));

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Init masters.
	 *
	 * @param	{Object}		masters				Masters settings.
	 */
	__initMasters(masters)
	{

		return new Promise((resolve, reject) => {
			let promises = [];

			if (masters)
			{
				let settings = this._component.settings.get("ajaxUtil", {});
				settings["url"]["COMMON"]["baseUrl"] = this._component.settings.get("system.apiBaseUrl", "");
				Object.keys(masters).forEach((masterName) => {
					this._masters[masterName] = new MasterUtil(masterName, Object.assign({
						"settings": settings,
					}, masters[masterName]));

					if (masters[masterName]["autoLoad"])
					{
						promises.push(new Promise((resolve, reject) => {
							this._masters[masterName].load().then(() => {
								this[masterName] = this._masters[masterName];
								resolve();
							});
						}));
					}
					else
					{
						this[masterName] = this._masters[masterName];
					}
				});
			}

			Promise.all(promises).then(() => {
				resolve();
			});
		});

	}

	// -----------------------------------------------------------------------------
	//  Protected
	// -----------------------------------------------------------------------------

	/**
	 * Get plugin options.
	 *
	 * @return  {Object}		Options.
	 */
	_getOptions()
	{

		return {
			"events": {
				"afterConnect": this.onAfterConnect,
				"afterSpecLoad": this.onAfterSpecLoad,
			}
		};

	}

}
