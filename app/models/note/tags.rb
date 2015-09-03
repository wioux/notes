class Note
  module Tags
    extend ActiveSupport::Concern

    included do
      has_many :tags, :dependent => :destroy
    end

    def tag_list
      tags.map(&:label).join(', ')
    end

    def tag_list=(list)
      list = list.split(/\s*,\s*/)
      self.tags = list.map{ |label| tags.build(:label => label) }
    end

    def tagged?(label)
      tags.map(&:label).include?(label)
    end
  end
end
