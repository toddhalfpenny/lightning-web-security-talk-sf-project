import { LightningElement, track } from 'lwc';
import sr from "@salesforce/resourceUrl/lws_talk";
import { loadStyle, loadScript } from "lightning/platformResourceLoader";

export default class GlobalObjectFour extends LightningElement {
    @track url
    isRenderCallbackActionExecuted = false;
    qrcode;

    renderedCallback() {
        console.log('renderedCallback');
        if (this.isRenderCallbackActionExecuted) {
            return;
        }

        this.isRenderCallbackActionExecuted = true;
        this.url = "https://northafricadreamin.com/";
        loadScript(this, sr + "/jquery.min.js").then(() => {
            console.log("jquery loaded");
            return loadScript(this, sr + "/qrcode.js");
        }).then(() => {
            console.log("qrcode loaded");
            try {
                // const myDiv = this.refs.qrcodeDiv;
                // console.log("myDiv", myDiv);
                // this.qrcode = new QRCode(myDiv, {
                //     text: this.url,
                //     width: 128,
                //     height: 128,
                //     colorDark : "#000000",
                //     colorLight : "#ffffff",
                //     correctLevel : QRCode.CorrectLevel.H
                // });
            } catch(e) {
                console.error("QRCODE error", e);
            }
        }).catch(e => {
            console.war("Error loading 3rd party JS", e);
        });
    }

    handleUrlChange(event){
        this.url = event.target.value;
     }

    copyQrCode() {
        console.log('navigator.permissions', navigator.permissions);
        const myDiv = this.refs.qrcodeDiv;
        const canvas = myDiv.firstChild; 
        canvas.toBlob(async (blob) => { 
            const item = new ClipboardItem({ "image/png": blob });
            await navigator.clipboard
            .write([item])
            .then(
                () => {
                    console.log("Copied QR code to clipboard")
                }
            ).catch(e => {
                console.error('copyQrCode', e);
            });
        });
    }

    generateQrCode() {
        console.log("generateQrCode", this.url);
        try {
            // this.qrcode.clear(); 
            const myDiv = this.refs.qrcodeDiv;
            console.log("myDiv", myDiv);
            myDiv.innerHTML = '';
            this.qrcode = new QRCode(myDiv, {
                text: this.url,
                width: 128,
                height: 128,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
        } catch(e) {
            console.error("generateQrCode error", e);
        }
    }
}