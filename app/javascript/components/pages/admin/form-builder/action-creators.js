import { RECORD_PATH, SAVE_METHODS } from "../../../../config";

import { getFormRequestPath } from "./utils";
import actions from "./actions";

export const fetchForm = id => ({
  type: actions.FETCH_FORM,
  api: {
    path: `${RECORD_PATH.forms}/${id}`
  }
});

export const setSelectedField = name => ({
  type: actions.SET_SELECTED_FIELD,
  payload: { name }
});

export const setSelectedSubform = id => ({
  type: actions.SET_SELECTED_SUBFORM,
  payload: { id }
});

export const updateSelectedField = data => ({
  type: actions.UPDATE_SELECTED_FIELD,
  payload: { data }
});

export const updateSelectedSubform = data => ({
  type: actions.UPDATE_SELECTED_SUBFORM,
  payload: { data }
});

export const reorderFields = (name, order, isSubform) => ({
  type: actions.REORDER_FIELDS,
  payload: { name, order, isSubform }
});

export const saveForm = ({ id, body, saveMethod, subforms }) => {
  const method = saveMethod === SAVE_METHODS.update ? "PATCH" : "POST";

  return {
    type: actions.SAVE_FORM,
    api: [
      {
        path: getFormRequestPath(id, saveMethod),
        method,
        body
      }
    ].concat(
      subforms.map(subform => ({
        path: getFormRequestPath(subform.id, saveMethod),
        method,
        body: {
          data: subform
        }
      }))
    )
  };
};

export const clearSelectedForm = () => {
  return {
    type: actions.CLEAR_SELECTED_FORM
  };
};
