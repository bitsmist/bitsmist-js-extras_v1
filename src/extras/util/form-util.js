// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import FormatterUtil from "./formatter-util.js";

// =============================================================================
//	Form util class
// =============================================================================

export default function FormUtil() {}

// -----------------------------------------------------------------------------
//  Methods
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

	let masters = BITSMIST.v1.Util.safeGet(options, "masters");
	let triggerEvent = BITSMIST.v1.Util.safeGet(options, "triggerEvent");

	// Get elements with bm-bind attribute
	let fields = rootNode.querySelectorAll("[bm-bind]");
	let elements = Array.prototype.concat([rootNode], Array.prototype.slice.call(fields, 0));

	elements.forEach((element) => {
		let fieldName = element.getAttribute("bm-bind");
		if (fieldName in item)
		{
			let value = item[fieldName] || "";

			// Get master value
			if (element.hasAttribute("bm-bindtext"))
			{
				let arr = element.getAttribute("bm-bindtext").split(".");
				let type = arr[0];
				let field = arr[1] || "";
				value = FormUtil._getMasterValue(masters, type, item[fieldName], field);
			}

			// Format
			if (element.hasAttribute("bm-format"))
			{
				value = FormatterUtil.format("", element.getAttribute("bm-format"), value);
			}

			// Set
			FormUtil.setValue(element, value);

			// Trigger change event
			if (triggerEvent)
			{
				let e = document.createEvent("HTMLEvents");
				e.initEvent(triggerEvent, true, true);
				element.dispatchEvent(e);
			}
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
FormUtil.getFields = function(rootNode)
{

	let item = {};

	// Get elements with bm-bind attribute
	let elements = rootNode.querySelectorAll("[bm-bind]");
	elements = Array.prototype.slice.call(elements, 0);

	elements.forEach((element) => {
		// Get a value from the element
		let key = element.getAttribute("bm-bind");
		let value = FormUtil.getValue(element);

		// Deformat
		if (element.hasAttribute("bm-format"))
		{
			value = BITSMIST.v1.FormatterUtil.deformat("", element.getAttribute("bm-format"), value);
		}

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
 * @param	{String}		target				Target.
 */
FormUtil.clearFields = function(rootNode, target)
{

	target = (target ? target : "");

	let elements = rootNode.querySelectorAll(target + " input");
	elements = Array.prototype.slice.call(elements, 0);
	elements.forEach((element) => {
		switch (element.type.toLowerCase())
		{
		case "search":
		case "text":
		case "number":
			element.value = "";
			break;
		case "checkbox":
		case "radio":
			element.checked = false;
			break;
		}
	});

	elements = rootNode.querySelectorAll(target + " select");
	elements = Array.prototype.slice.call(elements, 0);
	elements.forEach((element) => {
		element.selectedIndex = -1;
	});

}

// -----------------------------------------------------------------------------

/**
 * Set a value to the element.
 *
 * @param	{HTMLElement}	element				Html element.
 * @param	{String}		value				Value.
 */
FormUtil.setValue = function(element, value)
{

	if (value === undefined || value == null)
	{
		value = "";
	}

	// Sanitize
	//value = FormatterUtil.sanitize(value);

	// Set value
	let targets = element.getAttribute("bm-target");
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

}


// -----------------------------------------------------------------------------

/**
 * Build a form element.
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

	return ret;

}

// -----------------------------------------------------------------------------

/**
 * Report validity of the form.
 *
 * @param	{HTMLElement}	rootNode			Root node to check.
 *
 * @return  {Array of HTMLElements}				Failed elements.
 */
FormUtil.checkValidity = function(rootNode)
{

	let invalids = [];

	let elements = rootNode.querySelectorAll("input")
	elements = Array.prototype.slice.call(elements, 0);

	elements.forEach((element) => {
		if (!element.checkValidity())
		{
			invalids.push(element);
		}
	});

	return invalids;

}

// -----------------------------------------------------------------------------
//  Protected
// -----------------------------------------------------------------------------

/**
 * Build a select element.
 *
 * @param	{HTMLElement}	element				Element to build.
 * @param	{Object}		items				Items.
 * @param	{Object}		options				Options.
 */
FormUtil._build_select = function(element, items, options)
{

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
 * Build a radio element.
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
 * Set a value to the target positions.
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
		case "href":
		case "src":
		case "rel":
			if (value.substring(0, 4) == "http" || value.substring(0, 1) == "/")
			{
				element.setAttribute(item, value);
			}
			break;
		default:
			let attr = element.getAttribute(item);
			attr = ( attr ? attr + " " + value : value );
			element.setAttribute(item, attr);
			break;
		}
	}

}

// -----------------------------------------------------------------------------

/**
 * Set a value to the value attribute.
 *
 * @param	{Object}		element				Html element.
 * @param	{String}		value				Value.
 */
FormUtil._setValue_value = function(element, value)
{

	if (
		(element.tagName.toLowerCase() == "input" && element.type.toLowerCase() == "checkbox") ||
		(element.tagName.toLowerCase() == "input" && element.type.toLowerCase() == "radio")
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
			if (element.getAttribute("value") == value)
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
 * Set a value to the element.
 *
 * @param	{Object}		element				Html element.
 * @param	{String}		value				Value.
 */
FormUtil._setValue_element = function(element, value)
{

	if (element.tagName.toLowerCase() == "select")
	{
		element.value = value;
	}
	else if (element.tagName.toLowerCase() == "input")
	{
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
			if (element.value == value)
			{
				element.checked = true;
			}
			break;
		default:
			break;
		}
	}
	else
	{
		element.innerText = value;
	}

}

// -----------------------------------------------------------------------------

/**
 * Get master value.
 *
 * @param	{array}			masters				Master values.
 * @param	{String}		type				Master type.
 * @param	{String}		code				Code value.
 *
 * @return  {String}		Master value.
 */
FormUtil._getMasterValue = function(masters, type, code, fieldName)
{

	let ret = code;

	if (masters && (type in masters))
	{
		let item = masters[type].getItem(code);
		if (item)
		{
			ret = item[fieldName];
		}
	}

	return ret;

}


