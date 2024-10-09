// Cargar variables de entorno desde el archivo .env
require("dotenv").config();

const mqtt = require("mqtt");

const usuario = process.env.USUARIO;
const password = process.env.PASSWORD;
const host = process.env.HOST;

const client = mqtt.connect({
  host: host,
  port: 8883,
  protocol: "mqtts",
  username: usuario,
  password: password,
  rejectUnauthorized: false,
});

const lifeTopic = "life";

client.on("connect", () => {
  console.log("Suscriptor de vida conectado al broker.");
  client.subscribe(lifeTopic, () => {
    console.log(`Suscrito al tópico ${lifeTopic}`);
  });
});

client.on("message", (topic, message) => {
  const parsedMessage = JSON.parse(message.toString());

  if (parsedMessage.mensaje) {
    console.log(parsedMessage.mensaje);
  } else {
    console.log(`Puntos de vida actualizados: ${parsedMessage.puntosVida}`);
  }
});

client.on("error", (error) => {
  console.error("Connection error: ", error);
});
