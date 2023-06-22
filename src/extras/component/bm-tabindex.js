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

export default class TabIndex extends BM.Component
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
			"event": {
				"events": {
					"tab-indices": {
						"rootNode": 			"[data-tabindex]",
						"handlers": {
							"click": 			["TabIndex_onTabIndexClick"]
						}
					},
				}
			},
		}

	}

	// -------------------------------------------------------------------------
	//	Event Handlers
	// -------------------------------------------------------------------------

	TabIndex_onTabIndexClick(sender, e, ex)
	{

		if (sender.classList.contains("active")) {
			return;
		}

		this.switchIndex(sender.getAttribute("data-tabindex"));

	}

	// -------------------------------------------------------------------------
	//	Methods
	// -------------------------------------------------------------------------

	/**
	 * Switch to the specified index.
	 *
	 * @param	{String}		index				Index.
	 */
	switchIndex(index)
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

	// -------------------------------------------------------------------------

	/**
	 * Get the current active index.
	 *
	 * @return  {HTMLElement}	Current active element.
	 */
	getActiveIndex()
	{

		return this.querySelector(":scope .active");

	}

}

customElements.define("bm-tabindex", TabIndex);
