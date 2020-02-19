import React from "react";

import { RECORD_PATH } from "../../config";
import { ToggleIconCell } from "../index-table";
import { fetchCases, fetchIncidents, fetchTracingRequests } from "../records";

export const buildTableColumns = (columns, i18n, recordType, css) => {
  const iconColumns = ["photo", "alert_count"];

  const emptyHeader = name => <th key={name} className={css.overdueHeading} />;

  return columns
    .map(column => {
      const options = {
        ...{
          ...(["photo"].includes(column.get("name"))
            ? {
                customBodyRender: value => (
                  <ToggleIconCell value={value} icon="photo" />
                )
              }
            : {}),
          ...(["alert_count", "flag_count"].includes(column.get("name"))
            ? {
                customHeadRender: columnMeta => emptyHeader(columnMeta),
                customBodyRender: value => (
                  <ToggleIconCell value={value} icon="alert_count" />
                )
              }
            : {})
        }
      };

      return {
        label: iconColumns.includes(column.get("name"))
          ? ""
          : i18n.t(`${recordType}.${column.get("name")}`),
        name: column.get("field_name"),
        id: column.get("id_search"),
        options
      };
    })
    .sortBy(column => (iconColumns.includes(column.name) ? 1 : 0));
};

export const getRecordsFetcherByType = type => {
  switch (type) {
    case RECORD_PATH.incidents:
      return fetchIncidents;
    case RECORD_PATH.tracing_requests:
      return fetchTracingRequests;
    default:
      return fetchCases;
  }
};
