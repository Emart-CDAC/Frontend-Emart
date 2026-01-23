import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";


import { login as googleLogin } from "../services/authService";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { login: authLogin } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const urlError = searchParams.get('error');
        if (urlError) {
            setError(urlError);
        }
    }, [searchParams]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const result = await authLogin(email, password);

        if (result?.success) {
            navigate("/");
        } else {
            setError(result?.message || "Login failed");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">


                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-500">
                        Sign in to your e-MART account
                    </p>
                </div>


                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" size="lg">
                        Sign In
                    </Button>
                </form>


                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-4 text-sm text-gray-400">OR</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                </div>


                <button
                    onClick={googleLogin}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 48 48"
                    >
                        <path
                            fill="#FFC107"
                            d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.8l5.7-5.7C33.4 6.3 28.9 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
                        />
                        <path
                            fill="#FF3D00"
                            d="M6.3 14.7l6.6 4.8C14.6 16.1 19 13 24 13c2.8 0 5.3 1 7.2 2.8l5.7-5.7C33.4 6.3 28.9 4 24 4 16.1 4 9.3 8.6 6.3 14.7z"
                        />
                        <path
                            fill="#4CAF50"
                            d="M24 44c4.9 0 9.4-1.9 12.8-5.1l-5.9-4.9c-1.7 1.3-3.9 2-6.9 2-5.2 0-9.6-3.5-11.1-8.3l-6.6 5.1C9.3 39.4 16.1 44 24 44z"
                        />
                        <path
                            fill="#1976D2"
                            d="M43.6 20.5H42V20H24v8h11.3c-1 2.6-3 4.8-5.6 6.3l5.9 4.9C38.7 36.3 44 31 44 24c0-1.3-.1-2.5-.4-3.5z"
                        />
                    </svg>
                    <span className="font-medium text-gray-700">
                        Sign in with Google
                    </span>
                </button>


                <p className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="font-semibold text-blue-600 hover:text-blue-500"
                    >
                        Sign up
                    </Link>
                </p>


                <div className="mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
                    <p>Demo Credentials:</p>
                    <p>User: john@example.com / password</p>
                    <p>Cardholder: alice@example.com / password</p>
                    <p>Admin: admin@emart.com / admin</p>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setEmail('admin@emart.com');
                            setPassword('admin');
                        }}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-full px-4 py-2 hover:bg-blue-50 transition-colors"
                    >
                        Demo: Fill Admin Credentials
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Login;
