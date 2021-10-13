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
//	TagLoader class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function TagLoader()
{

	// super()
	return Reflect.construct(HTMLElement, [], this.constructor);

}

BITSMIST.v1.ClassUtil.inherit(TagLoader, BITSMIST.v1.Component);

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
	settings = ( settings ? BITSMIST.v1.Util.deepMerge(defaults, settings) : defaults );

	// super()
	return BITSMIST.v1.Component.prototype.start.call(this, settings).then(() => {
		if (document.readyState !== "loading")
		{
			BITSMIST.v1.LoaderOrganizer.load(document.body, this.settings);
		}
		else
		{
			document.addEventListener("DOMContentLoaded", () => {
				BITSMIST.v1.LoaderOrganizer.load(document.body, this.settings);
			});
		}
	});

}

// -----------------------------------------------------------------------------

customElements.define("bm-tagloader", TagLoader);
