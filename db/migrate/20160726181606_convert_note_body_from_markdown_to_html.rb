class ConvertNoteBodyFromMarkdownToHtml < ActiveRecord::Migration
  def up
    Note.all.find_each do |n|
      Note.update(n.id, body: ::MarkdownHTML.render(n.body || ""))
    end
  end
end
