import admin from "firebase-admin";

const encodedServiceAccount = process.env.FIREBASE_SERVICE_JSON;

if (!encodedServiceAccount) {
    throw new Error("Missing FIREBASE_SERVICE_JSON in server/.env");
}

const serviceAccount = JSON.parse(
    Buffer.from(encodedServiceAccount, "base64").toString("utf8")
);

if (!serviceAccount.project_id) {
    throw new Error("Invalid service account: missing project_id");
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export const firestore = admin.firestore();
export default admin;