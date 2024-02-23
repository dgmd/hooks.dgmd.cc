import {
  DGMD_BLOCK_TYPE_CHECKBOX,
  DGMD_BLOCK_TYPE_DATE,
  DGMD_BLOCK_TYPE_EMAIL,
  DGMD_BLOCK_TYPE_FORMULA_BOOLEAN,
  DGMD_BLOCK_TYPE_FORMULA_DATE,
  DGMD_BLOCK_TYPE_FORMULA_STRING,
  DGMD_BLOCK_TYPE_ID,
  DGMD_BLOCK_TYPE_MULTI_SELECT,
  DGMD_BLOCK_TYPE_NUMBER,
  DGMD_BLOCK_TYPE_PHONE_NUMBER,
  DGMD_BLOCK_TYPE_RELATION,
  DGMD_BLOCK_TYPE_RICH_TEXT,
  DGMD_BLOCK_TYPE_SELECT,
  DGMD_BLOCK_TYPE_STATUS,
  DGMD_BLOCK_TYPE_TITLE,
  DGMD_BLOCK_TYPE_URL,
  DGMD_DATABASE_ID,
  DGMD_END_DATE,
  DGMD_METADATA,
  DGMD_PROPERTIES,
  DGMD_RELATION_DATABASE_ID,
  DGMD_RELATION_PAGE_ID,
  DGMD_START_DATE,
  DGMD_TYPE,
  DGMD_VALUE
} from 'constants.dgmd.cc';
import {
  isEmpty,
  isNil,
  remove
} from 'lodash-es';
import moment from 'moment-timezone';

import {
  SEARCH_DEPTH,
  SEARCH_INFO,
  SEARCH_QUERY,
  SEARCH_TYPE,
  SEARCH_TYPE_COMPLEX,
  SEARCH_TYPE_SIMPLE
} from './constants.js';
import {
  getNotionDataPage,
  getNotionDataPages
} from './dataUtils.js';

export const getPageMetadata = page => {
  return page[DGMD_METADATA];
};

//todo - return keys, or keys & values
export const getPageProperties = page => {
  return page[DGMD_PROPERTIES];
};

export const getPageId = page => {
  return getPageMetadata(page)[DGMD_BLOCK_TYPE_ID][DGMD_VALUE];
}

//todo: getPropertyByPage & getPropertyByPageId & getPropertyKeysByPage & getPropertyKeysByPageId
export const getPageProperty = (page, propertyKey) => {
  if (isNil(page)) {
    return null;
  }
  if (!(DGMD_PROPERTIES in page)) {
    return null;
  }
  const properties = getPageProperties(page);
  if (!(propertyKey in properties)) {
    return null;
  }
  const propertyObject = properties[propertyKey];
  if (!(DGMD_VALUE in propertyObject)) {
    return null;
  }
  return propertyObject[DGMD_VALUE];
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
        const aVal = aField[DGMD_VALUE];
        const bVal = bField[DGMD_VALUE];
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

        const aType = aField[DGMD_TYPE];

        if (aType === DGMD_BLOCK_TYPE_DATE ||
            aType === DGMD_BLOCK_TYPE_FORMULA_DATE) {
          const aDateVal = moment.utc( aVal[DGMD_START_DATE] );
          const bDateVal = moment.utc( bVal[DGMD_START_DATE] );
          if (aDateVal.isBefore( bDateVal )) {
            return -1 * direction;
          }
          if (aDateVal.isAfter( bDateVal )) {
            return 1 * direction;
          }
          //aDateVal === bDateVal, so...
          const aEndDateVal = moment.utc( aVal[DGMD_END_DATE] );
          console.log( )
          const bEndDateVal = moment.utc( bVal[DGMD_END_DATE] );
          if (aEndDateVal.isBefore(bEndDateVal)) {
            return -1 * direction;
          }
          if (aEndDateVal.isAfter(bEndDateVal)) {
            return 1 * direction;
          }
        }
        if (aType === DGMD_BLOCK_TYPE_CHECKBOX) {
          if (!aVal && bVal) {
            return -1 * direction;
          }
          if (aVal && !bVal) {
            return 1 * direction;
          }
        }
        if (aType === DGMD_BLOCK_TYPE_MULTI_SELECT) {
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
export const searchPages = ( jsonObj, dbId, searchObj ) => {
  if (isNil(jsonObj) || isNil(dbId) || isNil(searchObj)) {
    return;
  }

  const simpleSearchPage = ( 
    pg, searchObj, searchedPgsMap, searchTracker, depth ) => {

    const pgMetas = pg[DGMD_METADATA];
    const pgProps = pg[DGMD_PROPERTIES];
    const pgId = pgMetas[DGMD_BLOCK_TYPE_ID][DGMD_VALUE];

    const searchInfo = searchObj[SEARCH_INFO];
    const searchDepth = searchInfo[SEARCH_DEPTH];
    if (depth >= searchDepth) {
      return false;
    }
    const pgKeys = Object.keys( pgProps );

    const queryRaw = SEARCH_QUERY in searchInfo ? 
      String(searchInfo[SEARCH_QUERY]).trim() : 
      '';
    const query = queryRaw.toLowerCase();
    if (query.length === 0) {
      return true;
    }

    for (const pgKey of pgKeys) {
      const pgProp = pgProps[pgKey];
      const pgVal = pgProp[DGMD_VALUE];
      if (!isNil(pgVal)) {
        const pgType = pgProp[DGMD_TYPE];

        //todo: handle date and formula date
        if (pgType === DGMD_BLOCK_TYPE_CHECKBOX ||
            pgType === DGMD_BLOCK_TYPE_TITLE ||
            pgType === DGMD_BLOCK_TYPE_RICH_TEXT ||
            pgType === DGMD_BLOCK_TYPE_NUMBER ||
            pgType === DGMD_BLOCK_TYPE_EMAIL ||
            pgType === DGMD_BLOCK_TYPE_PHONE_NUMBER ||
            pgType === DGMD_BLOCK_TYPE_URL ||
            pgType === DGMD_BLOCK_TYPE_SELECT ||
            pgType === DGMD_BLOCK_TYPE_STATUS ||
            pgType === DGMD_BLOCK_TYPE_FORMULA_STRING ||
            pgType === DGMD_BLOCK_TYPE_FORMULA_BOOLEAN) {
          
          const pgValLower = pgVal.toString().toLowerCase();
          if ( pgValLower.indexOf( query ) >= 0 ) {
              searchedPgsMap.set( pgId, true );
              return true;
          }
        }
        else if (pgType === DGMD_BLOCK_TYPE_MULTI_SELECT) {
          for (const msVal of pgVal) {
            const msValLower = msVal.toString().toLowerCase();
            if (msValLower.indexOf( query ) >= 0) {
              searchedPgsMap.set( pgId, true );
              return true;
            }
          }
        }
        else if (pgType === DGMD_BLOCK_TYPE_RELATION) {
        }
        else {
          console.log( 'need to handle', pgType );
        }
      }
    }

    for (const pgKey of pgKeys) {
      const pgProp = pgProps[pgKey];
      const pgVal = pgProp[DGMD_VALUE];
      if (!isNil(pgVal)) {
        const pgType = pgProp[DGMD_TYPE];
        if (pgType === DGMD_BLOCK_TYPE_RELATION) {
          for (const relPgObj of pgVal) {
            const relPgId = relPgObj[DGMD_RELATION_PAGE_ID];
            if (!searchTracker.allSearched.includes( relPgId )) {
              const relDbId = relPgObj[DGMD_DATABASE_ID];
              const relPg = getNotionDataPage( jsonObj, relDbId, relPgId );
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
      const pgVal = pgData[siField][DGMD_VALUE];
      const pgType = pgData[siField][DGMD_TYPE];

      const siQuery = si[SEARCH_QUERY];
      const nilSiQuery = isNil(siQuery);
      const nilPgVal = isNil(pgVal) || (Array.isArray(pgVal) && pgVal.length === 0);
      if (nilPgVal || nilSiQuery) {
        if ((nilPgVal === nilSiQuery) !== siInclude) {
          pgClears.push( false );
        }
        break;
      }

      if (pgType === DGMD_BLOCK_TYPE_TITLE ||
          pgType === DGMD_BLOCK_TYPE_RICH_TEXT ||
          pgType === DGMD_BLOCK_TYPE_NUMBER ||
          pgType === DGMD_BLOCK_TYPE_EMAIL ||
          pgType === DGMD_BLOCK_TYPE_PHONE_NUMBER ||
          pgType === DGMD_BLOCK_TYPE_URL ||
          pgType === DGMD_BLOCK_TYPE_SELECT ||
          pgType === DGMD_BLOCK_TYPE_STATUS) {
        
        const siQueryLower = siQuery.toLowerCase();
        const pgValLower = pgVal.toString().toLowerCase();
        const has = pgValLower.indexOf( siQueryLower ) >= 0;
        if (has !== siInclude) {
          pgClears.push( false );
          break;
        }
      }
      else if (pgType === DGMD_BLOCK_TYPE_MULTI_SELECT) {
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
      else if (pgType === DGMD_BLOCK_TYPE_RELATION) {
        siRels.push( si );
      }
    }

    if (pgClears.includes(false)) {
      return false;
    }

    pgClears.length = 0;
    for (const si of siRels) {
      const siField = si[SEARCH_FIELD];
      const pgVal = pgProps[siField][DGMD_VALUE];
      for (const relPgObj of pgVal) {
        const relPgId = relPgObj[DGMD_RELATION_PAGE_ID];
        const relDbId = relPgObj[DGMD_RELATION_DATABASE_ID];
        const relPg = getNotionDataPage( jsonObj, relDbId, relPgId );
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
  const searchType = searchObj[SEARCH_TYPE];
  const simple = searchType === SEARCH_TYPE_SIMPLE;
  const complex = searchType === SEARCH_TYPE_COMPLEX;
  const pgs = getNotionDataPages( jsonObj, dbId );
  remove( pgs, pg => {
    const searchTracker = {
      allSearched: []
    };
    if (simple) {
      return !simpleSearchPage( pg, searchObj, searchedPgs, searchTracker, 0 );
    }
    if (complex) {
      return !complexSearchPage( pg, searchObj[SEARCH_INFO], 0 );
    }
    return false;
  } );
};

export const mergePageLists = (existingList, incomingList) => {
  if (isNil(existingList)) {
    return incomingList;
  }
  if (isNil(incomingList)) {
    return existingList;
  }
  const getId = obj => getPageMetadata(obj)[DGMD_BLOCK_TYPE_ID][DGMD_VALUE];

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