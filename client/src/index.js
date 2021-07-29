const express = require("express");
const bodyParser = require("body-parser");
var amqp = require("amqplib");

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
    rabbit_ch = await conn.createChannel();
    const queueName = "test1";

    await rabbit_ch.assertQueue(queueName, { durable: true });
    // Publish

    //pub sub 구조
    await rabbit_ch.assertExchange("testPubSub", "fanout", {
      durable: true,
    });
    await rabbit_ch.assertQueue("testPubSub.requests", { durable: true });
    await rabbit_ch.assertQueue("testPubSub.results", { durable: true });

    // bind queues
    await rabbit_ch.bindQueue("testPubSub.requests", "testPubSub", "request");
    await rabbit_ch.bindQueue("testPubSub.results", "testPubSub", "result");

    // Subscribe
    // await rabbit_ch.consume(queueName, (msg) => {
    //   if (msg !== null) {
    //     //oopsEmitter.emit("event", msg.content.toString());
    //     rabbit_ch.ack(msg);
    //   }
    // });
    // await rabbit_ch.close();
    // await conn.close();
    // await rabbit_ch.consume(queueName, (msg) => {
    //   //ㅇㅣ렇게 되면 라운드로빈 형식   pub sub?? 가능한가욤ㅁ.ㅇ,ㄹ
    //   if (msg !== null) {
    //     console.log(msg.content.toString("utf-8"));
    //     rabbit_ch.ack(msg);
    //   }
    // });
  } catch (error) {
    console.error(error);
  }
})();

const app = express();
app.use(bodyParser());

// queue 하나만 전파가능  ---이거다 메세징 다 팟 으로 나눠짐 ㅋ

app.get("/api/test", async (req, res) => {
  const msg = "ping " + new Date();
  const queueName = "test1";
  //console.log(rabbit_ch);
  await rabbit_ch.sendToQueue(queueName, Buffer.from(msg, "utf8"));
  console.log("[x] Sent %s", msg);
  res.send("아년앗ㅁㄴㅇ리");
});

// ------- exchange pub sub moudle
app.get("/api/testexchange", async (req, res) => {
  const msg = "ping " + new Date();
  const exchangeName = "testPubSub";
  //console.log(rabbit_ch);
  await rabbit_ch.publish(exchangeName, "", Buffer.from(msg, "utf8"));
  console.log("[x] Sent %s", msg);
  res.send("아년앗ㅁㄴㅇ리");
});

app.post("/api/test", (req, res) => {
  console.log(req.body);
  res.status(200);
});
app.listen(3000, () => {
  console.log(process.env.RABBIT_HOST);
  console.log("서버 1");
});
