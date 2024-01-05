import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import {
  isNil
} from 'lodash-es';

import {
  getNotionDataPage,
  spliceNotionPage,
  isNotionDataLive,
  getNotionDataPages,
  getNotionDataDb
} from './dataUtils.js';

import {
  URL_SEARCH_PARAM_ACTION,
  URL_SEARCH_VALUE_ACTION_DELETE,
  URL_SEARCH_PARAM_DELETE_BLOCK_ID
} from './constants.js';

import {
  sortPages
} from './pageUtils.js';

export const useNotionData = url => {

  const [urlObj, setUrlObj] = useState( x => null );
  const [urlUpdateObj, setUrlUpdateObj] = useState( x => null );

  const [notionData, setNotionData] = useState( x => null );
  const [filteredNotionData, setFilteredNotionData] = useState( x => null );

  const updating = useRef( false );

  const [search, setSearch] = useState( x => null );
  const rSearch = useRef( search );
  const [sort, setSort] = useState( x => null );
  const rSort = useRef( sort );

  const handleCreate = useCallback ( () => {} );
  const handleUpdate = useCallback ( () => {} );
  const handleDelete = useCallback ( (dbId, pgId) => {
    if (updating.current) {
      return false;
    }
    const pg = getNotionDataPage( notionData, dbId, pgId );
    if (isNil(pg)) {
      return false;
    }
    if (isNotionDataLive(notionData)) {
      updating.current = true;
      const updateUrl = new URL( '/api/update', urlObj.origin );
      updateUrl.searchParams.append( URL_SEARCH_PARAM_ACTION, URL_SEARCH_VALUE_ACTION_DELETE );
      updateUrl.searchParams.append( URL_SEARCH_PARAM_DELETE_BLOCK_ID, pgId );
      setUrlUpdateObj( x => updateUrl.href );
    }
    else {
      setNotionData( x => spliceNotionPage( x, pgId ) );
      setFilteredNotionData( x => spliceNotionPage( x, pgId ) );
    }
    return true;
  }, [
    notionData,
    urlObj
  ] );

  // const [urlObj, setUrlObj] = useState( null );

  // const [jsonObject, setJsonObject] = useState( null );
  // const rJsonObject = useRef( jsonObject );
  // rJsonObject.current = jsonObject;

  // const rSortRules = useRef( {} );

  // const [searchResults, setSearchResults] = useState( {} );
  // const rSearchedResults = useRef( searchResults );

  // const [searchQueries, setSearchQueries] = useState( {} );
  // const rSearchQueries = useRef( searchQueries );

  // const rCursorPageNumbers = useRef( 30 );

  // const [crudURL, setCrudURL] = useState( null );
  // const rCRUDDING = useRef( false );

  // const mData = useMemo( () => {

  //   const func = () => {};

  //   func.isLoaded = () => {
  //     return isLoaded( rJsonObject.current );
  //   };

  //   func.isValid = () => {
  //     return isValid( rJsonObject.current );
  //   };

  //   func.getDb = dbId => {
  //     return getDb( rJsonObject.current, dbId );
  //   };

  //   func.getPrimaryDbId = () => {
  //     return getPrimaryDbId( rJsonObject.current );
  //   };

  //   func.getRelationDbIds = () => {
  //     return getRelationDbIds( rJsonObject.current );
  //   };

  //   func.getDbIdByName = name => {
  //     return getDbIdByName( rJsonObject.current, name );
  //   };

  //   func.setPageCursorNumbers = num => {
  //     rCursorPageNumbers.current = num;
  //   };


  //   func.searchPages = ( dbId, searchObj ) => {

  //     const simpleSearchPage = ( 
  //       pg, searchObj, searchedPgsMap, searchTracker, depth ) => {

  //       const pgMetas = pg[DGMDCC_BLOCK_METADATA];
  //       const pgProps = pg[DGMDCC_BLOCK_PROPERTIES];
  //       const pgId = pgMetas[DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE];

  //       const searchInfo = searchObj[SEARCH_INFO];
  //       const query = searchInfo[SEARCH_QUERY].toLowerCase();
  //       const searchDepth = searchInfo[SEARCH_DEPTH];
  //       if (depth >= searchDepth) {
  //         return false;
  //       }
  //       const pgKeys = Object.keys( pgProps );

  //       for (const pgKey of pgKeys) {
  //         const pgProp = pgProps[pgKey];
  //         const pgVal = pgProp[DGMDCC_BLOCK_VALUE];
  //         if (!isNil(pgVal)) {
  //           const pgType = pgProp[DGMDCC_BLOCK_TYPE];
  //           if (pgType === BLOCK_TYPE_TITLE ||
  //               pgType === BLOCK_TYPE_RICH_TEXT ||
  //               pgType === BLOCK_TYPE_NUMBER ||
  //               pgType === BLOCK_TYPE_EMAIL ||
  //               pgType === BLOCK_TYPE_PHONE_NUMBER ||
  //               pgType === BLOCK_TYPE_URL ||
  //               pgType === BLOCK_TYPE_SELECT ||
  //               pgType === BLOCK_TYPE_STATUS) {
              
  //             const pgValLower = pgVal.toString().toLowerCase();
  //             if ( pgValLower.indexOf( query ) >= 0 ) {
  //                 searchedPgsMap.set( pgId, true );
  //                 return true;
  //             }
  //           }
  //           else if (pgType === BLOCK_TYPE_MULTI_SELECT) {
  //             for (const msVal of pgVal) {
  //               const msValLower = msVal.toString().toLowerCase();
  //               if (msValLower.indexOf( query ) >= 0) {
  //                 searchedPgsMap.set( pgId, true );
  //                 return true;
  //               }
  //             }
  //           }
  //         }
  //       }

  //       for (const pgKey of pgKeys) {
  //         const pgProp = pgProps[pgKey];
  //         const pgVal = pgProp[DGMDCC_BLOCK_VALUE];
  //         if (!isNil(pgVal)) {
  //           const pgType = pgProp[DGMDCC_BLOCK_TYPE];
  //           if (pgType === BLOCK_TYPE_RELATION) {
  //             for (const relPgObj of pgVal) {
  //               const relPgId = relPgObj['PAGE_ID'];
  //               if (!searchTracker.allSearched.includes( relPgId )) {
  //                 const relDbId = relPgObj['DATABASE_ID'];
  //                 const relPg = func.getPage( relDbId, relPgId );
  //                 if (simpleSearchPage( relPg, searchObj, searchedPgsMap, searchTracker, depth + 1 )) {
  //                   return true;
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }

  //       return false;
  //     };

  //     const complexSearchPage = ( pg, searchInfo, depth ) => {
  //       const pgMetas = pg[DGMDCC_BLOCK_METADATA];
  //       const pgProps = pg[DGMDCC_BLOCK_PROPERTIES];

  //       const pgClears = [];
  //       const siRels = [];
  //       for (const si of searchInfo) {
  //         const siProp = si[SEARCH_PROPERTY];
  //         const pgData = siProp ? pgProps : pgMetas;
  //         const siField = si[SEARCH_FIELD];
  //         if (!(siField in pgData)) {
  //           pgClears.push( false );
  //           break;
  //         }

  //         const siInclude = si[SEARCH_INCLUDE];
  //         const pgVal = pgData[siField][DGMDCC_BLOCK_VALUE];
  //         const pgType = pgData[siField][DGMDCC_BLOCK_TYPE];

  //         const siQuery = si[SEARCH_QUERY];
  //         const nilSiQuery = isNil(siQuery);
  //         const nilPgVal = isNil(pgVal) || (Array.isArray(pgVal) && pgVal.length === 0);
  //         if (nilPgVal || nilSiQuery) {
  //           if ((nilPgVal === nilSiQuery) !== siInclude) {
  //             pgClears.push( false );
  //           }
  //           break;
  //         }

  //         if (pgType === BLOCK_TYPE_TITLE ||
  //             pgType === BLOCK_TYPE_RICH_TEXT ||
  //             pgType === BLOCK_TYPE_NUMBER ||
  //             pgType === BLOCK_TYPE_EMAIL ||
  //             pgType === BLOCK_TYPE_PHONE_NUMBER ||
  //             pgType === BLOCK_TYPE_URL ||
  //             pgType === BLOCK_TYPE_SELECT ||
  //             pgType === BLOCK_TYPE_STATUS) {
            
  //           const siQueryLower = siQuery.toLowerCase();
  //           const pgValLower = pgVal.toString().toLowerCase();
  //           const has = pgValLower.indexOf( siQueryLower ) >= 0;
  //           if (has !== siInclude) {
  //             pgClears.push( false );
  //             break;
  //           }
  //         }
  //         else if (pgType === BLOCK_TYPE_MULTI_SELECT) {
  //           const siQuery = si[SEARCH_QUERY];
  //           const siQueryLower = siQuery.toLowerCase();
  //           let hasMulti = false;
  //           for (const msVal of pgVal) {
  //             const msValLower = msVal.toString().toLowerCase();
  //             if (msValLower.indexOf( siQueryLower ) >= 0 ) {
  //               hasMulti = true;
  //             }
  //           }
  //           if (hasMulti !== siInclude) {
  //             pgClears.push( false );
  //             break;
  //           }
  //         }
  //         else if (pgType === BLOCK_TYPE_RELATION) {
  //           siRels.push( si );
  //         }
  //       }

  //       if (pgClears.includes(false)) {
  //         return false;
  //       }

  //       pgClears.length = 0;
  //       for (const si of siRels) {
  //         const siField = si[SEARCH_FIELD];
  //         const pgVal = pgProps[siField][DGMDCC_BLOCK_VALUE];
  //         for (const relPgObj of pgVal) {
  //           const relPgId = relPgObj['PAGE_ID'];
  //           const relDbId = relPgObj['DATABASE_ID'];
  //           const relPg = func.getPage( relDbId, relPgId );
  //           const s = complexSearchPage( relPg, si[SEARCH_QUERY], depth + 1 );
  //           if (s) {
  //             pgClears.length = 0;
  //             break;
  //           }
  //           else {
  //             pgClears.push( false );
  //           }
  //         }
  //       }

  //       const pgClear = !pgClears.includes(false);
  //       return pgClear;
  //     };

  //     if (isNil(searchObj)) {
  //       delete rSearchQueries.current[dbId];
  //       rSearchedResults[dbId] = [];
  //       setSearchQueries( x => null );  
  //       setSearchResults( x => [] );
  //       return [];
  //     }

  //     const pgs = func.getPages( dbId );
  //     const searchedPgs = new Map();
  //     const searchedResults = pgs.filter( pg => {
  //       const searchTracker = {
  //         allSearched: []
  //       };
  //       const simple = searchObj[SEARCH_TYPE] === SEARCH_TYPE_SIMPLE;
  //       const found = simple ? 
  //         simpleSearchPage( pg, searchObj, searchedPgs, searchTracker, 0 ) : 
  //         complexSearchPage( pg, searchObj[SEARCH_INFO], 0 );
  //       return found;
  //     } );

  //     Object.freeze( searchedResults );
  //     rSearchedResults.current[dbId] = searchedResults;
  //     setSearchResults( x => searchedResults );
  //     rSearchQueries.current[dbId] = searchObj;
  //     setSearchQueries( x => rSearchQueries.current );
  //     return searchedResults;
  //   };

  //   func._searchPages = ( dbId ) => {
  //     const searchObj = rSearchQueries.current[dbId];
  //     return func.searchPages( dbId, searchObj );
  //   };

  //   func.getPageCursors = dbId => {
  //     const pgsLen = func.getPagesLength( dbId );
  //     return Math.floor( pgsLen / rCursorPageNumbers.current );
  //   };

  //   func.getPagesByCursor = ( dbId, cursor ) => {
  //     const pgsLen = func.getPagesLength( dbId );
  //     if (cursor >= pgsLen) {
  //       return [];
  //     }
  //     const pgs = func.getPages( dbId );
  //     return pgs.slice( cursor, cursor + rCursorPageNumbers.current );
  //   };

  //   func.getSearchedPages = ( dbId ) => {
  //     if (!(dbId in rSearchQueries.current)) {
  //       return func.getPages( dbId );
  //     }
  //     return rSearchedResults.current[dbId];
  //   };

  //   func.getPagesLength = dbId => {
  //     const db = func.getDb( dbId );
  //     if (isNil(db)) {
  //       return 0;
  //     }
  //     const dbBlocks = db[NOTION_RESULT_BLOCKS];
  //     return dbBlocks.length;
  //   };

  //   func.getSearchedPagesLength = dbId => {
  //     const searchedPgs = func.getSearchedPages( dbId );
  //     return searchedPgs.length;
  //   };

  //   func.getSearchedPagesByCursor = (dbId, cursor) => {
  //     const pgsLen = func.getSearchedPagesLength( dbId );
  //     if (cursor >= pgsLen) {
  //       return [];
  //     }
  //     const pgs = func.getSearchedPages( dbId );
  //     return pgs.slice( cursor, cursor + rCursorPageNumbers.current );
  //   };

  //   func.deletePage = (dbId, pageId) => {

  //     const rObj = {
  //       [CRUD_RESULT_STATUS]: CRUD_RESULT_STATUS_FAILURE,
  //       [CRUD_ERROR]: null
  //     };

  //     if (rCRUDDING.current) {
  //       rObj[CRUD_ERROR] = `Already processing a CRUD operation`;
  //       return rObj;
  //     }

  //     const db = func.getDb( dbId );
  //     const dbBlocks = db[NOTION_RESULT_BLOCKS];
  //     const pageIdx = dbBlocks.findIndex( block => {
  //       const blockIdData = block[DGMDCC_BLOCK_METADATA][DGMDCC_BLOCK_ID];
  //       const blockId = blockIdData[DGMDCC_BLOCK_VALUE];
  //       return blockId === pageId;
  //     } );

  //     if (pageIdx < 0) {
  //       rObj[CRUD_ERROR] = `PageId ${ pageId } not found`;
  //       return rObj;
  //     }
  
  //     rCRUDDING.current = true;
  //     if (func.isLiveData()) {
  //       const blockIdData = dbBlocks[pageIdx][DGMDCC_BLOCK_METADATA][DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE];
  //       const updateUrl = new URL( '/api/update', urlObj.origin );
  //       updateUrl.searchParams.append( URL_SEARCH_PARAM_ACTION, URL_SEARCH_VALUE_ACTION_DELETE );
  //       updateUrl.searchParams.append( URL_SEARCH_PARAM_DELETE_BLOCK_ID, blockIdData );
  //       rObj[CRUD_RESULT_STATUS] = CRUD_RESULT_STATUS_PENDING;
  //       setCrudURL( x => updateUrl.href );
  //     }
  //     else {
  //       // no need to sort, since we're deleting
  //       dbBlocks.splice( pageIdx, 1 );
  //       setJsonObject( x => JSON.parse( JSON.stringify( rJsonObject.current ) ) );

  //       rCRUDDING.current = false;
  //       rObj[CRUD_RESULT_STATUS] = CRUD_RESULT_STATUS_SUCCESS;
  //     }

  //     return rObj;
  //   };

  //   func.createPage = (dbId, pageBlockData, pageMetaData) => {
  //     const rObj = {
  //       [CRUD_RESULT_STATUS]: CRUD_RESULT_STATUS_FAILURE,
  //       [CRUD_ERROR]: null
  //     };

  //     if (rCRUDDING.current) {
  //       rObj[CRUD_ERROR] = `Already processing a CRUD operation`;
  //       return rObj;
  //     }

  //     const db = func.getDb( dbId );
  //     const dbBlocks = db[NOTION_RESULT_BLOCKS];

  //     rCRUDDING.current = true;

  //     if (func.isLiveData()) {
  //       const blockList = {};
  //       for (const [key, userBlock] of Object.entries(pageBlockData)) {
  //         const nBlock = mmBlocktoNotionBlock( userBlock );
  //         if (!isNil(nBlock)) {
  //           blockList[key] = nBlock;
  //         }
  //       }
  //       const headerList = {};
  //       for (const [key, userBlock] of Object.entries(pageMetaData)) {
  //         const nBlock = mmBlocktoHeaderBlock( userBlock );
  //         if (!isNil(nBlock)) {
  //           headerList[key] = nBlock;
  //         }
  //       }

  //       const updateUrl = new URL( '/api/update', urlObj.origin );
  //       updateUrl.searchParams.append( URL_SEARCH_PARAM_ACTION, URL_SEARCH_VALUE_ACTION_CREATE );
  //       updateUrl.searchParams.append( URL_SEARCH_PARAM_CREATE_BLOCK_ID, dbId );
  //       updateUrl.searchParams.append( URL_SEARCH_PARAM_CREATE_CHILDREN, JSON.stringify(blockList) );
  //       updateUrl.searchParams.append( URL_SEARCH_PARAM_CREATE_META, JSON.stringify(headerList) );
  //       setCrudURL( x => updateUrl.href );
  //       rObj[CRUD_RESULT_STATUS] = CRUD_RESULT_STATUS_PENDING;
  //     }
  //     else {
  //       const uId = uniqueKey();
  //       pageMetaData[DGMDCC_BLOCK_ID] = {
  //         [DGMDCC_BLOCK_TYPE]: DGMDCC_BLOCK_ID,
  //         [DGMDCC_BLOCK_VALUE]: uId
  //       };
  //       const page = {
  //         [DGMDCC_BLOCK_PROPERTIES]: pageBlockData,
  //         [DGMDCC_BLOCK_METADATA]: pageMetaData
  //       };
  //       dbBlocks.unshift( page );
  //       setJsonObject( x => JSON.parse( JSON.stringify( rJsonObject.current ) ) );
  //       console.log( 'A' );
  //       func._sortPages( func.getPrimaryDbId() );
        
  //       rCRUDDING.current = false;
  //       rObj[CRUD_RESULT_STATUS] = CRUD_RESULT_STATUS_SUCCESS;
  //     }
  //     return rObj;
  //   };

  //   func.updatePage = (dbId, pageId, pageBlockData, pageMetaData) => {

  //     const rObj = {
  //       [CRUD_RESULT_STATUS]: CRUD_RESULT_STATUS_FAILURE,
  //       [CRUD_ERROR]: null
  //     };

  //     if (rCRUDDING.current) {
  //       rObj[CRUD_ERROR] = `Already processing a CRUD operation`;
  //       return rObj;
  //     }

  //     const db = func.getDb( dbId );
  //     const dbBlocks = db[NOTION_RESULT_BLOCKS];
  //     const pageIdx = dbBlocks.findIndex( block => {
  //       const blockIdData = block[DGMDCC_BLOCK_METADATA][DGMDCC_BLOCK_ID];
  //       const blockId = blockIdData[DGMDCC_BLOCK_VALUE];
  //       return blockId === pageId;
  //     } );

  //     if (pageIdx < 0) {
  //       rObj[CRUD_ERROR] = `PageId ${ pageId } not found`;
  //       return rObj;
  //     }

  //     rCRUDDING.current = true;

  //     if (func.isLiveData()) {
  //       const rowIdData = dbBlocks[pageIdx][DGMDCC_BLOCK_METADATA][DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE];
  //       const list = {};
  //       for (const [key, userBlock] of Object.entries(pageBlockData)) {
  //         const mmBlock = mmBlocktoNotionBlock( userBlock );
  //         if (!isNil(mmBlock)) {
  //           list[key] = mmBlock;
  //         }
  //       }
  //       const metaList = {};
  //       for (const [key, userBlock] of Object.entries(pageMetaData)) {
  //         const mmBlock = mmBlocktoHeaderBlock( userBlock );
  //         if (!isNil(mmBlock)) {
  //           metaList[key] = mmBlock;
  //         }
  //       }

  //       const updateUrl = new URL( '/api/update', urlObj.origin );
  //       updateUrl.searchParams.append( URL_SEARCH_PARAM_ACTION, URL_SEARCH_VALUE_ACTION_UPDATE );
  //       updateUrl.searchParams.append( URL_SEARCH_PARAM_UPDATE_BLOCK_ID, rowIdData );
  //       updateUrl.searchParams.append( URL_SEARCH_PARAM_UPDATE_BLOCK, JSON.stringify(list) );
  //       updateUrl.searchParams.append( URL_SEARCH_PARAM_UPDATE_META, JSON.stringify(metaList) );
  //       rObj[CRUD_RESULT_STATUS] = CRUD_RESULT_STATUS_PENDING;
  //       setCrudURL( x => updateUrl.href );
  //     }
  //     else {
  //       const page = dbBlocks[pageIdx];
  //       const pageProps = page[DGMDCC_BLOCK_PROPERTIES];
  //       for (const [key, value] of Object.entries(pageBlockData)) {
  //         pageProps[key] = value;
  //       }

  //       const pageMetas = page[DGMDCC_BLOCK_METADATA];
  //       for (const [key, value] of Object.entries(pageMetaData)) {
  //         pageMetas[key] = value;
  //       }

  //       rCRUDDING.current = false;
  //       rObj[CRUD_RESULT_STATUS] = CRUD_RESULT_STATUS_SUCCESS;

  //       setJsonObject( x => JSON.parse( JSON.stringify( rJsonObject.current ) ) );
  //       console.log( 'B' );
  //       func._sortPages( func.getPrimaryDbId() );
  //     }

  //     return rObj;
  //   };

  //   func.getPage = ( dbId, pageId ) => {
  //     return getPage( rJsonObject.current, dbId, pageId );
  //   };

  //   func.getRelationDataFromPgId = ( dbId, pageId, relationKey, relationField ) => {
  //     const pg = func.getPage( dbId, pageId );
  //     return func.getRelationDataFromPg( pg, relationKey, relationField );
  //   };

  //   func.getRelationDataFromPg = ( page, relationKey, relationField ) => {

  //     const relationData = page[DGMDCC_BLOCK_PROPERTIES][relationKey];
  //     if (isNil(relationData)) {
  //       return [];
  //     }
  //     const relationDataValue = relationData[DGMDCC_BLOCK_VALUE];
  //     if (isNil(relationDataValue) || 
  //         !Array.isArray(relationDataValue) ||
  //         relationDataValue.length === 0) {
  //       return [];
  //     }
  //     return relationDataValue.map( relation => {
  //       const rDbId = relation['DATABASE_ID'];
  //       const rPgId = relation['PAGE_ID'];
  //       const rPg = func.getPage( rDbId, rPgId );
  //       return rPg[DGMDCC_BLOCK_PROPERTIES][relationField][DGMDCC_BLOCK_VALUE];
  //     } );

  //   };

  //   func.hasNextCursorData = () => {
  //     return hasNextCursorData( rJsonObject.current );
  //   };

  //   func.getNextCursorData = () => {
  //     return getNextCursorData( rJsonObject.current );
  //   };

  //   func.hasAllCursors = () => {
  //     if (func.hasNextCursorData()) {
  //       return Array.isArray( func.getNextCursorData()[NOTION_NEXT_CURSOR] );
  //     }
  //   };

  //   func.getNextCursor = () => {
  //     const npcd = func.getNextCursorData();
  //     if (isNil(npcd)) {
  //       return null;
  //     }
  //     if (npcd[NOTION_HAS_MORE] === false) {
  //       return null;
  //     }
  //     return npcd[NOTION_NEXT_CURSOR];
  //   };

  //   func.hasNextCursor = () => {
  //     return !isNil( func.getNextCursor() );
  //   };

  //   func.loadNextCursor = () => {
  //     if (!func.isLiveData()) {
  //       return;
  //     }
  //     if (func.hasNextCursorData() && !func.hasAllCursors()) {
  //       const nc = func.getNextCursor();
  //       if (isNil(nc)) {
  //         return;
  //       }
  //       const params = new URLSearchParams(urlObj.search);
  //       params.set( URL_SEARCH_PARAM_PAGE_CURSOR_TYPE_REQUEST, URL_PAGE_CURSOR_TYPE_SPECIFIC );
  //       params.set( URL_SEARCH_PARAM_PAGE_CURSOR_ID_REQUEST, nc );

  //       const modifiedUrl = new URL(urlObj.origin + urlObj.pathname);
  //       modifiedUrl.search = params.toString();
  //       rCRUDDING.current = true;
  //       setCrudURL( x => {
  //         return modifiedUrl.href;
  //       } );
  //     }
  //   };

  //   if (func.isLoaded()) {
  //     console.log( 'CXXXX' );
  //     func._sortPages( func.getPrimaryDbId() );
  //     func._searchPages( func.getPrimaryDbId() );
  //   }

  //   return func;
  // }, [
  //   jsonObject,
  // ] );

  useEffect( () => {

    async function fetchData() {
      updating.current = true;
      try {
        const response = await fetch( url );
        const parsedJsonObject = await response.json( );

        updating.current = false;
        setNotionData( x => parsedJsonObject );
        setFilteredNotionData( x => searchAndSortData(
          parsedJsonObject, rSearch, rSort
        ) );
      }
      catch( err ) {
        console.log( err );
        updating.current = false;
        setNotionData( x => {
          return {};
        } );
        setFilteredNotionData( x => {
          return {};
        } );
      }
    }

    if (url) {
      setUrlObj( x => new URL( url ) );
      fetchData( );
    }

  }, [
    url
  ] );

  useEffect( () => {

    async function fetchData() {

      try {
        const crudResponse = await fetch( urlUpdateObj );
        const crudJson = await crudResponse.json( );

        // const params = new URLSearchParams( updateUrl );
        // if (params.has( URL_SEARCH_PARAM_PAGE_CURSOR_TYPE_REQUEST )) {
        //   const exsPrimaryPgs = getPrimaryPgs( newJsonObject );
        //   const newPrimaryPgs = getPrimaryPgs( crudJson );
        //   const merged = mergeLists( exsPrimaryPgs, newPrimaryPgs );
        //   newJsonObject[NOTION_RESULT][NOTION_RESULT_PRIMARY_DATABASE][NOTION_RESULT_BLOCKS] = merged;

        //   const relDbs = crudJson[NOTION_RESULT][NOTION_RESULT_RELATION_DATABASES];
        //   for (const relDb of relDbs) {
        //     const relDbId = relDb[NOTION_RESULT_DATABASE_ID];
        //     const exDb = newJsonObject[NOTION_RESULT][NOTION_RESULT_RELATION_DATABASES].find( 
        //       db => db[NOTION_RESULT_DATABASE_ID] === relDbId );
        //     if (exDb) {
        //       const exRelPgs = exDb[NOTION_RESULT_BLOCKS];
        //       const newRelPgs = relDb[NOTION_RESULT_BLOCKS];
        //       const merged = mergeLists( exRelPgs, newRelPgs );
        //       exDb[NOTION_RESULT_BLOCKS] = merged;
        //     }
        //     else {
        //       newJsonObject[NOTION_RESULT][NOTION_RESULT_RELATION_DATABASES].push( relDb );
        //     }
        //   }

        //   const cursorData = 
        //     crudJson[NOTION_RESULT][NOTION_RESULT_PRIMARY_DATABASE][NOTION_RESULT_CURSOR_DATA];
        //   newJsonObject[NOTION_RESULT][NOTION_RESULT_PRIMARY_DATABASE][NOTION_RESULT_CURSOR_DATA] = cursorData;

        //   update(newJsonObject);
        // }

        if (crudJson['result'] && crudJson['result']['delete']) {
            const delId = crudJson['result']['deleteId'];
            setNotionData( x => spliceNotionPage( x, delId ) );
            setFilteredNotionData( x => spliceNotionPage( x, delId ) );
        }
        // if (crudJson['result'] && crudJson['result']['create']) {
        //   const pg = crudJson['result']['page'];
        //   const dbId = crudJson['result']['dbId'];
        //   const db = getDb( newJsonObject, dbId, true );
        //   const dbBlocks = db[NOTION_RESULT_BLOCKS];
        //   dbBlocks.unshift( pg );
        //   update( newJsonObject );
        // }
        // if (crudJson['result'] && crudJson['result']['update']) {
        //   const pg = crudJson['result']['page'];
        //   const dbId = crudJson['result']['dbId'];
        //   const pgId = crudJson['result']['pgId'];
        //   const db = getDb( newJsonObject, dbId );
        //   const dbBlocks = db[NOTION_RESULT_BLOCKS];
        //   const idx = dbBlocks.findIndex( x => 
        //     x[DGMDCC_BLOCK_METADATA][DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE] === pgId );
        //   if (idx >= 0) {
        //     dbBlocks.splice( idx, 1, pg );
        //     update( newJsonObject );
        //   }
        // }

        updating.current = false;
      }

      catch ( e ) {
        console.log( 'error updating', e );
        updating.current = false;
      }

      setUrlUpdateObj( x => null );
    };

    if (!isNil(urlUpdateObj) && updating.current) {
      fetchData();
    }

  }, [
    notionData,
    urlUpdateObj
  ] );

  useEffect( () => {
    rSearch.current = search;
    rSort.current = sort;
    if (updating.current) {
      return;
    }
    setFilteredNotionData( x => searchAndSortData(
      notionData, search, sort
    ) );
  }, [
    search,
    sort
  ] );

  return {
    setSearch,
    setSort,
    handleCreate,
    handleUpdate,
    handleDelete,
    notionData,
    filteredNotionData,
    updating
  };
};

const searchAndSortData = ( jsonObject, search, sort ) => {
  const x = Object.assign( {}, jsonObject );

  //sort
  const sortEntries = Object.entries(sort);
  for (const [dbId, sortRules] of sortEntries) {
    const db = getNotionDataDb( x, dbId );
    if (db) {
      const pgs = getNotionDataPages( x, dbId );
      const fields = sortRules.fields;
      const directions = sortRules.directions;
      sortPages( pgs, fields, directions );
    }
  }

  console.log( 'x', x );

  return x;
};