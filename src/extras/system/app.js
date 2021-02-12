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
//	App class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function App()
{

	// super()
	return Reflect.construct(BITSMIST.v1.Component, [], this.constructor);

}

BITSMIST.v1.ClassUtil.inherit(App, BITSMIST.v1.Component);
customElements.define("bm-app", App);
