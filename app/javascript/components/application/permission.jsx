import { useSelector, useDispatch } from "react-redux";
import { push } from "connected-react-router";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { List } from "immutable";
import { isEqual } from "lodash";

import { getPermissions } from "../user/selectors";
import { RESOURCES } from "../../libs/permissions";

const Permission = ({ resources, actions, redirect, children, match }) => {
  const { params } = match;
  const { recordType } = params;
  const type = resources || recordType;
  const dispatch = useDispatch();
  const allUserPermissions = useSelector(state => getPermissions(state), isEqual);

  const filteredPermissions = allUserPermissions.entrySeq().reduce((acum, curr) => {
    const [key, value] = curr;

    if ((Array.isArray(type) && type.includes(key)) || type === key) {
      return { ...acum, [key]: value };
    }

    return acum;
  }, {});

  const verifyAction = element => (Array.isArray(actions) ? actions.includes(element) : actions === element);

  const userHasPermission =
    List(Object.values(filteredPermissions)).flatten().some(verifyAction) || resources === RESOURCES.any;

  if (userHasPermission) {
    return children;
  }

  if (redirect) {
    dispatch(push("/not-authorized"));
  }

  return null;
};

Permission.displayName = "Permission";

Permission.defaultProps = {
  redirect: false
};

Permission.propTypes = {
  actions: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
  children: PropTypes.node.isRequired,
  match: PropTypes.object.isRequired,
  redirect: PropTypes.bool.isRequired,
  resources: PropTypes.oneOfType([PropTypes.array, PropTypes.string])
};

export default withRouter(Permission);
