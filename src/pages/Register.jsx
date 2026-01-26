import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

const Register = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { register } = useAuth();

    const isOAuthUser = !!searchParams.get('email');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        address: ''
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');

    // Prefill OAuth data
    useEffect(() => {
        const nameFromOAuth = searchParams.get('name');
        const emailFromOAuth = searchParams.get('email');

        if (emailFromOAuth) {
            setFormData(prev => ({
                ...prev,
                name: nameFromOAuth || '',
                email: emailFromOAuth
            }));
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.includes('@')) newErrors.email = 'Invalid email address';
        if (!isOAuthUser && formData.password.length < 6)
            newErrors.password = 'Password must be at least 6 characters';
        if (!/^\d{10}$/.test(formData.mobile))
            newErrors.mobile = 'Mobile must be 10 digits';
        if (!formData.address.trim()) newErrors.address = 'Address is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!validate()) return;

        const payload = {
            fullName: formData.name,
            email: formData.email,
            password: formData.password,
            mobile: formData.mobile,
            address: {
                city: formData.address,
                town: formData.address, // Using city as town for now
                state: 'Maharashtra',
                country: 'India',
                pincode: '400001',
                houseNumber: 'N/A',
                landmark: 'N/A'
            }
        };

        const result = await register(payload);

        if (result?.success) {
            setMessage(result.message || 'Registration successful');
            setTimeout(() => navigate('/'), 2000);
        } else {
            setMessage(result?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] py-12 bg-gray-50">
            <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">Create Account</h1>
                    <p className="text-gray-500">Join e-MART today</p>
                </div>

                {message && (
                    <div className="mb-4 p-3 text-center bg-green-100 text-green-700 rounded">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        readOnly={isOAuthUser}
                        error={errors.name}
                    />

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        readOnly={isOAuthUser}
                        error={errors.email}
                    />

                    {!isOAuthUser && (
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                        />
                    )}

                    <Input
                        label="Mobile Number"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        error={errors.mobile}
                    />

                    <Input
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        error={errors.address}
                    />

                    <Button type="submit" className="w-full">
                        Create Account
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 font-semibold">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
