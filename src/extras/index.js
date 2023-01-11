window.BITSMIST = window.BITSMIST || {};
window.BITSMIST.v1 = window.BITSMIST.v1 || {};

// Store

import ObservableStore from "./store/observable-store.js";
window.BITSMIST.v1.ObservableStore = ObservableStore;

import BindableStore from "./store/bindable-store.js";
window.BITSMIST.v1.BindableStore = BindableStore;

// Organizer

import FileOrganizer from "./organizer/file-organizer.js";
BITSMIST.v1.OrganizerOrganizer.register("FileOrganizer", {"object":FileOrganizer, "targetWords":"files", "targetEvents":["beforeStart", "afterSpecLoad"], "order":110});

import ErrorOrganizer from "./organizer/error-organizer.js";
BITSMIST.v1.OrganizerOrganizer.register("ErrorOrganizer", {"object":ErrorOrganizer, "targetWords":"errors", "targetEvents":["beforeStart", "afterSpecLoad"], "order":120});

import ElementOrganizer from "./organizer/element-organizer.js";
BITSMIST.v1.OrganizerOrganizer.register("ElementOrganizer", {"object":ElementOrganizer, "targetWords":"elements", "targetEvents":["beforeStart"], "order":220});

import ResourceOrganizer from "./organizer/resource-organizer.js";
BITSMIST.v1.OrganizerOrganizer.register("ResourceOrganizer", {"object":ResourceOrganizer, "targetWords":"resources", "targetEvents":["beforeStart", "afterSpecLoad", "doFetch", "doSubmit"], "order":300});

import FormOrganizer from "./organizer/form-organizer.js";
BITSMIST.v1.OrganizerOrganizer.register("FormOrganizer", {"object":FormOrganizer, "targetWords":["forms", "validations"], "targetEvents":["beforeStart", "afterSpecLoad", "doCheckValidity", "doReportValidity"], "order":310});

import DatabindingOrganizer from "./organizer/databinding-organizer.js";
BITSMIST.v1.OrganizerOrganizer.register("DatabindingOrganizer", {"object":DatabindingOrganizer, "targetWords":"data", "targetEvents":["afterTransform"], "order":320});

import PluginOrganizer from "./organizer/plugin-organizer.js";
BITSMIST.v1.OrganizerOrganizer.register("PluginOrganizer", {"object":PluginOrganizer, "targetWords":"plugins", "targetEvents":["beforeStart", "afterSpecLoad"], "order":800});

import KeyOrganizer from "./organizer/key-organizer.js";
BITSMIST.v1.OrganizerOrganizer.register("KeyOrganizer", {"object":KeyOrganizer, "targetWords":"keys", "targetEvents":["afterTransform"], "order":800});

import ChainOrganizer from "./organizer/chain-organizer.js";
BITSMIST.v1.OrganizerOrganizer.register("ChainOrganizer", {"object":ChainOrganizer, "targetWords":"chains", "targetEvents":["beforeStart", "afterSpecLoad"], "order":800});

import DialogOrganizer from "./organizer/dialog-organizer.js";
BITSMIST.v1.OrganizerOrganizer.register("DialogOrganizer", {"object":DialogOrganizer, "targetWords":"dialog", "targetEvents":["beforeStart", "afterStart"], "order":800});

import PreferenceOrganizer from "./organizer/preference-organizer.js";
BITSMIST.v1.OrganizerOrganizer.register("PreferenceOrganizer", {"object":PreferenceOrganizer, "targetWords":"preferences", "targetEvents":["beforeStart", "afterSpecLoad"], "order":900});

// Plugin

import Plugin from "./plugin/plugin.js";
window.BITSMIST.v1.Plugin = Plugin;

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

import Form from "./component/bm-form.js";
window.BITSMIST.v1.Form = Form;

import List from "./component/bm-list.js";
window.BITSMIST.v1.List = List;

import ChainedSelect from "./component/bm-chainedselect.js";
window.BITSMIST.v1.ChainedSelect = ChainedSelect;

import BmTabindex from "./component/bm-tabindex.js";
window.BITSMIST.v1.BmTabindex  = BmTabindex;

import BmTabcontent from "./component/bm-tabcontent.js";
window.BITSMIST.v1.BmTabcontent = BmTabcontent;

import TagLoader from "./component/bm-tagloader.js";
import SettingManager from "./component/bm-setting.js";
import PreferenceManager from "./component/bm-preference.js";
