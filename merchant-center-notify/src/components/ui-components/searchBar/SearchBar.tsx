import React, { useState } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
    placeholder?: string;
    onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search...', onSearch }) => {
    const [query, setQuery] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form className={styles.searchContainer} onSubmit={handleSubmit}>
            <input
                type="text"
                className={styles.searchInput}
                placeholder={placeholder}
                value={query}
                onChange={handleInputChange}
            />
            <button type="submit" className={styles.searchButton}>
                <i className="fas fa-search"></i>
            </button>
        </form>
    );
};

export default SearchBar;