import React from "react";
import PropTypes from "prop-types";
import { TextField, Chip } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Controller, useFormContext } from "react-hook-form";

const SelectInput = ({ commonInputProps, metaInputProps, options }) => {
  const { watch } = useFormContext();
  const { multiSelect, watchDisableInput, watchDisable } = metaInputProps;
  const { name, disabled, ...commonProps } = commonInputProps;

  const optionLabel = option => {
    const { display_name: displayName, display_text: displayText } =
      typeof option === "object"
        ? option
        : options.find(opt => String(opt.id) === String(option)) || {};

    return displayName || displayText;
  };

  const defaultValue = multiSelect ? [] : {id: "", display_text: ""};

  const handleChange = data =>
    multiSelect
      ? data?.[1]?.map(selected =>
          typeof selected === "object" ? selected?.id : selected
        )
      : data?.[1]?.id;

  const optionEquality = (option, value) =>
    multiSelect ? option.id === value : option.id === value.id;
  const watchedDisableField = watchDisableInput
    ? watch(watchDisableInput, "")
    : false;
  let disableField = disabled;

  if (
    !disabled &&
    watchDisableInput &&
    watchDisable &&
    watchedDisableField !== false
  ) {
    disableField = watchDisable(watchedDisableField);
  }

  return (
    <Controller
      name={name}
      as={Autocomplete}
      multiple={multiSelect}
      getOptionLabel={optionLabel}
      options={options}
      getOptionSelected={optionEquality}
      disabled={disableField}
      onChange={handleChange}
      defaultValue={defaultValue}
      filterSelectedOptions
      renderInput={params => (
        <TextField {...params} name={name} margin="normal" {...commonProps} />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            label={optionLabel(option)}
            {...getTagProps({ index })}
            disabled={disabled}
          />
        ))
      }
    />
  );
};

SelectInput.displayName = "SelectInput";

SelectInput.propTypes = {
  commonInputProps: PropTypes.shape({
    disabled: PropTypes.bool,
    helperText: PropTypes.string,
    name: PropTypes.string.isRequired
  }),
  metaInputProps: PropTypes.object,
  options: PropTypes.array
};

export default SelectInput;
