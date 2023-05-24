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
//	RollCall Perk Class
// =============================================================================

export default class RollCallPerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Call component.
	 *
	 * @param	{Component}		component			Compoent to register.
	 * @param	{Object}		optios				Options.
	 */
	static _call(component, name, options)
	{

		if (!RollCallPerk._records[name])
		{
			let waitInfo = {};
			let timeout = BITSMIST.v1.settings.get("system.waitForTimeout", 10000);
			let promise = new Promise((resolve, reject) => {
					waitInfo["resolve"] = resolve;
					waitInfo["reject"] = reject;
					waitInfo["timer"] = setTimeout(() => {
						reject(`RollCallPerk.call(): Timed out after ${timeout} milliseconds waiting for ${name}`);
					}, timeout);
				});
			waitInfo["promise"] = promise;

			RollCallPerk.__createEntry(name, null, waitInfo);
		}

		let entry = RollCallPerk._records[name];

		return Promise.resolve().then(() => {
			if (BM.Util.safeGet(options, "waitForDOMContentLoaded"))
			{
				return BM.Origin.promises.documentReady;
			}
		}).then(() => {
			if (BM.Util.safeGet(options, "waitForAttendance"))
			{
				return entry.waitInfo.promise;
			}
		}).then(() => {
			return entry.object;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Register component.
	 *
	 * @param	{Component}		component			Compoent to register.
	 * @param	{String}		name				Register as this name.
	 */
	static _register(component, name)
	{

		if (!RollCallPerk._records[name])
		{
			RollCallPerk.__createEntry(name);
		}

		let entry = RollCallPerk._records[name];
		entry.object = component;
		entry.waitInfo.resolve();
		if (entry.waitInfo["timer"])
		{
			clearTimeout(entry.waitInfo["timer"]);
		}

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static RollCallPerk_onDoApplySettings(sender, e, ex)
	{

		Object.entries(BM.Util.safeGet(e.detail, "settings.rollcall.members", {})).forEach(([sectionName, sectionValue]) => {
			let name = sectionValue["name"] || sectionName;
			RollCallPerk._register(this, name, sectionValue);
		});

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"rollcall",
			"order":		330,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Init vars
		RollCallPerk._records = {};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Upgrade component
		this.upgrade(component, "skill", "rollcall.register", function(...args) { return RollCallPerk._register(...args); });
		this.upgrade(component, "skill", "rollcall.call", function(...args) { return RollCallPerk._call(...args); });
		this.upgrade(component, "event", "doApplySettings", RollCallPerk.RollCallPerk_onDoApplySettings);

	}

	// -------------------------------------------------------------------------
	// 	Privates
	// -------------------------------------------------------------------------

	static __createEntry(name, component, waitInfo)
	{

		waitInfo = waitInfo || {
			"promise":	Promise.resolve(),
			"resolve":	()=>{}, // dummy function
			"reject":	()=>{}, // dummy function
			"timer":	null,
		};

		let record = {
			"object":	 	component,
			"waitInfo":		waitInfo,
		};

		RollCallPerk._records[name] = record;

		return record;

	}

}
