const keyFilename = require("./service/ServiceAccountKey.json");
const projectId = "my-project-e122f" //replace with your project id
const bucketName = `${projectId}.appspot.com`;
var {Storage}  = require('@google-cloud/storage');
var admin = require("firebase-admin");

var serviceAccount = require("./service/ServiceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "my-project-e122f.appspot.com"
  });
let db = admin.firestore();
let storage = admin.storage();
var storageRef = storage.bucket();

storageRef.upload("./service/mnk.jpeg", {
    destination: '/image/image2.jpg',
    public: true,
}, function (err, file) {
    if (err) {
        console.log(err);
        return;
    }
    console.log(createPublicFileURL('image2.jpg'));
});

function createPublicFileURL(storageName) {
    return `http://storage.googleapis.com/${bucketName}/${encodeURIComponent(storageName)}`;

}
//var bucket = admin.storage().bucket();
