import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import lwsTalkResources from '@salesforce/resourceUrl/lws_talk';
import POPPER from '@salesforce/resourceUrl/popper';

export default class GlobalObjectThree extends LightningElement {
	appResources = {
		phoneScreenshot: `${lwsTalkResources}/phoneScreenshot.png`,
	};
	isCalInitialized = false;
    error;
    popper;

    async renderedCallback() {
        if (this.isCalInitialized) {
            return;
        }
        this.isCalInitialized = true;

        try {
            console.log('Attempting to load Popper');
            await Promise.all([
                loadScript(this, POPPER + '/popper.min.js')
            ]);
            this.initTooltip();
        } catch (error) {
            console.error('Popper failed to load.', error);
            this.error = error;
        }
    }

    initTooltip() {
        const screenshot = this.template.querySelector('.phoneScreenshot');
        const tooltip = this.template.querySelector('.tooltip');
        this.popper = Popper.createPopper(screenshot, tooltip, {
            placement: 'left',
        }); 
    }
    setTooltipTop() {
        this.updateToolTip({placement : 'top'});
    }

    setTooltipRight() {
        this.updateToolTip({placement : 'right'});
    }

    setTooltipBottom() {
        this.updateToolTip({placement : 'bottom'});
    }

    setTooltipLeft() {
        this.updateToolTip({placement : 'left'});
    }

    async updateToolTip(attr) {
        const state = await this.popper.setOptions(attr);
    }
}