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

import PluginOrganizer from "./organizer/plugin-organizer.js";
BITSMIST.v1.OrganizerOrganizer.organizers.set("PluginOrganizer", {"object":PluginOrganizer, "targetWords":"plugins", "targetEvents":["beforeStart"], "order":400});

import FileOrganizer from "./organizer/file-organizer.js";
BITSMIST.v1.OrganizerOrganizer.organizers.set("FileOrganizer", {"object":FileOrganizer, "targetWords":"files", "targetEvents":["afterSpecLoad"], "order":400});

import MasterOrganizer from "./organizer/master-organizer.js";
BITSMIST.v1.OrganizerOrganizer.organizers.set("MasterOrganizer", {"object":MasterOrganizer, "targetWords":"masters", "targetEvents":["beforeStart", "afterSpecLoad"], "order":400});

import PreferenceOrganizer from "./organizer/preference-organizer.js";
BITSMIST.v1.OrganizerOrganizer.organizers.set("PreferenceOrganizer", {"object":PreferenceOrganizer, "targetWords":"preferences", "targetEvents":["beforeStart"], "order":500});

import ElementOrganizer from "./organizer/element-organizer.js";
BITSMIST.v1.OrganizerOrganizer.organizers.set("ElementOrganizer", {"object":ElementOrganizer, "targetWords":"elements", "targetEvents":["beforeStart"], "order":600});

import DatabindingOrganizer from "./organizer/databinding-organizer.js";
BITSMIST.v1.OrganizerOrganizer.organizers.set("DatabindingOrganizer", {"object":DatabindingOrganizer, "targetWords":"data", "targetEvents":["beforeStart"], "order":900});

import KeyOrganizer from "./organizer/key-organizer.js";
BITSMIST.v1.OrganizerOrganizer.organizers.set("KeyOrganizer", {"object":KeyOrganizer, "targetWords":"keys", "targetEvents":["beforeStart"], "order":900});

// Plugin

import Plugin from "./plugin/plugin.js";
window.BITSMIST.v1.Plugin = Plugin;

import CookieStoreHandler from "./plugin/store/cookie-store-handler.js";
window.BITSMIST.v1.CookieStoreHandler = CookieStoreHandler;

import ResourceHandler from "./plugin/resource/resource-handler.js";
window.BITSMIST.v1.ResourceHandler = ResourceHandler;

// Ui

import Form from "./ui/form.js";
window.BITSMIST.v1.Form = Form;

import List from "./ui/list.js";
window.BITSMIST.v1.List = List;

import DefaultkeyHandler from "./plugin/ui/defaultkey-handler.js";
window.BITSMIST.v1.DefaultkeyHandler = DefaultkeyHandler;

// Util

import AuthenticationUtil from "./util/authentication-util.js";
window.BITSMIST.v1.AuthenticationUtil = AuthenticationUtil;

import FormatterUtil from "./util/formatter-util.js";
window.BITSMIST.v1.FormatterUtil = FormatterUtil;

import MasterUtil from "./util/master-util.js";
window.BITSMIST.v1.MasterUtil = MasterUtil;

import ResourceUtil from "./util/resource-util.js";
window.BITSMIST.v1.ResourceUtil = ResourceUtil;

// Widget

import PreferenceManager from "./widget/bm-preference.js";
