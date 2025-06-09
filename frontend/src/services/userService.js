import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const getAllUsers = async () => {
    const config = {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    };
    const response = await axios.get(`${API_BASE_URL}/api/users`, config);
    return response.data;
};

const userService = {
    getAllUsers,
   
};

export default userService;