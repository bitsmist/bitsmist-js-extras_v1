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
import ValidationHandler from "./validation-handler.js";
import ValueUtil from "../util/value-util.js";

// =============================================================================
//	HTML5 Form validation Handler class
// =============================================================================

export default class HTML5FormValidationHandler extends ValidationHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	constructor(component, validatorName, options)
	{

		super(component, validatorName, options);

		this._valueHandler = this.options.get("valueHandler", ValueUtil);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	validate(form, rules)
	{

		let invalids = {};

		BM.Util.assert(form, `FormValidationHandler.checkValidity(): Form tag does not exist.`, TypeError);
		BM.Util.assert(form.checkValidity, `FormValidationHandler.checkValidity(): check validity not supported.`, TypeError);

		let elements = BM.Util.scopedSelectorAll(form, "input:not([novalidate])")
		elements.forEach((element) => {
			let key = element.getAttribute("bm-bind");
			let value = this._valueHandler.getValue(element);
			let rule = ( rules && rules[key] ? rules[key] : null );

			let failed = this._validateValue(element, key, value, rule);
			if (failed.length > 0)
			{
				invalids[key] = this.createValidationResult(key, value, rule, failed, {"element": element});
				invalids["message"] = invalids["message"] || element.validationMessage;
			}
		});

		return invalids;

	}

	/*
	static validate(form, rules)
	{

		let invalids = [];

		BM.Util.assert(form, `FormValidationHandler.checkValidity(): Form tag does not exist.`, TypeError);
		BM.Util.assert(form.checkValidity, `FormValidationHandler.checkValidity(): check validity not supported.`, TypeError);

		if (!form.checkValidity())
		{
			let invalid = {"element":form, "message":form.validationMessage};
			invalids.push(invalid);
		}

		return invalids;

	}
	*/

	// -------------------------------------------------------------------------

	checkValidity(values, rules, options)
	{

		let invalids1 = {};
		let invalids2;
		let form = this._component.querySelector("form");
		if (rules || options)
		{
			// Check allow/disallow list
			let values = this._valueHandler.getFields(form);
			invalids1 = super.validate(values, rules, options);
		}
		invalids2 = this.validate(form, rules);
		let invalids = BM.Util.deepMerge(invalids1, invalids2);

		this._component.validationResult["result"] = ( Object.keys(invalids).length > 0 ? false : true );
		this._component.validationResult["invalids"] = invalids;

	}

	// -------------------------------------------------------------------------

	reportValidity(values, rules)
	{

		let form = this._component.querySelector("form");

		BM.Util.assert(form, `FormValidationHandler.reportValidity(): Form tag does not exist.`, TypeError);
		BM.Util.assert(form.reportValidity, `FormValidationHandler.reportValidity(): Report validity not supported.`, TypeError);

		form.reportValidity();

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Validate the single value.
	 *
	 * @param	{HTMLElement}	element				HTML element to validaate.
	 * @param	{String}		key					Item name.
	 * @param	{Object}		value				Value to validate.
	 * @param	{Object}		rules				Validation rules.
	 *
 	 * @return  {Object}		Failed results.
	 */
	_validateValue(element, key, value, rules)
	{

		let failed = [];

		let result = element.validity;
		if (!result.valid)
		{
			for (const errorName in result)
			{
				if (errorName !== "valid" && result[errorName])
				{
					failed.push({"validity":errorName});
				}
			}
		}

		return failed;

	}

}
