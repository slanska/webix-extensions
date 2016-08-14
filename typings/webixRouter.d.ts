/**
 * Created by slanska on 2016-07-07.
 */

///<reference path="./webix/webix.d.ts"/>

declare interface IWebixJetApp
{
    config:{
        id:string,
        name:string,
        version:string,
        debug:boolean,
        start:string
    };

    attachEvent(eventName:string, handler:Function);
    on(eventName:string, handler:Function);

    callEvent(eventName:string, params:any[]);
    trigger(eventName:string, params:any[]);

    /*

     */
    show(viewModule:string);

    /*
     Current route path
     */
    path:{page:string, params:any[]}[]
}

declare interface IWebixJetScope
{
    show(url:string, arg?:string);
    on(instance:any, eventName:string, handler:Function);
    $layout:boolean;
    fullname:string;
    index:number;
    module:IWebixJetModule;
    name:string;
    parent?:IWebixJetScope;
    root:any; // TODO result?
    sub(ui, name:string, stack);
    ui(module:IWebixJetModule, container);
}

declare interface IWebixJetUrlParam
{
    page:string;
    params:any;
}

declare type IWebixInitCallback = (view:webix.ui.baseview, $scope:IWebixJetScope)=>void;
declare type IWebixUrlChangeCallback = (config:any, url:IWebixJetUrlParam, $scope:IWebixJetScope)=>void;
declare type IWebixDestroyCallback = ()=>void;
declare type IWebixEventMap = {[eventName:string]:Function};

/*
 Declares contract for webix-jet viewmodule
 */
declare interface IWebixJetModule
{
    $ui:webix.ui.baseviewConfig;
    $oninit?:IWebixInitCallback;
    $onurlchange?:IWebixUrlChangeCallback;
    $ondestroy?:IWebixDestroyCallback;

    /*
     Id of menu object to associate with
     */
    $menu?:string;

    $windows?:webix.ui.baseviewConfig[];

    $on?:IWebixEventMap;

    /*
     Optional ID of view container that will serve as a subview placeholder
     */
    $subview?:string;
}


