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
const necesidadesTopic = "necesidades";
const happyTopic = "happy";

let puntosVida = 100;
let waterAmount = 100;
let foodAmount = 100;
let happyAmount = 53;
let personajeVivo = true;

const maxVida = 100;
const umbralHambre = 40;
const umbralSed = 60;
const umbralFelicidad = 50;
// const umbralCalor = 24;
// const umbralSuenio =
client.on("connect", () => {
  console.log("Publicador de vida conectado al broker.");
  client.subscribe(necesidadesTopic, () =>
    console.log(`Suscrito al tópico ${necesidadesTopic}`)
  );
  client.subscribe(happyTopic, () =>
    console.log(`Suscrito al tópico ${happyTopic}`)
  );

  const vidaInterval = setInterval(() => {
    if (personajeVivo) {
      descontarVidaYSustancias();
    } else {
      clearInterval(vidaInterval);
    }
  }, 5000);
});

client.on("message", (topic, message) => {
  const parsedMessage = JSON.parse(message.toString());

  if (topic === necesidadesTopic && personajeVivo) {
    const { foodAmount: newFood, waterAmount: newWater } = parsedMessage;
    let incrementoVida = calcularIncremento(newFood, newWater);
    puntosVida = Math.min(puntosVida + incrementoVida, maxVida);

    foodAmount = Math.min(foodAmount + newFood, 100);
    waterAmount = Math.min(waterAmount + newWater, 100);

    verificarYPublicarEstado();
  }

  if (topic === happyTopic && personajeVivo) {
    const { happyValue } = parsedMessage;
    happyAmount = Math.min(happyAmount + happyValue, 100);
    verificarYPublicarEstado();
  }
});

function calcularIncremento(food, water) {
  return food * 0.6 + water * 0.3;
}

function descontarVidaYSustancias() {
  if (puntosVida > 0) {
    puntosVida--;
    foodAmount = Math.max(foodAmount - 1, 0);
    waterAmount = Math.max(waterAmount - 1, 0);
    happyAmount = Math.max(happyAmount - 1, 0);
    verificarYPublicarEstado();
  } else {
    personajeVivo = false;
    client.publish(
      lifeTopic,
      JSON.stringify({ mensaje: "El personaje ha muerto", puntosVida: 0 })
    );
  }
}

function verificarYPublicarEstado() {
  let mensaje = { puntosVida, waterAmount, foodAmount, happyAmount };

  const hambre = foodAmount < umbralHambre;
  const sed = waterAmount < umbralSed;
  const aburrido = happyAmount < umbralFelicidad;

  if (hambre && sed) {
    mensaje.mensaje = "El personaje tiene hambre y sed";
  } else if (hambre) {
    mensaje.mensaje = "El personaje tiene hambre";
  } else if (sed) {
    mensaje.mensaje = "El personaje tiene sed";
  } else if (aburrido) {
    mensaje.mensaje = "El personaje está aburrido";
  } else if (puntosVida === maxVida) {
    mensaje.mensaje = "El personaje está lleno *eructa";
  } else if (happyAmount > umbralFelicidad) {
    mensaje.mensaje = `El personaje está feliz con nivel de felicidad de ${happyAmount}`;
  } else {
    mensaje.mensaje = "Estado normal";
  }

  client.publish(lifeTopic, JSON.stringify(mensaje));
  console.log(
    `Puntos de vida: ${puntosVida}, Sed: ${waterAmount}, Comida: ${foodAmount}, Felicidad: ${happyAmount}`
  );
}

client.on("error", (error) => {
  console.error("Connection error: ", error);
});
