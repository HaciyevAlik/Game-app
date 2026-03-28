import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyCXL5DA8d-EInb5rSpxO5T5ExFvU4QxudY",
    authDomain: "famhack26-214b3.firebaseapp.com",
    projectId: "famhack26-214b3",
    storageBucket: "famhack26-214b3.firebasestorage.app",
    messagingSenderId: "537945257235",
    appId: "1:537945257235:web:539ccca152f51d4c0f56e6",
    databaseURL: "https://famhack26-214b3-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);