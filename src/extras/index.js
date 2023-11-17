// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import {Perk} from "@bitsmist-js_v1/core";

// Store
import MultiStore from "./store/multi-store.js";
import ArrayStore from "./store/array-store.js";
import ObservableStore from "./store/observable-store.js";
import BindableStore from "./store/bindable-store.js";
import BindableArrayStore from "./store/bindable-array-store.js";

// Perk
import FilePerk from "./perk/file-perk.js";
Perk.registerPerk(FilePerk);
import ErrorPerk from "./perk/error-perk.js";
Perk.registerPerk(ErrorPerk);
import ElementPerk from "./perk/element-perk.js";
Perk.registerPerk(ElementPerk);
import ResourcePerk from "./perk/resource-perk.js";
Perk.registerPerk(ResourcePerk);
import ValidationPerk from "./perk/validation-perk.js";
Perk.registerPerk(ValidationPerk);
import FormPerk from "./perk/form-perk.js";
Perk.registerPerk(FormPerk);
import ListPerk from "./perk/list-perk.js";
Perk.registerPerk(ListPerk);
import DatabindingPerk from "./perk/databinding-perk.js";
Perk.registerPerk(DatabindingPerk);
import LocalePerk from "./perk/locale-perk.js";
Perk.registerPerk(LocalePerk);
import KeyPerk from "./perk/key-perk.js";
Perk.registerPerk(KeyPerk);
import ChainPerk from "./perk/chain-perk.js";
Perk.registerPerk(ChainPerk);
import DialogPerk from "./perk/dialog-perk.js";
Perk.registerPerk(DialogPerk);
import PreferencePerk from "./perk/preference-perk.js";
Perk.registerPerk(PreferencePerk);
import RoutePerk from "./perk/route-perk.js";
Perk.registerPerk(RoutePerk);
import AliasPerk from "./perk/alias-perk.js";
Perk.registerPerk(AliasPerk);
import RollCallPerk from "./perk/rollcall-perk.js";
Perk.registerPerk(RollCallPerk);

// Resource handler
import CookieResourceHandler from "./resource-handler/cookie-resource-handler.js";
Perk.registerHandler(CookieResourceHandler, "ResourcePerk");
import APIResourceHandler from "./resource-handler/api-resource-handler.js";
Perk.registerHandler(APIResourceHandler, "ResourcePerk");
import ObjectResourceHandler from "./resource-handler/object-resource-handler.js";
Perk.registerHandler(ObjectResourceHandler, "ResourcePerk");
import LinkedResourceHandler from "./resource-handler/linked-resource-handler.js";
Perk.registerHandler(LinkedResourceHandler, "ResourcePerk");
import WebStorageResourceHandler from "./resource-handler/webstorage-resource-handler.js";
Perk.registerHandler(WebStorageResourceHandler, "ResourcePerk");

// Locale Handler
import LocaleHandler from "./locale-handler/locale-handler.js";
Perk.registerHandler(LocaleHandler, "LocalePerk");
import LocaleServerHandler from "./locale-handler/localeserver-handler.js";
Perk.registerHandler(LocaleServerHandler, "LocalePerk");

// Validation handler
import ValidationHandler from "./validation-handler/validation-handler.js";
Perk.registerHandler(ValidationHandler, "ValidationPerk");
import HTML5FormValidationHandler from "./validation-handler/html5form-validation-handler.js";
Perk.registerHandler(HTML5FormValidationHandler, "ValidationPerk");
import ObjectValidationHandler from "./validation-handler/object-validation-handler.js";
Perk.registerHandler(ObjectValidationHandler, "ValidationPerk");

// Util
import FormatterUtil from "./util/formatter-util.js";
import LocaleFormatterUtil from "./util/locale-formatter-util.js";
import ValueUtil from "./util/value-util.js";
import LocaleValueUtil from "./util/locale-value-util.js";

// Unit
import ChainedSelect from "./unit/bm-chainedselect.js";
import BmTab from "./unit/bm-tab.js";
import BmTabindex from "./unit/bm-tabindex.js";
import BmTabcontent from "./unit/bm-tabcontent.js";
import PreferenceServer from "./unit/bm-preference.js";
import LocaleServer from "./unit/bm-locale.js";
import ErrorServer from "./unit/bm-error.js";
import Router from "./unit/bm-router.js";

// Export
export {
	Router,
	BindableArrayStore,
	BindableStore,
	ObservableStore,
	MultiStore,
	ArrayStore,
	ValueUtil,
	FormatterUtil,
	LocaleFormatterUtil,
	LocaleValueUtil,
	BmTabcontent,
	ChainedSelect,
	BmTab,
	BmTabindex,
	PreferenceServer,
	LocaleServer,
	ErrorServer,
}
