import {useEffect, useState} from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button
} from '@mui/material';

interface AddressDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (address: { address: string; postal: string; city: string; country: string }) => void;
    initialAddress: { address: string; postal: string; city: string; country: string };
}

const AddressDialog: React.FC<AddressDialogProps> = ({ open, onClose, onSave, initialAddress }) => {
    const [addressFields, setAddressFields] = useState({
        address: '',
        postal: '',
        city: '',
        country: ''
    });

    useEffect(() => {
        if (open) {
            setAddressFields(initialAddress);
        }
    }, [open, initialAddress]);

    const handleAddressFieldChange = (field: string, value: string) => {
        setAddressFields(prevState => ({ ...prevState, [field]: value }));
    };

    const handleSave = () => {
        onSave(addressFields);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogContent>
                <TextField
                    margin="normal"
                    label="Address"
                    fullWidth
                    value={addressFields.address}
                    onChange={(e) => handleAddressFieldChange('address', e.target.value)}
                    autoComplete="street-address"
                />
                <TextField
                    margin="normal"
                    label="Postal Code"
                    fullWidth
                    value={addressFields.postal}
                    onChange={(e) => handleAddressFieldChange('postal', e.target.value)}
                    autoComplete="postal-code"
                />
                <TextField
                    margin="normal"
                    label="City"
                    fullWidth
                    value={addressFields.city}
                    onChange={(e) => handleAddressFieldChange('city', e.target.value)}
                    autoComplete="address-level2"
                />
                <TextField
                    margin="normal"
                    label="Country"
                    fullWidth
                    value={addressFields.country}
                    onChange={(e) => handleAddressFieldChange('country', e.target.value)}
                    autoComplete="country"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddressDialog;