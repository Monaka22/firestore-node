const functions = require("firebase-functions");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const formidable = require("formidable");
var multer  = require('multer');
var upload = multer()
const projectId = "my-project-e122f" //replace with your project id
const bucketName = `${projectId}.appspot.com`;
var admin = require("firebase-admin");

var serviceAccount = require("./service/ServiceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: bucketName
  });
let db = admin.firestore();
let storage = admin.storage();
var storageRef = storage.bucket();

app.use(require("cors")({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
app.post('/upload',async function (req,res) {
  try {
    const form = new formidable.IncomingForm();
     await form.parse(req, async (error, fields, files) => {
      var filename = files.image;
      //console.log(filename)
     await storageRef.upload(filename.path, {
        destination: `/image/${filename.name}`,
        public: true,
    },async function (err, file) {
        if (err) {
            console.log(err);
            return;
        }
        let picPath = await createPublicFileURL(`image/${filename.name}`);
        let data = {
          name: capitalize(fields.name),
          age: fields.age,
          band: fields.band,
          image: picPath
        };
        //console.log(data);
        await db
          .collection("idols")
          .add(data)
          .then(async function(docRef) {
           await res.status(200).json({ "Document written with ID: ": docRef.id });
           await res.end();
          })
          .catch(async function(error) {
          await res.json({ "Error adding document: ": error });
          });
    });
    });
  } catch (error) {
    res.json({ result: "notOk", message: JSON.stringify(error) });
  }
})
app.post('/profile', upload.single('image'), function (req, res, next) {
  var filename = req.file;
  console.log(filename.size)
  storageRef.upload(`/home/twin/Downloads/${filename.originalname}`, {
    destination: `/image/${req.file.originalname}`,
    public: true,
}, function (err, file) {
    if (err) {
        console.log(err);
        return;
    }
    console.log(createPublicFileURL(`image/${req.file.originalname}`));
});
})
app.get("/get", async function(req, res) {
  const data = [];
  await db
    .collection("idols")
    .orderBy("name")
    .get()
    .then(async snapshot => {
      snapshot.forEach(async doc => {
      await data.push(Object.assign({ id: doc.id }, doc.data()));
      });
      await res.status(200).json({
        draw: 0,
        recordsTotal: data.length,
        recordsFiltered: data.length,
        data: data
      });
      await res.end();
    })
    .catch(err => {
      console.log("Error getting documents", err);
    });
});
app.get("/getById/:id", async function(req, res) {
  const data = [];
  await db
    .collection("idols")
    .doc(req.params.id)
    .get()
    .then(async snapshot => {
      await data.push(Object.assign({ id: snapshot.id }, snapshot.data()));
      await res.status(200).json({
        draw: 0,
        recordsTotal: data.length,
        recordsFiltered: data.length,
        data: data
      });
      await res.end();
    })
    .catch(err => {
      console.log("Error getting documents", err);
    });
});
app.get("/get/:keyword", async function(req, res) {
  const data = [];
  if (req.params.keyword === "") {
    return res.redirect("/get");
  }
  let idolRef = await db.collection("idols");
  await idolRef
    .orderBy("name")
    .startAt(capitalize(req.params.keyword))
    .endAt(capitalize(req.params.keyword) + "\uf8ff")
    .get()
    //idolRef.where('name', '>=', req.params.keyword).where('name', '<=', req.params.keyword) .get()
    .then(async snapshot => {
      snapshot.forEach(async doc => {
      await data.push(Object.assign({ id: doc.id }, doc.data()));
      });
      await res.status(200).json({
        draw: 0,
        recordsTotal: data.length,
        recordsFiltered: data.length,
        data: data
      });
      await res.end();
    })
    .catch(err => {
      console.log("Error getting documents", err);
    });
});
app.post("/add", async function(req, res) {
  let data = {
    name: capitalize(req.body.name),
    age: req.body.age,
    band: req.body.band
  };
  console.log(data);
  await db
    .collection("idols")
    .add(data)
    .then(async function(docRef) {
    await  res.status(200).json({ "Document written with ID: ": docRef.id });
    await  res.end();
    })
    .catch(function(error) {
      res.json({ "Error adding document: ": error });
    });
});
app.put("/update", async function(req, res) {
  let data = {
    name: capitalize(req.body.name),
    age: req.body.age,
    band: req.body.band
  };
  await db
    .collection("idols")
    .doc(req.body.id)
    .set(data)
    .then(async function() {
      await res.status(200).json({ "mesagess: ": "update complete" });
      await res.end();    
    }).catch(function(error) {
      res.json({ "Error update document: ": error });
    });
});
app.delete("/delete", async function(req, res) {
  await db
    .collection("idols")
    .doc(req.body.id)
    .delete()
    .then(async function() {
      await res.status(200).json({ "mesagess: ": "delete complete" });
      await res.end();  
    }).catch(function(error) {
      res.json({ "Error delete document: ": error });
    });
});

function createPublicFileURL(storageName) {
  return `http://storage.googleapis.com/${bucketName}/${encodeURIComponent(storageName)}`;
}

app.listen(1337, function() {
  console.log("backend run port 1337");
});

exports.app = functions.https.onRequest(app);
