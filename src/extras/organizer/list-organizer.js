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
		BM.Util.assert(this._listRootNode, `List.ListOrganizer_onAfterTransform(): List root node not found. name=${this.name}, listRootNode=${this.settings.get("settings.listRootNode")}`);

		return this.transformRow(this.settings.get("list.settings.rowTemplateName"));

	}

	// -------------------------------------------------------------------------

	static ListOrganizer_onDoFill(sender, e, ex)
	{

		let builder = ( BM.Util.safeGet(e.detail.options, "async", this.settings.get("list.settings.async", true)) ? ListOrganizer._buildAsync : ListOrganizer._buildSync );
		let fragment = document.createDocumentFragment();

		return Promise.resolve().then(() => {
			return this.trigger("beforeBuildRows");
		}).then(() => {
			return builder(this, fragment, e.detail);
		}).then(() => {
			this._listRootNode.replaceChildren(fragment);
			return this.trigger("afterBuildRows");
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

		// Add methods to component
		component.transformRow = function(...args) { return ListOrganizer._transformRow(this, ...args); }

		// Init component vars
		component._activeRowTemplateName = "";

		// Add event handlers to component
		this._addOrganizerHandler(component, "afterTransform", ListOrganizer.ListOrganizer_onAfterTransform);
		this._addOrganizerHandler(component, "doFill", ListOrganizer.ListOrganizer_onDoFill);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Change the row template html.
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
			console.debug(`ListOrganizer._transformRow(): Switching the row template. name=${component.name}, rowTemplateName=${templateName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.loadTemplate(templateName);
		}).then(() => {
			component._activeRowTemplateName = templateName;
		}).then(() => {
			return component.trigger("afterTransformRow", options);
		}).then(() => {
			console.debug(`ListOrganizer._transformRow(): Switched the row template. name=${component.name}, rowTemplateName=${templateName}, id=${component.id}, uniqueId=${component.uniqueId}`);
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
	static _buildSync(component, fragment, options)
	{

		BM.Util.assert(component._templates[component._activeRowTemplateName], `List._buildSync(): Row template not loaded yet. name=${component.name}, rowTemplateName=${component._activeRowTemplateName}`);

		let rowEvents = component.settings.get("list.rowevents");
		let template = component.templates[component._activeRowTemplateName].html;

		let chain = Promise.resolve();
		for (let i = 0; i < options["items"].length; i++)
		{
			chain = chain.then(() => {
				options["no"] = i;
				options["item"] = options["items"][i];

				// Append a row
				let element = ListOrganizer.__createRow(template);
				fragment.appendChild(element);
				options["element"] = element;

				// Install row element event handlers
				if (rowEvents)
				{
					Object.keys(rowEvents).forEach((elementName) => {
						component.initEvents(elementName, rowEvents[elementName], element);
					});
				}

				return component.trigger("beforeFillRow", options).then(() => {
					if (component.settings.get("list.settings.autoFill", true))
					{
						// Fill fields
						FormUtil.showConditionalElements(element, options["item"]);
						FormUtil.setFields(element, options["item"], {"resources":component.resources});
					}
					return component.triggerAsync("doFillRow", options);
				}).then(() => {
					return component.trigger("afterFillRow", options);
				});
			});
		}

		return chain.then(() => {
			delete options["no"];
			delete options["item"];
			delete options["element"];
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Build rows asynchronously.
	 *
	 * @param	{DocumentFragment}	fragment		Document fragment.
	 */
	static _buildAsync(component, fragment, options)
	{

		BM.Util.assert(component.templates[component._activeRowTemplateName], `List._buildAsync(): Row template not loaded yet. name=${component.name}, rowTemplateName=${component._activeRowTemplateName}`);

		let rowEvents = component.settings.get("list.rowevents");
		let template = component.templates[component._activeRowTemplateName].html;

		for (let i = 0; i < options["items"].length; i++)
		{
			options["no"] = i;
			options["item"] = options["items"][i];

			// Append a row
			let element = ListOrganizer.__createRow(template);
			fragment.appendChild(element);
			options["element"] = element;

			// Install row element event handlers
			if (rowEvents)
			{
				Object.keys(rowEvents).forEach((elementName) => {
					component.initEvents(elementName, rowEvents[elementName], element);
				});
			}

			// Call event handlers
			component.triggerAsync("beforeFillRow", options);
			FormUtil.showConditionalElements(element, options["item"]);
			if (component.settings.get("list.settings.autoFill", true))
			{
				FormUtil.setFields(element, options["item"], {"resources":component.resources});
			}
			component.triggerAsync("doFillRow", options);
			component.triggerAsync("afterFillRow", options);
		}

		delete options["no"];
		delete options["item"];
		delete options["element"];

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
	static __createRow(template)
	{

		let ele = document.createElement("tbody");
		ele.innerHTML = template;
		let element = ele.firstElementChild;
		element.setAttribute("bm-powered", "");

		return element;

	}

}
