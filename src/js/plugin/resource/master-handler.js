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

		this._options["events"] = {
			"specLoad": this.onSpecLoad,
		}
		this._masters = {};

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	 * Spec Load event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	onSpecLoad(sender, e)
	{

		return new Promise((resolve, reject) => {
			let promises = [];

			if (this._component._spec && this._component._spec["masters"])
			{
				let masters = this._component._spec["masters"];
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

}
