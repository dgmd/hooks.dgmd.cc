"use client"

import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  hasNotionDataNextCursor
} from './hook/cursorUtils.js';
import {
  getNotionDataPages,
  getNotionDataPrimaryDbId,
  isNotionDataLive,
  isNotionDataLoaded,
  isNotionDataValid
} from './hook/dataUtils.js';
import {
  useNotionData
} from './hook/notionDataHook.js';
import {
  getNotionDataPageId
} from './hook/pageUtils.js';
import {
  CreateField
} from './test/CreateField.jsx';
import {
  CursorField
} from './test/CursorField.jsx';
import {
  panelStyle
} from './test/Look.js';
import {
  PageComponent
} from './test/PageComponent.jsx';
import {
  UpdateStatus
} from './test/UpdateStatus.jsx';

// Number of status updates to keep in history
const STATUS_HISTORY_SIZE = 1000;

// Data status constants
const STATUS_LOADING = "LOADING";
const STATUS_CORRUPT = "CORRUPT";
const STATUS_LOADED = "LOADED";

export default function Home() {
  const {
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
   } = useNotionData(
    'http://localhost:3001/api/query?d=1bc4ffe6f70c80bfa187ca467edf08c6&r=true&n=a'
  );
  
  const handleUpdatex = (upd, files) => {
    
    handleUpdate(upd, files);
    
    // const [id, type, updatePromise] = handleUpdate(upd, files);
    // updatePromise
    //   .then(res => {
    //     console.log(`Update successful:`, res);
    //   })
    //   .catch(err => {
    //     console.log(`Update failed:`, err );
    //   });
  };

  // Status history buffer
  const [statusHistory, setStatusHistory] = useState([]);

  const mUpdateStatus = useMemo(() => {
    const updates = [`OP_TYPE: ${operationType}`, `OP_ID: ${operationId}`];
    updates.push(`OP_ACTIVE: ${updating}`);
    if (error) {
      updates.push(`OP_ERROR: ${error}`);
    }
    if (typeof progress === 'number') {
      updates.push(`OP_PROGRESS: ${progress}`);
    }
    if (result) {
      updates.push(`OP_RESULT: ${JSON.stringify(result)}`);
    }

    // Use a bullet point separator for readability
    return updates.join(' • ');
  }, [
    updating,
    progress,
    error,
    result,
    operationType,
    operationId
  ]);
  
  // Update status history when status changes
  useEffect(() => {
    if (mUpdateStatus) {
      setStatusHistory(prev => {
        // Create a new entry with timestamp and status
        const newEntry = {
          time: new Date().toLocaleTimeString(),
          status: mUpdateStatus
        };
        
        // Add to beginning of array, limit to STATUS_HISTORY_SIZE entries
        return [newEntry, ...prev.slice(0, STATUS_HISTORY_SIZE - 1)];
      });
    }
  }, [mUpdateStatus]);
  
  // Determine overall data status
  const dataStatus = useMemo(() => {
    if (!isNotionDataLoaded(notionData)) return STATUS_LOADING;
    if (!isNotionDataValid(notionData)) return STATUS_CORRUPT;
    return STATUS_LOADED;
  }, [notionData]);

  // Get database ID if loaded and valid
  const dbId = useMemo(() => {
    if (dataStatus === STATUS_LOADED) {
      return getNotionDataPrimaryDbId(notionData);
    }
    return null;
  }, [notionData, dataStatus]);

  // Check if there's a next cursor, but only if data is loaded
  const hasNextCursor = useMemo(() => {
    if (dataStatus === STATUS_LOADED) {
      return hasNotionDataNextCursor(notionData);
    }
    return undefined;
  }, [notionData, dataStatus]);

  // Check if data is live, but only if loaded
  const isLive = useMemo(() => {
    if (dataStatus === STATUS_LOADED) {
      return isNotionDataLive(notionData);
    }
    return null;
  }, [notionData, dataStatus]);

  // Status panel component
  const StatusPanel = () => (
    <div style={panelStyle}>

      <UpdateStatus
        title={'UPDATING STATUS'}
        status={statusHistory}
      />

      <UpdateStatus
        title={'DATA STATUS'}
        status={isLive === null ? 'LOADING' : (isLive ? 'LIVE' : 'SNAPSHOT')}
      />

      <UpdateStatus
        title={'APP STATUS'}
        status={dataStatus}
      />

      <CursorField
        hasNextCursor={hasNextCursor}
        onRequestNextCursor={handleNextCursor}
      />

    </div>
  );

  // Main content
  const MainContent = () => {
    if (dataStatus !== STATUS_LOADED) {
      return null;
    }
    return (
      <>
        <div style={panelStyle}>
          <CreateField
            notionData={notionData}
            onCreate={handleCreate}
            updating={updating}
          />
        </div>

        <div style={panelStyle}>
          {getNotionDataPages(notionData, dbId).map((page, i) => {
            const pageId = getNotionDataPageId(page);
            return (
              <PageComponent
                key={pageId}
                dbId={dbId}
                page={page}
                updating={updating}
                handleDelete={handleDelete}
                handleUpdate={handleUpdatex}
              />
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div>
      <StatusPanel />
      <MainContent />
    </div>
  );
};

