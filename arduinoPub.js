const mqtt = require("mqtt");

// Conecta al broker MQTT en la nube de HiveMQ con TLS
const client = mqtt.connect(
  "mqtt://aa6aebc1bcd64e19a125b232dfb27ad1.s1.eu.hivemq.cloud",
  {
    port: 8883,
    username: "felipe", // Asegúrate de usar tu nombre de usuario correcto
    password: "154254693Feli", // Asegúrate de usar tu contraseña correcta
    rejectUnauthorized: false, // Para evitar errores de certificado si usas el plan gratuito
  }
);

const topic = "arduino/data";
const simulatedData = {
  temperature: 25,
  humidity: 60,
};

client.on("connect", () => {
  console.log("Connected to cloud MQTT broker on HiveMQ.");

  setInterval(() => {
    const message = JSON.stringify(simulatedData);
    client.publish(topic, message, () => {
      console.log(`Data sent: ${message}`);
    });

    // Simulamos cambios en los datos
    simulatedData.temperature += Math.random() * 2 - 1;
    simulatedData.humidity += Math.random() * 2 - 1;
  }, 5000);
});

client.on("error", (error) => {
  console.error(`Error: ${error}`);
});
