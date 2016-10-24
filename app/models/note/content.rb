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

    def outline
      doc = Nokogiri::HTML(body){ |config| config.nonet }

      outline = Outline.new
      doc.css("h1, h2, h3, h4, h5, h6, h7").each do |node|
        if !outline.parent || outline.level < node.name
          outline = outline.child(node.text, node.name)
        else
          while outline.parent && node.name <= outline.level
            outline = outline.parent
          end

          outline = outline.child(node.text, node.name)
        end

        outline.anchor = node.attribute("id").try(:value)
      end

      outline = outline.parent while outline.parent
      outline
    end

    private

    include ActionView::Helpers::TextHelper

    def fix_html
      sanitizer = Rails::Html::WhiteListSanitizer.new

      # abc notes uses class="abc"
      tags = [*"h1".."h7", "p", "ol", "ul", "li", "br", "hr",
              "blockquote", "pre", "table", "thead", "tbody", "tr", "th", "td",
              "a", "b", "strong", "i", "em", "u", "code"]
      body = sanitizer.sanitize(self.body, tags: tags, attributes: %w(class href))

      body = auto_link(body, link: :urls)

      doc = Nokogiri::HTML::DocumentFragment.parse(body)

      doc.css("table").each do |node|
        node.set_attribute("class", "table")
      end

      doc.css("h1, h2, h3, h4, h5, h6, h7").each_with_index do |node, inode|
        id = node.text.gsub(/\s+/, "-") + "-#{inode}"
        node.set_attribute("id", id.downcase)
      end

      doc.css("a").each do |node|
        node.set_attribute("target", "_blank")
      end

      self.body = doc.to_s
    end

    class Outline
      attr_accessor :parent, :title, :anchor, :level, :children

      def initialize
        @children = []
      end

      def child(title, level)
        Outline.new.tap do |child|
          child.parent = self
          child.title = title
          child.level = level
          children << child
        end
      end

      def to_s
        if parent
          ["- " * level[/\d+/].to_i + title,
           *children.map(&:to_s)].join("\n")
        else
          children.map(&:to_s).join("\n")
        end
      end

      def to_h
        if parent
          { title: title, anchor: anchor, children: children.map(&:to_h) }
        else
          children.map(&:to_h)
        end
      end
    end
  end
end
