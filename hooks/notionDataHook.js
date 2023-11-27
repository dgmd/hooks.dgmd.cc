

import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

const NOTION_RESULT_PRIMARY_DATABASE = 'NOTION_RESULT_PRIMARY_DATABASE';
const NOTION_RESULT_DATABASE_ID = 'NOTION_RESULT_DATABASE_ID';
const NOTION_RESULT_BLOCKS = 'NOTION_RESULT_BLOCKS';

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

    func.sortPages = ( dbId, fields, directions ) => {
      const pgs = func.getPages( dbId );
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
            if (aVal < bVal) {
              return -1 * direction;
            }
            if (aVal > bVal) {
              return 1 * direction;
            }
          }
          catch (e) {
          }
          return 0;
        }
      } );
      if (fieldsLen > 0 && pgs.length > 1) {
        setJsonObject( x => JSON.parse( JSON.stringify( rJsonObject.current ) ) );
      }
    };

    func.getPagesLength = dbId => {
      const db = func.getDb( dbId );
      if (isNil(db)) {
        return 0;
      }
      const dbBlocks = db[NOTION_RESULT_BLOCKS];
      return dbBlocks.length;
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
      }

      return rObj;
    };

    return func;
  }, [
    jsonObject
  ] );

  useEffect( () => {

    async function fetchData() {
      const response = await fetch( url );
      const parsedJsonObject = await response.json( );
      setJsonObject( x => parsedJsonObject );
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
      const crudResponse = await fetch( crudURL );
      const parsedCrudJsonObject = await crudResponse.json( );
      console.log( 'result', parsedCrudJsonObject );

      const response = await fetch( url );
      const parsedJsonObject = await response.json( );
      setJsonObject( x => parsedJsonObject );

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

const isNil = ( value ) => {
  return value === null || value === undefined;
};


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

export const getPageId = page => page[DGMDCC_BLOCK_METADATA][DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE];

const uniqueKey = () => Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
