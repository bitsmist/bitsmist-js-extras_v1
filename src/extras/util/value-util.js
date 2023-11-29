// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import FormatterUtil from "../util/formatter-util.js";
import {Util} from "@bitsmist-js_v1/core";

// =============================================================================
//	Value Util Class
// =============================================================================

export default class ValueUtil
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
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
	 * @param	{Ojbect}		items				Values to fill.
	 * @param	{Object}		masters				Master values.
	 * @param	{Object}		options				Options.
	 */
	static setFields(rootNode, items, options)
	{

		// Get elements with the attribute
		let elements = Util.scopedSelectorAll(rootNode, `[${this.attributeName}]`);
		if (rootNode.matches(`[${this.attributeName}]`))
		{
			elements.push(rootNode);
		}

		elements.forEach((element) => {
			let value;
			if (element.hasAttribute(`${this.attributeName}-in`))
			{
				value = this.getValue(element)
			}
			else
			{
				value = Util.safeGet(items, element.getAttribute(this.attributeName));
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
		let elements = Util.scopedSelectorAll(rootNode, `[${this.attributeName}]`);
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

		let target = Util.safeGet(options, "target", "");

		// Clear input elements
		let elements = Util.scopedSelectorAll(rootNode, `${target} input`, options);
		elements.forEach((element) => {
			this.clearValue(element, options);
		});

		// Clear select elements
		elements = Util.scopedSelectorAll(rootNode, `${target} select`, options);
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
		//let result = ( value === undefined || value === null ? "" : String(value) );
		let result = ( value === undefined || value === null ? "" : value );

		// Format
		if (element.hasAttribute(`${this.attributeName}-format`) && !element.hasAttribute(`${this.attributeName}-formatted`))
		{
			result = this.formatter.format(element.getAttribute(`${this.attributeName}-format`), value, options);
			element.setAttribute(`${this.attributeName}-formatted`, "");
		}

		// Interpolate
		if (typeof(result) === "string" && result.charAt(0) === "`")
		{
			result = this.formatter.interpolateResources(result, value, options);
			result = this.formatter.interpolate(result, options);
			result = this.formatter.interpolateValue(result, value, options);
			result = result.replace(/^`|`$/g, '');
	//		ret = ret.replace("${value}", value);
		}

		// Set value
		let targets = element.getAttribute(`${this.attributeName}-out`);
		if (targets)
		{
			this._setValue_target(element, targets, result);
		}
		else if (element.hasAttribute("value"))
		{
			this._setValue_value(element, result);
		}
		else
		{
			this._setValue_element(element, result);
		}

		// Trigger change event
		if (options["triggerEvent"])
		{
			let e = new CustomEvent("change", {"detail":options["triggerOptions"]});
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

		let target = element.getAttribute(`${this.attributeName}-in`);
		if (target)
		{
			ret = this._getValue_target(element, target);
		}
		else
		{
			ret = this._getValue_element(element);
		}

		// Deformat
		if (element.hasAttribute(`${this.attributeName}-format`))
		{
			ret = this.formatter.deformat(element.getAttribute(`${this.attributeName}-format`), ret);
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
			let e = new CustomEvent("change", {"detail":options["triggerOptions"]});
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
					element.checked = ( value && value != "0" ? true : false );
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

	// -------------------------------------------------------------------------

	/**
	 * Get the value from the target positions.
	 *
	 * @param	{Object}		element				Html element.
	 * @param	{String}		target				Target poisition.
	 *
	 * @return  {String}		Value.
	 */
	static _getValue_target(element, target)
	{

		target = target.toLowerCase();
		let ret;

		switch (target)
		{
		case "text":
			ret = element.innerText;
			break;
		default:
			element.getAttribute(target);
			break;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
  	 * Get the value from the element.
 	 *
 	 * @param	{Object}		element				Html element.
	 *
	 * @return  {String}		Value.
	 */
	static _getValue_element(element)
	{

		let ret;

		switch (element.tagName.toLowerCase())
		{
		case "input":
			switch (element.type.toLowerCase())
			{
			case "radio":
			case "checkbox":
				if (element.checked)
				{
					ret = ( element.hasAttribute("value") ? element.getAttribute("value") : true );
				}
				else
				{
					ret = false;
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
			else
			{
				ret = element.textContent;
			}
			break;
		}

		return ret;

	}

}
