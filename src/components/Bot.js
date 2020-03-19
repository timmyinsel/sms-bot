import {
    XlsxRead,
    XlsxJson
} from "../../node_modules/vue-xlsx/"


var request = require('request');

export default {
    components: {
        XlsxRead,
        XlsxJson
    },
    data() {
        return {
            contacts: [],
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
            this.file = null;
            document.getElementById("fileUpload").value = "";
            this.password = "";
        },
        hideOverlay() { //hide final overlay 
            this.overlay = false;
            this.contacts = [];
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
            for (var i = 0; i < data.length; i++) {
                this.contacts.push({
                    name: data[i].Name,
                    number: data[i].Nummer,
                    result: data[i].Resultat
                })
            }
        },
        alert() { //show overlay yes or 
            if (this.password === "12345") {
                this.notification = true;
            } else {
                this.correct = true;
            }
        },
        sendNotification() { //send sms
            this.notification = false;
            var xmlhttp = new XMLHttpRequest();
            this.contacts.forEach(element => {
                if (element.number !== undefined) {
                    if (element.result === 'p') {
                        xmlhttp.open("GET", "https://url.ecall.ch/Api/Sms?Address=" + element.number + "&Message=" + this.messagePos + "&Username=timmy&Password=" + this.password, true);
                        xmlhttp.send();
                        this.positive = this.positive + 1;
                    } else if (element.result === 'n') {
                        xmlhttp.open("GET", "https://url.ecall.ch/Api/Sms?Address=" + element.number + "&Message=" + this.messageNeg + "&Username=timmy&Password=" + this.password, true);
                        xmlhttp.send();
                        this.negative = this.negative + 1;
                    }
                } else {
                    this.noNumber = this.noNumber + 1;
                    console.log(element.name)
                }
            });
            this.overlay = true;
            this.password = "";
        },
        pushSMS() {
            var options = {
                url: 'https://api.swisscom.com/messaging/bulksms/',
                method: 'POST',
                headers: {
                    'client_id': 'LHu01wTOMaVzuqLA7SIfMYGAA1BEzn16',
                    'Content-Type': 'application/json',
                    'SCS-Version': '2',
                    'SCS-Request-ID': 'd9ddfbec-811e-4d98-b4a3-a9333ac2e0ab'
                },
            }
            fetch(options.url, options)
            .then(data=>{return data})
            .then(res=>{console.log(res)})
            .catch(error=>{console.log(error)});
        },
        statusSMS() {
            var options = {
                mode:'no-cors',
                url: 'https://api.swisscom.com/messaging/bulksms/d9ddfbec-811e-4d98-b4a3-a9333ac2e0ab',
                method: 'GET',
                headers: {
                    'client_id': 'LHu01wTOMaVzuqLA7SIfMYGAA1BEzn16',
                    'Content-Type': 'application/json',
                    'SCS-Version': '2',
                },
            };

            fetch(options.url, options)
            .then(data=>{return data.json()})
            .then(res=>{console.log(res)})
            .catch(error=>{console.log(error)});
        },
        dataSMS() {
            var options = {
                url: 'https://api.swisscom.com/messaging/bulksms/d9ddfbec-811e-4d98-b4a3-a9333ac2e0ab/datasets',
                method: 'POST',
                headers: {
                    'client_id': 'LHu01wTOMaVzuqLA7SIfMYGAA1BEzn16',
                    'Content-Type': 'application/json',
                    'SCS-Version': '2',
                },
                json: {
                    "name": "Resultate",
                    "template": "Wir senden ihnen folgendes Resultat: ${result}",
                    "recipients": [{
                        "to": "+41793079509",
                        "placeholders": [{
                            "key": "result",
                            "value": "blau"
                        }]
                    }]
                }
            };

            request(options, function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                console.log('body:', body); // Print the HTML for the Google homepage.

            }); 
        },
        sendSMS() {
            var options = {
                url: 'https://api.swisscom.com/messaging/bulksms/d9ddfbec-811e-4d98-b4a3-a9333ac2e0ab',
                method: 'POST',
                headers: {
                    'client_id': 'LHu01wTOMaVzuqLA7SIfMYGAA1BEzn16',
                    'Content-Type': 'application/json',
                    'SCS-Version': '2',
                },
                json: {
                    "status": "PROGRESS"
                }
            };

            request(options, function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                console.log('body:', body); // Print the HTML for the Google homepage.

            });
            this.statusSMS();
        },
    }
}