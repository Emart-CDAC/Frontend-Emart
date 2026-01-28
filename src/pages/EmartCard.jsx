import React, { useState, useEffect } from 'react';
import { getEmartCardDetails, applyForEmartCard } from '../services/emartCardService';
import { getUserProfile } from '../services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { CreditCard, CheckCircle, X, ShieldCheck, TrendingUp, Briefcase, GraduationCap, Landmark, Calendar, Heart } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';

const EmartCard = () => {
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [formData, setFormData] = useState({
        annualIncome: '',
        panCard: '',
        bankDetails: '',
        occupation: '',
        educationQualification: '',
        birthDate: '',
        interests: ''
    });

    const { user, refreshUser } = useAuth();
    const ePoints = userProfile?.epoints ?? 0;
    // const isEligible = ePoints >= 100; // Requirement changed: No eligibility check needed

    const fetchData = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            // Fetch profile and card details in parallel
            const [profileData, cardData] = await Promise.all([
                getUserProfile(user.id),
                getEmartCardDetails(user.id).catch(() => null)
            ]);

            setUserProfile(profileData);
            setCard(cardData);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Unable to fetch data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleApply = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await applyForEmartCard({
                ...formData,
                userId: user.id,
                annualIncome: parseFloat(formData.annualIncome)
            });

            // Refresh global user state to update Navbar member status/points
            if (user?.id) {
                await refreshUser(user.id);
            }

            setShowModal(false);
            fetchData(); // Refresh local UI
        } catch (err) {
            alert(err.response?.data?.message || "Failed to apply for card. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full text-center mb-12"
            >
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                    Your <span className="text-blue-600">e-MART</span> Premium Card
                </h1>
                <p className="mt-4 text-xl text-gray-500">
                    Exclusive benefits and rewards just for you.
                </p>
            </motion.div>

            {error && (
                <div className="max-w-lg w-full mb-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-center">
                    {error}
                </div>
            )}

            {card ? (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full max-w-md h-64 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 rounded-2xl shadow-2xl p-8 text-white overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>

                    <div className="relative flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-xs uppercase tracking-widest opacity-60">e-MART Card</span>
                                <span className="text-xl font-bold tracking-wider">PREMIUM</span>
                            </div>
                            <div className="h-10 w-10 bg-yellow-400 rounded-md opacity-80 flex items-center justify-center">
                                <span className="text-black font-extrabold text-xl">e</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm opacity-60">Card Holder</p>
                            <p className="text-2xl font-semibold tracking-tight uppercase">{card.fullName}</p>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase opacity-40">Valid From</p>
                                <p className="text-sm font-medium">{card.purchaseDate}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] uppercase opacity-40">Expires</p>
                                <p className="text-sm font-medium">{card.expiryDate}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] uppercase opacity-40">Status</p>
                                <p className={`text-sm font-bold ${card.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>
                                    {card.status}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Gloss effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
                </motion.div>
            ) : (
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-lg w-full">
                    <div className="mb-6 flex justify-center">
                        <div className="p-4 bg-blue-50 rounded-full">
                            <CreditCard className="w-12 h-12 text-blue-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Your Premium Card</h2>
                    <p className="text-gray-500 mb-8">
                        Unlock exclusive discounts, priority delivery, and double rewards.
                    </p>

                    {/* Eligibility Check Removed - All users can apply */}

                    <Button
                        className="w-full py-4 text-lg"
                        onClick={() => setShowModal(true)}
                    >
                        Apply for Card & Get 100 Points
                    </Button>
                </div>
            )}

            {/* Application Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        ></motion.div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
                        >
                            <div className="p-6 sm:p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">Card Application</h3>
                                        <p className="text-sm text-gray-500">Please provide the following details for your premium card.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition"
                                    >
                                        <X className="w-6 h-6 text-gray-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleApply} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            label="Annual Income (₹)"
                                            type="number"
                                            name="annualIncome"
                                            placeholder="e.g. 500000"
                                            value={formData.annualIncome}
                                            onChange={handleInputChange}
                                            required
                                            icon={<TrendingUp className="w-4 h-4" />}
                                        />
                                        <Input
                                            label="PAN Card Number"
                                            type="text"
                                            name="panCard"
                                            placeholder="ABCDE1234F"
                                            value={formData.panCard}
                                            onChange={handleInputChange}
                                            required
                                            icon={<ShieldCheck className="w-4 h-4" />}
                                        />
                                    </div>

                                    <Input
                                        label="Bank Details (A/C & IFSC)"
                                        type="text"
                                        name="bankDetails"
                                        placeholder="Account Number, Bank Name, IFSC"
                                        value={formData.bankDetails}
                                        onChange={handleInputChange}
                                        required
                                        icon={<Landmark className="w-4 h-4" />}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            label="Occupation"
                                            type="text"
                                            name="occupation"
                                            placeholder="e.g. Software Engineer"
                                            value={formData.occupation}
                                            onChange={handleInputChange}
                                            required
                                            icon={<Briefcase className="w-4 h-4" />}
                                        />
                                        <Input
                                            label="Education Qualification"
                                            type="text"
                                            name="educationQualification"
                                            placeholder="e.g. Bachelor of Engineering"
                                            value={formData.educationQualification}
                                            onChange={handleInputChange}
                                            required
                                            icon={<GraduationCap className="w-4 h-4" />}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            label="Birth Date (Optional)"
                                            type="date"
                                            name="birthDate"
                                            value={formData.birthDate}
                                            onChange={handleInputChange}
                                            icon={<Calendar className="w-4 h-4" />}
                                        />
                                        <Input
                                            label="Interests (Optional)"
                                            type="text"
                                            name="interests"
                                            placeholder="e.g. Tech, Fashion"
                                            value={formData.interests}
                                            onChange={handleInputChange}
                                            icon={<Heart className="w-4 h-4" />}
                                        />
                                    </div>

                                    <div className="pt-6 flex gap-3">
                                        <Button
                                            variant="ghost"
                                            className="flex-1"
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            type="submit"
                                            loading={submitting}
                                        >
                                            Submit Application
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-2">Exclusive Discounts</h3>
                    <p className="text-sm text-gray-600">Get up to 15% off on selected items across all categories.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-2">Priority Delivery</h3>
                    <p className="text-sm text-gray-600">Your orders are prioritized and delivered within 24 hours.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-2">E-Points Rewards</h3>
                    <p className="text-sm text-gray-600">Earn 1% e-points on every purchase made with your card.</p>
                </div>
            </div>
        </div>
    );
};

export default EmartCard;
