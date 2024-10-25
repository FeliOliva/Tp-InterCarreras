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
let estado;
client.on("message", (topic, message) => {
  const parsedMessage = JSON.parse(message.toString());
  switch (
    parsedMessage.estado // Usa parsedMessage.estado en el switch
  ) {
    case 1:
      estado = "El personaje tiene hambre";
      break;
    case 2:
      estado = "El personaje necesita agua";
      break;
    case 3:
      estado = "El personaje está aburrido";
      break;
    case 4:
      estado = "El personaje está sofocado por la temperatura";
      break;
    case 5:
      estado = "El personaje tiene sueño";
      break;
    case 6:
      estado = "El personaje está incómodo por la humedad";
      break;
    case 7:
      estado = "El personaje está lleno";
      break;
    case 8:
      estado = "El personaje ha muerto";
      break;
    case 9:
      estado = "El personaje ha revivido";
      break;
    case 0:
    default:
      estado = "Estado normal";
      break;
  }
  console.log("------------------------------------------");
  console.log(`Estado recibido: ${estado}`);
  console.log(`Puntos de Vida: ${parsedMessage.puntosVida}`);
  console.log(`Nivel de Sed: ${parsedMessage.waterAmount}`);
  console.log(`Nivel de Comida: ${parsedMessage.foodAmount}`);
  console.log(`Nivel de Felicidad: ${parsedMessage.happyAmount}`);
});

client.on("error", (error) => {
  console.error("Connection error: ", error);
});
