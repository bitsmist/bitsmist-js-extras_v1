// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import MasterUtil from '../../util/master-util';

// =============================================================================
//	Cookie preference handler class
// =============================================================================

//export default class CookiePreferenceHandler extends BITSMIST.v1.Plugin
export default class MasterHandler
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

//		super(component, options);

		this._component = component;
		this._options = options;
		this._events = {
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

			if (e.detail.spec && e.detail.spec.masters)
			{
				Object.keys(e.detail.spec.masters).forEach((masterName) => {
					this._masters[masterName] = new MasterUtil(masterName, Object.assign({
						"router":	this._component.app.router,
						"version":	this._component.app.settings.items["system"]["apiVersion"] + "-" + this._component.app.settings.items["system"]["appVersion"],
						"baseUrl":	this._component.app.settings.items["system"]["apiBaseUrl"],
						"settings":	this._component.app.settings.items["ajaxUtil"]
					}, e.detail.spec.masters[masterName]));

					if (e.detail.spec.masters[masterName]["autoLoad"])
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
