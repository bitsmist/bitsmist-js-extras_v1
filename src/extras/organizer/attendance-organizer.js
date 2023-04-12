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
//	Attendance Organizer Class
// =============================================================================

export default class AttendanceOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "AttendanceOrganizer";

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static AttendanceOrganizer_onDoOrganize(sender, e, ex)
	{

		this._enumSettings(e.detail.settings["attendances"], (sectionName, sectionValue) => {
			AttendanceOrganizer.register(sectionValue["name"], this, sectionValue);
		});

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"attendances",
			"order":		330,
		};

	}

	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Init vars
		AttendanceOrganizer._records = {};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add event handlers to component
		this._addOrganizerHandler(component, "doOrganize", AttendanceOrganizer.AttendanceOrganizer_onDoOrganize);

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

		if (!AttendanceOrganizer._records[name])
		{
			AttendanceOrganizer.__createEntry(name);
		}

		let entry = AttendanceOrganizer._records[name];
		entry.object = component;
		entry.waitInfo.resolve();
		if (entry.waitInfo["timer"])
		{
			clearTimeout(entry.waitInfo["timer"]);
		}

	}

	// -------------------------------------------------------------------------

	static call(name, options)
	{

		if (!AttendanceOrganizer._records[name])
		{
			let waitInfo = {};
			let timeout = BITSMIST.v1.settings.get("system.waitForTimeout", 10000);
			let promise = new Promise((resolve, reject) => {
					waitInfo["resolve"] = resolve;
					waitInfo["reject"] = reject;
					waitInfo["timer"] = setTimeout(() => {
						reject(`AttendanceOrganizer.call(): Timed out after ${timeout} milliseconds waiting for ${name}`);
					}, timeout);
				});
			waitInfo["promise"] = promise;

			AttendanceOrganizer.__createEntry(name, null, waitInfo);
		}

		let entry = AttendanceOrganizer._records[name];

		return Promise.resolve().then(() => {
			if (BM.Util.safeGet(options, "waitForDOMContentLoaded"))
			{
				return BM.documentReady;
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

		AttendanceOrganizer._records[name] = record;

		return record;

	}

}
