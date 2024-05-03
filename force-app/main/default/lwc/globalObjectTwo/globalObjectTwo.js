import { LightningElement } from 'lwc';

export default class GlobalObjectTwo extends LightningElement {
    clippy = 'NOT-YET-SET';
    error = false;

    get clipboardContents() {
        return this.clippy;
    }

    async getClipboardContents() {
        console.log('navigator.permissions', navigator.permissions);
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

    async captureAudio() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
        const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
        
        const tasks = [
            "copy",
            "paste"
          ];
        const grammar = `#JSGF V1.0; grammar tasks; public <task> = ${tasks.join(
            " | ",
          )};`;


        const recognition = new SpeechRecognition();
        const speechRecognitionList = new SpeechGrammarList();

        speechRecognitionList.addFromString(grammar, 1);

        recognition.grammars = speechRecognitionList;
        recognition.continuous = false;
        recognition.lang = "en-GB";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();
        console.log("Ready to receive a task command.");

        recognition.onresult = (event) => {
            const task = event.results[0][0].transcript;
            // diagnostic.textContent = `Result received: ${color}.`;
            // bg.style.backgroundColor = color;
            const confidence = event.results[0][0].confidence;
            console.log(`Confidence: ${event.results[0][0].confidence}`, task);
            
            if (confidence > 0.7) {
                switch (task) {
                    case 'paste':
                        this.getClipboardContents();
                        break;
                }
            }
        };

        recognition.onspeechend = () => {
            recognition.stop();
        };
    }
}