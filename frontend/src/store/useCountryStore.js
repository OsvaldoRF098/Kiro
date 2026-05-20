import { create } from 'zustand';
import { getCountries } from '../api/countriesApi';

/**
 * Zustand store for managing country data and UI state.
 *
 * State:
 *   allCountries  - Original data from backend (never modified by delete)
 *   countries     - Active list (without deleted countries)
 *   searchTerm    - Current search filter
 *   isLoading     - Loading state
 *   error         - Error message or null
 *
 * Derived selector (not stored in state):
 *   filteredCountries - countries filtered by searchTerm (case-insensitive on name.common)
 */
const useCountryStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  allCountries: [],
  countries: [],
  searchTerm: '',
  isLoading: false,
  error: null,

  // ── Derived selector ───────────────────────────────────────────────────────
  /**
   * Returns countries filtered by the current searchTerm.
   * When searchTerm is empty, returns all countries.
   * Filtering is case-insensitive and matches against name.common.
   *
   * @returns {Array} Filtered list of CountryData objects
   */
  filteredCountries: () => {
    const { countries, searchTerm } = get();
    if (!searchTerm) return countries;
    const term = searchTerm.toLowerCase();
    return countries.filter((c) =>
      c.name.common.toLowerCase().includes(term)
    );
  },

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Fetch countries from the backend using the provided JWT token.
   * Sets isLoading while in flight; populates allCountries and countries on
   * success; sets error on failure.
   *
   * @param {string} token - JWT token
   */
  fetchCountries: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getCountries(token);
      set({ allCountries: data, countries: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  /**
   * Remove a country from the active list by its name.common value.
   * Does NOT modify allCountries.
   *
   * @param {string} nameCommon - The name.common of the country to remove
   */
  deleteCountry: (nameCommon) => {
    set((state) => ({
      countries: state.countries.filter((c) => c.name.common !== nameCommon),
    }));
  },

  /**
   * Reset the active countries list back to the original allCountries data.
   */
  restoreCountries: () => {
    set((state) => ({ countries: state.allCountries }));
  },

  /**
   * Update the search term used to filter the visible country list.
   *
   * @param {string} text - New search term
   */
  setSearchTerm: (text) => {
    set({ searchTerm: text });
  },
}));

/**
 * Convenience selector hook that returns the derived filteredCountries list.
 * Usage: const filtered = useFilteredCountries();
 *
 * @returns {Array} Filtered list of CountryData objects
 */
export const useFilteredCountries = () =>
  useCountryStore((state) => state.filteredCountries());

export default useCountryStore;
