const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const PORT = process.env.PORT;

const parser = bodyParser.json();

const group_id = 199833573;

let confirmationCode = "";

app.post('/', parser, (req, res) => {
    if(req.body.type == 'confirmation' && req.body.group_id == group_id){
        res.send(confirmationCode);
    }else if(req.body.type == 'code'){
        confirmationCode = req.body.code;
    }else if(req.body.type == 'message_new'){
        handleMessage(req.body.object);
        res.send("ok");
    }
});

app.listen(PORT, err => {
    if(err) return console.log(err);
    console.log("Server starter on port", PORT);
});

function handleMessage(data){
    if(data.attachments){
        if(data.attachments.length == 1){
            if(data.attachments[0].type == 'photo'){
                console.log(data)
            }else{
                console.error("[3] Send only one photo");
            }
        }else{
            console.error("[2] Send only one photo");
        }
    }else{
        console.error("[1] Send only one photo");
    }
}
