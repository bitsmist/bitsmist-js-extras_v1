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

	/**
	 * Organize.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(conditions, component, settings)
	{

		let promises = [];

		let files = settings["files"];
		if (files)
		{
			Object.keys(files).forEach((fileName) => {
				promises.push(BITSMIST.v1.AjaxUtil.loadScript(files[fileName]["href"]));
			});
		}

		return Promise.all(promises).then(() => {
			return settings;
		});

	}

}
