import {
  BLOCK_TYPE_CHECKBOX,
  BLOCK_TYPE_DATE,
  BLOCK_TYPE_EMAIL,
  BLOCK_TYPE_EMOJI,
  BLOCK_TYPE_FILE_EXTERNAL,
  BLOCK_TYPE_MULTI_SELECT,
  BLOCK_TYPE_NUMBER,
  BLOCK_TYPE_PHONE_NUMBER,
  BLOCK_TYPE_RELATION,
  BLOCK_TYPE_RICH_TEXT,
  BLOCK_TYPE_SELECT,
  BLOCK_TYPE_STATUS,
  BLOCK_TYPE_TITLE,
  BLOCK_TYPE_URL,
  DGMDCC_BLOCK_DATE_END,
  DGMDCC_BLOCK_DATE_START,
  DGMDCC_BLOCK_ID,
  DGMDCC_BLOCK_METADATA,
  DGMDCC_BLOCK_PROPERTIES,
  DGMDCC_BLOCK_TYPE,
  DGMDCC_BLOCK_VALUE,
  SEARCH_DEPTH,
  SEARCH_INFO,
  SEARCH_QUERY,
  SEARCH_TYPE,
  SEARCH_TYPE_SIMPLE
} from './constants.js';

import {
  isNil,
  remove
} from 'lodash-es';

export const getPageMetadata = page => {
  return page[DGMDCC_BLOCK_METADATA];
};

export const getPageProperties = page => {
  return page[DGMDCC_BLOCK_PROPERTIES];
};

export const getPageId = page => 
  getPageMetadata(page)[DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE];

export const getPageProperty = (page, propertyKey) => {
  if (isNil(page)) {
    return null;
  }
  if (!(DGMDCC_BLOCK_PROPERTIES in page)) {
    return null;
  }
  const properties = getPageProperties(page);
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
        const aProps = getPageProperties(a);
        const bProps = getPageProperties(b);
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
// SEARCH UTIL
//
export const searchPages = ( pgs, searchObj ) => {

  const simpleSearchPage = ( 
    pg, searchObj, searchedPgsMap, searchTracker, depth ) => {

    const pgMetas = pg[DGMDCC_BLOCK_METADATA];
    const pgProps = pg[DGMDCC_BLOCK_PROPERTIES];
    const pgId = pgMetas[DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE];

    const searchInfo = searchObj[SEARCH_INFO];
    const query = searchInfo[SEARCH_QUERY].toLowerCase();
    const searchDepth = searchInfo[SEARCH_DEPTH];
    if (depth >= searchDepth) {
      return false;
    }
    const pgKeys = Object.keys( pgProps );

    for (const pgKey of pgKeys) {
      const pgProp = pgProps[pgKey];
      const pgVal = pgProp[DGMDCC_BLOCK_VALUE];
      if (!isNil(pgVal)) {
        const pgType = pgProp[DGMDCC_BLOCK_TYPE];
        if (pgType === BLOCK_TYPE_TITLE ||
            pgType === BLOCK_TYPE_RICH_TEXT ||
            pgType === BLOCK_TYPE_NUMBER ||
            pgType === BLOCK_TYPE_EMAIL ||
            pgType === BLOCK_TYPE_PHONE_NUMBER ||
            pgType === BLOCK_TYPE_URL ||
            pgType === BLOCK_TYPE_SELECT ||
            pgType === BLOCK_TYPE_STATUS) {
          
          const pgValLower = pgVal.toString().toLowerCase();
          if ( pgValLower.indexOf( query ) >= 0 ) {
              searchedPgsMap.set( pgId, true );
              return true;
          }
        }
        else if (pgType === BLOCK_TYPE_MULTI_SELECT) {
          for (const msVal of pgVal) {
            const msValLower = msVal.toString().toLowerCase();
            if (msValLower.indexOf( query ) >= 0) {
              searchedPgsMap.set( pgId, true );
              return true;
            }
          }
        }
      }
    }

    for (const pgKey of pgKeys) {
      const pgProp = pgProps[pgKey];
      const pgVal = pgProp[DGMDCC_BLOCK_VALUE];
      if (!isNil(pgVal)) {
        const pgType = pgProp[DGMDCC_BLOCK_TYPE];
        if (pgType === BLOCK_TYPE_RELATION) {
          for (const relPgObj of pgVal) {
            const relPgId = relPgObj['PAGE_ID'];
            if (!searchTracker.allSearched.includes( relPgId )) {
              const relDbId = relPgObj['DATABASE_ID'];
              const relPg = func.getPage( relDbId, relPgId );
              if (simpleSearchPage( relPg, searchObj, searchedPgsMap, searchTracker, depth + 1 )) {
                return true;
              }
            }
          }
        }
      }
    }

    return false;
  };

  const complexSearchPage = ( pg, searchInfo, depth ) => {
    if (isEmpty(searchInfo)) {
      return true;
    }

    const pgMetas = getPageMetadata( pg );
    const pgProps = getPageProperties( pg );

    const pgClears = [];
    const siRels = [];
    for (const si of searchInfo) {
      const siProp = si[SEARCH_PROPERTY];
      const pgData = siProp ? pgProps : pgMetas;
      const siField = si[SEARCH_FIELD];
      if (!(siField in pgData)) {
        pgClears.push( false );
        break;
      }

      const siInclude = si[SEARCH_INCLUDE];
      const pgVal = pgData[siField][DGMDCC_BLOCK_VALUE];
      const pgType = pgData[siField][DGMDCC_BLOCK_TYPE];

      const siQuery = si[SEARCH_QUERY];
      const nilSiQuery = isNil(siQuery);
      const nilPgVal = isNil(pgVal) || (Array.isArray(pgVal) && pgVal.length === 0);
      if (nilPgVal || nilSiQuery) {
        if ((nilPgVal === nilSiQuery) !== siInclude) {
          pgClears.push( false );
        }
        break;
      }

      if (pgType === BLOCK_TYPE_TITLE ||
          pgType === BLOCK_TYPE_RICH_TEXT ||
          pgType === BLOCK_TYPE_NUMBER ||
          pgType === BLOCK_TYPE_EMAIL ||
          pgType === BLOCK_TYPE_PHONE_NUMBER ||
          pgType === BLOCK_TYPE_URL ||
          pgType === BLOCK_TYPE_SELECT ||
          pgType === BLOCK_TYPE_STATUS) {
        
        const siQueryLower = siQuery.toLowerCase();
        const pgValLower = pgVal.toString().toLowerCase();
        const has = pgValLower.indexOf( siQueryLower ) >= 0;
        if (has !== siInclude) {
          pgClears.push( false );
          break;
        }
      }
      else if (pgType === BLOCK_TYPE_MULTI_SELECT) {
        const siQuery = si[SEARCH_QUERY];
        const siQueryLower = siQuery.toLowerCase();
        let hasMulti = false;
        for (const msVal of pgVal) {
          const msValLower = msVal.toString().toLowerCase();
          if (msValLower.indexOf( siQueryLower ) >= 0 ) {
            hasMulti = true;
          }
        }
        if (hasMulti !== siInclude) {
          pgClears.push( false );
          break;
        }
      }
      else if (pgType === BLOCK_TYPE_RELATION) {
        siRels.push( si );
      }
    }

    if (pgClears.includes(false)) {
      return false;
    }

    pgClears.length = 0;
    for (const si of siRels) {
      const siField = si[SEARCH_FIELD];
      const pgVal = pgProps[siField][DGMDCC_BLOCK_VALUE];
      for (const relPgObj of pgVal) {
        const relPgId = relPgObj['PAGE_ID'];
        const relDbId = relPgObj['DATABASE_ID'];
        const relPg = func.getPage( relDbId, relPgId );
        const s = complexSearchPage( relPg, si[SEARCH_QUERY], depth + 1 );
        if (s) {
          pgClears.length = 0;
          break;
        }
        else {
          pgClears.push( false );
        }
      }
    }

    const pgClear = !pgClears.includes(false);
    return pgClear;
  };

  const searchedPgs = new Map();
  const simple = searchObj[SEARCH_TYPE] === SEARCH_TYPE_SIMPLE;
  remove( pgs, pg => {
    const searchTracker = {
      allSearched: []
    };
    const found = simple ? 
      simpleSearchPage( pg, searchObj, searchedPgs, searchTracker, 0 ) : 
      complexSearchPage( pg, searchObj[SEARCH_INFO], 0 );
    return !found;
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
    const getId = obj => getPageMetadata(obj)[DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE];
  
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