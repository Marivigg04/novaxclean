export default function FilterBar({ filters, activeFilter, onFilterChange }) {
  return (
    <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
      {filters.map((filter) => {
        const isActive = filter === activeFilter;

        return (
          <button
            key={filter}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-label-md transition-colors ${
              isActive
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
            }`}
            type="button"
            onClick={() => onFilterChange(filter)}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}