// =============================================================================
//	Tab Content Class
// =============================================================================

export default class TabContent extends BITSMIST.v1.Component
{

	// -------------------------------------------------------------------------
	//	Settings
	// -------------------------------------------------------------------------

	_getSettings()
	{

		return {
			"settings": {
				"name":					"BmTabcontent",
				"hasTemplate":			false,
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
		this.querySelector(":scope > [data-tabindex='" + index + "']").classList.add("active");
		this.querySelector(":scope > [data-tabindex='" + index + "']").focus();
//		this.querySelector(":scope nth-child(" + index + ")").classList.add("active");
//		this.querySelector(":scope > [data-index='" + index + "']").focus();

	}

	// -------------------------------------------------------------------------

	/**
	 * Get a current active content.
	 *
 	 * @return  {HTMLElement}	Current active element.
	 */
	getActiveContent()
	{

		return this.querySelector(":scope .active");

	}

}

customElements.define("bm-tabcontent", TabContent);
