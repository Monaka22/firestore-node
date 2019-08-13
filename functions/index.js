const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const serviceAccount = require("./service/ServiceAccountKey.json");

app.use(require("cors")({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "my-project-e122f.appspot.com"
});
let db = admin.firestore();

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
app.get("/get", async function(req, res) {
  const data = [];
  await db
    .collection("idols")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        data.push(Object.assign({ id: doc.id }, doc.data()));
      });
      return res.json({
        draw: 0,
        recordsTotal: data.length,
        recordsFiltered: data.length,
        data: data
      });
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
    .then(snapshot => {
      data.push(Object.assign({ id: snapshot.id }, snapshot.data()));
      return res.json({
        draw: 0,
        recordsTotal: data.length,
        recordsFiltered: data.length,
        data: data
      });
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
  let idolRef = db.collection("idols");
  await idolRef
    .orderBy("name")
    .startAt(capitalize(req.params.keyword))
    .endAt(capitalize(req.params.keyword) + "\uf8ff")
    .get()
    //idolRef.where('name', '>=', req.params.keyword).where('name', '<=', req.params.keyword) .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        data.push(Object.assign({ id: doc.id }, doc.data()));
      });
      return res.json({
        draw: 0,
        recordsTotal: data.length,
        recordsFiltered: data.length,
        data: data
      });
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
    .then(function(docRef) {
      res.json({ "Document written with ID: ": docRef.id });
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
    .then(function() {
      res.json({ "mesagess: ": "update complete" });
    })
    .catch(function(error) {
      res.json({ "Error update document: ": error });
    });
});
app.delete("/delete", async function(req, res) {
  await db
    .collection("idols")
    .doc(req.body.id)
    .delete()
    .then(function() {
      res.json({ "mesagess: ": "delete complete" });
    })
    .catch(function(error) {
      res.json({ "Error delete document: ": error });
    });
});

app.listen(1337, function() {
  console.log("backend run port 8085");
});

exports.app = functions.https.onRequest(app);
