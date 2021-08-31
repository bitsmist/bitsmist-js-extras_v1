// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ValidationHandler from "./validation-handler.js";

// =============================================================================
//	HTML5 Form validation Handler class
// =============================================================================

export default class HTML5FormValidationHandler extends ValidationHandler
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Check validity.
	 *
	 * @param	{String}		itemName			Target item name. All when not specified.
	 */
	checkValidity(values, rules)
	{

		let form = this._component.querySelector("form");

		BITSMIST.v1.Util.assert(form, `FormValidationHandler.checkValidity(): Form tag does not exist.`, TypeError);
		BITSMIST.v1.Util.assert(form.checkValidity, `FormValidationHandler.checkValidity(): check validity not supported.`, TypeError);

		this._component._validationResult["result"] = form.checkValidity();

	}

	// -------------------------------------------------------------------------

	/**
	 * Report validity.
	 *
	 * @param	{String}		itemName			Target item name. All when not specified.
	 */
	reportValidity(values, rules)
	{

		let form = this._component.querySelector("form");

		BITSMIST.v1.Util.assert(form, `FormValidationHandler.reportValidity(): Form tag does not exist.`, TypeError);
		BITSMIST.v1.Util.assert(form.reportValidity, `FormValidationHandler.reportValidity(): Report validity not supported.`, TypeError);

		form.reportValidity();

	}

}
