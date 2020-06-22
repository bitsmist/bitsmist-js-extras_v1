// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

//import Component from './component';
import ResourceUtil from '../util/resource-util';

// =============================================================================
//	Pad class
// =============================================================================

export default class Pad extends BITSMIST.v1.Component
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     */
	constructor()
	{

		super();

		if (this.getOption("resource"))
		{
			/*
			if (this._options["resource"] in this._container["resources"])
			{
				this._resource = this._container["resources"][this._options["resource"]];
			}
			else
			*/
			{
				let defaults = this._app.getSettings("defaults");
				this._resource = new ResourceUtil(this.getOption("resource"), {"router":this._app.router, "baseUrl":defaults["apiBaseUrl"], "version":defaults["apiVersion"] + "-" + defaults["appVersion"], "settings":this._app.getSettings("ajaxUtil")});
			}
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	// -------------------------------------------------------------------------
	//  Callbacks
	// -------------------------------------------------------------------------

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

}

//customElements.define("bm-pad", Pad);
