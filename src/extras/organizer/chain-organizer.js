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
//	Chain organizer class
// =============================================================================

export default class ChainOrganizer extends BITSMIST.v1.Organizer
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

		let chains = settings["chains"];
		if (chains)
		{
			Object.keys(chains).forEach((eventName) => {
				component.addEventHandler(eventName, {"handler":ChainOrganizer.onDoOrganize, "options":chains[eventName]});
			});
		}

	}

	// -----------------------------------------------------------------------------

	static unorganize(conditions, component, settings)
	{

		let chains = settings["chains"];
		if (chains)
		{
			Object.keys(chains).forEach((eventName) => {
				component.removeEventHandler(eventName, {"handler":ChainOrganizer.onDoOrganize, "options":chains[eventName]});
			});
		}

	}

	// -----------------------------------------------------------------------------
	//	Event handlers
	// -----------------------------------------------------------------------------

	/**
	 * DoOrganize event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	static onDoOrganize(sender, e, ex)
	{

		let component = ex.component;
		let targets = ex.options;
		let promises = [];
		let chain = Promise.resolve();

		for (let i = 0; i < targets.length; i++)
		{
			let method = targets[i]["method"] || "refresh";
			let state = targets[i]["state"] || "started";
			let sync = targets[i]["sync"];

			let nodes = document.querySelectorAll(targets[i]["rootNode"]);
			nodes = Array.prototype.slice.call(nodes, 0);
			BITSMIST.v1.Util.assert(nodes.length > 0, `ChainOrganizer.onDoOrganizer(): Node not found. name=${component.name}, eventName=${e.type}, rootNode=${targets[i]["rootNode"]}, method=${method}`)

			if (sync)
			{
				chain = chain.then(() => {
					return ChainOrganizer.__execTarget(component, nodes, method, state);
				});
			}
			else
			{
				chain = ChainOrganizer.__execTarget(component, nodes, method, state);
			}
			promises.push(chain);
		}

		return chain.then(() => {
			return Promise.all(promises);
		});

	}

	// -----------------------------------------------------------------------------
	//	Privates
	// -----------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Array}			nodes				Nodes.
	 * @param	{String}		string				Method name to exec.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static __execTarget(component, nodes, method, state)
	{

		let promises = [];

		nodes.forEach((element) => {
			let promise = component.waitFor([{"object":element, "state":state}]).then(() => {
				return element[method]({"sender":component});
			});
			promises.push(promise);
		});

		return Promise.all(promises);

	}

}
