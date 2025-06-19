import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SearchBar.css';

export default function SearchBar() {
  const [form, setForm] = useState({ searchTerm: '', location: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const { searchTerm, location } = form;

    const trimmedSearch = searchTerm.trim();
    const trimmedLocation = location.trim();

    // Prevent empty submissions if both fields are blank
    if (!trimmedSearch && !trimmedLocation) return;

    navigate(
      `/services?search=${encodeURIComponent(trimmedSearch)}&location=${encodeURIComponent(trimmedLocation)}`
    );
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSearch} className="search-bar-form" aria-label="Search services by category and location">
        <div className="search-input-group">
          <label htmlFor="searchTerm" className="search-label">
            What service do you need?
          </label>
          <input
            type="text"
            id="searchTerm"
            name="searchTerm"
            placeholder="e.g. Cleaning, Plumbing"
            className="search-input"
            value={form.searchTerm}
            onChange={handleChange}
          />
        </div>

        <div className="search-input-group">
          <label htmlFor="location" className="search-label">
            Where?
          </label>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="e.g. Hyderabad, Siddipet"
            className="search-input"
            value={form.location}
            onChange={handleChange}
          />
        </div>

        <div className="search-button-container">
          <button type="submit" className="search-button">
            Search
          </button>
        </div>
      </form>
    </div>
  );
}