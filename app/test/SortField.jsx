import {
  Fragment,
  useLayoutEffect,
  useRef,
  useState
} from 'react';

import {
  getNotionDataAllDbIds
} from '../hook/dataUtils.js';
import {
  getTextAreaStyle,
  headerStyle,
  linkStyle,
  sectionStyle
} from './Look.js';

export const SortField = ({notionData, onSort, hasSort}) => {

  const sortTextAreaRef = useRef( null );
  const [sortTerms, setSortTerms] = useState( null );
  const [open, setOpen] = useState( x => false );

  useLayoutEffect( () => {
    if (!notionData) {
      return;
    }

    setSortTerms( x => {
      if (x) {
        return x;
      }
      const dbIds = getNotionDataAllDbIds( notionData );
      const sortObj = {};
      for (const dbId of dbIds) {
        sortObj[dbId] = {
          fields: [],
          directions: []
        };
      }
      return JSON.stringify( sortObj, null, 2 );
    } );
  }, [
    notionData
  ] );

  return (
    <div
    style={ sectionStyle}
    >
      <div
        style={ headerStyle }
        onClick={ x => setOpen( x => !x ) }
      >
        { open ? '⬇️' : '➡️' } SORT (active:{ hasSort ? '✅' : '❌' })
      </div>
      {
        open ? (
          <Fragment>
            <textarea
              rows={ 10 }
              cols={ 30 }
              style={ getTextAreaStyle( hasSort ) }
              ref={ sortTextAreaRef }
              value={ sortTerms ? sortTerms : '' }
              onChange={ e => {
                setSortTerms( e.target.value );
              } }
            />
            <div
              style={ linkStyle }
              onClick={ () => {
                try {
                  const sortText = sortTextAreaRef.current.value;
                  const sortTextObj = JSON.parse( sortText );
                  onSort( sortTextObj );
                }
                catch( err ) {
                  onSort( null );
                  console.log( err );
                }
              } }
            >
              DO THE SORTING
            </div>
          </Fragment>
        ) : 
        null
      }
    </div>
  );
}