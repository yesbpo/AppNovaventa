import React from 'react';
import Sidebar from "./Sidebar";
import { useRouter } from 'next/router';
import { useSession,signIn, signOut } from 'next-auth/react';
const Layout = ({children}) => {
  const router = useRouter();
  const { data: session } = useSession()
  console.log("Session en Layout: " + session)
  if(!localStorage.getItem('token')){
    router.push('/auth/login');
  }
    return (
        <div className="h-screen flex">
           <Sidebar/>
           <div className="flex-1 overflow-y-auto">
           <nav className="bg-green p-4 flex justify-between">
  <select className=" bg-green mr-4 w-15">
    <option >Auxiliares</option>
    <option className='bg-green'>Break</option>
    <option className='bg-green'>En reunion</option>
  </select>
      
  <h1>Usuario: {localStorage.getItem('username')}</h1>
  <h1>Grupo</h1>
</nav>

             {children}
           </div>
        </div>
    )
  
  {/*return (
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
  
  )*/}

};

export default Layout;
