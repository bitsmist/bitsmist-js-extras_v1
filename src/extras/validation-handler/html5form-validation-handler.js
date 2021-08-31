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
	 * Validate.
	 *
	 * @param	{Object}		values				Values to validate.
	 * @param	{Object}		rules				Validation rules.
	 */
	static validate(form, rules)
	{

		BITSMIST.v1.Util.assert(form, `FormValidationHandler.checkValidity(): Form tag does not exist.`, TypeError);
		BITSMIST.v1.Util.assert(form.checkValidity, `FormValidationHandler.checkValidity(): check validity not supported.`, TypeError);

		return form.checkValidity();

	}

	/*
	static validate(form, rules)
	{

		let invalids = {};

		BITSMIST.v1.Util.assert(form, `FormValidationHandler.checkValidity(): Form tag does not exist.`, TypeError);
		BITSMIST.v1.Util.assert(form.checkValidity, `FormValidationHandler.checkValidity(): check validity not supported.`, TypeError);

		let elements = form.querySelectorAll("input")
		elements = Array.prototype.slice.call(elements, 0);
		elements.forEach((element) => {
			if (!element.checkValidity())
			{
				let key = ;
				let value = ;
				let failed = {};
				invalids[key] = {"value":value, "failed":failed};
				result = false;
			}
		});

		return invalids;

	}
	*/

	// -------------------------------------------------------------------------

	/**
	 * Check validity.
	 *
	 * @param	{Object}		values				Values to validate.
	 * @param	{Object}		rules				Validation rules.
	 */
	checkValidity(values, rules)
	{

		let form = this._component.querySelector("form");

		this._component._validationResult["result"] = HTML5FormValidationHandler.validate(form, rules);

	}

	// -------------------------------------------------------------------------

	/**
	 * Report validity.
	 *
	 * @param	{Object}		values				Values to validate.
	 * @param	{Object}		rules				Validation rules.
	 */
	reportValidity(values, rules)
	{

		let form = this._component.querySelector("form");

		BITSMIST.v1.Util.assert(form, `FormValidationHandler.reportValidity(): Form tag does not exist.`, TypeError);
		BITSMIST.v1.Util.assert(form.reportValidity, `FormValidationHandler.reportValidity(): Report validity not supported.`, TypeError);

		form.reportValidity();

	}

}
