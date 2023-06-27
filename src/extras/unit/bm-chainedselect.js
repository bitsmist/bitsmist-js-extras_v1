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

// =============================================================================
//	Chained Select Class
// =============================================================================

export default class ChainedSelect extends BM.Unit
{

	// -------------------------------------------------------------------------
	//	Settings
	// -------------------------------------------------------------------------

	_getSettings()
	{

		return {
			"setting": {
				"autoClear":					true,
				"autoSubmit":					true,
				"useDefaultInput":				true,
				"rootNodes": {
					"newitem": 					".btn-newitem",
					"removeitem":				".btn-removeitem",
					"edititem":					".btn-edititem",
					"select":					"select"
				},
			},
			"event": {
				"events": {
					"this": {
						"handlers": {
							"beforeStart":		["ChainedSelect_onBeforeStart"],
							"afterTransform":	["ChainedSelect_onAfterTransform"],
							"doClear":			["ChainedSelect_onDoClear"],
							"doFill":			["ChainedSelect_onDoFill"],
						}
					},
					"cmb-item": {
						"rootNode":				"select",
						"handlers": {
							"change": 			["ChainedSelect_onCmbItemChange"],
						}
					},
					"btn-newitem": {
						"rootNode":				".btn-newitem",
						"handlers": {
							"click":			["ChainedSelect_onBtnNewItemClick"],
						}
					},
					"btn-edititem": {
						"rootNode":				".btn-edititem",
						"handlers": {
							"click":			["ChainedSelect_onBtnEditItemClick"],
						}
					},
					"btn-removeitem": {
						"rootNode":				".btn-removeitem",
						"handlers": {
							"click": 			["ChainedSelect_onBtnRemoveItemClick"],
						}
					}
				}
			},
			"validation": {
			}
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	* Items.
	*
	* @type	{Number}
	*/
	get items()
	{

		let length = 0;
		let level = 1;

		while (this.querySelector(`:scope .item[data-level='${level}'] select`))
		{
			level++;
			length++;
		}

		return length;

	}

	// -------------------------------------------------------------------------
	//	Event Handlers
	// -------------------------------------------------------------------------

	ChainedSelect_onBeforeStart(sender, e, ex)
	{

		this.rootNodes = this.get("settings", "options.rootNodes");

		if (this.get("settings", "options.useDefaultInput", true))
		{
			this.use("skills", "event.add", "beforeAdd", "ChainedSelect_onBeforeAdd");
			this.use("skills", "event.add", "doAdd", "ChainedSelect_onDoAdd");
			this.use("skills", "event.add", "beforeEdit", "ChainedSelect_onBeforeEdit");
			this.use("skills", "event.add", "doEdit", "ChainedSelect_onDoEdit");
			this.use("skills", "event.add", "beforeRemove", "ChainedSelect_onBeforeRemove");
			this.use("skills", "event.add", "doRemove", "ChainedSelect_onDoRemove");
		}

	}

	// -------------------------------------------------------------------------

	ChainedSelect_onAfterTransform(sender, e, ex)
	{

		// Init select elements (disable all)
		this.use("skills", "basic.clear", {"fromLevel":1, "toLevel":this.length});

		if (!this.get("settings", "options.isAddable", true))
		{
			this.querySelectorAll(`:scope ${this.rootNodes["newitem"]}`).forEach((element) => {
				element.style.display = "none";
			});
		}

		if (!this.get("settings", "options.isEditable", true))
		{
			this.querySelectorAll(`:scope ${this.rootNodes["edititem"]}`).forEach((element) => {
				element.style.display = "none";
			});
		}

		if (!this.get("settings", "options.isRemovable", true))
		{
			this.querySelectorAll(`:scope ${this.rootNodes["removeitem"]}`).forEach((element) => {
				element.style.display = "none";
			});
		}

	}

	// -------------------------------------------------------------------------

	ChainedSelect_onDoClear(sender, e, ex)
	{

		let fromLevel = BM.Util.safeGet(e.detail, "fromLevel", 1);
		let toLevel = BM.Util.safeGet(e.detail, "toLevel", this.length);

		for (let i = fromLevel; i <= toLevel; i++)
		{
			if (this.get("settings", "options.autoClear")) {
				this.querySelector(`:scope .item[data-level='${i}'] ${this.rootNodes["select"]}`).options.length = 0;
			}
			this.querySelector(`:scope .item[data-level='${i}'] ${this.rootNodes["select"]}`).selectedIndex = -1;
			this._initElement("select", i);
			this._initElement("newitem", i);
			this._initElement("edititem", i);
			this._initElement("removeitem", i);
		}

	}

	// -------------------------------------------------------------------------

	ChainedSelect_onDoFill(sender, e, ex)
	{

		let level = BM.Util.safeGet(e.detail, "level", 1);
		this.assignItems(level, this.items);

	}

	// -------------------------------------------------------------------------

	ChainedSelect_onCmbItemChange(sender, e, ex)
	{

		return this.selectItem(sender.parentNode.getAttribute("data-level"), sender.value);

	}

	// -------------------------------------------------------------------------

	ChainedSelect_onBtnNewItemClick(sender, e, ex)
	{

		if (sender.classList.contains("disabled")) {
			return;
		}

		let level = sender.parentNode.getAttribute("data-level")
		this.set("state", "dialog.modalResult.result", false);
		let options = {
			"level":level,
			"validatorName": "",
		};

		return this.use("skills", "event.trigger", "beforeAdd", options).then(() => {
			if (this.get("state", "dialog.modalResult.result"))
			{
				return this.validate(options).then(() => {
					if(this.get("state", "validation.validationResult.result"))
					{
						return Promise.resolve().then(() => {
							return this.use("skills", "event.trigger", "doAdd", options);
						}).then(() => {
							return this.use("skills", "event.trigger", "afterAdd", options);
						}).then(() => {
							if (this.get("settings", "options.autoSubmit", true))
							{
								return this.use("skills", "form.submit", options);
							}
						});
					}
				});
			}
		});

	}

	// -------------------------------------------------------------------------

	ChainedSelect_onBtnEditItemClick(sender, e, ex)
	{

		if (sender.classList.contains("disabled")) {
			return;
		}

		let level = sender.parentNode.getAttribute("data-level")
		this.set("state", "dialog.modalResult.result", false);
		let options = {
			"level":level,
			"validatorName": "",
		};

		return this.use("skills", "event.trigger", "beforeEdit", options).then(() => {
			if (this.get("state", "dialog.modalResult.result"))
			{
				return this.validate(options).then(() => {
					if(this.get("state", "validation.validationResult.result"))
					{
						return Promise.resolve().then(() => {
							return this.use("skills", "event.trigger", "doEdit", options);
						}).then(() => {
							return this.use("skills", "event.trigger", "afterEdit", options);
						}).then(() => {
							if (this.get("settings", "options.autoSubmit", true))
							{
								return this.use("skills", "form.submit", options);
							}
						});
					}
				});
			}
		});

	}

	// -------------------------------------------------------------------------

	onChainedSelect_onBtnRemoveItemClick(sender, e, ex)
	{

		if (sender.classList.contains("disabled")) {
			return;
		}

		let level = sender.parentNode.getAttribute("data-level")
		this.set("state", "dialog.modalResult.result", false);
		let options = {
			"level":level,
			"validatorName": "",
		};

		return this.use("spell", "event.trigger", "beforeRemove", options).then(() => {
			if (this.get("state", "dialog.modalResult.result"))
			{
				return this.validate(options).then(() => {
					if(this.get("state", "validation.validationResult.result"))
					{
						return Promise.resolve().then(() => {
							return this.use("spell", "event.trigger", "doRemove", options);
						}).then(() => {
							return this.use("spell", "event.trigger", "afterRemove", options);
						}).then(() => {
							if (this.get("settings", "options.autoSubmit", true))
							{
								return this.use("spell", "form.submit", options);
							}
						});
					}
				});
			}
		});

	}

	// -------------------------------------------------------------------------

	ChainedSelect_onBeforeAdd(sender, e, ex)
	{

		return new Promise((resolve, reject) => {
			let text = window.prompt("アイテム名を入力してください", "");
			if (text)
			{
				this.set("state", "dialog.modalResult.text", text);
				this.set("state", "dialog.modalResult.value", text);
				this.set("state", "dialog.modalResult.result", true);
			}
			resolve();
		});

	}

	// -------------------------------------------------------------------------

	ChainedSelect_onDoAdd(sender, e, ex)
	{

		return this.newItem(e.detail.level, this.get("state", "dialog.modalResult.text"), this.get("state", "dialog.modalResult.value"));

	}

	// -------------------------------------------------------------------------

	ChainedSelect_onBeforeEdit(sender, e, ex)
	{

		let level = parseInt(BM.Util.safeGet(e.detail, "level", 1));
		let selectBox = this.getSelect(level);

		return new Promise((resolve, reject) => {
			let text = window.prompt("アイテム名を入力してください", "");
			if (text)
			{
				this.set("state", "dialog.modalResult.old", {
					"text": selectBox.options[selectBox.selectedIndex].text,
					"value": selectBox.value
				});
				this.set("state", "dialog.modalResult.new", {
					"text": text,
					"value": text
				});
				this.set("state", "dialog.modalResult.result", true);
			}
			resolve();
		});

	}

	// -------------------------------------------------------------------------

	ChainedSelect_onDoEdit(sender, e, ex)
	{

		return this.editItem(e.detail.level, this.get("state", "dialog.modalResult.new.text"), this.get("state", "dialog.modalResult.new.value"));

	}

	// -------------------------------------------------------------------------

	ChainedSelect_onBeforeRemove(sender, e, ex)
	{

		return new Promise((resolve, reject) => {
			if (window.confirm("削除しますか？"))
			{
				let level = parseInt(BM.Util.safeGet(e.detail, "level", 1));
				let selectBox = this.getSelect(level);

				this.set("state", "dialog.modalResult.text", selectBox.options[selectBox.selectedIndex].text);
				this.set("state", "dialog.modalResult.value", selectBox.value);
				this.set("state", "dialog.modalResult.result", true);
			}
			resolve();
		});

	}

	// -------------------------------------------------------------------------

	ChainedSelect_onDoRemove(sender, e, ex)
	{

		return this.removeItem(e.detail.level);

	}

	// -------------------------------------------------------------------------
	//	Methods
	// -------------------------------------------------------------------------

	/**
	 *  Get the specified level select element.
	 *
	 * @param	{Number}		level				Level to retrieve.
	 */
	getSelect(level)
	{

		return this.querySelector(`:scope [data-level='${level}'] ${this.rootNodes["select"]}`);

	}

	// -------------------------------------------------------------------------

	/**
	 * Assign objects to the select element.
	 *
	 * @param	{Number}		level				Level.
	 * @param	{Object}		parentObject		Parent object.
	 */
	assignItems(level, items)
	{

		// Prerequisite check
		let selectBox = this.querySelector(`:scope [data-level='${level}'] > select`);
		BM.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.tagName}, level=${level}`);

		items = items || {};

		if (Array.isArray(items))
		{
			// items is an array
			for (let i = 0; i < items.length; i++)
			{
				let item = document.createElement("option");
				if (typeof(items[i] === "object"))
				{
					item.value = BM.Util.safeGet(items[i], "value", items[i]);
					item.text = BM.Util.safeGet(items[i], "text", items[i]);
					let css = BM.Util.safeGet(items[i], "css");
					if (css) {
						Object.keys(css).forEach((style) => {
							item.css[style] = css[style];
						});
					}
				}
				else
				{
					item.value = items[i];
					item.text = items[i];
				}
				selectBox.add(item);
			}
		}
		else
		{
			// items is an object
			Object.keys(items).forEach((key) => {
				let item = document.createElement("option");
				item.value = BM.Util.safeGet(items[key], "value", key);
				item.text = BM.Util.safeGet(items[key], "text", key);
				let css = BM.Util.safeGet(items[key], "css");
				if (css) {
					Object.keys(css).forEach((style) => {
						item.css[style] = css[style];
					});
				}
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
		let selectBox = this.querySelector(`:scope .item[data-level='${level}'] select`);
		BM.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.tagName}, level=${level}`);

		selectBox.value = itemId;

		this._initElement("edititem", level, true);
		this._initElement("removeitem", level, true);

		// Clear children
		this.use("spell", "basic.clear", {"fromLevel":parseInt(level) + 1, "toLevel":this.length});

		// Refresh the child select element
		return Promise.resolve().then(() => {
			level++;
			let nextSelectBox = this.querySelector(`:scope .item[data-level='${level}'] select`);
			if (nextSelectBox) {
				this._initElement("newitem", level);
				return this.use("spell", "basic.refresh", {"level":level, "value":itemId});
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
		let selectBox = this.querySelector(`:scope .item[data-level='${level}'] select`);
		BM.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.tagName}, level=${level}`);

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
		let selectBox = this.querySelector(`:scope .item[data-level='${level}'] select`);
		BM.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.tagName}, level=${level}`);

		// Edit the selectbox
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
		let selectBox = this.querySelector(`:scope .item[data-level='${level}'] select`);
		BM.Util.assert(selectBox, `ChainedSelect.removeItem(): select not found. name=${this.tagName}, level=${level}`);

		// Remove from the select element
		selectBox.remove(selectBox.selectedIndex);
		selectBox.value = "";
		this._initElement("edititem", level);
		this._initElement("removeitem", level);

		// Reset children select elements
		this.use("spell", "basic.clear", {"fromLevel":parseInt(level) + 1, "toLevel":this.length});

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
			this.querySelector(`:scope .item[data-level='${level}'] ${type}`).disabled = false;
			this.querySelector(`:scope .item[data-level='${level}'] ${type}`).classList.remove("disabled");
		}
		else
		{
			this.querySelector(`:scope .item[data-level='${level}'] ${type}`).disabled = true;
			this.querySelector(`:scope .item[data-level='${level}'] ${type}`).classList.add("disabled");
		}

	}

}

customElements.define("bm-chainedselect", ChainedSelect);
