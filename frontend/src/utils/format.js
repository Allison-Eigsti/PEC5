export function formatPrice(priceCents) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format((Number(priceCents) || 0) / 100);
}

export function conditionLabel(condition) {
  const labels = {
    new: 'New',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
  };

  return labels[condition] || condition;
}

export function statusLabel(status) {
  const labels = {
    available: 'Available',
    sold: 'Sold',
    hidden: 'Hidden',
  };

  return labels[status] || status;
}

export function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(value));
}
