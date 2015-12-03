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
webix.protoUI({
    name: "switchbutton",
    defaults: {
        width: 200, height: 40, small: false, theme: "light",
        borderless: true,
        template: function (config, common) {
            console.log("e " + config.toString() + ", obj " + common.toString());
            var id = config.name || "x" + webix.uid();
            var checked = (config.checkValue == config.value);
            var html = "\n                    <label class='toggle disable-user-behavior " + (this.small === true ? "toggle-small" : "") + " toggle-" + this.theme + "'>\n                    <input value='on'\n                    type='checkbox' " + this.disabled + " " + (checked ? 'checked' : '') + "> <div class='track'> <div class='handle'></div></div>" + (config.labelRight || '') + "</label>";
            return common.$renderInput(config, html, id);
        }
    },
    $init: function (config) {
        this.small = config.small || false;
        this.theme = config.theme || "light";
    },
    on_click: {
        "cmn-toggle": function (e, obj, node) {
            console.log("e " + e.toString() + ", obj " + obj.toString() + ", node " + node.toString());
            //this.toggle();
        }
    }
}, webix.ui.checkbox);
//# sourceMappingURL=switchbutton.js.map