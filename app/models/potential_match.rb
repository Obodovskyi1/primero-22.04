# frozen_string_literal: true

# This virtual model encapsulates a potential link between a trace on a TracingRequest
# and a case (Child). It contains logic for comparing the two records and pass judgement
# on how likely it is that they represent the same person.
class PotentialMatch < ValueObject
  VALUE_MATCH = 'match'
  VALUE_MISMATCH = 'mismatch'

  attr_accessor :child, :trace, :score, :likelihood, :status, :unique_identifier

  def self.comparable_name_fields
    %w[name name_other name_nickname]
  end

  def case_and_trace_matched?
    child&.matched_to_trace?(tracing_request, trace)
  end

  def compare_names
    PotentialMatch.comparable_name_fields.map do |field|
      {
        field: field,
        child_name: child.data[field] || '-',
        trace_name: trace[field] || '-'
      }
    end
  end

  def compare_case_to_trace
    case_field_values = MatchingConfiguration.matchable_fields_by_form('case', false).map do |form, fields|
      values = fields.map { |f| case_to_trace_values(f, child&.data) }
      values.present? ? { case_values: values, form_name: form.name } : nil
    end.compact

    case_nested_field_values = MatchingConfiguration.matchable_fields_by_form('case', true).map do |form, fields|
      nested_data = child&.data&.[](form.unique_id) || [{}]
      nested_data.map do |nested_values|
        values = fields.map { |f| case_to_trace_values(f, nested_values) }
        values.present? ? { case_values: values, form_name: form.name } : nil
      end.compact
    end.flatten

    { case: case_field_values, case_subform: case_nested_field_values }
  end

  def compare_values(value1, value2)
    return false if value1.blank? && value2.blank?
    return VALUE_MATCH if value1 == value2

    # To handle multi-selected values; compares strings and/or arrays
    if value1.respond_to?(:split) && value2.respond_to?(:split)
      return VALUE_MATCH if (value1.split.flatten - value2.split.flatten).blank?
    end

    VALUE_MISMATCH
  end

  def case_to_trace_values(field, case_data)
    case_value = case_data[field.name]
    trace_value = tracing_request.data[Child.map_match_field(field.name)] ||
                  trace[Child.map_match_field(field.name)]
    matches = compare_values(case_value, trace_value)
    { case_field: field, matches: matches, case_value: case_value, trace_value: trace_value }
  end

  class << self
    # TODO: Potentially deprecated. See if if we still need this after we do the API
    def group_match_records(match_records, type)
      grouped_records = []
      if type == 'case'
        grouped_records = match_records.group_by { |r| r.child.id }.to_a
      elsif type == 'tracing_request'
        grouped_records = match_records.group_by { |r| [r.tracing_request.id, r.tr_subform_id] }.to_a
      end
      grouped_records = sort_list(grouped_records) if grouped_records.present?
      grouped_records
    end

    # TODO: Potentially deprecated. See if if we still need this after we do the API
    def sort_list(potential_matches)
      potential_matches.sort_by { |pm| -find_max_score_element(pm.last).try(:score) }
    end

    # # TODO: Ugly code. Technically this stuff doesn't belong on the model. Certainly not on this model.
    # # TODO: Refactor UIUX
    # def format_list_for_json(potential_matches, type)
    #   if type == 'case'
    #     format_case_list_for_json(potential_matches)
    #   else
    #     format_tr_list_for_json(potential_matches)
    #   end
    # end

    def case_fields_for_comparison
      MatchingConfiguration
        .matchable_fields('case', false)
        .select { |f| !%w[text_field textarea].include?(f.type) && f.visible? }
        .uniq(&:name)
    end

    private

    def find_max_score_element(potential_match_detail_list)
      potential_match_detail_list.max_by(&:score)
    end

    # def format_case_list_for_json(potential_matches)
    #   potential_matches.map do |record|
    #     # record.first is the key [child_id]
    #     # record.last is the list of potential_match records
    #     # use the first potential_match record to build the header
    #     match1 = record.last.first
    #     {
    #       'case_id' => match1.case_id, 'child_id' => match1.child_id,
    #       'age' => match1&.child&.age, 'sex' => match1&.case&.sex,
    #       'registration_date' => match1.case_registration_date,
    #       'match_details' => format_case_match_details(record.last)
    #     }
    #   end
    # end

    # def format_case_match_details(potential_match_list)
    #   potential_match_list.map do |potential_match|
    #     {
    #       'tracing_request_id' => potential_match.tr_id,
    #       'tr_uuid' => potential_match.tracing_request.id,
    #       'subform_tracing_request_name' => potential_match.tracing_request_name,
    #       'inquiry_date' => potential_match.tracing_request_inquiry_date,
    #       'relation_name' => potential_match.tracing_request_relation_name,
    #       # 'visible' => potential_match.visible,
    #       'score' => potential_match.score,
    #       'owned_by' => potential_match.case_owned_by
    #     }
    #   end
    # end

    # #TODO: Refactor for UIUX. Move to presentation layer
    # def format_tr_list_for_json(potential_matches)
    #   potential_matches.map do |record|
    #     # record.first is the key [tracing_request_id, tr_subform_id]
    #     # record.last is the list of potential_match records
    #     # use the first potential_match record to build the header
    #     match1 = record.last.first
    #     {
    #       'tracing_request_id' => match1.tr_id,
    #       'tr_uuid' => match1.tracing_request.id,
    #       'relation_name' => match1.tracing_request_relation_name,
    #       'inquiry_date' => match1.tracing_request_inquiry_date,
    #       'subform_tracing_request_id' => match1.tr_subform_id,
    #       'subform_tracing_request_name' => match1.tracing_request_name,
    #       'match_details' => format_tr_match_details(record.last)
    #     }
    #   end
    # end

    # #TODO: Refactor for UIUX. Move to presentation layer
    # def format_tr_match_details(potential_match_list)
    #   potential_match_list.map do |potential_match|
    #     {
    #       'child_id' => potential_match.child_id,
    #       'case_id' => potential_match.case_id,
    #       'age' => potential_match.case_age,
    #       'sex' => potential_match.case_sex,
    #       'registration_date' => potential_match.case_registration_date,
    #       'owned_by' => potential_match.case_owned_by,
    #       # 'visible' => potential_match.visible,
    #       'score' => potential_match.score
    #     }
    #   end
    # end
  end
end
