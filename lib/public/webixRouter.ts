/**
 * Created by slanska on 2016-07-07.
 */

///<reference path="../../typings/webixRouter.d.ts"/>
///<reference path="../../bower_components/fsmrouter/lib/FSMRouter.d.ts"/>
///<reference path="../../typings/webix/webix.d.ts"/>
///<reference path="../../typings/promise/promise.d.ts"/>
///<reference path="../../typings/requirejs/require.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>

var _ = require('lodash');

// TODO Support for $windows
// $ondestroy
// include nested modules (use copy from webix-jet/core)
// $windows
// $events -- Needed?

/*
 Extends Webix Jet module with few properties used internally and purposed for processing nested modules
 (i.e. modules statically loaded as child modules). This extension stores lists of initialization,
 destroying, extra events and custom windows declared in nested modules
 */
declare interface IWebixJetModuleExt extends IWebixJetModule
{
    _init?:IWebixInitCallback[];
    _destroy?:IWebixDestroyCallback[];
    _events?:IWebixEventMap;
}

/*
 Extends request object and exposes few private properties declared in the base request
 */
declare interface fsmRequestExt extends fsmRequest
{
    level:number;
    routeStack:{
        route:fsmRoute,
        params?:any,
        $module?:IWebixJetModuleExt,
        $component:webix.ui.baseview,
        initialized?:boolean,

        /*
         Cloned copy of ui config
         */
        $componentConfig?:webix.ui.baseviewConfig;
    }[]
}

declare type IWebixAppPath = {
    page:string;
    params:any[]
}[];

class WebixJetApp implements IWebixJetApp
{
    private loadModule(req:fsmRequestExt, idx:number)
    {
        var self = this;

        return new Promise((resolve, reject)=>
        {
            var route = req.routeStack[idx].route;
            var mn = String(route.cfg.name || req.route.cfg.pattern);
            var modulePath = FSMRouter.join(self.config.basePath || './views/', route.path, '../' + mn);
            require([modulePath], (module:IWebixJetModuleExt)=>
            {
                module._init = [];
                module._destroy = [];
                module._events = module.$on || {};
                if (!module.$windows)
                    module.$windows = [];
                if (module.$oninit)
                    module._init.push(module.$oninit);
                if (module.$ondestroy)
                    module._destroy.push(module.$ondestroy);

                // Find all nested modules
                self.findViewByProp(module.$ui, '$ui',
                    (arr:IWebixJetModule[], idx:number)=>
                    {
                        var nn = arr[idx] as IWebixJetModule;
                        if (nn.$ondestroy)
                            module._destroy.push(nn.$ondestroy.bind(nn));
                        if (nn.$oninit)
                            module._init.push(nn.$oninit.bind(nn));
                        if (nn.$windows)
                        {
                            module.$windows = module.$windows.concat(nn.$windows);
                        }
                        arr[idx] = nn.$ui as any;
                    });

                // Get $subview, if applicable, and assign id
                var subv = [];
                self.findViewByProp(module.$ui, '$subview', subv);
                if (subv.length > 0)
                {
                    subv[0].id = webix.uid();
                    subv[0].view = 'template';
                    subv[0].holderId = `holder_${subv[0].id}`;
                    subv[0].template = `<div id="${subv[0].holderId}"></div>`;
                }

                resolve(module);
            });
        });
    }

    private findByPropInArray(vv:any[], propName:string, callbackOrArray:any[] | Function):void
    {
        if (!vv)
            return;

        var self = this;
        for (var idx = 0; idx < vv.length; idx++)
        {
            this.findPropInObj(vv, idx, propName, callbackOrArray);
        }
    }

    private findPropInObj(vv:any[], idx:number|string, propName:string, callbackOrArray:any[]|Function)
    {
        var self = this;
        var c = vv[idx];
        if (c)
        {
            if (c[propName])
            {
                if (typeof callbackOrArray === 'function')
                    (callbackOrArray as Function)(vv, idx);
                else (callbackOrArray as any[]).push(c);
            }

            self.findViewByProp(c, propName, callbackOrArray);
        }
    }

    private findViewByProp(vv, propName:string, foundItems:any[] | Function):void
    {
        var self = this;
        self.findPropInObj(vv, 'body', propName, foundItems);
        self.findByPropInArray(vv['rows'], propName, foundItems);
        self.findByPropInArray(vv['cols'], propName, foundItems);
        self.findByPropInArray(vv['cells'], propName, foundItems);
        self.findByPropInArray(vv['elements'], propName, foundItems);
    }

    constructor()
    {
        var self = this;

        self.config = {} as any;
        self.config.animation = {slide: 'in', direction: "right"};

        FSMRouter.beforeLeave = (previous:fsmRequestExt)=>
        {
            var lvl = previous.level;
            var r = previous.routeStack[lvl];
            var c = r.$component;
            if (c)
            {
                if (r.initialized && r.$module.$ondestroy)
                    r.$module.$ondestroy();

                c.destructor();
                r.$component = null;
            }
        };

        FSMRouter.afterEnter = (req:fsmRequestExt)=>
        {
            // Remember current level
            var lvl = req.level;
            var r = req.routeStack[lvl];

            var mn = String(req.route.cfg.name || req.route.cfg.pattern);
            var modulePath = FSMRouter.join(self.config.basePath || './views/', req.route.path, '../' + mn);
            var result:Promise.IThenable<any> = null;
            result = self.loadModule(req, req.level);
            result.then((module:IWebixJetModuleExt)=>
                {
                    if (!r.initialized)
                    {
                        r.$componentConfig = _.cloneDeep(module.$ui);
                        r.initialized = true;

                        // Find parent place holder. If does not exist, use body
                        var cc;
                        if (lvl > 0)
                        {
                            var pp = req.routeStack[lvl - 1];
                            if (pp.$module)
                            {
                                var subview = [];
                                self.findViewByProp(pp.$module.$ui, '$subview', subview);
                                if (subview.length > 0)
                                {
                                    if (subview[0])
                                    {
                                        cc = webix.ui(r.$componentConfig, subview[0].holderId);
                                    }
                                }
                            }
                        }

                        if (!cc)
                        {
                            cc = webix.ui(r.$componentConfig);
                        }
                        r.$component = cc;

                        r.$module = module;

                        if (module._init)
                        {
                            setTimeout(()=>
                            {
                                for (var ii = 0; ii < module._init.length; ii++)
                                {
                                    module._init[ii](r.$component, null)
                                }
                            });
                        }
                    }
                }
            );

            return result;
        };

        FSMRouter.onQueryChange = (req:fsmRequestExt)=>
        {
            var m = req.routeStack[req.level].$module;
            if (m && m.$onurlchange)
            // TODO Pass scope?
                m.$onurlchange(m, req.query, null);
        };
    }

    attachEvent(eventName:string, handler:Function)
    {
    }

    on(eventName:string, handler:Function)
    {
    }

    callEvent(eventName:string, params:any[])
    {
    }

    trigger(eventName:string, params:any[])
    {
        FSMRouter.trigger(eventName, params);
    }

    show(url:string, query?:any)
    {
        FSMRouter.navigate(url, query);
    }

    config:{
        id:string;
        name:string;
        version:string;
        debug:boolean;
        start:string,
        basePath ?:string,
        animation:{
            slide ?:'in' | 'out' | 'together',
            flip ?:'horizontal' | 'vertical',
            direction ?:'left' | 'right' | 'top' | 'bottom'
        }
    };

    get path():IWebixAppPath
    {
        var result = [] as IWebixAppPath;
        var prev = FSMRouter.previous as fsmRequestExt;
        if (prev && prev.routeStack)
        {
            for (var ii = 0; ii < prev.routeStack.length; ii++)
            {
                result.push({
                    page: String(prev.routeStack[ii].route.cfg.pattern),
                    params: prev.routeStack[ii].params
                });
            }
        }
        return result;
    };
}

/*
 TODO Needed?
 */
class WebixJetScope implements IWebixJetScope
{
    show(url:string, arg?:string)
    {
    }

    on(instance:any, eventName:string, handler:Function)
    {
    }

    sub(ui, name:string, stack)
    {
    }

    ui(module:IWebixJetModule, container)
    {
    }

    $layout:boolean;
    fullname:string;
    index:number;
    module:IWebixJetModule;
    name:string;
    parent:IWebixJetScope;
    root:any;
}

export = new WebixJetApp();

