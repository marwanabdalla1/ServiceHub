import {toast} from "react-toastify";

export const checkEmptyFields = (data: string, fieldName: string) => {
    if (data === '' || data === null || data === undefined) {
        toast.error(`${fieldName} is required.`);
        return true;
    }
    return false;
};
