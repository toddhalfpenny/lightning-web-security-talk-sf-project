import { LightningElement, api, track } from 'lwc';
import { RefreshEvent } from "lightning/refresh";
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import ACCOUNT_ID_FIELD from '@salesforce/schema/Account.Id';
import PRIMARY_CONTACT_ID_FIELD from '@salesforce/schema/Account.Primary_Contact__c';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import CONTACT_ACCOUNT_ID_FIELD from '@salesforce/schema/Contact.AccountId';
import CONTACT_FIRST_NAME_FIELD from '@salesforce/schema/Contact.FirstName';
import CONTACT_LAST_NAME_FIELD from '@salesforce/schema/Contact.LastName';
import { createRecord, updateRecord } from 'lightning/uiRecordApi';

export default class NewContact extends LightningElement {
    @api
    recordId;

    primaryContactvalue = [];
    firstName = "";
    lastName = "";
    isPrimaryContact = false;

    get primaryContactOptions() {
        return [{label: 'true', value:'true'}]
    }

    handleFirstNameChange(event) {
        this.firstName = event.detail.value;
    }

    handleLastNameChange(event) {
        this.lastName = event.detail.value;
    }

    handleChangeIsPrimaryContact(e) {
        console.log('handleChangeIsPrimaryContact', e.detail.value);
        this.isPrimaryContact = (e.detail.value.length > 0) ?  true : false;
    }
    handleSave(){
        console.log('handleSave', this.isPrimaryContact);
        this.createContact().then(cId => {
            return this.maybeUpdateAccount(cId);
        }).then(_ => {
            try {
                this.dispatchEvent(new RefreshEvent());
            } catch(e) {
                console.warn('Looks like LWS is not enabled');
            }
            this.firstName = "";
            this.lastName = "";
            this.primaryContactvalue = [];
        }).catch(e => {
            console.error('', e);
        });
    }

    createContact() {
        return new Promise(async (resolve, reject) => {
            const fields = {};
            fields[CONTACT_ACCOUNT_ID_FIELD.fieldApiName] = this.recordId;
            fields[CONTACT_FIRST_NAME_FIELD.fieldApiName] = this.firstName;
            fields[CONTACT_LAST_NAME_FIELD.fieldApiName] = this.lastName;
            console.log('fields', fields);
            const contactRec = {apiName: CONTACT_OBJECT.objectApiName, fields};
            console.log('contactRec', contactRec);
            createRecord(contactRec).then( result => {
                console.log('handleSave', "Contact Saved", result);
                resolve(result.id);
                // this.dispatchEvent(new RefreshEvent());
            }).catch(e => {
                console.error('ERROR CREATING CONTRACT', e);
                reject();
            })
        });
    }

    maybeUpdateAccount(newContactId) {
        return new Promise(async (resolve, reject) => {
            console.log('maybeUpdateAccount', newContactId, this.isPrimaryContact);
            if (this.isPrimaryContact) {
                let fields = {}
                fields[ACCOUNT_ID_FIELD.fieldApiName] = this.recordId;
                fields[PRIMARY_CONTACT_ID_FIELD.fieldApiName] = newContactId;
                const recordInput = { fields };
                console.log('recordInput', recordInput)
                updateRecord(recordInput).then(() => {
                    console.log("Account Updated");
                    resolve();
                })
                .catch((error) => {
                    this.error = error;
                    console.error("ACCOUNT NOT UPDATE", error);
                    reject(error);
                });
            } else {
                resolve();
            }
        });
    }
}