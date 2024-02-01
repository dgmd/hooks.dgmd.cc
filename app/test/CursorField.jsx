import {
  headerStyle,
  linkStyle,
  sectionStyle
} from './Look.js';

export const CursorField = ({hasNextCursor, onRequestNextCursor}) => {
  hasNextCursor = true;
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