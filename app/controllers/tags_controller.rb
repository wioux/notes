class TagsController < ApplicationController
  def autocomplete
    parts = params[:term].split(/\s*,\s*/)
    matches = Tag.autocomplete(parts[-1]).sort
    matches = matches.map do |tag|
      { :label => tag, :value => parts[0..-2].push(tag).join(', ') }
    end
    render :json => matches
  end
end
