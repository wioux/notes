
extensions =
  [
   :no_intra_emphasis, :tables, :fenced_code_blocks,
   :autolink, :strikethrough, :space_after_headers,
   :superscript, :highlight, :footnotes
  ].map{ |x| [x, true] }

class HtmlWithABCJS < Redcarpet::Render::HTML
  def block_code(code, language)
    if language == 'abc'
      %(<div class="abc">#{CGI.escapeHTML(code)}</div>)
    else
      %(<pre><code class="#{language}">#{CGI.escapeHTML(code)}</code></pre>)
    end
  end
end

renderer = HtmlWithABCJS.new(:filter_html => true,
                             :no_styles => true,
                             :with_toc_data => true,
                             :link_attributes => {'data-external' => true})

MarkdownHTML = Redcarpet::Markdown.new(renderer, Hash[extensions])
