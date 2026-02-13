import { Outlet } from 'react-router-dom';

/**
 * MainLayout — used for public pages (Login, Register).
 * TODO: Implement with Navbar, content area, and Footer
 */
const MainLayout = () => {
    return <Outlet />;
};

export default MainLayout;
