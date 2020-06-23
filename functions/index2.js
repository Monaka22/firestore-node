const projectId = "my-project-e122f" //replace with your project id
const bucketName = `${projectId}.appspot.com`;
const admin = require("firebase-admin");

const serviceAccount = require("./service/ServiceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: bucketName
  });
let db = admin.firestore();
let storage = admin.storage();
let storageRef = storage.bucket();

storageRef.upload("./service/mnk.jpeg", { //file upload
    destination: '/image/image2.jpg', // new file name
    public: true,
}, function (err, file) {
    if (err) {
        console.log(err);
        return;
    }
    console.log(createPublicFileURL('image2.jpg')); // สร้างลิงค์ให้ไฟล์
});

function createPublicFileURL(storageName) {
    return `http://storage.googleapis.com/${bucketName}/${encodeURIComponent(storageName)}`;
}
//var bucket = admin.storage().bucket();
