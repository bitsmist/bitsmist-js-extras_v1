// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import BM from "./bm";

// Store

import MultiStore from "./store/multi-store.js";
window.BITSMIST.v1.MultiStore = MultiStore;

import ArrayStore from "./store/array-store.js";
window.BITSMIST.v1.ArrayStore = ArrayStore;

import ObservableStore from "./store/observable-store.js";
window.BITSMIST.v1.ObservableStore = ObservableStore;

import BindableStore from "./store/bindable-store.js";
window.BITSMIST.v1.BindableStore = BindableStore;

import BindableArrayStore from "./store/bindable-array-store.js";
window.BITSMIST.v1.BindableArrayStore = BindableArrayStore;

// Perk

import FilePerk from "./perk/file-perk.js";
BM.Perk.registerPerk(FilePerk);

import ErrorPerk from "./perk/error-perk.js";
BM.Perk.registerPerk(ErrorPerk);

import ElementPerk from "./perk/element-perk.js";
BM.Perk.registerPerk(ElementPerk);

import ResourcePerk from "./perk/resource-perk.js";
BM.Perk.registerPerk(ResourcePerk);

import ValidationPerk from "./perk/validation-perk.js";
BM.Perk.registerPerk(ValidationPerk);

import FormPerk from "./perk/form-perk.js";
BM.Perk.registerPerk(FormPerk);

import ListPerk from "./perk/list-perk.js";
BM.Perk.registerPerk(ListPerk);

import DatabindingPerk from "./perk/databinding-perk.js";
BM.Perk.registerPerk(DatabindingPerk);

import LocalePerk from "./perk/locale-perk.js";
BM.Perk.registerPerk(LocalePerk);

import KeyPerk from "./perk/key-perk.js";
BM.Perk.registerPerk(KeyPerk);

import ChainPerk from "./perk/chain-perk.js";
BM.Perk.registerPerk(ChainPerk);

import DialogPerk from "./perk/dialog-perk.js";
BM.Perk.registerPerk(DialogPerk);

import PreferencePerk from "./perk/preference-perk.js";
BM.Perk.registerPerk(PreferencePerk);

import RoutePerk from "./perk/route-perk.js";
BM.Perk.registerPerk(RoutePerk);

import AliasPerk from "./perk/alias-perk.js";
BM.Perk.registerPerk(AliasPerk);

import RollCallPerk from "./perk/rollcall-perk.js";
BM.Perk.registerPerk(RollCallPerk);

// Resource handler

import CookieResourceHandler from "./resource-handler/cookie-resource-handler.js";
BM.Perk.registerHandler(CookieResourceHandler, "ResourcePerk");

import APIResourceHandler from "./resource-handler/api-resource-handler.js";
BM.Perk.registerHandler(APIResourceHandler, "ResourcePerk");

import ObjectResourceHandler from "./resource-handler/object-resource-handler.js";
BM.Perk.registerHandler(ObjectResourceHandler, "ResourcePerk");

import LinkedResourceHandler from "./resource-handler/linked-resource-handler.js";
BM.Perk.registerHandler(LinkedResourceHandler, "ResourcePerk");

import WebStorageResourceHandler from "./resource-handler/webstorage-resource-handler.js";
BM.Perk.registerHandler(WebStorageResourceHandler, "ResourcePerk");

// Locale Handler

import LocaleHandler from "./locale-handler/locale-handler.js";
BM.Perk.registerHandler(LocaleHandler, "LocalePerk");

import LocaleServerHandler from "./locale-handler/localeserver-handler.js";
BM.Perk.registerHandler(LocaleServerHandler, "LocalePerk");

// Validation handler

import ValidationHandler from "./validation-handler/validation-handler.js";
BM.Perk.registerHandler(ValidationHandler, "ValidationPerk");

import HTML5FormValidationHandler from "./validation-handler/html5form-validation-handler.js";
BM.Perk.registerHandler(HTML5FormValidationHandler, "ValidationPerk");

import ObjectValidationHandler from "./validation-handler/object-validation-handler.js";
BM.Perk.registerHandler(ObjectValidationHandler, "ValidationPerk");

// Util

import FormatterUtil from "./util/formatter-util.js";
window.BITSMIST.v1.FormatterUtil = FormatterUtil;

import LocaleFormatterUtil from "./util/locale-formatter-util.js";
window.BITSMIST.v1.LocaleFormatterUtil = LocaleFormatterUtil;

import ValueUtil from "./util/value-util.js";
window.BITSMIST.v1.ValueUtil = ValueUtil;

import LocaleValueUtil from "./util/locale-value-util.js";
window.BITSMIST.v1.LocaleValueUtil = LocaleValueUtil;

// Unit

import ChainedSelect from "./unit/bm-chainedselect.js";
window.BITSMIST.v1.ChainedSelect = ChainedSelect;

import BmTab from "./unit/bm-tab.js";
window.BITSMIST.v1.BmTab  = BmTab;

import BmTabindex from "./unit/bm-tabindex.js";
window.BITSMIST.v1.BmTabindex  = BmTabindex;

import BmTabcontent from "./unit/bm-tabcontent.js";
window.BITSMIST.v1.BmTabcontent = BmTabcontent;

import PreferenceServer from "./unit/bm-preference.js";
window.BITSMIST.v1.PreferenceServer = PreferenceServer;

import LocaleServer from "./unit/bm-locale.js";
window.BITSMIST.v1.LocaleServer = LocaleServer;

import ErrorServer from "./unit/bm-error.js";
window.BITSMIST.v1.ErrorServer = ErrorServer;

import Router from "./unit/bm-router.js";
window.BITSMIST.v1.Router = Router;
