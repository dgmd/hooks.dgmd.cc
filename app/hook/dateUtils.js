import {
  parseISO,
  zonedTimeToUtc
} from 'date-fns-tz';

// Define date formats
export const DATE_PRETTY_SHORT_DATE = 'MMM D, YYYY';
export const DATE_PRETTY_SHORT_NUMERIC_DATE = 'M/D/YY';

// Function to format Notion dates using date-fns
export const prettyPrintNotionDate = (dateString, format = DATE_PRETTY_SHORT_NUMERIC_DATE) => {
  try {
    const dateObj = getTimeZoneNeutralDate(dateString); // Assuming getTimeZoneNeutralDate is already defined

    if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
      return format(dateObj, format); // Use date-fns' format function
    }
    else {
      console.log('invalid date', date);
      return '';
    }
  }
  catch (e) {
    console.error('Error formatting date:', e);
    return '';
  }
};

export const getTimeZoneNeutralDate = dateString => {
  const parsedDate = parseISO(dateString); // Parse as ISO string
  const utcDate = zonedTimeToUtc(parsedDate); // Convert to UTC
  return utcDate;
};