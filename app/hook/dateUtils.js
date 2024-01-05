
//Format in "MMM D, YYYY" format (e.g., Dec 5, 2023)
export const DATE_PRETTY_SHORT_DATE = {
    month: 'short',
    day: 'numeric',
    year: 'numeric' };
  
  //Format in "M/D/YY" format (e.g., 12/5/23)
  export const DATE_PRETTY_SHORT_NUMERIC_DATE = {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit' };
  
  const hasTimeZoneInfo = dateString => {
    return /Z|[+-]\d{2}:\d{2}$/.test(dateString.slice(-6));
  };
  
  export const prettyPrintNotionDate = (dateString, format) => {
      format = format || DATE_PRETTY_SHORT_NUMERIC_DATE;
    try {
      const dateObj = getTimeZoneNeutralDate( dateString );
      
      //did we successfully parse a date?
      if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString( 'en-US', format );
      }
      else {
        console.log( 'invalid date', date );
      }
    }
    catch(e) {
    }
    return '';
  };
  
  const getTimeZoneNeutralDate = dateString => {
    const tzInfoString = hasTimeZoneInfo(dateString) ? '' : 'T12:00:00Z';
    const tzDateString = `${ dateString }${ tzInfoString }`
    const dateObj = new Date( tzDateString );
    return dateObj;
  };