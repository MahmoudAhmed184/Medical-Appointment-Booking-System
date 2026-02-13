import { Container, Typography } from '@mui/material';
import RegisterForm from '../components/RegisterForm';

const RegisterPage = () => {
    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Create Account
            </Typography>
            <RegisterForm />
        </Container>
    );
};

export default RegisterPage;
