// src/utils/searchUtils.ts
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit as firestoreLimit,
    QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'

// Levenshtein distance calculation for fuzzy matching
export function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = []

    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i]
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j
    }

    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = a[j - 1] === b[i - 1] ? 0 : 1
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1, // deletion
                matrix[i][j - 1] + 1, // insertion
                matrix[i - 1][j - 1] + cost // substitution
            )
        }
    }

    return matrix[b.length][a.length]
}

// Function to calculate similarity score (0-1)
export function calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase()
    const s2 = str2.toLowerCase()
    const maxLength = Math.max(s1.length, s2.length)

    if (maxLength === 0) return 1.0 // Both strings are empty

    const distance = levenshteinDistance(s1, s2)
    return 1 - distance / maxLength
}

// Get word variants for better matching
function getWordVariants(word: string): string[] {
    const variants = [word]

    // Common suffix handling
    if (word.endsWith('ing')) {
        variants.push(word.slice(0, -3)) // Without "ing"
        variants.push(word.slice(0, -3) + 'e') // Replace "ing" with "e"
    }

    if (word.endsWith('s')) {
        variants.push(word.slice(0, -1)) // Singular form
    }

    if (word.endsWith('es')) {
        variants.push(word.slice(0, -2)) // Singular form
        variants.push(word.slice(0, -2) + 'e') // Some es endings
    }

    if (word.endsWith('ed')) {
        variants.push(word.slice(0, -2)) // Without "ed"
        variants.push(word.slice(0, -1)) // Without "d"
    }

    return variants
}

// Extract keywords from search query
function extractKeywords(query: string): string[] {
    // Split on spaces and special characters, ignore common stop words
    const stopWords = [
        'and',
        'or',
        'the',
        'a',
        'an',
        'in',
        'on',
        'at',
        'for',
        'to',
        'of',
    ]
    const words = query
        .toLowerCase()
        .split(/[\s,.;:!?]+/)
        .filter((w) => w.length > 1 && !stopWords.includes(w))

    // Get variants for each word
    const allVariants: string[] = []
    for (const word of words) {
        allVariants.push(...getWordVariants(word))
    }

    return [...words, ...allVariants]
}

// Interface for search results
export interface SearchResult {
    id: string
    type: 'product' | 'service'
    name: string
    category: string
    vendor: string
    reviews: number
    price: number | string
    relevance: number
}

// Main search function
export async function advancedSearch(
    searchQuery: string,
    maxResults = 100
): Promise<SearchResult[]> {
    if (!searchQuery.trim()) return []

    const normalizedQuery = searchQuery.toLowerCase().trim()
    const keywords = extractKeywords(normalizedQuery)

    // Get all products and services (within reasonable limits)
    const productRef = collection(db, 'products')
    const serviceRef = collection(db, 'services')

    // Use Firebase's built-in filtering for the first pass
    // This will get items that have some relation to our search terms
    const [productSnap, serviceSnap] = await Promise.all([
        getDocs(query(productRef, orderBy('name'), firestoreLimit(500))),
        getDocs(query(serviceRef, orderBy('name'), firestoreLimit(500))),
    ])

    // Process products
    const productResults = processDocuments(
        productSnap.docs,
        keywords,
        'product'
    )

    // Process services
    const serviceResults = processDocuments(
        serviceSnap.docs,
        keywords,
        'service'
    )

    // Combine and sort by relevance
    const combinedResults = [...productResults, ...serviceResults]
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, maxResults)

    return combinedResults
}

// Process documents and calculate relevance
function processDocuments(
    docs: QueryDocumentSnapshot[],
    keywords: string[],
    type: 'product' | 'service'
): SearchResult[] {
    return docs
        .map((doc) => {
            const data: any = doc.data()
            const name = (data.name || '').toLowerCase()
            const category =
                type === 'product'
                    ? (data.category || '').toLowerCase()
                    : (data.softwareUsed || '').toLowerCase()
            const description = (data.description || '').toLowerCase()

            // Check if this item matches our keywords with fuzzy matching
            let maxRelevance = 0
            let exactMatch = false

            // Full phrase match is prioritized
            const normalizedSearch = keywords.join(' ')
            if (name.includes(normalizedSearch)) {
                exactMatch = true
                maxRelevance = 1
            } else {
                // Calculate relevance against name
                for (const keyword of keywords) {
                    // Exact matches get highest priority
                    if (name.includes(keyword)) {
                        maxRelevance = Math.max(maxRelevance, 0.9)
                        continue
                    }

                    // Check category and description for matches
                    if (
                        category.includes(keyword) ||
                        description.includes(keyword)
                    ) {
                        maxRelevance = Math.max(maxRelevance, 0.8)
                        continue
                    }

                    // Fuzzy matching as a fallback
                    const nameParts = name.split(/\s+/)
                    for (const part of nameParts) {
                        const similarity = calculateSimilarity(part, keyword)
                        if (similarity > 0.7) {
                            // Good fuzzy match threshold
                            maxRelevance = Math.max(
                                maxRelevance,
                                similarity * 0.7
                            )
                        }
                    }
                }
            }

            // Filter out irrelevant results
            if (maxRelevance < 0.3) return null

            return {
                id: doc.id,
                type,
                name: data.name || '',
                category:
                    type === 'product'
                        ? data.category || ''
                        : data.softwareUsed || '',
                vendor: data.vendorId || '',
                reviews: data.reviews || 0,
                price: data.price || '$0',
                relevance: exactMatch ? 1 : maxRelevance,
            }
        })
        .filter((item): item is SearchResult => item !== null)
}

// Function to get search suggestions based on partial input
export async function getSearchSuggestions(
    partialQuery: string,
    limit = 5
): Promise<string[]> {
    if (!partialQuery || partialQuery.length < 2) return []

    const normalizedQuery = partialQuery.toLowerCase().trim()

    // Get some products and services to generate suggestions from
    const [productSnap, serviceSnap] = await Promise.all([
        getDocs(
            query(
                collection(db, 'products'),
                orderBy('name'),
                firestoreLimit(100)
            )
        ),
        getDocs(
            query(
                collection(db, 'services'),
                orderBy('name'),
                firestoreLimit(100)
            )
        ),
    ])

    const suggestions: string[] = []
    const processedSet = new Set<string>()

    // Process product names
    productSnap.docs.forEach((doc) => {
        const name = doc.data().name || ''
        if (
            name.toLowerCase().includes(normalizedQuery) &&
            !processedSet.has(name)
        ) {
            suggestions.push(name)
            processedSet.add(name)
        }
    })

    // Process service names
    serviceSnap.docs.forEach((doc) => {
        const name = doc.data().name || ''
        if (
            name.toLowerCase().includes(normalizedQuery) &&
            !processedSet.has(name)
        ) {
            suggestions.push(name)
            processedSet.add(name)
        }
    })

    // Sort by relevance (start with exact match)
    return suggestions
        .sort((a, b) => {
            // Prioritize matches at the beginning of the string
            const aStartsWith = a.toLowerCase().startsWith(normalizedQuery)
                ? 0
                : 1
            const bStartsWith = b.toLowerCase().startsWith(normalizedQuery)
                ? 0
                : 1

            if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith

            // Then sort by string length (shorter = better)
            return a.length - b.length
        })
        .slice(0, limit)
}
