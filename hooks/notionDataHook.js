import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

const NOTION_RESULT_PRIMARY_DATABASE = 'NOTION_RESULT_PRIMARY_DATABASE';
const NOTION_RESULT_RELATION_DATABASES = 'NOTION_RESULT_RELATION_DATABASES';
const NOTION_RESULT_DATABASE_ID = 'NOTION_RESULT_DATABASE_ID';
const NOTION_RESULT_BLOCKS = 'NOTION_RESULT_BLOCKS';
const NOTION_RESULT_CURSOR_DATA = 'NOTION_RESULT_CURSOR_DATA';

export const NOTION_RESULT = 'NOTION_RESULT';
export const NOTION_RESULT_SUCCESS = 'NOTION_RESULT_SUCCESS';
export const NOTION_ERROR = 'NOTION_ERROR';
export const NOTION_REQUEST = 'NOTION_REQUEST';

export const NOTION_QUERY = 'NOTION_QUERY';
export const NOTION_DATABASE = 'NOTION_DATABASE';

export const DGMDCC_BLOCK_TYPE = 'TYPE';
export const DGMDCC_BLOCK_VALUE = 'VALUE';

export const DGMDCC_BLOCK_METADATA = 'METADATA';
export const DGMDCC_BLOCK_PROPERTIES = 'PROPERTIES';

export const DGMDCC_BLOCK_ID = 'id';
export const DGMDCC_BLOCK_URL = 'url';

export const BLOCK_TYPE_CREATED_TIME = 'created_time';
export const BLOCK_TYPE_LAST_EDITED_TIME = 'last_edited_time'
export const BLOCK_TYPE_EMAIL = 'email';
export const BLOCK_TYPE_PHONE_NUMBER = 'phone_number';
export const BLOCK_TYPE_URL = 'url';
export const BLOCK_TYPE_SELECT = 'select';
export const BLOCK_TYPE_STATUS = 'status';
export const BLOCK_TYPE_TITLE = 'title';
export const BLOCK_TYPE_RICH_TEXT = 'rich_text';
export const BLOCK_TYPE_NUMBER = 'number';
export const BLOCK_TYPE_MULTI_SELECT = 'multi_select';
export const BLOCK_TYPE_CHECKBOX = 'checkbox';
export const BLOCK_TYPE_DATE = 'date';
export const BLOCK_TYPE_EMOJI = 'emoji';
export const BLOCK_TYPE_FILE_EXTERNAL = 'external';
export const BLOCK_TYPE_RELATION = 'relation';

export const DGMDCC_BLOCK_DATE_START = 'start';
export const DGMDCC_BLOCK_DATE_END = 'end';

const URL_SEARCH_PARAM_PAGE_CURSOR_TYPE_REQUEST = 'c';
const URL_SEARCH_PARAM_PAGE_CURSOR_ID_REQUEST = 'i';
const URL_PAGE_CURSOR_TYPE_SPECIFIC = 's';

const URL_SEARCH_PARAM_ACTION = 'a';
const URL_SEARCH_PARAM_DELETE_BLOCK_ID = 'dbi';
const URL_SEARCH_VALUE_ACTION_DELETE = 'd';
const URL_SEARCH_VALUE_ACTION_CREATE = 'c';
const URL_SEARCH_PARAM_CREATE_BLOCK_ID = 'cbi';
const URL_SEARCH_PARAM_CREATE_CHILDREN = 'cc';
const URL_SEARCH_PARAM_CREATE_META = 'cm';
const URL_SEARCH_VALUE_ACTION_UPDATE = 'u';
const URL_SEARCH_PARAM_UPDATE_BLOCK_ID = 'ubi';
const URL_SEARCH_PARAM_UPDATE_BLOCK = 'ub';
const URL_SEARCH_PARAM_UPDATE_META = 'um';

const SNAPSHOT_TIMESTAMP = 'SNAPSHOT_TIMESTAMP';

const NOTION_HAS_MORE = 'has_more';
const NOTION_NEXT_CURSOR = 'next_cursor';


export const CRUD_RESULT_STATUS = 'CRUD_RESULT_STATUS';
export const CRUD_ERROR = 'CRUD_ERROR';
export const CRUD_RESULT_STATUS_SUCCESS = 'CRUD_RESULT_STATUS_SUCCESS';
export const CRUD_RESULT_STATUS_FAILURE = 'CRUD_RESULT_STATUS_FAILURE';
export const CRUD_RESULT_STATUS_PENDING = 'CRUD_RESULT_STATUS_PENDING';

export const useNotionData = url => {

  const [urlObj, setUrlObj] = useState( null );

  const [jsonObject, setJsonObject] = useState( null );
  const rJsonObject = useRef( jsonObject );
  rJsonObject.current = jsonObject;

  const rSortRules = useRef( {} );
  const rSearchedTerms = useRef( {} );
  const rSearchedResults = useRef( {} );

  const rCursorPageNumbers = useRef( 30 );

  const [crudURL, setCrudURL] = useState( null );
  const rCRUDDING = useRef( false );

  const mData = useMemo( () => {

    const func = () => {};

    func.isLoaded = () => {
      return !isNil( rJsonObject.current );
    };

    func.isValid = () => {
      if (!func.isLoaded()) {
        return false;
      }
      return !( isNil( func.getPrimaryDbId() ) && isNil( func.getRelationDbIds() ) );
    };

    func.getDb = dbId => {
      if (!rJsonObject.current) {
        return null;
      }

      const live = func.isLiveData();
      if (live && rJsonObject.current[NOTION_RESULT_SUCCESS] === false) {
        return null;
      }

      const job = live ? rJsonObject.current[NOTION_RESULT] : rJsonObject.current;

      const primary = job[NOTION_RESULT_PRIMARY_DATABASE];
      if (primary[NOTION_RESULT_DATABASE_ID] === dbId) {
        return primary;
      }
      for (var i=0; i<job[NOTION_RESULT_RELATION_DATABASES].length; i++) {
        const db = job[NOTION_RESULT_RELATION_DATABASES][i];
        if (db[NOTION_RESULT_DATABASE_ID] === dbId) {
          return db;
        }
      }
      return null;
    };

    func.getPrimaryDbId = () => {
      if (!rJsonObject.current) {
        return null;
      }
      try {
        const live = func.isLiveData();
        const job = live ? rJsonObject.current[NOTION_RESULT] : rJsonObject.current;
        return job[NOTION_RESULT_PRIMARY_DATABASE][NOTION_RESULT_DATABASE_ID];
      }
      catch( err ) {
        return null;
      }
    };

    func.getRelationDbIds = () => {
      if (!rJsonObject.current) {
        return null;
      }
      try {
        const live = func.isLiveData();
        const job = live ? rJsonObject.current[NOTION_RESULT] : rJsonObject.current;
        return job[NOTION_RESULT_RELATION_DATABASES].map( db => db[NOTION_RESULT_DATABASE_ID] );
      }
      catch( err ) {
        return null;
      }
    };

    func.setPageCursorNumbers = num => {
      rCursorPageNumbers.current = num;
    };

    func.sortPages = ( dbId, fields, directions ) => {
      fields = Array.isArray(fields) ? fields : [];
      directions = Array.isArray(directions) ? directions : [];
      rSortRules.current = {
        dbId: {
          fields,
          directions
        }
      };
      return func._sortPages( dbId );
    };

    func._sortPages = ( dbId ) => {
      const getSortRules = dbId => {
        if (!(dbId in rSortRules.current)) {
          return {
            fields: [],
            directions: []
          };
        }
      };
      const pgs = func.getPages( dbId );
      const sortRules = getSortRules( dbId );
      const fields = sortRules.fields;
      const directions = sortRules.directions;
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
            if (aType === BLOCK_TYPE_MULTI_SELECT ||
                aType === BLOCK_TYPE_RELATION) {
              const aValJoin = aVal.join( ',' );
              const bValJoin = bVal.join( ',' );
              if (aValJoin < bValJoin) {
                return -1 * direction;
              }
              if (aValJoin > bValJoin) {
                return 1 * direction;
              }              
            }

            if (aVal < bVal) {
              return -1 * direction;
            }
            if (aVal > bVal) {
              return 1 * direction;
            }
          }
          catch (e) {
          }
        }
        return 0;
      } );

      if (fieldsLen > 0 && pgs.length > 1) {
        setJsonObject( x => JSON.parse( JSON.stringify( rJsonObject.current ) ) );
      }
      //todo: freeze the object on the way out
      return rJsonObject.current;
    };

    func.searchPages = ( dbId, searchTerms ) => {

      const searchPage = ( pg, searchLower, searchedPgsMap, depth ) => {
        const pgMetas = pg[DGMDCC_BLOCK_METADATA];
        const pgProps = pg[DGMDCC_BLOCK_PROPERTIES];
        const pgId = pgMetas[DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE];
        depth.push( pgId );
        if (searchedPgsMap.has( pgId )) {
          return searchedPgsMap.get( pgId );
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
              if ( pgValLower.indexOf( searchLower ) >= 0 ) {
                searchedPgsMap.set( pgId, true );
                return true;
              }
            }
            else if (pgType === BLOCK_TYPE_MULTI_SELECT) {
              for (const msVal of pgVal) {
                const msValLower = msVal.toString().toLowerCase();
                if (msValLower.indexOf( searchLower ) >= 0) {
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
              const relDbId = relPgObj['DATABASE_ID'];
              const relPgId = relPgObj['PAGE_ID'];
              //if you are cycling back to yourself, then 
              if (depth.includes( relPgId )) {
                searchedPgsMap.set( pgId, false );
                searchedPgsMap.set( relPgId, false );
                return false;
              }
              const relPg = func.getPage( relDbId, relPgId );
              if (searchPage( relPg, searchLower, searchedPgs, depth )) {
                searchedPgsMap.set( pgId, true );
                return true;
              }
            }
          }
        }
        }
        searchedPgsMap.set( pgId, false );
        return false;
      };

      const pgs = func.getPages( dbId );
      const searchTermsLower = searchTerms.toLowerCase();
      const searchedPgs = new Map();
      const searchedResults = pgs.filter( pg => {
        const depth = [];
        const found = searchPage( pg, searchTermsLower, searchedPgs, depth );
        return found;
      } );

      rSearchedTerms.current[dbId] = searchTerms;
      rSearchedResults.current[dbId] = searchedResults;

      return searchedResults;
    };

    func.getPages = dbId => {
      try {
        const db = func.getDb( dbId );
        const dbBlocks = db[NOTION_RESULT_BLOCKS];
        return dbBlocks;
      }
      catch( err ) {
        return [];
      }
    };

    func.getPageCursors = dbId => {
      const pgsLen = func.getPagesLength( dbId );
      return Math.floor( pgsLen / rCursorPageNumbers.current );
    };

    func.getPagesByCursor = ( dbId, cursor ) => {
      const pgsLen = func.getPagesLength( dbId );
      if (cursor >= pgsLen) {
        return [];
      }
      const pgs = func.getPages( dbId );
      return pgs.slice( cursor, cursor + rCursorPageNumbers.current );
    };

    func.getSearchedPages = ( dbId ) => {
      if (!(dbId in rSearchedTerms.current)) {
        return func.getPages( dbId );
      }
      const searchTerms = rSearchedTerms.current[dbId];
      if (searchTerms.trim() === '') {
        return func.getPages( dbId );
      }
      return rSearchedResults.current[dbId];
    };

    func.getPagesLength = dbId => {
      const db = func.getDb( dbId );
      if (isNil(db)) {
        return 0;
      }
      const dbBlocks = db[NOTION_RESULT_BLOCKS];
      return dbBlocks.length;
    };

    func.getSearchedPagesLength = dbId => {
      const searchedPgs = func.getSearchedPages( dbId );
      return searchedPgs.length;
    };

    func.getSearchedPagesByCursor = dbId => {
      const pgsLen = func.getSearchedPagesLength( dbId );
      if (cursor >= pgsLen) {
        return [];
      }
      const pgs = func.getSearchedPages( dbId );
      return pgs.slice( cursor, cursor + rCursorPageNumbers.current );
    };

    func.isLiveData = () => {
      return isNil( rJsonObject.current[SNAPSHOT_TIMESTAMP] );
    };

    func.deletePage = (dbId, pageId) => {

      const rObj = {
        [CRUD_RESULT_STATUS]: CRUD_RESULT_STATUS_FAILURE,
        [CRUD_ERROR]: null
      };

      if (rCRUDDING.current) {
        rObj[CRUD_ERROR] = `Already processing a CRUD operation`;
        return rObj;
      }

      const db = func.getDb( dbId );
      const dbBlocks = db[NOTION_RESULT_BLOCKS];
      const pageIdx = dbBlocks.findIndex( block => {
        const blockIdData = block[DGMDCC_BLOCK_METADATA][DGMDCC_BLOCK_ID];
        const blockId = blockIdData[DGMDCC_BLOCK_VALUE];
        return blockId === pageId;
      } );

      if (pageIdx < 0) {
        rObj[CRUD_ERROR] = `PageId ${ pageId } not found`;
        return rObj;
      }
  
      rCRUDDING.current = true;
      if (func.isLiveData()) {
        const blockIdData = dbBlocks[pageIdx][DGMDCC_BLOCK_METADATA][DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE];
        const updateUrl = new URL( '/api/update', urlObj.origin );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_ACTION, URL_SEARCH_VALUE_ACTION_DELETE );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_DELETE_BLOCK_ID, blockIdData );
        rObj[CRUD_RESULT_STATUS] = CRUD_RESULT_STATUS_PENDING;
        setCrudURL( x => updateUrl.href );
      }
      else {
        // no need to sort, since we're deleting
        dbBlocks.splice( pageIdx, 1 );
        setJsonObject( x => JSON.parse( JSON.stringify( rJsonObject.current ) ) );

        rCRUDDING.current = false;
        rObj[CRUD_RESULT_STATUS] = CRUD_RESULT_STATUS_SUCCESS;
      }

      return rObj;
    };

    func.createPage = (dbId, pageBlockData, pageMetaData) => {
      const rObj = {
        [CRUD_RESULT_STATUS]: CRUD_RESULT_STATUS_FAILURE,
        [CRUD_ERROR]: null
      };

      if (rCRUDDING.current) {
        rObj[CRUD_ERROR] = `Already processing a CRUD operation`;
        return rObj;
      }

      const db = func.getDb( dbId );
      const dbBlocks = db[NOTION_RESULT_BLOCKS];

      rCRUDDING.current = true;

      if (func.isLiveData()) {
        const blockList = {};
        for (const [key, userBlock] of Object.entries(pageBlockData)) {
          const nBlock = mmBlocktoNotionBlock( userBlock );
          if (!isNil(nBlock)) {
            blockList[key] = nBlock;
          }
        }
        const headerList = {};
        for (const [key, userBlock] of Object.entries(pageMetaData)) {
          const nBlock = mmBlocktoHeaderBlock( userBlock );
          if (!isNil(nBlock)) {
            headerList[key] = nBlock;
          }
        }

        const updateUrl = new URL( '/api/update', urlObj.origin );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_ACTION, URL_SEARCH_VALUE_ACTION_CREATE );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_CREATE_BLOCK_ID, dbId );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_CREATE_CHILDREN, JSON.stringify(blockList) );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_CREATE_META, JSON.stringify(headerList) );
        setCrudURL( x => updateUrl.href );
        rObj[CRUD_RESULT_STATUS] = CRUD_RESULT_STATUS_PENDING;
      }
      else {
        const uId = uniqueKey();
        pageMetaData[DGMDCC_BLOCK_ID] = {
          [DGMDCC_BLOCK_TYPE]: DGMDCC_BLOCK_ID,
          [DGMDCC_BLOCK_VALUE]: uId
        };
        const page = {
          [DGMDCC_BLOCK_PROPERTIES]: pageBlockData,
          [DGMDCC_BLOCK_METADATA]: pageMetaData
        };
        dbBlocks.unshift( page );
        setJsonObject( x => JSON.parse( JSON.stringify( rJsonObject.current ) ) );
        func._sortPages( func.getPrimaryDbId() );
        
        rCRUDDING.current = false;
        rObj[CRUD_RESULT_STATUS] = CRUD_RESULT_STATUS_SUCCESS;
      }
      return rObj;
    };

    func.updatePage = (dbId, pageId, pageBlockData, pageMetaData) => {

      const rObj = {
        [CRUD_RESULT_STATUS]: CRUD_RESULT_STATUS_FAILURE,
        [CRUD_ERROR]: null
      };

      if (rCRUDDING.current) {
        rObj[CRUD_ERROR] = `Already processing a CRUD operation`;
        return rObj;
      }

      const db = func.getDb( dbId );
      const dbBlocks = db[NOTION_RESULT_BLOCKS];
      const pageIdx = dbBlocks.findIndex( block => {
        const blockIdData = block[DGMDCC_BLOCK_METADATA][DGMDCC_BLOCK_ID];
        const blockId = blockIdData[DGMDCC_BLOCK_VALUE];
        return blockId === pageId;
      } );

      if (pageIdx < 0) {
        rObj[CRUD_ERROR] = `PageId ${ pageId } not found`;
        return rObj;
      }

      rCRUDDING.current = true;

      if (func.isLiveData()) {
        const rowIdData = dbBlocks[pageIdx][DGMDCC_BLOCK_METADATA][DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE];
        const list = {};
        for (const [key, userBlock] of Object.entries(pageBlockData)) {
          const mmBlock = mmBlocktoNotionBlock( userBlock );
          if (!isNil(mmBlock)) {
            list[key] = mmBlock;
          }
        }
        const metaList = {};
        for (const [key, userBlock] of Object.entries(pageMetaData)) {
          const mmBlock = mmBlocktoHeaderBlock( userBlock );
          if (!isNil(mmBlock)) {
            metaList[key] = mmBlock;
          }
        }

        const updateUrl = new URL( '/api/update', urlObj.origin );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_ACTION, URL_SEARCH_VALUE_ACTION_UPDATE );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_UPDATE_BLOCK_ID, rowIdData );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_UPDATE_BLOCK, JSON.stringify(list) );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_UPDATE_META, JSON.stringify(metaList) );
        rObj[CRUD_RESULT_STATUS] = CRUD_RESULT_STATUS_PENDING;
        setCrudURL( x => updateUrl.href );
      }
      else {
        const page = dbBlocks[pageIdx];
        const pageProps = page[DGMDCC_BLOCK_PROPERTIES];
        for (const [key, value] of Object.entries(pageBlockData)) {
          pageProps[key] = value;
        }

        const pageMetas = page[DGMDCC_BLOCK_METADATA];
        for (const [key, value] of Object.entries(pageMetaData)) {
          pageMetas[key] = value;
        }

        rCRUDDING.current = false;
        rObj[CRUD_RESULT_STATUS] = CRUD_RESULT_STATUS_SUCCESS;

        setJsonObject( x => JSON.parse( JSON.stringify( rJsonObject.current ) ) );
        func._sortPages( func.getPrimaryDbId() );
      }

      return rObj;
    };

    func.getPage = ( dbId, pageId ) => {
      const db = func.getDb( dbId );
      if (isNil(db)) {
        return null;
      }
      const dbBlocks = db[NOTION_RESULT_BLOCKS];
      const pageIdx = dbBlocks.findIndex( block => {
        const blockIdMeta = block[DGMDCC_BLOCK_METADATA];
        const blockIdObj = blockIdMeta[DGMDCC_BLOCK_ID];
        const blockId = blockIdObj[DGMDCC_BLOCK_VALUE];
        return blockId === pageId;
      } );
      if (pageIdx < 0) {
        return null;
      }
      return dbBlocks[pageIdx];
    };

    func.getRelationDataFromPgId = ( dbId, pageId, relationKey, relationField ) => {
      const pg = func.getPage( dbId, pageId );
      return func.getRelationDataFromPg( pg, relationKey, relationField );
    };

    func.getRelationDataFromPg = ( page, relationKey, relationField ) => {

      const relationData = page[DGMDCC_BLOCK_PROPERTIES][relationKey];
      if (isNil(relationData)) {
        return [];
      }
      const relationDataValue = relationData[DGMDCC_BLOCK_VALUE];
      if (isNil(relationDataValue) || 
          !Array.isArray(relationDataValue) ||
          relationDataValue.length === 0) {
        return [];
      }
      return relationDataValue.map( relation => {
        const rDbId = relation['DATABASE_ID'];
        const rPgId = relation['PAGE_ID'];
        const rPg = func.getPage( rDbId, rPgId );
        return rPg[DGMDCC_BLOCK_PROPERTIES][relationField][DGMDCC_BLOCK_VALUE];
      } );

    };

    func.hasNextCursorData = () => {
      return !isNil( func.getNextCursorData() );
    };

    func.getNextCursorData = () => {
      const db = func.getDb( func.getPrimaryDbId() );
      if (isNil(db)) {
        return null;
      }
      const cursorData = db[NOTION_RESULT_CURSOR_DATA];
      return cursorData;
    };

    func.hasAllCursors = () => {
      if (func.hasNextCursorData()) {
        return Array.isArray( func.getNextCursorData()[NOTION_NEXT_CURSOR] );
      }
    };

    func.getNextCursor = () => {
      const npcd = func.getNextCursorData();
      if (isNil(npcd)) {
        return null;
      }
      if (npcd[NOTION_HAS_MORE] === false) {
        return null;
      }
      return npcd[NOTION_NEXT_CURSOR];
    };

    func.hasNextCursor = () => {
      return !isNil( func.getNextCursor() );
    };

    func.loadNextCursor = () => {
      if (!func.isLiveData()) {
        return;
      }
      if (func.hasNextCursorData() && !func.hasAllCursors()) {
        const nc = func.getNextCursor();
        if (isNil(nc)) {
          return;
        }
        const params = new URLSearchParams(urlObj.search);
        params.set( URL_SEARCH_PARAM_PAGE_CURSOR_TYPE_REQUEST, URL_PAGE_CURSOR_TYPE_SPECIFIC );
        params.set( URL_SEARCH_PARAM_PAGE_CURSOR_ID_REQUEST, nc );

        const modifiedUrl = new URL(urlObj.origin + urlObj.pathname);
        modifiedUrl.search = params.toString();
        rCRUDDING.current = true;
        setCrudURL( x => {
          return modifiedUrl.href;
        } );
      }
    };

    return func;
  }, [
    jsonObject
  ] );

  useEffect( () => {

    async function fetchData() {
      try {
        const response = await fetch( url );
        const parsedJsonObject = await response.json( );
        console.log( 'parsedJsonObject', parsedJsonObject );

        setJsonObject( x => parsedJsonObject );
        mData._sortPages( mData.getPrimaryDbId() );
      }
      catch( err ) {
        console.log( 'err', err );
        //this is not sophisticated error handling
        //but forces a re-render and will move to 'invalid' state
        setJsonObject( x => {
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

    const getPgs = obj => {
      return obj[NOTION_RESULT][NOTION_RESULT_PRIMARY_DATABASE][NOTION_RESULT_BLOCKS];
    };

    async function fetchData() {
      const crudResponse = await fetch( crudURL );
      const parsedCrudJsonObject = await crudResponse.json( );

      const params = new URLSearchParams(crudURL);
      if (params.has( URL_SEARCH_PARAM_PAGE_CURSOR_TYPE_REQUEST )) {
        const exsPrimaryPgs = getPgs( rJsonObject.current );
        const newPrimaryPgs = getPgs( parsedCrudJsonObject );
        const merged = mergeLists( exsPrimaryPgs, newPrimaryPgs );
        rJsonObject.current[NOTION_RESULT][NOTION_RESULT_PRIMARY_DATABASE][NOTION_RESULT_BLOCKS] = merged;

        const relDbs = parsedCrudJsonObject[NOTION_RESULT][NOTION_RESULT_RELATION_DATABASES];
        for (const relDb of relDbs) {
          const relDbId = relDb[NOTION_RESULT_DATABASE_ID];
          const exDb = rJsonObject.current[NOTION_RESULT][NOTION_RESULT_RELATION_DATABASES].find( 
            db => db[NOTION_RESULT_DATABASE_ID] === relDbId );
          if (exDb) {
            const exRelPgs = exDb[NOTION_RESULT_BLOCKS];
            const newRelPgs = relDb[NOTION_RESULT_BLOCKS];
            const merged = mergeLists( exRelPgs, newRelPgs );
            exDb[NOTION_RESULT_BLOCKS] = merged;
          }
          else {
            rJsonObject.current[NOTION_RESULT][NOTION_RESULT_RELATION_DATABASES].push( relDb );
          }
        }

        const cursorData = 
          parsedCrudJsonObject[NOTION_RESULT][NOTION_RESULT_PRIMARY_DATABASE][NOTION_RESULT_CURSOR_DATA];
        rJsonObject.current[NOTION_RESULT][NOTION_RESULT_PRIMARY_DATABASE][NOTION_RESULT_CURSOR_DATA] = cursorData;

        const newJsonObject = JSON.parse( JSON.stringify( rJsonObject.current ) );
        rJsonObject.current = newJsonObject;
        setJsonObject( x => newJsonObject );
        func._sortPages( func.getPrimaryDbId() );
      }

      setCrudURL( x => null );
      rCRUDDING.current = false;
    }

    if (!isNil( crudURL ) && rCRUDDING.current) {
      fetchData( );
    }
  }, [
    crudURL
  ] );
  
  return [
    mData,
    jsonObject,
    rCRUDDING.current
  ];
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

export const getPageId = page => page[DGMDCC_BLOCK_METADATA][DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE];

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
//  UTILS
//
const uniqueKey = () => Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');

const isNil = ( value ) => {
  return value === null || value === undefined;
};

const deriveBoolean = ( value ) => {
  const str = String( value );
  const strLowTrim = str.toLowerCase().trim();
  return [
    'true',
    '1',
    'yes',
    'y',
    'on'
  ].includes( strLowTrim );
};

//
//  DATES
//

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