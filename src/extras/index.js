window.BITSMIST = window.BITSMIST || {};
window.BITSMIST.v1 = window.BITSMIST.v1 || {};

// Organizer

import PluginOrganizer from './organizer/plugin-organizer';
BITSMIST.v1.OrganizerOrganizer.organizers.set("PluginOrganizer", {"object":PluginOrganizer, "targetWords":"plugins", "targetEvents":["beforeStart"], "order":1000});

import RouteOrganizer from './organizer/route-organizer';
BITSMIST.v1.OrganizerOrganizer.organizers.set("RouteOrganizer", {"object":RouteOrganizer, "targetWords":"routes", "targetEvents":["beforeStart", "afterSpecLoad"], "order":255});

import RouteHandlerOrganizer from './organizer/routehandler-organizer';
BITSMIST.v1.OrganizerOrganizer.organizers.set("RouteHandlerOrganizer", {"object":RouteHandlerOrganizer, "targetWords":"", "targetEvents":["afterAppend"], "order":1200});

import FileOrganizer from './organizer/file-organizer';
BITSMIST.v1.OrganizerOrganizer.organizers.set("FileOrganizer", {"object":FileOrganizer, "targetWords":"files", "targetEvents":["afterSpecLoad"], "order":250}); // Need to come before component-organizer

import ErrorOrganizer from './organizer/error-organizer';
BITSMIST.v1.OrganizerOrganizer.organizers.set("ErrorOrganizer", {"object":ErrorOrganizer, "targetWords":"errors", "targetEvents":["beforeStart"], "order":1400});

import PreferenceOrganizer from './organizer/preference-organizer';
BITSMIST.v1.OrganizerOrganizer.organizers.set("PreferenceOrganizer", {"object":PreferenceOrganizer, "targetWords":"preferences", "targetEvents":["beforeStart"], "order":1500});

// Add new target events to organizers
BITSMIST.v1.OrganizerOrganizer.organizers.get("ComponentOrganizer")["targetEvents"].push("afterSpecLoad");
BITSMIST.v1.OrganizerOrganizer.organizers.get("AttrOrganizer")["targetEvents"].push("afterSpecLoad");
BITSMIST.v1.OrganizerOrganizer.organizers.get("ElementOrganizer")["targetEvents"].push("afterSpecLoad");

// Router
import Router from './system/router';
window.BITSMIST.v1.Router = Router;

// Plugin

import Plugin from './plugin/plugin';
window.BITSMIST.v1.Plugin = Plugin;

// Plugin - Error handler

import AjaxErrorHandler from './plugin/error/ajax-error-handler';
window.BITSMIST.v1.AjaxErrorHandler = AjaxErrorHandler;

import NoRouteErrorHandler from './plugin/error/no-route-error-handler';
window.BITSMIST.v1.NoRouteErrorHandler = NoRouteErrorHandler;

// Plugin - Store handler

import CookieStoreHandler from './plugin/store/cookie-store-handler';
window.BITSMIST.v1.CookieStoreHandler = CookieStoreHandler;

// Plugin - Resource handler

import MasterHandler from './plugin/resource/master-handler';
window.BITSMIST.v1.MasterHandler = MasterHandler;

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
