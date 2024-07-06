import React from 'react';

interface SortProps {
  onSortChange: (sortKey: string | null) => void; // Updated type
}

const Sort: React.FC<SortProps> = ({ onSortChange }) => {
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onSortChange(value === 'null' ? null : value); // Handle 'null' option
  };

  return (
    <div className="sort-container flex items-center justify-end p-4">
      <label htmlFor="sort" className="mr-2 text-gray-700 font-semibold">Sort By: </label>
      <select 
        id="sort" 
        onChange={handleSortChange} 
        className="block w-full md:w-1/3 bg-white border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        defaultValue="null" // Set default value to 'null'
      >
        <option value="null">None</option> {/* Added None option */}
        <option value="priceAsc">Price: Low to High</option>
        <option value="priceDesc">Price: High to Low</option>
        <option value="ratingAsc">Rating: Low to High</option>
        <option value="ratingDesc">Rating: High to Low</option>
      </select>
    </div>
  );
};

export default Sort;
