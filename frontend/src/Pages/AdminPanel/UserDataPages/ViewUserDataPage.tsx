import React, {useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import './ViewUserData.css';

interface Account {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    createdOn?: Date;
    description?: string;
    location?: string;
    postal?: string;
    country?: string;
    isProvider?: boolean;
    isPremium?: boolean;
    isAdmin?: boolean;
    rating?: number;
    reviewCount?: number;
}

interface Props {
    user: Account;
}

export default function ViewUserData(): React.ReactElement {
    const [editMode, setEditMode] = useState(false);
    const location = useLocation();
    const editedAccount: Account = location.state?.account || {} as Account;
    const navigate = useNavigate();

    const handleEdit = () => {
        if (editMode) {
            // Handle saving the edited user data
            console.log('Save user data:', editedAccount);
        }
        setEditMode(!editMode);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        // This should be updated to actually update the editedAccount state
        // setEditedAccount({ ...editedAccount, [name]: value });
    };

    if (!editedAccount._id) {
        return <div>No user data available</div>;
    }

    return (
        <div className="container">
            <div className="sidebar">
                <button onClick={() => navigate('/admin/viewUserData', {state: {editedAccount}})}>User Details</button>
                <button onClick={() => navigate('/serviceOfferings')}>Service Offerings</button>
                <button onClick={() => navigate('/requestHistory')}>Request History</button>
                <button onClick={() => navigate('/jobHistory')}>Job History</button>
            </div>
            <div className="content">
                <h2>User Details</h2>
                <button onClick={handleEdit} className="edit-button">{editMode ? 'Save' : 'Edit'}</button>
                {editMode ? (
                    <div className="form">
                        <label>
                            First Name:
                            <input type="text" name="firstName" value={editedAccount.firstName || ''}
                                   onChange={handleChange}/>
                        </label>
                        <label>
                            Last Name:
                            <input type="text" name="lastName" value={editedAccount.lastName || ''}
                                   onChange={handleChange}/>
                        </label>
                        <label>
                            Email:
                            <input type="email" name="email" value={editedAccount.email || ''} onChange={handleChange}/>
                        </label>
                        <label>
                            Phone Number:
                            <input type="tel" name="phoneNumber" value={editedAccount.phoneNumber || ''}
                                   onChange={handleChange}/>
                        </label>
                        <label>
                            Description:
                            <input type="text" name="location" value={editedAccount.location || ''}
                                   onChange={handleChange}/>
                        </label>
                        <label>
                            Address:
                            <input type="text" name="address" value={editedAccount.address || ''}
                                   onChange={handleChange}/>
                        </label>
                        <label>
                            Location:
                            <input type="text" name="location" value={editedAccount.location || ''}
                                   onChange={handleChange}/>
                        </label>
                        <label>
                            Postal:
                            <input type="text" name="postal" value={editedAccount.postal || ''}
                                   onChange={handleChange}/>
                        </label>
                        <label>
                            Country:
                            <input type="text" name="country" value={editedAccount.country || ''}
                                   onChange={handleChange}/>
                        </label>
                    </div>
                ) : (
                    // Inside the return statement of the ViewUserData component

                    <div className="details">
                        <p><strong>First Name:</strong> {editedAccount.firstName || 'N/A'}</p>
                        <p><strong>Last Name:</strong> {editedAccount.lastName || 'N/A'}</p>
                        <p><strong>Email:</strong> {editedAccount.email || 'N/A'}</p>
                        <p><strong>Phone Number:</strong> {editedAccount.phoneNumber || 'N/A'}</p>
                        <p><strong>Description:</strong> {editedAccount.description || 'N/A'}</p>
                        <p><strong>Address:</strong> {editedAccount.address || 'N/A'}</p>
                        <p><strong>Location:</strong> {editedAccount.location || 'N/A'}</p>
                        <p><strong>Postal:</strong> {editedAccount.postal || 'N/A'}</p>
                        <p><strong>Country:</strong> {editedAccount.country || 'N/A'}</p>
                        <p><strong>Created
                            On:</strong> {editedAccount.createdOn ? new Date(editedAccount.createdOn).toLocaleDateString() : 'N/A'}
                        </p>


                    </div>
                )}
            </div>
        </div>
    );
}
