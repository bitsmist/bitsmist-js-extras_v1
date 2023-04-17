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
//	Attendance Perk Class
// =============================================================================

export default class AttendancePerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Register the component.
	 *
	 * @param	{Component}		component			Compoent to register.
	 * @param	{String}		name				Register as this name.
	 */
	static _attend(component, name)
	{

		if (!AttendancePerk._records[name])
		{
			AttendancePerk.__createEntry(name);
		}

		let entry = AttendancePerk._records[name];
		entry.object = component;
		entry.waitInfo.resolve();
		if (entry.waitInfo["timer"])
		{
			clearTimeout(entry.waitInfo["timer"]);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Call out the component.
	 *
	 * @param	{Component}		component			Compoent to register.
	 * @param	{String}		name				Register as this name.
	 * @param	{Object}		options				Options.
	 */
	static _callOut(component, name, options)
	{

		if (!AttendancePerk._records[name])
		{
			let waitInfo = {};
			let timeout = BITSMIST.v1.settings.get("system.waitForTimeout", 10000);
			let promise = new Promise((resolve, reject) => {
					waitInfo["resolve"] = resolve;
					waitInfo["reject"] = reject;
					waitInfo["timer"] = setTimeout(() => {
						reject(`AttendancePerk.call(): Timed out after ${timeout} milliseconds waiting for ${name}`);
					}, timeout);
				});
			waitInfo["promise"] = promise;

			AttendancePerk.__createEntry(name, null, waitInfo);
		}

		let entry = AttendancePerk._records[name];

		return Promise.resolve().then(() => {
			if (BM.Util.safeGet(options, "waitForDOMContentLoaded"))
			{
				return BM.promises.documentReady;
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
	//	Event handlers
	// -------------------------------------------------------------------------

	static AttendancePerk_onDoOrganize(sender, e, ex)
	{

		this.skills.use("setting.enum", e.detail.settings["attendances"], (sectionName, sectionValue) => {
			AttendancePerk.register(sectionValue["name"], this, sectionValue);
		});

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "AttendancePerk";

	}

	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"sections":		"attendances",
			"order":		330,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Init vars
		AttendancePerk._records = {};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add skills to component;
		component.skills.set("attendance.attend", function(...args) { return AttendancePerk._attend(...args); });
		component.skills.set("attendance.callOut", function(...args) { return AttendancePerk._callOut(...args); });

		// Add event handlers to component
		this._addPerkHandler(component, "doOrganize", AttendancePerk.AttendancePerk_onDoOrganize);

	}

	// -------------------------------------------------------------------------

	static call(name, options)
	{

		if (!AttendancePerk._records[name])
		{
			let waitInfo = {};
			let timeout = BITSMIST.v1.settings.get("system.waitForTimeout", 10000);
			let promise = new Promise((resolve, reject) => {
					waitInfo["resolve"] = resolve;
					waitInfo["reject"] = reject;
					waitInfo["timer"] = setTimeout(() => {
						reject(`AttendancePerk.call(): Timed out after ${timeout} milliseconds waiting for ${name}`);
					}, timeout);
				});
			waitInfo["promise"] = promise;

			AttendancePerk.__createEntry(name, null, waitInfo);
		}

		let entry = AttendancePerk._records[name];

		return Promise.resolve().then(() => {
			if (BM.Util.safeGet(options, "waitForDOMContentLoaded"))
			{
				return BM.promises.documentReady;
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
	 * Register the component.
	 *
	 * @param	{String}		name				Register as this name.
	 * @param	{Component}		component			Compoent to register.
	 */
	static register(name, component)
	{

		if (!AttendancePerk._records[name])
		{
			AttendancePerk.__createEntry(name);
		}

		let entry = AttendancePerk._records[name];
		entry.object = component;
		entry.waitInfo.resolve();
		if (entry.waitInfo["timer"])
		{
			clearTimeout(entry.waitInfo["timer"]);
		}

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

		AttendancePerk._records[name] = record;

		return record;

	}

}
