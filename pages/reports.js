import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Layout from '../components/Layout';
import { useSession, signIn } from 'next-auth/react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
function Reports() {
  const { data: session } = useSession();
  const [informes, setInformes] = useState([]);
  const [campaign, setCampaign] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  const [tipoMensajes, setTipoMensajes] = useState('');
  const [datos, setDatos] = useState([]);
  const fetchData = async () => {
    try {
      // Construir la URL con los parámetros necesarios
      let url = `${process.env.NEXT_PUBLIC_BASE_DB}/generar-informe`;
  
      // Agregar el parámetro de campaña si está definido
      if (campaign) {
        url += `?campaign=${campaign}`;
      } else {
        // Si la campaña no está especificada, agregar parámetros de fecha directamente
        url += `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
        console.log('URL de la solicitud:', url);
      }
  
      // Realizar la solicitud GET al servidor
      const response = await fetch(url);
  
      // El resto del código sigue igual...
      if (response.ok) {
        // Obtener la respuesta en formato JSON
        const data = await response.json();
        // Actualizar el estado con los informes obtenidos
        setInformes(data.informes);
  
        // Generar el informe Excel después de haber recibido los datos
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data.informes);
  
        // Agregar la hoja al libro
        XLSX.utils.book_append_sheet(wb, ws, 'Informes');
  
        // Descargar el archivo Excel
        XLSX.writeFile(wb, 'informes.xlsx');
      } else {
        console.error('Error al obtener informes:', response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };
  
  
  const generarReporte = async () => {
    try {
      if (!fechaInicio || !fechaFin) {
        console.error('Por favor, selecciona fechas de inicio y fin.');
        return;
      }
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_DB}/obtener-mensajes-por-fecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
  
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
      }
  
      const mensajes = await response.json();
  
      let mensajesFiltrados = [];
  
      if (tipoMensajes == 'entrantes') {
        mensajesFiltrados = mensajes.mensajes.filter((mensaje) => mensaje.type_comunication == 'message');
      } else if (tipoMensajes == 'salientes') {
        mensajesFiltrados = mensajes.mensajes.filter((mensaje) => mensaje.type_comunication == 'message-event');
      } else {
        mensajesFiltrados = mensajes.mensajes;
      }
  
      if (mensajesFiltrados.length > 0) {
        const datosFiltrados = mensajesFiltrados.map((mensaje) => ({
          fecha: mensaje.timestamp,
          mensaje: mensaje.content,
          destinatario: mensaje.number,
          tipo: mensaje.type_message,
          tipocomunicacion: mensaje.type_comunication,
          estado: mensaje.status,
          idMensaje: mensaje.idMessage,
        }));
  
        const ws = XLSX.utils.json_to_sheet(datosFiltrados);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
  
        XLSX.writeFile(wb, 'resportewhatsapp.xlsx');
      } else {
        console.log('No se encontraron mensajes en el rango de fechas y tipo especificados.');
      }
    } catch (error) {
      console.error('Error al generar el reporte:', error);
    }
  };
  const ObtenerConversaciones = async () => {
    try {
      // Realizar la solicitud a la API utilizando fetch
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_DB}/obtener-conversaciones-fecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);

      // Verificar si la solicitud fue exitosa
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      // Parsear la respuesta a JSON
      const data = await response.json();
      const { conversaciones } = data
  
      // Crear un libro de Excel
      
        // Crear un nuevo libro de Excel
        const workbook = XLSX.utils.book_new();

        // Crear una nueva hoja de Excel
        const sheet = XLSX.utils.aoa_to_sheet([
          ['id', 'idchat', 'asesor', 'conversacion', 'numero', 'calificacion', 'fecha_ingreso', 'fecha_ultimagestion', 'userid']
        ]);

        let rowIndex = 2; // Iniciar desde la segunda fila (1-indexed)

        // Iterar sobre los datos para procesar el campo 'conversacion'
        conversaciones.forEach((item) => {
          // Dividir el campo 'conversacion' por el símbolo '['
          const conversacionArray = item.conversacion.split('[');

          // Iterar sobre los mensajes en la conversación
          for (let i = 0; i < conversacionArray.length; i++) {
            // Añadir los campos específicos y el texto para cada mensaje
            XLSX.utils.sheet_add_aoa(sheet, [
              [
                item.id,
                item.idchat,
                item.asesor,
                conversacionArray[i].trim(), // Texto del mensaje
                item.numero,
                item.calificacion,
                item.fecha_ingreso,
                item.fecha_ultimagestion,
                item.userid
              ]
            ], { origin: `A${rowIndex}` });

            rowIndex++;
          }
        });

        // Añadir la hoja al libro
        XLSX.utils.book_append_sheet(workbook, sheet, 'Hoja1');

        // Guardar el libro como un archivo Excel (descargar el archivo)
        XLSX.writeFile(workbook, 'informe.xlsx');
        console.log('Informe Excel generado y descargado correctamente.');

      // Actualizar el estado con las conversaciones obtenidas
      
    } catch (error) {
      console.error('Error al obtener conversaciones:', error.message);
    }

  };
  const [fecha, setFecha] = useState(''); // Asigna el valor deseado
  const [idchat, setIdchat] = useState(''); // Asigna el valor deseado
  const [userid, setUserid] = useState(''); // Asigna el valor deseado
  const [conversacion, setConversacion] = useState('');
  const [mensaje, setMensaje] = useState('');
 
  const consultarConversacion = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_DB}/consultar-conversacion?fecha=${fecha}&idchat=${idchat}&userid=${userid}`
      );

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }

      const data = await response.json();

      if (data.conversacion) {
        setConversacion(data.conversacion);
        setMensaje('');
      } else {
        setConversacion('');
        setMensaje(data.mensaje || 'No se encontró ninguna conversación con los parámetros proporcionados.');
      }
    } catch (error) {
      console.error('Error al consultar la conversación:', error);
      setConversacion('');
      setMensaje('Error al consultar la conversación. Consulta la consola para obtener más detalles.');
    }
  };

  const descargarPDF = () => {
    if (!fecha || !idchat || !userid || !conversacion) {
      console.error('Datos incompletos para generar el PDF.');
      return;
    }
  
    try {
      const documentDefinition = {
        content: [
          { text: `Fecha: ${fecha}`, margin: [20, 20] },
          { text: `ID Chat: ${idchat}`, margin: [20, 10] },
          { text: `User ID: ${userid}`, margin: [20, 10] },
          { text: 'Conversación:', margin: [20, 10] },
          { text: conversacion, margin: [20, 10] },
        ],
      };
  
      pdfMake.createPdf(documentDefinition).download('informe_conversacion.pdf');
    } catch (error) {
      console.error('Error al generar el PDF:', error);
    }
  };
  
  return (
    <>
      {session ? (
        <Layout>
          <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-black p-8 bg-opacity-80">
            <div className='w-full'>
              <h1 className="text-3xl font-bold mb-3 text-center">
                Reportes Mensajeria WhatsApp
              </h1>
              <div className='mb-8'>
              <div className='flex flex-wrap gap-4'>
                <div className='w-full md:w-1/2'>  
                  <label className="block mb-2">Fecha de Inicio:</label>
                    <input
                      type="datetime-local"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="border rounded p-2 ml-2 w-full"
                    />
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block mb-2">Fecha de Fin: </label>
                    <input
                      type="datetime-local"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="border rounded p-2 ml-2 w-full"
                    />
                </div>
                <div className='w-full md:w-1/2'>
                  <label className="block mb-2">
                    Tipo de Mensajes:
                    <select
                      value={tipoMensajes}
                      onChange={(e) => setTipoMensajes(e.target.value)}
                      className="border rounded p-2 ml-2"
                    >
                      <option value="ambos">Todos</option>
                      <option value="entrantes">Entrantes</option>
                      <option value="salientes">Salientes</option>
                    </select>
                  </label>
                  <button
                    onClick={generarReporte}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Generar reporte de mensajeria
                  </button>
                </div>
              </div>
              </div>
              <div className='mb-8'> 
                <h1 className="text-3xl font-bold mb-3 text-center">
                  Reportes de campañas
                </h1>
                <div className='flex flex-wrap gap-4'>
                  <div className='w-full md:w-1/3'>
                    <label className='block mb-2'>Campaña:</label>
                    <input 
                      type="text" 
                      value={campaign} 
                      onChange={(e) => setCampaign(e.target.value)}
                      className="border rounded p-2 ml-2 w-full"  
                    />
                  </div>
                  <div className="w-full md:w-1/3">
                    <div className="flex flex-col">
                      <label className='block mb-2'>Fecha de inicio:</label>
                      <input 
                        type="datetime-local" 
                        value={fechaInicio} 
                        onChange={(e) => setFechaInicio(e.target.value)} 
                        className='border rounded p-2 ml-2 mb-4'
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className='block mb-2'>Fecha de fin:</label>
                      <input 
                        type="datetime-local" 
                        value={fechaFin} 
                        onChange={(e) => setFechaFin(e.target.value)} 
                        className='border rounded p-2 ml-2'
                      />
                    </div>
                  </div>
                  <div className='w-full md:w-1/3 flex justify-center items-end'>
                    <button 
                      onClick={fetchData} 
                      className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded'
                    >
                    Generar reporte de envios masivos
                    </button>
                  </div>
                </div>
              </div>

              <div className='mb-8'>
                <h1 className="text-4xl font-bold mb-4 text-center">Reportes de conversaciones</h1>
                <div className='flex flex-wrap gap-4'>
                  <div className='w-full md:w-1/2'>
                    <label className='block mb-2'>Fecha de inicio:</label>
                    <input 
                      type="datetime-local" 
                      value={fechaInicio} 
                      onChange={(e) => setFechaInicio(e.target.value)} 
                      className='border rounded p-2 ml-2'
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className='block mb-2'>Fecha de finalización:</label>
                    <input 
                      type="datetime-local" 
                      value={fechaFin} 
                      onChange={(e) => setFechaFin(e.target.value)} 
                      className='border rounded p-2 ml-2 w-full'
                    />
                  </div>
                  <div className='w-full flex justify-center items-end'>
                  <button 
                    onClick={ObtenerConversaciones} 
                    className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                  >
                  Obtener Conversaciones
                  </button>
                </div>
              </div>
          
              {/*<h2 className=''>Consulta de Conversación</h2>
          <p>Fecha: <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></p>
          <p>ID Chat: <input type="text" value={idchat} onChange={(e) => setIdchat(e.target.value)} /></p>
          <p>User ID: <input type="text" value={userid} onChange={(e) => setUserid(e.target.value)} /></p>
          <button onClick={consultarConversacion}>Consultar Conversación</button>
          <button onClick={descargarPDF}>Descargar PDF</button>
          <div>
            <h3>Resultado:</h3>
            {conversacion && <pre>{conversacion}</pre>}
            {mensaje && <p>{mensaje}</p>}
          </div>*/}
            </div>
          </div>
          </div>
           {/* Formulario para ingresar los parámetros */}
        </Layout>
      ) : (
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="mb-4">Not signed in</p>
          <button
            onClick={() => signIn()}
            className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded"
          >
            Sign in
          </button>
        </div>
      )}
    </>
  );
}

export default Reports;
