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

    def preview(maxlen=40)
      preview = title.blank? ? body : title
      preview = ::MarkdownHTML.render(preview).strip_tags.strip
      preview = preview.gsub(/&#(\d+);/){ |x| x[/\d+/].to_i.chr }
      preview = preview.gsub(/&\w+;/, '')
      preview = preview.size > 45 ? "#{preview[0,45]}..." : "#{preview}"
      lines = preview.split(/\n+/, 2)
      if lines.length > 1
        "#{lines.first.sub(/\W+$/, '')}..."
      else
        lines.first
      end
    end
  end
end
