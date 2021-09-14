// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

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

		this._name = validatorName;
		this._component = component;
		this._options = new BITSMIST.v1.Store({"items":Object.assign({}, options)});

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Name.
	 *
	 * @type	{String}
	 */
	get name()
	{

		return this._name;

	}

	set name(value)
	{

		this._name = value;

	}

	// -------------------------------------------------------------------------

	/**
	 * Items.
	 *
	 * @type	{Object}
	 */
	get items()
	{

		return this._items;

	}

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

	static validate(values, rules, options)
	{

		rules = rules || {};
		options = options || {};
		let invalids = [];

		// Allow list
		if (options["allowList"])
		{
			Object.keys(values).forEach((key) => {
				if (options["allowList"].indexOf(key) == -1)
				{
					invalids.push({"key":key, "value":values[key], "message":"notAllowed"});
				}
			});
		}

		// Allow only in rules
		if (options["allowOnlyInRules"])
		{
			Object.keys(values).forEach((key) => {
				if (!(key in rules))
				{
					invalids.push({"key":key, "value":values[key], "message":"notAllowed"});
				}
			});
		}

		// Disallow list
		if (options["disallowList"])
		{
			Object.keys(values).forEach((key) => {
				if (options["disallowList"].indexOf(key) > -1)
				{
					invalids.push({"key":key, "value":values[key], "message":"disallowed"});
				}
			});
		}

		// Required
		Object.keys(rules).forEach((key) => {
			if (rules[key]["constraints"] && "required" in rules[key]["constraints"] && rules[key]["constraints"]["required"])
			{
				if (!(key in values))
				{
					console.log("###missing", key, rules[key]);
					invalids.push({"key":key, "value":undefined, "message":"valueMissing"});
				}
			}
		});

		return invalids;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check validity (Need to override).
	 *
	 * @param	{Object}		values				Values to validate.
	 * @param	{Object}		rules				Validation rules.
	 */
	checkValidity(values, options)
	{
	}

	// -------------------------------------------------------------------------

	/**
	 * Report validity (Need to override).
	 *
	 * @param	{Object}		values				Values to validate.
	 * @param	{Object}		rules				Validation rules.
	 */
	reportValidity(values, options)
	{
	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Get a value from a custom function or a value.
	 *
	 * @param	{String}		key					Item name.
	 * @param	{Object}		value				Value to validate.
	 * @param	{String}		target				Target name.
	 * @param	{Object}		rule				Validation rules.
	 */
	static _getFunctionValue(key, value, target, rule)
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
