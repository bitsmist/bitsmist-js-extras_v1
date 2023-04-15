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
//	TagLoader class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

export default function TagLoader()
{

	// super()
	return Reflect.construct(HTMLElement, [], this.constructor);

}

BM.ClassUtil.inherit(TagLoader, BM.Component);

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Start components.
 *
 * @param	{Object}		settings			Settings.
 *
 * @return  {Promise}		Promise.
 */
TagLoader.prototype.start = function(settings)
{

	// Defaults
	let defaults = {
		"settings": {
			"name": "TagLoader",
		},
	};
	settings = ( settings ? BM.Util.deepMerge(defaults, settings) : defaults );

	// super()
	return BM.Component.prototype.start.call(this, settings).then(() => {
		if (document.readyState !== "loading")
		{
			BM.LoaderPerk.load(document.body, this.settings);
		}
		else
		{
			document.addEventListener("DOMContentLoaded", () => {
				BM.LoaderPerk.load(document.body, this.settings);
			});
		}
	});

}

// -----------------------------------------------------------------------------

customElements.define("bm-tagloader", TagLoader);
