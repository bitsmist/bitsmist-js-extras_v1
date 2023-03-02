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

		// Init component vars
		component._overlay;

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
			let waitForElement = elements[i];

			Object.keys(elementInfo).forEach((key) => {
				switch (key)
				{
				case "showLoader":
					ElementOrganizer.__showOverlay(component, elementInfo[key]);
					waitForElement = component._overlay;
					break;
				case "hideLoader":
					ElementOrganizer.__hideOverlay(component, elementInfo[key]);
					waitForElement = component._overlay;
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
				case "class":
					ElementOrganizer.__setClasses(elements[i], elementInfo[key]);
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
				ret.push(ElementOrganizer.__waitFor(component, eventInfo, elementName, elementInfo, waitForElement));
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
			inTransition = (window.getComputedStyle(element).getPropertyValue('animation-name') !== "none");
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

	// -------------------------------------------------------------------------

	/**
	 * Set classes to element.
	 *
	 * @param	{HTMLElement}	element				Element to set classes.
	 * @param	{Object}		options				Options.
	 */
	static __setClasses(element, options)
	{

		Object.keys(options).forEach((mode) => {
			switch (mode)
			{
			case "add":
				element.classList.add(options[mode]);
				break;
			case "remove":
				element.classList.remove(options[mode]);
				break;
			case "replace":
				element.setAttribute("class", options[mode]);
				break;
			default:
				//console.warn(`ElementOrganizer.__initAttr(): Invalid command. name=${component.name}, eventName=${eventInfo.type}, type=${key}, command=${mode}`);
				console.warn(`ElementOrganizer.__initAttr(): Invalid command. command=${mode}`);
				break;
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Create an overlay if not exists.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static __createOverlay(component, options)
	{

		if (!component._overlay)
		{
			component.insertAdjacentHTML('afterbegin', '<div class="overlay"></div>');
			component._overlay = component.firstElementChild;
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Install an event handler to close when clicked.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static __closeOnClick(component, options)
	{

		component._overlay.addEventListener("click", (e) => {
			if (e.target === e.currentTarget && typeof component.close === "function")
			{
				component.close({"reason":"cancel"});
			}
		}, {"once":true});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get which effect is applied to overlay.
	 *
	 * @param	{HTMLElement}	overlay				Overlay element.
	 *
	 * @return 	{String}		Effect ("transition" or "animation").
	 */
	static __getEffect(overlay)
	{

		let effect = "";

		if (window.getComputedStyle(overlay).getPropertyValue('transition-duration') !== "0s")
		{
			effect = "transition";
		}
		else if (window.getComputedStyle(overlay).getPropertyValue('animation-name') !== "none")
		{
			effect = "animation";
		}

		return effect;

	}

	// -----------------------------------------------------------------------------

	/**
	 * Show overlay.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static __showOverlay(component, options)
	{

		ElementOrganizer.__createOverlay(component);

		// Add close on click event handler
		if (BM.Util.safeGet(options, "closeOnClick"))
		{
			ElementOrganizer.__closeOnClick(component);
		}

		window.getComputedStyle(component._overlay).getPropertyValue("visibility"); // Recalc styles

		let addClasses = ["show"].concat(BM.Util.safeGet(options, "addClasses", []));
		component._overlay.classList.add(...addClasses);
		component._overlay.classList.remove(...BM.Util.safeGet(options, "removeClasses", []));

	}

	// -----------------------------------------------------------------------------

	/**
	 * Hide overlay.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static __hideOverlay(component, options)
	{

		window.getComputedStyle(component._overlay).getPropertyValue("visibility"); // Recalc styles

		let removeClasses = ["show"].concat(BM.Util.safeGet(options, "removeClasses", []));
		component._overlay.classList.remove(...removeClasses);
		component._overlay.classList.add(...BM.Util.safeGet(options, "addClasses", []));

	}

}
