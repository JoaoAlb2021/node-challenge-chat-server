const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(express.json())

app.use(cors());

const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//This array is our "data store".
//We will start with one message in the array.
//Note: messages will be lost when Glitch restarts our server.

function getQuotesFromDatabase() {
  const text = fs.readFileSync("messages.json");
  return JSON.parse(text);
}

function saveQuotesToDatabase(arr) {
  return fs.writeFileSync("messages.json", JSON.stringify(arr,null,2));
}

app.get("/", function (request, response) {
  response.sendFile(__dirname + "/index.html");
});

app.get("/messages", function (request, response) {
  const messages = getQuotesFromDatabase()
  response.send(messages)
})

app.post("/messages", function (request, response) {
  const messages = getQuotesFromDatabase()
  const obj = request.body
  obj.id = messages.length
  if (obj.text.trim().length > 0 && obj.from.trim().length > 0){
    obj.text = obj.text.trim()
    obj.from = obj.from.trim()
    messages.push(obj)
    saveQuotesToDatabase(messages)
    response.send(obj)
  }
  else {
    response.send("400 Bad Request....Name and Message are invalid.")
  }

})

app.get('/messages/search', function(request,response) {
  const messages = getQuotesFromDatabase()
  const id = Number(request.query.id)
  const messageId = messages.find(obj => obj.id === id)
  response.send(messageId)
})

app.delete('/messages/delete/:id', function(request,response){
  let messages = getQuotesFromDatabase()
  const id = Number(request.params.id)
  const messageId = messages.find(obj => obj.id === id)
  messages = messages.filter(obj => obj.id !== id)
  saveQuotesToDatabase(messages)
  response.send(messageId)
})

const port = 3000
app.listen(port, () => {
   console.log("Listening on port: http://localhost:" + port);
  });
