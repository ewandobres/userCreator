import * as admin from "firebase-admin";
const functions = require('firebase-functions');
const app = admin.initializeApp();
import SquareConnect = require('square-connect');
import UserRecord = admin.auth.UserRecord;
const defaultClient = SquareConnect.ApiClient.instance;

const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = "EAAAEGHqnSltURHr2q_mAb_beZoBIc3iyteekRCAFWU7PfDh0Qz1mqV-HL-nJl32";

const crypto = require('crypto');

defaultClient.basePath = "https://connect.squareupsandbox.com";


exports.userCreator = functions.region('europe-west2').auth.user().onCreate((user:UserRecord) => {
    async function createSquareUser(){
        const email = user.email
        const userId = user.uid

        if(email !== null && email !== undefined){

            const customerDetails = {
                "idempotency_key": crypto.randomBytes(12).toString('hex'),
                "email_address": email,
                "reference_id":userId
            }

            const customersApi = new SquareConnect.CustomersApi();
            const response = await customersApi.createCustomer(customerDetails)

            if(response === undefined || response.customer === undefined){
                console.log("Error in square response, recieved undefined")
            }else{
                await app.firestore().collection("Users").doc(userId).set({"square_id": response.customer.id},{merge:true})
            }
        return "success"
        }else{
            console.log("Email undefined")
            return null;
        }
    }

    return(createSquareUser())

})




