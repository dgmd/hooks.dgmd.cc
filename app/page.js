"use client"

import {
  useEffect
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
  getPageId
} from './hook/pageUtils.js';
import {
  CreateField
} from './test/CreateField.jsx';
import {
  CursorField
} from './test/CursorField.jsx';
import {
  PageComponent
} from './test/PageComponent.jsx';
import {
  SearchField
} from './test/SearchField.jsx';
import {
  SortField
} from './test/SortField.jsx';
import {
  UpdateStatus
} from './test/UpdateStatus.jsx';

export default function Home() {
  const {
    setSearch,
    hasSearch,
    setSort,
    hasSort,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleNextCursor,
    notionData,
    filteredNotionData,
    updating
   } = useNotionData(
    // "http://localhost:3000/api/query?d=ce748dc81b8444aba06b5cf5a0517fd7" );
    "http://localhost:3000/api/query?d=7254339bc85a4d5dade61f87a2c3a502"
  );

  useEffect( () => {
  }, [
  ] );

  if (!isNotionDataLoaded(notionData)) {
    return (<div>loading...</div>);
  }
  if (!isNotionDataValid(notionData)) {
    return (<div>corrupt data</div>);
  }

  const dbId = getNotionDataPrimaryDbId( notionData );

  return (

    <div>

      <UpdateStatus
        title={ 'DATA STATUS' }
        status={ isNotionDataLive(notionData) ? 'LIVE' : 'SNAPSHOT' }
      />

      <UpdateStatus
        title={ 'UPDATING STATUS' }
        status={ updating ? 'ACTIVE' : 'INACTIVE' }
      />

      <CursorField
        hasNextCursor={ hasNotionDataNextCursor(notionData) }
        onRequestNextCursor={ handleNextCursor }
      />

      <CreateField
        notionData={ notionData }
        onCreate={ handleCreate }
        updating={ updating }
      />

      <SortField
        notionData={ notionData }
        onSort={ setSort }
        hasSort={ hasSort }
        updating={ updating }
      />

      <SearchField
        notionData={ notionData }
        onSearch={ setSearch }
        hasSearch={ hasSearch }
        updating={ updating }
      /> 

      <hr/>

      {
        getNotionDataPages( filteredNotionData, dbId ).map( ( page, i ) => {
          const pageId = getPageId( page );
          return (
            <PageComponent
              key={ pageId }
              dbId={ dbId }
              page={ page }
              updating={ updating }
              handleDelete={ handleDelete }
              handleUpdate={ handleUpdate }
            />
          );
        } )
      }

    </div>
  );
};

