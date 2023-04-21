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
//	Validation Handler class
// =============================================================================

export default class ValidationHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
     * @param	{String}		validatorName		Validator name.
     * @param	{Object}		options				Options.
     */
	constructor(component, validatorName, options)
	{

		options = options || {};

		this._component = component;
		this._options = new BM.Store({"items":options});

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Options.
	 *
	 * @type	{Object}
	 */
	get options()
	{

		return this._options;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Check validity (Need to override).
	 *
	 * @param	{Object}		values				Values to validate.
	 * @param	{Object}		rules				Validation rules.
	 * @param	{Object}		options				Validation options.
	 */
	checkValidity(values, rules, options)
	{
	}

	// -------------------------------------------------------------------------

	/**
	 * Report validity (Need to override).
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
	 * Validate.
	 *
	 * @param	{Object}		values				Values to validate.
	 * @param	{Object}		rules				Validation rules.
	 * @param	{Object}		options				Validation options.
	 *
 	 * @return  {Object}		Invalid results.
	 */
	_validate(values, rules, options)
	{

		rules = rules || {};
		options = options || {};
		let invalids = {};

		// Allow list
		if (options["allowList"])
		{
			Object.keys(values).forEach((key) => {
				if (options["allowList"].indexOf(key) === -1)
				{
					let failed = [{"rule":"allowList", "validity":"notAllowed"}];
					invalids[key] = this._createValidationResult(key, values[key], rules[key], failed);
				}
			});
		}

		// Allow only in rules
		if (options["allowOnlyInRules"])
		{
			Object.keys(values).forEach((key) => {
				if (!(key in rules))
				{
					let failed = [{"rule":"allowList", "validity":"notAllowed"}];
					invalids[key] = this._createValidationResult(key, values[key], rules[key], failed);
				}
			});
		}

		// Disallow list
		if (options["disallowList"])
		{
			Object.keys(values).forEach((key) => {
				if (options["disallowList"].indexOf(key) > -1)
				{
					let failed = [{"rule":"disallowList", "validity":"disallowed"}];
					invalids[key] = this._createValidationResult(key, values[key], rules[key], failed);
				}
			});
		}

		// Required
		Object.keys(rules).forEach((key) => {
			if ("constraints" in rules[key] && rules[key]["constraints"] && "required" in rules[key]["constraints"] && rules[key]["constraints"]["required"])
			{
				if (!(key in values))
				{
					let failed = [{"rule":"required", "validity":"valueMissing"}];
					invalids[key] = this._createValidationResult(key, values[key], rules[key], failed);
				}
			}
		});

		return invalids;

	}

	// -------------------------------------------------------------------------

	/**
	 * Create validation result object.
	 *
	 * @param	{String}		key					Key.
	 * @param	{*}				value				Value.
	 * @param	{Object}		rule				Validation rule.
	 * @param	{Object}		failed				Failed reports.
	 * @param	{Object}		extra				Extra reports.
	 *
 	 * @return  {Object}		Invalid result.
	 */
	_createValidationResult(key, value, rule, failed, extras)
	{

		let result = {
			"key":			key,
			"value":		value,
			"message":		this._getFunctionValue(key, value, "message", rule),
			"fix":			this._getFunctionValue(key, value, "fix", rule),
			"failed":		failed,
			"extras":		extras,
		};

		return result;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the value from the custom function or the value.
	 *
	 * @param	{String}		key					Item name.
	 * @param	{Object}		value				Value to validate.
	 * @param	{String}		target				Target name.
	 * @param	{Object}		rule				Validation rules.
	 */
	_getFunctionValue(key, value, target, rule)
	{

		let ret;

		if (rule && target in rule)
		{
			if (typeof rule[target] === "function")
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
