/**
 * Regular Expression For Email Validation
 * https://emailregex.com/
 */

/* eslint-disable no-control-regex */
export const MAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;


/**
 * Regex To Match International First And Last Names
 * https://regexpattern.com/international-first-last-names/
 */
export const NAME_REGEX = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;

/**
 * Strong Password Regular Expression
 * https://regexpattern.com/strong-password/
 * Minimum 6 characters
 * At least 1 upper case English letter
 * At least 1 lower case English letter
 * At least 1 letter
 * At least 1 special character
 */
export const STRONG_PASSWORD_REGEX = /^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*? ])\S*$/;

/**
 * Phone Number Regular Expression
 * Match a phone number with "-" and/or country code.
 * https://ihateregex.io/expr/phone/
 */
export const PHONE_NUMBER_REGEX: RegExp = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

/**
 * List all the cities that user can use our services
 */
export enum GERMAN_CITIES_SUPPORT {
    Aachen = "Aachen",
    Augsburg = "Augsburg",
    BergischGladbach = "Bergisch Gladbach",
    Berlin = "Berlin",
    Bielefeld = "Bielefeld",
    Bochum = "Bochum",
    Bonn = "Bonn",
    Bottrop = "Bottrop",
    Braunschweig = "Braunschweig",
    Bremen = "Bremen",
    Bremerhaven = "Bremerhaven",
    Chemnitz = "Chemnitz",
    Cottbus = "Cottbus",
    Darmstadt = "Darmstadt",
    Dortmund = "Dortmund",
    Dresden = "Dresden",
    Duisburg = "Duisburg",
    Düsseldorf = "Düsseldorf",
    Erfurt = "Erfurt",
    Erlangen = "Erlangen",
    Essen = "Essen",
    FrankfurtAmMain = "Frankfurt am Main",
    FreiburgImBreisgau = "Freiburg im Breisgau",
    Fürth = "Fürth",
    Gelsenkirchen = "Gelsenkirchen",
    Göttingen = "Göttingen",
    Hagen = "Hagen",
    HalleSaale = "Halle (Saale)",
    Hamburg = "Hamburg",
    Hamm = "Hamm",
    Hannover = "Hannover",
    Heidelberg = "Heidelberg",
    Heilbronn = "Heilbronn",
    Herne = "Herne",
    Hildesheim = "Hildesheim",
    Ingolstadt = "Ingolstadt",
    Jena = "Jena",
    Karlsruhe = "Karlsruhe",
    Kassel = "Kassel",
    Kiel = "Kiel",
    Koblenz = "Koblenz",
    Krefeld = "Krefeld",
    Köln = "Köln",
    Leipzig = "Leipzig",
    Leverkusen = "Leverkusen",
    LudwigshafenAmRhein = "Ludwigshafen am Rhein",
    Lübeck = "Lübeck",
    Magdeburg = "Magdeburg",
    Mainz = "Mainz",
    Mannheim = "Mannheim",
    Moers = "Moers",
    Mönchengladbach = "Mönchengladbach",
    MülheimAnDerRuhr = "Mülheim an der Ruhr",
    München = "München",
    Münster = "Münster",
    Neuss = "Neuss",
    Nürnberg = "Nürnberg",
    Oberhausen = "Oberhausen",
    OffenbachAmMain = "Offenbach am Main",
    Oldenburg = "Oldenburg",
    Osnabrück = "Osnabrück",
    Paderborn = "Paderborn",
    Pforzheim = "Pforzheim",
    Potsdam = "Potsdam",
    Recklinghausen = "Recklinghausen",
    Regensburg = "Regensburg",
    Remscheid = "Remscheid",
    Reutlingen = "Reutlingen",
    Rostock = "Rostock",
    Saarbrücken = "Saarbrücken",
    Salzgitter = "Salzgitter",
    Siegen = "Siegen",
    Solingen = "Solingen",
    Stuttgart = "Stuttgart",
    Trier = "Trier",
    Ulm = "Ulm",
    Wiesbaden = "Wiesbaden",
    Wolfsburg = "Wolfsburg",
    Wuppertal = "Wuppertal",
    Würzburg = "Würzburg",
}

export const GERMAN_POSTAL_REGEX = /^[0-9]{5}$/;