import React, { useState, useEffect } from 'react';
import Layout from "../components/Layout";
import styled from "styled-components";
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useRouter } from 'next/router';
const contarRepeticionesPatron = (str) => {
  const patron = /\{\{\d+\}\}/g;
  const contar = str.match(patron);
  return contar ? contar.length : 0;
};

const Sends = (props) => {
  const router = useRouter();
  const [titleCampaign, setTitleCampaign] = useState('')
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedTemplateData, setSelectedTemplateData] = useState("");
  const [selectedTemplateType, setSelectedTemplateType] = useState("");
  const [selectvar, setSelectvar] = useState('Seleccionar columna');
  const [sheetname, setSheetname] = useState([]);
  const [filename, setFilename] = useState([]);
  const [showFileContent, setShowFileContent] = useState(false);
  const [variableCount, setVariableCount] = useState(0);
  const [variableValues, setVariableValues] = useState({});
  const [variableColumnMapping, setVariableColumnMapping] = useState({});
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [customParams, setCustomParams] = useState({});
  const [selectedImageUrl, setSelectedImageUrl] = useState(""); // Agrega esta línea
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState("");

  const base = process.env.NEXT_PUBLIC_BASE_URL

  const handleDocumentFileChange = async (e) => {
    const file = e.target.files[0];
    setFilename(file.name);
  
    // Cargar el archivo y obtener la URL
    const formData = new FormData();
    formData.append('archivo', file);
  
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_API+'/subir-archivo', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
      }
  
      const responseData = await response.json();
  
      if (responseData.url) {
        alert(`El archivo se cargó correctamente. URL: ${responseData.url}`);
        // Set the obtained video URL in the state
        setSelectedDocumentUrl(responseData.url);
      } else {
        throw new Error('No se recibió una URL del servidor.');
      }
    } catch (error) {
      console.error('Error al cargar el video:', error);
    }
  };


  const handleVideoFileChange = async (e) => {
    const file = e.target.files[0];
    setFilename(file.name);
  
    // Cargar el video y obtener la URL
    const formData = new FormData();
    formData.append('archivo', file);
  
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_API+'/subir-archivo', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
      }
  
      const responseData = await response.json();
  
      if (responseData.url) {
        alert(`El archivo se cargó correctamente. URL: ${responseData.url}`);
        // Set the obtained video URL in the state
        setSelectedVideoUrl(responseData.url);
      } else {
        throw new Error('No se recibió una URL del servidor.');
      }
    } catch (error) {
      console.error('Error al cargar el video:', error);
    }
  };
  
  
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    setFilename(file.name);

    // Cargar la imagen a Imgbb y obtener la URL
    const imgbbApiKey = 'e31e20927215f7f1aa0598b395ff6261';
    const imgbbUploadUrl = 'https://api.imgbb.com/1/upload';

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(imgbbUploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          key: imgbbApiKey,
        },
      });

      const imageUrl = response.data.data.url;
      setSelectedImageUrl(imageUrl);
    } catch (error) {
      console.error('Error al cargar la imagen:', error);
    }
  };

  const handleVariableColumnChange = (variable, column) => {
    setVariableColumnMapping((prevMapping) => ({
      ...prevMapping,
      [variable]: column,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl2 = process.env.NEXT_PUBLIC_BASE_API + '/api/templates';
        const response = await fetch(apiUrl2);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        const approvedTemplates = data.filter(template => template.status === 'APPROVED');
        const sortedTemplates = approvedTemplates.sort((a, b) => a.elementName.localeCompare(b.elementName));

        setTemplates(sortedTemplates);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  const getTemplateType = (templateType) => {
    switch (templateType) {
      case 'TEXT':
        return 'Texto';
      case 'IMAGE':
        return 'Imagen';
      case 'VIDEO':
        return 'Video';
      case 'DOCUMENT':
        return 'Documento';
      default:
        return templateType;
    }
  };

  const handleTemplateChange = (event) => {
    const selectedTemplateName = event.target.value;
    setSelectedTemplate(selectedTemplateName);

    const selectedTemplateObject = templates.find(template => template.elementName === selectedTemplateName);

    if (selectedTemplateObject) {
      setSelectedTemplateData(selectedTemplateObject.data);
      const count = contarRepeticionesPatron(selectedTemplateObject.data);
      setVariableCount(count);
      setVariableValues({});
      // Set the selected template type
      const type = getTemplateType(selectedTemplateObject.templateType);
      setSelectedTemplateType(type);

      // Set the selected template ID
      setSelectedTemplateId(selectedTemplateObject.id);
      console.log('Selected Template Type:', getTemplateType(selectedTemplateObject.templateType));
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    setFilename(file.name);
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw_data = XLSX.utils.sheet_to_row_object_array(worksheet);
    setSheetname(raw_data);
    setSelectvar('');
  };

  function asignarDestino(e) {
    setSelectvar(e.target.value);
  }

  const handleVariableChange = (variable, value) => {
    setVariableValues((prevValues) => ({
      ...prevValues,
      [variable]: value,
    }));
  };

  const handleCustomParamChange = (index, value) => {
    setCustomParams((prevParams) => ({
      ...prevParams,
      [index]: value,
    }));
  
    // Actualizar variableValues con el nuevo valor
    setVariableValues((prevValues) => ({
      ...prevValues,
      [index]: value,
    }));
  };


  const enviar = () => {
    if (sheetname.length === 0) {
      console.log('No hay datos masivos.');
      alert('No hay ningún archivo cargado.');
      return;
    }
  
    if (!selectedTemplate) {
      console.log('Selecciona una plantilla.');
      alert('Selecciona una plantilla.');
      return;
    }
  
    if (!selectvar) {
      console.log('Elige la columna que contiene el numero destino.');
      alert('Elige la columna que contiene el numero destino.');
      return;
    }

    if (Object.keys(variableColumnMapping).length !== variableCount) {
      console.log('Faltan variables seleccionadas.');
      alert('Faltan variables seleccionadas.');
      return;
    }

    if (sheetname.length > 0) {
      sheetname.forEach( async (dest, rowIndex) => {
        const destinationNumber = String(dest[selectvar]);
        const formattedDestination = destinationNumber.startsWith("57") ? destinationNumber : `57${destinationNumber}`;

        // Personalizar customParams con datos de la columna seleccionada
      const updatedCustomParams = {};
      Object.keys(variableColumnMapping).forEach((variable) => {
        const columnIndex = variableColumnMapping[variable];
        const columnValue = dest[columnIndex];
        updatedCustomParams[variable] = columnValue;
      });

      setCustomParams(updatedCustomParams);

        const url = process.env.NEXT_PUBLIC_URL_GUPSHUP;
        const apiKey = process.env.NEXT_PUBLIC_APIKEY;
        var messageWithVariables = replaceVariables(selectedTemplateData, variableValues);
        console.log(messageWithVariables)
        // Reemplazar las variables con los valores de la columna seleccionada
        Object.keys(variableColumnMapping).forEach((variable) => {
          const columnIndex = variableColumnMapping[variable];
          const columnValue = dest[columnIndex];
          const variableValue = customParams[variable] !== undefined ? customParams[variable] : columnValue;
          messageWithVariables = messageWithVariables.replace(`{{${variable}}}`, variableValue);
        });
        
        const data = {
          channel: 'whatsapp',
          source: process.env.NEXT_PUBLIC_CELLPHONE,
          'src.name': process.env.NEXT_PUBLIC_NAMEAPP,
          destination: formattedDestination,
          template: JSON.stringify({
            id: selectedTemplateId ? selectedTemplateId : '',
            params: Object.values(updatedCustomParams),
          }),
          channel: 'whatsapp',
          disablePreview: true,
        };
        
        // Tipo de plantilla seleccionada
      switch (selectedTemplateType) {
        case 'Texto':
          data.message = messageWithVariables;
          break;
        case 'Imagen':
          data.message = JSON.stringify({
            type: 'image',
            image: {
              link: selectedImageUrl,
            },
          });
          break;
        case 'Video':
          data.message = JSON.stringify({
            type: 'video',
            video: {
              link: base + selectedVideoUrl,
            },
          });
          break;
        case 'Documento':
          data.message = JSON.stringify({
            type: 'document',
            document: {
              link: base + selectedDocumentUrl,
            },
          });
          break;
        default:
          console.warn('Tipo de plantilla no reconocido:', selectedTemplateType);
          return;
      }
      console.log(messageWithVariables)
        const headers = {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded',
          'apikey': apiKey,
        };

        const formData = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, value);
        });
        
        try {
          const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: headers,
          });
          
          if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.statusText);
            
          }
          
          
          const responseData = await response.json();
          console.log('Respuesta del servidor:', responseData);
          const fechaActual = new Date();
          const options = { timeZone: 'America/Bogota', hour12: false };
          const anio = fechaActual.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
          const mes = fechaActual.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
          const dia = fechaActual.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
          const hora = fechaActual.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
          const minutos = fechaActual.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
          const segundos = fechaActual.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });
          // guardar mensaje
          
          const datos = {
            content: messageWithVariables,
            type_comunication: 'message-event',
            status: 'sent',
            number: data.destination,
            timestamp: `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`,
            type_message: 'text',
            idMessage: responseData.messageId,
          };
        
          try {
            const response = await fetch( process.env.NEXT_PUBLIC_BASE_DB+'/guardar-mensajes', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                // Otros encabezados si es necesario
              },
              body: JSON.stringify(datos), // Convierte los datos a formato JSON
            });
        
            if (!response.ok) {
              throw new Error(`Error en la solicitud: ${response.statusText}`);
            }
        
            const data = await response.json(); // Parsea la respuesta como JSON
            
            // Puedes realizar acciones adicionales con la respuesta aquí
          } catch (error) {
            console.error('Error al realizar la solicitud:', error);
            // Manejo de errores
          }

          // guardar template
          const datosdenetrada = {
              idmessageTemplate: responseData.messageId,
              status: 'sent',
              attachments: data.destination,
              message: messageWithVariables,
              timestamp:`${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`,
              campaign: titleCampaign
              };
              try {
                console.log(titleCampaign)
                const responseguardar = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/insertar-datos-template', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    // Otros encabezados si es necesario
                  },
                  body: JSON.stringify(datosdenetrada), // Convierte los datos a formato JSON
                });
            
                if (!responseguardar.ok) {
                  throw new Error(`Error en la solicitud: ${response.statusText}`);
                }
            
                const data1 = await responseguardar.json(); // Parsea la respuesta como JSON
                console.log('Respuesta del servidor:', data1);
                // Puedes realizar acciones adicionales con la respuesta aquí
              } catch (error) {
                console.error('Error al realizar la solicitud:', error);
                // Manejo de errores
              }
        } catch (error) {
          console.error('Error al realizar la solicitud:', error);
        }
      });
      
    } else {
      console.log('No hay datos masivos.');
    }
    setSelectvar('')
            setSelectedTemplate('')
    alert('Envio exitoso de mensajes')
  };

  const handleShowContent = () => {
    if (sheetname.length === 0) {
      alert('No hay ningún archivo cargado.');
    } else {
      setShowFileContent(true);
    }
  };
  const onClose = () => {
    setShowFileContent(false);
  }

  // Función para reemplazar las variables en la plantilla con los valores proporcionados
  const replaceVariables = (template, values) => {
    let replacedTemplate = template;

    // Reemplazar las variables en orden
    Object.keys(values).forEach(variable => {
      const variablePattern = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
      replacedTemplate = replacedTemplate.replace(variablePattern, values[variable]);
    });

    return replacedTemplate;
  };
  function signin() {
    router.push('/auth/login');
    }

    if (localStorage.getItem('token')) {
   
  return (
    <Layout>
      <Box>
        <div style={styleName}>
          <h1>
            Envio de plantillas
          </h1>
        </div>
      </Box>

      <Box>
        <div>
          <p>Nombre de Campaña</p>
          <input type='text'placeholder='nombre de la campaña' 
          value={titleCampaign}
          onChange={(e)=>setTitleCampaign(e.target.value)}></input>
          <p>Selecciona un Archivo</p>

          <input
            type="file"
            onChange={handleFile}
            placeholder="Selecciona tu Archivo"
          />

            {sheetname.length > 0 && (
              <div>
                <h1>Elige la columna que contiene el numero destino</h1>
                <select className="var-select" value={selectvar} onChange={asignarDestino}>
                <option value="" disabled>
              Selecciona el destinatario
            </option>
                  {Object.keys(sheetname[0]).map((columnName, index) => (
                   
                    <option key={index} value={columnName}>
                      {columnName}
                    </option>
                  ))}
                </select>
              </div>
            )}

          <button onClick={handleShowContent}>Mostrar Contenido del Archivo</button>

          {showFileContent && (
            <div className={`fixed inset-0 bg-gray-500 bg-opacity-75 z-50 ${showFileContent ? 'block' : 'hidden'}`}>
            <div className="p-4 max-w-md mx-auto mt-20 bg-white rounded-md shadow-lg">
              <div>
                <h2 className="text-lg font-bold mb-4">Contenido del archivo por columnas y filas:</h2>
                <div className="scrollable-table-container max-h-40 overflow-y-auto mb-4">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        {Object.keys(sheetname[0]).map((columnName, index) => (
                          <th key={index} className="border px-4 py-2">{columnName}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheetname.slice(0, 5).map((rowData, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(rowData).map((cellData, cellIndex) => (
                            <td key={cellIndex} className="border px-4 py-2">{cellData}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-blue-500 text-white px-4 py-2 rounded-md focus:outline-none hover:bg-blue-600"
              >
                Cerrar
              </button>
            </div>
          </div>
          )}
        </div>
      </Box>

      <Box>
        <div>
          <p>Selecciona la plantilla:</p>
          <select onChange={handleTemplateChange} value={selectedTemplate}>
            <option value="" disabled>
              Selecciona tu plantilla
            </option>
            {templates.map((template, index) => (
              <option key={index} value={template.elementName}>
                {template.elementName}
              </option>
            ))}
          </select>
        </div>
      </Box>
      
      <Box>
      {selectedTemplateData && (
          <div>
            <p>Contenido de la plantilla:</p>
            <PhoneContainer>
              <PhoneScreen>
                <WhatsAppMessage message={selectedTemplateData} />
              </PhoneScreen>
            </PhoneContainer>
          </div>
        )}

        {selectedTemplateType && (
          <div>
            <p>Tipo de la plantilla seleccionada: {selectedTemplateType}</p>
          </div>
        )}
      </Box>

      <Box>
        {variableCount > 0 && (
          <div>
            <p>Selecciona la columna para cada variable:</p>
            {Array.from({ length: variableCount }).map((_, index) => (
              <div key={index}>
                <label>{`Variable ${index + 1}:`}</label>
          
                <select
                  value={variableColumnMapping[index + 1] || ''}
                  onChange={(e) => handleVariableColumnChange(index + 1, e.target.value)}
                >
                  <option value="">Selecciona una columna</option>
                  {sheetname.length > 0 &&
                    Object.keys(sheetname[0]).map((columnName, columnIndex) => (
                      <option key={columnIndex} value={columnName}>
                        {columnName}
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </Box>

      {selectedTemplateType === 'Video' && (
      <Box>
      <div>

      <p>Selecciona un Video</p>
      <input
        type="file"
        onChange={handleVideoFileChange}
        accept="video/*" // Limitar a archivos de video
        placeholder="Selecciona tu Video"
      />
      {selectedVideoUrl && (
        <div>
          <h2>Video seleccionado:</h2>
          <video width="400" controls>
            <source src={selectedVideoUrl} type="video/mp4" />
            Tu navegador no soporta el tag de video.
          </video>
        </div>
            )}
          </div>
          </Box>
          )}


        {selectedTemplateType === 'Imagen' && (
        <Box>
          <div>
            <p>Selecciona una Imagen</p>

            <input
              type="file"
              onChange={handleImageFileChange}
              accept="image/*" // Limitar a archivos de imagen
              placeholder="Selecciona tu Imagen"
            />

            {selectedImageUrl && (
              <div>
                <h2>Imagen seleccionada:</h2>
                <img src={selectedImageUrl} alt="Selected" style={{ maxWidth: '100%' }} />
              </div>
            )}
          </div>
        </Box>
      )}

{selectedTemplateType === 'Documento' && (
        <Box>
          <div>
            <p>Selecciona un archivo</p>

            <input
              type="file"
              onChange={handleDocumentFileChange}
              accept="document/*" // Limitar a archivos de imagen
              placeholder="Selecciona tu archivo"
            />

            {selectedDocumentUrl && (
              <div>
                <h2>Archivo seleccionado:</h2>
                <p>{selectedDocumentUrl}</p>
              </div>
            )}
          </div>
        </Box>
      )}

      <Box>
        <button onClick={enviar}>Enviar</button>
      </Box>
    </Layout>
  );}
  else {
    return (
      <div className="h-[calc(100vh-7rem)] flex justify-center items-center">
        <p className="mb-4">No has iniciado sesión</p>
        <button
          onClick={signin}
          className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }
};

const Box = styled.div`
  padding: 30px;
  margin: 30px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
`;

const styleName = {
  textAlign: 'left',
  fontFamily: 'Arial Black',
  fontWeight: 'bold',
  fontSize: '30px',
  color: '#fff',
  textShadow: '-1px 0 #000, 0 1px #000, 1px 0 #000, 0 -1px #000',
};

const MessageContainer = styled.div`
  background-color: #e4f8fb;
  border-radius: 10px;
  padding: 10px;
  margin: 10px;
  max-width: 300px;
  word-wrap: break-word; /* Agregado para envolver palabras */
`;

const WhatsAppMessage = ({ message }) => {
  return (
    <MessageContainer>
      <p>{message}</p>
    </MessageContainer>
  );
};

const PhoneContainer = styled.div`
  background-image: url('https://cuerosvelez.appcenteryes.com/w/uploads/icono%20what.jpg'); 
  background-size: cover; /* Ajusta el tamaño de la imagen para cubrir completamente el contenedor */
  background-position: center; /* Centra la imagen dentro del contenedor */
  background-color: #f0f0f0;
  border: 16px solid #333;
  border-top-width: 32px;
  border-radius: 40px;
  position: relative;
  width: 375px;
  height: 650px;
  margin: 20px auto;
  overflow: hidden;
`;

const PhoneScreen = styled.div`
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
`;

export default Sends;