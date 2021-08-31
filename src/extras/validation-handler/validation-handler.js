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

	/**
	 * Check validity.
	 *
	 * @param	{String}		itemName			Target item name. All when not specified.
	 */
	checkValidity(values, options)
	{

		console.log("@@@checkValidity", itemName);

	}

	// -------------------------------------------------------------------------

	/**
	 * Report validity.
	 *
	 * @param	{String}		itemName			Target item name. All when not specified.
	 */
	reportValidity(values, options)
	{

		console.log("@@@reportValidity", itemName);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

}
