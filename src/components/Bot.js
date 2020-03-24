import {
    XlsxRead,
    XlsxJson
} from "../../node_modules/vue-xlsx/"
import Vue from 'vue'
import excel from 'vue-excel-export'
Vue.use(excel)

export default {
    components: {
        XlsxRead,
        XlsxJson,
        excel
    },
    data() {
        return {
            contacts: [],
            failedContacts: [],
            export_fields: {
                'Name': 'name',
                'Result': 'result',
                'Mobile': 'mobile',
                'Erlaubnis': 'status',
            },
            file: null,
            password: "",

            //overlays
            summaryOverlay: false,
            notification: false,
            incorrect: false,

            //messages
            messageNeg: "Guten Tag, Ihr Abstrich auf COVID-19 ist negativ. Bitte halten Sie die BAG-Anweisung «Selbstisolation bei Fieber und Husten» auf http://bit.ly/nocoronabag ein.",

            messagePos: "Guten Tag, Ihr Abstrich auf COVID-19 ist positiv. Bitte halten Sie sich an die BAG-Anweisung «Wenn Sie mit dem neuen Coronavirus infiziert sind und zu Hause isoliert werden» auf http://bit.ly/coronainsel\
            Sollte sich Ihr Zustand verschlechtern und z.B. Atemnot auftreten, so melden Sie sich telefonisch bei nächsten Notfallstation. Tragen Sie eine Maske, wenn Sie Ihr Zuhause verlassen.",

            //counters
            positive: 0,
            negative: 0,
        }
    },
    methods: {
        computedClass(result) { //change background when positive
            if (result === 'p') {
                let positiveClass = 'positiveClass';
                return positiveClass;
            }
        },
        clear() { //clear all patients
            this.contacts = [];
            this.failedContacts = [];
            this.file = null;
            document.getElementById("fileUpload").value = "";
            this.password = "";
        },
        hideOverlay() { //hide final overlay 
            this.summaryOverlay = false;
            this.contacts = [];
            this.failedContacts = [];
            this.file = event.target.files ? event.target.files[0] : null;
            this.positive = 0,
                this.negative = 0
        },
        removeItem(index) { //remove single patient
            this.contacts.splice(index, 1);
        },
        onChange(event) { //add document
            this.file = event.target.files ? event.target.files[0] : null;
        },
        getData(data) { //get data from document and store to contacts array
            var expression1 = /^\+\d\d[ ][7][\d ]{8,12}$/;
            var expression2 = /^\d\d[0-9]{7,10}$/;
            for (var i = 0; i < data.length; i++) {
                //check if permission granted
                if (data[i].Erlaubnis === 'E' && data[i].Resultat !== undefined || data[i].Erlaubnis === 'P' && data[i].Resultat !== undefined) {
                    //check if phone number is valid
                    if (expression1.test(data[i].Mobile) || expression2.test(data[i].Mobile)) {
                        this.contacts.push({
                            name: data[i].Name + " " + data[i].Vorname,
                            result: data[i].Resultat,
                            mobile: data[i].Mobile,
                            status: data[i].Erlaubnis,
                        })
                    } else {
                        this.failedContacts.push({
                            name: data[i].Name + " " + data[i].Vorname,
                            result: data[i].Resultat,
                            mobile: data[i].Mobile,
                            status: data[i].Erlaubnis,
                        })
                    }
                } else {
                    this.failedContacts.push({
                        name: data[i].Name + " " + data[i].Vorname,
                        result: data[i].Resultat,
                        mobile: data[i].Mobile,
                        status: data[i].Erlaubnis,
                    })
                }
            }
        },
        alert() { //show overlay if passwort is correct
            if (this.password === "12345") {
                this.notification = true;
            } else {
                this.incorrect = true;
            }
        },
        async sendNotification() { //send sms
            this.notification = false;
            this.contacts.forEach(element => {
                if (element.result === 'p') { //positive retults
                    let xmlhttp = new XMLHttpRequest();
                    xmlhttp.open("GET", "https://url.ecall.ch/Api/Sms?Address=" + element.mobile + "&Message=" + this.messagePos + "&Username=timmy&Password=" + this.password, true);
                    xmlhttp.send();
                    console.log(element.name)
                    this.positive = this.positive + 1;
                } else if (element.result === 'n') { //negative retults
                    let xmlhttp = new XMLHttpRequest();
                    xmlhttp.open("GET", "https://url.ecall.ch/Api/Sms?Address=" + element.mobile + "&Message=" + this.messageNeg + "&Username=timmy&Password=" + this.password, true);
                    xmlhttp.send();
                    console.log(element.name)
                    this.negative = this.negative + 1;
                }
            });
            this.summaryOverlay = true;
            this.password = "";
            this.failedContacts = [];
        },
    }
}