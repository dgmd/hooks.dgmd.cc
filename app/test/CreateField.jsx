
import {
  Fragment,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
  
  import {
  getTextAreaStyle,
  headerStyle,
  linkStyle,
  sectionStyle
} from './Look.js';
  
  import {
  getNotionDataAllDbIds
} from '../hook/dataUtils.js';
  
  export const CreateField = ({notionData, onCreate}) => {
  
    const createTextAreaRef = useRef( null );
    const [createTerms, setCreateTerms] = useState( null );

    const [errorState, setErrorState] = useState( x => false );

    const [open, setOpen] = useState( x => false );
  
    useLayoutEffect( () => {
      if (!notionData) {
        return;
      }
  
      setCreateTerms( x => {
        if (x) {
          return x;
        }
        const dbIds = getNotionDataAllDbIds( notionData );
        const sortObj = {};
        for (const dbId of dbIds) {
          sortObj[dbId] = {
          };
        }
        return JSON.stringify( sortObj, null, 2 );
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
                style={ getTextAreaStyle( errorState ) }
                ref={ createTextAreaRef }
                value={ createTerms ? createTerms : '' }
                onChange={ e => {
                  setCreateTerms( e.target.value );
                  setErrorState( x => false );
                } }
              />
              <div
                  style={ linkStyle }
                  onClick={ () => {
                    try {
                      const createText = createTextAreaRef.current.value;
                      const createTextObj = JSON.parse( createText );
                      onCreate( createTextObj );
                      setErrorState( x => false );
                    }
                    catch( err ) {
                      console.log( err );
                      setErrorState( x => true );
                    }
                  } }
              >
                  DO THE CREATING
              </div>
            </Fragment>
          ) : 
          null
        }

      </div>
    );
  }


