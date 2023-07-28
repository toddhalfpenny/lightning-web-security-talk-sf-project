import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { getFieldValue } from 'lightning/uiRecordApi';
import { registerRefreshHandler, unregisterRefreshHandler } from "lightning/refresh";
import { refreshApex } from "@salesforce/apex";

import getContacts from '@salesforce/apex/AccountController.getContacts';
import PRIMARY_CONTACT_ID_FIELD from '@salesforce/schema/Account.Primary_Contact__c';
import ACCOUNT_ID_FIELD from '@salesforce/schema/Account.Id';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';

const LOG_TAG = "primaryContact.js";
const FIELDS = [
    ACCOUNT_NAME_FIELD,
    PRIMARY_CONTACT_ID_FIELD
];
let i=0;

export default class PrimaryContact extends LightningElement {
    @api recordId;  
    @track record;   
    @track error;   //this holds errors
    @track items = []; //this holds the array for records with value & label
    @track value = '';  //this displays selected value of combo box
    @track primaryContactId;
    refreshHandlerID;
    wiredContactsResult;

    connectedCallback() {
        try  {
            this.refreshHandlerID = registerRefreshHandler(this, this.refreshHandler);
        } catch(error) {
            console.warn(LOG_TAG, "registerRefreshHandler", error);
        }
    }
    disconnectedCallback() {
      unregisterRefreshHandler(this.refreshHandlerID);
    }

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
        wiredAccount({data, error}) {
            if (data) {
                this.record = data;
                console.log("Got data");
                const accName = getFieldValue(this.record, ACCOUNT_NAME_FIELD); 
                this.primaryContactId = getFieldValue(data, PRIMARY_CONTACT_ID_FIELD);
                console.log("this.primaryContactId", this.primaryContactId);
            } else if (error) {
                console.error('THERROR', error)
                this.record = undefined;
            }
        }

     /* Load Contacts based on AccountId from Controller */
     @wire(getContacts, { accountId: '$recordId'})
     wiredContacts(result) {
        this.wiredContactsResult = result;
        console.log(LOG_TAG, 'wiredContacts');
        if (this.wiredContactsResult.data) {
            this.items = [];
            for(i=0; i<this.wiredContactsResult.data.length; i++) {
                this.items = [...this.items ,{value: this.wiredContactsResult.data[i].Id , label: this.wiredContactsResult.data[i].Name}];                                   
            }                
            this.error = undefined;
        } else if (this.wiredContactsResult.error) {
            this.error = error;
        }
     } 

     refreshHandler() {
        console.log(LOG_TAG, 'refreshHandler');
        return new Promise(async (resolve, reject) => {
            refreshApex(this.wiredContactsResult)
            .then(() => {
                resolve(true);
            }).catch(e => {
                console.error(LOG_TAG, 'refreshApex', e);
                reject();
            });
        });
      }
     
     //getter property from statusOptions which return the items array
     get primaryContactOptions() {
         console.log(this.items);
         return this.items;
     }

     handlePrimaryContactChange(event) {
        // Get the string of the "value" attribute on the selected option
        const selectedOption = event.detail.value;
        console.log('selectedOption=' + selectedOption);

        // Update the Account record
        let fields = {}
        fields[ACCOUNT_ID_FIELD.fieldApiName] = this.recordId;
        fields[PRIMARY_CONTACT_ID_FIELD.fieldApiName] = selectedOption;
        const recordInput = { fields };
        console.log('recordInput', recordInput)
        updateRecord(recordInput).then(() => {
            console.log("Account Updated");
        })
        .catch((error) => {
            this.error = error;
            console.error("ACCOUNT NOT UPDATE", error);
        });
    }


}