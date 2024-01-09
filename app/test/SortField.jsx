
import {
  Fragment,
  useLayoutEffect,
  useRef,
  useState
} from 'react';

import {
  headerStyle,
  linkStyle,
  sectionStyle,
  getTextAreaStyle
} from './Look.js';

import {
  getNotionDataAllDbIds
} from '../hook/dataUtils.js';

export const SortField = ({notionData, onSort}) => {

  const sortTextAreaRef = useRef( null );
  const [sortTerms, setSortTerms] = useState( null );

  const [errorState, setErrorState] = useState( x => false );

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
        { open ? '⬇️' : '➡️' } SORT
      </div>
      {
        open ? (
          <Fragment>
            <textarea
              rows={ 10 }
              cols={ 30 }
              style={ getTextAreaStyle( errorState ) }
              ref={ sortTextAreaRef }
              value={ sortTerms ? sortTerms : '' }
              onChange={ e => {
                setSortTerms( e.target.value );
                setErrorState( x => false );
              } }
            />
            <div
              style={ linkStyle }
              onClick={ () => {
                try {
                  const sortText = sortTextAreaRef.current.value;
                  const sortTextObj = JSON.parse( sortText );
                  onSort( sortTextObj );
                  setErrorState( x => false );
                }
                catch( err ) {
                  console.log( err );
                  setErrorState( x => true );
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