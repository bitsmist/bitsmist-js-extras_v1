// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	File organizer class
// =============================================================================

export default class FileOrganizer extends BITSMIST.v1.Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static attach(component, options)
	{

		// Add event handlers to component
		this._addOrganizerHandler(component, "beforeStart", FileOrganizer.onBeforeStart);
		this._addOrganizerHandler(component, "afterSpecLoad", FileOrganizer.onAfterSpecLoad);

	}

	// -----------------------------------------------------------------------------
	//	Event handlers
	// -----------------------------------------------------------------------------

	static onBeforeStart(sender, e, ex)
	{

		return FileOrganizer._loadFiles(this.settings.items);

	}

	// -----------------------------------------------------------------------------

	static onAfterSpecLoad(sender, e, ex)
	{

		return FileOrganizer._loadFiles(e.detail.spec);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	static _loadFiles(settings)
	{

		let promises = [];

		let files = settings["files"];
		if (files)
		{
			Object.keys(files).forEach((fileName) => {
				promises.push(BITSMIST.v1.AjaxUtil.loadScript(files[fileName]["href"]));
			});
		}

		return Promise.all(promises);

	}

}
