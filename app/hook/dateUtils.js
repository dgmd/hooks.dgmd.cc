// Define date formats (comments for reference)
export const DATE_PRETTY_SHORT_DATE = 'LLL d, yyyy'; // Will use toLocaleDateString options
export const DATE_PRETTY_SHORT_NUMERIC_DATE = 'L/d/yy'; // Will use toLocaleDateString options
export const DATE_INPUT_FORMAT_DATE_ONLY = "yyyy-MM-dd"; // <input type="date"/>
export const DATE_INPUT_FORMAT_WITH_TIME = "yyyy-MM-dd'T'HH:mm"; // <input type="datetime-local"/>

// Function to format dates using native JavaScript
export const prettyPrintNotionDate = (dateString, format = DATE_PRETTY_SHORT_DATE, timeZone = null) => {
  try {
    const defaultZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dateObj = new Date(dateString);

    if (!isNaN(dateObj.getTime())) {
      // Format based on the format parameter
      if (format === DATE_PRETTY_SHORT_NUMERIC_DATE) {
        return dateObj.toLocaleDateString('en-US', {
          timeZone: defaultZone,
          month: 'numeric',
          day: 'numeric',
          year: '2-digit'
        });
      } else if (format === DATE_PRETTY_SHORT_DATE) {
        return dateObj.toLocaleDateString('en-US', {
          timeZone: defaultZone,
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      } else {
        // Fallback to default format
        return dateObj.toLocaleDateString('en-US', {
          timeZone: defaultZone,
          month: 'numeric',
          day: 'numeric',
          year: '2-digit'
        });
      }
    } else {
      console.log('invalid date', dateString);
    }
  } catch (e) {
    console.error('Error formatting date:', e);
  }
  return '';
};

export function formatDateForNotion(input, zone) {
  const defaultZone = zone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Try to match mm-dd-yyyy or mm-dd-yyyy HH:mm
  let parts = input.match(/(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (parts) {
    const [, month, day, year, hours = '00', minutes = '00'] = parts;
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date format. Expected mm-dd-yyyy or mm-dd-yyyy HH:mm");
    }
    const utcDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
    return {
      isoUTC: utcDate.toISOString(),
      isoLocal: dateObj.toISOString()
    };
  }

  // Try to match yyyy-mm-dd or yyyy-mm-ddTHH:mm (from <input type="date"/> or <input type="datetime-local"/>)
  parts = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?$/);
  if (parts) {
    const [, year, month, day, hours = '00', minutes = '00'] = parts;
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date format. Expected yyyy-mm-dd or yyyy-mm-ddTHH:mm");
    }
    const utcDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
    return {
      isoUTC: utcDate.toISOString(),
      isoLocal: dateObj.toISOString()
    };
  }

  throw new Error("Invalid date format. Expected mm-dd-yyyy, mm-dd-yyyy HH:mm, yyyy-mm-dd, or yyyy-mm-ddTHH:mm");
}