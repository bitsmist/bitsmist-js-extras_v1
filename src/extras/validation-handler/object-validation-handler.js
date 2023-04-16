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

// =============================================================================
//	Object validation Handler class
// =============================================================================

export default class ObjectValidationHandler extends ValidationHandler
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	validate(values, rules)
	{

		let invalids = {};

		if (rules)
		{
			Object.keys(values).forEach((key) => {
				if (rules[key])
				{
					let failed = this._validateValue(key, values[key], rules[key]);
					if (failed.length > 0)
					{
						invalids[key] = this.createValidationResult(key, values[key], rules[key], failed);
					}
				}
			});
		}

		return invalids;

	}

	// -------------------------------------------------------------------------

	checkValidity(values, rules, options)
	{

		let invalids1 = super.validate(values, rules, options); // Check allow/disallow/required
		let invalids2 = this.validate(values, rules);
		let invalids = BM.Util.deepMerge(invalids1, invalids2);

		this._component.stats.set("validation.validationResult.result", ( Object.keys(invalids).length > 0 ? false : true ));
		this._component.stats.set("validation.validationResult.invalids", invalids);

	}

	// -------------------------------------------------------------------------

	reportValidity(values, rules)
	{
	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Validate the single value.
	 *
	 * @param	{String}		key					Item name.
	 * @param	{Object}		value				Value to validate.
	 * @param	{Object}		rules				Validation rules.
	 *
 	 * @return  {Object}		Failed results.
	 */
	_validateValue(key, value, rules)
	{

		let failed = [];

		if (rules && rules["constraints"])
		{
			Object.keys(rules["constraints"]).forEach((constraintName) => {
				let result = this._checkConstraint(key, value, constraintName, rules["constraints"][constraintName]);
				if (result)
				{
					failed.push(result);
				}
			});
		}

		return failed;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check the single constraint.
	 *
	 * @param	{String}		key					Item name.
	 * @param	{Object}		value				Value to validate.
	 * @param	{String}		constraintName		Constraint name.
	 * @param	{Object}		rule				Validation rules.
	 *
 	 * @return  {Object}		Failed result.
	 */
	_checkConstraint(key, value, constraintName, rule)
	{

		let result;
		let len;
		let num;

		switch (constraintName)
		{
		case "type":
			result = this._checkType(key, value, constraintName, rule);
			break;
		case "required":
			if (!value)
			{
				result = {"rule":"required", "validity":"valueMissing"};
			}
			break;
		case "minlength":
			len = String(value).length;
			if (len < rule)
			{
				result = {"rule":"minlength", "validity":"tooShort(min:" + rule + ")"};
			}
			break;
		case "maxlength":
			len = String(value).length;
			if (len > rule)
			{
				result = {"rule":"maxlength", "validity":"tooLong(max:" + rule + ")"};
			}
			break;
		case "min":
			num = parseInt(value);
			if (num < rule)
			{
				result = {"rule":"min", "validity":"rangeUnderflow(min:" + rule + ")"};
			}
			break;
		case "max":
			num = parseInt(value);
			if (num > rule)
			{
				result = {"rule":"max", "validity":"rangeOverflow(max:" + rule + ")"};
			}
			break;
		case "pattern":
			let re = new RegExp(rule);
			if (!re.test(value))
			{
				result = {"rule":"pattern", "validity":"patternMismatch(pattern:" + rule + ")"};
			}
			break;
		case "valids":
			if (rule.indexOf(value) === -1)
			{
				result = {"rule":"valids", "validity":"validsMismatch"};
			}
			break;
		case "custom":
			if (!rule(key, value, rule))
			{
				result = {"rule":"custom", "validity":"customMismatch"};
			}
			break;
		}

		return result;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check the single type constraint.
	 *
	 * @param	{String}		key					Item name.
	 * @param	{Object}		value				Value to validate.
	 * @param	{String}		constraintName		Constraint name.
	 * @param	{Object}		rule				Validation rules.
	 *
 	 * @return  {Object}		Failed result.
	 */
	_checkType(key, value, constraintName, rule)
	{

		let result;

		if (value)
		{
			switch (rule)
			{
			case "object":
				if (typeof value !== "object")
				{
					result = {"rule":"type", "validity":"typeMismatch(object)"};
				}
				break;
			case "function":
				if (typeof value !== "function")
				{
					result = {"rule":"type", "validity":"typeMismatch(function)"};
				}
				break;
			case "string":
				if (typeof value !== "string")
				{
					result = {"rule":"type", "validity":"typeMismatch(string)"};
				}
				break;
			case "number":
				let parsed = parseInt(value);
				if (isNaN(parsed))
				{
					result = {"rule":"type", "validity":"typeMismatch(number)"};
				}
				break;
			}
		}

		return result;

	}

}
