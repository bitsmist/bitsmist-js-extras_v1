// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ResourceUtil from '../util/resource-util';

// =============================================================================
//	Pad class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function Pad()
{

	let _this = Reflect.construct(BITSMIST.v1.Component, [], this.constructor);

	_this._resource;

	if (_this.getOption("resource"))
	{
		let defaults = _this.app.settings["system"];
		_this._resource = new ResourceUtil(_this.getOption("resource"), {
			"router":_this.app.router,
			"baseUrl":defaults["apiBaseUrl"],
			"version":defaults["apiVersion"] + "-" + defaults["appVersion"],
			"settings":_this.app.settings["ajaxUtil"]
		});
	}

	return _this;

}

BITSMIST.v1.LoaderUtil.inherit(Pad, BITSMIST.v1.Component);
