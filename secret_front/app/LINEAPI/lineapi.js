import axios from 'axios';
import line from './line.json'

export const sendMessageToLine = async (message) => {
    const url = "http://127.0.0.1:3030/broadcast";
    //const messagesArray = JSON.parse(message);
    
    const data = line

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};
