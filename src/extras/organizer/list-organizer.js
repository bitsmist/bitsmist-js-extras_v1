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
//	List Organizer Class
// =============================================================================

export default class ListOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "ListOrganizer";

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static ListOrganizer_onAfterTransform(sender, e, ex)
	{

		this._listRootNode = this.querySelector(this.settings.get("list.settings.listRootNode"));
		BM.Util.assert(this._listRootNode, `List.fill(): List root node not found. name=${this.name}, listRootNode=${this.settings.get("settings.listRootNode")}`);

		return this.transformRow(this.settings.get("list.settings.rowTemplateName"));

	}

	// -------------------------------------------------------------------------

	static ListOrganizer_onBeforeFill(sender, e, ex)
	{

		this._listRootNode.innerHTML = "";

	}

	// -------------------------------------------------------------------------

	static ListOrganizer_onDoFill(sender, e, ex)
	{

		this._rowElements = [];
		let builder = ( BM.Util.safeGet(e.detail.options, "async", this.settings.get("settings.async", true)) ? ListOrganizer._buildAsync : ListOrganizer._buildSync );
		let fragment = document.createDocumentFragment();
		let items = BM.Util.safeGet(e.detail, "items", this._rows);

		return Promise.resolve().then(() => {
			return builder(this, fragment, items);
		}).then(() => {
			this._listRootNode.appendChild(fragment);
		});

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"list",
			"order":		310,
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add properties to component
		Object.defineProperty(component, 'rows', {
			get()		{ return this._rows; },
			set(value)	{ this._rows = value; },
		})

		// Add methods to component
		component.transformRow = function(...args) { return ListOrganizer._transformRow(this, ...args); }

		// Init component vars
		component._rows = [];
		component._activeRowTemplateName = "";

		// Add event handlers to component
		this._addOrganizerHandler(component, "afterTransform", ListOrganizer.ListOrganizer_onAfterTransform);
		this._addOrganizerHandler(component, "beforeFill", ListOrganizer.ListOrganizer_onBeforeFill);
		this._addOrganizerHandler(component, "doFill", ListOrganizer.ListOrganizer_onDoFill);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Change a row template html.
	 *
     * @param	{Component}		component			Component.
	 * @param	{String}		templateName		Template name.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _transformRow(component, templateName, options)
	{

		options = options || {};

		if (component._activeRowTemplateName === templateName)
		{
			return Promise.resolve();
		}

		return Promise.resolve().then(() => {
			console.debug(`ListOrganizer._transformRow(): Switching a row template. name=${component.name}, rowTemplateName=${templateName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.loadTemplate(templateName);
		}).then(() => {
			component._activeRowTemplateName = templateName;
		}).then(() => {
			return component.trigger("afterRowTransform", options);
		}).then(() => {
			console.debug(`ListOrganizer._transformRow(): Switched a row template. name=${component.name}, rowTemplateName=${templateName}, id=${component.id}, uniqueId=${component.uniqueId}`);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Build rows synchronously.
	 *
	 * @param	{DocumentFragment}	fragment		Document fragment.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _buildSync(component, fragment, items)
	{

		BM.Util.assert(component._templates[component._activeRowTemplateName], `List._buildSync(): Row template not loaded yet. name=${component.name}, rowTemplateName=${component._activeRowTemplateName}`);

		let chain = Promise.resolve();
		let rowEvents = component.settings.get("list.rowevents");
		let template = component.templates[component._activeRowTemplateName].html;

		for (let i = 0; i < items.length; i++)
		{
			chain = chain.then(() => {
				return ListOrganizer._appendRowSync(component, fragment, i, items[i], template, rowEvents);
			});
		}

		return chain;

	}

	// -------------------------------------------------------------------------

	/**
	 * Build rows asynchronously.
	 *
	 * @param	{DocumentFragment}	fragment		Document fragment.
	 */
	static _buildAsync(component, fragment, items)
	{

		BM.Util.assert(component.templates[component._activeRowTemplateName], `List._buildAsync(): Row template not loaded yet. name=${component.name}, rowTemplateName=${component._activeRowTemplateName}`);

		let rowEvents = component.settings.get("list.rowevents");
		let template = component.templates[component._activeRowTemplateName].html;

		for (let i = 0; i < items.length; i++)
		{
			ListOrganizer._appendRowAsync(component, fragment, i, items[i], template, rowEvents);
		}

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Create a row element.
	 *
	 * @param	{String}		template				Template html.
	 *
	 * @return  {HTMLElement}	Row element.
	 */
	static _createRow(template)
	{

		let ele = document.createElement("tbody");
		ele.innerHTML = template;
		let element = ele.firstElementChild;
		element.setAttribute("bm-powered", "");

		return element;

	}

	// -------------------------------------------------------------------------

	/**
	 * Append a new row synchronously.
	 *
	 * @param	{HTMLElement}	rootNode				Root node to append a row.
	 * @param	{integer}		no						Line no.
	 * @param	{Object}		item					Row data.
	 * @param	{String}		template				Template html.
	 * @param	{Object}		rowEvents				Row's event info.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _appendRowSync(component, rootNode, no, item, template, rowEvents)
	{

		component.triggerAsync("beforeBuildRow", {"item":item});

		let chain = Promise.resolve();
		chain = chain.then(() => {
			// Append a row
			let element = ListOrganizer._createRow(template);
			rootNode.appendChild(element);
			component._rowElements.push(element);

			// set row elements click event handler
			if (rowEvents)
			{
				Object.keys(rowEvents).forEach((elementName) => {
					component.initEvents(elementName, rowEvents[elementName], element);
				});
			}

			// Call event handlers
			return Promise.resolve().then(() => {
				return component.trigger("beforeFillRow", {"item":item, "no":no, "element":element});
			}).then(() => {
				// Fill fields
				FormUtil.showConditionalElements(element, item);
				FormUtil.setFields(element, item, {"masters":component.resources});
			}).then(() => {
				return component.trigger("afterFillRow", {"item":item, "no":no, "element":element});
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Append a new row asynchronously.
	 *
	 * @param	{HTMLElement}	rootNode				Root node to append a row.
	 * @param	{integer}		no						Line no.
	 * @param	{Object}		item					Row data.
	 * @param	{String}		template				Template html.
	 * @param	{Object}		rowEvents				Row's event info.
	 */
	static _appendRowAsync(component, rootNode, no, item, template, rowEvents)
	{

		component.triggerAsync("beforeBuildRow", {"item":item});

		// Append a row
		let element = ListOrganizer._createRow(template);
		rootNode.appendChild(element);
		component._rowElements.push(element);

		// set row elements click event handler
		if (rowEvents)
		{
			Object.keys(rowEvents).forEach((elementName) => {
				component.initEvents(elementName, rowEvents[elementName], element);
			});
		}

		// Call event handlers
		component.triggerAsync("beforeFillRow", {"item":item, "no":no, "element":element});
		FormUtil.showConditionalElements(element, item);
		FormUtil.setFields(element, item, {"masters":component.resources});
		component.triggerAsync("afterFillRow", {"item":item, "no":no, "element":element});

	}

}
