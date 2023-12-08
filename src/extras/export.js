// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

if (process.env.NODE_ENV === "development")
{
	var { Router, BindableArrayStore, BindableStore, ObservableStore, MultiStore, ArrayStore, ValueUtil, FormatterUtil, LocaleFormatterUtil, LocaleValueUtil, PreferenceServer, LocaleServer, ErrorServer } = await import("../../dist/bitsmist-js-extras_v1.esm.js");
}
else
{
	var { Router, BindableArrayStore, BindableStore, ObservableStore, MultiStore, ArrayStore, ValueUtil, FormatterUtil, LocaleFormatterUtil, LocaleValueUtil, PreferenceServer, LocaleServer, ErrorServer } = await import("../../dist/bitsmist-js-extras_v1.esm.min.js");
}

export { Router, BindableArrayStore, BindableStore, ObservableStore, MultiStore, ArrayStore, ValueUtil, FormatterUtil, LocaleFormatterUtil, LocaleValueUtil, PreferenceServer, LocaleServer, ErrorServer };
