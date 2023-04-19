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

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

export default function ChainedSelect(settings)
{

	return Reflect.construct(BM.Component, [settings], this.constructor);

}

BM.ClassUtil.inherit(ChainedSelect, BM.Component);

// -----------------------------------------------------------------------------
//	Settings
// -----------------------------------------------------------------------------

ChainedSelect.prototype._getSettings = function()
{

	return {
		"setting": {
			"name":						"ChainedSelect",
			"autoClear":				true,
			"autoSubmit":				true,
			"useDefaultInput":			true,
			"rootNodes": {
				"newitem": 				".btn-newitem",
				"removeitem":			".btn-removeitem",
				"edititem":				".btn-edititem",
				"select":				"select"
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

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Length.
 *
 * @type	{Number}
 */
Object.defineProperty(ChainedSelect.prototype, "items", {
	get()
	{
		let length = 0;
		let level = 1;

		while (this.querySelector(`:scope .item[data-level='${level}'] select`))
		{
			level++;
			length++;
		}

		return length;
	},
})

// -----------------------------------------------------------------------------
//	Event Handlers
// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onBeforeStart = function(sender, e, ex)
{

	this.rootNodes = this.settings.get("setting.rootNodes");

	if (this.settings.get("setting.useDefaultInput", true))
	{
		this.addEventHandler("beforeAdd", "ChainedSelect_onBeforeAdd");
		this.addEventHandler("doAdd", "ChainedSelect_onDoAdd");
		this.addEventHandler("beforeEdit", "ChainedSelect_onBeforeEdit");
		this.addEventHandler("doEdit", "ChainedSelect_onDoEdit");
		this.addEventHandler("beforeRemove", "ChainedSelect_onBeforeRemove");
		this.addEventHandler("doRemove", "ChainedSelect_onDoRemove");
	}

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onAfterTransform = function(sender, e, ex)
{

	// Init select elements (disable all)
	this.skill.use("basic.clear", {"fromLevel":1, "toLevel":this.length});

	if (!this.settings.get("setting.isAddable", true))
	{
		this.querySelectorAll(`:scope ${this.rootNodes["newitem"]}`).forEach((element) => {
			element.style.display = "none";
		});
	}

	if (!this.settings.get("setting.isEditable", true))
	{
		this.querySelectorAll(`:scope ${this.rootNodes["edititem"]}`).forEach((element) => {
			element.style.display = "none";
		});
	}

	if (!this.settings.get("setting.isRemovable", true))
	{
		this.querySelectorAll(`:scope ${this.rootNodes["removeitem"]}`).forEach((element) => {
			element.style.display = "none";
		});
	}

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onDoClear = function(sender, e, ex)
{

	let fromLevel = BM.Util.safeGet(e.detail, "fromLevel", 1);
	let toLevel = BM.Util.safeGet(e.detail, "toLevel", this.length);

	for (let i = fromLevel; i <= toLevel; i++)
	{
		if (this.settings.get("setting.autoClear")) {
			this.querySelector(`:scope .item[data-level='${i}'] ${this.rootNodes["select"]}`).options.length = 0;
		}
		this.querySelector(`:scope .item[data-level='${i}'] ${this.rootNodes["select"]}`).selectedIndex = -1;
		this._initElement("select", i);
		this._initElement("newitem", i);
		this._initElement("edititem", i);
		this._initElement("removeitem", i);
	}

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onDoFill = function(sender, e, ex)
{

	let level = BM.Util.safeGet(e.detail, "level", 1);
	this.assignItems(level, this.items);

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onCmbItemChange = function(sender, e, ex)
{

	return this.selectItem(sender.parentNode.getAttribute("data-level"), sender.value);

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onBtnNewItemClick = function(sender, e, ex)
{

	if (sender.classList.contains("disabled")) {
		return;
	}

	let level = sender.parentNode.getAttribute("data-level")
	this.stats.set("dialog.modalResult.result", false);
	let options = {
		"level":level,
		"validatorName": "",
	};

	return this.skills.use("event.trigger", "beforeAdd", options).then(() => {
		if (this.stats.get("dialog.modalResult.result"))
		{
			return this.validate(options).then(() => {
				if(this.stats.get("validation.validationResult.result"))
				{
					return Promise.resolve().then(() => {
						return this.skills.use("event.trigger", "doAdd", options);
					}).then(() => {
						return this.skills.use("event.trigger", "afterAdd", options);
					}).then(() => {
						if (this.settings.get("setting.autoSubmit", true))
						{
							return this.skills.use("form.submit", options);
						}
					});
				}
			});
		}
	});

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onBtnEditItemClick = function(sender, e, ex)
{

	if (sender.classList.contains("disabled")) {
		return;
	}

	let level = sender.parentNode.getAttribute("data-level")
	this.stats.set("dialog.modalResult.result", false);
	let options = {
		"level":level,
		"validatorName": "",
	};

	return this.skills.use("event.trigger", "beforeEdit", options).then(() => {
		if (this.stats.get("dialog.modalResult.result"))
		{
			return this.validate(options).then(() => {
				if(this.stats.get("validation.validationResult.result"))
				{
					return Promise.resolve().then(() => {
						return this.skills.use("event.trigger", "doEdit", options);
					}).then(() => {
						return this.skills.use("event.trigger", "afterEdit", options);
					}).then(() => {
						if (this.settings.get("setting.autoSubmit", true))
						{
							return this.skills.use("form.submit", options);
						}
					});
				}
			});
		}
	});

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.onChainedSelect_onBtnRemoveItemClick = function(sender, e, ex)
{

	if (sender.classList.contains("disabled")) {
		return;
	}

	let level = sender.parentNode.getAttribute("data-level")
	this.stats.set("dialog.modalResult.result", false);
	let options = {
		"level":level,
		"validatorName": "",
	};

	return this.skills.use("event.trigger", "beforeRemove", options).then(() => {
		if (this.stats.get("dialog.modalResult.result"))
		{
			return this.validate(options).then(() => {
				if(this.stats.get("validation.validationResult.result"))
				{
					return Promise.resolve().then(() => {
						return this.skills.use("event.trigger", "doRemove", options);
					}).then(() => {
						return this.skills.use("event.trigger", "afterRemove", options);
					}).then(() => {
						if (this.settings.get("setting.autoSubmit", true))
						{
							return this.skills.use("form.submit", options);
						}
					});
				}
			});
		}
	});

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onBeforeAdd = function(sender, e, ex)
{

	return new Promise((resolve, reject) => {
		let text = window.prompt("アイテム名を入力してください", "");
		if (text)
		{
			this.stats.set("dialog.modalResult.text", text);
			this.stats.set("dialog.modalResult.value", text);
			this.stats.set("dialog.modalResult.result", true);
		}
		resolve();
	});

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onDoAdd = function(sender, e, ex)
{

	return this.newItem(e.detail.level, this.stats.get("dialog.modalResult.text"), this.stats.get("dialog.modalResult.value"));

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onBeforeEdit = function(sender, e, ex)
{

	let level = parseInt(BM.Util.safeGet(e.detail, "level", 1));
	let selectBox = this.getSelect(level);

	return new Promise((resolve, reject) => {
		let text = window.prompt("アイテム名を入力してください", "");
		if (text)
		{
			this.stats.set("dialog.modalResult.old", {
				"text": selectBox.options[selectBox.selectedIndex].text,
				"value": selectBox.value
			});
			this.stats.set("dialog.modalResult.new", {
				"text": text,
				"value": text
			});
			this.stats.set("dialog.modalResult.result", true);
		}
		resolve();
	});

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onDoEdit = function(sender, e, ex)
{

	return this.editItem(e.detail.level, this.stats.get("dialog.modalResult.new.text"), this.stats.get("dialog.modalResult.new.value"));

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onBeforeRemove = function(sender, e, ex)
{

	return new Promise((resolve, reject) => {
		if (window.confirm("削除しますか？"))
		{
			let level = parseInt(BM.Util.safeGet(e.detail, "level", 1));
			let selectBox = this.getSelect(level);

			this.stats.set("dialog.modalResult.text", selectBox.options[selectBox.selectedIndex].text);
			this.stats.set("dialog.modalResult.value", selectBox.value);
			this.stats.set("dialog.modalResult.result", true);
		}
		resolve();
	});

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onDoRemove = function(sender, e, ex)
{

	return this.removeItem(e.detail.level);

}

// -----------------------------------------------------------------------------
//	Methods
// -----------------------------------------------------------------------------

/**
 *  Get the specified level select element.
 *
 * @param	{Number}		level				Level to retrieve.
 */
ChainedSelect.prototype.getSelect = function(level)
{

	return this.querySelector(`:scope [data-level='${level}'] ${this.rootNodes["select"]}`);

}

// -----------------------------------------------------------------------------

/**
 * Assign objects to the select element.
 *
 * @param	{Number}		level				Level.
 * @param	{Object}		parentObject		Parent object.
 */
ChainedSelect.prototype.assignItems = function(level, items)
{

	// Prerequisite check
	let selectBox = this.querySelector(`:scope [data-level='${level}'] > select`);
	BM.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.name}, level=${level}`);

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

// -----------------------------------------------------------------------------

/**
 * Select an item.
 *
 * @param	{Number}		level				Level.
 * @param	{String}		itemId				Item id.
 */
ChainedSelect.prototype.selectItem = function(level, itemId)
{

	// Prerequisite check
	let selectBox = this.querySelector(`:scope .item[data-level='${level}'] select`);
	BM.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.name}, level=${level}`);

	selectBox.value = itemId;

	this._initElement("edititem", level, true);
	this._initElement("removeitem", level, true);

	// Clear children
	this.skills.use("basic.clear", {"fromLevel":parseInt(level) + 1, "toLevel":this.length});

	// Refresh the child select element
	return Promise.resolve().then(() => {
		level++;
		let nextSelectBox = this.querySelector(`:scope .item[data-level='${level}'] select`);
		if (nextSelectBox) {
			this._initElement("newitem", level);
			return this.skills.use("basic.refresh", {"level":level, "value":itemId});
		}
	});

}

// -----------------------------------------------------------------------------

/**
 * Create a new item.
 *
 * @param	{Number}		level				Level.
 * @param	{String}		itemName			Item name set as select's text.
 * @param	{String}		itemId				Item id set as select's value.
 */
ChainedSelect.prototype.newItem = function(level, itemName, itemId)
{

	// Prerequisite check
	let selectBox = this.querySelector(`:scope .item[data-level='${level}'] select`);
	BM.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.name}, level=${level}`);

	// Backup current index since it changes after an option is added when select has no option.
	let curIndex = selectBox.selectedIndex;

	let item = document.createElement("option");
	item.value = (itemId ? itemId : itemName);
	item.text = itemName;
	selectBox.add(item);

	// Restore index
	selectBox.selectedIndex = curIndex;

}

// -----------------------------------------------------------------------------

/**
 * Edit an item.
 *
 * @param	{Number}		level				Level.
 * @param	{String}		itemName			Item name set as select's text.
 * @param	{String}		itemId				Item id set as select's value.
 */
ChainedSelect.prototype.editItem = function(level, itemName, itemId)
{

	// Prerequisite check
	let selectBox = this.querySelector(`:scope .item[data-level='${level}'] select`);
	BM.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.name}, level=${level}`);

	// Edit the selectbox
	selectBox.options[selectBox.selectedIndex].text = itemName;
	selectBox.options[selectBox.selectedIndex].value = (itemId ? itemId : itemName);

}

// -----------------------------------------------------------------------------

/**
 * Remove an item.
 *
 * @param	{Number}		level				Level.
 */
ChainedSelect.prototype.removeItem = function(level)
{

	// Prerequisite check
	let selectBox = this.querySelector(`:scope .item[data-level='${level}'] select`);
	BM.Util.assert(selectBox, `ChainedSelect.removeItem(): select not found. name=${this.name}, level=${level}`);

	// Remove from the select element
	selectBox.remove(selectBox.selectedIndex);
	selectBox.value = "";
	this._initElement("edititem", level);
	this._initElement("removeitem", level);

	// Reset children select elements
	this.skills.use("basic.clear", {"fromLevel":parseInt(level) + 1, "toLevel":this.length});

}

// -----------------------------------------------------------------------------
//	Protected
// -----------------------------------------------------------------------------

/**
 * Init an element.
 *
 * @param	{String}		type				CSS Selector of the element to init.
 * @param	{Number}		level				Level.
 * @param	{Boolean}		enable				Enable an element when true. Disable otherwise.
 */
ChainedSelect.prototype._initElement = function(type, level, enable)
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
