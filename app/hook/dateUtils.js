import moment from 'moment';

// Define date formats
export const DATE_PRETTY_SHORT_DATE = 'MMM D, YYYY';
export const DATE_PRETTY_SHORT_NUMERIC_DATE = 'M/D/YY';

// Function to format Notion dates using Moment.js
export const prettyPrintNotionDate = (dateString, format = DATE_PRETTY_SHORT_NUMERIC_DATE) =>{
  try {
    const dateObj = moment.utc(dateString); // Parse as UTC ISO string

    if (dateObj.isValid()) {
      return dateObj.format(format); // Use Moment's format function
    }
    else {
      console.log('invalid date', date);
    }
  }
  catch (e) {
    console.error('Error formatting date:', e);
  }
  return '';
};