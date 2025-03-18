import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryPage = () => {
    const navigate = useNavigate();

    const [error, setError] = useState('');


    return (
        // <Container component="main" maxWidth="xs">
        //     <Box
        //         sx={{
        //             marginTop: 8,
        //             display: 'flex',
        //             flexDirection: 'column',
        //             alignItems: 'center',
        //         }}
        //     >
                
        //     </Box>
        // </Container>
        <p>This is category</p>
    );
};

export default CategoryPage;