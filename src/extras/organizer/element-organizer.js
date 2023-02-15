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
import FormUtil from "../util/form-util.js";

// =============================================================================
//	Element organizer class
// =============================================================================

export default class ElementOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "ElementOrganizer";

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"elements",
			"order":		220,
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add event handlers to component
		this._addOrganizerHandler(component, "doOrganize", ElementOrganizer.onDoOrganize);

	}

	// -----------------------------------------------------------------------------
	//	Event handlers
	// -----------------------------------------------------------------------------

	static onDoOrganize(sender, e, ex)
	{

		this._enumSettings(e.detail.settings["elements"], (sectionName, sectionValue) => {
			this.addEventHandler(sectionName, {"handler":ElementOrganizer.onDoProcess, "options":{"attrs":sectionValue}});
		});

	}

	// -----------------------------------------------------------------------------

	static onDoProcess(sender, e, ex)
	{

		let settings = ex.options["attrs"];

		Object.keys(settings).forEach((elementName) => {
			ElementOrganizer.__initAttr(this, elementName, settings[elementName]);
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
