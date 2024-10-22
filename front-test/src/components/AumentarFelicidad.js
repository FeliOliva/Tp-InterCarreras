import React from 'react';
import axios from 'axios';

const AumentarFelicidad = () => {
    const aumentarFelicidad = async () => {
        try {
            const response = await axios.post('http://localhost:3003/happy/publish', {
                happyValue: 20,
            });
            console.log('Respuesta del servidor:', response.data);
            alert('¡La felicidad ha sido aumentada con éxito!');
        } catch (error) {
            console.error('Error al aumentar la felicidad:', error);
            alert('Hubo un error al intentar aumentar la felicidad.');
        }
    };

    return (
        <div>
            <h2>Aumentar Felicidad</h2>
            <button onClick={aumentarFelicidad}>
                Aumentar Felicidad en 20 puntos
            </button>
        </div>
    );
};

export default AumentarFelicidad;
