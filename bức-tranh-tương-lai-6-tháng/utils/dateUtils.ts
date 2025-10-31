
export const addSixMonths = (dateString: string): Date => {
  const date = new Date(dateString);
  // Get the day of the month
  const day = date.getDate();
  // Add 6 months
  date.setMonth(date.getMonth() + 6);
  // If the new month doesn't have that day (e.g., adding 6 months to Aug 31 results in Feb 31),
  // JavaScript handles this by rolling over, e.g., to March 2nd/3rd.
  // To stick to the end of the month, we can check.
  // A simpler approach for this app's purpose is to let it roll over, but let's try to be precise.
  // If we went from day D to a month where the last day is < D, set to the last day of the new month.
  if (date.getDate() !== day) {
    date.setDate(0); // This sets the date to the last day of the previous month
  }
  return date;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};
