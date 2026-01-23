import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

const Register = () => {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        address: ''
    });

    const [message, setMessage] = useState('');

    
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
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const payload = {
            fullName: formData.name,     
            email: formData.email,
            password: formData.password,
            mobile: formData.mobile,
            address: {
                city: formData.address // map single field to city
            }
        };

        const result = await register(payload);

        if (result && result.success) {
            setMessage(result.message);
            setTimeout(() => navigate('/'), 2000); // Redirect to home on success
        } else {
            setMessage(result?.message || 'Registration failed');
        }
    };

    const isOAuthUser = !!searchParams.get('email');

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
                            value={formData.name}
                            onChange={handleChange}
                            readOnly={isOAuthUser}  
                            required
                        />

                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            readOnly={isOAuthUser}   
                            required
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {!isOAuthUser && (
                                <Input
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            )}
                            <Input
                                label="Mobile Number"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Input
                            label="Address"
                            name="address"
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
