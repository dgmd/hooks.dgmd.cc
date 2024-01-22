import {
  BLOCK_TYPE_RELATION,
  DGMDCC_BLOCKS,
  QUERY_RESPONSE_KEY_BLOCK_ID,
  QUERY_RESPONSE_KEY_CURSOR_DATA,
  QUERY_RESPONSE_KEY_DATABASE_ID,
  QUERY_RESPONSE_KEY_DATA_METADATA,
  QUERY_RESPONSE_KEY_DATA_PROPERTIES,
  QUERY_RESPONSE_KEY_DATA_TYPE,
  QUERY_RESPONSE_KEY_DATA_VALUE,
  QUERY_RESPONSE_KEY_PRIMARY_DATABASE,
  QUERY_RESPONSE_KEY_RELATION_DATABASES,
  QUERY_RESPONSE_KEY_SNAPSHOT_TIMESTAMP,
  QUERY_RESPONSE_KEY_SUCCESS
} from 'constants.dgmd.cc';
import {
  isNil,
} from 'lodash-es';

// # # #
export const isNotionDataLoaded = (jsonObject) => {
  return !isNil( jsonObject );
};

export const isNotionDataLive = (jsonObject) => {
  return isNil( jsonObject[QUERY_RESPONSE_KEY_SNAPSHOT_TIMESTAMP] );
};
  
export const isNotionDataValid = (jsonObject) => {
  if (!isNotionDataLoaded(jsonObject)) {
    return false;
  }
  const liveData = isNotionDataLive(jsonObject);
  return !( 
    isNil( getNotionDataPrimaryDbId(jsonObject, liveData) ) && 
    isNil( getNotionDataRelationDbIds(jsonObject, liveData) )
  );
};
  
export const getNotionDataPrimaryDbId = (jsonObject) => {
  if (isNil(jsonObject)) {
    return null;
  }
  try {
    const liveData = isNotionDataLive(jsonObject);
    const job = liveData ? jsonObject[DGMDCC] : jsonObject;
    return job[QUERY_RESPONSE_KEY_PRIMARY_DATABASE][QUERY_RESPONSE_KEY_DATABASE_ID];
  }
  catch( err ) {
    console.log( err );
    return null;
  }
};
  
export const getNotionDataRelationDbIds = (jsonObject) => {
  if (!isNil(jsonObject)) {
    try {
      const liveData = isNotionDataLive(jsonObject);
      const job = liveData ? jsonObject[DGMDCC] : jsonObject;
      return job[QUERY_RESPONSE_KEY_RELATION_DATABASES].map( db => db[QUERY_RESPONSE_KEY_DATABASE_ID] );
    }
    catch( err ) {
      console.log( err );
    }
  }
  return [];
};
  
export const getNotionDataDb = (jsonObject, dbId) => {
  if (isNil(jsonObject)) {
    return null;
  }
  const liveData = isNotionDataLive(jsonObject);
  if (liveData && jsonObject[QUERY_RESPONSE_KEY_SUCCESS] === false) {
    return null;
  }

  const job = liveData ? jsonObject[DGMDCC] : jsonObject;

  const primary = job[QUERY_RESPONSE_KEY_PRIMARY_DATABASE];
  if (primary[QUERY_RESPONSE_KEY_DATABASE_ID] === dbId) {
    return primary;
  }
  for (var i=0; i<job[QUERY_RESPONSE_KEY_RELATION_DATABASES].length; i++) {
    const db = job[QUERY_RESPONSE_KEY_RELATION_DATABASES][i];
    if (db[QUERY_RESPONSE_KEY_DATABASE_ID] === dbId) {
      return db;
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
  const cursorData = db[QUERY_RESPONSE_KEY_CURSOR_DATA];
  return cursorData;
};

export const hasNotionDataNextCursorData = (jsonObject) => {
  return !isNil( getNotionDataNextCursorData(jsonObject) );
};
  
export const getDbIdByName = (jsonObject, name) => {
  if (isNil(jsonObject)) {
    return null;
  }
  try {
    const primary = jsonObject[QUERY_RESPONSE_KEY_PRIMARY_DATABASE];
    if (primary[DGMDCC_DATABASE_TITLE] === name) {
      return primary[QUERY_RESPONSE_KEY_DATABASE_ID];
    }
    const rels = jsonObject[QUERY_RESPONSE_KEY_RELATION_DATABASES];
    for (var i=0; i<rels.length; i++) {
      const db = rels[i];
      if (db[DGMDCC_DATABASE_TITLE] === name) {
        return db[QUERY_RESPONSE_KEY_DATABASE_ID];
      }
    }
    return null;
  }
  catch( err ) {
    return null;
  }
};

export const getNotionDataPage = (jsonObject, dbId, pageId) => {
  const dbIds = isNil(dbId) ? getNotionDataAllDbIds( jsonObject ) : [dbId];
  for (const xdbId of dbIds) {
    const dbBlocks = getNotionDataPages( jsonObject, xdbId );
    const pageIdx = dbBlocks.findIndex( block => {
      const blockIdMeta = block[QUERY_RESPONSE_KEY_DATA_METADATA];
      const blockIdObj = blockIdMeta[QUERY_RESPONSE_KEY_BLOCK_ID];
      const blockId = blockIdObj[QUERY_RESPONSE_KEY_DATA_VALUE];
      return blockId === pageId;
    } );
    if (pageIdx >= 0) {
      return dbBlocks[pageIdx];
    }
  };
  return null;
};

export const getNotionDataPages = (jsonObject, dbId) => {
  if (isNil(jsonObject) || !isNotionDataValid(jsonObject)) {
    return [];
  }

  try {
    const db = getNotionDataDb( jsonObject, dbId );
    const dbBlocks = db[DGMDCC_BLOCKS];
    return dbBlocks;
  }
  catch( err ) {
    console.log( err );
    return [];
  }
};

// const getNotionDataPageIdx = (dbBlocks, pageId) => {
//   const pageIdx = dbBlocks.findIndex( block => {
//     const blockIdMeta = block[QUERY_RESPONSE_KEY_DATA_METADATA];
//     const blockIdObj = blockIdMeta[QUERY_RESPONSE_KEY_BLOCK_ID];
//     const blockId = blockIdObj[QUERY_RESPONSE_KEY_DATA_VALUE];
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
    const dbPgs = db[DGMDCC_BLOCKS];
    const idx = dbPgs.findIndex( x => 
      x[QUERY_RESPONSE_KEY_DATA_METADATA][QUERY_RESPONSE_KEY_BLOCK_ID][QUERY_RESPONSE_KEY_DATA_VALUE] === pgId );
    if (idx >= 0) {
      dbPgs.splice( idx, 1 );
    }
    for (const pg of dbPgs) {
      const pgProps = pg[QUERY_RESPONSE_KEY_DATA_PROPERTIES];
      for (const [key, value] of Object.entries(pgProps)) {
        if (value[QUERY_RESPONSE_KEY_DATA_TYPE] === BLOCK_TYPE_RELATION) {
          const relValue = value[QUERY_RESPONSE_KEY_DATA_VALUE];
          const relIdx = relValue.findIndex( x => 
            x['PAGE_ID'] === pgId );
          if (relIdx >= 0) {
            relValue.splice( relIdx, 1 );
          }
        }
      }
    }
  }
  return x;
}