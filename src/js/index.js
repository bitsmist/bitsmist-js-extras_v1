//import '@webcomponents/custom-elements';
//import 'proxy-polyfill';

window.BITSMIST = window.BITSMIST || {};
window.BITSMIST.v1 = window.BITSMIST.v1 || {};

// Error

import AjaxErrorHandler from './error/ajax-error-handler';
window.BITSMIST.v1.AjaxErrorHandler = AjaxErrorHandler;

import NoRouteErrorHandler from './error/no-route-error-handler';
window.BITSMIST.v1.NoRouteErrorHandler = NoRouteErrorHandler;

// Preference

import CookiePreferenceHandler from './preference/cookie-preference-handler';
window.BITSMIST.v1.CookiePreferenceHandler = CookiePreferenceHandler;

import ObserverPreferenceHandler from './preference/observer-preference-handler';
window.BITSMIST.v1.ObserverPreferenceHandler = ObserverPreferenceHandler;

// Ui

import Pad from './ui/pad';
window.BITSMIST.v1.Pad = Pad;

import Form from './ui/form';
window.BITSMIST.v1.Form = Form;

import List from './ui/list';
window.BITSMIST.v1.List = List;

// Util

import AuthenticationUtil from './util/authentication-util';
window.BITSMIST.v1.AuthenticationUtil = AuthenticationUtil;

import FormatterUtil from './util/formatter-util';
window.BITSMIST.v1.FormatterUtil = FormatterUtil;

import MasterUtil from './util/master-util';
window.BITSMIST.v1.MasterUtil = MasterUtil;
