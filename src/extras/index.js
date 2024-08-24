// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import {Perk, Unit} from "@bitsmist-js_v1/core";

// Store
import BindableStore from "./store/bindable-store.js";
import BindableArrayStore from "./store/bindable-array-store.js";

// Perk
import FilePerk from "./perk/file-perk.js";
import ErrorPerk from "./perk/error-perk.js";
import ElementPerk from "./perk/element-perk.js";
import ResourcePerk from "./perk/resource-perk.js";
import ValidationPerk from "./perk/validation-perk.js";
import FormPerk from "./perk/form-perk.js";
import ListPerk from "./perk/list-perk.js";
import DatabindingPerk from "./perk/databinding-perk.js";
import LocalePerk from "./perk/locale-perk.js";
import KeyPerk from "./perk/key-perk.js";
import ChainPerk from "./perk/chain-perk.js";
import DialogPerk from "./perk/dialog-perk.js";
import PreferencePerk from "./perk/preference-perk.js";
import RoutePerk from "./perk/route-perk.js";
import NotificationPerk from "./perk/notification-perk.js";

// Resource handler
import CookieResourceHandler from "./resource-handler/cookie-resource-handler.js";
import APIResourceHandler from "./resource-handler/api-resource-handler.js";
import ObjectResourceHandler from "./resource-handler/object-resource-handler.js";
import LinkedResourceHandler from "./resource-handler/linked-resource-handler.js";
import WebStorageResourceHandler from "./resource-handler/webstorage-resource-handler.js";

// Locale Handler
import LocaleHandler from "./locale-handler/locale-handler.js";

// Validation handler
import ValidationHandler from "./validation-handler/validation-handler.js";
import HTML5FormValidationHandler from "./validation-handler/html5form-validation-handler.js";
import ObjectValidationHandler from "./validation-handler/object-validation-handler.js";

// Util
import FormatterUtil from "./util/formatter-util.js";
import LocaleFormatterUtil from "./util/locale-formatter-util.js";
import ValueUtil from "./util/value-util.js";
import LocaleValueUtil from "./util/locale-value-util.js";

// Unit
import PreferenceServer from "./unit/bm-preference.js";
import LocaleServer from "./unit/bm-locale.js";
import ErrorServer from "./unit/bm-error.js";
import Router from "./unit/bm-router.js";

// Export to global BITSMIST.V1
if (!globalThis.BITSMIST.V1.EXTRAS)
{
	globalThis.BITSMIST.V1.$EXTRAS = {};
	globalThis.BITSMIST.V1.$EXTRAS.Router = Router;
	globalThis.BITSMIST.V1.$EXTRAS.BindableArrayStore = BindableArrayStore;
	globalThis.BITSMIST.V1.$EXTRAS.BindableStore = BindableStore;
	globalThis.BITSMIST.V1.$EXTRAS.ValueUtil = ValueUtil;
	globalThis.BITSMIST.V1.$EXTRAS.FormatterUtil = FormatterUtil;
	globalThis.BITSMIST.V1.$EXTRAS.LocaleFormatterUtil = LocaleFormatterUtil;
	globalThis.BITSMIST.V1.$EXTRAS.LocaleValueUtil = LocaleValueUtil;
	globalThis.BITSMIST.V1.$EXTRAS.PreferenceServer = PreferenceServer;
	globalThis.BITSMIST.V1.$EXTRAS.LocaleServer = LocaleServer;
	globalThis.BITSMIST.V1.$EXTRAS.ErrorServer = ErrorServer;
}

// Register Perks
Perk.registerPerk(FilePerk);
Perk.registerPerk(ErrorPerk);
Perk.registerPerk(ElementPerk);
Perk.registerPerk(ResourcePerk);
Perk.registerPerk(ValidationPerk);
Perk.registerPerk(FormPerk);
Perk.registerPerk(ListPerk);
Perk.registerPerk(DatabindingPerk);
Perk.registerPerk(LocalePerk);
Perk.registerPerk(KeyPerk);
Perk.registerPerk(ChainPerk);
Perk.registerPerk(DialogPerk);
Perk.registerPerk(PreferencePerk);
Perk.registerPerk(RoutePerk);
Perk.registerPerk(NotificationPerk);

// Register Handlers
ResourcePerk.registerHandler(CookieResourceHandler);
ResourcePerk.registerHandler(APIResourceHandler);
ResourcePerk.registerHandler(ObjectResourceHandler);
ResourcePerk.registerHandler(LinkedResourceHandler);
ResourcePerk.registerHandler(WebStorageResourceHandler);
LocalePerk.registerHandler(LocaleHandler);
ValidationPerk.registerHandler(ValidationHandler);
ValidationPerk.registerHandler(HTML5FormValidationHandler);
ValidationPerk.registerHandler(ObjectValidationHandler);

// Export
export {
	Router,
	BindableArrayStore,
	BindableStore,
	ValueUtil,
	FormatterUtil,
	LocaleFormatterUtil,
	LocaleValueUtil,
	PreferenceServer,
	LocaleServer,
	ErrorServer,
}
