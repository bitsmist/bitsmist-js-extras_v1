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
//	Tab Index Class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

export default function TabIndex(settings)
{

	return Reflect.construct(BM.Component, [settings], this.constructor);

}

BM.ClassUtil.inherit(TabIndex, BM.Component);

// -----------------------------------------------------------------------------
//	Settings
// -----------------------------------------------------------------------------

TabIndex.prototype._getSettings = function()
{

	return {
		"setting": {
			"autoTransform":		false,
			"name":					"BmTabindex",
		},
		"event": {
			"events": {
				"tab-indices": {
					"rootNode": 		"[data-tabindex]",
					"handlers": {
						"click": 		["TabIndex_onTabIndexClick"]
					}
				},
			}
		},
	}

}

// -----------------------------------------------------------------------------
//	Event Handlers
// -----------------------------------------------------------------------------

TabIndex.prototype.TabIndex_onTabIndexClick = function(sender, e, ex)
{

	if (sender.classList.contains("active")) {
		return;
	}

	this.switchIndex(sender.getAttribute("data-tabindex"));

}

// -----------------------------------------------------------------------------
//	Methods
// -----------------------------------------------------------------------------

/**
 * Switch to the specified index.
 *
 * @param	{String}		index				Index.
 */
TabIndex.prototype.switchIndex = function(index)
{

	this.querySelector(":scope [data-tabindex].active").classList.remove("active");
	let tabIndex = this.querySelector(`:scope [data-tabindex='${index}']`);
	tabIndex.classList.add("active");

	let container = document.querySelector(this.getAttribute("data-pair"));
	if (container) {
		container.switchContent(index);
	} else {
		console.log("@@@no pair");
	}

}

// -----------------------------------------------------------------------------

/**
 * Get the current active index.
 *
 * @return  {HTMLElement}	Current active element.
 */
TabIndex.prototype.getActiveIndex = function()
{

	return this.querySelector(":scope .active");

}

// -----------------------------------------------------------------------------

customElements.define("bm-tabindex", TabIndex);
