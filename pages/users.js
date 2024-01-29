import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import styled from 'styled-components';
import { useSession, signIn } from 'next-auth/react';

const CrearUsuario = () => {
  const [showCrear, setShowCrear] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const handleChangeCrear = () => {
    setShowCrear(true)
  }
  const handleChange = () => {
    setIsChecked(!isChecked);
  };
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB + '/obtener-usuarios');

        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        console.error('Error al obtener usuarios:', error.message);
        setError('Error al obtener usuarios. Consulta la consola para obtener más detalles.');
      }
    };

    obtenerUsuarios();
  }, []);

  const { data: sesion } = useSession();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [session, setSession] = useState('');
  const [typeUser, setTypeUser] = useState('');
  const [complete_name, setComplete_name] = useState('');
  const [mensaje, setMensaje] = useState(null); //pop up de creacion de usuario
  const [mostrarPassword, setMostrarPassword] = useState(false);



  const handleCrearUsuario = async () => {
    try {
      const createdAt = new Date(); // Puedes ajustar cómo obtienes la fecha de creación
      const updatedAt = new Date(); // Puedes ajustar cómo obtienes la fecha de actualización

      const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/crear-usuario', {
               method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type_user: isChecked && typeUser !== 'Coordinador' ? typeUser + '1' : typeUser,
          email:email,
          session:'Inactivo',
          usuario: usuario,
          password:password,                    
          complete_name: complete_name,
      
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data); // Aquí puedes manejar la respuesta del servidor

        setMensaje({ tipo: 'exito', texto: 'Usuario creado exitosamente.' });
        // Limpiar los campos después de un éxito
        setUsuario('');
        setPassword('');
        setEmail('');
        setTypeUser('');
        setComplete_name('');

         return <><h1>{data}</h1></>;
      } else {
        console.error('Error al crear el usuario:', response.statusText);
        setMensaje({ tipo: 'error', texto: 'Error al crear el usuario.' });
      }
    } catch (error) {
      console.error('Error de red:', error.message);
      setMensaje({ tipo: 'error', texto: 'Error de red al intentar crear el usuario.' });
      return <><h1>{error.message}</h1></>;
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMensaje(null);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [mensaje]);

  const toggleMostrarPassword = () => {
    setMostrarPassword(!mostrarPassword);
  };  
  const handleUsuarioSeleccionado = (usuario) => {
    setUsuarioSeleccionado(usuario);
  };
  const handleUpdateUser = async () => {
    const userId = usuarioSeleccionado.id; // Reemplaza esto con el ID del usuario que deseas actualizar
    const updateUserEndpoint = `${process.env.NEXT_PUBLIC_BASE_DB}/actualizar-usuario/${userId}`;

    try {
      const response = await fetch(updateUserEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type_user: typeUser , // Reemplaza esto con los valores que deseas actualizar
          email: email,
          session: session,
          usuario: usuario,
          password: password,
          complete_name: complete_name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.mensaje); // Mensaje de éxito desde el servidor
      } else {
        console.error('Error al actualizar el usuario:', response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error.message);
    }
  };
  if (sesion){
  return (
    
    <Layout>
      <div className="flex items-center justify-between p-4">
      <h1 className="text-2xl font-bold font-serif">Listado de usuarios</h1>
      <BotonEnviar onClick={handleChangeCrear} className="bg-blue-500 text-white p-2 rounded-md">Agregar usuario</BotonEnviar>
      </div>
      <div className="flex h-screen">
    
      <div className="w-full max-w-md p-4 bg-white shadow-md rounded-md overflow-y-auto">
        
        {usuarioSeleccionado ? (
          <div>
            <h1 className="text-2x1 font-bold text-center mb-4">Modificar Usuario</h1>
            <p className="mb-2">{usuarioSeleccionado.complete_name}</p>
            <div className="mb-4">
    <label htmlFor="usuario" className="block text-sm font-medium text-gray-600">Usuario:</label>
    <input type="text" className="form-input mt-1 block w-full" id="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
  </div>
  <div className="mb-4">
    <label htmlFor="password" className="block text-sm font-medium text-gray-600">Password:</label>
    <div className="password-container">
      <input
        type={mostrarPassword ? 'text' : 'password'}
        className="form-input mt-1 block w-full"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <BotonMostrarPassword 
        className="ml-2 text-sm text-blue-500 focus:outline-none" 
        type="button" 
        onClick={toggleMostrarPassword}>
        {mostrarPassword ? 'Ocultar' : 'Mostrar'}
      </BotonMostrarPassword>
    </div>
  </div>
  <div className="mb-4">
    <label htmlFor="email" className="form-label">Email:</label>
    <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
  </div>
  <div className="mb-3">
    <label htmlFor="typeUser" className="form-label">Type User:</label>
    <select
      id="typeUser"
      className="form-select"
      value={typeUser}
      onChange={(e) => setTypeUser(e.target.value)}
    >
      <option value="">Seleccionar</option>
      <option value="Asesor">Asesor</option>
      <option value="Coordinador">Coordinador</option>
    </select>
  </div>
  <div className="mb-3">
    <label htmlFor="completeName" className="form-label">Complete Name:</label>
    <input type="text" className="form-control" id="completeName" value={complete_name} onChange={(e) => setComplete_name(e.target.value)} />
  </div>

  <input type="checkbox" checked={isChecked} onChange={handleChange} />
  <p>Permiso de agregar número</p>

  <BotonEnviar type="button" onClick={handleUpdateUser} className="w-full bg-blue-500 text-white p-2 rounded-md">
    Actualizar Usuario
  </BotonEnviar>
            {/* Agregar más detalles según sea necesario */}
          </div>
        ) : (
            <div>
            {mensaje && (
              <Mensaje tipo={mensaje.tipo}>
                {mensaje.texto}
              </Mensaje>
            )}
            <div className="flex">
            {showCrear && <form>
              <h1 className="text-2xl font-bold text-center mb-4">Crear Usuario</h1>
  {mensaje && (
    <Mensaje tipo={mensaje.tipo}>
      {mensaje.texto}
    </Mensaje>
  )}
  <div className="mb-5">
    <label htmlFor="usuario" className="form-label">Usuario:</label>
    <input type="text" className="form-control" id="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
  </div>
  <div className="mb-3">
    <label htmlFor="password" className="form-label">
      Password:
    </label>
    <div className="password-container">
      <input
        type={mostrarPassword ? 'text' : 'password'}
        className="form-control password-input"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <BotonMostrarPassword type="button" onClick={toggleMostrarPassword}>
        {mostrarPassword ? 'Ocultar' : 'Mostrar'}
      </BotonMostrarPassword>
    </div>
  </div>
  <div className="mb-3">
    <label htmlFor="email" className="form-label">Email:</label>
    <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
  </div>
  <div className="mb-3">
    <label htmlFor="typeUser" className="form-label">Type User:</label>
    <select
      id="typeUser"
      className="form-select"
      value={typeUser}
      onChange={(e) => setTypeUser(e.target.value)}
    >
      <option value="">Seleccionar</option>
      <option value="Asesor">Asesor</option>
      <option value="Coordinador">Coordinador</option>
    </select>
  </div>
  <div className="mb-3">
    <label htmlFor="completeName" className="form-label">Complete Name:</label>
    <input type="text" className="form-control" id="completeName" value={complete_name} onChange={(e) => setComplete_name(e.target.value)} />
  </div>

  <input type="checkbox" checked={isChecked} onChange={handleChange} />
  <p>Permiso de agregar número</p>
  
  <BotonEnviar type="button" onClick={handleCrearUsuario} className="w-full bg-green-500 text-white p-2 rounded-md">
    Crear Usuario
  </BotonEnviar>
  </form>}
      {/* Lista de usuarios */}
    <div styleclassName="max-h-screen overflow-y-auto">
      <ul>
      {!showCrear && <h2 className="text-2xl font-bold text-center mb-3">Modificar Usuarios</h2> && usuarios.map((usuario) => (
      <li key={usuario.id} className='mb-2 flex items-center justify-between'>
        <span className='mr-2'>{usuario.complete_name}</span>
        <button onClick={() => handleUsuarioSeleccionado(usuario)} className="bg-blue-500 text-white p-1 rounded-md">Modificar</button>
      </li>
    ))}
  </ul>
</div>
            </div>
          </div>
        )}
      </div>
    </div>
  </Layout>
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

const BotonMostrarPassword = styled.button`
  background-color: #3498db;
  color: white;
  padding: 8px;
  margin-left: 5px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #2980b9;
  }
`;

// Agregamos estilos para el input de contraseña
const Mensaje = styled.p`
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  color: ${({ tipo }) => (tipo === 'exito' ? 'green' : 'red')};
  background-color: ${({ tipo }) => (tipo === 'exito' ? '#d3f5e5' : '#f8d7da')};
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

// Agregamos estilos para el input de contraseña
const EstilosAdicionales = styled.style`
  /* Establecemos un ancho fijo para el input de contraseña */
  .password-input {
    width: 100%;
  }
`;
export default CrearUsuario;
