import axios from 'axios';

export const sendMessageToLine = async (message) => {
    const url = "http://localhost:3030/broadcast";

    const data = {
        message: message
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};
