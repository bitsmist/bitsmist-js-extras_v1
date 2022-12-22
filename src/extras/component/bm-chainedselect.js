// =============================================================================
//	Chained Select Class
// =============================================================================

export default class ChainedSelect extends BITSMIST.v1.Component
{

	// -------------------------------------------------------------------------
	//	Settings
	// -------------------------------------------------------------------------

	_getSettings()
	{

		return {
			"settings": {
				"name":					"ChainedSelect",
				"autoClear":			true,
				"autoSubmit":			true,
				"useDefaultInput":		true,
				"rootNodes": {
					"newitem": 			".btn-newitem",
					"removeitem":		".btn-removeitem",
					"edititem":			".btn-edititem",
					"select":			"select"
				},
			},
			"events": {
				"this": {
					"handlers": {
						"beforeStart":	["onChainedSelect_BeforeStart"],
						"afterAppend":	["onChainedSelect_AfterAppend"],
						"beforeAdd":	["onChainedSelect_BeforeAdd"],
						"doAdd":		["onChainedSelect_DoAdd"],
						"beforeEdit":	["onChainedSelect_BeforeEdit"],
						"doEdit":		["onChainedSelect_DoEdit"],
						"beforeRemove":	["onChainedSelect_BeforeRemove"],
						"doRemove":		["onChainedSelect_DoRemove"],
					}
				},
				"cmb-item": {
					"rootNode":			"select",
					"handlers": {
						"change": 		["onChainedSelect_CmbItemChange"],
					}
				},
				"btn-newitem": {
					"rootNode":			".btn-newitem",
					"handlers": {
						"click":		["onChainedSelect_BtnNewItemClick"],
					}
				},
				"btn-edititem": {
					"rootNode":			".btn-edititem",
					"handlers": {
						"click":		["onChainedSelect_BtnEditItemClick"],
					}
				},
				"btn-removeitem": {
					"rootNode":			".btn-removeitem",
					"handlers": {
						"click": 		["onChainedSelect_BtnRemoveItemClick"],
					}
				}
			}
		}

	}

	// -------------------------------------------------------------------------
	//	Properties
	// -------------------------------------------------------------------------

	getSelected(level)
	{

		return this.querySelector(":scope [data-level='" + level + "'] " + this.rootNodes["select"]);

	}

	// -------------------------------------------------------------------------
	//	Event Handlers
	// -------------------------------------------------------------------------

	/**
	 * Before start event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	onChainedSelect_BeforeStart(sender, e, ex)
	{

		this.rootNodes = this.settings.get("settings.rootNodes");

		if (!this.settings.get("settings.useDefaultInput", true))
		{
			this.removeEventHandler("beforeAdd", "onChainedSelect_BeforeAdd");
			this.removeEventHandler("doAdd", "onChainedSelect_DoAdd");
			this.removeEventHandler("beforeEdit", "onChainedSelect_BeforeEdit");
			this.removeEventHandler("doEdit", "onChainedSelect_DoEdit");
			this.removeEventHandler("beforeRemove", "onChainedSelect_BeforeRemove");
			this.removeEventHandler("doRemove", "onChainedSelect_DoRemove");
		}

			/*
		if (this.settings.get("settings.useDefaultInput", true))
		{
			this.addEventHandler("beforeAdd", this.onChainedSelect_BeforeAdd);
			this.addEventHandler("doAdd", this.onChainedSelect_DoAdd);
			this.addEventHandler("beforeEdit", this.onChainedSelect_BeforeEdit);
			this.addEventHandler("doEdit", this.onChainedSelect_DoEdit);
			this.addEventHandler("beforeRemove", this.onChainedSelect_BeforeRemove);
			this.addEventHandler("doRemove", this.onChainedSelect_DoRemove);
		}
		*/

	}

	// -------------------------------------------------------------------------

	/**
	 * After append event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	onChainedSelect_AfterAppend(sender, e, ex)
	{

		// Init selectboxes (disable all)
		let i = 1;
		while (this.querySelector(":scope .item[data-level='" + i + "'] select"))
		{
			//this.querySelector(":scope .item[data-level='" + i + "'] select").options.length = 0;
			this._initElement("select", i);
			this._initElement("newitem", i);
			this._initElement("edititem", i);
			this._initElement("removeitem", i);
			i++;
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Change event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	onChainedSelect_CmbItemChange(sender, e, ex)
	{

		return this.selectItem(sender.parentNode.getAttribute("data-level"), sender.value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Click event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	onChainedSelect_BtnNewItemClick(sender, e, ex)
	{

		if (sender.classList.contains("disabled")) {
			return;
		}

		let level = sender.parentNode.getAttribute("data-level")

		return Promise.resolve().then(() => {
			return this.trigger("beforeAdd", {"level":level});
		}).then(() => {
			return this.trigger("doAdd", {"level":level});
		}).then(() => {
			return this.trigger("afterAdd", {"level":level});
		}).then(() => {
			// Save to storage
			if (this.settings.get("settings.autoSubmit"))
			{
				return this.submit({"level":level});
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Click event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	onChainedSelect_BtnEditItemClick(sender, e, ex)
	{

		if (sender.classList.contains("disabled")) {
			return;
		}

		let level = sender.parentNode.getAttribute("data-level")

		return Promise.resolve().then(() => {
			return this.trigger("beforeEdit", {"level":level});
		}).then(() => {
			return this.trigger("doEdit", {"level":level});
		}).then(() => {
			return this.trigger("afterEdit", {"level":level});
		}).then(() => {
			// Save to storage
			if (this.settings.get("settings.autoSubmit"))
			{
				return this.submit({"level":level});
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Click event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	onChainedSelect_BtnRemoveItemClick(sender, e, ex)
	{

		if (sender.classList.contains("disabled")) {
			return;
		}

		let level = sender.parentNode.getAttribute("data-level")

		return Promise.resolve().then(() => {
			return this.trigger("beforeRemove", {"level":level});
		}).then(() => {
			return this.trigger("doRemove", {"level":level});
		}).then(() => {
			return this.trigger("afterRemove", {"level":level});
		}).then(() => {
			// Save to storage
			if (this.settings.get("settings.autoSubmit"))
			{
				return this.submit({"level":level});
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Before add event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	onChainedSelect_BeforeAdd(sender, e, ex)
	{

		return new Promise((resolve, reject) => {
			let text = window.prompt("アイテム名を入力してください", "");
			this.result = text;
			resolve();
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Do add event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	onChainedSelect_DoAdd(sender, e, ex)
	{

		if (this.result) {
			return this.newItem(e.detail.level, this.result);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Before edit event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	onChainedSelect_BeforeEdit(sender, e, ex)
	{

		return new Promise((resolve, reject) => {
			let text = window.prompt("アイテム名を入力してください", "");
			this.result = text;
			resolve();
		});

	}

	// -------------------------------------------------------------------------

	/**
	 *  Do edit event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	onChainedSelect_DoEdit(sender, e, ex)
	{

		if (this.result) {
			this.editItem(e.detail.level, this.result);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Before remove event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	onChainedSelect_BeforeRemove(sender, e, ex)
	{

		return new Promise((resolve, reject) => {
			this.result = window.confirm("削除しますか？");
			resolve();
		});

	}

	// -------------------------------------------------------------------------

	/**
	 *  Do remove event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	onChainedSelect_DoRemove(sender, e, ex)
	{

		if (this.result) {
			return this.removeItem(e.detail.level);
		}

	}

	// -------------------------------------------------------------------------
	//	Methods
	// -------------------------------------------------------------------------

	/**
	 * Clear the selectbox.
	 *
	 * @param	{String}		target				Target selector.
	 */
	clear(options)
	{

		console.debug(`ChainedSelectbox.fill(): Clearing selectbox. name=${this.name}, level=BITSMIST.v1.Util.safeGet(options, "level", 1);`);

		// Prerequisite check
		let level = BITSMIST.v1.Util.safeGet(options, "level", 1);
		let selectBox = this.querySelector(":scope [data-level='" + level + "'] > select");
		BITSMIST.v1.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.name}, level=${level}`);

		selectBox.options.length = 0;

	}

	// -----------------------------------------------------------------------------

	/**
	 * Fill list with data.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	fill(options)
	{

		console.debug(`ChainedSelectbox.fill(): Filling selectbox. name=${this.name}`);

		options = Object.assign({}, options);
		let level = BITSMIST.v1.Util.safeGet(options, "level", 1);

		return Promise.resolve().then(() => {
			let autoClear = BITSMIST.v1.Util.safeGet(options, "autoClear", this.settings.get("settings.autoClear"));
			if (autoClear)
			{
				this.clear({"level":level, "options":options});
			}
			return this.trigger("beforeFill", {"options":options});
		}).then(() => {
			this.assignItems(level, this.items);
		}).then(() => {
			return this.trigger("afterFill", {"options":options});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Submit the form.
	 *
 	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	submit(options)
	{

		console.debug(`ChainedSelectbox.fill(): Submitting selectbox. name=${this.name}`);

		options = Object.assign({}, options);
		let items;

		return Promise.resolve().then(() => {
			return this.trigger("beforeSubmit", {"items":items, "options":options});
		}).then(() => {
			return this.callOrganizers("doSubmit", options);
		}).then(() => {
			return this.trigger("doSubmit", {"items":items, "options":options});
		}).then(() => {
			return this.trigger("afterSubmit", {"items":items, "options":options});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Assign objects to a selectbox.
	 *
	 * @param	{Number}		level				Level.
	 * @param	{Object}		parentObject		Parent object.
	 */
	assignItems(level, items)
	{

		// Prerequisite check
		let selectBox = this.querySelector(":scope [data-level='" + level + "'] > select");
		BITSMIST.v1.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.name}, level=${level}`);

		items = items || {};

		if (Array.isArray(items))
		{
			// items is an array
			for (let i = 0; i < items.length; i++)
			{
				let item = document.createElement("option");
				item.value = items[i];
				item.text = items[i];
				selectBox.add(item);
			}
		}
		else
		{
			// items is an object
			Object.keys(items).forEach((key) => {
				let item = document.createElement("option");
				item.value = key;
				item.text = BITSMIST.v1.Util.safeGet(items[key], "title", key);
				selectBox.add(item);
			});
		}

		selectBox.value = "";

		this._initElement("select", level, true);
		this._initElement("newitem", level, true);

	}

	// -------------------------------------------------------------------------

	/**
	 * Select an item.
	 *
	 * @param	{Number}		level				Level.
	 * @param	{String}		itemId				Item id.
	 */
	selectItem(level, itemId)
	{

		// Prerequisite check
		let selectBox = this.querySelector(":scope .item[data-level='" + level + "'] select");
		BITSMIST.v1.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.name}, level=${level}`);

		selectBox.value = itemId;
		//this.querySelector(":scope .item[data-level='" + level + "'] select").value = itemId;

		this._initElement("edititem", level, true);
		this._initElement("removeitem", level, true);

		// Clear children
		level = parseInt(level);
		let i = 1;
		while (this.querySelector(":scope .item[data-level='" + (level + i) + "'] select"))
		{
			this.querySelector(":scope .item[data-level='" + (level + i) + "'] select").options.length = 0;
			this._initElement("select", level + i);
			this._initElement("newitem", level + i);
			this._initElement("edititem", level + i);
			this._initElement("removeitem", level + i);
			i++;
		}

		// Refresh the child selectbox
		return Promise.resolve().then(() => {
			level++;
			let nextSelectBox = this.querySelector(":scope .item[data-level='" + level + "'] select");
			if (nextSelectBox) {
				this._initElement("newitem", level);
				return this.refresh({"level":level, "value":itemId});
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Create a new item.
	 *
	 * @param	{Number}		level				Level.
	 * @param	{String}		itemName			Item name set as select's text.
	 * @param	{String}		itemId				Item id set as select's value.
	 */
	newItem(level, itemName, itemId)
	{

		// Prerequisite check
		let selectBox = this.querySelector(":scope .item[data-level='" + level + "'] select");
		BITSMIST.v1.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.name}, level=${level}`);

		// Backup current index since it changes after an option is added when select has no option.
		let curIndex = selectBox.selectedIndex;

		let item = document.createElement("option");
		item.value = (itemId ? itemId : itemName);
		item.text = itemName;
		selectBox.add(item);

		// Restore index
		selectBox.selectedIndex = curIndex;

	}

	// -------------------------------------------------------------------------

	/**
	 * Edit an item.
	 *
	 * @param	{Number}		level				Level.
	 * @param	{String}		itemName			Item name set as select's text.
	 * @param	{String}		itemId				Item id set as select's value.
	 */
	editItem(level, itemName, itemId)
	{

		// Prerequisite check
		let selectBox = this.querySelector(":scope .item[data-level='" + level + "'] select");
		BITSMIST.v1.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.name}, level=${level}`);

		// Edit the selectbox
		console.log("@@editting", itemName);
		selectBox.options[selectBox.selectedIndex].text = itemName;
		selectBox.options[selectBox.selectedIndex].value = (itemId ? itemId : itemName);

	}

	// -------------------------------------------------------------------------

	/**
	 * Remove an item.
	 *
	 * @param	{Number}		level				Level.
	 */
	removeItem(level)
	{

		// Prerequisite check
		let selectBox = this.querySelector(":scope .item[data-level='" + level + "'] select");
		BITSMIST.v1.Util.assert(selectBox, `ChainedSelect.removeItem(): select not found. name=${this.name}, level=${level}`);

		// Remove from the selectbox
		selectBox.remove(selectBox.selectedIndex);
		selectBox.value = "";
		this._initElement("edititem", level);
		this._initElement("removeitem", level);

		// Clear children selectboxes
		level = parseInt(level);
		let i = 1;
		while (this.querySelector(":scope .item[data-level='" + (level + i) + "'] select"))
		{
			this.querySelector(":scope .item[data-level='" + (level + i) + "'] select").options.length = 0;
			this._initElement("select", level + i);
			this._initElement("newitem", level + i);
			this._initElement("edititem", level + i);
			this._initElement("removeitem", level + i);
			i++;
		}

	}

	// -------------------------------------------------------------------------
	//	Protected
	// -------------------------------------------------------------------------

	/**
	 * Init an element.
	 *
	 * @param	{String}		type				CSS Selector of the element to init.
	 * @param	{Number}		level				Level.
	 * @param	{Boolean}		enable				Enable an element when true. Disable otherwise.
	 */
	_initElement(type, level, enable)
	{

		type = this.rootNodes[type];

		if (enable)
		{
			this.querySelector(":scope .item[data-level='" + level + "'] " + type).disabled = false;
			this.querySelector(":scope .item[data-level='" + level + "'] " + type).classList.remove("disabled");
		}
		else
		{
			this.querySelector(":scope .item[data-level='" + level + "'] " + type).disabled = true;
			this.querySelector(":scope .item[data-level='" + level + "'] " + type).classList.add("disabled");
		}

	}

}
