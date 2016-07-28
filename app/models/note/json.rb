class Note
  module Json
    def as_json(opts=nil)
      opts ||= {
        :only => [:id, :original_date],
        :include => {
          :tags => {
            :only => [], :methods => :short_label
          },
        },
        :methods => :preview
      }

      super(opts)
    end
  end
end
