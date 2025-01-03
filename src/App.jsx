import React, { useState } from 'react';

function App() {
    const [text, setText] = useState('');
    const [phones, setPhones] = useState([{ carrier: '', phoneNumber: '', error: '' }]);
    const [response, setResponse] = useState('');

    const handleAddPhone = () => {
        setPhones([...phones, { carrier: '', phoneNumber: '', error: '' }]);
    };

    const handlePhoneChange = (index, field, value) => {
        const updatedPhones = [...phones];
        updatedPhones[index][field] = value;

        // Validación de número de teléfono (8 dígitos)
        const phoneRegex = /^[0-9]{8}$/;
        if (field === 'phoneNumber' && !phoneRegex.test(value)) {
            updatedPhones[index].error = "El número debe tener exactamente 8 dígitos.";
        } else {
            updatedPhones[index].error = ""; // Elimina el error si la validación es correcta
        }

        setPhones(updatedPhones);
    };

    const handleSubmit = async () => {
        if (!text || phones.some(phone => !phone.carrier || !phone.phoneNumber || phone.error)) {
            setResponse('Por favor, completa todos los campos correctamente antes de enviar.');
            return;
        }

        // Convertir los datos al formato esperado por el backend
        const formattedPhones = phones.map(phone => ({
            operator: phone.carrier.toUpperCase(),
            phone: phone.phoneNumber,
        }));

        const payload = {
            text,
            phone: formattedPhones,
        };

        try {
            const res = await fetch('http://localhost:3001/api/v1/format/text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const formattedText = await res.text();
                setResponse(formattedText.trim());
            } else {
                setResponse(`Hubo un error en el servidor. Código: ${res.status}`);
            }
        } catch (error) {
            console.error('Error al enviar:', error);
            setResponse('No se pudo conectar con el servidor.');
        }
    };

    // Función para copiar al portapapeles
    const copyToClipboard = async (text) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                alert("¡Respuesta copiada!");
            } catch (err) {
                console.error('Error al usar la API Clipboard:', err);
                fallbackCopyTextToClipboard(text);
            }
        } else {
            fallbackCopyTextToClipboard(text);
        }
    };

    // Método de reserva para copiar al portapapeles
    const fallbackCopyTextToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Evitar que el textarea afecte el diseño
        textArea.style.position = "fixed";
        textArea.style.top = "-9999px";
        textArea.style.left = "-9999px";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                alert("¡Respuesta copiada!");
            } else {
                alert("No se pudo copiar la respuesta.");
            }
        } catch (err) {
            console.error('Error al usar execCommand:', err);
            alert("No se pudo copiar la respuesta.");
        }

        document.body.removeChild(textArea);
    };

    return (
        <div className="relative flex min-h-screen flex-col bg-[#FFFFFF] overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
                <div className="px-40 flex flex-1 justify-center py-5">
                    <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 flex-1">
                        <h3 className="text-black tracking-light text-2xl font-bold px-4 text-center pb-2 pt-5">
                            Format your car listing
                        </h3>
                        <p className="text-black text-base font-normal py-5 px-4 text-justify">
                            Por favor, ingresa las características del vehículo:
                            Marca, modelo y año del vehículo (Ejemplo: TOYOTA HILUX SR 4x4 AÑO 2014).
                            Detalles destacados como: estado, accesorios, kilometraje, y extras.
                            Número de teléfono y su operadora (Tigo o Claro), indicando si tienen WhatsApp.
                        </p>

                        {/* Textarea para las características */}
                        <div className="flex max-w-[580px] flex-wrap items-end gap-4 px-5 py-3">
                            <label className="flex flex-col min-w-40 flex-1">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Make and model, year, trim"
                                    className="form-input w-full flex-1 resize-none rounded-xl border-[#E0E0E0] min-h-36 placeholder:text-neutral-500 p-[15px] text-base"
                                ></textarea>
                            </label>
                        </div>

                        {/* Campos dinámicos para los números de teléfono */}
                        <h3 className="text-black text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                            Phone Numbers
                        </h3>
                        {phones.map((phone, index) => (
                            <div key={index} className="flex max-w-[580px] flex-wrap items-end gap-4 px-5 py-3">
                                {/* Select de Carrier */}
                                <label className="flex flex-col min-w-40 flex-1">
                                    <select
                                        value={phone.carrier}
                                        onChange={(e) => handlePhoneChange(index, 'carrier', e.target.value)}
                                        className="form-input w-full flex-1 rounded-xl border-[#E0E0E0] placeholder:text-neutral-500 p-[15px] text-base"
                                    >
                                        <option value="" disabled>
                                            Selecciona tu carrier
                                        </option>
                                        <option value="TIGO">Tigo</option>
                                        <option value="CLARO">Claro</option>
                                    </select>
                                </label>

                                {/* Input de Phone Number */}
                                <label className="flex flex-col min-w-40 flex-1">
                                    <input
                                        value={phone.phoneNumber}
                                        onChange={(e) => handlePhoneChange(index, 'phoneNumber', e.target.value)}
                                        placeholder="Phone number"
                                        className={`form-input w-full flex-1 rounded-xl border ${
                                            phone.error ? 'border-red-500' : 'border-[#E0E0E0]'
                                        } placeholder:text-neutral-500 p-[15px] text-base`}
                                    />
                                    {phone.error && (
                                        <span className="text-red-500 text-sm mt-1">{phone.error}</span>
                                    )}
                                </label>
                            </div>
                        ))}

                        {/* Botón para agregar otro teléfono */}
                        <div className="flex px-4 py-3">
                            <button
                                onClick={handleAddPhone}
                                className="flex min-w-[84px] max-w-[480px] cursor-pointer justify-center rounded-xl h-10 px-4 bg-[#EEEEEE] text-black text-sm font-bold hover:bg-gray-300"
                            >
                                + Add Phone Number
                            </button>
                        </div>

                        {/* Botón de Submit */}
                        <div className="flex px-4 py-3 justify-end">
                            <button
                                onClick={handleSubmit}
                                className="flex items-center justify-center w-full max-w-[200px] h-12 rounded-lg bg-gradient-to-r from-red-500 to-red-700 text-white text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-300"
                            >
                                Submit
                            </button>
                        </div>

                        {/* Mensaje de respuesta */}
                        {response && (
                            <div className="relative px-4 py-3">
                                <h3 className="text-black text-lg font-bold pb-2">Response</h3>
                                <div className="relative">
                                    <pre
                                        className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap relative"
                                        id="responseText"
                                    >
                                        {response}
                                    </pre>
                                    <button
                                        onClick={() => copyToClipboard(response)}
                                        className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 bg-gray-300 rounded-full hover:bg-gray-400"
                                        aria-label="Copiar respuesta"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-gray-700"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                d="M8 4a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2H8zm6 10H8v-1h6v1zm0-2H8V9h6v3zm0-4H8V7h6v1zm-7 9V6a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2zm3-1H4a2 2 0 01-2-2V4a2 2 0 012-2h6a2 2 0 012 2v1H4v12h6v1z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
