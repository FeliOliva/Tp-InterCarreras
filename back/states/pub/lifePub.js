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
const dataTopic = "data";

let puntosVida = 100;
let waterAmount = 100;
let foodAmount = 100;
let happyAmount = 53;
let temperature;
let humidity;
let light;
let personajeVivo = true;

const maxVida = 100;
const umbralHambre = 40;
const umbralSed = 60;
const umbralFelicidad = 50;
const umbralCalor = 24;
const umbralSuenio = 300;
const umbralHumedad = 80;

client.on("connect", () => {
  console.log("Publicador de vida conectado al broker.");
  client.subscribe(necesidadesTopic, () =>
    console.log(`Suscrito al tópico ${necesidadesTopic}`)
  );
  client.subscribe(happyTopic, () =>
    console.log(`Suscrito al tópico ${happyTopic}`)
  );
  client.subscribe(dataTopic, () =>
    console.log(`Suscrito al tópico ${dataTopic}`)
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

  if (topic === dataTopic && personajeVivo) {
    ({ humidity, light, temperature } = parsedMessage);
    humidity = Math.min(humidity, 100);
    light = Math.min(light, 100);
    temperature = Math.min(temperature, 100);
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
  let mensaje = { puntosVida, waterAmount, foodAmount, happyAmount, temperature, humidity, light };

  const hambre = foodAmount < umbralHambre;
  const sed = waterAmount < umbralSed;
  const aburrido = happyAmount < umbralFelicidad;
  const calor = temperature > umbralCalor;  // Si la temperatura es mayor al umbral
  const suenio = light < umbralSuenio;      // Si la luz es menor al umbral
  const humedadAlta = humidity > umbralHumedad;

  // Publicar siempre los datos de temperatura, luz y humedad
  client.publish(
    lifeTopic,
    JSON.stringify({
      mensaje: `El personaje tiene una temperatura de ${temperature}°C, iluminación de ${light} lux, y una humedad de ${humidity}%`,
      puntosVida,
      waterAmount,
      foodAmount,
      happyAmount,
      temperature,
      humidity,
      light
    })
  );

  // Publicar mensajes condicionales (sin else if, para que no se pisen)
  if (hambre) {
    client.publish(lifeTopic, JSON.stringify({ mensaje: "El personaje tiene hambre urgente." }));
  }
  if (sed) {
    client.publish(lifeTopic, JSON.stringify({ mensaje: "El personaje necesita agua inmediatamente." }));
  }
  if (aburrido) {
    client.publish(lifeTopic, JSON.stringify({ mensaje: "El personaje está aburrido y desmotivado." }));
  }

  // Publicar mensajes de calor, sueño y humedad independientemente
  if (calor) {
    client.publish(lifeTopic, JSON.stringify({ mensaje: `El personaje está sofocado por una temperatura de ${temperature}°C.` }));
  }
  if (suenio) {
    client.publish(lifeTopic, JSON.stringify({ mensaje: `El personaje tiene sueño debido a la baja iluminación (${light} lux).` }));
  }
  if (humedadAlta) {
    client.publish(lifeTopic, JSON.stringify({ mensaje: `El personaje está incómodo por la humedad alta (${humidity}%).` }));
  }

  // Imprimir el estado general en consola
  console.log(
    `Puntos de vida: ${puntosVida}, Sed: ${waterAmount}, Comida: ${foodAmount}, Felicidad: ${happyAmount}`
  );
}


client.on("error", (error) => {
  console.error("Connection error: ", error);
});
