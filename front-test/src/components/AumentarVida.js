import React from 'react';
import axios from 'axios';

const AumentarVida = () => {
    const enviarNecesidades = (foodAmount, waterAmount) => {
        axios
            .post('http://localhost:3002/necesidades/publish', {
                foodAmount,
                waterAmount,
            })
            .then((response) => {
                console.log('Respuesta del servidor:', response.data);
                alert('Datos enviados con éxito');
            })
            .catch((error) => {
                console.error('Error al enviar los datos:', error);
                alert('Hubo un error al enviar los datos');
            });
    };

    return (
        <div>
            <h1>Aumentar Vida del Personaje</h1>
            <button onClick={() => enviarNecesidades(30, 30)}>Enviar 30 de comida y agua</button>
            <button onClick={() => enviarNecesidades(50, 20)}>Enviar 50 de comida y 20 de agua</button>
        </div>
    );
};

export default AumentarVida;
