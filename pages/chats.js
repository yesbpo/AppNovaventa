import Layout from '../components/Layout';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import styled from 'styled-components';
import socketIOClient from 'socket.io-client';
import { useSession, signIn } from 'next-auth/react';
import EmojiPicker from 'emoji-picker-react';
import { PaperAirplaneIcon, PaperClipIcon, UserGroupIcon, SearchIcon, RefreshIcon } from '@heroicons/react/solid';

const Chats = () => {
  const [latestData, setLatestData] = useState('')
  const { data: session } = useSession();
  const intervalIdRef = React.useRef(null);
  const socketIOConnOpt = {
    'force new connection': true,
    reconnection: true,
    reconnectionDelay: 10000,
    reconnectionDelayMax: 60000,
    reconnectionAttempts: 'Infinity',
    timeout: 10000,
    transports: ['websocket', 'pooling'],
    resource: '/conversation-api/',
  };
const socket = socketIOClient('wss://novaventa.appcenteryes.com/socket.io/', socketIOConnOpt );
  
  useEffect(() => {
    
    socket.on('tablaData', (data) => {
      setMensajes1(data);
    });

    // Limpiar la conexión cuando el componente se desmonta
    return () => {
      socket.disconnect();
    };
  }, []);
  const conection = () => {
    socket.on('tablaData', (data) => {
      setMensajes1(data);
    });

    // Limpiar la conexión cuando el componente se desmonta
    return () => {
      socket.disconnect();
    };
  }   
  const startFetchingChats = (id_chat2) => {
    console.log(id_chat2)
    console.log(latestData)
    
    intervalIdRef.current = setInterval(() => {
    handleEngestionClick();
    conection();
     // Llama a tu segunda función aquí
    }, 10000);
  };
  async function obtenerMensaje(idMessage) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_DB}/obtener-mensaje/${idMessage}`);
  
      if (!response.ok) {
        throw new Error(`Error al obtener el mensaje: ${response.statusText}`);
      }
      
      const data = await response.json();
      
    
      console.log('Mensaje obtenido:', data);
      // Aquí puedes trabajar con el mensaje obtenido
    } catch (error) {
      console.error('Error en la solicitud:', error.message);
      // Manejar el error según sea necesario
    }
    console.log(mensajes1)
  }
  
  const [session1, setSession1 ]= useState('')
  const manejarCambio = (event) => {
    setInputValue(event.target.value);
    
  };
  const [numeroBuscado, setNumeroBuscado] = useState('');
  const handleNumeroChange = (e) => {

    setNumeroBuscado( e.target.value);
    const resultadosFiltrados = contactos1.filter(
      (contacto) => contacto.idChat2.includes(e.target.value));
    setContactos1(resultadosFiltrados);
  };
  const buscarContacto = () => {
    const resultadosFiltrados = contactos1.filter(
      (contacto) => contacto.idChat2.includes(numeroBuscado));
    setContactos1(resultadosFiltrados);
  };
  const messagelistRef = useRef(null);

  useEffect( async() => {

   
     const status1 = 'in process'
     const status2 = 'pending'


try{
  
     
      const responseUsers = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-usuarios');
     // El usuario está autenticado, puedes acceder a la sesión

     if (!responseUsers.ok) {

     }
     const users = await responseUsers.json()
     const Id = users.filter(d => d.usuario == session.user.name)
     const responseChatsin = await fetch(process.env.NEXT_PUBLIC_BASE_DB+`/consultar-chats/${Id[0].id}`);
     const chatsPending = await responseChatsin.json();
     
     const withoutGest = chatsPending
     
     console.log(Object.values(withoutGest)[0].filter(c => c.status == 'pending' || c.status == 'in process'))

     setContactos1(Object.values(withoutGest)[0].filter(c => c.status == 'pending' || c.status == 'in process'))
     fetchExpired(Object.values(withoutGest)[0])
     setEngestion(withoutGest.length)


    const messagelist = messagelistRef.current;

    // Verifica si la referencia es null
    if (messagelist) {
      // Establece el desplazamiento en la parte inferior del contenedor
      messagelist.scrollTop = messagelist.scrollHeight;
    }
  }
  catch{

  }
  }, [mensajes1]);
 const [showPopup, setShowPopup] = useState('')
  // Función para abrir la ventana emergente
  const openPopup = () => {
    setShowPopup(true);
  };

  // Función para cerrar la ventana emergente
  const closePopup = () => {
    setShowPopup(false);
  };
  //logica agregar numero

const [respuestasRapidas, setRespuestasRapidas] = useState([]);
const [numericInputValue, setNumericInputValue] = useState('');
const [templates, setTemplates] = useState([]);
const [selectedTemplateId, setSelectedTemplateId] = useState('');
const [templateParams, setTemplateParams] = useState({}); // Nuevo estado para los parámetros
const [error, setError] = useState(null);
function contarOcurrencias(texto, patron) {
 const regex = new RegExp(patron, 'g');
 const coincidencias = texto.match(regex);
 const componentes = Array.from({ length: coincidencias }, (v, index) => index);

 return coincidencias ? coincidencias : 0;
}

useEffect(() => {
  // Realizar la solicitud GET al servidor
  fetch(process.env.NEXT_PUBLIC_BASE_DB + '/obtener-nombres-contenidos')
  .then(response => response.json())
    .then(data => setRespuestasRapidas(data))
    .catch(error => console.error('Error al obtener respuestas rápidas:', error));
}, []);


// GET TEMPLATES
useEffect(() => {

 // Traer las plantillas al cargar el componente
 const fetchTemplates = async () => {
   try {
     // Utilizar el servidor proxy en lugar de la URL directa
     const response = await fetch(process.env.NEXT_PUBLIC_API2+'/gupshup-templates');

     if (!response.ok) {
       throw new Error(HTTP `error! Status: ${response.status}`);
     }

     const data = await response.json();

     if (data.status === "success") {
       const processedTemplates = data.templates.map(template => ({
         id: template.id, // Asegúrate de incluir el ID
         category: template.category,
         createdOn: template.createdOn,
         data: template.data,
         elementName: template.elementName,
         languageCode: template.languageCode,
         status: template.status,
         templateType: template.templateType,
         modifiedOn: template.modifiedOn,
         params: template.params || [], // Asegúrate de que tu plantilla tenga una propiedad params
       }));

       setTemplates(processedTemplates);
     } else {
       setError(`Error: ${data.message}`);
     }
   } catch (error) {
     setError(Fetch `error: ${error.message}`);
   }
 };

 const fetchMensajes = async () => {
  

  const status1 = 'in process'
  const status2 = 'pending'




  const fechaActual = new Date();
  const options = { timeZone: 'America/Bogota', hour12: false };
       const fechaInicio = new Date(fechaActual);
  fechaInicio.setHours(fechaInicio.getHours() - 24);

  // Formatear la fecha de inicio
  const anioInicio = fechaInicio.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
  const mesInicio = fechaInicio.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
  const diaInicio = fechaInicio.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
  const horaInicio = fechaInicio.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
  const minutosInicio = fechaInicio.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
  const segundosInicio = fechaInicio.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });

  const fechaInicioString = `${anioInicio}-${mesInicio}-${diaInicio} ${horaInicio}:${minutosInicio}:${segundosInicio}`;

  // Formatear la fecha actual
  const anioFin = fechaActual.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
  const mesFin = fechaActual.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
  const diaFin = fechaActual.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
  const horaFin = fechaActual.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
  const minutosFin = fechaActual.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
  const segundosFin = fechaActual.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });

  const fechaFinString = `${anioFin}-${mesFin}-${diaFin} ${horaFin}:${minutosFin}:${segundosFin}`;


       const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'2'+`/obtener-mensajes-por-fecha-y-numero?fechaInicio=${fechaInicioString}&fechaFin=${fechaFinString}&number=${numeroEspecifico}`);

       const data = await response.json();

  const responseUsers = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-usuarios');
  // El usuario está autenticado, puedes acceder a la sesión

  if (!responseUsers.ok) {

  }
  const users = await responseUsers.json()
  const Id = users.filter(d => d.usuario == session.user.name)
  const responseChatsin = await fetch(process.env.NEXT_PUBLIC_BASE_DB+`/consultar-chats/${Id[0].id}`);

  const chatsPending = await responseChatsin.json();

  const withoutGest = chatsPending



  setContactos1(Object.values(withoutGest)[0].filter(c => c.status == 'pending' || c.status == 'in process'))
  fetchExpired(Object.values(withoutGest)[0])

  setEngestion(withoutGest.length)


 const messagelist = messagelistRef.current;

 // Verifica si la referencia es null
 if (messagelist) {
   // Establece el desplazamiento en la parte inferior del contenedor
   messagelist.scrollTop = messagelist.scrollHeight;
 }

 }
 fetchTemplates();
 
 // Llama a fetchMensajes cada segundo


 // Limpia el intervalo al desmontar el componente


}, []);
const fetchExpired =  (contacts) => {
  console.log('entra en expirados', contacts)
  if(contacts.length > 0){

    const fechaActual = new Date();
    const options = { timeZone: 'America/Bogota', hour12: false };
         const fechaInicio = new Date(fechaActual);
    fechaInicio.setHours(fechaInicio.getHours() - 24);

    // Formatear la fecha de inicio
    const anioInicio = fechaInicio.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
    const mesInicio = fechaInicio.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
    const diaInicio = fechaInicio.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
    const horaInicio = fechaInicio.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
    const minutosInicio = fechaInicio.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
    const segundosInicio = fechaInicio.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });

    const fechaInicioString = `${anioInicio}-${mesInicio}-${diaInicio} ${horaInicio}:${minutosInicio}:${segundosInicio}`;

    // Formatear la fecha actual
    const anioFin = fechaActual.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
    const mesFin = fechaActual.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
    const diaFin = fechaActual.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
    const horaFin = fechaActual.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
    const minutosFin = fechaActual.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
    const segundosFin = fechaActual.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });

    const fechaFinString = `${anioFin}-${mesFin}-${diaFin} ${horaFin}:${minutosFin}:${segundosFin}`;


    const contactoslimpios = contacts.filter(contacto => new Date(contacto.assignedDate) < new Date(fechaInicioString))

contactoslimpios.forEach( async e => {
  try{
    console.log(e.assignedDate)
const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_DB+'2'}/obtener-mensajes/${e.idChat2}`)
if (!response.ok) {
  throw new Error('Error en la solicitud');
}

const data = await response.json();

const ultmsjord = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
const ultmsj = ultmsjord[ultmsjord.length-1]

if (new Date(fechaFinString) > new Date(ultmsj.timestamp) ){
try {
  // Objeto de configuración para la solicitud PUT
  const idChat2 = ultmsj.number;
const nuevoEstado = ultmsj.type_comunication === 'message' ? 'expiredbyasesor' : 'expiredbyclient';
const nuevoUserId = e.userId;
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idChat2, nuevoEstado, nuevoUserId }),
  };

  // Hacer la solicitud a la ruta de actualización y esperar la respuesta
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_DB}/actualizar-estado-chat`, requestOptions);

  if (!response.ok) {
    throw new Error('Error en la solicitud');
  }

  // Parsear la respuesta como JSON
  const data = await response.json();

} catch (error) {
  console.error('Error al actualizar el usuario del chat:', error);
  throw error; // Puedes manejar el error o propagarlo según tus necesidades
}
}

// Aquí puedes manejar los mensajes obtenidos según tus necesidades

} catch (error) {
console.error('Error al obtener mensajes:', error);
throw error; // Puedes manejar el error o propagarlo según tus necesidades
}
})
  }
 }
const fetchMensajes = async (id_chat2) => {

  const fechaActual = new Date();
  const options = { timeZone: 'America/Bogota', hour12: false };
       const fechaInicio = new Date(fechaActual);
  fechaInicio.setHours(fechaInicio.getHours() - 24);

  // Formatear la fecha de inicio
  const anioInicio = fechaInicio.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
  const mesInicio = fechaInicio.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
  const diaInicio = fechaInicio.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
  const horaInicio = fechaInicio.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
  const minutosInicio = fechaInicio.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
  const segundosInicio = fechaInicio.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });

  const fechaInicioString = `${anioInicio}-${mesInicio}-${diaInicio} ${horaInicio}:${minutosInicio}:${segundosInicio}`;

  // Formatear la fecha actual
  const anioFin = fechaActual.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
  const mesFin = fechaActual.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
  const diaFin = fechaActual.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
  const horaFin = fechaActual.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
  const minutosFin = fechaActual.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
  const segundosFin = fechaActual.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });

  const fechaFinString = `${anioFin}-${mesFin}-${diaFin} ${horaFin}:${minutosFin}:${segundosFin}`;

       const status1 = 'in process'
       const status2 = 'pending'
       const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'2'+`/obtener-mensajes-por-fecha-y-numero?fechaInicio=${fechaInicioString}&fechaFin=${fechaFinString}&number=${id_chat2}`);


       
       

       const responseUsers = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-usuarios');
       // El usuario está autenticado, puedes acceder a la sesión

       if (!response.ok) {

       }
       const users = await responseUsers.json()
       const Id = users.filter(d => d.usuario == session.user.name)

       
       
       
       
       
       const data = await response.json();
       

       
       

      const messagelist = messagelistRef.current;

      // Verifica si la referencia es null
      if (messagelist) {
        // Establece el desplazamiento en la parte inferior del contenedor
        messagelist.scrollTop = messagelist.scrollHeight;
      }
 }
const handleParamChange = (param, value) => {
 setTemplateParams((prevParams) => {
   const updatedParams = {
     ...prevParams,
     [param]: value,
   };
   console.log('Updated Params:', updatedParams);
   return updatedParams;
 });
};

const handleTemplateChange = (event) => {
 const selectedTemplateId = event.target.value;
 setSelectedTemplateId(selectedTemplateId);
};

const enviarSolicitud = async () => {
 if (!selectedTemplateId) {
   console.error('Error: No se ha seleccionado ninguna plantilla.');
   return;
 }

 const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);

 if (!selectedTemplate) {
   console.error('Error: No se encontró la plantilla seleccionada.');
   return;
 }

 const url = 'https://api.gupshup.io/wa/api/v1/template/msg';
 const apiKey = 'thpuawjbidnbbbfrp9bw7qg03eci6rdz';

 const data = new URLSearchParams();
 data.append('channel', 'whatsapp');
 data.append('source', process.env.NEXT_PUBLIC_CELLPHONE);
 data.append('destination', numericInputValue);
 data.append('src.name', process.env.NEXT_PUBLIC_NAMEAPP);
 data.append('template', JSON.stringify({
   id: selectedTemplate.id,
   params: Object.values(templateParams) || [] // Asegúrate de que tu plantilla tenga una propiedad params
 }));

 try {
   const response = await fetch(url, {
     method: 'POST',
     headers: {
       'Cache-Control': 'no-cache',
       'Content-Type': 'application/x-www-form-urlencoded',
       'apikey': apiKey,
       'cache-control': 'no-cache',
     },
     body: data,
   });

   const responseData = await response.json();
   console.log('Respuesta:', Object.values(templateParams));
   setSelectedTemplateId('')
   setNumericInputValue('')
 } catch (error) {
   console.error('Error al enviar la solicitud:', error);
 }
};

const handleNumericInputChange = (value) => {
 // Permite solo números y limita a 10 caracteres
 const newValue = value.replace(/[^0-9]/g, '').slice(0, 10);
 setNumericInputValue(newValue);
 console.log('Valor numérico ingresado:', newValue);
};

const handleAgregarNumeroClick = () => {
 // Llamamos a la función enviarSolicitud al hacer clic en el botón
 enviarSolicitud();

};
  // logica chats
  async function marcaLeido(id_chat2){
    setNumeroEspecifico(id_chat2)
    startFetchingChats(id_chat2);
    try {
      
      
      const idChat2 = id_chat2; // Reemplaza 'tu_id_chat2' con el valor real que deseas actualizar
      const resolvedValue = true; // Reemplaza 'nuevo_valor_resolved' con el nuevo valor para 'resolved'

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_DB}/actualizar-chat/${idChat2}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resolved: resolvedValue }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
    } catch (error) {
      console.error('Error al actualizar el chat:', error);
    }

  }
  const [statuschats, setStatuschats] = useState('')

  const [pendientes, setPendientes] = useState('');
  const [engestion, setEngestion] = useState('');

  // Función para mantener el scroll en la parte inferior
  // El array vacío asegura que el efecto se ejecute solo una vez al montar el componente


  const manejarPresionarEnter = (event) => {
    if (event.key === 'Enter') {

      enviarMensaje();
      setInputValue('')
      
    }
  };

  const [emojis, setEmojis] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleAddEmoji = (emoji) => {
    setInputValue(`${inputValue} ${emoji}`);
    setEmojis([...emojis, emoji]);
    setShowEmojiPicker(false); // Ocultar el EmojiPicker después de seleccionar un emoji
  };
  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prevShow) => !prevShow);
  };

  const [contactos1, setContactos1] = useState([]);
  const [contactos, setContactos] = useState([
    { user: null, fecha: null, mensajes: [{ tipomensaje: '', datemessage: '', content: '' }] },
  ]);
  const [webhookData, setWebhookData] = useState(null);
  const [mensajes1, setMensajes1] = useState([]);

     const handlePendientesClick = async () => {


      setStatuschats('Pendientes')
    try {
       const fechaActual = new Date();
const options = { timeZone: 'America/Bogota', hour12: false };
      const fechaInicio = new Date(fechaActual);
fechaInicio.setHours(fechaInicio.getHours() - 24);

// Formatear la fecha de inicio
const anioInicio = fechaInicio.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
const mesInicio = fechaInicio.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
const diaInicio = fechaInicio.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
const horaInicio = fechaInicio.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
const minutosInicio = fechaInicio.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
const segundosInicio = fechaInicio.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });

const fechaInicioString = `${anioInicio}-${mesInicio}-${diaInicio} ${horaInicio}:${minutosInicio}:${segundosInicio}`;

// Formatear la fecha actual
const anioFin = fechaActual.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
const mesFin = fechaActual.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
const diaFin = fechaActual.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
const horaFin = fechaActual.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
const minutosFin = fechaActual.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
const segundosFin = fechaActual.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });

const fechaFinString = `${anioFin}-${mesFin}-${diaFin} ${horaFin}:${minutosFin}:${segundosFin}`;

      const status = 'pending';

      
      const responseUsers = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-usuarios');
      // El usuario está autenticado, puedes acceder a la sesión

      if (!responseUsers.ok) {
          }
      const users = await responseUsers.json()
      const Id = users.filter(d => d.usuario == session.user.name)

      
      const withoutGest = chatsPending.filter(d => d.userId == Id[0].id )
      

    } catch (error) {

      // Puedes manejar el error según tus necesidades
    }
  };
  const handleEngestionClick = async () => {
    conection()

    console.log('entra')
    setStatuschats('Chats')
    
    

      const status1 = 'in process'
      const status2 = 'pending'


 
   

       const responseUsers = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-usuarios');
      // El usuario está autenticado, puedes acceder a la sesión

      if (!responseUsers.ok) {

      }
      const users = await responseUsers.json()
      setSession1(session.user.name)
      const Id = users.filter(d => d.usuario == session.user.name)
      const responseChatsin = await fetch(process.env.NEXT_PUBLIC_BASE_DB+`/consultar-chats/${Id[0].id}`);
      const chatsPending = await responseChatsin.json();
      
      const withoutGest = chatsPending
      
      

      setContactos1(Object.values(withoutGest)[0].filter(c=> c.status == 'pending' || c.status == 'in process'))

      setEngestion(withoutGest.length)


     const messagelist = messagelistRef.current;

     // Verifica si la referencia es null
     if (messagelist) {
       // Establece el desplazamiento en la parte inferior del contenedor
       messagelist.scrollTop = messagelist.scrollHeight;
     }
   
  };



const [file, setFile] = useState('');

const fileInputRef = useRef(null);

const handleButtonClick = () => {
  // Simular clic en el input de archivo cuando se hace clic en el botón
  fileInputRef.current.click();
};

const handleFileChange = (e) => {
  // Manejar el cambio de archivo aquí
  setFile(e.target.files[0]);
  console.log('Archivo seleccionado:', file.name);
};

  // Llamada a la función
  const [numeroEspecifico, setNumeroEspecifico] = useState('');
  // Ejemplo de consumo de la ruta con JavaScript y fetch
  const actualizarEstadoChatCerrados = async () => {

  const idChat2 = numeroEspecifico;
  const nuevoEstado = 'closed';
  const nuevoUserId  = session.user.id
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/actualizar-estado-chat', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idChat2: idChat2,
        nuevoEstado: nuevoEstado,
        nuevoUserId: nuevoUserId, // Puedes omitir esto si no deseas actualizar userId
      }),
    });

    if (response.ok) {
      const data = await response.json();
      
      
      try {

       const fechaActual = new Date();
       const options = { timeZone: 'America/Bogota', hour12: false };
             const fechaInicio = new Date(fechaActual);
       fechaInicio.setHours(fechaInicio.getHours() - 24);

       // Formatear la fecha de inicio
       const anioInicio = fechaInicio.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
       const mesInicio = fechaInicio.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
       const diaInicio = fechaInicio.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
       const horaInicio = fechaInicio.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
       const minutosInicio = fechaInicio.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
       const segundosInicio = fechaInicio.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });

       const fechaInicioString = `${anioInicio}-${mesInicio}-${diaInicio} ${horaInicio}:${minutosInicio}:${segundosInicio}`;

       // Formatear la fecha actual
       const anioFin = fechaActual.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
       const mesFin = fechaActual.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
       const diaFin = fechaActual.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
       const horaFin = fechaActual.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
       const minutosFin = fechaActual.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
       const segundosFin = fechaActual.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });

       const fechaFinString = `${anioFin}-${mesFin}-${diaFin} ${horaFin}:${minutosFin}:${segundosFin}`;

       const responseChatsin = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'2'+`/consultar-chats/${session.user.id}`);
       const responseUsers = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-usuarios');
       // El usuario está autenticado, puedes acceder a la sesión

       if (!responseUsers.ok) {

       }
       const users = await responseUsers.json()
       const Id = users.filter(d => d.usuario == session.user.name)

       const chatsPending = await responseChatsin.json();
       const withoutGest = chatsPending;



       setContactos1(Object.values(withoutGest)[0].filter(c => c.status == 'pending' || c.status == 'in process' ));
       setEngestion(withoutGest.length)
     } catch (error) {

       // Puedes manejar el error según tus necesidades
     }
      
    } else {
      console.error('Error en la solicitud:', response.statusText);
    }
  } catch (error) {
    console.error('Error de red:', error);
  }
};



  const actualizarEstadoChat = async (estado) => {
    

    try {
      const idChat2 = numeroEspecifico; // Asegúrate de obtener el idChat2 según tu lógica
      const nuevoEstado = 'in process'; // Asegúrate de obtener el nuevoEstado según tu lógica

      const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/actualizar-estado-chat', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idChat2, nuevoEstado }), // Ajusta la estructura del cuerpo según tus necesidades
      });

      if (response.ok) {
        const resultado = await response.json();

        try {
          const fechaActual = new Date();
   const options = { timeZone: 'America/Bogota', hour12: false };
         const fechaInicio = new Date(fechaActual);
   fechaInicio.setHours(fechaInicio.getHours() - 24);

   // Formatear la fecha de inicio
   const anioInicio = fechaInicio.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
   const mesInicio = fechaInicio.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
   const diaInicio = fechaInicio.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
   const horaInicio = fechaInicio.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
   const minutosInicio = fechaInicio.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
   const segundosInicio = fechaInicio.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });

   const fechaInicioString = `${anioInicio}-${mesInicio}-${diaInicio} ${horaInicio}:${minutosInicio}:${segundosInicio}`;

   // Formatear la fecha actual
   const anioFin = fechaActual.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
   const mesFin = fechaActual.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
   const diaFin = fechaActual.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
   const horaFin = fechaActual.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
   const minutosFin = fechaActual.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
   const segundosFin = fechaActual.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });

   const fechaFinString = `${anioFin}-${mesFin}-${diaFin} ${horaFin}:${minutosFin}:${segundosFin}`;




       } catch (error) {

         // Puedes manejar el error según tus necesidades
       }
        // Manejar la respuesta exitosa según tus necesidades
      } else if (response.status === 404) {

        // Manejar el caso de chat no encontrado según tus necesidades
      } else {

        // Manejar otros errores según tus necesidades
      }
    } catch (error) {

      // Manejar errores generales según tus necesidades
    }
  };
   // Reemplaza esto con el número que necesites
  const [inputValue, setInputValue] = useState('')
  const [msg, setMsg] = useState([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps



  const enviarMensaje = async () => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append('archivo', file);

        const response = await fetch(process.env.NEXT_PUBLIC_BASE_API+'/subir-archivo', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        else{
          const base = process.env.NEXT_PUBLIC_BASE_URL

          const responseData = await response.json();

        if (responseData.url) {
          alert(`El archivo se cargó correctamente. URL: ${responseData.url}`);
        } else {
          throw new Error('No se recibió una URL del servidor.');
        }
          const fechaActual = new Date();
          const options = { timeZone: 'America/Bogota', hour12: false };
          const anio = fechaActual.getFullYear();
          const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
          const dia = fechaActual.getDate().toString().padStart(2, '0');
          const hora = fechaActual.getHours().toString().padStart(2, '0');
          const minutos = fechaActual.getMinutes().toString().padStart(2, '0');
          const segundos = fechaActual.getSeconds().toString().padStart(2, '0');
          const documentUrl = responseData.url;
          const cleanedType = file.type.includes('application')
          ? 'file'
          :  file.type.replace(/^(image|video)\/(.+)$/, '$1');
          let tipoadjunto;
          switch (cleanedType) {
            case 'file':
              // Lógica para el tipo 'file'
              tipoadjunto = {
                type: cleanedType,
                url: base + documentUrl,
                filename: file,
              };
              break;

            case 'video':
              // Lógica para el tipo 'video'
              tipoadjunto = {
                type: 'video',
                url: base + documentUrl,
                caption: inputValue,
              };
              break;

            case 'image':
              // Lógica para el tipo 'image'
              tipoadjunto = {
                type: 'image',
                originalUrl: base + documentUrl,
                previewUrl: base + documentUrl,
                caption: inputValue,
              };
              break;
              case 'audio':
              // Lógica para el tipo 'image'
              tipoadjunto = {
                type: 'audio',
                originalUrl: base + documentUrl,
                previewUrl: base + documentUrl,
                caption: inputValue,
              };
              break;
            default:
              // Lógica para otros tipos, si es necesario
              tipoadjunto = null;
              break;
          }

         // Preparar datos del mensaje
        const mensajeData = {
          channel: 'whatsapp',
          source: process.env.NEXT_PUBLIC_CELLPHONE,
          'src.name': process.env.NEXT_PUBLIC_NAMEAPP,
          destination: numeroEspecifico,
          message: JSON.stringify(tipoadjunto),
          disablePreview: true,
        };
        // Enviar mensaje a través de la API de envíos
        const envioResponse = await fetch(process.env.NEXT_PUBLIC_API2+'/api/envios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(mensajeData).toString(),
        });
        if (!envioResponse.ok) {
          throw new Error(`Error al enviar el mensaje: ${envioResponse.status} ${envioResponse.statusText}`);
        }
        
        const envioData = await envioResponse.json();
        console.log('Respuesta del servidor de envíos:',documentUrl );
        const idMessage = envioData.messageId;
        const mensajesaliente = {
          content: {file: base + documentUrl,  text: mensajeData.message.caption},
          type_comunication: 'message-event', // Puedes ajustar este valor según tus necesidades
          status: 'sent', // Puedes ajustar este valor según tus necesidades
          number: numeroEspecifico,
          type_message: cleanedType,
          timestamp: `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`,
          idMessage: idMessage // Puedes ajustar este valor según tus necesidades
        } 
        socket.emit('message', mensajesaliente)
        
      setInputValue('')
      conection()// Actualizar el mensaje enviado en el servidor
        const guardarMensajeResponse = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/guardar-mensajes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: {file: base + documentUrl,  text: mensajeData.message.caption},
          type_comunication: 'message-event', // Puedes ajustar este valor según tus necesidades
          status: 'sent', // Puedes ajustar este valor según tus necesidades
          number: numeroEspecifico,
          type_message: cleanedType,
          timestamp: `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`,
          idMessage: idMessage // Puedes ajustar este valor según tus necesidades
        }),
      });
      
      
      
      if (guardarMensajeResponse.ok) {
        const guardarMensajeData = await guardarMensajeResponse.json();
        console.log(guardarMensajeData)
        setFile('')
        
      } else {
      }

        }

      } catch (error) {
        console.error('Error al subir el archivo:', error.message);

      }
    } else{

    try {
      const mensajeData = {
        channel: 'whatsapp',
        source: process.env.NEXT_PUBLIC_CELLPHONE,
        'src.name': process.env.NEXT_PUBLIC_NAMEAPP,
        destination: numeroEspecifico,
        message: inputValue,
        disablePreview: true,
      };


      const fechaActual = new Date();
const options = { timeZone: 'America/Bogota', hour12: false };
const anio = fechaActual.getFullYear();
const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
const dia = fechaActual.getDate().toString().padStart(2, '0');
const hora = fechaActual.getHours().toString().padStart(2, '0');
const minutos = fechaActual.getMinutes().toString().padStart(2, '0');
const segundos = fechaActual.getSeconds().toString().padStart(2, '0');
      const response = await fetch(process.env.NEXT_PUBLIC_API2+'/api/envios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(mensajeData).toString(),
      });
      conection()
      setInputValue('')
      if (!response.ok) {
              }
      const responseData = await response.json();

       // Escucha el evento 'cambio' para obtener el idMessage
      const idMessage = responseData.messageId;
     const mensajesaliente1 = {
        content: inputValue,
        type_comunication: 'message-event', // Puedes ajustar este valor según tus necesidades
        status: 'sent', // Puedes ajustar este valor según tus necesidades
        number: numeroEspecifico,
        type_message: 'text',
        timestamp: `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`,
        idMessage: idMessage // Puedes ajustar este valor según tus necesidades
      }
      setInputValue('')
      socket.emit('message', mensajesaliente1)
      conection()
          // Guarda el mensaje en el servidor
      
    
   
   




    } catch (error) {

    }
  };


  };
  const updateuser =   async () => {
    const usuario = session.user.name; // Reemplaza con el nombre de usuario que deseas actualizar
    const nuevoDato = 'Activo'; // Reemplaza con el nuevo valor que deseas asignar
    if(numeroEspecifico !== '')
    {
        const fechaActual = new Date();
  const options = { timeZone: 'America/Bogota', hour12: false };
        const fechaInicio = new Date(fechaActual);
  fechaInicio.setDate(fechaInicio.getDate() - 1);
  let horaInicio ;
  // Formatear la fecha de inicio
  const anioInicio = fechaInicio.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
  const mesInicio = fechaInicio.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
  const diaInicio = fechaInicio.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
  if (fechaInicio.getHours() >= 24) {
    horaInicio = 0;
  }
  horaInicio = fechaInicio.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
  const minutosInicio = fechaInicio.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
  const segundosInicio = fechaInicio.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });

  const fechaInicioString = `${anioInicio}-${mesInicio}-${diaInicio} ${horaInicio}:${minutosInicio}:${segundosInicio}`;

  // Formatear la fecha actual
  const anioFin = fechaActual.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
  const mesFin = fechaActual.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
  const diaFin = fechaActual.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
  const horaFin = fechaActual.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
  const minutosFin = fechaActual.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
  const segundosFin = fechaActual.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });

  const fechaFinString = `${anioFin}-${mesFin}-${diaFin} ${horaFin}:${minutosFin}:${segundosFin}`;

fetchMensajes()


  // Configurar el intervalo para realizar la consulta cada 30 segundos

  }

  }

  function limpiarLink(dataString) {
    const match = dataString.match(/"file":"([^"]*)"/);
    return match ? match[1] : null;
  }
  async function asignarChat(){
    const responseUsers = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-usuarios');
    const users =  await responseUsers.json();
    const asesores = users.filter(user => user.type_user == "Asesor" || user.type_user == "Asesor1" );
    setMsg(asesores)


  }
  async function trasladarChat (usuarioid){
    const url = `${process.env.NEXT_PUBLIC_BASE_DB}/actualizar-usuario-chat`
    const requestBody = {
      idChat2:  numeroEspecifico.toString(),
      nuevoUserId:  parseInt(usuarioid)

    };
    // Realiza la solicitud PUT a la ruta
    try {

      console.log(requestBody.idChat2, requestBody.nuevoUserId )
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setMsg('')
          // Maneja la respuesta según tus necesidades
      } else {
        console.error('Error al realizar la solicitud:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error.message);
    }

  }
  if(session){
    return (
    <>
     {showPopup &&  <div className="fixed inset-0 flex items-center justify-center overflow-y-auto">

    <div className="bg-black bg-opacity-50 " ></div>
    <div className="bg-white p-6 rounded shadow-lg w-96">
    <button
        onClick={closePopup}
        className="mb-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Cerrar
      </button>

      <label htmlFor="destinationInput" className="block text-sm font-medium text-gray-700">
        Número de destino (máximo 10 dígitos):
      </label>
      <input
        type="text"
        id="destinationInput"
        value={numericInputValue}
        onChange={(e) => handleNumericInputChange(e.target.value)}
        className="mt-1 p-2 border border-gray-300 rounded-md"
      />
     <button
        onClick={handleAgregarNumeroClick}
        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Agregar Número
      </button>

      <h2 className="mt-4 text-lg font-semibold">Plantillas:</h2>
      <select
        value={selectedTemplateId}
        onChange={handleTemplateChange}
        className="mt-1 p-2 border border-gray-300 rounded-md"
      >
        <option value="" disabled>Select a template</option>

        {templates.map((template) => (

          <option key={template.id} value={template.id}>
            {template.data}{contarOcurrencias(template.data, '{{.*?}}')}
          </option>
        ))}

      </select>

      {templates.map(
        (template) =>
          template.id === selectedTemplateId &&
          template.params && (
            <div key={template.id} className="mt-4">
              <h3 className="text-lg font-semibold">Parámetros:</h3>
              {contarOcurrencias(template.data, '{{.*?}}').length > 0 && contarOcurrencias(template.data, '{{.*?}}').map((param) => (
                <div key={param} className="mt-2">
                  <label htmlFor={param} className="block text-sm font-medium text-gray-700">
                    {param}:
                  </label>
                  <input
                    type="text"
                    id={param}
                    onChange={(e) => handleParamChange(param, e.target.value)}
                    className="mt-1 p-2 border border-gray-300 rounded-md"
                  />
                </div>
              ))}
            </div>
          )
      )}
    </div>
  </div>}
        <Layout className='big-box'>

        <Box className='estados'>
          <ButtonContainer>
            <CustomButton onClick={handleEngestionClick}>{"Chats: "+contactos1.length}</CustomButton>
             {/* Mostrar Activos si 'mostrarActivos' es true */}

            {session.user.type_user === 'Asesor1' && <CustomButton onClick={openPopup}>Agregar Número</CustomButton>}
            {session.user.type_user === 'Coordinador' && <CustomButton onClick={openPopup}>Agregar Número</CustomButton>}
          </ButtonContainer>
        </Box>
        <Container>

  {/* Contenedor del chat */}


    <Box className="bg-primary">
    <h2 className='text-white'>Chat {numeroEspecifico}</h2>
    <div className='h-80vw'>
      {numeroEspecifico !== '' && <button onClick={asignarChat}>Transferir Chat</button>}
      {msg.length > 0 && (
         <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 transition-opacity duration-300">
         <div className="bg-white p-4 rounded-md relative">
         <button onClick={() => setMsg('')}>
              X
            </button>
           <p className="mb-4">Selecciona un asesor para asignar el chat</p>
           <ul>
             {msg.map(user => (
               <li
                 key={user.id}
                 onClick={() => trasladarChat(user.id)}
                 className="cursor-pointer hover:bg-gray-200 p-2 rounded-md mb-2"
               >
                 {user.complete_name},{user.session}
               </li>
             ))}
           </ul>
         </div>
       </div>
      )}

    </div>
    <ContainerBox  className='bg-primary'>
      <div className='messagelist h-100 overflow-y-auto' >
      {(() => {
          // Filtra los mensajes por el número específico y contenido no vacío
          const mensajesFiltrados = mensajes1
            .filter((mensaje) => mensaje.number === numeroEspecifico && mensaje.content && mensaje.content.trim() !== '')
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Ordena los mensajes por fecha

          // Mapea y renderiza los mensajes ordenados
          return mensajesFiltrados.map((mensaje, index) => (

            <div
              key={index}
              className={`mensaje ${mensaje.type_message} ${
                mensaje.type_comunication === 'message-event' ? 'bg-white text-right shadow-lg p-4 bg-gray rounded-md' : 'bg-green text-left shadow-lg p-4 bg-gray rounded-md'
              } p-4 mb-4`}

            >

              { mensaje.type_message === 'image'  ? (
                <img src={limpiarLink(mensaje.content) || mensaje.content}  alt="Imagen" className="w-15vw shadow-md p-4 bg-gray rounded-md" />
              ) :mensaje.type_message === 'image' ? (
                <img src={limpiarLink(mensaje.content)} alt="Imagen" className="w-15vw" />
              ): mensaje.type_message === 'audio' ? (
                <audio controls>
                  <source src={mensaje.content} type="audio/mp3" />
                  Tu navegador no soporta el elemento de audio.
                </audio>
              ) : mensaje.type_message === 'sticker' ? (
                <img src={mensaje.content} alt="Sticker" className="w-15vw" />
              ) : mensaje.type_message === 'video' ? (
                <video controls className="w-15vw">
                  <source src={limpiarLink(mensaje.content)||mensaje.content} type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              ) : mensaje.type_message === 'file' ? (
                <a href={ limpiarLink(mensaje.content)||mensaje.content} target="_blank" rel="noopener noreferrer" className="text-blue">
                  Descargar documento
                </a>
              ) : (
                <>
                  <p className="mb-2">{mensaje.content && mensaje.content.trim()}</p>
                  <span >{mensaje.status +" "+ mensaje.timestamp}</span>
                </>
              )}

            </div>
          ));
        })()}      </div>

    </ContainerBox >
    {/* Contenedor de entrada y botones */}
    <div className='input-container'>
      <InputContainer className='input-box'>
        <InputMensaje
          type="text"
          placeholder="Escribe un mensaje..."
          value={inputValue}
          onKeyDown={manejarPresionarEnter}
          onChange={manejarCambio}
        />
        <BotonEnviar onClick={enviarMensaje}><PaperAirplaneIcon className="h-5 w-5" /></BotonEnviar>
        <button onClick={toggleEmojiPicker}>😊</button>
        <label className="custom-file-input-label" onClick={handleButtonClick}>
      <PaperClipIcon className="w-5 h-10 mr-2" />{file.name }
      </label>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
         // Puedes ajustar las extensiones permitidas
      />


      </InputContainer>
      {showEmojiPicker && (
        <EmojiPicker
          onEmojiClick={(emoji) => handleAddEmoji(emoji.emoji)}
          disableAutoFocus
        />
      )}
    </div>

    <div className='flex flex-row justify-between'>
      <BotonEnviar onClick={actualizarEstadoChat}>En atencion</BotonEnviar>
      <BotonEnviar onClick={actualizarEstadoChatCerrados}>Finalizar</BotonEnviar>
      <div>
      <label>Selecciona una respuesta rápida:</label>
      <select>
        {respuestasRapidas.map(respuesta => (
          <option key={respuesta.name} value={respuesta.contentn}onClick={setInputValue}>
            {respuesta.name}:{respuesta.contentn}
          </option>
        ))}
      </select>
    </div>
    </div>

    </Box>

    {/* Botones de acción */}



  {/* Contenedor de contactos */}


 <ContainerBox2 >
 <InputMensaje
        type="text"
        placeholder="Ingrese un número"
        value={numeroBuscado}
        onChange={handleNumeroChange}
      />
        <Box className='bg-blue-900'>
    <div className="contact-list-container">
      <h1>{statuschats}</h1>
      <ul>
  {!Array.isArray(contactos1) && (
    <li>
      <CustomButton2
        onClick={() => marcaLeido(contactos1.idChat2)}
        className={`p-2 rounded ${
          (contactos1.status == 'in process' ? 'bg-gray text-black' : 'bg-green text-white'  )
        }`}
      >
        <UserGroupIcon className="w-5 h-10" /> {contactos1.idChat2}
        {contactos1.resolved && (
  <span className="text-red">Mensaje nuevo</span>
)}
      </CustomButton2>
    </li>
  )}
  {Array.isArray(contactos1)  &&
    contactos1.map((contacto, index) => (
      <li key={index}>
        <CustomButton2
          onClick={() => marcaLeido(contacto.idChat2)}
          className={`p-2 rounded ${
            `p-2 rounded ${
              contacto.status === 'in process' ? 'bg-green text-black' :
              contacto.status === 'expiredbyasesor' ? 'bg-red text-black' :
              contacto.status === 'expiredbyclient' ? 'bg-primary text-black' :
              'bg-gray text-white' // Estado por defecto
            }`}`}
        >{(() => {
          switch (contacto.status) {
            case 'in process':
              return <span className="text-black">En atencion</span>;
            case 'expiredbyasesor':
              return <span className="text-white">expirado asesor</span>;
            case 'expiredbyclient':
              return <span className="text-red">expirado cliente</span>;
            default:
              return <span className="text-white">Pendiente</span>;
          }
        })()}
          <UserGroupIcon className="w-5 h-10" /> {contacto.idChat2}
          {!contacto.resolved && (
  <span className="text-red">Mensaje nuevo</span>
)}
        </CustomButton2>
      </li>
    ))}

</ul>
</div>
  </Box>
  </ContainerBox2>

        </Container>
      </Layout>
        </>
    )}
    return (
      <>
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="mb-4">Not signed in</p>
        <button
          onClick={() => signIn()}
          className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded"
        >
          Sign in
        </button>
      </div>
    </>

      )
    };

const Box = styled.div`

padding: 1vw;
margin: 2vw;
border-radius: 10px;
box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
`;

const CustomButton = styled.button`
background-color: #4caf50;
color: white;
padding: 10px 20px;
font-size: 16px;
border: none;
border-radius: 5px;
cursor: pointer;
transition: background-color 0.3s;
width: 100%;

&:hover {
  background-color: #45a049;
}
`;
const CustomButton2 = styled.button`


padding: 10px 20px;
font-size: 16px;
border: none;
border-radius: 5px;
cursor: pointer;
transition: background-color 0.3s;
width: 100%;

&:hover {
  background-color: #45a049;
}
`;
const ButtonContainer = styled.div`
display: flex;
gap: 10px;
`;

const Container = styled.div`
display: flex;
gap: 20px;
`;

const ContainerBox = styled.div`
background-color: #f7f7f7;
border-radius: 10px;
overflow-y: scroll;
height: 30vw;
width: 50vw;
scroll-behavior: smooth;
`;
const ContainerBox2 = styled.div`
background-color: #f7f7f7;
margin-top: 30px;
margin-right: 30px;
border-radius: 10px;
overflow-y: scroll;
height: 50vw;
width: 100vw;
scroll-behavior: smooth;
`;
const p = styled.div`
background-color: ${(props) => (props.tipo === 'message-event' ? '#6e6e6' : '#4caf50')};
color: ${(props) => (props.tipo === 'message-event' ? 'black' : 'white')};
padding: 10px;
margin-bottom: 5px;
border-radius: 5px;
`;



const InputContainer = styled.div`
margin-top: 15px;
display: flex;
align-items: center;
`;

const InputMensaje = styled.input`
flex: 1;
padding: 10px;
border: 1px solid #ddd;
border-radius: 5px;
margin-right: 10px;
`;

const BotonEnviar = styled.button`
background-color: #4caf50;
color: white;
padding: 10px 20px;
font-size: 16px;
border: none;
border-radius: 5px;
cursor: pointer;
transition: background-color 0.3s;

&:hover {
  background-color: #45a049;
}
`;
  export default Chats;
  