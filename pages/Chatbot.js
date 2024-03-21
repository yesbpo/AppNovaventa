import React, { useState } from 'react';
//  agregar estilos de tailwind
import 'tailwindcss/tailwind.css';

const ChatbotConfig = () => {
    const [botName, setBotName] = useState('');
    const [botGreeting, setBotGreeting] = useState('');
    const [conditionalMessages, setConditionalMessages] = useState([]);

    const handleBotNameChange = (e) => {
        setBotName(e.target.value);
    };

    const handleBotGreetingChange = (e) => {
        setBotGreeting(e.target.value);
    };

    const handleAddConditionalMessage = () => {
        setConditionalMessages([...conditionalMessages, { condition: '', message: '' }]);
    };

    const handleConditionalMessageChange = (index, field, value) => {
        const updatedMessages = [...conditionalMessages];
        updatedMessages[index][field] = value;
        setConditionalMessages(updatedMessages);
    };

    const handleSaveConfig = () => {
        console.log('Bot Name:', botName);
        console.log('Bot Greeting:', botGreeting);
        console.log('Conditional Messages:', conditionalMessages);
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Configuración del Bot de Chat</h2>
            <label className="block mb-2">
                Nombre del Bot:
                <input type="text" value={botName} onChange={handleBotNameChange} className="border border-gray-300 rounded p-2" />
            </label>
            <br />
            <label className="block mb-2">
                Mensaje de Bienvenida:
                <input type="text" value={botGreeting} onChange={handleBotGreetingChange} className="border border-gray-300 rounded p-2" />
            </label>
            <br />
            <h3 className="text-lg font-bold mb-2">Condiciones y Mensajes</h3>
            {conditionalMessages.map((message, index) => (
                <div key={index} className="mb-4">
                    <label className="block mb-2">
                        Condición:
                        <input
                            type="text"
                            value={message.condition}
                            onChange={(e) => handleConditionalMessageChange(index, 'condition', e.target.value)}
                            className="border border-gray-300 rounded p-2"
                        />
                    </label>
                    <br />
                    <label className="block mb-2">
                        Mensaje:
                        <input
                            type="text"
                            value={message.message}
                            onChange={(e) => handleConditionalMessageChange(index, 'message', e.target.value)}
                            className="border border-gray-300 rounded p-2"
                        />
                    </label>
                    <br />
                </div>
            ))}
            <button onClick={handleAddConditionalMessage} className="bg-blue-500 text-white py-2 px-4 rounded">Agregar Condición y Mensaje</button>
            <br />
            <button onClick={handleSaveConfig} className="bg-green-500 text-white py-2 px-4 rounded mt-4">Guardar Configuración</button>
        </div>
    );
};

export default ChatbotConfig;