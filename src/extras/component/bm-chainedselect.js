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

/**
 * Constructor.
 */
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
		// Settings
		"settings": {
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

		// Events
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
		},

		// Validators
		"validators": {
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

		while (this.querySelector(":scope .item[data-level='" + level + "'] select"))
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

	this.rootNodes = this.settings.get("settings.rootNodes");

	if (this.settings.get("settings.useDefaultInput", true))
	{
		this.addEventHandler("beforeAdd", "ChainedSelect_onChainedSelect_BeforeAdd");
		this.addEventHandler("doAdd", "ChainedSelect_onChainedSelect_DoAdd");
		this.addEventHandler("beforeEdit", "ChainedSelect_onChainedSelect_BeforeEdit");
		this.addEventHandler("doEdit", "ChainedSelect_onChainedSelect_DoEdit");
		this.addEventHandler("beforeRemove", "ChainedSelect_onChainedSelect_BeforeRemove");
		this.addEventHandler("doRemove", "ChainedSelect_onChainedSelect_DoRemove");
	}

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onAfterTransform = function(sender, e, ex)
{

	// Init select elements (disable all)
	this.clear({"fromLevel":1, "toLevel":this.length});

	if (!this.settings.get("settings.isAddable", true))
	{
		this.querySelectorAll(":scope " + this.rootNodes["newitem"]).forEach((element) => {
			element.style.display = "none";
		});
	}

	if (!this.settings.get("settings.isEditable", true))
	{
		this.querySelectorAll(":scope " + this.rootNodes["edititem"]).forEach((element) => {
			element.style.display = "none";
		});
	}

	if (!this.settings.get("settings.isRemovable", true))
	{
		this.querySelectorAll(":scope " + this.rootNodes["removeitem"]).forEach((element) => {
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
		if (this.settings.get("settings.autoClear")) {
			this.querySelector(":scope .item[data-level='" + i + "'] " + this.rootNodes["select"]).options.length = 0;
		}
		this.querySelector(":scope .item[data-level='" + i + "'] " + this.rootNodes["select"]).selectedIndex = -1;
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
	this.modalResult = {"result":false};
	let options = {
		"level":level,
		"validatorName": "",
	};

	return this.trigger("beforeAdd", options).then(() => {
		if (this.modalResult["result"])
		{
			return this.validate(options).then(() => {
				if(this.validationResult["result"])
				{
					return Promise.resolve().then(() => {
						return this.trigger("doAdd", options);
					}).then(() => {
						return this.trigger("afterAdd", options);
					}).then(() => {
						if (this.settings.get("settings.autoSubmit", true))
						{
							return this.submit(options);
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
	this.modalResult = {"result":false};
	let options = {
		"level":level,
		"validatorName": "",
	};

	return this.trigger("beforeEdit", options).then(() => {
		if (this.modalResult["result"])
		{
			return this.validate(options).then(() => {
				if(this.validationResult["result"])
				{
					return Promise.resolve().then(() => {
						return this.trigger("doEdit", options);
					}).then(() => {
						return this.trigger("afterEdit", options);
					}).then(() => {
						if (this.settings.get("settings.autoSubmit", true))
						{
							return this.submit(options);
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
	this.modalResult = {"result":false};
	let options = {
		"level":level,
		"validatorName": "",
	};

	return this.trigger("beforeRemove", options).then(() => {
		if (this.modalResult["result"])
		{
			return this.validate(options).then(() => {
				if(this.validationResult["result"])
				{
					return Promise.resolve().then(() => {
						return this.trigger("doRemove", options);
					}).then(() => {
						return this.trigger("afterRemove", options);
					}).then(() => {
						if (this.settings.get("settings.autoSubmit", true))
						{
							return this.submit(options);
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
			this.modalResult["text"] = text;
			this.modalResult["value"] = text;
			this.modalResult["result"] = true;
		}
		resolve();
	});

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onDoAdd = function(sender, e, ex)
{

	return this.newItem(e.detail.level, this.modalResult.text, this.modalResult.value);

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
			this.modalResult["old"] = {
				"text": selectBox.options[selectBox.selectedIndex].text,
				"value": selectBox.value
			};
			this.modalResult["new"] = {
				"text": text,
				"value": text
			}
			this.modalResult["result"] = true;
		}
		resolve();
	});

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onDoEdit = function(sender, e, ex)
{

	this.editItem(e.detail.level, this.modalResult.new.text, this.modalResult.new.value);

}

// -----------------------------------------------------------------------------

ChainedSelect.prototype.ChainedSelect_onBeforeRemove = function(sender, e, ex)
{

	return new Promise((resolve, reject) => {
		if (window.confirm("削除しますか？"))
		{
			let level = parseInt(BM.Util.safeGet(e.detail, "level", 1));
			let selectBox = this.getSelect(level);

			this.modalResult["text"] = selectBox.options[selectBox.selectedIndex].text;
			this.modalResult["value"] = selectBox.value;
			this.modalResult["result"] = true;
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

	return this.querySelector(":scope [data-level='" + level + "'] " + this.rootNodes["select"]);

}

// -----------------------------------------------------------------------------

/**
 * Assign objects to a select element.
 *
 * @param	{Number}		level				Level.
 * @param	{Object}		parentObject		Parent object.
 */
ChainedSelect.prototype.assignItems = function(level, items)
{

	// Prerequisite check
	let selectBox = this.querySelector(":scope [data-level='" + level + "'] > select");
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
	let selectBox = this.querySelector(":scope .item[data-level='" + level + "'] select");
	BM.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.name}, level=${level}`);

	selectBox.value = itemId;

	this._initElement("edititem", level, true);
	this._initElement("removeitem", level, true);

	// Clear children
	this.clear({"fromLevel":parseInt(level) + 1, "toLevel":this.length});

	// Refresh the child select element
	return Promise.resolve().then(() => {
		level++;
		let nextSelectBox = this.querySelector(":scope .item[data-level='" + level + "'] select");
		if (nextSelectBox) {
			this._initElement("newitem", level);
			return this.refresh({"level":level, "value":itemId});
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
	let selectBox = this.querySelector(":scope .item[data-level='" + level + "'] select");
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
	let selectBox = this.querySelector(":scope .item[data-level='" + level + "'] select");
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
	let selectBox = this.querySelector(":scope .item[data-level='" + level + "'] select");
	BM.Util.assert(selectBox, `ChainedSelect.removeItem(): select not found. name=${this.name}, level=${level}`);

	// Remove from the select element
	selectBox.remove(selectBox.selectedIndex);
	selectBox.value = "";
	this._initElement("edititem", level);
	this._initElement("removeitem", level);

	// Reset children select elements
	this.clear({"fromLevel":parseInt(level) + 1, "toLevel":this.length});

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
		this.querySelector(":scope .item[data-level='" + level + "'] " + type).disabled = false;
		this.querySelector(":scope .item[data-level='" + level + "'] " + type).classList.remove("disabled");
	}
	else
	{
		this.querySelector(":scope .item[data-level='" + level + "'] " + type).disabled = true;
		this.querySelector(":scope .item[data-level='" + level + "'] " + type).classList.add("disabled");
	}

}
