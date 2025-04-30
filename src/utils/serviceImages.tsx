// src/utils/serviceImageMap.ts
// Pull every file in that folder at build-time
const images = import.meta.glob('../assets/services/*.jpg', { eager: true })

// Build a map such that “Accounting” -> image path
export const serviceImageMap: Record<string, string> = {}

Object.entries(images).forEach(([fullPath, mod]) => {
  // fullPath ends with ".../Accounting.jpg"
  const fileName = fullPath.split('/').pop() || ''
  const serviceName = fileName.replace('.jpg', '').replace(/_/g, ' ')
  serviceImageMap[serviceName] = (mod as any).default
})
