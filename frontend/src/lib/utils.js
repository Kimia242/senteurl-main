import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price, currency = "XOF") {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price) + ' FCFA';
}

export function formatPriceUSD(price) {
  // Convert to XOF format for Senegal market
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price) + ' FCFA';
}

export function getSessionId() {
  let sessionId = localStorage.getItem('senteur_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('senteur_session_id', sessionId);
  }
  return sessionId;
}

export function calculateDiscountedPrice(price, discountPercentage) {
  if (!discountPercentage) return price;
  return price * (1 - discountPercentage / 100);
}

export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getGenderLabel(gender) {
  const labels = {
    'homme': 'Pour Homme',
    'femme': 'Pour Femme',
    'unisex': 'Unisexe'
  };
  return labels[gender] || gender;
}

export function getStockStatus(stock) {
  if (stock <= 0) return { label: 'Rupture de stock', className: 'badge-out-of-stock' };
  if (stock <= 5) return { label: `Plus que ${stock} en stock`, className: 'badge-stock-low' };
  return { label: 'En stock', className: 'text-emerald-400' };
}
