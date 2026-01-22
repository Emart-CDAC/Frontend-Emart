
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        address: ''
    });
    const [message, setMessage] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = register(formData);
        if (result.success) {
            // In a real app we might auto-login or ask to verify email
            setMessage(result.message);
            setTimeout(() => navigate('/login'), 2000);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] py-12">
            <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-500">Join e-MART today</p>
                </div>

                {message ? (
                    <div className="text-center text-green-600 font-semibold p-4 bg-green-50 rounded-lg">
                        {message}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Full Name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Mobile Number"
                                name="mobile"
                                placeholder="9876543210"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <Input
                            label="Address"
                            name="address"
                            placeholder="Street, City, Zip"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />

                        <Button type="submit" className="w-full mt-4" size="lg">
                            Register
                        </Button>
                    </form>
                )}

                <p className="mt-8 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
