/**
 * Created by slanska on 2015-11-02.
 */

/// <reference path="../../../DefinitelyTyped/webix/webix.d.ts"/>

/*
 Renders as input checkbox with ionic framework styling

 Supported color themes:
     positive
     calm
     assertive
     energized
     stable
     light
     balanced
     royal
     dark
 */

webix.protoUI(
    {
        name: "switchbutton",
        defaults: {width: 200, height: 40, small: true, theme: "stable", disabled: "", checked: "", borderless: true},
        $init: function (config)
        {
            this.captchaImageID = webix.uid().toString();
            this.refreshButtonID  = webix.uid().toString();
            this.$view.innerHTML =
                `<label class='toggle disable-user-behavior ${this.disabled} ${this.checked} toggle-${this.theme}'>` +
                `<input value='on' class='ng-untouched ng-valid ng-dirty ng-valid-parse'` +
                `type='checkbox'> <div class='track'> <div class='handle'></div> </div> </label>`;
        },


        render: function ()
        {


        },

        $setSize: function (x:number, y:number)
        {

        },

        $getSize: function ()
        {
            // Array: minWidth, maxWidth, minHeight, maxHeight
            //return [-1, -1, -1, -1];
            return [60, -1, 40, -1];
        },

        refreshValue: function ()
        {

        },

        setValue: function (value)
        {
        },

        getValue: function ()
        {
        },

        focus: function ()
        {
        }
    },

    webix.ui.view
);
