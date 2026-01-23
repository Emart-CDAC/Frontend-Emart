
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
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.includes('@')) newErrors.email = "Invalid email address";
        if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile must be 10 digits";
        if (!formData.address.trim()) newErrors.address = "Address is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const result = register(formData);
        if (result.success) {
            setMessage(result.message);
            setTimeout(() => navigate('/login'), 2000);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] py-12 bg-gray-50">
            <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-500">Join e-MART today for exclusive deals</p>
                </div>

                {message ? (
                    <div className="text-center p-8 bg-green-50 rounded-xl border border-green-100">
                        <div className="text-green-600 font-bold text-xl mb-2">Success!</div>
                        <p className="text-gray-600">{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Input
                                label="Full Name"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                error={errors.name}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                        </div>
                        <div>
                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                            </div>
                            <div>
                                <Input
                                    label="Mobile Number"
                                    name="mobile"
                                    placeholder="9876543210"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    error={errors.mobile}
                                />
                                {errors.mobile && <p className="text-red-500 text-xs mt-1 ml-1">{errors.mobile}</p>}
                            </div>
                        </div>
                        <div>
                            <Input
                                label="Address"
                                name="address"
                                placeholder="Street, City, Zip"
                                value={formData.address}
                                onChange={handleChange}
                                error={errors.address}
                            />
                            {errors.address && <p className="text-red-500 text-xs mt-1 ml-1">{errors.address}</p>}
                        </div>

                        <Button type="submit" className="w-full mt-6" size="lg">
                            Create Account
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
