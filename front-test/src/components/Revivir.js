import React, { useState } from 'react';
import axios from 'axios';

const Revivir = () => {
    const [loading, setLoading] = useState(false);

    const revivirPersonaje = async () => {


        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3004/revivir/publish', {
                vida: 100, // Convertir a número
            });

            alert(`Personaje revivido con 100 puntos de vida.`);
            console.log(response.data);
        } catch (error) {
            console.error("Error al revivir al personaje:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Revivir Personaje</h2>
            <button
                type="primary"
                onClick={revivirPersonaje}
            >
                Revivir
            </button>
        </div>
    );
};

export default Revivir;
