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
//	Element Perk class
// =============================================================================

export default class ElementPerk extends BM.Perk
{

	// -----------------------------------------------------------------------------
	//	Event handlers
	// -----------------------------------------------------------------------------

	static ElementPerk_onDoOrganize(sender, e, ex)
	{

		let order = ElementPerk.info["order"];

		this.skills.use("setting.enum", e.detail.settings["element"], (sectionName, sectionValue) => {
			this.skills.use("event.add", sectionName, {
				"handler":	ElementPerk.ElementPerk_onDoProcess,
				"order":	order,
				"options":	{"attrs":sectionValue}
			});
		});

	}

	// -----------------------------------------------------------------------------

	static ElementPerk_onDoProcess(sender, e, ex)
	{

		let settings = ex.options["attrs"];
		let promises = [];

		Object.keys(settings).forEach((elementName) => {
			promises = promises.concat(ElementPerk.__initElements(this, e, elementName, settings[elementName]));
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "ElementPerk";

	}

	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"element",
			"order":		220,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add inventory items to component
		component.inventory.set("element.overlay", );
		component.inventory.set("element.overlayPromise", Promise.resolve());

		// Add event handlers to component
		this._addPerkHandler(component, "doOrganize", ElementPerk.ElementPerk_onDoOrganize);

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
				elements = component.rootElement.querySelectorAll(elementInfo["rootNode"]);
			}
		}
		else if (elementName === "this" || elementName === component.tagName.toLowerCase())
		{
			elements = [component];
		}
		else
		{
			elements = component.rootElement.querySelectorAll(`#${elementName}`);
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
		let elements = ElementPerk.__getTargetElements(component, elementName, elementInfo);

		for (let i = 0; i < elements.length; i++)
		{
			let waitForElement = elements[i];

			Object.keys(elementInfo).forEach((key) => {
				switch (key)
				{
				case "scroll":
					elements[i].scrollTo(elementInfo[key]);
					break;
				case "showLoader":
					ElementPerk.__showOverlay(component, elementInfo[key]);
					waitForElement = component.inventory.get("element.overlay");
					break;
				case "hideLoader":
					ElementPerk.__hideOverlay(component, elementInfo[key]);
					waitForElement = component.inventory.get("element.overlay");
					break;
				case "build":
					let resourceName = elementInfo[key]["resourceName"];
					FormUtil.build(elements[i], component.inventory.get(`resource.resources.${resourceName}`).items, elementInfo[key]);
					break;
				case "attribute":
					ElementPerk.__setAttributes(elements[i], elementInfo[key]);
					break;
				case "class":
					ElementPerk.__setClasses(elements[i], elementInfo[key]);
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
					console.warn(`ElementPerk.__initAttr(): Invalid type. name=${component.name}, eventName=${eventInfo.type}, type=${key}`);
					break;
				}
			});

			// Wait for transition/animation to finish
			if (elementInfo["waitFor"])
			{
				ret.push(ElementPerk.__waitFor(component, eventInfo, elementName, elementInfo, waitForElement));
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
			console.warn(`ElementPerk.__initAttr(): Invalid waitFor. name=${component.name}, eventName=${eventInfo.type}, waitFor=${elementInfo["waitFor"]}`);
			break;
		}

		BM.Util.warn(inTransition, `ElementPerk.__initAttr(): Element not in ${elementInfo["waitFor"]}. name=${component.name}, eventName=${eventInfo.type}, elementName=${elementName}`);

		return new Promise((resolve, reject) => {
			// Timeout timer
			let timer = setTimeout(() => {
				reject(`ElementPerk.__initAttr(): Timed out waiting for ${elementInfo["waitFor"]}. name=${component.name}, eventName=${eventInfo.type}, elementName=${elementName}`);
			}, BM.settings.get("system.waitForTimeout", 10000));

			// Resolve when finished
			element.addEventListener(`${elementInfo["waitFor"]}end`, () => {
				clearTimeout(timer);
				resolve();
			}, {"once":true});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Set attributes to element.
	 *
	 * @param	{HTMLElement}	element				Element to set classes.
	 * @param	{Object}		options				Options.
	 */
	static __setAttributes(element, options)
	{

		Object.keys(options).forEach((mode) => {
			switch (mode)
			{
			case "add":
				Object.keys(options[mode]).forEach((attrName) => {
					element.setAttribute(attrName, options[mode][attrName]);
				});
				break;
			case "remove":
				for (let i = 0; i < options[mode].length; i++)
				{
					element.removeAttribute(options[mode][i]);
				};
				break;
			default:
				console.warn(`ElementPerk.__setAttributes(): Invalid command. element=${element.tagName}, command=${mode}`);
				break;
			}
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
				console.warn(`ElementPerk.__setClasses(): Invalid command. element=${element.tagName}, command=${mode}`);
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

		if (!component.inventory.get("element.overlay"))
		{
			component.insertAdjacentHTML('afterbegin', '<div class="overlay"></div>');
			let overlay = component.firstElementChild;
			component.inventory.set("element.overlay", component.firstElementChild);
		}

		return component.inventory.get("element.overlay");

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

		component.inventory.get("element.overlay").addEventListener("click", (e) => {
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

		let overlay = ElementPerk.__createOverlay(component);

		// Add close on click event handler
		if (BM.Util.safeGet(options, "closeOnClick"))
		{
			ElementPerk.__closeOnClick(component);
		}

		window.getComputedStyle(overlay).getPropertyValue("visibility"); // Recalc styles

		let addClasses = ["show"].concat(BM.Util.safeGet(options, "addClasses", []));
		overlay.classList.add(...addClasses);
		overlay.classList.remove(...BM.Util.safeGet(options, "removeClasses", []));

		let effect = ElementPerk.__getEffect(overlay);
		if (effect)
		{
			component.inventory.get("element.overlayPromise").then(() => {
				component.inventory.set("element.overlayPromise", new Promise((resolve, reject) => {
					overlay.addEventListener(`${effect}end`, () => {
						resolve();
					}, {"once":true});
				}));
			});
		}
		else
		{
			effect = Promise.resolve();
		}

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

		let overlay = component.inventory.get("element.overlay");

		component.inventory.get("element.overlayPromise").then(() => {
			window.getComputedStyle(overlay).getPropertyValue("visibility"); // Recalc styles

			let removeClasses = ["show"].concat(BM.Util.safeGet(options, "removeClasses", []));
			overlay.classList.remove(...removeClasses);
			overlay.classList.add(...BM.Util.safeGet(options, "addClasses", []));
		});
	}

}
