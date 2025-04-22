/* global importScripts, firebase */
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

const firebaseConfig = {
    apiKey: "AIzaSyBh5GBI9psfjgRHb6bQOhTRlMwAZsSv0so",
    authDomain: "project1-cf1de.firebaseapp.com",
    projectId: "project1-cf1de",
    storageBucket: "project1-cf1de.firebasestorage.app",
    messagingSenderId: "552644576672",
    appId: "1:552644576672:web:b81c133aa37b4f2fc450c5",
    measurementId: "G-3SRM99KDFL",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});