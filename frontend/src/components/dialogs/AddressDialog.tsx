import {useEffect, useState} from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button
} from '@mui/material';
import {isValidPostalCode} from "../../validators/AccountDataValidator";
import {toast} from "react-toastify";
import {GERMAN_CITIES_SUPPORT} from "../../shared/Constants";
import { Autocomplete } from '@mui/material';

interface AddressDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (address: { address: string; postal: string; city: string }) => void;
    initialAddress: { address: string; postal: string; city: string };
}

const AddressDialog: React.FC<AddressDialogProps> = ({open, onClose, onSave, initialAddress}) => {
    const [addressFields, setAddressFields] = useState({
        address: '',
        postal: '',
        city: '',
    });

    useEffect(() => {
        if (open) {
            setAddressFields(initialAddress);
        }
    }, [open, initialAddress]);

    const handleAddressFieldChange = (field: string, value: string) => {
        if (field === 'postal' && isValidPostalCode(field)) {
            toast('Invalid postal code');
            return;
        }
        setAddressFields(prevState => ({...prevState, [field]: value}));
    };

    const handleSave = () => {
        if (!addressFields.address.trim()) {
            toast('Address cannot be empty', {type: 'error'});
            return;
        }
        if (addressFields.postal.trim() === '') {
            toast("Postal code cannot be empty", {type: "error"})
            return;
        } else if (!isValidPostalCode(addressFields.postal)) {
            toast('Invalid postal code', {type: 'error'});
            return;
        }
        if (!addressFields.city.trim()) {
            toast('City cannot be empty', {type: 'error'});
            return;
        }
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
                <Autocomplete
                    options={Object.values(GERMAN_CITIES_SUPPORT)}
                    getOptionLabel={(option) => option}
                    value={addressFields.city}
                    onChange={(event, newValue) => handleAddressFieldChange('city', newValue as GERMAN_CITIES_SUPPORT)}
                    renderInput={(params) => (
                    <TextField
                        {...params}
                        margin="normal"
                        label="City"
                        fullWidth
                        autoComplete="address-level2"
                    />
                )}
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