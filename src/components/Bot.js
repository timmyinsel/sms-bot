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
                'Number': 'number',
                'Result': 'result',
            },
            file: null,
            password: "",

            //overlays
            overlay: false,
            notification: false,
            correct: false,

            //messages
            messageNeg: "Guten Tag, Ihr Abstrich auf COVID-19 ist negativ. Bitte halten Sie sich an die BAG-Anweisung «Selbstisolation bei Fieber und Husten» auf http://bit.ly/nocoronabag",

            messagePos: "Guten Tag, Ihr Abstrich auf COVID-19 ist positiv. Bitte halten Sie sich an die BAG-Anweisung «Wenn Sie mit dem neuen Coronavirus infiziert sind und zu Hause isoliert werden» auf http://bit.ly/coronainsel\
            Sollte sich Ihr Zustand verschlechtern und z.B. Atemnot auftreten, so melden Sie sich telefonisch bei nächsten Notfallstation. Tragen Sie eine Maske, wenn Sie Ihr Zuhause verlassen.",

            //counters
            positive: 0,
            negative: 0,
            noNumber: 0
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
            this.overlay = false;
            this.contacts = [];
            this.failedContacts = [];
            this.file = event.target.files ? event.target.files[0] : null;
            this.positive = 0,
                this.negative = 0,
                this.noNumber = 0
        },
        removeItem(index) { //remove single patient
            this.contacts.splice(index, 1);
        },
        onChange(event) { //add document
            this.file = event.target.files ? event.target.files[0] : null;
        },
        getData(data) { //get data from document and store to contacts array
            /*eslint no-useless-escape: "error"*/
            var expression1 = /^\+\d\d[ ][7][\d ]{8,12}$/;
            var expression2 = /^\d\d[0-9]{7,10}$/;
            for (var i = 0; i < data.length; i++) {
                if (expression1.test(data[i].Nummer) || expression2.test(data[i].Nummer)) {
                    this.contacts.push({
                        name: data[i].Name,
                        result: data[i].Resultat,
                        number: data[i].Nummer,
                    })
                } else {
                    this.failedContacts.push({
                        name: data[i].Name,
                        result: data[i].Resultat,
                        number: data[i].Nummer,
                    })
                }
            }
        },
        alert() { //show overlay yes or 
            if (this.password === "12345") {
                this.notification = true;
            } else {
                this.correct = true;
            }
        },
        async sendNotification() { //send sms
            this.notification = false;
            this.contacts.forEach(element => {
                if (element.number !== undefined) {
                    if (element.result === 'p') {
                        let xmlhttp = new XMLHttpRequest();
                        xmlhttp.open("GET", "https://url.ecall.ch/Api/Sms?Address=" + element.number + "&Message=" + this.messagePos + "&Username=timmy&Password=" + this.password, true);
                        xmlhttp.send();
                        console.log(element.name)
                        this.positive = this.positive + 1;
                    } else if (element.result === 'n') {
                        let xmlhttp = new XMLHttpRequest();
                        xmlhttp.open("GET", "https://url.ecall.ch/Api/Sms?Address=" + element.number + "&Message=" + this.messageNeg + "&Username=timmy&Password=" + this.password, true);
                        xmlhttp.send();
                        console.log(element.name)
                        this.negative = this.negative + 1;
                    }
                } else {
                    this.noNumber = this.noNumber + 1;
                    console.log(element.name)
                }
            });
            this.overlay = true;
            this.password = "";
            this.failedContacts = [];
        },
    }
}