
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <Outlet />
            </main>
            <footer className="bg-gray-900 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-400">© 2026 e-MART. All rights reserved.</p>
                    <div className="mt-4 flex justify-center space-x-6">
                        <a href="#" className="text-gray-400 hover:text-white">About</a>
                        <a href="#" className="text-gray-400 hover:text-white">Partners</a>
                        <a href="#" className="text-gray-400 hover:text-white">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
