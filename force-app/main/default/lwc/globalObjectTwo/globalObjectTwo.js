import { LightningElement } from 'lwc';

export default class GlobalObjectTwo extends LightningElement {
    clippy = 'NOT-YET-SET';
    error = false;

    get clipboardContents() {
        return this.clippy;
    }

    async getClipboardContents() {
        await navigator.clipboard
        .readText()
        .then(
            (clipText) => {
                if (clipText.length > 0) {
                    this.error = false;
                } else {
                    this.error = true;
                }
                this.clippy = clipText;
            }
        ).catch(e => {
            console.error(e);
        });
    }
}