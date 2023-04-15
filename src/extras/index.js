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
BM.PerkPerk.register(FilePerk);

import ErrorPerk from "./perk/error-perk.js";
BM.PerkPerk.register(ErrorPerk);

import ElementPerk from "./perk/element-perk.js";
BM.PerkPerk.register(ElementPerk);

import ResourcePerk from "./perk/resource-perk.js";
BM.PerkPerk.register(ResourcePerk);

import ValidationPerk from "./perk/validation-perk.js";
BM.PerkPerk.register(ValidationPerk);

import FormPerk from "./perk/form-perk.js";
BM.PerkPerk.register(FormPerk);

import ListPerk from "./perk/list-perk.js";
BM.PerkPerk.register(ListPerk);

import DatabindingPerk from "./perk/databinding-perk.js";
BM.PerkPerk.register(DatabindingPerk);

import LocalePerk from "./perk/locale-perk.js";
BM.PerkPerk.register(LocalePerk);

import KeyPerk from "./perk/key-perk.js";
BM.PerkPerk.register(KeyPerk);

import ChainPerk from "./perk/chain-perk.js";
BM.PerkPerk.register(ChainPerk);

import DialogPerk from "./perk/dialog-perk.js";
BM.PerkPerk.register(DialogPerk);

import PreferencePerk from "./perk/preference-perk.js";
BM.PerkPerk.register(PreferencePerk);

import RoutePerk from "./perk/route-perk.js";
BM.PerkPerk.register(RoutePerk);

import AttendancePerk from "./perk/attendance-perk.js";
BM.PerkPerk.register(AttendancePerk);

// Resource handler

import CookieResourceHandler from "./resource-handler/cookie-resource-handler.js";
window.BITSMIST.v1.CookieResourceHandler = CookieResourceHandler;

import ApiResourceHandler from "./resource-handler/api-resource-handler.js";
window.BITSMIST.v1.ApiResourceHandler = ApiResourceHandler;

import ObjectResourceHandler from "./resource-handler/object-resource-handler.js";
window.BITSMIST.v1.ObjectResourceHandler = ObjectResourceHandler;

import LinkedResourceHandler from "./resource-handler/linked-resource-handler.js";
window.BITSMIST.v1.LinkedResourceHandler = LinkedResourceHandler;

import WebstorageResourceHandler from "./resource-handler/webstorage-resource-handler.js";
window.BITSMIST.v1.WebstorageResourceHandler = WebstorageResourceHandler;

// Locale Handler

import LocaleHandler from "./locale-handler/locale-handler.js";
window.BITSMIST.v1.LocaleHandler = LocaleHandler;

import LocaleServerHandler from "./locale-handler/localeserver-handler.js";
window.BITSMIST.v1.LocaleServerHandler = LocaleServerHandler;

// Validation handler

import ValidationHandler from "./validation-handler/validation-handler.js";
window.BITSMIST.v1.ValidationHandler = ValidationHandler;

import HTML5FormValidationHandler from "./validation-handler/html5form-validation-handler.js";
window.BITSMIST.v1.HTML5FormValidationHandler = HTML5FormValidationHandler;

import ObjectValidationHandler from "./validation-handler/object-validation-handler.js";
window.BITSMIST.v1.ObjectValidationHandler = ObjectValidationHandler;

// Util

import FormatterUtil from "./util/formatter-util.js";
window.BITSMIST.v1.FormatterUtil = FormatterUtil;

import LocaleFormatterUtil from "./util/locale-formatter-util.js";
window.BITSMIST.v1.LocaleFormatterUtil = LocaleFormatterUtil;

import ValueUtil from "./util/value-util.js";
window.BITSMIST.v1.ValueUtil = ValueUtil;

import LocaleValueUtil from "./util/locale-value-util.js";
window.BITSMIST.v1.LocaleValueUtil = LocaleValueUtil;

// Component

import ChainedSelect from "./component/bm-chainedselect.js";
window.BITSMIST.v1.ChainedSelect = ChainedSelect;

import BmTabindex from "./component/bm-tabindex.js";
window.BITSMIST.v1.BmTabindex  = BmTabindex;

import BmTabcontent from "./component/bm-tabcontent.js";
window.BITSMIST.v1.BmTabcontent = BmTabcontent;

import PreferenceServer from "./component/bm-preference.js";
window.BITSMIST.v1.PreferenceServer = PreferenceServer;

import LocaleServer from "./component/bm-locale.js";
window.BITSMIST.v1.LocaleServer = LocaleServer;

import TagLoader from "./component/bm-tagloader.js";
import SettingServer from "./component/bm-setting.js";
import ErrorServer from "./component/bm-error.js";
