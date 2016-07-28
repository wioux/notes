module DocumentsHelper
  def toc(sections)
    content_tag(:ul) do
      sections.map do |section|
        title = section.fetch(:title, "")

        content_tag(:li) do
          link = content_tag(:a, title: title, href: "##{section[:anchor]}"){ title }
          link + toc(section[:children])
        end
      end.join.html_safe
    end
  end
end
