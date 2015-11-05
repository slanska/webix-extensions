/**
 * Created by slanska on 2015-11-02.
 */

/// <reference path="../../../DefinitelyTyped/webix/webix.d.ts"/>

/*
 Renders as 3 element control: captcha image, refresh button and text to enter
 */

webix.protoUI(
    {
        /*
         Borrowed from: http://stackoverflow.com/questions/5366727/convert-array-of-byte-values-to-base64-encoded-string-and-break-long-lines-java
         */
        _bytesToBase64: function (data)
        {
            var str = String.fromCharCode.apply(null, data);
            return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
        },

        name: "captcha",

        defaults: {width: 200, height: 40, required: true, imageUrl: "/captcha"},

        $init: function (config)
        {
            this.width = config.width || 200;
            this.height = config.height || 40;
            this.required = config.required || true;
            this.imageUrl = config.imageUrl || "/captcha";

            this.refreshButtonID = webix.uid().toString();
            this.borderless = config.borderless || true;

            this.captchaImageID = webix.uid().toString();
            this.textBoxID = webix.uid().toString();

            this.$view.innerHTML =
                `<div >
                <img id='${this.captchaImageID}' src='#' alt='Enter captcha'></img></div>
                <div > <span class='webix_icon fa-refresh fa-large' ></span> </div>
                <div class="webix_view webix_control webix_el_text">
                <div class="webix-el_box"><input type="text" id="${this.textBoxID}" /></div></div>`;
            this.refreshValue();
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
            var self = this;
            webix.ajax().get(this.imageUrl).then(
                function (response)
                {
                    // {hash: string;
                    //image: {type: string, data: any};
                    //value?: string;}
                    var result = response.json();
                    var buffer = self._bytesToBase64(result.image.data);
                    document.getElementById(self.captchaImageID).setAttribute('src', 'data:image/png;base64,' + buffer);
                },

                function (response)
                {

                });
            // captcha.png image
            // Refresh button
            // Text box
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
