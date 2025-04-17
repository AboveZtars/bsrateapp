import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import "../google-services.json";

const googleServices = require("../google-services.json");
// Your Firebase configuration
const firebaseConfig = {
  apiKey: googleServices.client[0].api_key[0].current_key,
  // authDomain: "YOUR_AUTH_DOMAIN",
  projectId: googleServices.project_info.project_id,
  storageBucket: googleServices.project_info.storage_bucket,
  // messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: googleServices.client[0].client_info.mobilesdk_app_id,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const firestore = getFirestore("ratesve");

export {firestore};
