export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatCompactCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
  }).format(value);
};

/**
 * Formata uma data no formato "YYYY-MM-DD" para "DD/MM/YYYY"
 * Evita problemas de timezone ao criar Date objects
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  // Se já está no formato correto (DD/MM/YYYY), retorna como está
  if (dateString.includes('/')) {
    return dateString;
  }
  
  // Se está no formato ISO (YYYY-MM-DD), converte diretamente sem usar Date
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  
  // Fallback: tenta usar Date mas com timezone local
  try {
    const date = new Date(dateString + 'T12:00:00'); // Usa meio-dia para evitar problemas de timezone
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
};
