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

	// -----------------------------------------------------------------------------
	//	Event handlers
	// -----------------------------------------------------------------------------

	static ElementOrganizer_onDoOrganize(sender, e, ex)
	{

		let order = ElementOrganizer.getInfo()["order"];

		this._enumSettings(e.detail.settings["elements"], (sectionName, sectionValue) => {
			this.addEventHandler(sectionName, {
				"handler":	ElementOrganizer.ElementOrganizer_onDoProcess,
				"order":	order,
				"options":	{"attrs":sectionValue}
			});
		});

	}

	// -----------------------------------------------------------------------------

	static ElementOrganizer_onDoProcess(sender, e, ex)
	{

		let settings = ex.options["attrs"];
		let promises = [];

		Object.keys(settings).forEach((elementName) => {
			promises = promises.concat(ElementOrganizer.__initAttr(this, elementName, settings[elementName], e));
		});

		return Promise.all(promises);

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
		this._addOrganizerHandler(component, "doOrganize", ElementOrganizer.ElementOrganizer_onDoOrganize);

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

		let ret = [];

		if (elementInfo)
		{
			let elements = ElementOrganizer.__getTargetElements(component, elementName, elementInfo);
			for (let i = 0; i < elements.length; i++)
			{
				Object.keys(elementInfo).forEach((key) => {
					switch (key)
					{
						case "transition":
							Object.keys(elementInfo[key]).forEach((styleName) => {
								ret.push(new Promise(resolve => elements[i].addEventListener('transitionend', resolve, {"once":true})));
								elements[i].style[styleName] = elementInfo[key][styleName];
							});
							break;
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

		return ret;

	}

}
