import {
  linkStyle,
  sectionStyle
} from './Look.js';

export const DeleteField = ({onDelete, dbId, pageId}) => {
  return (
    <div
      style={ sectionStyle }
    >
      <div
        style={ linkStyle }
        onClick={ () => onDelete( dbId, pageId ) }
      >
        DELETE PAGE
      </div>
    </div>
  );
};