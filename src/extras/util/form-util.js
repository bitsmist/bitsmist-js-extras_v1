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
		element.appendChild(option);
	}

	Object.keys(items).forEach((id) => {
		let option = document.createElement("option");

		option.text = ( options["text"] ? items[id][options["text"]] : id );
		option.value = ( options["value"] ? items[id][options["value"]] : id );

		element.appendChild(option);
	});

	element.selectedIndex = -1;
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
