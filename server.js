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

/////////////Read all messages/////////////////////
app.get("/messages", function (request, response) {
  const messages = getQuotesFromDatabase()
  response.send(messages)
})

/////////////Create a new message///////////////////
app.post("/messages", function (request, response) {
  const messages = getQuotesFromDatabase()
  const obj = request.body
  obj.id = messages.length
  if (obj.text.trim().length > 0 && obj.from.trim().length > 0){
    obj.text = obj.text.trim()
    obj.from = obj.from.trim()
    obj.timeSent = new Date() /////////Add a timestamp (levl 4)/////
    messages.push(obj)
    saveQuotesToDatabase(messages)
    response.send(obj)
  }
  else {
    response
      .status(400)
      .send("Name and Message are invalid.")
  }

})

////////////Search a message by id/////////////////////////////////
app.get("/messages/search_by_id/:id", function (request, response){
  const id = Number(request.params.id)
  const messages = getQuotesFromDatabase()
  const messageId = messages.find(obj => obj.id === id)
  response.send(messageId)
})

///////////Delete a message by id/////////////////////////////
app.delete('/messages/delete/:id', function(request,response){
  let messages = getQuotesFromDatabase()
  const id = Number(request.params.id)
  const messageId = messages.find(obj => obj.id === id)
  messages = messages.filter(obj => obj.id !== id)
  saveQuotesToDatabase(messages)
  response.send(messageId)
})


//////////////Search by text query//////////////////////////////
app.get('/messages/search_by_text', function(request,response) {
  const messages = getQuotesFromDatabase()
  const text = request.query.text.toLowerCase()
  newJson = []
  
  messages.map((obj)=> {
    if(obj.text.toLowerCase().includes(text) === true || obj.from.toLowerCase().includes(text)) {
      newJson.push(obj)
      return(newJson)
    }
  })
  response.send(newJson)
})

////////////Show the most recent 10 messages///////////
app.get('/messages/latest', function(request,response){
  const messages = getQuotesFromDatabase()
  const lengthOfMessages = messages.length
  const latestMessage = 10
  newJson = []

  for (let i = lengthOfMessages - latestMessage; i < lengthOfMessages; i++) {
    newJson.push(messages[i])
  }
  response.send(newJson)

})



const port = 3000
app.listen(port, () => {
   console.log("Listening on port: http://localhost:" + port);
  });