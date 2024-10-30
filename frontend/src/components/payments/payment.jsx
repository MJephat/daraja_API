import React, { useState } from 'react'
import './payment.css'
import axios from "axios";

import simu from '../assests/smartphone.png'
import money from '../assests/money.png'

const Payment = () => {
    const [phone, setPhone] = useState("")
    const [amount, setAmount] = useState("")
    const [message, setMessage] = useState("")

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setMessage("Processing Payment....");
        try{
            const response = await axios.post("http://localhost:8080/stk",{
                phone,
                amount,
            });
            setMessage(`payment initiated: ${response.data}`);
        } catch (error){
            setMessage(`Error: ${error.response ? error.response.data : error.message}`);
        }
    };


  return (
    <form onSubmit={handleSubmit}>
    <div className='container'>
        <div className="header">
            <div className="text"> Pay Here</div>
            <div className="underline"></div>
        </div>
        <div className="inputs">
            <div className="input">
                <img src={simu} alt=''/>
                <input type='text' placeholder='Pnone Number'
                value={phone}
                onChange={(e)=> setPhone(e.target.value)} />
            </div>

            <div className="input">
            <img src={money} alt=''/>
                <input type='text' placeholder='Amount' 
                onChange={(e) =>setAmount(e.target.value)}
                value={amount}
                />
            </div>
            <div className="submit-container">
                <button className="submit" > click to pay </button>
                <button className="submit"> records </button>

            </div>

        </div>
      
    </div>
    </form>
  )
}

export default Payment
