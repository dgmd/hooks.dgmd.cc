"use client"


import {
  useNotionData
} from './hook/notionDataHook.js';

import {
  getNotionDataPrimaryDbId,
  isNotionDataLive,
  isNotionDataLoaded,
  isNotionDataValid,
  getNotionDataPages
} from './hook/dataUtils.js';

import {
  useEffect
} from 'react';

import {
  SearchField
} from './test/SearchField.jsx';

import {
  SortField
} from './test/SortField.jsx';

import {
  UpdateStatus
} from './test/UpdateStatus.jsx';

import {
  CreateField
} from './test/CreateField.jsx';

import {
  PageComponent
} from './test/PageComponent.jsx';

import {
  getPageId
} from './hook/pageUtils.js';

export default function Home() {
  const {
    setSearch,
    setSort,
    handleCreate,
    handleUpdate,
    handleDelete,
    notionData,
    filteredNotionData,
    updating
   } = useNotionData(
    "https://proto-dgmd-cc.vercel.app/api/prototype?i=7c3c07bd-512d-42e9-8f59-158cd1a0da79" );
    //"https://proto-dgmd-cc.vercel.app/api/query?d=ce748dc81b8444aba06b5cf5a0517fd7&b=false&r=true" );
    //"https://proto-dgmd-cc.vercel.app/api/prototype?i=0265f0e9-7571-427a-a8ea-39cae000db74" );

  useEffect( () => {
  }, [
  ] );

  if (!isNotionDataLoaded(notionData)) {
    return (<div>loading...</div>);
  }

  if (!isNotionDataValid(notionData)) {
    return (<div>invalid data</div>);
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

      <CreateField
        notionData={ notionData }
        onCreate={ handleCreate }
      />

      <SortField
        notionData={ notionData }
        onSort={ setSort }
      />

      <SearchField
        notionData={ notionData }
        onSearch={ setSearch }
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
              handleDelete={ handleDelete }
              handleUpdate={ handleUpdate }
            />
          );
        } )
      }

    </div>
  );
};

