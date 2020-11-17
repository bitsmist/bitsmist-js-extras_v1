window.BITSMIST = window.BITSMIST || {};
window.BITSMIST.v1 = window.BITSMIST.v1 || {};

// System

import App from './system/app';
window.BITSMIST.v1.App = App;

import Router from './system/router';
window.BITSMIST.v1.Router = Router;

import TagLoader from './system/tagloader';

import SettingManager from './system/setting-manager';
window.BITSMIST.v1.SettingManager = SettingManager;

import PreferenceManager from './system/preference-manager';
window.BITSMIST.v1.PreferenceManager = PreferenceManager;

import ErrorManager from './system/error-manager';
window.BITSMIST.v1.ErrorManager = ErrorManager;

// Organizer

import PluginOrganizer from './organizer/plugin-organizer';
BITSMIST.v1.Globals.organizers.register("PluginOrganizer", {"object":PluginOrganizer, "targets":"plugins"});

import RouteOrganizer from './organizer/route-organizer';
BITSMIST.v1.Globals.organizers.register("RouteOrganizer", {"object":RouteOrganizer, "targets":"routes"});

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
