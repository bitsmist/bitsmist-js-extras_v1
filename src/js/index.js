window.BITSMIST = window.BITSMIST || {};
window.BITSMIST.v1 = window.BITSMIST.v1 || {};

// Error handler

import AjaxErrorHandler from './plugin/error/ajax-error-handler';
window.BITSMIST.v1.AjaxErrorHandler = AjaxErrorHandler;

import NoRouteErrorHandler from './plugin/error/no-route-error-handler';
window.BITSMIST.v1.NoRouteErrorHandler = NoRouteErrorHandler;

// Preference handler

import CookiePreferenceHandler from './plugin/preference/cookie-preference-handler';
window.BITSMIST.v1.CookiePreferenceHandler = CookiePreferenceHandler;

import PreferenceHandler from './plugin/preference/preference-handler';
window.BITSMIST.v1.PreferenceHandler = PreferenceHandler;

// Resource handler

import MasterHandler from './plugin/resource/master-handler';
window.BITSMIST.v1.MasterHandler = MasterHandler;

import ResourceHandler from './plugin/resource/resource-handler';
window.BITSMIST.v1.ResourceHandler = ResourceHandler;

import SettingHandler from './plugin/resource/setting-handler';
window.BITSMIST.v1.SettingHandler = SettingHandler;

// Ui

import Pad from './ui/pad';
window.BITSMIST.v1.Pad = Pad;

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
