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
import FormatterUtil from "../util/formatter-util.js";

// =============================================================================
//	Value Util Class
// =============================================================================

export default class ValueUtil
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

		return "ValueUtil";

	}

	// -------------------------------------------------------------------------

	/**
	 * Attribute name.
	 *
	 * @type	{String}
	 */
	static get attributeName()
	{

		return "bm-bind";

	}

	// -------------------------------------------------------------------------

	/**
	 * Formatter.
	 *
	 * @type	{Class}
	 */
	static get formatter()
	{

		return FormatterUtil;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Fill fields.
	 *
	 * @param	{HTMLElement}	rootNode			Form node.
	 * @param	{Ojbect}		item				Values to fill.
	 * @param	{Object}		masters				Master values.
	 * @param	{Object}		options				Options.
	 */
	static setFields(rootNode, item, options)
	{

		// Get elements with the attribute
		let elements = BM.Util.scopedSelectorAll(rootNode, `[${this.attributeName}]`);
		if (rootNode.matches(`[${this.attributeName}]`))
		{
			elements.push(rootNode);
		}

		elements.forEach((element) => {
			let value;
			if (element.hasAttribute(`${this.attributeName}-in`))
			{
				value = element.getAttribute(element.getAttribute(`${this.attributeName}-in`));
			}
			else
			{
				value = BM.Util.safeGet(item, element.getAttribute(this.attributeName));
			}

			// Set
			if (value !== undefined)
			{
				this.setValue(element, value, options);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get fields values.
	 *
	 * @param	{HTMLElement}	rootNode			Form node.
	 *
	 * @return  {Object}		Values.
	 */
	static getFields(rootNode, options)
	{

		let item = {};

		// Get elements with the attribute
		let elements = BM.Util.scopedSelectorAll(rootNode, `[${this.attributeName}]`);
		if (rootNode.matches(`[${this.attributeName}]`))
		{
			elements.push(rootNode);
		}

		elements.forEach((element) => {
			// Get the value from the element
			let key = element.getAttribute(this.attributeName);
			let value = this.getValue(element);

			if (Array.isArray(item[key]))
			{
				// Same key already exists and it is an array
				// ---> add the value to the array
				if (value)
				{
					item[key].push(value);
				}
			}
			else if (item[key])
			{
				// Same key already exists and it is not an array
				// ---> create an array and add existing value and the value to the array
				if (value)
				{
					let items = [];
					items.push(item[key]);
					items.push(value);
					item[key]= items;
				}
			}
			else
			{
				item[key] = value;
			}
		});

		return item;

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear fields.
	 *
	 * @param	{HTMLElement}	rootNode			Form node.
	 * @param	{Object}		options				Options.
	 */
	static clearFields(rootNode, options)
	{

		let target = BM.Util.safeGet(options, "target", "");

		// Clear input elements
		let elements = BM.Util.scopedSelectorAll(rootNode, `${target} input`, options);
		elements.forEach((element) => {
			this.clearValue(element, options);
		});

		// Clear select elements
		elements = BM.Util.scopedSelectorAll(rootNode, `${target} select`, options);
		elements.forEach((element) => {
			this.clearValue(element, options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Set the value to the element.
	 *
	 * @param	{HTMLElement}	element				Html element.
	 * @param	{String}		value				Value.
	 */
	static setValue(element, value, options)
	{

		options = options || {};
		value =( value === undefined || value === null ? "" : String(value));
		let eventName = "change";

		// Format
		if (element.hasAttribute(`${this.attributeName}-format`))
		{
			value = this.formatter.format(element.getAttribute(`${this.attributeName}-format`), value, options);
		}

		// Interpolate
		value = this.formatter.interpolateResources(value, value, options["resources"]);
		value = this.formatter.interpolate(value, options["parameters"]);
		value = value.replace("${value}", value);

		// Sanitize
		//value = this.sanitize(value);

		// Set value
		let targets = element.getAttribute(`${this.attributeName}-out`);
		if (targets)
		{
			this._setValue_target(element, targets, value);
		}
		else if (element.hasAttribute("value"))
		{
			this._setValue_value(element, value);
		}
		else
		{
			this._setValue_element(element, value);
		}

		// Trigger change event
		if (options["triggerEvent"])
		{
			let e = document.createEvent("HTMLEvents");
			e.initEvent(eventName, true, true);
			element.dispatchEvent(e);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Get value from the element.
	 *
	 * @param	{Object}		element				Html element.
	 *
	 * @return  {String}		Value.
	 */
	static getValue(element, options)
	{

		let ret = undefined;

		switch (element.tagName.toLowerCase())
		{
		case "input":
			switch (element.type.toLowerCase())
			{
			case "radio":
			case "checkbox":
				if (element.checked)
				{
					ret = ( element.hasAttribute("value") ? element.getAttribute("value") : element.checked );
				}
				break;
			default:
				ret = element.value;
				break;
			}
			break;
		case "select":
			// todo:multiselect
			ret = element.value;
			break;
		default:
			if (element.hasAttribute("selected"))
			{
				ret = element.getAttribute("value");
			}
			break;
		}

		// Deformat
		if (element.hasAttribute(`${this.attributeName}-format`))
		{
			ret = this.formatter.deformat(element.getAttribute(`${this.attribueName}-format`), ret);
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear the element.
	 *
	 * @param	{Object}		element				Html element.
	 */
	static clearValue(element, options)
	{

		let eventName = "change";

		switch (element.type.toLowerCase())
		{
		case "select-one":
		case "select-multiple":
			element.selectedIndex = -1;
			break;
		case "checkbox":
		case "radio":
			element.checked = false;
			break;
		default:
			element.value = "";
			break;
		}

		// Trigger change event
		if (options && options["triggerEvent"])
		{
			let e = document.createEvent("HTMLEvents");
			e.initEvent(eventName, true, true);
			element.dispatchEvent(e);
		}

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Set the value to the target positions.
	 *
	 * @param	{Object}		element				Html element.
	 * @param	{String}		targets				Target poisitions.
	 * @param	{String}		value				Value.
	 */
	static _setValue_target(element, targets, value)
	{

		let items = targets.split(",");
		for (let i = 0; i < items.length; i++)
		{
			let item = items[i].toLowerCase();
			switch (item)
			{
			case "text":
				element.innerText = value;
				break;
			case "html":
				element.innerHTML = value;
				break;
			case "outerhtml":
				element.outerHTML = value;
				break;
			default:
				element.setAttribute(item, value);
				break;
			}
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Set the value to the value attribute.
	 *
	 * @param	{Object}		element				Html element.
	 * @param	{String}		value				Value.
	 */
	static _setValue_value(element, value)
	{

		if (
			(element.tagName.toLowerCase() === "input" && element.type.toLowerCase() === "checkbox") ||
			(element.tagName.toLowerCase() === "input" && element.type.toLowerCase() === "radio")
		)
		{
			if (Array.isArray(value))
			{
				if (value.indexOf(element.getAttribute("value")) > -1)
				{
					element.checked = true;
				}
			}
			else
			{
				if (element.getAttribute("value") === value)
				{
					element.checked = true;
				}
			}
		}
		else
		{
			element.setAttribute("value", value)
		}

	}

	// -------------------------------------------------------------------------

	/**
  	 * Set the value to the element.
 	 *
 	 * @param	{Object}		element				Html element.
	 * @param	{String}		value				Value.
	 */
	static _setValue_element(element, value)
	{

		switch (element.tagName.toLowerCase())
		{
			case "select":
				element.value = value;
				break;
			case "input":
				switch (element.type.toLowerCase())
				{
				case "number":
				case "search":
				case "text":
					element.value = value;
					break;
				case "checkbox":
					element.checked = ( value ? true : false );
					break;
				case "radio":
					if (element.value === value)
					{
						element.checked = true;
					}
					break;
				default:
					break;
				}
				break;
			default:
				element.innerText = value;
				break;
		}

	}

}
