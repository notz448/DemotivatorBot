const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const VK = require('vk-io').VK;
const Canvas = require('canvas');
const fetch = require('node-fetch');
const request = require("request");

const fs = require('fs')

const PORT = process.env.PORT || 3000;

const parser = bodyParser.json();

const group_id = 199833573;
let confirmationCode = process.env.confirmationCode;
let access_token = process.env.access_token;

let vk = new VK({
    token: access_token
});

app.post('/', parser, (req, res) => {
    if(req.body.type == 'confirmation' && req.body.group_id == group_id)
        res.send(confirmationCode);
    /*else if(req.body.type == 'code'){
        confirmationCode = req.body.code;
        access_token = req.body.access_token;
        vk = new VK({
            token: access_token
        });*/
    else if(req.body.type == 'message_new')
        handleMessage(req.body.object);
    res.send("ok");
});

app.listen(PORT, err => {
    if(err) return console.log(err);
    console.log("Server starter on port", PORT);
});

function separateTextByWidth(text, width, ctx){
    let words = text.split(" ");
    let lines = [];
    let prevLine = words[0] + " ";
    let currLine = "";
    for(let w = 0; w < words.length; w++){
        currLine += words[w] + " ";
        if(ctx.measureText(currLine.slice(0, -1)).width > width){
            lines.push(prevLine.slice(0, -1));
            currLine = "";
            if(w > 0) w--;
            if(w == words.length - 1) break;
        }
        if(w == words.length - 1) lines.push(currLine.slice(0, -1));
        prevLine = currLine;
    }
    return lines.join("\n");
}

function handleMessage(data){
    if(data.attachments){
        if(data.attachments.length == 1){
            if(data.attachments[0].type == 'photo'){
                let maxSize = 0;
                for(let key in data.attachments[0].photo){
                    if(key.includes('photo_')){
                        maxSize = Math.max(maxSize, parseInt(key.slice(6)));
                    }
                }

                let message = data.body.split("\n");

                fetch(data.attachments[0].photo['photo_' + maxSize]).then(res => res.buffer()).then(buffer => {
                    Canvas.loadImage(buffer).then(im => {
                        let header = message[0] || "Заголовок";
                        let text = message[1] || "Текст";

                        let semi_ewidth = 76;
                        let semi_eheight = 45;

                        let canvas = Canvas.createCanvas(im.width, im.height);
                        let new_im = canvas.getContext('2d');

                        new_im.font = "54pt Times New Roman";
                        let measureHeader = new_im.measureText(header);
                        if(measureHeader.width > im.width){
                            header = separateTextByWidth(header, im.width, new_im);
                            measureHeader = new_im.measureText(header);
                        }
                        let headerHeight = measureHeader.actualBoundingBoxDescent;
                        let headerSpace = measureHeader.actualBoundingBoxAscent / 2;

                        new_im.font = "19pt Arial";
                        let measureText = new_im.measureText(text);
                        if(measureText.width > im.width){
                            text = separateTextByWidth(text, im.width, new_im);
                            measureText = new_im.measureText(text);
                        }
                        let textHeight = measureText.actualBoundingBoxDescent;
                        let textSpace = measureText.actualBoundingBoxAscent / 2;

                        let extra_width = semi_ewidth * 2;
                        let extra_heigth = semi_eheight + 157 + headerHeight + textHeight;
                        
                        canvas = Canvas.createCanvas(im.width + extra_width, im.height + extra_heigth);
                        new_im = canvas.getContext('2d');
                        new_im.drawImage(im, semi_ewidth, semi_eheight);
                        
                        new_im.fillStyle = 'white';
                        new_im.fillRect(69, 38, im.width + 14, 3);
                        new_im.fillRect(69, 41, 3, im.height + 11);
                        new_im.fillRect(im.width + semi_ewidth + 4, 41, 3, im.height + 11);
                        new_im.fillRect(72, im.height + semi_eheight + 4, im.width + 8, 3);
                        
                        new_im.textAlign = 'center';
                        
                        new_im.font = "54pt Times New Roman";
                        let linesHeader = header.split("\n");
                        for(let i = 0; i < linesHeader.length; i++)
                            new_im.fillText(linesHeader[i], (im.width + extra_width) / 2, im.height + semi_eheight + 9 + 71 + i * (54 + headerSpace));

                        new_im.font = "19pt Arial";
                        let linesText = text.split("\n");
                        for(let i = 0; i < linesText.length; i++)
                            new_im.fillText(linesText[i], (im.width + extra_width) / 2, im.height + semi_eheight + 9 + 71 + 44 + headerHeight + i * (19 + textSpace));
                        
                        vk.api.photos.getMessagesUploadServer({peer_id: 0, access_token: access_token}).then(v => {
                            let r = request.post(v.upload_url, (err, res, b) => {
                                if (err) return console.error('upload failed:', err);
                                let photo_data = JSON.parse(b);
                                vk.api.photos.saveMessagesPhoto({
                                    photo: photo_data.photo,
                                    hash: photo_data.hash,
                                    server: photo_data.server,
                                    access_token: access_token
                                }).then(val => {
                                    vk.api.messages.send({
                                        access_token: access_token,
                                        user_id: data.user_id,
                                        attachment: 'photo' + val[0].owner_id + '_' + val[0].id + '_' + val[0].access_key,
                                        random_id: 0
                                    });
                                });
                            });
                            let form = r.form();
                            form.append('file', canvas.toBuffer('image/jpeg'), {filename: "photo.jpg"});
                        });
                    });
                });
            }else{
                vk.api.messages.send({
                    user_id: data.user_id,
                    message: "Прикрепите только фото",
                    random_id: 0
                });
                console.error("Attach type is not a photo");
            }
        }else{
            vk.api.messages.send({
                user_id: data.user_id,
                message: "Прикрепите только одно фото",
                random_id: 0
            });
            console.error("Attach only one photo");
        }
    }else{
        vk.api.messages.send({
            user_id: data.user_id,
            message: "Прикрепите фото",
            random_id: 0
        });
        console.error("Attach a photo");
    }
    vk.api.messages.markAsRead({
        mark_conversation_as_read: 1,
        peer_id: data.user_id
    });
}
