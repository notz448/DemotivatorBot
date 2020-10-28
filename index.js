const express = require("express");
const app = express();

const PORT = process.env.PORT;

app.post('/', (req, res) => {
    console.log(req.body);
    res.send("2f08e3bc");
});

app.get('/', (req, res) => {
   console.log(req.body);
   res.sendCode(200);
});

app.listen(PORT, err => {
    if(err) return console.log(err);
    console.log("Server starter on port", PORT);
});
