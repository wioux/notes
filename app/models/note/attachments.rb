class Note
  module Attachments
    extend ActiveSupport::Concern

    included do
      has_many :attachments, :dependent => :destroy
      accepts_nested_attributes_for :attachments
      attr_accessible :attachments_attributes
    end
  end
end
