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
  getPageId
} from './hook/pageUtils.js';

import {
  useEffect
} from 'react';

import {
  SearchField
} from './SearchField.jsx';

import {
  SortField
} from './SortField.jsx';

import {
  UpdateStatus
} from './UpdateStatus.jsx';

import {
  DeleteField
} from './DeleteField.jsx';

import {
  CreateField
} from './CreateField.jsx';

import {
  UpdateField
} from './UpdateField.jsx';

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


  // const cbUpdatePage = useCallback( (dbId, pageId) => {
  //   if (!nata || !nata.isValid()) {
  //     return;
  //   }
  //   const updatePageObj = {
  //   };
  //   const updatePageMetaObj = {
  //   };
  //   nata.updatePage( dbId, pageId, updatePageObj, updatePageMetaObj );
  // }, [
  //   nata
  // ] );

  // const cbCreatePage = useCallback( dbId => {
  //   if (!nata || !nata.isValid()) {
  //     return;
  //   }
  //   const createPageObj = {
  //   };
  //   const pageMetaObj = {
  //   };
  //   nata.createPage( dbId, createPageObj, pageMetaObj );
  // }, [
  //   nata
  // ] );



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
          <div
            key={ pageId }
            style={{
              border: '1px solid black',
              margin: '10px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            pageId: { pageId }
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'end',
              }}
            >
              <DeleteField
                onDelete={ handleDelete }
                dbId={ dbId }
                pageId={ pageId }
              />
              <UpdateField
                onUpdate={ handleUpdate }
                dbId={ dbId }
                pageId={ pageId }
              />
            </div>
          </div>
          );
        } )
      }

    </div>
  );
};

