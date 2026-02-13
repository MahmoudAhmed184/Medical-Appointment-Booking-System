import { Container, Typography } from '@mui/material';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Sign In
            </Typography>
            <LoginForm />
        </Container>
    );
};

export default LoginPage;
