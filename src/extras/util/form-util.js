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
import FormatterUtil from "./formatter-util.js";

// =============================================================================
//	Form util class
// =============================================================================

export default function FormUtil() {}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Show "bm-visible" elements if condition match.
 *
 * @param	{HTMLElement}	rootNode			Root node.
 * @param	{Object}		item				Item used to judge condition.
 */
FormUtil.showConditionalElements = function(rootNode, item)
{

	// Get elements with bm-visible attribute
	let elements = BM.Util.scopedSelectorAll(rootNode, "[bm-visible]");

	// Show elements
	elements.forEach((element) => {
		let condition = element.getAttribute("bm-visible");
		if (BM.Util.safeEval(condition, item))
		{
			element.style.removeProperty("display");
		}
		else
		{
			element.style.display = "none";
		}
	});

}

// -------------------------------------------------------------------------

/**
 * Hide "bm-visible" elements.
 *
 * @param	{HTMLElement}	rootNode			Root node.
 */
FormUtil.hideConditionalElements = function(rootNode)
{

	// Get elements with bm-visible attribute
	let elements = BM.Util.scopedSelectorAll(rootNode, "[bm-visible]");

	// Hide elements
	elements.forEach((element) => {
		element.style.display = "none";
	});

}

// -----------------------------------------------------------------------------

/**
 * Fill the form.
 *
 * @param	{HTMLElement}	rootNode			Form node.
 * @param	{Ojbect}		item				Values to fill.
 * @param	{Object}		masters				Master values.
 * @param	{Object}		options				Options.
 */
FormUtil.setFields = function(rootNode, item, options)
{

	let attrName = (options && options["attribute"] ) || "bm-bind";

	// Get elements with the attribute
	let elements = BM.Util.scopedSelectorAll(rootNode, `[${attrName}]`);
	if (rootNode.matches(`[${attrName}]`))
	{
		elements.push(rootNode);
	}

	elements.forEach((element) => {
		let value = BM.Util.safeGet(item, element.getAttribute(attrName));

		// Set
		if (value !== undefined)
		{
			FormUtil.setValue(element, value, options);
		}
	});

}

// -----------------------------------------------------------------------------

/**
 * Get form values.
 *
 * @param	{HTMLElement}	rootNode			Form node.
 *
 * @return  {Object}		Values.
 */
FormUtil.getFields = function(rootNode, options)
{

	let attrName = (options && options["attribute"] ) || "bm-bind";
	let item = {};

	// Get elements with the attribute
	let elements = BM.Util.scopedSelectorAll(rootNode, `[${attrName}]`);
	if (rootNode.matches(`[${attrName}]`))
	{
		elements.push(rootNode);
	}

	elements.forEach((element) => {
		// Get the value from the element
		let key = element.getAttribute(attrName);
		let value = FormUtil.getValue(element);

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

// -----------------------------------------------------------------------------

/**
 * Clear the form.
 *
 * @param	{HTMLElement}	rootNode			Form node.
 * @param	{Object}		options				Options.
 */
FormUtil.clearFields = function(rootNode, options)
{

	let target = BM.Util.safeGet(options, "target", "");

	// Get input elements
	let elements = BM.Util.scopedSelectorAll(rootNode, target + " input");
	elements.forEach((element) => {
		FormUtil.clearValue(element, options);
	});

	elements = rootNode.querySelectorAll(target + " select");
	elements = Array.prototype.slice.call(elements, 0);
	elements.forEach((element) => {
		FormUtil.clearValue(element, options);
	});

}

// -----------------------------------------------------------------------------

/**
 * Set the value to the element.
 *
 * @param	{HTMLElement}	element				Html element.
 * @param	{String}		value				Value.
 */
FormUtil.setValue = function(element, value, options)
{

	let attrName = (options && options["attribute"]) || "bm-bind";
	let eventName = "change";

	if (value === undefined || value === null)
	{
		value = "";
	}

	// Get master value
	if (element.hasAttribute(`${attrName}text`) && options && options["resources"])
	{
		let arr = element.getAttribute(`${attrName}text`).split(".");
		let resourceName = arr[0];
		let key = arr[1];
		value = FormUtil._getResourceValue(options["resources"], resourceName, value, key);
	}

	// Format
	if (element.hasAttribute("bm-format"))
	{
		value = FormatterUtil.format("", element.getAttribute("bm-format"), value);
	}

	// Sanitize
	//value = FormatterUtil.sanitize(value);

	// Set value
	let targets = element.getAttribute(`${attrName}-target`);
	if (targets)
	{
		FormUtil._setValue_target(element, targets, value);
	}
	else if (element.hasAttribute("value"))
	{
		FormUtil._setValue_value(element, value);
	}
	else
	{
		FormUtil._setValue_element(element, value);
	}

	// Trigger change event
	if (options && options["triggerEvent"])
	{
		let e = document.createEvent("HTMLEvents");
		e.initEvent(eventName, true, true);
		element.dispatchEvent(e);
	}

}

// -----------------------------------------------------------------------------

/**
 * Get value from the element.
 *
 * @param	{Object}		element				Html element.
 *
 * @return  {String}		Value.
 */
FormUtil.getValue = function(element)
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
	if (element.hasAttribute("bm-format"))
	{
		ret = BM.FormatterUtil.deformat("", element.getAttribute("bm-format"), ret);
	}

	return ret;

}

// -----------------------------------------------------------------------------

FormUtil.clearValue = function(element, options)
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

// -----------------------------------------------------------------------------

/**
 * Build the form element.
 *
 * @param	{HTMLElement}	element				Element to build.
 * @param	{Object}		items				Items.
 * @param	{Object}		options				Options.
 */
FormUtil.build = function(element, items, options)
{

	switch (element.tagName.toLowerCase())
	{
	case "select":
		FormUtil._build_select(element, items, options);
		break;
	}

}

// -----------------------------------------------------------------------------
//  Protected
// -----------------------------------------------------------------------------

/**
 * Build the select element.
 *
 * @param	{HTMLElement}	element				Element to build.
 * @param	{Object}		items				Items.
 * @param	{Object}		options				Options.
 */
FormUtil._build_select = function(element, items, options)
{

	options = options || {};
	element.options.length = 0;

	if ("emptyItem" in options)
	{
		let text = ( "text" in options["emptyItem"] ? options["emptyItem"]["text"] : "");
		let value = ( "value" in options["emptyItem"] ? options["emptyItem"]["value"] : "");
		let option = document.createElement("option");
		option.text = text;
		option.value = value;
		option.setAttribute("selected", "");
		element.appendChild(option);
	}

	Object.keys(items).forEach((id) => {
		let option = document.createElement("option");

		option.text = ( options["text"] ? items[id][options["text"]] : id );
		option.value = ( options["value"] ? items[id][options["value"]] : id );

		element.appendChild(option);
	});

	if ("defaultValue" in options)
	{
		element.value = options["defaultValue"];
	}

}

// -----------------------------------------------------------------------------

/**
 * Build the radio element.
 *
 * @param	{HTMLElement}	element				Element to build.
 * @param	{Object}		items				Items.
 * @param	{Object}		options				Options.
 */
FormUtil._build_radio = function(rootNode, fieldName, item)
{

	Object.keys(item.items).forEach((id) => {
		let label = document.createElement("label");
		let option = document.createElement("input");
		option.type = "radio";
		option.id = key;
		option.name = key;
		option.value = id;
		option.setAttribute("bm-bind", key);
		option.setAttribute("bm-submit", "");
		label.appendChild(option);
		label.appendChild(document.createTextNode(item.items[id]["title"]));
		element.appendChild(label);
	});

}

// -----------------------------------------------------------------------------

/**
 * Set the value to the target positions.
 *
 * @param	{Object}		element				Html element.
 * @param	{String}		targets				Target poisitions.
 * @param	{String}		value				Value.
 */
FormUtil._setValue_target = function(element, targets, value)
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

// -----------------------------------------------------------------------------

/**
 * Set the value to the value attribute.
 *
 * @param	{Object}		element				Html element.
 * @param	{String}		value				Value.
 */
FormUtil._setValue_value = function(element, value)
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

// -----------------------------------------------------------------------------

/**
 * Set the value to the element.
 *
 * @param	{Object}		element				Html element.
 * @param	{String}		value				Value.
 */
FormUtil._setValue_element = function(element, value)
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

// -----------------------------------------------------------------------------

/**
 * Get the resource value that matches given value.
 *
 * @param	{array}			resources			Resources.
 * @param	{String}		resourceName		Resource name.
 * @param	{String}		value				Code value.
 * @param	{String}		key					Key.
 *
 * @return  {String}		Resource value.
 */
FormUtil._getResourceValue = function(resources, resourceName, value, key)
{

	let ret = value;

	if (resources && (resourceName in resources))
	{
		let item = resources[resourceName].getItem(value);
		if (item)
		{
			ret = item[key];
		}
	}

	return ret;

}
