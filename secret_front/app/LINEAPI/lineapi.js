import axios from 'axios';

export const sendMessageToLine = async (message) => {
    const url = "http://127.0.0.1:3030/broadcast";
    //const messagesArray = JSON.parse(message);
    console.log("message",message)

    const send = message.map(item => ({
        text: item.name 
    }));
    console.log("send",send)

    const data = {
        message: `予算 : 1万円\n9:00\n12:00 昼飯\n15:00 京都駅`,
    };
    console.log('Broadcast message:', { messages: [{ type: 'text', text: message }] });

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
