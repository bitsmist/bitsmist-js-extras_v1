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
export default function Pad(settings)
{

	let _this = Reflect.construct(BITSMIST.v1.Component, [settings], this.constructor);

	return _this;

}

BITSMIST.v1.ClassUtil.inherit(Pad, BITSMIST.v1.Component);
