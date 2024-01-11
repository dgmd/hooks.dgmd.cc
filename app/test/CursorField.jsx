import {
  sectionStyle,
  headerStyle,
  linkStyle
} from './Look.js';

export const CursorField = ({hasNextCursor, onRequestNextCursor}) => {
  return (
  <div
    style={ sectionStyle }
  >
    <div
      style={ headerStyle }
    >
      cursors
    </div>
    <div>
      { hasNextCursor ? 
        (<div
          onClick={ onRequestNextCursor }
          style={ linkStyle }
          >
            load next cursor
          </div>) :
        (<div>all cursors loaded</div>) }
    </div>
  </div>
  );
};