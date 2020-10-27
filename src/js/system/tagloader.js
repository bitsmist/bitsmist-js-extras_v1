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
//	Tag loader class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		settings			Options for the component.
 */
export default function TagLoader(settings)
{

	// super()
	settings = Object.assign({}, {"name":"TagLoader", "templateName":"", "autoSetup":false}, settings);
	let _this = Reflect.construct(BITSMIST.v1.Component, [settings], this.constructor);

	window.addEventListener('DOMContentLoaded', _this.onDOMContentLoaded.bind(_this));

	return _this;

}

BITSMIST.v1.ClassUtil.inherit(TagLoader, BITSMIST.v1.Component);
customElements.define("bm-tagloader", TagLoader);

// -----------------------------------------------------------------------------
//  Event handlers
// -----------------------------------------------------------------------------

/**
 * Append event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 *
 * @return  {Promise}		Promise.
 */
TagLoader.prototype.onDOMContentLoaded= function(sender, e)
{

	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			if (document.querySelector("bm-setting"))
			{
				return this.waitFor([{"name":"SettingManager", "status":"opened"}]);
				//return this.waitFor([{"rootNode":"bm-setting", "status":"opened"}]); //@@@fix this does not work.
			}
		}).then(() => {
			let path = BITSMIST.v1.Util.concatPath([this._settings.get("system.appBaseUrl", ""), this._settings.get("system.componentPath", "")]);
			let splitComponent = this._settings.get("system.splitComponent", false);
			return this.loadTags(document, path, {"splitComponent":splitComponent});
		}).then(() => {
			resolve();
		});
	});

}

