const express = require("express");
const bodyParser = require("body-parser");
const axois = require("axios");
var amqp = require("amqplib");
const app = express();
app.use(bodyParser());

var rabbit_host = process.env.RABBIT_HOST;
var rabbit_port = process.env.RABBIT_PORT;
var rabbit_username = process.env.RABBIT_USERNAME;
var rabbit_password = process.env.RABBIT_PASSWORD;

var rabbit_ch;
(async () => {
  try {
    const conn = await amqp.connect(
      "amqp://" +
        rabbit_username +
        ":" +
        rabbit_password +
        "@" +
        rabbit_host +
        ":" +
        rabbit_port +
        "/"
    );
    const rabbit_ch = await conn.createChannel();
    const queueName = "test1";
    const msg = "ping " + new Date();
    await rabbit_ch.assertQueue(queueName, { durable: true });
    // Publish
    // Subscribe
    await rabbit_ch.consume(queueName, (msg) => {
      if (msg !== null) {
        console.log(process.pid, msg.content.toString("utf-8"));
        rabbit_ch.ack(msg);
      }
    });
    // await rabbit_ch.close();
    // await conn.close();
  } catch (error) {
    console.error(error);
  }
})();

app.get("/client2/test", (req, res) => {
  axois
    .post("http://client-srv:3000/api/test", { asdf: "asdf" })
    .then((response) => {
      res.send("asdf");
    });
  res.status(200).send("asdf");
});

app.listen(3001, () => {
  console.log("Listening on port 서버2???!");
});
