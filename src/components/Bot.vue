<template>
  <div>
    <div class="overlay" v-if="overlay">
      <div class="info-box">
        <h3>All patients have been informed</h3>
        <h4>Positive: {{ positive }}</h4>
        <h4>Negative: {{ negative }}</h4>
        <h4>Not contacted: {{ noNumber }}</h4>
        <button class="secondary-button" v-on:click="hideOverlay">OK</button>
      </div>
    </div>
    <div class="overlay" v-if="notification">
      <div class="info-box">
        <h3>Do you really want to send the notifications?</h3>
        <button class="primary-button" v-on:click="notification = !notification">NO</button>
        <button class="secondary-button" v-on:click="sendNotification">YES</button>
      </div>
    </div>
    <div class="overlay" v-if="correct">
      <div class="info-box">
        <h3>The passwort you entered is incorrect</h3>
        <button class="primary-button" v-on:click="correct = !correct">OK</button>
      </div>
    </div>
    <div class="importContainer">
      <h3>Import Patient information</h3>
      <input id="fileUpload" class="input" type="file" @change="onChange" />
      <xlsx-read :file="file">
        <xlsx-json>
          <template #default="{collection}">
            <button class="secondary-button" v-if="file !== null" v-on:click="getData(collection)">Get Patients</button>
          </template>
        </xlsx-json>
      </xlsx-read>
      <!-- <button v-on:click="pushSMS">push</button>
      <button v-on:click="statusSMS">status</button>
      <button v-on:click="dataSMS">add</button>
      <button v-on:click="sendSMS">send</button> -->
      <button class="clear-button" v-on:click="clear()" v-if="contacts.length !== 0">Clear</button>
    </div>

    <div class="patientContainer">
      <ul>
        <li class="patient" v-for="(contact, index) in contacts" :key="index"
          v-bind:class="computedClass(contact.result)">
          <span>{{ contact.name }}</span>
          <button v-on:click="removeItem(index)">delete</button>
        </li>
      </ul>
    </div>

    <div class="sendContainer" v-if="contacts.length !== 0">
      <h3>Password</h3>
      <input type="password" class="input" v-model="password" />
      <h3>Send Notifications ({{ contacts.length }})</h3>
      <button class="primary-button" v-on:click="alert">Send</button>
      <export-excel class="download_button" :data="failedContacts" :fields="export_fields" name="NoMobileNumber">
      Download Patients without Mobile Number ({{ failedContacts.length }})
    </export-excel>
    </div>
    

  </div>


</template>

<script src="./Bot.js"></script>
<style src="./Bot.css" />