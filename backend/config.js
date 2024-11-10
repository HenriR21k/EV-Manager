'use strict';
import { config } from 'dotenv';
import assert from 'assert';

config();

const {
    PORT,
    HOST,
    HOST_URL,
    API_KEY,
    AUTH_DOMAIN,
    PROJECT_ID,
    STORAGE_BUCKET,
    MESSAGING_SENDER_ID,
    measurementId,
    APP_ID
} = process.env;

assert(PORT, 'PORT is required');
assert(HOST, 'HOST is required');

export const port = PORT;
export const host = HOST;
export const url = HOST_URL;
export const firebaseConfig = {
    apiKey: API_KEY,
    authDomain: AUTH_DOMAIN,
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
    messagingSenderId: MESSAGING_SENDER_ID,
    measurementId: measurementId,
    appId: APP_ID
};