import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryCard from './CategoryCard';
import '../styles/CategoriesCardsContainer.css';

export default function Categories() {
  const navigate = useNavigate();

  const categories = useMemo(() => [
    { name: 'Cleaning', icon: '🧹' },
    { name: 'Photography', icon: '📷' },
    { name: 'Plumbing', icon: '🚿' },
    { name: 'Electrical', icon: '💡' }
  ], []);

  const handleCategoryClick = (categoryName) => {
    const slug = encodeURIComponent(categoryName.toLowerCase().replace(/\s+/g, '-'));
    navigate(`/categories/${slug}`);
  };

  return (
    <section className="div-container" aria-labelledby="popular-categories-title">
      <h2 id="popular-categories-title" className="categories-title">
        Popular Categories
      </h2>

      <nav className="categories-grid" role="navigation" aria-label="Browse categories">
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            name={category.name}
            icon={category.icon}
            onClick={() => handleCategoryClick(category.name)}
          />
        ))}
      </nav>
    </section>
  );
}
