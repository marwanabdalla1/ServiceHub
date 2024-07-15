import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import useAlert from "../hooks/useAlert";
import AlertCustomized from "./AlertCustomized";

const categories = [
    'Premium Upgrade',
    'Booking',
    'User Interface',
    'Customer Service',
    'Other'
];

const FeedbackForm: React.FC = () => {
    const [category, setCategory] = useState('');
    const [open, setOpen] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState('');
    const [title, setTitle] = useState('');
    const { account, token } = useAuth();
    const {alert, triggerAlert, closeAlert} = useAlert(5000);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSendFeedback = async () => {
        if (!title || !feedback || !category) {
            triggerAlert("Please fill all required fields", "", "error", 3000, "dialog", "center", "");
            return;
        }

        const feedbackData = {
            title: title,
            content: feedback,
            category: category,
            rating: Number(rating) // Convert rating to number if using a string input
        };

        try {
            const response = await axios.post(`/api/feedback/`, feedbackData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log(response);
            triggerAlert('Thanks for your feedback!', '', 'success', 3000, 'dialog', 'center', '');
            // Reset the form fields
            setOpen(false);
            setTitle('');
            setFeedback('');
            setRating('');
            setCategory('');
        } catch (error) {
            console.error('Error sending feedback:', error);
        }
    };

    return (
        <>
            <div>
                {/*<button onClick={handleAction}>Do Something</button>*/}
                <AlertCustomized alert={alert} closeAlert={closeAlert}/>
            </div>
            <Button variant="outlined" onClick={handleClickOpen} sx={{mt: 2}}>
                Provide Feedback
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Feedback on your experience</DialogTitle>
                <DialogContent>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <TextField
                            label="Title"
                            fullWidth
                            variant="outlined"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={category}
                                label="Category"
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categories.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Rating (1-5) (optional)"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            inputProps={{min: 1, max: 5}}
                        />
                        <TextField
                            id="feedback"
                            label="Your Feedback"
                            multiline
                            minRows={3}
                            fullWidth
                            variant="outlined"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSendFeedback}>Send Feedback</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default FeedbackForm;
