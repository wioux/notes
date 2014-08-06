class TagsController < ApplicationController
  def autocomplete
    parts = params[:term].split(/\s*,\s*/)
    term = parts[-1]
    matches = Tag.uniq.where('tags.label like ?', "%#{term}%")
    matches = matches.where('tags.label != ?', term).pluck(:label)
    matches = matches.sort.map do |tag|
      { :label => tag, :value => parts[0..-2].push(tag).join(', ') }
    end
    render :json => matches
  end
end
