# frozen_string_literal: true

require 'rails_helper'

describe ApprovalResponseJob, type: :job do
  include ActiveJob::TestHelper

  before do
    [User, Role, PrimeroModule, PrimeroProgram, Field, FormSection, Lookup, UserGroup, Agency].each(&:destroy_all)
    @lookup = Lookup.create(id: 'lookup-approval-type', name: 'approval type')
    role = create :role, is_manager: true
    @manager1 = create :user, role: role, email: 'manager1@primero.dev', send_mail: false, user_name: 'manager1'
    @manager2 = create :user, role: role, email: 'manager2@primero.dev', send_mail: true, user_name: 'manager2'
    @owner = create :user, user_name: 'jnelson', full_name: 'Jordy Nelson', email: 'owner@primero.dev'
    @child = child_with_created_by(
      @owner.user_name, name: 'child1', module_id: PrimeroModule::CP, case_id_display: '12345'
    )
  end

  describe 'perform_later' do
    it 'sends a notification to manager' do
      ActiveJob::Base.queue_adapter = :test
      ApprovalResponseJob.perform_later(@manager2.id, @child.id, 'value1', true)
      approval_response_jobs = ActiveJob::Base.queue_adapter.enqueued_jobs.select { |j| j[:job] == ApprovalResponseJob }
      expect(approval_response_jobs.size).to eq(1)
    end
  end

  after :each do
    clean_data(User, Role, PrimeroModule, PrimeroProgram, Field, FormSection, Lookup, UserGroup)
  end

  private

  def child_with_created_by(created_by, options = {})
    user = User.new(user_name: created_by)
    child = Child.new_with_user user, options
    child.save && child
  end
end
