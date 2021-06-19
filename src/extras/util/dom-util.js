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
//	DOM Util class
// =============================================================================

export default class DomUtil
{

	/**
	 * Set a value to a element.
	 *
	 * @param	{Object}		element				Html element.
	 * @param	{string}		value				Value.
	 */
	static setElementValue(element, value)
	{

		if (value === null || value == undefined)
		{
			value = "";
		}

		let sanitizedValue = value;

		// Target
		let target = element.getAttribute("bm-bindtarget");
		if (target)
		{
			let items = target.split(",");
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
					attr = ( attr ? attr + " " + value : sanitizedValue );
					element.setAttribute(item, attr);
					break;
				}
			}
		}
		else
		{
			// Set value
			if (element.hasAttribute("value"))
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
//					element.setAttribute("value", FormatterUtil.sanitize(value))
				}
			}
			else if (element.tagName.toLowerCase() == "select")
			{
				element.value = value;
			}
			else if (element.tagName.toLowerCase() == "fieldset")
			{
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
				}
			}
			else
			{
				element.innerText = value;
			}
		}

		// Trigger change event
		let e = document.createEvent("HTMLEvents");
		e.initEvent("change", true, true);
		element.dispatchEvent(e);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Get  a value from a element.
	 *
	 * @param	{Object}		element				Html element.
	 *
	 * @return  {string}		Value.
	 */
	static getElementValue(element)
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

}
