import { users, Account } from "../models/Account";

//Temporary solution for front-end filtering
export function searchServices(users: Account[], filter: {
    type: string,
    priceRange: number[],
    locations: string[],
    isLicensed: Boolean,
  },  search: string) {

    const searchTextLower = search.toLowerCase();

    const searchedServices = users.filter((user) => {
        return (
            searchTextLower.includes(user.firstName.toLowerCase()) ||
            searchTextLower.includes(user.lastName.toLowerCase()) ||
            searchTextLower.includes(user.location?.toLowerCase() ? user.location?.toLowerCase() : "") ||
            user.serviceOfferings.some((serviceOffering) => searchTextLower.includes(serviceOffering.serviceType.toLowerCase()))
            //user.serviceOfferings.some((serviceOffering) => serviceOffering.isCertified === true)  && searchTextLower.includes("certif" || "licen")
            
        )
    });

    const filteredServices = searchedServices.filter((user) => {
        return (
           user.serviceOfferings.some((serviceOffering) => serviceOffering.serviceType === filter.type) ||
           (user.serviceOfferings.some((serviceOffering) => serviceOffering.hourlyRate > filter.priceRange[0]) && user.serviceOfferings.some((serviceOffering) => serviceOffering.hourlyRate < filter.priceRange[1])) ||
           user.serviceOfferings.some((serviceOffering) => filter.locations.some((location) => location.toLowerCase() === serviceOffering.location?.toLowerCase())) ||
           user.serviceOfferings.some((serviceOffering) => filter.isLicensed === serviceOffering.isCertified)            
        )
    });

    return filteredServices;
};

//Passing the search criteria to the back-end for when the back-end connection is available

export function searchServicesBackEnd(filter: {
    type: string,
    priceRange: number[],
    locations: string[],
    isLicensed: Boolean,
  },  search: string) {

    const searchCriteria = { serviceType: filter.type, priceRange: filter.priceRange, locations: filter.locations,
        isCertified: filter.isLicensed, searchTerm: search };
    return searchCriteria;
    };