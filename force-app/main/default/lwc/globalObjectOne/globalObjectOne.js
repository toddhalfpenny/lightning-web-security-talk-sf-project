import { LightningElement } from 'lwc';

export default class GlobalObjectOne extends LightningElement {
    videoElement;
    canvasElement;
    speechRunning = false;
    recognition;

    renderedCallback() {
        this.videoElement = this.template.querySelector('.videoElement');
        this.canvasElement = this.template.querySelector('.canvas');
    }
    
    async initCamera() {
        console.log("window", window);
        console.log("localStorage", localStorage);
        console.log("window.indexedDB", window.indexedDB);
        window.indexedDB
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

    async screenCapture() {
        const context = this.canvasElement.getContext('2d');
      
        try {
            const captureStream = await navigator.mediaDevices.getDisplayMedia();
            this.videoElement.srcObject = captureStream;
            this.canvasElement.height = this.videoElement.videoHeight;
            this.canvasElement.width = this.videoElement.videoWidth;
            context.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
            // const frame = this.canvasElement.toDataURL("image/png");
        //   window.location.href = frame;
            window.setTimeout(() => {
                this.captureImage();
                captureStream.getTracks().forEach(track => track.stop());
                this.videoElement.srcObject = null;
            }, 200);
            // this.captureImage();
        } catch (err) {
          console.error("Error: " + err);
        }
    }

    async picInPic() {
        console.log("picInPic");
        if (!window.documentPictureInPicture.window) {
            // Open a Picture-in-Picture window.
            console.log("attempting to open");
            const pipWindow = await window.documentPictureInPicture.requestWindow({
              width: 660,
              height: 500,
            });
            console.log(pipWindow);
        
            // ...
        
            // Move the player to the Picture-in-Picture window.
            pipWindow.document.body.append(this.videoElement);
        
            // Display a message to say it has been moved
            inPipMessage.style.display = "block";
        } else {
            const mediaContainer = this.refs.mediaContainer;
            window.documentPictureInPicture.window.close();
            mediaContainer.append(this.videoElement);
        }
    }
    async captureAudio() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
        const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
        
        this.recognition = this.recognition ?? new SpeechRecognition();

        if (this.speechRunning) {
            console.log("stopping speech recognition");
            this.recognition.stop()
            this.speechRunning = false;
        } else {
            console.log("Starting speech recognition");
            this.speechRunning = true;
            const tasks = [
                "start video",
                "stop video",
                "screen capture",
                "stop listening"
            ];
            const grammar = `#JSGF V1.0; grammar tasks; public <task> = ${tasks.join(
                " | ",
            )};`;


            const speechRecognitionList = new SpeechGrammarList();

            speechRecognitionList.addFromString(grammar, 1);

            this.recognition.grammars = speechRecognitionList;
            this.recognition.continuous = true;
            this.recognition.lang = "en-GB";
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;

            this.recognition.start();
            console.log("Ready to receive a task command.");

            this.recognition.onresult = (event) => {
                console.log("event.results", event.results);
                const resultsList = event.results[event.results.length -1];
                console.log("resultsList", resultsList);
                const lastResult = resultsList[resultsList.length - 1];
                console.log("lastResult", lastResult);
                const task = resultsList[resultsList.length - 1].transcript;
                // diagnostic.textContent = `Result received: ${color}.`;
                // bg.style.backgroundColor = color;
                const confidence = lastResult.confidence;
                console.log(`Confidence: ${lastResult.confidence}`, task);
                
                if (confidence > 0.7) {
                    switch (task.trimStart()) {
                        case 'start video':
                            this.initCamera();
                            break;
                        case 'stop video':
                            this.stopCamera();
                            break;
                        case 'screen capture':
                            this.screenCapture();
                            break;
                        case 'stop listening':
                            this.recognition.stop();
                            this.speechRunning = false;
                            break;
                    }
                }
            };

            // recognition.onspeechend = () => {
            //     recognition.stop();
            //     this.captureAudio();
            // };
        }
    }
}