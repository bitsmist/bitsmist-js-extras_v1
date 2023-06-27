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

export default class TabContent extends BM.Unit
{

	// -------------------------------------------------------------------------
	//	Settings
	// -------------------------------------------------------------------------

	_getSettings()
	{

		return {
			"basic": {
				"options": {
					"autoTransform":			false,
				}
			},
		}

	}

	// -------------------------------------------------------------------------
	//	Methods
	// -------------------------------------------------------------------------

	/**
	 * Switch to the specified content.
	 *
	 * @param	{String}		index				Index.
	 */
	switchContent(index)
	{

		// Deactivate current active content
		this.querySelector(":scope > .active").classList.remove("active");

		// Activate specified content
		this.querySelector(`:scope > [data-tabindex='${index}']`).classList.add("active");
		this.querySelector(`:scope > [data-tabindex='${index}']`).focus();
	//		this.querySelector(`:scope nth-child(${index})`).classList.add("active");
	//		this.querySelector(`:scope > [data-index='${index}']`).focus();

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the current active content.
	 *
	 * @return  {HTMLElement}	Current active element.
	 */
	getActiveContent()
	{

		return this.querySelector(":scope .active");

	}

}

customElements.define("bm-tabcontent", TabContent);
