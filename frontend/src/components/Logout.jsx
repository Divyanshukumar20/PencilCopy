import React from 'react'
import axios from 'axios'
import { useEffect } from 'react'

const Logout = () => {
    useEffect(() => {
        const logout = async () =>{
            const response = await axios.post('/users/logout', {}, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(response.data.message)
        }
        logout().catch(()=>{});
    }, [])
    return (
    <div>
            
    </div>
  )
}

export default Logout
