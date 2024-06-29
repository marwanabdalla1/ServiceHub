import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, MenuItem, Select, FormControl, InputLabel, TextareaAutosize } from '@mui/material';
import {useAuth} from "../contexts/AuthContext";
import axios from "axios";

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
    const {account, token} = useAuth()

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSendFeedback = async () => {
        if (!feedback || !category) {
            alert("Please fill all required fields");
            return;
        }

        const feedbackData = {
            content: feedback,
            category: category,
            rating: Number(rating) // Convert rating to number if using a string input
        };

        try {
            const response = await axios.post(`/api/feedback/`, feedbackData,{
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log(response);
            alert(`Thanks for your feedback!`);
            // Reset the form fields
            setOpen(false);
            setFeedback('');
            setRating('');
            setCategory('');
        } catch (error) {
            console.error('Error fetching review:', error);
        }


    };

    return (
        <>
            <Button variant="outlined" onClick={handleClickOpen} sx={{ mt: 2 }}>
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                            inputProps={{ min: 1, max: 5 }}
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
