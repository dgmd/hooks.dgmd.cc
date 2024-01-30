import {
  useState
} from 'react';

import {
  getPageId
} from '../hook/pageUtils.js';
import {
  DeleteField
} from './DeleteField.jsx';
import {
  headerStyle
} from './Look.js';
import {
  UpdateField
} from './UpdateField.jsx';

export const PageComponent = ({page, dbId, handleDelete, handleUpdate, updating}) => {

  const [ open, setOpen ] = useState( x => false );

  const pageId = getPageId( page );

  return (
    <div
      style={{
        border: '1px solid black',
        margin: '10px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        onClick={ x => setOpen( x => !x ) }
        style={ headerStyle }
      >
        { open ? '⬇️' : '➡️' } { pageId }
      </div>
      {
        open ? (
          <div>
          <pre>
          { JSON.stringify( page, null, 2 ) }
          </pre>
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
            updating={ updating }
          />
          </div>
          </div>
        ) :
        null

      }

    </div>
  );
};