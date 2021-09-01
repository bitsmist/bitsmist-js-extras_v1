// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import FormUtil from "../util/form-util.js";
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

		let invalids = [];

		BITSMIST.v1.Util.assert(form, `FormValidationHandler.checkValidity(): Form tag does not exist.`, TypeError);
		BITSMIST.v1.Util.assert(form.checkValidity, `FormValidationHandler.checkValidity(): check validity not supported.`, TypeError);

		let elements = form.querySelectorAll("input:not([novalidate])")
		elements = Array.prototype.slice.call(elements, 0);
		elements.forEach((element) => {
			let key = element.getAttribute("bm-bind");
			let value = FormUtil.getValue(element);
			let rule = ( rules && rules[key] ? rules[key] : null );

			let failed = HTML5FormValidationHandler._validateValue(element, key, value, rule);
			if (failed.length > 0)
			{
				let invalid = {"element":element, "key":key, "value":value, "failed":failed, "message":element.validationMessage};
				if (rule)
				{
					invalid["message"] = ValidationHandler._getFunctionValue(key, value, "message", rule);
					invalid["fix"] = ValidationHandler._getFunctionValue(key, value, "fix", rule);
				}
				invalids.push(invalid);
			}
		});

		return invalids;

	}

	/*
	static validate(form, rules)
	{

		let invalids = [];

		BITSMIST.v1.Util.assert(form, `FormValidationHandler.checkValidity(): Form tag does not exist.`, TypeError);
		BITSMIST.v1.Util.assert(form.checkValidity, `FormValidationHandler.checkValidity(): check validity not supported.`, TypeError);

		if (!form.checkValidity())
		{
			let invalid = {"element":form, "message":form.validationMessage};
			invalids.push(invalid);
		}

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
		let invalids = HTML5FormValidationHandler.validate(form, rules);

		this._component.validationResult["result"] = ( invalids.length > 0 ? false : true );
		this._component.validationResult["invalids"] = invalids;

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

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Validate a single value.
	 *
	 * @param	{HTMLElement}	element				HTML element to validaate.
	 * @param	{String}		key					Item name.
	 * @param	{Object}		value				Value to validate.
	 * @param	{Object}		rules				Validation rules.
	 */
	static _validateValue(element, key, value, rules)
	{

		let failed = [];

		let result = element.validity;
		if (!result.valid)
		{
			for (const errorName in result)
			{
				if (errorName !== "valid" && result[errorName])
				{
					failed.push({"message":errorName});
				}
			}
		}

		return failed;

	}

}
