import React from 'react'
import axios from 'axios'
import { useEffect } from 'react'

const Logout = () => {
    useEffect(() => {
        const logout = async () =>{
            const response = await axios.get('http://localhost:3000/users/logout', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(response)
        }
    }, [])
    return (
    <div>
            
    </div>
  )
}

export default Logout
