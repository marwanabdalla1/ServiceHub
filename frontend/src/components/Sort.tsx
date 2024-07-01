import React from 'react';

interface SortProps {
  onSortChange: (sortKey: string) => void;
}

const Sort: React.FC<SortProps> = ({ onSortChange }) => {
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(event.target.value);
  };

  return (
    <div className="sort-container">
      <label htmlFor="sort">Sort By: </label>
      <select id="sort" onChange={handleSortChange}>
        <option value="priceAsc">Price: Low to High</option>
        <option value="priceDesc">Price: High to Low</option>
        <option value="ratingAsc">Rating: Low to High</option>
        <option value="ratingDesc">Rating: High to Low</option>
      </select>
    </div>
  );
};

export default Sort;
