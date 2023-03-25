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
//	Tab Content Class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

export default function TabContent(settings)
{

	return Reflect.construct(BM.Component, [settings], this.constructor);

}

BM.ClassUtil.inherit(TabContent, BM.Component);

// -----------------------------------------------------------------------------
//	Settings
// -----------------------------------------------------------------------------

TabContent.prototype._getSettings = function()
{

	return {
		// Settings
		"settings": {
			"autoTransform":		false,
			"name":					"BmTabcontent",
		},
	}

}

// -----------------------------------------------------------------------------
//	Methods
// -----------------------------------------------------------------------------

/**
 * Switch to the specified content.
 *
 * @param	{String}		index				Index.
 */
TabContent.prototype.switchContent = function(index)
{

	// Deactivate current active content
	this.querySelector(":scope > .active").classList.remove("active");

	// Activate specified content
	this.querySelector(`:scope > [data-tabindex='${index}']`).classList.add("active");
	this.querySelector(`:scope > [data-tabindex='${index}']`).focus();
//		this.querySelector(`:scope nth-child(${index})`).classList.add("active");
//		this.querySelector(`:scope > [data-index='${index}']`).focus();

}

// -----------------------------------------------------------------------------

/**
 * Get the current active content.
 *
 * @return  {HTMLElement}	Current active element.
 */
TabContent.prototype.getActiveContent = function()
{

	return this.querySelector(":scope .active");

}

// -----------------------------------------------------------------------------

customElements.define("bm-tabcontent", TabContent);
