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

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":	"element",
		"order":		220,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return ElementPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Init unit vault
		ElementPerk.#__vault.set(unit, {
			"overlay":			null,
			"overlayPromise":	Promise.resolve(),
		})

		// Add event handlers
		unit.use("event.add", "doApplySettings", {"handler":ElementPerk.#ElementPerk_onDoApplySettings, "order":ElementPerk.info["order"]});

	}

	// -----------------------------------------------------------------------------
	//	Event handlers
	// -----------------------------------------------------------------------------

	static #ElementPerk_onDoApplySettings(sender, e, ex)
	{

		let order = ElementPerk.info["order"];

		Object.entries(BM.Util.safeGet(e.detail, "settings.element.targets", {})).forEach(([sectionName, sectionValue]) => {
			this.use("event.add", sectionName, {
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
			promises = promises.concat(ElementPerk.#__initElements(this, e, elementName, settings[elementName]));
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------
	//  Private
	// -------------------------------------------------------------------------

	/**
	 * Get target elements.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		elementInfo			Element info.
	 *
 	 * @return  {Array}			HTML elements.
	 */
	static #__getTargetElements(unit, elementName, elementInfo)
	{

		let elements;

		if (elementInfo["rootNode"])
		{
			if (elementInfo["rootNode"] === "this" || elementInfo["rootNode"] === unit.tagName.toLowerCase())
			{
				elements = [unit];
			}
			else
			{
				elements = BM.Util.scopedSelectorAll(unit, elementInfo["rootNode"]);
			}
		}
		else if (elementName === "this" || elementName === unit.tagName.toLowerCase())
		{
			elements = [unit];
		}
		else
		{
			elements = BM.Util.scopedSelectorAll(unit, `#${elementName}`);
		}

		return elements;

	}

	// -------------------------------------------------------------------------

	/**
	 * Init elements.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		eventInfo			Event info.
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		elementInfo			Element info.
	 */
	static #__initElements(unit, eventInfo, elementName, elementInfo)
	{

		let ret = [];
		let elements = ElementPerk.#__getTargetElements(unit, elementName, elementInfo);

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
					ElementPerk.#__showOverlay(unit, elementInfo[key]);
					waitForElement = ElementPerk.#__vault.get(unit)["overlay"];
					break;
				case "hideLoader":
					ElementPerk.#__hideOverlay(unit, elementInfo[key]);
					waitForElement = ElementPerk.#__vault.get(unit)["overlay"];
					break;
				case "build":
					let resourceName = elementInfo[key]["resourceName"];
					FormUtil.build(elements[i], unit.get("inventory", `resource.resources.${resourceName}`).items, elementInfo[key]);
					break;
				case "attribute":
					ElementPerk.#__setAttributes(elements[i], elementInfo[key]);
					break;
				case "class":
					ElementPerk.#__setClasses(elements[i], elementInfo[key]);
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
					console.warn(`ElementPerk.#__initAttr(): Invalid type. name=${unit.tagName}, eventName=${eventInfo.type}, type=${key}`);
					break;
				}
			});

			// Wait for transition/animation to finish
			if (elementInfo["waitFor"])
			{
				ret.push(ElementPerk.#__waitFor(unit, eventInfo, elementName, elementInfo, waitForElement));
			}
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Wait for transition to finish.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		eventInfo			Event info.
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		elementInfo			Element info.
	 * @param	{HTMLElement}	element				Element.
	 *
 	 * @return  {Promise}		Promise.
	 */
	static #__waitFor(unit, eventInfo, elementName, elementInfo, element)
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
			console.warn(`ElementPerk.#__initAttr(): Invalid waitFor. name=${unit.tagName}, eventName=${eventInfo.type}, waitFor=${elementInfo["waitFor"]}`);
			break;
		}

		BM.Util.warn(inTransition, `ElementPerk.#__initAttr(): Element not in ${elementInfo["waitFor"]}. name=${unit.tagName}, eventName=${eventInfo.type}, elementName=${elementName}`);

		return new Promise((resolve, reject) => {
			// Timeout timer
			let timer = setTimeout(() => {
				reject(`ElementPerk.#__initAttr(): Timed out waiting for ${elementInfo["waitFor"]}. name=${unit.tagName}, eventName=${eventInfo.type}, elementName=${elementName}`);
			}, BM.Unit.get("setting", "system.options.waitForTimeout", 10000));

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
	static #__setAttributes(element, options)
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
				console.warn(`ElementPerk.#__setAttributes(): Invalid command. element=${element.tagName}, command=${mode}`);
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
	static #__setClasses(element, options)
	{

		setTimeout(() => {
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
					console.warn(`ElementPerk.#__setClasses(): Invalid command. element=${element.tagName}, command=${mode}`);
					break;
				}
			});
		}, 1);

	}

	// -------------------------------------------------------------------------

	/**
	 * Create an overlay if not exists.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__createOverlay(unit, options)
	{

		let overlay = ElementPerk.#__vault.get(unit)["overlay"];

		if (!overlay)
		{
			overlay = document.createElement("div");
			overlay.classList.add("overlay");
			unit.get("inventory", "basic.unitRoot").appendChild(overlay);
			ElementPerk.#__vault.get(unit)["overlay"] = overlay;
		}

		return overlay

	}

	// -------------------------------------------------------------------------

	/**
	 * Install an event handler to close when clicked.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__closeOnClick(unit, options)
	{

		ElementPerk.#__vault.get(unit)["overlay"].addEventListener("click", (e) => {
			if (e.target === e.currentTarget && typeof unit.close === "function")
			{
				unit.close({"reason":"cancel"});
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
	static #__getEffect(overlay)
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
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__showOverlay(unit, options)
	{

		let overlay = ElementPerk.#__createOverlay(unit);

		// Add close on click event handler
		if (BM.Util.safeGet(options, "closeOnClick"))
		{
			ElementPerk.#__closeOnClick(unit);
		}

		window.getComputedStyle(overlay).getPropertyValue("visibility"); // Recalc styles

		let addClasses = ["show"].concat(BM.Util.safeGet(options, "addClasses", []));
		overlay.classList.add(...addClasses);
		overlay.classList.remove(...BM.Util.safeGet(options, "removeClasses", []));

		let effect = ElementPerk.#__getEffect(overlay);
		if (effect)
		{
			ElementPerk.#__vault.get(unit)["overlayPromise"].then(() => {
				ElementPerk.#__vault.get(unit)["overlayPromise"] = new Promise((resolve, reject) => {
					overlay.addEventListener(`${effect}end`, () => {
						resolve();
					}, {"once":true});
				});
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
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__hideOverlay(unit, options)
	{

		let overlay = ElementPerk.#__vault.get(unit)["overlay"];

		ElementPerk.#__vault.get(unit)["overlayPromise"].then(() => {
			window.getComputedStyle(overlay).getPropertyValue("visibility"); // Recalc styles

			let removeClasses = ["show"].concat(BM.Util.safeGet(options, "removeClasses", []));
			overlay.classList.remove(...removeClasses);
			overlay.classList.add(...BM.Util.safeGet(options, "addClasses", []));
		});
	}

}
