import {
  CRUD_PARAM_CREATE_BLOCK_ID,
  CRUD_PARAM_CREATE_CHILDREN,
  CRUD_PARAM_CREATE_META,
  CRUD_PARAM_DELETE_BLOCK_ID,
  CRUD_PARAM_UPDATE_BLOCK,
  CRUD_PARAM_UPDATE_BLOCK_ID,
  CRUD_PARAM_UPDATE_META,
  CRUD_RESPONSE_CREATE,
  CRUD_RESPONSE_DB_ID,
  CRUD_RESPONSE_DELETE,
  CRUD_RESPONSE_DELETE_ID,
  CRUD_RESPONSE_PAGE,
  CRUD_RESPONSE_RESULT,
  CRUD_RESPONSE_RESULT_TYPE,
  CRUD_RESPONSE_UPDATE,
  CRUD_RESPONSE_UPDATE_BLOCKS,
  CRUD_RESPONSE_UPDATE_ID,
  CRUD_RESPONSE_UPDATE_METAS,
  DGMD_BLOCKS,
  DGMD_BLOCK_TYPE_ID,
  DGMD_DATABASE_ID,
  DGMD_METADATA,
  DGMD_PAGE_ID,
  DGMD_PRIMARY_DATABASE,
  DGMD_PROPERTIES,
  DGMD_RELATION_DATABASES,
  DGMD_TYPE,
  DGMD_VALUE,
  PROTO_RESPONSE_KEY_SNAPSHOT_TIMESTAMP,
  QUERY_PARAM_PAGE_CURSOR_ID_REQUEST,
  QUERY_PARAM_PAGE_CURSOR_TYPE_REQUEST,
  QUERY_RESPONSE_KEY_RESULT,
  QUERY_RESPONSE_KEY_SUCCESS,
  QUERY_VALUE_PAGE_CURSOR_TYPE_SPECIFIC
} from 'constants.dgmd.cc';
import {
  isNil,
  isObject,
  uniqueId
} from 'lodash-es';
import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import {
  IDGMD_DATA,
  IDGMD_FILTERED_DATA,
  IDGMD_LIVE_DATA,
  IDGMD_PRIMARY_DBID,
  IDGMD_RELATION_DBIDS,
  IDGMD_VALID_DATA
} from './constants.js';
import {
  getNotionDataNextCursor
} from './cursorUtils.js';
import {
  getNotionDataDb,
  getNotionDataPage,
  getNotionDataPages,
  getNotionDataPrimaryDbId,
  getNotionDataRelationDbIds,
  isNotionDataLive,
  spliceNotionPage
} from './dataUtils.js';
import {
  mergePageLists
} from './pageUtils.js';

// Operation type constants
export const LOAD = 'LOAD';
export const CREATE = 'CREATE';
export const UPDATE = 'UPDATE';
export const DELETE = 'DELETE';
export const NEXT_CURSOR = 'NEXT_CURSOR';

// Operation data field constants
export const OPERATION_DATA = 'OPERATION_DATA';
export const OPERATION_TYPE = 'OPERATION_TYPE'; 
export const OPERATION_ID = 'OPERATION_ID';

export const useNotionData = url => {
  const [notionData, setNotionData] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [operationType, setOperationType] = useState(null);
  const [operationId, setOperationId] = useState(null);
  const operationIdCounterRef = useRef(0);
  const urlRef = useRef(null);
  const activeRequestRef = useRef(null);

  // Generate a unique operation ID
  const getNextOperationId = useCallback(() => {
    operationIdCounterRef.current += 1;
    return operationIdCounterRef.current;
  }, []);

  // Cancel any active request
  const cancelRequest = useCallback(() => {
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
      activeRequestRef.current = null;
      setUpdating(false);
      setProgress(null);
      setOperationType(null);
      setOperationId(null);
      return true;
    }
    return false;
  }, []);

  // Reset operation states
  const resetOperationState = useCallback(() => {
    setError(null);
    setProgress(null);
    setResult(null);
    // We don't reset operation context here because we want to keep tracking the operation
  }, []);

  // Helper function to add operation context and set result
  const enrichResult = useCallback((result, type, id) => {
    const enrichedResult = {
      ...result,
      [OPERATION_DATA]: {
        [OPERATION_TYPE]: type,
        [OPERATION_ID]: id
      }
    };
    
    // Set the result state
    setResult(enrichedResult);
    
    return enrichedResult;
  }, []);
  
  // Helper function to prepare operation and return operation ID
  const prepareOperation = useCallback((type) => {
    resetOperationState();
    const currentOpId = getNextOperationId();
    setOperationId(currentOpId);
    setOperationType(type);
    return currentOpId;
  }, [resetOperationState, getNextOperationId]);
  
  // Helper function to append files to FormData
  const appendFilesToFormData = useCallback((formData, files) => {
    if (Array.isArray(files)) {
      files.forEach((fileObj) => {
        if (fileObj.file instanceof File) {
          formData.append(fileObj.uid, fileObj.file, fileObj.file.name);
        } else if (fileObj.file instanceof Blob) {
          formData.append(fileObj.uid, fileObj.file, `blob_${fileObj.uid}.dat`);
        }
      });
    }
    else if (files && files.file) {
      if (files.file instanceof File) {
        formData.append(files.uid, files.file, files.file.name);
      } else if (files.file instanceof Blob) {
        formData.append(files.uid, files.file, `blob_${files.uid}.dat`);
      }
    }
  }, []);
  
  // Helper function to create and configure XHR requests
  const createXhrRequest = useCallback((method, url, options = {}) => {
    const { onProgress, onLoad, onError, formData, jsonData } = options;
    
    const xhr = new XMLHttpRequest();
    activeRequestRef.current = xhr;
    xhr.open(method, url, true);
    
    // Set up progress tracking
    if (onProgress) {
      if (method === 'GET') {
        xhr.onprogress = onProgress;
      } else {
        xhr.upload.onprogress = onProgress;
      }
    }
    
    // Set up load handler
    xhr.onload = () => {
      setProgress(100); // Always set progress to 100% when response is received
      
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onLoad) {
          try {
            const response = JSON.parse(xhr.responseText);
            onLoad(response);
          } catch(err) {
            console.log(err);
            setError(err.message || 'Error processing response');
            if (onError) onError(err);
          }
        }
      } else {
        const errorMsg = `HTTP error: ${xhr.status}`;
        setError(errorMsg);
        if (onError) onError(new Error(errorMsg));
      }
      
      // Always clean up
      setUpdating(false);
      activeRequestRef.current = null;
    };
    
    // Set up error handler
    xhr.onerror = () => {
      const errorMsg = 'Network error';
      console.log(errorMsg);
      setError(errorMsg);
      setProgress(100); // Set progress to 100 even on error
      setUpdating(false);
      activeRequestRef.current = null;
      
      if (onError) onError(new Error(errorMsg));
    };
    
    // Send the request with the appropriate data
    if (formData) {
      xhr.send(formData);
    } else if (jsonData) {
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(jsonData));
    } else {
      xhr.send();
    }
    
    return xhr;
  }, []);

  // Function to load data using XHR
  const loadNotionData = useCallback((dataUrl) => {
    cancelRequest();
    setUpdating(true);
    setProgress(0);
    
    const currentOpId = prepareOperation(LOAD);
    
    return new Promise((resolve, reject) => {
      createXhrRequest('GET', dataUrl, {
        onProgress: (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setProgress(percentComplete);
          }
        },
        onLoad: (parsedData) => {
          const validStatus = parsedData[QUERY_RESPONSE_KEY_SUCCESS];
          
          if (isNil(validStatus) || !validStatus) {
            const errorMsg = 'Invalid data';
            setError(errorMsg);
            setNotionData({
              [IDGMD_VALID_DATA]: false,
            });
            reject(new Error(errorMsg));
            return;
          }
          
          const processedData = processQueryData(parsedData);
          setNotionData(processedData);
          const enrichedData = enrichResult(processedData, LOAD, currentOpId);
          resolve(enrichedData);
        },
        onError: reject
      });
    });
  }, [cancelRequest, prepareOperation, enrichResult, createXhrRequest]);

  // Initial data load
  useEffect(() => {
    if (!url) return;
    
    loadNotionData(url);
    urlRef.current = new URL(url);
  }, [url, loadNotionData]);

  // Handle create operation
  const handleCreate = useCallback((update, files = null) => {
    if (updating) {
      cancelRequest();
    }

    if (!(DGMD_DATABASE_ID in update)) {
      setError('Missing database ID');
      return [null, Promise.reject(new Error('Missing database ID'))];
    }
    
    const dbId = update[DGMD_DATABASE_ID];
    const db = getNotionDataDb(notionData, dbId);
    if (isNil(db)) {
      setError('Invalid database ID');
      return [null, Promise.reject(new Error('Invalid database ID'))];
    }
    
    const pgUpdateMeta = update[DGMD_METADATA];
    const pgUpdateMetas = isObject(pgUpdateMeta) ? pgUpdateMeta : {};
    const pgUpdateProp = update[DGMD_PROPERTIES];
    const pgUpdateProps = isObject(pgUpdateProp) ? pgUpdateProp : {};
    
    const currentOpId = prepareOperation(CREATE);
    
    if (isNotionDataLive(notionData)) {
      setUpdating(true);
      
      const createPromise = new Promise((resolve, reject) => {
        const createUrl = new URL('/api/update', urlRef.current.origin);
        const hasFiles = files && (Array.isArray(files) ? files.length > 0 : files.file instanceof File || files.file instanceof Blob);
        
        // Prepare data
        let formData = null;
        let jsonData = null;
        
        if (hasFiles) {
          formData = new FormData();
          
          // Add payload data as JSON
          formData.append(CRUD_PARAM_CREATE_BLOCK_ID, dbId);
          formData.append(
            CRUD_PARAM_CREATE_CHILDREN, 
            JSON.stringify(structuredClone(pgUpdateProps))
          );
          formData.append(
            CRUD_PARAM_CREATE_META, 
            JSON.stringify(structuredClone(pgUpdateMetas))
          );
          
          // Add files to FormData using helper function
          appendFilesToFormData(formData, files);
        } else {
          jsonData = {
            [CRUD_PARAM_CREATE_BLOCK_ID]: dbId,
            [CRUD_PARAM_CREATE_META]: structuredClone(pgUpdateMetas),
            [CRUD_PARAM_CREATE_CHILDREN]: structuredClone(pgUpdateProps)
          };
        }
        
        createXhrRequest('POST', createUrl.href, {
          formData,
          jsonData,
          onProgress: (event) => {
            if (event.lengthComputable) {
              const rawPercentComplete = Math.round((event.loaded / event.total) * 50);
              const cappedPercentComplete = Math.min(50, rawPercentComplete);
              setProgress(cappedPercentComplete);
            }
          },
          onLoad: (crudJson) => {
            if (CRUD_RESPONSE_RESULT in crudJson) {
              const result = crudJson[CRUD_RESPONSE_RESULT];
              const resultType = crudJson[CRUD_RESPONSE_RESULT_TYPE];
              const success = result[resultType];
              
              if (success && resultType === CRUD_RESPONSE_CREATE) {
                const pg = result[CRUD_RESPONSE_PAGE];
                const dbId = result[CRUD_RESPONSE_DB_ID];
                
                setNotionData(x => {
                  const clone = structuredClone(x);
                  const dbBlocks = getNotionDataPages(clone, dbId);
                  dbBlocks.unshift(pg);
                  return clone;
                });
                
                resolve(enrichResult(result, CREATE, currentOpId));
              } else {
                const errorMsg = 'Create operation failed';
                setError(errorMsg);
                reject(new Error(errorMsg));
              }
            }
          },
          onError: reject
        });
      });
      
      return [currentOpId, createPromise];
    } else {
      // For non-live data, handle locally
      setProgress(0);
      setUpdating(true);
      
      const uId = uniqueId('page_');
      pgUpdateMetas[DGMD_BLOCK_TYPE_ID] = {
        [DGMD_TYPE]: DGMD_BLOCK_TYPE_ID,
        [DGMD_VALUE]: uId
      };
      const page = {
        [DGMD_PROPERTIES]: pgUpdateProps,
        [DGMD_METADATA]: pgUpdateMetas
      };
      
      setNotionData(d => {
        const x = structuredClone(notionData);
        const xPgs = getNotionDataPages(x, dbId);
        xPgs.unshift(page);
        return x;
      });
      
      setProgress(100);
      setUpdating(false);
      
      const result = { page };
      return [currentOpId, Promise.resolve(enrichResult(result, CREATE, currentOpId))];
    }
  }, [notionData, updating, urlRef, cancelRequest, prepareOperation, appendFilesToFormData, createXhrRequest, enrichResult]);

  // Handle update operation
  const handleUpdate = useCallback((update, files = null) => {
    if (updating) {
      cancelRequest();
    }
    
    // Validate required fields
    if (!(DGMD_DATABASE_ID in update)) {
      setError('Missing database ID');
      return [null, Promise.reject(new Error('Missing database ID'))];
    }
    
    const dbId = update[DGMD_DATABASE_ID];
    const db = getNotionDataDb(notionData, dbId);
    if (isNil(db)) {
      setError('Invalid database ID');
      return [null, Promise.reject(new Error('Invalid database ID'))];
    }
    
    if (!(DGMD_PAGE_ID in update)) {
      setError('Missing page ID');
      return [null, Promise.reject(new Error('Missing page ID'))];
    }
    
    const pgId = update[DGMD_PAGE_ID];
    const pgUpdateMeta = update[DGMD_METADATA];
    const pgUpdateMetas = isObject(pgUpdateMeta) ? pgUpdateMeta : {};
    const pgUpdateProp = update[DGMD_PROPERTIES];
    const pgUpdateProps = isObject(pgUpdateProp) ? pgUpdateProp : {};
    
    const currentOpId = prepareOperation(UPDATE);
    
    if (isNotionDataLive(notionData)) {
      setUpdating(true);
      
      const updatePromise = new Promise((resolve, reject) => {
        const updateUrl = new URL('/api/update', urlRef.current.origin);
        const hasFiles = files && (Array.isArray(files) ? files.length > 0 : files.file instanceof File || files.file instanceof Blob);
        
        // Prepare data
        let formData = null;
        let jsonData = null;
        
        if (hasFiles) {
          formData = new FormData();
          
          // Add payload data
          formData.append(CRUD_PARAM_UPDATE_BLOCK_ID, pgId);
          formData.append(
            CRUD_PARAM_UPDATE_BLOCK, 
            JSON.stringify(structuredClone(pgUpdateProps))
          );
          formData.append(
            CRUD_PARAM_UPDATE_META, 
            JSON.stringify(structuredClone(pgUpdateMetas))
          );
          
          // Add files using helper function
          appendFilesToFormData(formData, files);
        } else {
          jsonData = {
            [CRUD_PARAM_UPDATE_BLOCK_ID]: pgId,
            [CRUD_PARAM_UPDATE_BLOCK]: structuredClone(pgUpdateProps),
            [CRUD_PARAM_UPDATE_META]: structuredClone(pgUpdateMetas)
          };
        }
        
        createXhrRequest('PUT', updateUrl.href, {
          formData,
          jsonData,
          onProgress: (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              setProgress(percentComplete);
            }
          },
          onLoad: (crudJson) => {
            if (CRUD_RESPONSE_RESULT in crudJson) {
              const result = crudJson[CRUD_RESPONSE_RESULT];
              const resultType = crudJson[CRUD_RESPONSE_RESULT_TYPE];
              const success = result[resultType];
              
              if (success && resultType === CRUD_RESPONSE_UPDATE) {
                const pg = result[CRUD_RESPONSE_PAGE];
                const dbId = result[CRUD_RESPONSE_DB_ID];
                const pgId = result[CRUD_RESPONSE_UPDATE_ID];
                
                setNotionData(x => {
                  const clone = structuredClone(x);
                  const dbBlocks = getNotionDataPages(clone, dbId);
                  const idx = dbBlocks.findIndex(x => 
                    x[DGMD_METADATA][DGMD_BLOCK_TYPE_ID][DGMD_VALUE] === pgId);
                  if (idx >= 0) {
                    dbBlocks.splice(idx, 1, pg);
                  }
                  return clone;
                });
                
                const resultObj = {
                  metas: result[CRUD_RESPONSE_UPDATE_METAS].length,
                  blocks: result[CRUD_RESPONSE_UPDATE_BLOCKS].length,
                  pageId: pgId,
                  dbId: dbId,
                };
                resolve(enrichResult(resultObj, UPDATE, currentOpId));
              } else {
                const errorMsg = 'Update operation failed';
                setError(errorMsg);
                reject(new Error(errorMsg));
              }
            }
          },
          onError: reject
        });
      });
      
      return [currentOpId, updatePromise];
    }
    else {
      // For non-live data, handle locally
      setProgress(0);
      
      //todo: Track how many we update successfully and report back
      const updatePage = d => {
        const x = structuredClone(d);
        const xpg = getNotionDataPage(x, dbId, pgId);

        const xpgMetas = xpg[DGMD_METADATA];
        for (const [key, value] of Object.entries(pgUpdateMetas)) {
          if (key in xpgMetas) {
            xpgMetas[key] = value;
          }
        }

        const xpgProps = xpg[DGMD_PROPERTIES];
        for (const [key, value] of Object.entries(pgUpdateProps)) {
          if (key in xpgProps) {
            xpgProps[key] = value;
          }
        }
        return x;
      };
      
      setNotionData(updatePage);
      setProgress(100);
      
      return [currentOpId, Promise.resolve(enrichResult({}, UPDATE, currentOpId))];
    }
  }, [notionData, updating, urlRef, cancelRequest, prepareOperation, appendFilesToFormData, createXhrRequest, enrichResult]);

  const handleDelete = useCallback((dbId, pgId) => {
    if (updating) {
      cancelRequest();
    }
    
    const pg = getNotionDataPage(notionData, dbId, pgId);
    if (isNil(pg)) {
      return {
        id: null,
        type: null,
        promise: Promise.resolve(false)
      };
    }
    
    const currentOpId = prepareOperation(DELETE);
    
    if (isNotionDataLive(notionData)) {
      setUpdating(true);
      setProgress(0);
      
      const deletePromise = new Promise((resolve, reject) => {
        const deleteUrl = new URL('/api/update', urlRef.current.origin);
        deleteUrl.searchParams.append(CRUD_PARAM_DELETE_BLOCK_ID, pgId);
        
        // Set a determinate progress even though we can't track actual progress for DELETE
        setTimeout(() => {
          if (activeRequestRef.current) {
            setProgress(50);
          }
        }, 300);
        
        createXhrRequest('DELETE', deleteUrl.href, {
          onLoad: (crudJson) => {
            if (CRUD_RESPONSE_RESULT in crudJson) {
              const result = crudJson[CRUD_RESPONSE_RESULT];
              const resultType = crudJson[CRUD_RESPONSE_RESULT_TYPE];
              const success = result[resultType];
              
              if (success && resultType === CRUD_RESPONSE_DELETE) {
                const delId = result[CRUD_RESPONSE_DELETE_ID];
                setNotionData(x => spliceNotionPage(x, delId));
                
                const resultObj = {
                  deletedId: delId,
                  success: true
                };
                resolve(enrichResult(resultObj, DELETE, currentOpId));
              } else {
                const errorMsg = 'Delete operation failed';
                setError(errorMsg);
                reject(new Error(errorMsg));
              }
            }
          },
          onError: reject
        });
      });
      
      return {
        id: currentOpId,
        type: DELETE,
        promise: deletePromise
      };
    }
    else {
      // For non-live mode
      setUpdating(true);
      setProgress(0);
      
      setNotionData(x => spliceNotionPage(x, pgId));
      
      setProgress(100);
      setUpdating(false);
      
      const resultObj = { 
        deletedId: pgId,
        success: true 
      };
      const enrichedResult = enrichResult(resultObj, DELETE, currentOpId);
      
      return {
        id: currentOpId,
        type: DELETE,
        promise: Promise.resolve(enrichedResult)
      };
    }
  }, [notionData, updating, urlRef, cancelRequest, prepareOperation, createXhrRequest, enrichResult]);

  // Handle next cursor
  const handleNextCursor = useCallback(() => {
    const nextCursor = getNotionDataNextCursor(notionData);
    if (updating || isNil(nextCursor)) {
      return [null, Promise.resolve(false)];
    }
    
    const currentOpId = prepareOperation(NEXT_CURSOR);
    setUpdating(true);
    setProgress(0);
    
    const cursorPromise = new Promise((resolve, reject) => {
      const cursorUrl = new URL(urlRef.current);
      const params = new URLSearchParams(cursorUrl.search);
      params.set(QUERY_PARAM_PAGE_CURSOR_TYPE_REQUEST, QUERY_VALUE_PAGE_CURSOR_TYPE_SPECIFIC);
      params.set(QUERY_PARAM_PAGE_CURSOR_ID_REQUEST, nextCursor);
      cursorUrl.search = params.toString();
      
      createXhrRequest('GET', cursorUrl.href, {
        onProgress: (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setProgress(percentComplete);
          }
        },
        onLoad: (cursorJson) => {
          const validStatus = cursorJson[QUERY_RESPONSE_KEY_SUCCESS];
          
          if (isNil(validStatus) || !validStatus) {
            setError('Invalid data');
            reject(new Error('Invalid data'));
          } else {
            setNotionData(x => {
              const x2 = structuredClone(x);
              const z = processQueryData(cursorJson);
              
              const primaryDbId = getNotionDataPrimaryDbId(x2);
              const exsPrimaryPgs = getNotionDataPages(x2, primaryDbId);
              const newPrimaryPgs = getNotionDataPages(z, primaryDbId);
              const mergedPrimaryPgs = mergePageLists(exsPrimaryPgs, newPrimaryPgs);
              z[IDGMD_DATA][DGMD_PRIMARY_DATABASE][DGMD_BLOCKS] = mergedPrimaryPgs;
              
              const previewDbIds = getNotionDataRelationDbIds(x2);
              for (const previewDbId of previewDbIds) {
                const exsPreviewPgs = getNotionDataPages(x2, previewDbId);
                const newPreviewPgs = getNotionDataPages(z, previewDbId);
                const mergedPreviewPgs = mergePageLists(exsPreviewPgs, newPreviewPgs);
                z[IDGMD_DATA][DGMD_RELATION_DATABASES].find(
                  db => db[DGMD_DATABASE_ID] === previewDbId
                )[DGMD_BLOCKS] = mergedPreviewPgs;
              }
              
              return z;
            });
            
            setResult({
              success: true,
              _operationContext: {
                type: NEXT_CURSOR,
                id: currentOpId
              }
            });
            resolve(true);
          }
        },
        onError: reject
      });
    });
    
    return [currentOpId, cursorPromise];
  }, [notionData, updating, urlRef, prepareOperation, createXhrRequest]);

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleNextCursor,
    cancelRequest,
    notionData,
    updating,
    progress,
    error,
    result,
    operationType,
    operationId
  };
};

// Keep the processQueryData function unchanged
const processQueryData = ( ojsonObject ) => {
  const parsePrimaryDbId = (x) => {
    const job = x[IDGMD_DATA];
    return job[DGMD_PRIMARY_DATABASE][DGMD_DATABASE_ID];
  };
    
  const parseRelationDbIds = (x) => {
    const job = x[IDGMD_DATA];
    const t = job[DGMD_RELATION_DATABASES].map( db => db[DGMD_DATABASE_ID] );
    return t;
  };

  const jsonObject = structuredClone( ojsonObject ); 
  delete jsonObject[QUERY_RESPONSE_KEY_SUCCESS];
  jsonObject[IDGMD_FILTERED_DATA] = false;
  jsonObject[IDGMD_LIVE_DATA] = jsonObject[PROTO_RESPONSE_KEY_SNAPSHOT_TIMESTAMP] ? false : true;
  delete jsonObject[PROTO_RESPONSE_KEY_SNAPSHOT_TIMESTAMP];
  jsonObject[IDGMD_DATA] = jsonObject[QUERY_RESPONSE_KEY_RESULT];
  delete jsonObject[QUERY_RESPONSE_KEY_RESULT];
  jsonObject[IDGMD_VALID_DATA] = true;
  jsonObject[IDGMD_PRIMARY_DBID] = parsePrimaryDbId( jsonObject );
  jsonObject[IDGMD_RELATION_DBIDS] = parseRelationDbIds( jsonObject );
  return jsonObject;
};