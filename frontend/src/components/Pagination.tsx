import React from 'react';
import LightBlueButton from '../components/inputs/BlueButton';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="flex justify-center mt-4 space-x-2">
            <LightBlueButton
                text="Previous"
                className={` ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, index) => (
                <LightBlueButton
                    key={index + 1}
                    text={`${index + 1}`}
                    className={` ${currentPage === index + 1 ? 'bg-blue-500 text-white' : ''}`}
                    onClick={() => onPageChange(index + 1)}
                    disabled={false}
                />
            ))}
            <LightBlueButton
                text="Next"
                className={` ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            />
        </div>
    );
};

export default Pagination;
