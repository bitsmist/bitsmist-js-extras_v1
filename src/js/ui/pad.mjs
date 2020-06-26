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
			let defaults = this.globalSettings["defaults"];
			this._resource = new ResourceUtil(this.getOption("resource"), {"router":this.router, "baseUrl":defaults["apiBaseUrl"], "version":defaults["apiVersion"] + "-" + defaults["appVersion"], "settings":this.globalSettings["ajaxUtil"]});
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
