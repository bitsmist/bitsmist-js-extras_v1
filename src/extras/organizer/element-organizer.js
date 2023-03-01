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
			promises = promises.concat(ElementOrganizer.__initElements(this, e, elementName, settings[elementName]));
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

	/**
	 * Get target elements.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		elementInfo			Element info.
	 *
 	 * @return  {Array}			HTML elements.
	 */
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
	 * Init elements.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		eventInfo			Event info.
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		elementInfo			Element info.
	 */
	static __initElements(component, eventInfo, elementName, elementInfo)
	{

		let ret = [];
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
				case "class":
					Object.keys(elementInfo[key]).forEach((mode) => {
						switch (mode)
						{
						case "add":
							elements[i].classList.add(elementInfo[key][mode]);
							break;
						case "remove":
							elements[i].classList.remove(elementInfo[key][mode]);
							break;
						case "replace":
							elements[i].setAttribute("class", elementInfo[key][mode]);
							break;
						default:
							console.warn(false, `ElementOrganizer.__initAttr(): Invalid command. name=${component.name}, eventName=${eventInfo.type}, type=${key}, command=${mode}`);
							break;
						}
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
				case "rootNode":
				case "waitFor":
					break;
				default:
					console.warn(`ElementOrganizer.__initAttr(): Invalid type. name=${component.name}, eventName=${eventInfo.type}, type=${key}`);
					break;
				}
			});

			// Wait for transition/animation to finish
			if (elementInfo["waitFor"])
			{
				ret.push(ElementOrganizer.__waitFor(component, eventInfo, elementName, elementInfo, elements[i]));
			}
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Wait for transition to finish.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		eventInfo			Event info.
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		elementInfo			Element info.
	 * @param	{HTMLElement}	element				Element.
	 *
 	 * @return  {Promise}		Promise.
	 */
	static __waitFor(component, eventInfo, elementName, elementInfo, element)
	{

		let inTransition = false;

		switch (elementInfo["waitFor"])
		{
		case "transition":
			inTransition = (window.getComputedStyle(element).getPropertyValue('transition-duration') !== "0s");
			break;
		case "animation":
			inTransition = (window.getComputedStyle(element).getPropertyValue('animation') !== "none");
			break;
		default:
			console.warn(`ElementOrganizer.__initAttr(): Invalid waitFor. name=${component.name}, eventName=${eventInfo.type}, waitFor=${elementInfo["waitFor"]}`);
			break;
		}

		BM.Util.warn(inTransition, `ElementOrganizer.__initAttr(): Element not in ${elementInfo["waitFor"]}. name=${component.name}, eventName=${eventInfo.type}, elementName=${elementName}`);

		return new Promise((resolve, reject) => {
			// Timeout timer
			let timer = setTimeout(() => {
				reject(`ElementOrganizer.__initAttr(): Timed out waiting for ${elementInfo["waitFor"]}. name=${component.name}, eventName=${eventInfo.type}, elementName=${elementName}`);
			}, BM.settings.get("system.waitForTimeout", 10000));

			// Resolve when finished
			element.addEventListener(elementInfo["waitFor"] + "end", () => {
				clearTimeout(timer);
				resolve();
			}, {"once":true});
		});

	}

}
