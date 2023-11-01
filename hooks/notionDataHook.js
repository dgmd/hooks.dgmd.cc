"use client"

import {
  useEffect,
  useState,
  useMemo,
  useRef
} from 'react';

const NOTION_RESULT_PRIMARY_DATABASE = 'NOTION_RESULT_PRIMARY_DATABASE';
const NOTION_RESULT_RELATION_DATABASES = 'NOTION_RESULT_RELATION_DATABASES';
const NOTION_RESULT_DATABASE_ID = 'NOTION_RESULT_DATABASE_ID';
const NOTION_RESULT_BLOCKS = 'NOTION_RESULT_BLOCKS';

export const NOTION_RESULT = 'NOTION_RESULT';
export const NOTION_RESULT_SUCCESS = 'NOTION_RESULT_SUCCESS';
export const NOTION_ERROR = 'NOTION_ERROR';
export const NOTION_REQUEST = 'NOTION_REQUEST';

export const NOTION_QUERY = 'NOTION_QUERY';
export const NOTION_DATABASE = 'NOTION_DATABASE';

export const EXPORT_DATA_TYPE = 'TYPE';
export const EXPORT_DATA_VALUE = 'VALUE';
export const DGMDCC_ID = 'id';
export const DGMDCC_URL = 'url';

const URL_SEARCH_PARAM_ACTION = 'a';
const URL_SEARCH_PARAM_DELETE_BLOCK_ID = 'dbi';
const URL_SEARCH_VALUE_ACTION_DELETE = 'd';
const URL_SEARCH_VALUE_ACTION_APPEND = 'a';
const URL_SEARCH_PARAM_APPEND_BLOCK_ID = 'abi';
const URL_SEARCH_PARAM_APPEND_CHILDREN = 'ac';
const URL_SEARCH_VALUE_ACTION_UPDATE = 'u';
const URL_SEARCH_PARAM_UPDATE_BLOCK_ID = 'ubi';
const URL_SEARCH_PARAM_UPDATE_BLOCK = 'ub';

const SNAPSHOT_TIMESTAMP = 'SNAPSHOT_TIMESTAMP';


const CRUD_RESULT_SUCCESS = 'CRUD_RESULT_SUCCESS';
const CRUD_ERROR = 'CRUD_ERROR';

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

    func.sortData = ( dbName, fields, directions ) => {
      const r = {
        [NOTION_RESULT_SUCCESS]: false,
        [NOTION_QUERY]: {
          [NOTION_DATABASE]: dbName,
          [NOTION_REQUEST]: 'sortData'
        }
      };

      const db = func.getDb( dbName );
      if (!isNil(db)) {
        const dbBlocks = db[NOTION_RESULT_BLOCKS];

        const fieldsLen = fields.length;

        if (!r[NOTION_ERROR]) {

          dbBlocks.sort( (a, b) => {
            for (let i = 0; i < fieldsLen; i++) {
              const field = fields[i];
              const direction = directions[i] ? 1 : -1;
              const aVal = a[field][EXPORT_DATA_VALUE];
              const bVal = b[field][EXPORT_DATA_VALUE];
              if (aVal < bVal) {
                return -1 * direction;
              }
              if (aVal > bVal) {
                return 1 * direction;
              }
            }
            return 0;
          } );

          r[NOTION_RESULT_SUCCESS] = true;
          r[NOTION_RESULT] = db;

        }
      }
      else {
        r[NOTION_ERROR] = `Database ${dbName} not found`;
      }
      return r;
    };

    func.getRowsLength = dbId => {
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
        [CRUD_RESULT_SUCCESS]: false,
        [CRUD_ERROR]: null
      };

      if (rCRUDDING.current) {
        rObj[CRUD_ERROR] = `Already processing a CRUD operation`;
        return rObj;
      }

      const db = func.getDb( dbId );
      const dbBlocks = db[NOTION_RESULT_BLOCKS];
      const pageIdx = dbBlocks.findIndex( page => {
        const rowIdData = page[DGMDCC_ID];
        const rowId = rowIdData[EXPORT_DATA_VALUE];
        return rowId === pageId;
      } );

      if (pageIdx < 0) {
        rObj[CRUD_ERROR] = `PageId ${ pageId } not found`;
        return rObj;
      }
  
      rCRUDDING.current = true;
      if (func.isLiveData()) {
        const rowIdData = dbBlocks[pageIdx][DGMDCC_ID][EXPORT_DATA_VALUE];
        const updateUrl = new URL( '/api/update', urlObj.origin );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_ACTION, URL_SEARCH_VALUE_ACTION_DELETE );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_DELETE_BLOCK_ID, rowIdData );
        setCrudURL( x => updateUrl.href );
      }
      else {
        dbBlocks.splice( pageIdx, 1 );
        setJsonObject( x => JSON.parse( JSON.stringify( rJsonObject.current ) ) );

        rCRUDDING.current = false;
        rObj[CRUD_RESULT_SUCCESS] = true;
      }

      return rObj;
    };

    func.insertPage = (dbId, rowData) => {
      const rObj = {
        [CRUD_RESULT_SUCCESS]: false,
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
        const list = {};
        for (const [key, value] of Object.entries(rowData)) {
          const mmBlock = mmBlocktoNotionBlock( value );
          if (!isNil(mmBlock)) {
            list[key] = mmBlock;
          }
        }
        const updateUrl = new URL( '/api/update', urlObj.origin );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_ACTION, URL_SEARCH_VALUE_ACTION_APPEND );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_APPEND_BLOCK_ID, dbId );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_APPEND_CHILDREN, JSON.stringify(list) );
        setCrudURL( x => updateUrl.href );
      }
      else {
        dbBlocks.unshift( rowData );
        setJsonObject( x => JSON.parse( JSON.stringify( rJsonObject.current ) ) );

        rCRUDDING.current = false;
        rObj[CRUD_RESULT_SUCCESS] = true;
      }
      return rObj;
    };

    func.updatePage = (dbId, pageId, updatesObj) => {

      const rObj = {
        [CRUD_RESULT_SUCCESS]: false,
        [CRUD_ERROR]: null
      };

      if (rCRUDDING.current) {
        rObj[CRUD_ERROR] = `Already processing a CRUD operation`;
        return rObj;
      }

      const db = func.getDb( dbId );
      const dbBlocks = db[NOTION_RESULT_BLOCKS];
      const pageIdx = dbBlocks.findIndex( page => {
        const rowIdData = page[DGMDCC_ID];
        const rowId = rowIdData[EXPORT_DATA_VALUE];
        return rowId === pageId;
      } );

      if (pageIdx < 0) {
        rObj[CRUD_ERROR] = `PageId ${ pageId } not found`;
        return rObj;
      }

      rCRUDDING.current = true;

      if (func.isLiveData()) {
        const rowIdData = dbBlocks[pageIdx][DGMDCC_ID][EXPORT_DATA_VALUE];
        const list = {};
        for (const [key, value] of Object.entries(updatesObj)) {
          const mmBlock = mmBlocktoNotionBlock( value );
          if (!isNil(mmBlock)) {
            list[key] = mmBlock;
          }
        }
        const updateUrl = new URL( '/api/update', urlObj.origin );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_ACTION, URL_SEARCH_VALUE_ACTION_UPDATE );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_UPDATE_BLOCK_ID, rowIdData );
        updateUrl.searchParams.append( URL_SEARCH_PARAM_UPDATE_BLOCK, JSON.stringify(list) );
        setCrudURL( x => updateUrl.href );
      }
      else {
        dbBlocks[pageIdx] = updatesObj;
        setJsonObject( x => JSON.parse( JSON.stringify( rJsonObject.current ) ) );

        rCRUDDING.current = false;
        rObj[CRUD_RESULT_SUCCESS] = true;
      }
      return rObj;
    };

    //todo: standard checks for null, etc on
    func.getPageTemplate = (dbId, makeId) => {
      const db = func.getDb( dbId );
      const dbBlocks = db[NOTION_RESULT_BLOCKS];
      const blockZed = dbBlocks[0];
      const blockClone = JSON.parse( JSON.stringify(blockZed) );

      Object.values(blockClone).forEach( value => {
        const valValue = value[EXPORT_DATA_VALUE];
        const valType = value[EXPORT_DATA_TYPE];
        if (valType === DGMDCC_ID || valType === DGMDCC_URL) {
        }
        else {
          if (Array.isArray(valValue)) {
            value[EXPORT_DATA_VALUE] = [];
          }
          else if (Number.isFinite(valValue)) {
            value[EXPORT_DATA_VALUE] = -1;
          }
          else if (typeof valValue === 'boolean') {
            value[EXPORT_DATA_VALUE] = false;
          }
          else {
            value[EXPORT_DATA_VALUE] = '';
          }
        }
      });

      if (makeId) {
        blockClone[DGMDCC_ID] = {
          [EXPORT_DATA_TYPE]: DGMDCC_ID,
          [EXPORT_DATA_VALUE]: crypto.randomUUID()
        };
        blockClone[DGMDCC_URL] = {
          [EXPORT_DATA_TYPE]: DGMDCC_URL,
          [EXPORT_DATA_VALUE]: crypto.randomUUID()
        };
      }
      else {
        delete blockClone[DGMDCC_ID];
        delete blockClone[DGMDCC_URL];
      }

      return blockClone;
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
  const type = block[EXPORT_DATA_TYPE];
  const value = block[EXPORT_DATA_VALUE];

  if (type === 'rich_text') {
    return {
      "rich_text": [ {
        "text": {
          "content": value
        }
      } ]
    };
  }
  if (type === 'title') {
    return {
      "title": [ {
        "text": {
          "content": value
        }
      } ]
    };
  }
  if (type === 'select') {
    return {
      "select": {
        "name": value
      }
    };
  }
  if (type === 'number') {
    return {
      "number": value
    };
  }
  if (type === 'multi_select') {

    const selects = value.map( v => {
      return {
        "name": v
      };
    } );

    return {
      "multi_select": selects
    };
  }
  if (type === 'checkbox') {
    return {
      "checkbox": value
    };
  }
  if (type === 'status') {
    return {
      'status': {
        "name": "In progress"
      }
    };
  }
  
  return null;
};

