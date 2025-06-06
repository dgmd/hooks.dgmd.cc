import {
  DGMD_DATABASE_ID
} from 'constants.dgmd.cc';
import {
  Fragment,
  useLayoutEffect,
  useRef,
  useState
} from 'react';

import {
  getNotionDataPrimaryDbId
} from '../hook/dataUtils.js';
import { FileUpload } from './FileUpload';
import {
  getTextAreaStyle,
  headerStyle,
  linkStyle,
  sectionStyle
} from './Look.js';

export const CreateField = ({notionData, onCreate, updating}) => {
  
    const createTextAreaRef = useRef( null );
    const [createTerms, setCreateTerms] = useState( null );
    const [errorState, setErrorState] = useState( x => false );
    const [open, setOpen] = useState( x => false );
    const [files, setFiles] = useState([]);
  
    useLayoutEffect( () => {
      if (!notionData) {
        return;
      }
  
      setCreateTerms( x => {
        if (x) {
          return x;
        }
        const dbId = getNotionDataPrimaryDbId( notionData );
        const createObj = {
          [DGMD_DATABASE_ID]: dbId,
        };
        return JSON.stringify( createObj, null, 2 );
      } );
    }, [
      notionData
    ] );
  
    return (
      <div
        style={ sectionStyle }
      >
        <div
          style={ headerStyle }
          onClick={ x => setOpen( x => !x ) }
        >
          { open ? '⬇️' : '➡️' } CREATE
        </div>
        {
          open ? (
            <Fragment>
              <textarea
                rows={ 10 }
                cols={ 30 }
                style={ getTextAreaStyle( !errorState, updating ) }
                ref={ createTextAreaRef }
                value={ createTerms ? createTerms : '' }
                onChange={ e => {
                  setCreateTerms( e.target.value );
                  setErrorState( x => false );
                } }
              />
              
              <FileUpload files={files} setFiles={setFiles} />
              
              <div
                  style={ linkStyle }
                  onClick={ () => {
                    try {
                      const createText = createTextAreaRef.current.value;
                      const createTextObj = JSON.parse( createText );
                      // Pass the complete file objects with UIDs instead of just the file property
                      onCreate( createTextObj, files.length > 0 ? files : null );
                    }
                    catch( err ) {
                      console.log( err );
                      setErrorState( x => true );
                    }
                  } }
              >
                  DO THE CREATING
                  { updating ? '🔄' : '' }
              </div>
            </Fragment>
          ) : 
          null
        }

      </div>
    );
  }


