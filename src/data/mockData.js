
export const CATEGORIES = [
    {
        id: 1,
        name: 'Electronics',
        image: 'https://images.unsplash.com/photo-1498049381961-a59a96bcb742?w=500&auto=format&fit=crop&q=60',
        subcategories: [
            { id: 11, name: 'Smartphones' },
            { id: 12, name: 'Laptops' },
            { id: 13, name: 'Tablets' },
            { id: 14, name: 'Accessories' }
        ]
    },
    {
        id: 2,
        name: 'Appliances',
        image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500&auto=format&fit=crop&q=60',
        subcategories: [
            { id: 21, name: 'Refrigerators' },
            { id: 22, name: 'Washing Machines' },
            { id: 23, name: 'Microwaves' },
            { id: 24, name: 'Air Conditioners' }
        ]
    },
    {
        id: 3,
        name: 'Home Furnishing',
        image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=500&auto=format&fit=crop&q=60',
        subcategories: [
            { id: 31, name: 'Furniture' },
            { id: 32, name: 'Decor' },
            { id: 33, name: 'Lighting' }
        ]
    },
    {
        id: 4,
        name: 'Books',
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&auto=format&fit=crop&q=60',
        subcategories: [
            { id: 41, name: 'Fiction' },
            { id: 42, name: 'Non-Fiction' },
            { id: 43, name: 'Comics' }
        ]
    },
    {
        id: 5,
        name: 'Cameras',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60',
        subcategories: [
            { id: 51, name: 'DSLR' },
            { id: 52, name: 'Mirrorless' },
            { id: 53, name: 'Action Cameras' },
            { id: 54, name: 'Lenses' }
        ]
    },
];

export const PRODUCTS = [
    {
        id: 101,
        name: 'Sony Alpha a7 III',
        categoryId: 5,
        subcategoryId: 52,
        brand: 'Sony',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60',
        description: 'Full-frame Mirrorless Interchangeable-Lens Camera.',
        price: {
            normal: 2000,
            cardHolder: 1800,
        },
        pointsRedemption: {
            points: 2000,
            cashComponent: 1500
        },
        rating: 4.8
    },
    {
        id: 102,
        name: 'Canon EOS R5',
        categoryId: 5,
        subcategoryId: 52,
        brand: 'Canon',
        image: 'https://images.unsplash.com/photo-1519638831568-d9897f54ed69?w=500&auto=format&fit=crop&q=60',
        description: 'Professional Mirrorless Camera.',
        price: {
            normal: 3800,
            cardHolder: 3500,
        },
        rating: 4.9
    },
    {
        id: 103,
        name: 'Nikon D3500',
        categoryId: 5,
        subcategoryId: 51,
        brand: 'Nikon',
        image: 'https://images.unsplash.com/photo-1517260739330-366579344449?w=500&auto=format&fit=crop&q=60',
        description: 'Beginner DSLR Camera.',
        price: {
            normal: 500,
            cardHolder: 450,
        },
        rating: 4.5
    },
    {
        id: 201,
        name: 'Smart LED TV 55"',
        categoryId: 1,
        subcategoryId: 14, // Roughly mapping or need new subcat
        brand: 'Samsung',
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop&q=60',
        description: '4K Ultra HD Smart LED TV.',
        price: {
            normal: 600,
            cardHolder: 550,
        },
        pointsRedemption: {
            points: 5000,
            cashComponent: 100
        },
        rating: 4.5
    },
    {
        id: 202,
        name: 'Bluetooth Speaker',
        categoryId: 1,
        subcategoryId: 14,
        brand: 'JBL',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60',
        description: 'Portable waterproof speaker.',
        price: {
            normal: 120,
            cardHolder: 100,
        },
        rating: 4.6
    },
    {
        id: 203,
        name: 'MacBook Air M2',
        categoryId: 1,
        subcategoryId: 12,
        brand: 'Apple',
        image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&auto=format&fit=crop&q=60',
        description: 'Supercharged by M2.',
        price: {
            normal: 1199,
            cardHolder: 1099
        },
        rating: 4.9
    }
];

export const STORES = [
    { id: 1, name: 'e-MART Downtown', city: 'Metropolis', state: 'NY', zip: '10001', address: '123 Main St' },
    { id: 2, name: 'e-MART Suburbia', city: 'Smallville', state: 'KS', zip: '66002', address: '456 Cornfield Rd' },
    { id: 3, name: 'e-MART CyberCity', city: 'NightCity', state: 'CA', zip: '90001', address: '789 Neon Blvd' },
];

export const USERS = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        type: 'MEMBER', // or 'GUEST', 'CARDHOLDER'
        points: 0,
        address: '100 Member Way',
    },
    {
        id: 2,
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'password',
        type: 'CARDHOLDER',
        points: 500, // Starting points
        address: '200 Cardholder Ln',
        cardNumber: 'EMART-1002-3004'
    },
    {
        id: 3,
        name: 'Admin User',
        email: 'admin@emart.com',
        password: 'admin',
        type: 'ADMIN',
        points: 0,
        address: 'HQ'
    }
];
