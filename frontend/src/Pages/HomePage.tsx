import React, {useEffect} from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import BlackButton from '../components/inputs/blackbutton';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from "../contexts/AuthContext";

const HomePage = () => {

    const navigate = useNavigate();
    const {isAdmin} = useAuth();

    useEffect(() => {
        console.log('isAdmin:', isAdmin);
        if (isAdmin()) {
            navigate('/admin');
        }
    }, [navigate]);


    return (
        <div className='flex flex-col items-center justify-center mt-4'>
            <div className="w-3/4 flex flex-col rounded md:flex-row items-center bg-customGreen pl-8">
                <div className="text-left">
                    <h1 className="text-4xl font-bold mb-4">ServiceHub: Connecting You to the Best, for All Your
                        Needs!</h1>
                    <Link to="/filter">
                        <BlackButton className="py-2" text="Get Started"
                                     onClick={() => console.log('Black button pressed')}/>
                    </Link>
                </div>
                <div className="md:mt-0 mr-0">
                    <img src="/images/handshake.png" alt="Handshake" className="w-full"/>
                </div>
            </div>

            <div className="w-1/2 text-center mt-12">
                <h2 className="text-3xl font-bold mb-6">Service Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex flex-col items-center">
                        <div className="bg-blue-200 p-4 rounded-full mb-2">
                            <i className="fas fa-bicycle text-2xl"></i>
                        </div>
                        <span>Bike Repair</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-blue-200 p-4 rounded-full mb-2">
                            <i className="fas fa-truck-moving text-2xl"></i>
                        </div>
                        <span>Moving</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-blue-200 p-4 rounded-full mb-2">
                            <i className="fas fa-baby text-2xl"></i>
                        </div>
                        <span>Babysitting</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-blue-200 p-4 rounded-full mb-2">
                            <i className="fas fa-chalkboard-teacher text-2xl"></i>
                        </div>
                        <span>Tutoring</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-blue-200 p-4 rounded-full mb-2">
                            <i className="fas fa-paw text-2xl"></i>
                        </div>
                        <span>Petsitting</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-blue-200 p-4 rounded-full mb-2">
                            <i className="fas fa-seedling text-2xl"></i>
                        </div>
                        <span>Landscaping</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-blue-200 p-4 rounded-full mb-2">
                            <i className="fas fa-tools text-2xl"></i>
                        </div>
                        <span>Remodeling</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-blue-200 p-4 rounded-full mb-2">
                            <i className="fas fa-broom text-2xl"></i>
                        </div>
                        <span>Cleaning</span>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default HomePage;
