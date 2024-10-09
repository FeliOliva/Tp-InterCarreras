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

let puntosVida = 70;
let waterAmount = 62;
let playAmount = 52;
let foodAmount = 42; // Inicial de comida
let personajeVivo = true;

const maxVida = 62;
const umbralHambre = 40;
const umbralSed = 60;
const umbralAburrimiento = 50;

client.on("connect", () => {
  console.log("Publicador de vida conectado al broker.");
  client.subscribe(necesidadesTopic, (err) => {
    if (!err) {
      console.log(`Suscrito al tópico ${necesidadesTopic}`);
    }
  });

  const vidaInterval = setInterval(() => {
    if (personajeVivo) {
      descontarVidaYSustancias();
    } else {
      clearInterval(vidaInterval);
    }
  }, 5000);
});

client.on("message", (topic, message) => {
  if (topic === necesidadesTopic && personajeVivo) {
    const {
      foodAmount: newFood,
      waterAmount: newWater,
      playAmount: newPlay,
    } = JSON.parse(message.toString());

    let incrementoVida = calcularIncremento(newFood, newWater, newPlay);
    puntosVida = Math.min(puntosVida + incrementoVida, maxVida);

    foodAmount = Math.min(foodAmount + newFood, 100);
    waterAmount = Math.min(waterAmount + newWater, 100);
    playAmount = Math.min(playAmount + newPlay, 100);

    verificarYPublicarEstado();
  }
});

function calcularIncremento(food, water, juego) {
  return food * 0.6 + water * 0.3 + juego * 0.1;
}

function descontarVidaYSustancias() {
  if (puntosVida > 0) {
    puntosVida--;
    foodAmount = Math.max(foodAmount - 1, 0);
    waterAmount = Math.max(waterAmount - 1, 0);
    playAmount = Math.max(playAmount - 1, 0);
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
  let mensaje = { puntosVida, waterAmount, playAmount, foodAmount };

  // Comprobar los estados de hambre y sed
  const hambre = foodAmount < umbralHambre;
  const sed = waterAmount < umbralSed;

  if (hambre && sed) {
    mensaje.mensaje = "El personaje tiene hambre y sed";
  } else if (hambre) {
    mensaje.mensaje = "El personaje tiene hambre";
  } else if (sed) {
    mensaje.mensaje = "El personaje tiene sed";
  } else if (playAmount < umbralAburrimiento) {
    mensaje.mensaje = "El personaje está aburrido";
  } else if (puntosVida === maxVida) {
    mensaje.mensaje = "El personaje está lleno *eructa";
  } else {
    mensaje.mensaje = "Estado normal";
  }

  client.publish(lifeTopic, JSON.stringify(mensaje));
  console.log(
    `Puntos de vida: ${puntosVida}, Sed: ${waterAmount}, Entretenimiento: ${playAmount}, Comida: ${foodAmount}`
  );
}

client.on("error", (error) => {
  console.error("Connection error: ", error);
});
