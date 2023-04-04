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

// Organizer

import FileOrganizer from "./organizer/file-organizer.js";
BM.OrganizerOrganizer.register(FileOrganizer);

import ErrorOrganizer from "./organizer/error-organizer.js";
BM.OrganizerOrganizer.register(ErrorOrganizer);

import ElementOrganizer from "./organizer/element-organizer.js";
BM.OrganizerOrganizer.register(ElementOrganizer);

import ResourceOrganizer from "./organizer/resource-organizer.js";
BM.OrganizerOrganizer.register(ResourceOrganizer);

import ValidationOrganizer from "./organizer/validation-organizer.js";
BM.OrganizerOrganizer.register(ValidationOrganizer);

import FormOrganizer from "./organizer/form-organizer.js";
BM.OrganizerOrganizer.register(FormOrganizer);

import ListOrganizer from "./organizer/list-organizer.js";
BM.OrganizerOrganizer.register(ListOrganizer);

import DatabindingOrganizer from "./organizer/databinding-organizer.js";
BM.OrganizerOrganizer.register(DatabindingOrganizer);

import LocaleOrganizer from "./organizer/locale-organizer.js";
BM.OrganizerOrganizer.register(LocaleOrganizer);

import KeyOrganizer from "./organizer/key-organizer.js";
BM.OrganizerOrganizer.register(KeyOrganizer);

import ChainOrganizer from "./organizer/chain-organizer.js";
BM.OrganizerOrganizer.register(ChainOrganizer);

import DialogOrganizer from "./organizer/dialog-organizer.js";
BM.OrganizerOrganizer.register(DialogOrganizer);

import PreferenceOrganizer from "./organizer/preference-organizer.js";
BM.OrganizerOrganizer.register(PreferenceOrganizer);

import RouteOrganizer from "./organizer/route-organizer.js";
BM.OrganizerOrganizer.register(RouteOrganizer);

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
