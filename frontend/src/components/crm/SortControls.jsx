import React from 'react';
import { ArrowDownAZ, ArrowUpAZ, ArrowDown01, ArrowUp01 } from 'lucide-react';

const SortControls = ({ sortField, sortOrder, onSortChange }) => {
  const sortOptions = [
    { field: 'date', order: 'desc', label: 'Newest First', icon: ArrowDown01 },
    { field: 'date', order: 'asc', label: 'Oldest First', icon: ArrowUp01 },
    { field: 'name', order: 'asc', label: 'Name (A-Z)', icon: ArrowDownAZ },
    { field: 'name', order: 'desc', label: 'Name (Z-A)', icon: ArrowUpAZ }
  ];

  const handleChange = (e) => {
    const [field, order] = e.target.value.split(':');
    onSortChange(field, order);
  };

  const currentValue = `${sortField}:${sortOrder}`;

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm text-gray-600">Sort by:</label>
      <select
        value={currentValue}
        onChange={handleChange}
        className="input text-sm"
      >
        {sortOptions.map((option) => (
          <option key={`${option.field}:${option.order}`} value={`${option.field}:${option.order}`}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortControls;
