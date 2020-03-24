<template>
  <div>
    <div class="overlay" v-if="summaryOverlay">
      <div class="info-box">
        <h3>Patients have been informed</h3>
        <h4>Positive: {{ positive }}</h4>
        <h4>Negative: {{ negative }}</h4>
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
    <div class="overlay" v-if="incorrect">
      <div class="info-box">
        <h3>The passwort you entered is incorrect</h3>
        <button class="primary-button" v-on:click="incorrect = !incorrect">OK</button>
      </div>
    </div>
    <header class="header">
      <img src="/logo.svg" alt="Insel Gruppe Logo" class="header-logo" >
      <a class="download-excel" href="/Import.xlsm" download>Download Excel</a>
    </header>
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
      <button class="clear-button" v-on:click="clear()"
        v-if="contacts.length !== 0 || failedContacts.length !== 0">Clear</button>
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

    <div class="sendContainer" v-if="contacts.length !== 0 || failedContacts.length !== 0">
      <div v-if="contacts.length !== 0">
        <h3>Password</h3>
        <input type="password" class="input" v-model="password" />
        <h3>Send Notifications ({{ contacts.length }})</h3>
        <button class="primary-button" v-on:click="alert">Send</button>
      </div>
      <export-excel class="download_button" v-if="failedContacts.length !== 0" :data="failedContacts"
        :fields="export_fields" name="ContactManually">
        Download Patients without Mobile Number or permission ({{ failedContacts.length }})
      </export-excel>
    </div>


  </div>


</template>

<script src="./Bot.js"></script>
<style src="./Bot.css" />