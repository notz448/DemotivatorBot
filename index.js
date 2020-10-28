const express = require("express");
const app = express();

const PORT = process.env.PORT;

app.post('/', (req, res) => {
    console.log(req);
});

app.listen(PORT, err => {
    if(err) return console.log(err);
    console.log("Server starter on port", PORT);
});
