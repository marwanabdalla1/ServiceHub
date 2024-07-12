import {
    GERMAN_POSTAL_REGEX,
    MAIL_REGEX,
    NAME_REGEX,
    PHONE_NUMBER_REGEX,
    STRONG_PASSWORD_REGEX
} from "../shared/Constants";

export function isValidEmail(email: string): boolean {
    if (email === undefined || email === null) return false;
    return MAIL_REGEX.test(email);
}

export function isValidPassword(password: string): boolean {
    if (password === undefined || password === null) return false;
    return STRONG_PASSWORD_REGEX.test(password);
}

export function isValidName(name: string): boolean {
    if (name === undefined || name === null) return false;
    return NAME_REGEX.test(name);
}

export function isValidPhoneNumber(phone: string): boolean {
    if (phone === undefined || phone === null) return false;
    return PHONE_NUMBER_REGEX.test(phone);
}

// Services are only available in Germany
export function isValidPostalCode(postalCode: string): boolean {
    if(postalCode === undefined || postalCode === null) return false;
    return GERMAN_POSTAL_REGEX.test(postalCode);
}
