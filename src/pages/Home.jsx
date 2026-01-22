
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';

const Home = () => {
    // Simulate "New Arrivals" using the first few products
    const newArrivals = PRODUCTS.slice(0, 4);

    return (
        <div className="space-y-12">

            {/* Hero Section */}
            <section className="relative rounded-2xl overflow-hidden bg-gray-900 text-white shadow-2xl">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80"
                        alt="Shopping Banner"
                        className="w-full h-full object-cover opacity-40"
                    />
                </div>
                <div className="relative z-10 p-12 md:p-20 flex flex-col items-start justify-center min-h-[500px]">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
                        Experience the <br /> <span className="text-blue-400">Future of Shopping</span>
                    </h1>
                    <p className="text-xl text-gray-200 mb-8 max-w-lg">
                        Exclusive deals for e-MART members. Join today and start saving with our unique point redemption system.
                    </p>
                    <Link to="/register">
                        <Button variant="primary" size="lg" className="rounded-full px-8 bg-blue-600 hover:bg-blue-500 border-none">
                            Get Your e-MART Card
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Categories */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {CATEGORIES.map((cat) => (
                        <Link key={cat.id} to={`/catalog?category=${cat.id}`} className="group">
                            <div className="relative rounded-xl overflow-hidden aspect-square mb-3 shadow-md">
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white text-xl font-bold">{cat.name}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* New Arrivals */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
                    <Link to="/category/1" className="text-blue-600 font-medium hover:underline flex items-center">
                        View All <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {newArrivals.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* Loyalty Banner */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-xl">
                <div className="mb-6 md:mb-0">
                    <h2 className="text-3xl font-bold mb-3">e-MART Loyalty Program</h2>
                    <p className="text-blue-100 max-w-xl">
                        Earn points on every purchase! 10% of your bill value is credited back as e-Points. Redeem them for exclusive products.
                    </p>
                </div>
                <Button variant="secondary" size="lg" className="bg-white text-blue-700 hover:bg-gray-100 border-none shrink-0">
                    Check My Points
                </Button>
            </section>

        </div>
    );
};

export default Home;
