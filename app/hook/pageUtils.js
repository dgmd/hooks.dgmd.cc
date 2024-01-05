import {
  DGMDCC_BLOCK_METADATA,
  DGMDCC_BLOCK_ID,
  DGMDCC_BLOCK_VALUE,
  DGMDCC_BLOCK_PROPERTIES,
  DGMDCC_BLOCK_DATE_START,
  DGMDCC_BLOCK_DATE_END,
  DGMDCC_BLOCK_TYPE,
  BLOCK_TYPE_DATE,
  BLOCK_TYPE_CHECKBOX,
  BLOCK_TYPE_MULTI_SELECT
} from './constants.js';

import {
  isNil
} from 'lodash-es';

export const getPageId = page => 
  page[DGMDCC_BLOCK_METADATA][DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE];

export const getPageProperty = (page, propertyKey) => {
  if (isNil(page)) {
    return null;
  }
  if (!(DGMDCC_BLOCK_PROPERTIES in page)) {
    return null;
  }
  const properties = page[DGMDCC_BLOCK_PROPERTIES];
  if (!(propertyKey in properties)) {
    return null;
  }
  const propertyObject = properties[propertyKey];
  if (!(DGMDCC_BLOCK_VALUE in propertyObject)) {
    return null;
  }
  return propertyObject[DGMDCC_BLOCK_VALUE];
};

//
// SORT UTIL
//
export const sortPages = (pgs, fields, directions) => {
  const fieldsLen = Array.isArray(fields) ? fields.length : 0;
  pgs.sort( (a, b) => {
    for (let i = 0; i < fieldsLen; i++) {
      try {
        const field = fields[i];
        const direction = directions[i] ? 1 : -1;
        const aProps = a[DGMDCC_BLOCK_PROPERTIES];
        const bProps = b[DGMDCC_BLOCK_PROPERTIES];
        const aField = aProps[field];
        const bField = bProps[field];
        const aVal = aField[DGMDCC_BLOCK_VALUE];
        const bVal = bField[DGMDCC_BLOCK_VALUE];
        const aNil = isNil(aVal);
        const bNil = isNil(bVal);
        if (aNil && bNil) {
          continue;
        }
        if (aNil && !bNil) {
          return -1 * direction;
        }
        if (!aNil && bNil) {
          return 1 * direction;
        }

        const aType = aField[DGMDCC_BLOCK_TYPE];
        if (aType === BLOCK_TYPE_DATE) {
          const aDateVal = getTimeZoneNeutralDate( aVal[DGMDCC_BLOCK_DATE_START] );
          const bDateVal = getTimeZoneNeutralDate( bVal[DGMDCC_BLOCK_DATE_START] );
          if (aDateVal < bDateVal) {
            return -1 * direction;
          }
          if (aDateVal > bDateVal) {
            return 1 * direction;
          }
          //aDateVal === bDateVal, so...
          const aEndDateVal = getTimeZoneNeutralDate( aVal[DGMDCC_BLOCK_DATE_END] );
          const bEndDateVal = getTimeZoneNeutralDate( bVal[DGMDCC_BLOCK_DATE_END] );
          if (aEndDateVal < bEndDateVal) {
            return -1 * direction;
          }
          if (aEndDateVal > bEndDateVal) {
            return 1 * direction;
          }
        }
        if (aType === BLOCK_TYPE_CHECKBOX) {
          if (!aVal && bVal) {
            return -1 * direction;
          }
          if (aVal && !bVal) {
            return 1 * direction;
          }
        }
        if (aType === BLOCK_TYPE_MULTI_SELECT) {
          const maxLen = Math.max( aVal.length, bVal.length );
          for (let i = 0; i < maxLen; i++) {
            const aValI = aVal[i] || '';
            const bValI = bVal[i] || '';
            if (aValI < bValI) {
              return -1 * direction;
            }
            if (aValI > bValI) {
              return 1 * direction;
            }
          }
        }

        //anything else...
        if (aVal < bVal) {
          return -1 * direction;
        }
        if (aVal > bVal) {
          return 1 * direction;
        }
      }
      catch (e) {
        console.log( e );
      }
    }
    return 0;
  } );
};

//
//  BLOCK UPDATE CONVERTERS
//
const mmBlocktoNotionBlock = ( block ) => {
    const type = block[DGMDCC_BLOCK_TYPE];
    const value = block[DGMDCC_BLOCK_VALUE];
  
    if ([BLOCK_TYPE_CREATED_TIME, BLOCK_TYPE_LAST_EDITED_TIME].includes( type )) {
      return null;
    }
  
    if (BLOCK_TYPE_DATE === type) {
      const startDateValue = new Date( value[DGMDCC_BLOCK_DATE_START] );
      if (isFinite(startDateValue)) {
        const dateObj = {
          [DGMDCC_BLOCK_DATE_START]: startDateValue.toISOString()
        };
        const endDateValue = new Date( value[DGMDCC_BLOCK_DATE_END] );
        if (isFinite(endDateValue)) {
          dateObj[DGMDCC_BLOCK_DATE_END] = endDateValue.toISOString();
        }
        return {
          [type]: dateObj
        };
      }
    }
  
    if ([BLOCK_TYPE_TITLE, BLOCK_TYPE_RICH_TEXT].includes( type )) {
      const stringValue = String( value );
      return {
        [type]: [ {
          "text": {
            "content": stringValue
          }
        } ]
      };
    }
  
    if ([BLOCK_TYPE_PHONE_NUMBER, BLOCK_TYPE_URL, BLOCK_TYPE_EMAIL].includes( type )) {
      const stringValue = String( value );
      return {
        [type]: stringValue
      };
    }
  
    if (type === BLOCK_TYPE_SELECT || type === BLOCK_TYPE_STATUS) {
      const stringValue = String( value );
      return {
        [type]: {
          "name": stringValue
        }
      };
    }
    if (type === BLOCK_TYPE_NUMBER) {
      const numValue = Number( value );
      if (isFinite(numValue)) {
        return {
          [type]: numValue
        };
      }
    }
    if (type === BLOCK_TYPE_MULTI_SELECT) {
      if (Array.isArray(value)) {
        const selects = value.map( v => {
          return {
            "name": String(v)
          };
        } );
  
        return {
          [type]: selects
        };
      }
    }
    if (type === BLOCK_TYPE_CHECKBOX) {
      const booleanValue = deriveBoolean( value );
      return {
        [type]: booleanValue
      };
    }
    // #https://developers.notion.com/reference/page-property-values#relation
    if (type === BLOCK_TYPE_RELATION) {
      if (Array.isArray(value)) {
  
        if (value.every( v => typeof v === 'string' )) {
          return {
            [type]: value.map( v => {
              return {
                "id": v
              };
            } )
          };
        }
        return {
          [type]: value
        };
      }
    }
    
    return null;
};
  
const mmBlocktoHeaderBlock = ( block ) => {
    const type = block[DGMDCC_BLOCK_TYPE];
    const value = block[DGMDCC_BLOCK_VALUE];
    if (type === BLOCK_TYPE_EMOJI) {
      return {
        [type]: value,
      }
    }
    if (type === BLOCK_TYPE_FILE_EXTERNAL) {
      return {
        "type": type,
        "external": {
          "url": value
        }
      }
    }
};
  
const mergeLists = (existingList, incomingList) => {
    if (isNil(existingList)) {
        return incomingList;
    }
    if (isNil(incomingList)) {
        return existingList;
    }
    const getId = obj => obj[DGMDCC_BLOCK_METADATA][DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE];
  
    const mergedList = [...existingList, ...incomingList.reduce((acc, obj) => {
      const existingIndex = existingList.findIndex(
        item => getId(item) === getId(obj) );
      if (existingIndex !== -1) {
          existingList[existingIndex] = obj; // Replace existing object
      }
      else {
          acc.push(obj); // Add new object
      }
      return acc;
    }, [])];
    return mergedList;
};