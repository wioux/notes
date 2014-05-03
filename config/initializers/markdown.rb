
extensions =
  [
   :no_intra_emphasis, :tables, :fenced_code_blocks,
   :autolink, :strikethrough, :space_after_headers,
   :superscript, :highlight, :footnotes
  ].map{ |x| [x, true] }

renderer = Redcarpet::Render::HTML.new(:filter_html => true,
                                       :no_styles => true,
                                       :with_toc_data => true)                                       
MarkdownHTML = Redcarpet::Markdown.new(renderer, Hash[extensions])

