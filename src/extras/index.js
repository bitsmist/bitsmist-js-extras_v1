window.BITSMIST = window.BITSMIST || {};
window.BITSMIST.v1 = window.BITSMIST.v1 || {};

// Store

import ObservableStore from "./store/observable-store.js";
window.BITSMIST.v1.ObservableStore = ObservableStore;

import ObservableStoreMixin from "./store/observable-store-mixin.js";
window.BITSMIST.v1.ObservableStoreMixin = ObservableStoreMixin;

import BindableStore from "./store/bindable-store.js";
window.BITSMIST.v1.BindableStore = BindableStore;

// Organizer

import ErrorOrganizer from "./organizer/error-organizer.js";
BITSMIST.v1.OrganizerOrganizer.organizers.set("ErrorOrganizer", {"object":ErrorOrganizer, "targetWords":"errors", "targetEvents":["beforeStart"], "order":100});

import FileOrganizer from "./organizer/file-organizer.js";
BITSMIST.v1.OrganizerOrganizer.organizers.set("FileOrganizer", {"object":FileOrganizer, "targetWords":"files", "targetEvents":["afterSpecLoad"], "order":200});

import PluginOrganizer from "./organizer/plugin-organizer.js";
BITSMIST.v1.OrganizerOrganizer.organizers.set("PluginOrganizer", {"object":PluginOrganizer, "targetWords":"plugins", "targetEvents":["beforeStart"], "order":1100});

import ResourceOrganizer from "./organizer/resource-organizer.js";
BITSMIST.v1.OrganizerOrganizer.organizers.set("ResourceOrganizer", {"object":ResourceOrganizer, "targetWords":"resources", "targetEvents":["beforeStart", "afterSpecLoad", "doFetch", "doSubmit"], "order":1300});

import PreferenceOrganizer from "./organizer/preference-organizer.js";
BITSMIST.v1.OrganizerOrganizer.organizers.set("PreferenceOrganizer", {"object":PreferenceOrganizer, "targetWords":"preferences", "targetEvents":["beforeStart"], "order":1400});

import ElementOrganizer from "./organizer/element-organizer.js";
BITSMIST.v1.OrganizerOrganizer.organizers.set("ElementOrganizer", {"object":ElementOrganizer, "targetWords":"elements", "targetEvents":["beforeStart"], "order":2100});

import ValidationOrganizer from "./organizer/validation-organizer.js";
BITSMIST.v1.OrganizerOrganizer.organizers.set("ValidationOrganizer", {"object":ValidationOrganizer, "targetWords":"validations", "targetEvents":["afterAppend", "doCheckValidity", "doReportValidity"], "order":2100});

import DatabindingOrganizer from "./organizer/databinding-organizer.js";
BITSMIST.v1.OrganizerOrganizer.organizers.set("DatabindingOrganizer", {"object":DatabindingOrganizer, "targetWords":"data", "targetEvents":["afterAppend"], "order":2100});

import KeyOrganizer from "./organizer/key-organizer.js";
BITSMIST.v1.OrganizerOrganizer.organizers.set("KeyOrganizer", {"object":KeyOrganizer, "targetWords":"keys", "targetEvents":["afterAppend"], "order":2100});

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

// Validation handler

import ValidationHandler from "./validation-handler/validation-handler.js";
window.BITSMIST.v1.ValidationHandler = ValidationHandler;

import HTML5FormValidationHandler from "./validation-handler/html5form-validation-handler.js";
window.BITSMIST.v1.HTML5FormValidationHandler = HTML5FormValidationHandler;

import ObjectValidationHandler from "./validation-handler/object-validation-handler.js";
window.BITSMIST.v1.ObjectValidationHandler = ObjectValidationHandler;

// Ui

import Form from "./ui/form.js";
window.BITSMIST.v1.Form = Form;

import List from "./ui/list.js";
window.BITSMIST.v1.List = List;

// Util

import FormatterUtil from "./util/formatter-util.js";
window.BITSMIST.v1.FormatterUtil = FormatterUtil;

// Widget

import PreferenceManager from "./widget/bm-preference.js";
