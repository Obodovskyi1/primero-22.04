import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import SearchIcon from "@material-ui/icons/Search";
import makeStyles from "@material-ui/styles/makeStyles";

import { useI18n } from "../i18n";
import RecordFormTitle from "../record-form/form/record-form-title";
import { FieldRecord, FormSectionField } from "../record-form";
import ActionButton from "../action-button";
import { ACTION_BUTTON_TYPES } from "../action-button/constants";
import generateKey from "../charts/table-values/utils";
import { FORMS } from "../record-form/form/subforms/subform-traces/constants";
import SubformDrawer from "../record-form/form/subforms/subform-drawer";
import { getSelectedPotentialMatch, getMatchedTraces, fetchMatchedTraces, getLoadingMatchedTraces } from "../records";
import { RECORD_PATH } from "../../config";

import { MatchesForm, ComparisonForm, MatchedTraces } from "./components";
import { NAME } from "./constants";
import { fields } from "./form";
import styles from "./styles.css";

const Component = ({ record, recordType, mobileDisplay, handleToggleNav, form, mode }) => {
  const i18n = useI18n();
  const css = makeStyles(styles)();
  const dispatch = useDispatch();
  const recordId = record?.get("id");
  const [open, setOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(FORMS.matches);
  const potentialMatch = useSelector(state => getSelectedPotentialMatch(state, RECORD_PATH.cases));
  const matchedTracesData = useSelector(state => getMatchedTraces(state));
  const matchedTracesLoading = useSelector(state => getLoadingMatchedTraces(state));

  useEffect(() => {
    dispatch(fetchMatchedTraces(RECORD_PATH.cases, recordId));
  }, []);

  const findMatchLabel = i18n.t("cases.summary.find_match");
  const handleFindMatchClick = () => {
    setOpen(true);
    setSelectedForm(FORMS.matches);
  };
  const handleClose = () => setOpen(false);
  const findMatchButton = (
    <ActionButton
      icon={<SearchIcon />}
      text={findMatchLabel}
      type={ACTION_BUTTON_TYPES.default}
      keepTextOnMobile
      rest={{
        onClick: handleFindMatchClick,
        disabled: mode.isNew
      }}
    />
  );

  const props = {
    open,
    record,
    i18n,
    css,
    recordType,
    selectedForm,
    setSelectedForm,
    potentialMatch,
    mode
  };

  const Form = (() => {
    switch (selectedForm) {
      case FORMS.matches:
        return MatchesForm;
      case FORMS.comparison:
        return ComparisonForm;
      default:
        return null;
    }
  })();

  const renderFields = fields(i18n).map(field => {
    const formattedField = FieldRecord(field);
    const fieldProps = {
      name: formattedField.name,
      field: formattedField,
      mode,
      recordType,
      recordID: recordId,
      formSection: form
    };

    return (
      <div key={generateKey()} className={css.field}>
        <FormSectionField key={generateKey(formattedField.name)} {...fieldProps} />
      </div>
    );
  });

  return (
    <div>
      <div className={css.container}>
        <RecordFormTitle
          mobileDisplay={mobileDisplay}
          handleToggleNav={handleToggleNav}
          displayText={i18n.t("cases.summary.label")}
        />
        <div>{findMatchButton}</div>
        <SubformDrawer title={findMatchLabel} open={open} cancelHandler={handleClose}>
          <Form {...props} />
        </SubformDrawer>
      </div>
      {renderFields}
      <MatchedTraces
        data={matchedTracesData}
        loading={matchedTracesLoading}
        recordId={recordId}
        setSelectedForm={setSelectedForm}
      />
    </div>
  );
};

Component.displayName = NAME;

Component.propTypes = {
  form: PropTypes.object,
  handleToggleNav: PropTypes.func.isRequired,
  mobileDisplay: PropTypes.bool.isRequired,
  mode: PropTypes.object,
  record: PropTypes.object,
  recordType: PropTypes.string.isRequired
};

export default Component;