// src/pages/ServiceProductsPage.tsx
import { useEffect, useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BaseLayout from '../../components/Dashboard/BaseLayout'
import { advancedSearch, SearchResult, getSearchSuggestions } from '../../utils/searchUtils'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../utils/firebase'

const PAGE_SIZE_OPTIONS = [8, 16, 32]

// Interface for vendor information
interface VendorInfo {
  id: string;
  name: string;
}

const ServiceProductsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const searchQuery =
    new URLSearchParams(location.search).get('query') || ''

  const [rows, setRows] = useState<SearchResult[]>([])
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0])
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputValue, setInputValue] = useState(searchQuery)
  const [vendorMap, setVendorMap] = useState<Record<string, string>>({})

  /**──────────────────────────────
   * Fetch data on mount / query change
   *──────────────────────────────*/
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery) {
        setLoading(false)
        return
      }
      
      setLoading(true)
      try {
        // Use our advanced search algorithm
        const results = await advancedSearch(searchQuery)
        setRows(results)
        
        // Get unique vendor IDs to fetch vendor names
        const vendorIds = [...new Set(results.map(r => r.vendor))]
        fetchVendorNames(vendorIds)
      } catch (error) {
        console.error("Search error:", error)
        setRows([])
      }
      setLoading(false)
    }

    fetchResults()
    setInputValue(searchQuery)
  }, [searchQuery])

  /**──────────────────────────────
   * Fetch vendor names for all vendor IDs
   *──────────────────────────────*/
  const fetchVendorNames = async (vendorIds: string[]) => {
    const todo = vendorIds.filter((id) => !vendorMap[id])
    if (todo.length === 0) return
  
    const updated: Record<string, string> = { ...vendorMap }
  
    try {
      await Promise.all(
        todo.map(async (id) => {
          const snap = await getDoc(doc(db, 'Vendors', id)) // note the capital V
          if (snap.exists()) {
            const d: any = snap.data()
  
            const fullName =
              d.name ||
              [d.firstName, d.lastName].filter(Boolean).join(' ') ||
              'Unnamed Vendor'
  
            const biz = d.businessName || ''
  
            updated[id] = biz ? `${fullName}, ${biz}` : fullName
          } else {
            updated[id] = 'Unknown Vendor'
          }
        }),
      )
  
      setVendorMap(updated)
    } catch (err) {
      console.error('Error fetching vendor docs:', err)
    }
  }

  /**──────────────────────────────
   * Fetch search suggestions as user types
   *──────────────────────────────*/
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!inputValue || inputValue.length < 2) {
        setSuggestions([])
        return
      }
      
      try {
        const results = await getSearchSuggestions(inputValue)
        setSuggestions(results)
      } catch (error) {
        console.error("Error fetching suggestions:", error)
        setSuggestions([])
      }
    }
    
    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [inputValue])

  /**──────────────────────────────
   * Pagination helpers
   *──────────────────────────────*/
  const paginatedRows = useMemo(
    () => rows.slice(0, pageSize),
    [rows, pageSize],
  )

  /**──────────────────────────────
   * Handle input changes
   *──────────────────────────────*/
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setShowSuggestions(true)
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion)
    setShowSuggestions(false)
    navigate(`/search?query=${encodeURIComponent(suggestion)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(`/search?query=${encodeURIComponent(inputValue)}`)
      setShowSuggestions(false)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  /**──────────────────────────────
   * Get status label and styling
   *──────────────────────────────*/
  const getStatusClass = (relevance: number) => {
    if (relevance > 0.9) {
      return 'bg-green-200 text-green-800'
    } else if (relevance > 0.7) {
      return 'bg-cyan-200 text-cyan-800'
    } else {
      return 'bg-orange-200 text-orange-800'
    }
  }

  const getStatusLabel = (relevance: number) => {
    if (relevance > 0.9) {
      return 'Active Service'
    } else if (relevance > 0.7) {
      return 'On Sale'
    } else {
      return 'New Service' 
    }
  }

  /**──────────────────────────────
   * Get vendor name from vendor ID
   *──────────────────────────────*/
  const getVendorName = (vendorId: string) => {
    return vendorMap[vendorId] || 'Loading...'
  }

  /**──────────────────────────────
   * Handle clicking outside suggestions
   *──────────────────────────────*/
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false)
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  /**──────────────────────────────
   * RENDER
   *──────────────────────────────*/
  return (
    <BaseLayout>
      <h1 className="py-7 px-6 text-[60px] font-nunito font-bold mb-6">
        Services&nbsp;&amp;&nbsp;Products
      </h1>

      {/* top bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-80 flex-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onClick={(e) => {
              e.stopPropagation()
              setShowSuggestions(true)
            }}
            placeholder="Search"
            className="border rounded-full px-4 py-2 w-full"
          />
          
          {/* Search suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectSuggestion(suggestion)
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center font-nunito gap-2 text-[15px]">
          Showing
          <select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {PAGE_SIZE_OPTIONS.map(n => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="flex items-center gap-1 border rounded px-3 py-1 text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4a1 1 0 011-1h2a1 1 0 011 1v1h10V4a1 1 0 011-1h2a1 1 0 011 1v1M3 10h18M7 6v8m10-8v8m-6 4h-2m8 0h-2"
            />
          </svg>
          Filter
        </button>
      </div>

      {/* table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center">Loading…</div>
        ) : paginatedRows.length === 0 ? (
          <div className="p-6 text-center">
            {searchQuery ? "No results found. Try a different search term." : "Enter a search term to find products and services"}
          </div>
        ) : (
          <table className="min-w-full text-[15px]">
            <thead className="bg-gray-50">
              <tr className="text-left font-bold">
                <th className="px-4 py-3 font-nunito">Product name</th>
                <th className="px-4 py-3 font-nunito">Product Type</th>
                <th className="px-4 py-3 font-nunito">Vendor</th>
                <th className="px-4 py-3 font-nunito">Reviews</th>
                <th className="px-4 py-3 font-nunito">Price</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() =>
                    navigate(
                      r.type === 'product' ? `/product/${r.id}` : `/service/${r.id}`,
                    )
                  }
                >
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3 capitalize">{r.type}</td>
                  <td className="px-4 py-3 truncate max-w-[200px]">
                    {getVendorName(r.vendor)}
                  </td>
                  <td className="px-4 py-3">{r.reviews}</td>
                  <td className="px-4 py-3">
                    {typeof r.price === 'number' ? `$${r.price}` : r.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </BaseLayout>
  )
}

export default ServiceProductsPage