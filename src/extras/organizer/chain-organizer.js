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

	static getInfo()
	{

		return {
			"name":			"ChainOrganizer",
			"targetWords":	"chains",
			"order":		800,
		};

	}

	// -------------------------------------------------------------------------

	static attach(component, options)
	{

		// Add event handlers to component
		this._addOrganizerHandler(component, "beforeStart", ChainOrganizer.onBeforeStart);
		this._addOrganizerHandler(component, "afterSpecLoad", ChainOrganizer.onAfterSpecLoad);

	}

	// -----------------------------------------------------------------------------

	static detach(component, options)
	{

		let chains = this.settings.get("chains");
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

	static onBeforeStart(sender, e, ex)
	{

		return ChainOrganizer.__installHandlers(this, this.settings.items);

	}

	// -----------------------------------------------------------------------------

	static onAfterSpecLoad(sender, e, ex)
	{

		return ChainOrganizer.__installHandlers(this, e.detail.spec);

	}

	// -----------------------------------------------------------------------------

	static onDoOrganize(sender, e, ex)
	{

		let component = ex.component;
		let targets = ex.options;
		let promises = [];
		let chain = Promise.resolve();

		for (let i = 0; i < targets.length; i++)
		{
			let method = targets[i]["method"] || "refresh";
			let state = targets[i]["state"] || "ready";
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
	 * Install setup event handlers.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Component settings.
	 */
	static __installHandlers(component, settings)
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
