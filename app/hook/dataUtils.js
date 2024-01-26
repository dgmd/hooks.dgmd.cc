import {
  DGMD_BLOCKS,
  DGMD_BLOCK_TYPE_ID,
  DGMD_BLOCK_TYPE_RELATION,
  DGMD_CURSOR_DATA,
  DGMD_DATABASE_ID,
  DGMD_DATABASE_TITLE,
  DGMD_METADATA,
  DGMD_PRIMARY_DATABASE,
  DGMD_PROPERTIES,
  DGMD_RELATION_DATABASES,
  DGMD_RELATION_PAGE_ID,
  DGMD_TYPE,
  DGMD_VALUE
} from 'constants.dgmd.cc';
import {
  isNil,
} from 'lodash-es';

import {
  DGMD_DATA,
  DGMD_LIVE_DATA,
  DGMD_VALID_DATA,
} from './constants.js';

export const isNotionDataLoaded = (jsonObject) => {
  return !isNil( jsonObject );
};

export const isNotionDataValid = (jsonObject) => {
  if (isNotionDataLoaded(jsonObject)) {
    return jsonObject[DGMD_VALID_DATA];
  }
  return false;
};

export const isNotionDataLive = (jsonObject) => {
  return jsonObject[DGMD_LIVE_DATA];
};
  
export const getNotionDataPrimaryDbId = (jsonObject) => {
  if (isNotionDataValid(jsonObject)) {
    try {
      const job = jsonObject[DGMD_DATA];
      return job[DGMD_PRIMARY_DATABASE][DGMD_DATABASE_ID];
    }
    catch( err ) {
      console.log( err );
    }
  }
  return null;
};
  
export const getNotionDataRelationDbIds = (jsonObject) => {
  if (isNotionDataValid(jsonObject)) {
    try {
      const job = jsonObject[DGMD_DATA];
      return job[DGMD_RELATION_DATABASES].map( db => db[DGMD_DATABASE_ID] );
    }
    catch( err ) {
      console.log( err );
    }
  }
  return [];
};
  
export const getNotionDataDb = (jsonObject, dbId) => {
  if (isNotionDataValid(jsonObject)) {
    const job = jsonObject[DGMD_DATA];

    const primary = job[DGMD_PRIMARY_DATABASE];
    if (primary[DGMD_DATABASE_ID] === dbId) {
      return primary;
    }
    for (var i=0; i<job[DGMD_RELATION_DATABASES].length; i++) {
      const db = job[DGMD_RELATION_DATABASES][i];
      if (db[DGMD_DATABASE_ID] === dbId) {
        return db;
      }
    }
  }
  return null;
};
  
export const getNextCursorData = (jsonObject) => {
  const primaryDbId = getNotionDataPrimaryDbId( jsonObject );
  const db = getNotionDataDb( jsonObject, primaryDbId );
  if (isNil(db)) {
    return null;
  }
  const cursorData = db[DGMD_CURSOR_DATA];
  return cursorData;
};

export const hasNotionDataNextCursorData = (jsonObject) => {
  return !isNil( getNotionDataNextCursorData(jsonObject) );
};
  
export const getDbIdByName = (jsonObject, name) => {
  if (isNotionDataValid(jsonObject)) {
    try {
      const primary = jsonObject[DGMD_PRIMARY_DATABASE];
      if (primary[DGMD_DATABASE_TITLE] === name) {
        return primary[DGMD_DATABASE_ID];
      }
      const rels = jsonObject[DGMD_RELATION_DATABASES];
      for (var i=0; i<rels.length; i++) {
        const db = rels[i];
        if (db[DGMD_DATABASE_TITLE] === name) {
          return db[DGMD_DATABASE_ID];
        }
      }
      return null;
    }
    catch( err ) {
      return null;
    }
  }
  return null;
};

export const getNotionDataPage = (jsonObject, dbId, pageId) => {
  const dbIds = isNil(dbId) ? getNotionDataAllDbIds( jsonObject ) : [dbId];
  for (const xdbId of dbIds) {
    const dbBlocks = getNotionDataPages( jsonObject, xdbId );
    const pageIdx = dbBlocks.findIndex( block => {
      const blockIdMeta = block[DGMD_METADATA];
      const blockIdObj = blockIdMeta[DGMD_BLOCK_TYPE_ID];
      const blockId = blockIdObj[DGMD_VALUE];
      return blockId === pageId;
    } );
    if (pageIdx >= 0) {
      return dbBlocks[pageIdx];
    }
  };
  return null;
};

export const getNotionDataPages = (jsonObject, dbId) => {
  if (isNotionDataValid(jsonObject)) {
    try {
      const db = getNotionDataDb( jsonObject, dbId );
      const dbBlocks = db[DGMD_BLOCKS];
      return dbBlocks;
    }
    catch( err ) {
      console.log( err );
    }
  }
  return [];
};

// const getNotionDataPageIdx = (dbBlocks, pageId) => {
//   const pageIdx = dbBlocks.findIndex( block => {
//     const blockIdMeta = block[DGMD_METADATA];
//     const blockIdObj = blockIdMeta[DGMD_BLOCK_TYPE_ID];
//     const blockId = blockIdObj[DGMD_VALUE];
//     return blockId === pageId;
//   } );
//   return pageIdx;
// };

export const getNotionDataAllDbIds = (notionData) => {
  return [ 
    getNotionDataPrimaryDbId(notionData, true), 
    ...getNotionDataRelationDbIds(notionData, true)
  ];
};


export const spliceNotionPage = (notionData, pgId) => {
  const x = structuredClone( notionData );

  const allDbIds = getNotionDataAllDbIds( x );

  for (const dbId of allDbIds) {
    const db = getNotionDataDb( x, dbId, true );
    const dbPgs = db[DGMD_BLOCKS];
    const idx = dbPgs.findIndex( x => 
      x[DGMD_METADATA][DGMD_BLOCK_TYPE_ID][DGMD_VALUE] === pgId );
    if (idx >= 0) {
      dbPgs.splice( idx, 1 );
    }
    for (const pg of dbPgs) {
      const pgProps = pg[DGMD_PROPERTIES];
      for (const [key, value] of Object.entries(pgProps)) {
        if (value[DGMD_TYPE] === DGMD_BLOCK_TYPE_RELATION) {
          const relValue = value[DGMD_VALUE];
          const relIdx = relValue.findIndex( x => 
            x[DGMD_RELATION_PAGE_ID] === pgId );
          if (relIdx >= 0) {
            relValue.splice( relIdx, 1 );
          }
        }
      }
    }
  }
  return x;
}