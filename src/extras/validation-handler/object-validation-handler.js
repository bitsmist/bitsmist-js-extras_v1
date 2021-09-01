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
//	Object validation Handler class
// =============================================================================

export default class ObjectValidationHandler extends ValidationHandler
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
	static validate(values, rules)
	{

		let invalids = [];

		Object.keys(values).forEach((key) => {
			if (rules[key])
			{
				let failed = ObjectValidationHandler._validateValue(key, values[key], rules[key]);
				if (failed.length > 0)
				{
					let invalid = {"key":key, "value":values[key], "failed":failed};
					invalid["message"] = ValidationHandler._getFunctionValue(key, values[key], "message", rules[key]);
					invalid["fix"] = ValidationHandler._getFunctionValue(key, values[key], "fix", rules[key]);
					invalids.push(invalid);
				}
			}
		});

		return invalids;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check validity.
	 *
	 * @param	{Object}		values				Values to validate.
	 * @param	{Object}		rules				Validation rules.
	 */
	checkValidity(values, rules)
	{

		let invalids = ObjectValidationHandler.validate(values, rules);

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
	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Validate a single value.
	 *
	 * @param	{String}		key					Item name.
	 * @param	{Object}		value				Value to validate.
	 * @param	{Object}		rules				Validation rules.
	 */
	static _validateValue(key, value, rules)
	{

		let failed = [];

		Object.keys(rules["constraints"]).forEach((constraintName) => {
			let result = ObjectValidationHandler._checkConstraint(key, value, constraintName, rules["constraints"][constraintName]);
			if (result)
			{
				failed.push(result);
			}
		});

		return failed;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check a single constraint.
	 *
	 * @param	{String}		key					Item name.
	 * @param	{Object}		value				Value to validate.
	 * @param	{String}		constraintName		Constraint name.
	 * @param	{Object}		rule				Validation rules.
	 */
	static _checkConstraint(key, value, constraintName, rule)
	{

		let result;
		let len;
		let num;

		switch (constraintName)
		{
		case "required":
			if (!value)
			{
				result = {"rule":"required", "message":"valueMissing"};
			}
			break;
		case "minlength":
			len = String(value).length;
			if (len < rule)
			{
				result = {"rule":"minlength", "message":"tooShort"};
			}
			break;
		case "maxlength":
			len = String(value).length;
			if (len > rule)
			{
				result = {"rule":"maxlength", "message":"tooLong"};
			}
			break;
		case "min":
			num = parseInt(value);
			if (num < rule)
			{
				result = {"rule":"min", "message":"rangeUnderflow"};
			}
			break;
		case "max":
			num = parseInt(value);
			if (num > rule)
			{
				result = {"rule":"max", "message":"rangeOverflow"};
			}
			break;
		case "pattern":
			let re = new RegExp(rule);
			if (!re.test(value))
			{
				result = {"rule":"pattern", "message":"patternMismatch"};
			}
			break;
		case "valids":
			if (rule.indexOf(value) == -1)
			{
				result = {"rule":"valids", "message":"validsMismatch"};
			}
			break;
		case "custom":
			if (!rule(key, value, rule))
			{
				result = {"rule":"custom", "message":"customMismatch"};
			}
			break;
		}

		return result;

	}

}
