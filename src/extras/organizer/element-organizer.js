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

	/**
	 * Organize.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(conditions, component, settings)
	{

		let elements = settings["elements"];
		if (elements)
		{
			Object.keys(elements).forEach((eventName) => {
				component.addEventHandler(eventName, {"handler":ElementOrganizer.onDoOrganize, "options":{"attrs":elements[eventName]}});
			});
		}

		return settings;

	}

	// -----------------------------------------------------------------------------
	//	Event handlers
	// -----------------------------------------------------------------------------

	/**
	 * DoOrganize event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
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
			if (elementInfo["rootNode"] == "this" || elementInfo["rootNode"] == component.tagName.toLowerCase())
			{
				elements = [component];
			}
			else
			{
				elements = component.querySelectorAll(elementInfo["rootNode"]);
			}
		}
		else if (elementName == "this" || elementName == component.tagName.toLowerCase())
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
