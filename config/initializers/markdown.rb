
extensions =
  [
   :no_intra_emphasis, :tables, :fenced_code_blocks,
   :autolink, :strikethrough, :space_after_headers,
   :superscript, :highlight, :footnotes, :hard_wrap
  ].map{ |x| [x, true] }

class NotesHtml < Redcarpet::Render::HTML
  def block_code(code, language)
    if language == 'abc'
      %(<div class="abc">#{CGI.escapeHTML(code)}</div>)
    else
      %(<pre><code class="#{language}">#{CGI.escapeHTML(code)}</code></pre>)
    end
  end

  def table(header, body)
    %(<table class="table table-striped"><thead>#{header}</thead><tbody>#{body}</tbody></table>)
  end
end

renderer = NotesHtml.new(filter_html: true,
                         no_styles: true,
                         with_toc_data: true,
                         link_attributes: {"data-external": true})

MarkdownHTML = Redcarpet::Markdown.new(renderer, Hash[extensions])
