import React, { useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import BlackButton from '../components/inputs/blackbutton';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {

    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    useEffect(() => {
        console.log('isAdmin:', isAdmin);
        if (isAdmin()) {
            navigate('/admin');
        }
    }, [navigate]);

    const handleCategoryClick = (category: string) => {
        navigate('/filter', { state: { searchTerm: category } });
    };

    return (
        <div className='flex flex-col items-center justify-center mt-4'>
            <div className="w-3/4 flex flex-col rounded md:flex-row items-center bg-customGreen pl-8">
                <div className="text-left">
                    <h1 className="text-4xl font-bold mb-4">ServiceHub: Connecting You to the Best, for All Your
                        Needs!</h1>
                    <Link to="/filter"
                        style={{ textDecoration: 'none' }} // Remove underline from Link
                    >
                        <BlackButton
                            text="Get Started"
                            onClick={() => console.log('Black button pressed')}
                            sx={{
                                padding: '18px 18px', // Increase padding
                                fontSize: '16px', // Override font size
                            }}
                        />
                    </Link>
                </div>
                <div className="md:mt-0 mr-0">
                    <img src="/images/handshake.png" alt="Handshake" className="w-full" />
                </div>
            </div>

            <div className="w-1/2 text-center mt-12">
                <h2 className="text-3xl font-bold mb-6">Service Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { icon: 'fas fa-bicycle', label: 'Bike Repair' },
                        { icon: 'fas fa-truck-moving', label: 'Moving' },
                        { icon: 'fas fa-baby', label: 'Babysitting' },
                        { icon: 'fas fa-chalkboard-teacher', label: 'Tutoring' },
                        { icon: 'fas fa-paw', label: 'Petsitting' },
                        { icon: 'fas fa-seedling', label: 'Landscaping' },
                        { icon: 'fas fa-tools', label: 'Remodeling' },
                        { icon: 'fas fa-broom', label: 'Cleaning' }
                    ].map(service => (
                        <div key={service.label} className="flex flex-col items-center cursor-pointer"
                            onClick={() => handleCategoryClick(service.label)}>
                            <div className="bg-blue-200 p-4 rounded-full mb-2">
                                <i className={`${service.icon} text-2xl`}></i>
                            </div>
                            <span>{service.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );
}

export default HomePage;
