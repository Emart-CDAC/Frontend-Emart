import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { User, MapPin, Mail, Phone, Lock, Home } from 'lucide-react'; // Assuming you have lucide-react or similar icons, if not I will stick to text labels or use heroicons classes if available? 
// I'll stick to simple labels to avoid dependency issues if lucide isn't installed, but I'll add icons if possible using standard text/emoji or avoid them. 
// Actually, I'll assume standard components Input/Button are good.

const Register = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { register } = useAuth();

    // Check query params for OAuth flow
    const emailParam = searchParams.get('email');
    const nameParam = searchParams.get('name');
    const isOAuthParam = searchParams.get('isOAuth') === 'true';
    
    // It's an OAuth user if email is present OR explicitly flagged
    const isOAuthUser = !!emailParam || isOAuthParam;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        houseNumber: '',
        town: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        landmark: ''
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Prefill OAuth data
    useEffect(() => {
        if (emailParam) {
            setFormData(prev => ({
                ...prev,
                name: nameParam || '',
                email: emailParam
            }));
        }
    }, [emailParam, nameParam]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        // Clear error field
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Full Name is required';
        if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
        if (!isOAuthUser && formData.password.length < 6)
            newErrors.password = 'Password must be at least 6 characters';
        if (!/^\d{10}$/.test(formData.mobile))
            newErrors.mobile = 'Mobile number must be 10 digits';
        
        // Address Validations
        if (!formData.houseNumber.trim()) newErrors.houseNumber = 'House No. is required';
        if (!formData.town.trim()) newErrors.town = 'Town is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Valid 6-digit Pincode required';
        if (!formData.landmark.trim()) newErrors.landmark = 'Landmark is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        
        if (!validate()) return;
        setIsLoading(true);

        const payload = {
            fullName: formData.name,
            email: formData.email,
            password: isOAuthUser ? '' : formData.password, // Empty password for OAuth
            mobile: formData.mobile,
            authProvider: isOAuthUser ? 'GOOGLE' : 'LOCAL',
            address: {
                houseNumber: formData.houseNumber,
                town: formData.town,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                pincode: formData.pincode,
                landmark: formData.landmark
            }
        };

        const result = await register(payload);

        if (result?.success) {
            setMessage(result.message || 'Registration successful');
            // Check if context auto-logged in (via token existence in storage)
            // But relying on result.message containing "logged in" is flaky.
            // Best is to assume if success, we go home.
            setTimeout(() => {
                navigate('/'); 
            }, 1000);
        } else {
            setMessage(result?.message || 'Registration failed');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-5xl w-full space-y-8 bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-gray-100">
                
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        {isOAuthUser ? 'Complete Your Profile' : 'Create an Account'}
                    </h2>
                    <p className="mt-2 text-lg text-gray-600">
                        {isOAuthUser 
                            ? 'Please provide your address details to complete registration.' 
                            : 'Join e-MART for the best shopping experience.'}
                    </p>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg text-center font-medium ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                    </div>
                )}

                <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Left Column: Personal Info */}
                        <div className="space-y-6">
                            <div className="border-b pb-2 mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                    Personal Details
                                </h3>
                            </div>

                            <Input
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                readOnly={isOAuthUser}
                                error={errors.name}
                                placeholder="John Doe"
                                className={isOAuthUser ? 'bg-gray-100' : ''}
                            />

                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                readOnly={isOAuthUser}
                                error={errors.email}
                                placeholder="john@example.com"
                                className={isOAuthUser ? 'bg-gray-100' : ''}
                            />

                            {!isOAuthUser && (
                                <Input
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    placeholder="••••••••"
                                />
                            )}

                            <Input
                                label="Mobile Number"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                error={errors.mobile}
                                placeholder="9876543210"
                            />
                        </div>

                        {/* Right Column: Address Info */}
                        <div className="space-y-6">
                            <div className="border-b pb-2 mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                    Address Details
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="House / Flat No."
                                    name="houseNumber"
                                    value={formData.houseNumber}
                                    onChange={handleChange}
                                    error={errors.houseNumber}
                                    placeholder="A-101"
                                />
                                <Input
                                    label="Landmark"
                                    name="landmark"
                                    value={formData.landmark}
                                    onChange={handleChange}
                                    error={errors.landmark}
                                    placeholder="Near Park"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Town / Locality"
                                    name="town"
                                    value={formData.town}
                                    onChange={handleChange}
                                    error={errors.town}
                                    placeholder="Andheri West"
                                />
                                <Input
                                    label="City"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    error={errors.city}
                                    placeholder="Mumbai"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="State"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    error={errors.state}
                                    placeholder="Maharashtra"
                                />
                                <Input
                                    label="Pincode"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    error={errors.pincode}
                                    placeholder="400053"
                                />
                            </div>

                            <Input
                                label="Country"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                error={errors.country}
                                placeholder="India"
                                disabled={true} // Default to India
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <Button 
                            type="submit" 
                            className="w-full py-4 text-lg font-bold shadow-lg transform transition hover:scale-[1.01]"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : (isOAuthUser ? 'Complete Registration' : 'Create Account')}
                        </Button>
                    </div>

                    {!isOAuthUser && (
                        <p className="mt-4 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Log in
                            </Link>
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Register;
