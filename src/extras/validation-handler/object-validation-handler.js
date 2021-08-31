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
	 * Check validity.
	 *
	 * @param	{Object}		values				Values to validate.
	 * @param	{Object}		rules				Validation rules.
	 */
	checkValidity(values, rules)
	{

		let result = true;
		let invalids = {};

		Object.keys(values).forEach((key) => {
			if (rules[key])
			{
				let failed = this._validateValue(key, values[key], rules[key]);
				if (failed.length > 0)
				{
					invalids[key] = {"value":values[key], "failed":failed};
					invalids[key]["message"] = this.__getFunctionValue(key, values[key], "message", rules[key]);
					invalids[key]["fix"] = this.__getFunctionValue(key, values[key], "fix", rules[key]);

					result = false;
				}
			}
		});

		this._component.validationResult["result"] = result;
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
	_validateValue(key, value, rules)
	{

		let failed = [];

		Object.keys(rules["constraints"]).forEach((constraintName) => {
			let result = this._checkConstraint(key, value, constraintName, rules["constraints"][constraintName]);
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
	_checkConstraint(key, value, constraintName, rule)
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

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Get a value from a custom function or a value.
	 *
	 * @param	{String}		key					Item name.
	 * @param	{Object}		value				Value to validate.
	 * @param	{String}		target				Target name.
	 * @param	{Object}		rule				Validation rules.
	 */
	__getFunctionValue(key, value, target, rule)
	{

		let ret;

		if (target in rule)
		{
			if (typeof rule[target] == "function")
			{
				ret = rule[target](key, value, rule);
			}
			else
			{
				ret = rule[target];
			}
		}

		return ret;

	}

}
