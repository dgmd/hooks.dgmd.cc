import {
  DGMD_DATABASE_ID,
  DGMD_METADATA,
  DGMD_PAGE_ID,
  DGMD_PROPERTIES
} from 'constants.dgmd.cc';
import {
  useLayoutEffect,
  useRef,
  useState
} from 'react';

import {
  getTextAreaStyle,
  linkStyle,
  sectionStyle
} from "./Look";

export const UpdateField = ({dbId, pageId, onUpdate, updating}) => {

  const updateRef = useRef( null );
  const [sortTerms, setSortTerms] = useState( null );
  const [validState, setValidState] = useState( x => true );

  useLayoutEffect( () => {
    setSortTerms( x => {
      if (x) {
        return x;
      }

      const val = {
        [DGMD_DATABASE_ID]: dbId,
        [DGMD_PAGE_ID]: pageId,
        [DGMD_PROPERTIES]: {},
        [DGMD_METADATA]: {}
      };

      return JSON.stringify( val, null, 2 );
    } );
  }, [
    dbId,
    pageId
  ] );

  return (
    <div
      style={ sectionStyle }
    >
      <textarea
        rows={ 2 }
        cols={ 30 }
        style={ getTextAreaStyle( validState, updating ) }
        ref={ updateRef }
        value={ sortTerms ? sortTerms : '' }
        onChange={ x => {
          setSortTerms( x.target.value );
          setValidState( x => true );
        } }
      />
      <div
        style={ linkStyle }
        onClick={ () => {
          try {
            const updateTerms = JSON.parse( updateRef.current.value );
            onUpdate( updateTerms );
            setValidState( x => true );
          }
          catch (e) {
            console.log( e );
            setValidState( x => false );
          }
        } }
      >
        UPDATE PAGE
        { updating ? '🔄' : '' }
      </div>
    </div>
  );
};