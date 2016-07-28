class Note
  module Content
    extend ActiveSupport::Concern

    included do
      before_validation :fix_html
    end

    def preview(maxlen=40)
      preview = (title.blank? ? body : title).strip_tags.strip

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

    private

    def fix_html
      sanitizer = Rails::Html::WhiteListSanitizer.new

      # i'd prefer not to permit any attributes (except href), but
      # "indent" command needs custom style and abc notes uses class="abc"
      tags = [*"h1".."h7", "p", "ol", "ul", "li", "blockquote", "pre",
              "a", "b", "strong", "i", "em", "u"]
      body = sanitizer.sanitize(self.body, tags: tags, attributes: %w(style class href))

      doc = Nokogiri::HTML::DocumentFragment.parse(body)
      doc.css("h1, h2, h3, h4, h5, h6, h7").each_with_index do |node, inode|
        id = node.text.gsub(/\s+/, "-") + "-#{inode}"
        node.set_attribute("id", id.downcase)
      end

      self.body = doc.to_s
    end
  end
end
