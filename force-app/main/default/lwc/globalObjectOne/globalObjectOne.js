import { LightningElement } from 'lwc';

export default class GlobalObjectOne extends LightningElement {
    videoElement;
    canvasElement;

    renderedCallback() {
        this.videoElement = this.template.querySelector('.videoElement');
        this.canvasElement = this.template.querySelector('.canvas');
    }
    
    async initCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                this.videoElement.srcObject = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
            } catch (error) {
                console.error('Error accessing the camera: ', JSON.stringify(error));
            }
        } else {
            console.error('getUserMedia is not supported in this browser');
        }
    }

    async captureImage() {
        if(this.videoElement && this.videoElement.srcObject !== null) {
            this.canvasElement.height = this.videoElement.videoHeight;
            this.canvasElement.width = this.videoElement.videoWidth;
            const context = this.canvasElement.getContext('2d');
            context.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
            const imageData = this.canvasElement.toDataURL('image/png');
            const imageElement = this.template.querySelector('.imageElement');
            imageElement.setAttribute('src', imageData);
            imageElement.classList.add('slds-show');
            imageElement.classList.remove('slds-hide');
        }
    }

    async stopCamera(){
        const video = this.template.querySelector(".videoElement");
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        this.hideImageElement();
    }

    hideImageElement(){
        const imageElement = this.template.querySelector('.imageElement');
        imageElement.setAttribute('src', "");
        imageElement.classList.add('slds-hide');
        imageElement.classList.remove('slds-show');
    }
}