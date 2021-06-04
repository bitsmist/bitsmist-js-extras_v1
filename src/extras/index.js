window.BITSMIST = window.BITSMIST || {};
window.BITSMIST.v1 = window.BITSMIST.v1 || {};

// Organizer

import ErrorOrganizer from './organizer/error-organizer';
BITSMIST.v1.OrganizerOrganizer.organizers.set("ErrorOrganizer", {"object":ErrorOrganizer, "targetWords":"errors", "targetEvents":["beforeStart"], "order":100});

import PluginOrganizer from './organizer/plugin-organizer';
BITSMIST.v1.OrganizerOrganizer.organizers.set("PluginOrganizer", {"object":PluginOrganizer, "targetWords":"plugins", "targetEvents":["beforeStart"], "order":400});

import FileOrganizer from './organizer/file-organizer';
BITSMIST.v1.OrganizerOrganizer.organizers.set("FileOrganizer", {"object":FileOrganizer, "targetWords":"files", "targetEvents":["afterSpecLoad"], "order":400});

import MasterOrganizer from './organizer/master-organizer';
BITSMIST.v1.OrganizerOrganizer.organizers.set("MasterOrganizer", {"object":MasterOrganizer, "targetWords":"masters", "targetEvents":["beforeStart", "afterSpecLoad"], "order":400});

import PreferenceOrganizer from './organizer/preference-organizer';
BITSMIST.v1.OrganizerOrganizer.organizers.set("PreferenceOrganizer", {"object":PreferenceOrganizer, "targetWords":"preferences", "targetEvents":["beforeStart"], "order":500});

import AttrOrganizer from './organizer/attr-organizer';
BITSMIST.v1.OrganizerOrganizer.organizers.set("AttrOrganizer", {"object":AttrOrganizer, "targetWords":"attrs", "targetEvents":["beforeStart", "afterSpecLoad"], "order":600});

// Add new target events to organizers
BITSMIST.v1.OrganizerOrganizer.organizers.get("EventOrganizer")["targetEvents"].push("afterSpecLoad");

// Plugin

import Plugin from './plugin/plugin';
window.BITSMIST.v1.Plugin = Plugin;

// Plugin - Store handler

import CookieStoreHandler from './plugin/store/cookie-store-handler';
window.BITSMIST.v1.CookieStoreHandler = CookieStoreHandler;

// Plugin - Resource handler

import ResourceHandler from './plugin/resource/resource-handler';
window.BITSMIST.v1.ResourceHandler = ResourceHandler;

// Ui

import Form from './ui/form';
window.BITSMIST.v1.Form = Form;

import List from './ui/list';
window.BITSMIST.v1.List = List;

import DefaultkeyHandler from './plugin/ui/defaultkey-handler';
window.BITSMIST.v1.DefaultkeyHandler = DefaultkeyHandler;

// Util

import AuthenticationUtil from './util/authentication-util';
window.BITSMIST.v1.AuthenticationUtil = AuthenticationUtil;

import FormatterUtil from './util/formatter-util';
window.BITSMIST.v1.FormatterUtil = FormatterUtil;

import MasterUtil from './util/master-util';
window.BITSMIST.v1.MasterUtil = MasterUtil;

import ResourceUtil from './util/resource-util';
window.BITSMIST.v1.ResourceUtil = ResourceUtil;

// Preference

BITSMIST.v1.preferences = PreferenceOrganizer.preferences;
BITSMIST.v1.ClassUtil.newComponent(BITSMIST.v1.Component, {
	"settings": {
		"name":	"PreferenceManager",
	}
}, "bm-preference", "PreferenceManager");
