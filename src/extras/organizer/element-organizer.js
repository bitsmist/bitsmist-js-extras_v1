// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import FormUtil from "../util/form-util.js";

// =============================================================================
//	Element organizer class
// =============================================================================

export default class ElementOrganizer extends BITSMIST.v1.Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"name":			"ElementOrganizer",
			"targetWords":	"elements",
			"order":		220,
		};

	}

	// -------------------------------------------------------------------------

	static attach(component, options)
	{

		// Add event handlers to component
		this._addOrganizerHandler(component, "beforeStart", ElementOrganizer.onBeforeStart);

	}

	// -----------------------------------------------------------------------------
	//	Event handlers
	// -----------------------------------------------------------------------------

	static onBeforeStart(sender, e, ex)
	{

		let elements = this.settings.get("elements");
		if (elements)
		{
			Object.keys(elements).forEach((eventName) => {
				this.addEventHandler(eventName, {"handler":ElementOrganizer.onDoOrganize, "options":{"attrs":elements[eventName]}});
			});
		}

	}

	// -----------------------------------------------------------------------------

	static onDoOrganize(sender, e, ex)
	{

		let component = ex.component;
		let settings = ex.options["attrs"];

		Object.keys(settings).forEach((elementName) => {
			ElementOrganizer.__initAttr(component, elementName, settings[elementName]);
		});

	}

	// -------------------------------------------------------------------------
	//  Private
	// -------------------------------------------------------------------------

	static __getTargetElements(component, elementName, elementInfo)
	{

		let elements;

		if (elementInfo["rootNode"])
		{
			if (elementInfo["rootNode"] === "this" || elementInfo["rootNode"] === component.tagName.toLowerCase())
			{
				elements = [component];
			}
			else
			{
				elements = component.querySelectorAll(elementInfo["rootNode"]);
			}
		}
		else if (elementName === "this" || elementName === component.tagName.toLowerCase())
		{
			elements = [component];
		}
		else
		{
			elements = component.querySelectorAll("#" + elementName);
		}

		return elements;

	}

	// -------------------------------------------------------------------------


	/**
	 * Init attributes.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		elementInfo			Element info.
	 */
	static __initAttr(component, elementName, elementInfo)
	{

		if (elementInfo)
		{
			let elements = ElementOrganizer.__getTargetElements(component, elementName, elementInfo);
			for (let i = 0; i < elements.length; i++)
			{
				Object.keys(elementInfo).forEach((key) => {
					switch (key)
					{
						case "build":
							let resourceName = elementInfo[key]["resourceName"];
							FormUtil.build(elements[i], component.resources[resourceName].items, elementInfo[key]);
							break;
						case "attribute":
							Object.keys(elementInfo[key]).forEach((attrName) => {
								elements[i].setAttribute(attrName, elementInfo[key][attrName]);
							});
							break;
						case "style":
							Object.keys(elementInfo[key]).forEach((styleName) => {
								elements[i].style[styleName] = elementInfo[key][styleName];
							});
							break;
						case "property":
							Object.keys(elementInfo[key]).forEach((propertyName) => {
								elements[i][propertyName] = elementInfo[key][propertyName];
							});
							break;
						case "autoFocus":
							elements[i].focus();
							break;
					}
				});
			}
		}

	}

}
