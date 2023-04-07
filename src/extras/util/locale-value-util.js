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
import LocaleFormatterUtil from "../util/locale-formatter-util";
import ValueUtil from "./value-util";

// =============================================================================
//	Locale Value Util Class
// =============================================================================

export default class LocaleValueUtil extends ValueUtil
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Class name.
	 *
	 * @type	{String}
	 */
	static get name()
	{

		return "LocaleValueUtil";

	}

	// -------------------------------------------------------------------------

	/**
	 * Attribute name.
	 *
	 * @type	{String}
	 */
	static get attributeName()
	{

		return "bm-locale";

	}

	// -------------------------------------------------------------------------

	/**
	 * Formatter.
	 *
	 * @type	{Class}
	 */
	static get formatter()
	{

		return LocaleFormatterUtil;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/*
	static setValue(element, value, options)
	{

		options = options || {};
		value =( value === undefined || value === null ? "" : String(value));
		let eventName = "change";

		// Format
		if (element.hasAttribute(`${LocaleValueUtil.attributeName}-format`))
		{
			value = LocaleFormatterUtil.format(element.getAttribute(`${LocaleValueUtil.attributeName}-format`), value, options);
		}

		// Interpolate
		value = LocaleFormatterUtil.interpolateResources(value, value, options["resources"]);
		value = LocaleFormatterUtil.interpolate(value, options["parameters"]);
		value = value.replace("${value}", value);

		// Sanitize
		//value = LocaleValueUtil.sanitize(value);

		// Set value
		let targets = element.getAttribute(`${LocaleValueUtil.attributeName}-out`);
		if (targets)
		{
			LocaleValueUtil._setValue_target(element, targets, value);
		}
		else if (element.hasAttribute("value"))
		{
			LocaleValueUtil._setValue_value(element, value);
		}
		else
		{
			LocaleValueUtil._setValue_element(element, value);
		}

		// Trigger change event
		if (options["triggerEvent"])
		{
			let e = document.createEvent("HTMLEvents");
			e.initEvent(eventName, true, true);
			element.dispatchEvent(e);
		}

	}
	*/

}
